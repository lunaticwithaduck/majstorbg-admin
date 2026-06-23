'use client';

import { Badge, Button, Link, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import {
  useGetUserDirectorySummaryQuery,
  useListUserDirectoryQuery,
} from '@/api/store';
import { routes } from '@/config/routes';
import { csvFilename, downloadCsv, toCsv } from '@/lib/export.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import ReportFilters from '@/ui/components/composed/ReportFilters/ReportFilters';
import {
  type PeriodPreset,
  type PeriodRange,
  presetToRange,
} from '@/ui/components/composed/PeriodSelect/utils/period.utils';
import StatTile from '@/ui/components/composed/StatTile/StatTile';
import StatTileRow from '@/ui/components/composed/StatTileRow/StatTileRow';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import {
  COLUMN_LABELS,
  DEFAULT_SORT_DIR,
  DEFAULT_SORT_KEY,
  EXPORT_COPY,
  PAGE_COPY,
  PAGE_SIZE,
  QUERY_PARAM_KEYS,
  ROLE_BADGE_LABELS,
  ROLE_FILTER_LABELS,
  type RoleFilter,
  ROLE_FILTER_VALUES,
  SORT_INDICATORS,
  type SortDir,
  type SortKey,
  SORTABLE_KEYS,
  SUMMARY_LABELS,
  TABLE_COPY,
  VERIFIED_BADGE_LABELS,
  VERIFIED_FILTER_LABELS,
  type VerifiedFilter,
  VERIFIED_FILTER_VALUES,
} from './config/constants';
import styles from './UserDirectoryReport.styles';

// Row type derived from the RTK Query response so the bracketed-path file
// doesn't trip TS's type-only resolution against the bundled schemas .d.ts.
type ListResp = NonNullable<ReturnType<typeof useListUserDirectoryQuery>['data']>;
type UserDirectoryRow = ListResp['items'][number];

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

function formatDate(iso: string | null): string {
  if (!iso) return TABLE_COPY.dash;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return TABLE_COPY.dash;
  return dateFormatter.format(d);
}

function formatLastActive(iso: string | null): string {
  if (!iso) return TABLE_COPY.never;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return TABLE_COPY.never;
  return dateFormatter.format(d);
}

// StatTile.value is `string | number` (no `undefined` under
// exactOptionalPropertyTypes); render a dash placeholder while the summary loads.
function kpiValue(n: number | undefined): string | number {
  return n ?? TABLE_COPY.dash;
}

// The stopgap RTK endpoint widens `role` to `any` through the injected api, so
// narrow it explicitly before using it as a keyed lookup / badge variant.
type Role = keyof typeof ROLE_BADGE_LABELS;
function roleLabel(role: Role): string {
  return ROLE_BADGE_LABELS[role] ?? role;
}

function isRoleFilter(value: string): value is RoleFilter {
  return (ROLE_FILTER_VALUES as readonly string[]).includes(value);
}

function isVerifiedFilter(value: string): value is VerifiedFilter {
  return (VERIFIED_FILTER_VALUES as readonly string[]).includes(value);
}

function isSortKey(value: string): value is SortKey {
  return (SORTABLE_KEYS as readonly string[]).includes(value);
}

export default function UserDirectoryReport() {
  // Filter/sort/page state lives in the URL (shareable, reload-safe). The shared
  // hook resets page to 1 on any non-page change and strips empty keys.
  const query = useReportQuery(QUERY_PARAM_KEYS.page);

  const page = query.getNumber(QUERY_PARAM_KEYS.page, 1);
  const searchQuery = query.get(QUERY_PARAM_KEYS.search) ?? '';
  const roleParam = query.get(QUERY_PARAM_KEYS.role) ?? 'all';
  const roleFilter: RoleFilter = isRoleFilter(roleParam) ? roleParam : 'all';
  const verifiedParam = query.get(QUERY_PARAM_KEYS.verified) ?? 'all';
  const verifiedFilter: VerifiedFilter = isVerifiedFilter(verifiedParam)
    ? verifiedParam
    : 'all';
  const periodValue = (query.get(QUERY_PARAM_KEYS.period) ?? 'last_30d') as PeriodPreset;
  const fromParam = query.get(QUERY_PARAM_KEYS.from);
  const toParam = query.get(QUERY_PARAM_KEYS.to);
  const periodRange: PeriodRange | null =
    fromParam && toParam ? { from: fromParam, to: toParam } : presetToRange(periodValue);
  const sortByParam = query.get(QUERY_PARAM_KEYS.sortBy) ?? DEFAULT_SORT_KEY;
  const sortBy: SortKey = isSortKey(sortByParam) ? sortByParam : DEFAULT_SORT_KEY;
  const sortDir: SortDir =
    query.get(QUERY_PARAM_KEYS.sortDir) === 'asc' ? 'asc' : DEFAULT_SORT_DIR;

  const { set } = query;

  const handlePageChange = useCallback(
    (nextPage: number) => {
      set({ [QUERY_PARAM_KEYS.page]: nextPage });
    },
    [set],
  );

  const handleSearch = useCallback(
    (next: string) => {
      set({ [QUERY_PARAM_KEYS.search]: next.trim() || null });
    },
    [set],
  );

  const handleRoleChange = useCallback(
    (value: string) => {
      set({ [QUERY_PARAM_KEYS.role]: value === 'all' ? null : value });
    },
    [set],
  );

  const handleVerifiedChange = useCallback(
    (value: string) => {
      set({ [QUERY_PARAM_KEYS.verified]: value === 'all' ? null : value });
    },
    [set],
  );

  const handlePeriodChange = useCallback(
    (preset: PeriodPreset, range: PeriodRange | null) => {
      set({
        [QUERY_PARAM_KEYS.period]: preset,
        [QUERY_PARAM_KEYS.from]: range?.from ?? null,
        [QUERY_PARAM_KEYS.to]: range?.to ?? null,
      });
    },
    [set],
  );

  const handleSort = useCallback(
    (key: SortKey) => {
      const nextDir: SortDir = sortBy === key && sortDir === 'desc' ? 'asc' : 'desc';
      set({
        [QUERY_PARAM_KEYS.sortBy]: key,
        [QUERY_PARAM_KEYS.sortDir]: nextDir,
      });
    },
    [set, sortBy, sortDir],
  );

  // The joined window drives the directory query as a createdAt bound.
  const summaryArgs = useMemo(
    () => ({
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [periodRange?.from, periodRange?.to],
  );
  const { data: summary } = useGetUserDirectorySummaryQuery(summaryArgs);

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortDir,
      ...(searchQuery.trim().length > 0 ? { search: searchQuery.trim() } : {}),
      ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
      ...(verifiedFilter !== 'all' ? { verified: verifiedFilter === 'verified' } : {}),
    }),
    [page, sortBy, sortDir, searchQuery, roleFilter, verifiedFilter],
  );
  const { data, isLoading, isFetching, isError } = useListUserDirectoryQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleExport = useCallback(() => {
    const csv = toCsv<UserDirectoryRow>(items, [
      { header: COLUMN_LABELS.name, value: (r) => r.name },
      { header: COLUMN_LABELS.email, value: (r) => r.email },
      { header: COLUMN_LABELS.role, value: (r) => r.role },
      { header: COLUMN_LABELS.verified, value: (r) => (r.verified ? 'yes' : 'no') },
      { header: COLUMN_LABELS.createdAt, value: (r) => r.createdAt },
      { header: COLUMN_LABELS.lastActiveAt, value: (r) => r.lastActiveAt ?? '' },
    ]);
    downloadCsv(csvFilename(EXPORT_COPY.filenamePrefix), csv);
  }, [items]);

  const renderSortHeader = useCallback(
    (key: SortKey, label: string) => {
      const indicator =
        sortBy === key ? SORT_INDICATORS[sortDir] : SORT_INDICATORS.none;
      return (
        <Button variant="ghost" size="sm" onClick={() => handleSort(key)}>
          <span className={styles.sortHeader}>
            <Text as="span" size="sm" weight="semibold">
              {label}
            </Text>
            <Text as="span" size="sm" color="muted">
              {indicator}
            </Text>
          </span>
        </Button>
      );
    },
    [handleSort, sortBy, sortDir],
  );

  const columns = useMemo<ColumnDef<UserDirectoryRow>[]>(
    () => [
      {
        id: 'name',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.name} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.name}
          </Text>
        ),
      },
      {
        id: 'email',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.email} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.email}
          </Text>
        ),
      },
      {
        id: 'role',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.role} />
        ),
        cell: ({ row }) => {
          const role = row.original.role as Role;
          return (
            <Badge variant={role === 'worker' ? 'primary' : 'secondary'} size="sm">
              {roleLabel(role)}
            </Badge>
          );
        },
      },
      {
        id: 'verified',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.verified} />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.verified ? 'success' : 'outline'} size="sm">
            {row.original.verified ? VERIFIED_BADGE_LABELS.yes : VERIFIED_BADGE_LABELS.no}
          </Badge>
        ),
      },
      {
        id: 'createdAt',
        header: () => renderSortHeader('createdAt', COLUMN_LABELS.createdAt),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDate(row.original.createdAt)}
          </Text>
        ),
      },
      {
        id: 'lastActiveAt',
        header: () => renderSortHeader('lastActiveAt', COLUMN_LABELS.lastActiveAt),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatLastActive(row.original.lastActiveAt)}
          </Text>
        ),
      },
      {
        id: 'actions',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.actions} />
        ),
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm">
            <Link href={routes.users.detail(row.original.id)} variant="inherit">
              <Eye size={14} />
              {TABLE_COPY.view}
            </Link>
          </Button>
        ),
      },
    ],
    [renderSortHeader],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold" value={PAGE_COPY.heading} />
        <Text as="p" size="sm" color="muted" value={PAGE_COPY.sub} />
      </header>

      <div className={styles.summary}>
        <StatTileRow columns={4}>
          <StatTile label={SUMMARY_LABELS.total} value={kpiValue(summary?.total)} />
          <StatTile label={SUMMARY_LABELS.workers} value={kpiValue(summary?.workers)} />
          <StatTile label={SUMMARY_LABELS.clients} value={kpiValue(summary?.clients)} />
          <StatTile
            label={SUMMARY_LABELS.verifiedWorkers}
            value={kpiValue(summary?.verifiedWorkers)}
            tone="success"
          />
          <StatTile label={SUMMARY_LABELS.onboarded} value={kpiValue(summary?.onboarded)} />
        </StatTileRow>
      </div>

      <DataTable
        data={items}
        columns={columns}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchPlaceholder={TABLE_COPY.searchPlaceholder}
        filters={
          <ReportFilters
            period={{ value: periodValue, range: periodRange, onChange: handlePeriodChange }}
          >
            <Select
              label={ROLE_FILTER_LABELS.label}
              value={roleFilter}
              onValueChange={handleRoleChange}
              size="sm"
            >
              <SelectItem value="all">{ROLE_FILTER_LABELS.all}</SelectItem>
              <SelectItem value="worker">{ROLE_FILTER_LABELS.worker}</SelectItem>
              <SelectItem value="client">{ROLE_FILTER_LABELS.client}</SelectItem>
            </Select>
            <Select
              label={VERIFIED_FILTER_LABELS.label}
              value={verifiedFilter}
              onValueChange={handleVerifiedChange}
              size="sm"
            >
              <SelectItem value="all">{VERIFIED_FILTER_LABELS.all}</SelectItem>
              <SelectItem value="verified">{VERIFIED_FILTER_LABELS.verified}</SelectItem>
              <SelectItem value="unverified">{VERIFIED_FILTER_LABELS.unverified}</SelectItem>
            </Select>
          </ReportFilters>
        }
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={items.length === 0}>
            {EXPORT_COPY.label}
          </Button>
        }
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        loadingMessage={TABLE_COPY.loading}
        errorMessage={TABLE_COPY.error}
        emptyMessage={TABLE_COPY.empty}
      />
    </div>
  );
}
