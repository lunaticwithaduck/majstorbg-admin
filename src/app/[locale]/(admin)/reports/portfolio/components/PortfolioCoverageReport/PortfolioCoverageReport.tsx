'use client';

import { Badge, Button, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import {
  useGetPortfolioSummaryQuery,
  useListPortfolioCoverageQuery,
} from '@/api/store';
import { csvFilename, downloadCsv, toCsv } from '@/lib/export.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import ReportChart from '@/ui/components/composed/ReportChart/ReportChart';
import ReportFilters from '@/ui/components/composed/ReportFilters/ReportFilters';
import {
  type PeriodPreset,
  type PeriodRange,
  presetToRange,
} from '@/ui/components/composed/PeriodSelect/utils/period.utils';
import StatTile from '@/ui/components/composed/StatTile/StatTile';
import StatTileRow from '@/ui/components/composed/StatTileRow/StatTileRow';
import {
  CATEGORY_LABELS,
  CHART_COPY,
  COLUMN_LABELS,
  DEFAULT_PERIOD_PRESET,
  DEFAULT_SORT_DIR,
  DEFAULT_SORT_KEY,
  EXPORT_COPY,
  PAGE_COPY,
  PAGE_SIZE,
  QUERY_PARAM_KEYS,
  SORT_INDICATORS,
  type SortDir,
  type SortKey,
  SORTABLE_KEYS,
  SUMMARY_LABELS,
  TABLE_COPY,
  VERIFIED_BADGE_LABELS,
} from './config/constants';
import styles from './PortfolioCoverageReport.styles';

// Row type derived from the RTK Query response so the bracketed-path file
// doesn't trip TS's type-only resolution against the bundled schemas .d.ts.
type ListResp = NonNullable<ReturnType<typeof useListPortfolioCoverageQuery>['data']>;
type CoverageRow = ListResp['items'][number];

type SummaryResp = NonNullable<ReturnType<typeof useGetPortfolioSummaryQuery>['data']>;
type CategoryBreakdownItem = SummaryResp['byCategory'][number];

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

// StatTile.value tolerates undefined but prefers a concrete value; render a
// dash placeholder while the summary loads.
function kpiValue(n: number | undefined): string | number {
  return n ?? TABLE_COPY.dash;
}

function formatPercent(fraction: number | undefined): string {
  if (fraction === undefined || Number.isNaN(fraction)) return TABLE_COPY.dash;
  return `${Math.round(fraction * 100)}%`;
}

function formatAvg(n: number | undefined): string | number {
  if (n === undefined || Number.isNaN(n)) return TABLE_COPY.dash;
  return n.toFixed(1);
}

// Loose lookup — category arrives as a widened string through the stopgap
// endpoint; index defensively and fall back to the raw value.
function categoryLabel(category: string): string {
  return CATEGORY_LABELS[category] ?? category;
}

function isSortKey(value: string): value is SortKey {
  return (SORTABLE_KEYS as readonly string[]).includes(value);
}

export default function PortfolioCoverageReport() {
  // Filter/sort/page state lives in the URL (shareable, reload-safe). The
  // shared hook resets page to 1 on any non-page change and strips empty keys.
  const query = useReportQuery(QUERY_PARAM_KEYS.page);

  const page = query.getNumber(QUERY_PARAM_KEYS.page, 1);
  const searchQuery = query.get(QUERY_PARAM_KEYS.search) ?? '';
  const periodValue = (query.get(QUERY_PARAM_KEYS.period) ?? DEFAULT_PERIOD_PRESET) as PeriodPreset;
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

  // The period window drives the summary as a completedAt bound. The list is
  // a "current state" view, so it does NOT take the window.
  const summaryArgs = useMemo(
    () => ({
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [periodRange?.from, periodRange?.to],
  );
  const { data: summary } = useGetPortfolioSummaryQuery(summaryArgs);

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortDir,
      ...(searchQuery.trim().length > 0 ? { search: searchQuery.trim() } : {}),
    }),
    [page, sortBy, sortDir, searchQuery],
  );
  const { data, isLoading, isFetching, isError } = useListPortfolioCoverageQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const categoryBars = useMemo(
    () =>
      (summary?.byCategory ?? []).map((c: CategoryBreakdownItem) => ({
        label: categoryLabel(c.category),
        value: c.projects,
      })),
    [summary?.byCategory],
  );

  const handleExport = useCallback(() => {
    const csv = toCsv<CoverageRow>(items, [
      { header: COLUMN_LABELS.name, value: (r) => r.name },
      { header: COLUMN_LABELS.verified, value: (r) => (r.verified ? 'yes' : 'no') },
      { header: COLUMN_LABELS.projects, value: (r) => r.projects },
      { header: COLUMN_LABELS.photos, value: (r) => r.photos },
      { header: COLUMN_LABELS.featured, value: (r) => r.featured },
      { header: COLUMN_LABELS.lastCompletedAt, value: (r) => r.lastCompletedAt ?? '' },
      { header: COLUMN_LABELS.createdAt, value: (r) => r.createdAt },
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

  const columns = useMemo<ColumnDef<CoverageRow>[]>(
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
        id: 'projects',
        header: () => renderSortHeader('projects', COLUMN_LABELS.projects),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.projects}
          </Text>
        ),
      },
      {
        id: 'photos',
        header: () => renderSortHeader('photos', COLUMN_LABELS.photos),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.photos}
          </Text>
        ),
      },
      {
        id: 'featured',
        header: () => renderSortHeader('featured', COLUMN_LABELS.featured),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.featured}
          </Text>
        ),
      },
      {
        id: 'lastCompletedAt',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.lastCompletedAt} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDate(row.original.lastCompletedAt)}
          </Text>
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
            label={SUMMARY_LABELS.workersWithPortfolio}
            value={kpiValue(summary?.workersWithPortfolio)}
          />
          <StatTile
            label={SUMMARY_LABELS.coverageRate}
            value={formatPercent(summary?.coverageRate)}
            tone="success"
          />
          <StatTile
            label={SUMMARY_LABELS.avgProjects}
            value={formatAvg(summary?.avgProjectsPerWorker)}
          />
          <StatTile
            label={SUMMARY_LABELS.featured}
            value={kpiValue(summary?.featuredProjects)}
          />
        </StatTileRow>
      </div>

      <div className={styles.card}>
        <Text as="h2" size="lg" weight="semibold" value={CHART_COPY.title} />
        <ReportChart kind="bar" data={categoryBars} ariaLabel={CHART_COPY.aria} />
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
