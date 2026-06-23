'use client';

import { Badge, Box, Button, Link, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import {
  useGetProfileCompletenessSummaryQuery,
  useListIncompleteProfilesQuery,
} from '@/api/store';
import { routes } from '@/config/routes';
import { csvFilename, downloadCsv, toCsv } from '@/lib/export.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import ReportChart from '@/ui/components/composed/ReportChart/ReportChart';
import ReportFilters from '@/ui/components/composed/ReportFilters/ReportFilters';
import StatTile from '@/ui/components/composed/StatTile/StatTile';
import StatTileRow from '@/ui/components/composed/StatTileRow/StatTileRow';
import {
  type PeriodPreset,
  type PeriodRange,
  presetToRange,
} from '@/ui/components/composed/PeriodSelect/utils/period.utils';
import {
  CHART_COPY,
  COLUMN_LABELS,
  DEFAULT_PERIOD,
  DEFAULT_SORT_DIR,
  DEFAULT_SORT_KEY,
  EXPORT_COPY,
  FIELD_LABELS,
  FIELD_ORDER,
  PAGE_COPY,
  PAGE_SIZE,
  QUERY_PARAM_KEYS,
  SORT_INDICATORS,
  SORTABLE_KEYS,
  type SortDir,
  type SortKey,
  SUMMARY_LABELS,
  TABLE_COPY,
} from './config/constants';
import styles from './ProfileCompletenessReport.styles';

// Row type derived from the RTK Query response so the bracketed-path file
// doesn't trip TS's type-only resolution against the bundled schemas .d.ts.
type ListResp = NonNullable<ReturnType<typeof useListIncompleteProfilesQuery>['data']>;
type IncompleteProfileRow = ListResp['items'][number];
type ProfileField = IncompleteProfileRow['missing'][number];

// The summary's per-field tallies are keyed by the same field vocabulary; widen
// the lookup to a loose-key Record so indexing with a plain string is safe under
// `strict` (no TS7053), then fall back to 0 while the summary is loading.
type FieldCounts = Record<string, number>;

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return TABLE_COPY.dash;
  return dateFormatter.format(d);
}

// StatTile tolerates undefined but we render a stable string while loading.
function kpiValue(n: number | undefined): string | number {
  return n ?? TABLE_COPY.dash;
}

// Field label lookup keyed by a loose string so a row's `missing[]` value (typed
// only as the union) indexes without TS7053; falls back to the raw key.
const FIELD_LABEL_MAP: Record<string, string> = FIELD_LABELS;
function fieldLabel(field: string): string {
  return FIELD_LABEL_MAP[field] ?? field;
}

function isSortKey(value: string): value is SortKey {
  return (SORTABLE_KEYS as readonly string[]).includes(value);
}

export default function ProfileCompletenessReport() {
  // Filter/sort/page state lives in the URL (shareable, reload-safe). The shared
  // hook resets page to 1 on any non-page change and strips empty keys.
  const query = useReportQuery(QUERY_PARAM_KEYS.page);

  const page = query.getNumber(QUERY_PARAM_KEYS.page, 1);
  const searchQuery = query.get(QUERY_PARAM_KEYS.search) ?? '';
  const periodValue = (query.get(QUERY_PARAM_KEYS.period) ?? DEFAULT_PERIOD) as PeriodPreset;
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

  // The joined window drives both the summary and the list as a createdAt bound.
  const summaryArgs = useMemo(
    () => ({
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [periodRange?.from, periodRange?.to],
  );
  const { data: summary } = useGetProfileCompletenessSummaryQuery(summaryArgs);

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortDir,
      ...(searchQuery.trim().length > 0 ? { search: searchQuery.trim() } : {}),
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [page, sortBy, sortDir, searchQuery, periodRange?.from, periodRange?.to],
  );
  const { data, isLoading, isFetching, isError } = useListIncompleteProfilesQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  // Bar chart: one bar per tracked field, height = workers missing it. Reads the
  // summary's per-field tallies in the canonical render order.
  const chartData = useMemo(() => {
    const missing: FieldCounts = summary?.missing ?? {};
    return FIELD_ORDER.map((field) => ({
      label: fieldLabel(field),
      value: missing[field] ?? 0,
    }));
  }, [summary]);

  const handleExport = useCallback(() => {
    const csv = toCsv<IncompleteProfileRow>(items, [
      { header: COLUMN_LABELS.name, value: (r) => r.name },
      { header: COLUMN_LABELS.email, value: (r) => r.email },
      { header: COLUMN_LABELS.missingCount, value: (r) => r.missingCount },
      {
        header: COLUMN_LABELS.missing,
        value: (r) => r.missing.map((f: ProfileField) => fieldLabel(f)).join('; '),
      },
      { header: COLUMN_LABELS.createdAt, value: (r) => r.createdAt },
    ]);
    downloadCsv(csvFilename(EXPORT_COPY.filenamePrefix), csv);
  }, [items]);

  const renderSortHeader = useCallback(
    (key: SortKey, label: string) => {
      const indicator = sortBy === key ? SORT_INDICATORS[sortDir] : SORT_INDICATORS.none;
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

  const columns = useMemo<ColumnDef<IncompleteProfileRow>[]>(
    () => [
      {
        id: 'name',
        header: () => renderSortHeader('name', COLUMN_LABELS.name),
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
        id: 'missing',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.missing} />
        ),
        cell: ({ row }) => (
          <span className={styles.chips}>
            {row.original.missing.map((field: ProfileField) => (
              <Badge key={field} variant="outline" size="sm">
                {fieldLabel(field)}
              </Badge>
            ))}
          </span>
        ),
      },
      {
        id: 'missingCount',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.missingCount} />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.missingCount >= 3 ? 'destructive' : 'secondary'} size="sm">
            {row.original.missingCount}
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
          <StatTile label={SUMMARY_LABELS.totalWorkers} value={kpiValue(summary?.totalWorkers)} />
          <StatTile
            label={SUMMARY_LABELS.incompleteWorkers}
            value={kpiValue(summary?.incompleteWorkers)}
            tone="warning"
          />
          <StatTile
            label={SUMMARY_LABELS.completeWorkers}
            value={kpiValue(summary?.completeWorkers)}
            tone="success"
          />
          <StatTile
            label={SUMMARY_LABELS.completionRate}
            value={summary ? `${summary.completionRate}%` : TABLE_COPY.dash}
          />
        </StatTileRow>
      </div>

      <Box padding="md" radius="lg">
        <div className={styles.chart}>
          <Text as="h2" size="lg" weight="semibold" value={CHART_COPY.title} />
          <ReportChart kind="bar" data={chartData} ariaLabel={CHART_COPY.ariaLabel} />
        </div>
      </Box>

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
          />
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
