'use client';

import { Badge, Box, Button, Link, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Download, Eye, MessageSquare, Star } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import {
  useGetRatingsSummaryQuery,
  useListLowRatedWorkersQuery,
} from '@/api/store';
import { routes } from '@/config/routes';
import { type CsvColumn, csvFilename, downloadCsv, toCsv } from '@/lib/export.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import {
  type PeriodPreset,
  type PeriodRange,
  presetToRange,
} from '@/ui/components/composed/PeriodSelect/utils/period.utils';
import ReportChart from '@/ui/components/composed/ReportChart/ReportChart';
import ReportFilters from '@/ui/components/composed/ReportFilters/ReportFilters';
import SortHeader from '@/ui/components/composed/SortHeader/SortHeader';
import StatTile from '@/ui/components/composed/StatTile/StatTile';
import StatTileRow from '@/ui/components/composed/StatTileRow/StatTileRow';
import {
  CHART_LABELS,
  COLUMN_LABELS,
  DEFAULT_MIN_REVIEWS,
  DEFAULT_PERIOD,
  DEFAULT_SORT_DIR,
  DEFAULT_SORT_KEY,
  EXPORT_COPY,
  KPI_LABELS,
  MIN_REVIEWS_FILTER_LABEL,
  MIN_REVIEWS_LABELS,
  MIN_REVIEWS_VALUES,
  type MinReviewsFilter,
  PAGE_COPY,
  PAGE_SIZE,
  QUERY_PARAM_KEYS,
  SORTABLE_KEYS,
  type SortDir,
  type SortKey,
  TABLE_COPY,
} from './config/constants';
import styles from './RatingsReport.styles';

// Row + summary types derived from the RTK Query responses so this
// bracketed-path file doesn't trip TS's type-only resolution against the
// bundled schemas .d.ts.
type ListResp = NonNullable<ReturnType<typeof useListLowRatedWorkersQuery>['data']>;
type LowRatedWorkerRow = ListResp['items'][number];
type Summary = NonNullable<ReturnType<typeof useGetRatingsSummaryQuery>['data']>;
type StarBucket = Summary['starDistribution'][number];

const ratingFormatter = new Intl.NumberFormat(undefined, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const percentFormatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const numberFormatter = new Intl.NumberFormat();

// StatTile.value tolerates undefined, but we still pass a formatted string (or
// a dash placeholder) so the tile never flashes a raw/empty number.
function ratingValue(n: number | undefined): string {
  return n === undefined ? TABLE_COPY.dash : ratingFormatter.format(n);
}

function rateValue(n: number | undefined): string {
  return n === undefined ? TABLE_COPY.dash : percentFormatter.format(n);
}

function countValue(n: number | undefined): string {
  return n === undefined ? TABLE_COPY.dash : numberFormatter.format(n);
}

// Loose-key lookup so a raw `minReviews` URL value indexes the labels map
// without TS7053; falls back to the raw value.
const MIN_REVIEWS_LABEL_MAP: Record<string, string> = MIN_REVIEWS_LABELS;
function minReviewsLabel(value: string): string {
  return MIN_REVIEWS_LABEL_MAP[value] ?? value;
}

function isMinReviewsFilter(value: string): value is MinReviewsFilter {
  return (MIN_REVIEWS_VALUES as readonly string[]).includes(value);
}

function isSortKey(value: string): value is SortKey {
  return (SORTABLE_KEYS as readonly string[]).includes(value);
}

export default function RatingsReport() {
  // Filter/sort/page state lives in the URL (shareable, reload-safe). The
  // shared hook resets page to 1 on any non-page change and strips empty keys.
  const query = useReportQuery(QUERY_PARAM_KEYS.page);

  const page = query.getNumber(QUERY_PARAM_KEYS.page, 1);
  const searchQuery = query.get(QUERY_PARAM_KEYS.search) ?? '';
  const minReviewsParam = query.get(QUERY_PARAM_KEYS.minReviews) ?? DEFAULT_MIN_REVIEWS;
  const minReviewsFilter: MinReviewsFilter = isMinReviewsFilter(minReviewsParam)
    ? minReviewsParam
    : DEFAULT_MIN_REVIEWS;
  const periodValue = (query.get(QUERY_PARAM_KEYS.period) ?? DEFAULT_PERIOD) as PeriodPreset;
  const fromParam = query.get(QUERY_PARAM_KEYS.from);
  const toParam = query.get(QUERY_PARAM_KEYS.to);
  const periodRange: PeriodRange | null =
    fromParam && toParam ? { from: fromParam, to: toParam } : presetToRange(periodValue);
  const sortByParam = query.get(QUERY_PARAM_KEYS.sortBy) ?? DEFAULT_SORT_KEY;
  const sortBy: SortKey = isSortKey(sortByParam) ? sortByParam : DEFAULT_SORT_KEY;
  const sortDir: SortDir =
    query.get(QUERY_PARAM_KEYS.sortDir) === 'desc' ? 'desc' : DEFAULT_SORT_DIR;

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

  const handleMinReviewsChange = useCallback(
    (value: string) => {
      set({ [QUERY_PARAM_KEYS.minReviews]: value === DEFAULT_MIN_REVIEWS ? null : value });
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
      const nextDir: SortDir = sortBy === key && sortDir === 'asc' ? 'desc' : 'asc';
      set({
        [QUERY_PARAM_KEYS.sortBy]: key,
        [QUERY_PARAM_KEYS.sortDir]: nextDir,
      });
    },
    [set, sortBy, sortDir],
  );

  // The selected window drives the rating aggregates as a Review.createdAt bound.
  const summaryArgs = useMemo(
    () => ({
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [periodRange?.from, periodRange?.to],
  );
  const { data: summary } = useGetRatingsSummaryQuery(summaryArgs);

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortDir,
      minReviews: Number.parseInt(minReviewsFilter, 10),
      ...(searchQuery.trim().length > 0 ? { search: searchQuery.trim() } : {}),
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [page, sortBy, sortDir, minReviewsFilter, searchQuery, periodRange?.from, periodRange?.to],
  );
  const { data, isLoading, isFetching, isError } = useListLowRatedWorkersQuery(queryArgs);

  const items = useMemo<LowRatedWorkerRow[]>(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  // Donut of the 1..5 star histogram over the windowed worker-as-subject set.
  const starChartData = useMemo(
    () =>
      (summary?.starDistribution ?? []).map((bucket: StarBucket) => ({
        label: CHART_LABELS.starSlice.replace('{stars}', String(bucket.stars)),
        value: bucket.count,
      })),
    [summary?.starDistribution],
  );

  const handleExport = useCallback(() => {
    const csvColumns: CsvColumn<LowRatedWorkerRow>[] = [
      { header: COLUMN_LABELS.worker, value: (r) => r.name },
      { header: COLUMN_LABELS.avgRating, value: (r) => r.avgRating },
      { header: COLUMN_LABELS.reviewCount, value: (r) => r.reviewCount },
      { header: COLUMN_LABELS.disputeCount, value: (r) => r.disputeCount },
    ];
    downloadCsv(csvFilename(EXPORT_COPY.filenamePrefix), toCsv(items, csvColumns));
  }, [items]);

  const columns = useMemo<ColumnDef<LowRatedWorkerRow>[]>(
    () => [
      {
        id: 'worker',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.worker} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.name}
          </Text>
        ),
      },
      {
        id: 'avgRating',
        header: () => (
          <SortHeader
            label={COLUMN_LABELS.avgRating}
            active={sortBy === 'avgRating'}
            dir={sortDir}
            onToggle={() => handleSort('avgRating')}
          />
        ),
        cell: ({ row }) => (
          <span className={styles.badgeCell}>
            <Badge variant="destructive" size="sm">
              {ratingFormatter.format(row.original.avgRating)}
            </Badge>
          </span>
        ),
      },
      {
        id: 'reviewCount',
        header: () => (
          <SortHeader
            label={COLUMN_LABELS.reviewCount}
            active={sortBy === 'reviewCount'}
            dir={sortDir}
            onToggle={() => handleSort('reviewCount')}
          />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {numberFormatter.format(row.original.reviewCount)}
          </Text>
        ),
      },
      {
        id: 'disputeCount',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.disputeCount} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {numberFormatter.format(row.original.disputeCount)}
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
            <Link href={routes.users.detail(row.original.workerId)} variant="inherit">
              <Eye size={14} />
              {TABLE_COPY.view}
            </Link>
          </Button>
        ),
      },
    ],
    [handleSort, sortBy, sortDir],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold" value={PAGE_COPY.heading} />
        <Text as="p" size="sm" color="muted" value={PAGE_COPY.sub} />
      </header>

      <div className={styles.summary}>
        <StatTileRow columns={4}>
          <StatTile
            label={KPI_LABELS.avgRating}
            value={ratingValue(summary?.avgWorkerRating)}
            icon={Star}
            tone="success"
          />
          <StatTile
            label={KPI_LABELS.reviewCount}
            value={countValue(summary?.reviewCount)}
            icon={MessageSquare}
          />
          <StatTile
            label={KPI_LABELS.disputeRate}
            value={rateValue(summary?.disputeRate)}
            icon={AlertTriangle}
            tone="warning"
          />
          <StatTile
            label={KPI_LABELS.completedJobs}
            value={countValue(summary?.completedJobs)}
          />
        </StatTileRow>
      </div>

      <Box padding="md" radius="lg">
        <div className={styles.chart}>
          <Text as="h2" size="lg" weight="semibold" value={CHART_LABELS.starDistribution} />
          <ReportChart kind="donut" data={starChartData} ariaLabel={CHART_LABELS.ariaLabel} />
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
          >
            <Select
              label={MIN_REVIEWS_FILTER_LABEL}
              value={minReviewsFilter}
              onValueChange={handleMinReviewsChange}
              size="sm"
            >
              {MIN_REVIEWS_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {minReviewsLabel(value)}
                </SelectItem>
              ))}
            </Select>
          </ReportFilters>
        }
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={items.length === 0}>
            <Download size={14} />
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
