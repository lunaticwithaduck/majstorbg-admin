'use client';

import { Badge, Button, Link, Text, TextPrice } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye, Star } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useListWorkerLeaderboardQuery } from '@/api/store';
import { routes } from '@/config/routes';
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
  DEFAULT_PERIOD,
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
} from '../../config/constants';
import styles from './WorkerLeaderboardReport.styles';

// Row type derived from the RTK Query response so the bracketed-path file
// doesn't trip TS's type-only resolution against the bundled schemas .d.ts.
type ListResp = NonNullable<
  ReturnType<typeof useListWorkerLeaderboardQuery>['data']
>;
type LeaderboardRow = ListResp['items'][number];

const numberFormatter = new Intl.NumberFormat();

function formatRating(rating: number | null): string {
  if (rating === null) return TABLE_COPY.dash;
  return rating.toFixed(2);
}

function isSortKey(value: string): value is SortKey {
  return (SORTABLE_KEYS as readonly string[]).includes(value);
}

export default function WorkerLeaderboardReport() {
  // Filter/sort/page state lives in the URL (shareable, reload-safe). The shared
  // hook resets page to 1 on any non-page change and strips empty keys.
  const query = useReportQuery(QUERY_PARAM_KEYS.page);

  const page = query.getNumber(QUERY_PARAM_KEYS.page, 1);
  const searchQuery = query.get(QUERY_PARAM_KEYS.search) ?? '';
  const periodValue = (query.get(QUERY_PARAM_KEYS.period) ??
    DEFAULT_PERIOD) as PeriodPreset;
  const fromParam = query.get(QUERY_PARAM_KEYS.from);
  const toParam = query.get(QUERY_PARAM_KEYS.to);
  const periodRange: PeriodRange | null =
    fromParam && toParam
      ? { from: fromParam, to: toParam }
      : presetToRange(periodValue);
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

  // The accepted-bid window drives the leaderboard query as a Bid.acceptedAt
  // bound (scopes acceptedBids / acceptedValue / completedJobs).
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
  const { data, isLoading, isFetching, isError } =
    useListWorkerLeaderboardQuery(queryArgs);

  const items = useMemo<LeaderboardRow[]>(() => data?.items ?? [], [data]);
  const total = data?.total ?? 0;

  // KPI tiles aggregate the current page of rows (the visible slice). The
  // average-rating tile averages only the rated workers on the page.
  const summary = useMemo(() => {
    const completedJobs = items.reduce((sum, r) => sum + r.completedJobs, 0);
    const acceptedBids = items.reduce((sum, r) => sum + r.acceptedBids, 0);
    const rated = items.filter((r) => r.avgRating !== null);
    const avgRating =
      rated.length === 0
        ? null
        : rated.reduce((sum, r) => sum + (r.avgRating ?? 0), 0) / rated.length;
    return { completedJobs, acceptedBids, avgRating };
  }, [items]);

  // Bar chart of the visible top-N rows by completed jobs (the table's own
  // ordering when sorted by completedJobs desc; otherwise the page slice).
  const chartData = useMemo(
    () =>
      items
        .slice(0, CHART_TOP_N)
        .map((r) => ({ label: r.name, value: r.completedJobs })),
    [items],
  );

  const handleExport = useCallback(() => {
    const csv = toCsv<LeaderboardRow>(items, [
      { header: COLUMN_LABELS.name, value: (r) => r.name },
      { header: COLUMN_LABELS.completedJobs, value: (r) => r.completedJobs },
      { header: COLUMN_LABELS.avgRating, value: (r) => r.avgRating ?? '' },
      { header: COLUMN_LABELS.acceptedBids, value: (r) => r.acceptedBids },
      { header: COLUMN_LABELS.acceptedValue, value: (r) => r.acceptedValue },
      { header: 'currency', value: (r) => r.currency },
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

  const columns = useMemo<ColumnDef<LeaderboardRow>[]>(
    () => [
      {
        id: 'rank',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.rank} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {(page - 1) * PAGE_SIZE + row.index + 1}
          </Text>
        ),
      },
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
        id: 'completedJobs',
        header: () => renderSortHeader('completedJobs', COLUMN_LABELS.completedJobs),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {numberFormatter.format(row.original.completedJobs)}
          </Text>
        ),
      },
      {
        id: 'avgRating',
        header: () => renderSortHeader('avgRating', COLUMN_LABELS.avgRating),
        cell: ({ row }) => {
          const { avgRating, reviewCount } = row.original;
          if (avgRating === null) {
            return <Text as="span" size="sm" color="muted" value={TABLE_COPY.dash} />;
          }
          return (
            <span className={styles.ratingCell}>
              <Star size={14} />
              <Text as="span" size="sm" weight="medium">
                {formatRating(avgRating)}
              </Text>
              <Badge variant="outline" size="sm">
                {`${numberFormatter.format(reviewCount)} ${TABLE_COPY.reviewsSuffix}`}
              </Badge>
            </span>
          );
        },
      },
      {
        id: 'acceptedBids',
        header: () => renderSortHeader('acceptedBids', COLUMN_LABELS.acceptedBids),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {numberFormatter.format(row.original.acceptedBids)}
          </Text>
        ),
      },
      {
        id: 'acceptedValue',
        header: () => renderSortHeader('acceptedValue', COLUMN_LABELS.acceptedValue),
        cell: ({ row }) => (
          <TextPrice
            as="span"
            size="sm"
            weight="medium"
            amount={row.original.acceptedValue}
            currency={row.original.currency}
          />
        ),
      },
      {
        id: 'actions',
        header: () => (
          <Text
            as="span"
            size="sm"
            weight="semibold"
            value={COLUMN_LABELS.actions}
          />
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
    [renderSortHeader, page],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold" value={PAGE_COPY.heading} />
        <Text as="p" size="sm" color="muted" value={PAGE_COPY.sub} />
      </header>

      <div className={styles.summary}>
        <StatTileRow columns={4}>
          <StatTile label={SUMMARY_LABELS.workers} value={numberFormatter.format(total)} />
          <StatTile
            label={SUMMARY_LABELS.completedJobs}
            value={numberFormatter.format(summary.completedJobs)}
          />
          <StatTile
            label={SUMMARY_LABELS.acceptedBids}
            value={numberFormatter.format(summary.acceptedBids)}
          />
          <StatTile
            label={SUMMARY_LABELS.avgRating}
            value={summary.avgRating === null ? TABLE_COPY.dash : summary.avgRating.toFixed(2)}
            tone="success"
          />
        </StatTileRow>
      </div>

      <div className={styles.chart}>
        <Text as="h2" size="lg" weight="semibold" value={CHART_COPY.title} />
        <ReportChart kind="bar" data={chartData} ariaLabel={CHART_COPY.ariaLabel} />
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
