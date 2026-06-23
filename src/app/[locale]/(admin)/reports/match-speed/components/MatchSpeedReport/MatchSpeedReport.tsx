'use client';

import { Button, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { useGetMatchSpeedQuery } from '@/api/store';
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
  CHART_COPY,
  CHART_HEIGHT,
  COLUMN_LABELS,
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
import styles from './MatchSpeedReport.styles';

// Row / point types derived from the RTK Query response so the bracketed-path
// file doesn't trip TS's type-only resolution against the bundled schemas .d.ts.
type Resp = NonNullable<ReturnType<typeof useGetMatchSpeedQuery>['data']>;
type MatchSpeedRow = Resp['items'][number];
type SeriesPoint = Resp['series'][number];

const MINUTES_PER_HOUR = 60;
const MINUTES_PER_DAY = 1440;

// Render a minute duration as a compact human string. < 1h shows minutes, < 1d
// shows hours, else days+hours. null (no sample) renders a dash.
function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return TABLE_COPY.dash;
  if (minutes < MINUTES_PER_HOUR) return `${Math.round(minutes)}m`;
  if (minutes < MINUTES_PER_DAY) {
    const hours = minutes / MINUTES_PER_HOUR;
    return `${Math.round(hours * 10) / 10}h`;
  }
  const days = Math.floor(minutes / MINUTES_PER_DAY);
  const remHours = Math.round((minutes - days * MINUTES_PER_DAY) / MINUTES_PER_HOUR);
  return remHours > 0 ? `${days}d ${remHours}h` : `${days}d`;
}

// Chart axis is in HOURS for readability; medians arrive in minutes.
function toHours(minutes: number | null): number {
  return minutes === null ? 0 : Math.round((minutes / MINUTES_PER_HOUR) * 10) / 10;
}

function isSortKey(value: string): value is SortKey {
  return (SORTABLE_KEYS as readonly string[]).includes(value);
}

export default function MatchSpeedReport() {
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
      // Numeric/jobs columns are most useful highest-first; category reads
      // best A->Z. Toggle direction when re-clicking the active column.
      const initialDir: SortDir = key === 'category' ? 'asc' : 'desc';
      const nextDir: SortDir =
        sortBy === key ? (sortDir === 'asc' ? 'desc' : 'asc') : initialDir;
      set({
        [QUERY_PARAM_KEYS.sortBy]: key,
        [QUERY_PARAM_KEYS.sortDir]: nextDir,
      });
    },
    [set, sortBy, sortDir],
  );

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
  const { data, isLoading, isFetching, isError } = useGetMatchSpeedQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const series = data?.series ?? [];
  const kpis = data?.kpis;

  // Two overlaid line series (hours) so the chart contrasts first-bid vs award
  // speed week over week.
  const chartSeries = useMemo(
    () => [
      {
        name: CHART_COPY.seriesFirstBid,
        points: series.map((p: SeriesPoint) => ({
          x: p.bucket,
          y: toHours(p.firstBidMedian),
        })),
      },
      {
        name: CHART_COPY.seriesAward,
        points: series.map((p: SeriesPoint) => ({
          x: p.bucket,
          y: toHours(p.awardMedian),
        })),
      },
    ],
    [series],
  );

  const handleExport = useCallback(() => {
    const csv = toCsv<MatchSpeedRow>(items, [
      { header: COLUMN_LABELS.category, value: (r) => r.category },
      { header: COLUMN_LABELS.jobs, value: (r) => r.jobs },
      { header: COLUMN_LABELS.firstBidMedian, value: (r) => r.firstBid.median ?? '' },
      { header: COLUMN_LABELS.firstBidAvg, value: (r) => r.firstBid.avg ?? '' },
      { header: COLUMN_LABELS.firstBidP90, value: (r) => r.firstBid.p90 ?? '' },
      { header: COLUMN_LABELS.awardMedian, value: (r) => r.award.median ?? '' },
      { header: COLUMN_LABELS.awardAvg, value: (r) => r.award.avg ?? '' },
      { header: COLUMN_LABELS.awardP90, value: (r) => r.award.p90 ?? '' },
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

  const columns = useMemo<ColumnDef<MatchSpeedRow>[]>(
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
        id: 'jobs',
        header: () => renderSortHeader('jobs', COLUMN_LABELS.jobs),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="semibold">
            {row.original.jobs}
          </Text>
        ),
      },
      {
        id: 'firstBidMedian',
        header: () => renderSortHeader('firstBidMedian', COLUMN_LABELS.firstBidMedian),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="semibold">
            {formatDuration(row.original.firstBid.median)}
          </Text>
        ),
      },
      {
        id: 'firstBidAvg',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.firstBidAvg} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDuration(row.original.firstBid.avg)}
          </Text>
        ),
      },
      {
        id: 'firstBidP90',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.firstBidP90} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDuration(row.original.firstBid.p90)}
          </Text>
        ),
      },
      {
        id: 'awardMedian',
        header: () => renderSortHeader('awardMedian', COLUMN_LABELS.awardMedian),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="semibold">
            {formatDuration(row.original.award.median)}
          </Text>
        ),
      },
      {
        id: 'awardAvg',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.awardAvg} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDuration(row.original.award.avg)}
          </Text>
        ),
      },
      {
        id: 'awardP90',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.awardP90} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDuration(row.original.award.p90)}
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
          <StatTile
            label={SUMMARY_LABELS.firstBidMedian}
            value={formatDuration(kpis?.firstBid.median)}
          />
          <StatTile
            label={SUMMARY_LABELS.firstBidP90}
            value={formatDuration(kpis?.firstBid.p90)}
            tone="warning"
          />
          <StatTile
            label={SUMMARY_LABELS.awardMedian}
            value={formatDuration(kpis?.award.median)}
          />
          <StatTile
            label={SUMMARY_LABELS.awardP90}
            value={formatDuration(kpis?.award.p90)}
            tone="warning"
          />
        </StatTileRow>
      </div>

      <div className={styles.chart}>
        <ReportChart
          kind="line"
          series={chartSeries}
          height={CHART_HEIGHT}
          ariaLabel={CHART_COPY.ariaLabel}
        />
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
