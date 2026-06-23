'use client';

import { Button, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { useListCategoryPerfQuery } from '@/api/store';
import { csvFilename, downloadCsv, toCsv } from '@/lib/export.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import {
  type PeriodPreset,
  type PeriodRange,
  presetToRange,
} from '@/ui/components/composed/PeriodSelect/utils/period.utils';
import ReportChart from '@/ui/components/composed/ReportChart/ReportChart';
import ReportFilters from '@/ui/components/composed/ReportFilters/ReportFilters';
import StatTile from '@/ui/components/composed/StatTile/StatTile';
import StatTileRow from '@/ui/components/composed/StatTileRow/StatTileRow';
import {
  CHART_COPY,
  CHART_TOP_N,
  COLUMN_LABELS,
  CSV_HEADERS,
  DEFAULT_PERIOD_PRESET,
  DEFAULT_SORT_DIR,
  DEFAULT_SORT_KEY,
  EXPORT_COPY,
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
import styles from './CategoryPerformanceReport.styles';

// Row type derived from the RTK Query response so the bracketed-path file
// doesn't trip TS's type-only resolution against the bundled schemas .d.ts.
type ListResp = NonNullable<ReturnType<typeof useListCategoryPerfQuery>['data']>;
type CategoryPerfRow = ListResp['items'][number];

// Largest page the BE accepts; the category taxonomy is tiny so one page holds
// the whole set, letting the KPI tiles + chart read the full dataset
// independent of the table's paging/sort.
const KPI_PAGE_SIZE = 100;

function isSortKey(value: string): value is SortKey {
  return (SORTABLE_KEYS as readonly string[]).includes(value);
}

function formatPercent(fraction: number | null | undefined): string {
  if (fraction === null || fraction === undefined || Number.isNaN(fraction)) {
    return TABLE_COPY.dash;
  }
  return `${Math.round(fraction * 100)}%`;
}

function formatMoney(amount: number | null, currency: string | null): string {
  if (amount === null) return TABLE_COPY.dash;
  return currency ? `${amount.toFixed(2)} ${currency}` : amount.toFixed(2);
}

function formatRating(stars: number | null): string {
  return stars === null ? TABLE_COPY.dash : stars.toFixed(2);
}

// StatTile.value tolerates undefined now, but pass a formatted string / number
// to keep the loading state explicit.
function kpiValue(n: number | undefined): string | number {
  return n ?? TABLE_COPY.dash;
}

export default function CategoryPerformanceReport() {
  // Filter/sort/page state lives in the URL (shareable, reload-safe). The shared
  // hook resets page to 1 on any non-page change and strips empty keys.
  const query = useReportQuery(QUERY_PARAM_KEYS.page);

  const page = query.getNumber(QUERY_PARAM_KEYS.page, 1);
  const searchQuery = query.get(QUERY_PARAM_KEYS.search) ?? '';
  const periodValue = (query.get(QUERY_PARAM_KEYS.period) ??
    DEFAULT_PERIOD_PRESET) as PeriodPreset;
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

  // The joined window bounds Job.createdAt for every query below.
  const windowArgs = useMemo(
    () => ({
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [periodRange?.from, periodRange?.to],
  );

  // The table query: server-side paged + sorted + searched.
  const tableArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortDir,
      ...(searchQuery.trim().length > 0 ? { search: searchQuery.trim() } : {}),
      ...windowArgs,
    }),
    [page, sortBy, sortDir, searchQuery, windowArgs],
  );
  const { data, isLoading, isFetching, isError } = useListCategoryPerfQuery(tableArgs);

  // The KPI + chart query: full set for the window, sorted by demand. Decoupled
  // from the table's paging/sort/search so the headline numbers and the bar
  // chart stay stable while the user drills the table.
  const overviewArgs = useMemo(
    () => ({
      page: 1,
      pageSize: KPI_PAGE_SIZE,
      sortBy: 'jobsPosted' as SortKey,
      sortDir: 'desc' as SortDir,
      ...windowArgs,
    }),
    [windowArgs],
  );
  const { data: overview } = useListCategoryPerfQuery(overviewArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const overviewItems = overview?.items ?? [];
  const kpis = useMemo(() => {
    if (overviewItems.length === 0) {
      return { categories: 0, jobsPosted: 0, avgCompletion: 0, topCategory: TABLE_COPY.dash };
    }
    const jobsPosted = overviewItems.reduce((sum, r) => sum + r.jobsPosted, 0);
    const avgCompletion =
      overviewItems.reduce((sum, r) => sum + r.completionRate, 0) / overviewItems.length;
    // overviewItems is jobsPosted-desc, so the first row leads demand.
    const top = overviewItems[0];
    return {
      categories: overview?.total ?? overviewItems.length,
      jobsPosted,
      avgCompletion,
      topCategory: top ? top.category : TABLE_COPY.dash,
    };
  }, [overviewItems, overview?.total]);

  const chartBars = useMemo(
    () =>
      overviewItems
        .slice(0, CHART_TOP_N)
        .map((r) => ({ label: r.category, value: r.jobsPosted })),
    [overviewItems],
  );

  const handleExport = useCallback(() => {
    const csv = toCsv<CategoryPerfRow>(items, [
      { header: CSV_HEADERS.category, value: (r) => r.category },
      { header: CSV_HEADERS.jobsPosted, value: (r) => r.jobsPosted },
      { header: CSV_HEADERS.completed, value: (r) => r.completed },
      { header: CSV_HEADERS.completionRate, value: (r) => r.completionRate },
      { header: CSV_HEADERS.avgAcceptedBid, value: (r) => r.avgAcceptedBid ?? '' },
      {
        header: CSV_HEADERS.avgAcceptedBidCurrency,
        value: (r) => r.avgAcceptedBidCurrency ?? '',
      },
      { header: CSV_HEADERS.avgRating, value: (r) => r.avgRating ?? '' },
      { header: CSV_HEADERS.workerCoverage, value: (r) => r.workerCoverage },
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

  const columns = useMemo<ColumnDef<CategoryPerfRow>[]>(
    () => [
      {
        id: 'category',
        header: () => renderSortHeader('category', COLUMN_LABELS.category),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.category}
          </Text>
        ),
      },
      {
        id: 'jobsPosted',
        header: () => renderSortHeader('jobsPosted', COLUMN_LABELS.jobsPosted),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {row.original.jobsPosted}
          </Text>
        ),
      },
      {
        id: 'completionRate',
        header: () => renderSortHeader('completionRate', COLUMN_LABELS.completionRate),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {formatPercent(row.original.completionRate)}
          </Text>
        ),
      },
      {
        id: 'avgAcceptedBid',
        header: () => renderSortHeader('avgAcceptedBid', COLUMN_LABELS.avgAcceptedBid),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {formatMoney(row.original.avgAcceptedBid, row.original.avgAcceptedBidCurrency)}
          </Text>
        ),
      },
      {
        id: 'avgRating',
        header: () => renderSortHeader('avgRating', COLUMN_LABELS.avgRating),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {formatRating(row.original.avgRating)}
          </Text>
        ),
      },
      {
        id: 'workerCoverage',
        header: () => renderSortHeader('workerCoverage', COLUMN_LABELS.workerCoverage),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {row.original.workerCoverage}
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
          <StatTile label={SUMMARY_LABELS.categories} value={kpiValue(kpis.categories)} />
          <StatTile label={SUMMARY_LABELS.jobsPosted} value={kpiValue(kpis.jobsPosted)} />
          <StatTile label={SUMMARY_LABELS.avgCompletion} value={formatPercent(kpis.avgCompletion)} />
          <StatTile label={SUMMARY_LABELS.topCategory} value={kpis.topCategory} />
        </StatTileRow>
      </div>

      <div className={styles.card}>
        <Text as="h2" size="lg" weight="semibold" value={CHART_COPY.title} />
        <ReportChart kind="bar" data={chartBars} ariaLabel={CHART_COPY.aria} />
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
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={items.length === 0}
          >
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
