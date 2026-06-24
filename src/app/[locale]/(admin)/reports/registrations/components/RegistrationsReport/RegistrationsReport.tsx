'use client';

import { Button, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { useGetRegistrationsReportQuery } from '@/api/store';
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
  DEFAULT_PERIOD_GRAIN,
  DEFAULT_PERIOD_PRESET,
  DEFAULT_SORT_DIR,
  DEFAULT_SORT_KEY,
  EXPORT_COPY,
  PAGE_COPY,
  PAGE_SIZE,
  PERCENT_FRACTION_DIGITS,
  PERIOD_GRAIN_LABELS,
  PERIOD_GRAIN_VALUES,
  type PeriodGrain,
  QUERY_PARAM_KEYS,
  SORT_INDICATORS,
  SORTABLE_KEYS,
  type SortDir,
  type SortKey,
  SUMMARY_LABELS,
  TABLE_COPY,
} from './config/constants';
import styles from './RegistrationsReport.styles';

// Row type derived from the RTK Query response so the bracketed-path file
// doesn't trip TS's type-only resolution against the bundled schemas .d.ts.
type Resp = NonNullable<ReturnType<typeof useGetRegistrationsReportQuery>['data']>;
type RegistrationsRow = Resp['items'][number];
type SeriesPoint = Resp['series'][number];

const percentFormatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  maximumFractionDigits: PERCENT_FRACTION_DIGITS,
});

// BE rates are [0,1]; render a dash while the report loads.
function formatPercent(rate: number | undefined): string {
  if (rate === undefined) return TABLE_COPY.dash;
  return percentFormatter.format(rate);
}

// StatTile.value tolerates undefined but we pass a stable placeholder while
// the report loads so the tile never flashes blank.
function kpiValue(n: number | undefined): string | number {
  return n ?? TABLE_COPY.dash;
}

function isPeriodGrain(value: string): value is PeriodGrain {
  return (PERIOD_GRAIN_VALUES as readonly string[]).includes(value);
}

function isSortKey(value: string): value is SortKey {
  return (SORTABLE_KEYS as readonly string[]).includes(value);
}

export default function RegistrationsReport() {
  // Filter/sort/page state lives in the URL (shareable, reload-safe). The shared
  // hook resets page to 1 on any non-page change and strips empty keys.
  const query = useReportQuery(QUERY_PARAM_KEYS.page);

  const page = query.getNumber(QUERY_PARAM_KEYS.page, 1);
  const searchQuery = query.get(QUERY_PARAM_KEYS.search) ?? '';
  const grainParam = query.get(QUERY_PARAM_KEYS.grain) ?? DEFAULT_PERIOD_GRAIN;
  const grain: PeriodGrain = isPeriodGrain(grainParam)
    ? grainParam
    : DEFAULT_PERIOD_GRAIN;
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

  const handleGrainChange = useCallback(
    (value: string) => {
      set({ [QUERY_PARAM_KEYS.grain]: value });
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

  const queryArgs = useMemo(
    () => ({
      period: grain,
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortDir,
      ...(searchQuery.trim().length > 0 ? { search: searchQuery.trim() } : {}),
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [grain, page, sortBy, sortDir, searchQuery, periodRange?.from, periodRange?.to],
  );
  const { data, isLoading, isFetching, isError } =
    useGetRegistrationsReportQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const series = data?.series ?? [];
  const kpis = data?.kpis;

  // Three overlaid line series so the chart shows the role split at a glance.
  const chartSeries = useMemo(
    () => [
      {
        name: CHART_COPY.seriesTotal,
        points: series.map((p: SeriesPoint) => ({ x: p.bucket, y: p.total })),
      },
      {
        name: CHART_COPY.seriesWorkers,
        points: series.map((p: SeriesPoint) => ({ x: p.bucket, y: p.workers })),
      },
      {
        name: CHART_COPY.seriesClients,
        points: series.map((p: SeriesPoint) => ({ x: p.bucket, y: p.clients })),
      },
    ],
    [series],
  );

  const handleExport = useCallback(() => {
    const csv = toCsv<RegistrationsRow>(items, [
      { header: COLUMN_LABELS.bucket, value: (r) => r.bucket },
      { header: COLUMN_LABELS.total, value: (r) => r.total },
      { header: COLUMN_LABELS.workers, value: (r) => r.workers },
      { header: COLUMN_LABELS.clients, value: (r) => r.clients },
      { header: COLUMN_LABELS.onboarded, value: (r) => r.onboarded },
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

  const columns = useMemo<ColumnDef<RegistrationsRow>[]>(
    () => [
      {
        id: 'bucket',
        header: () => renderSortHeader('bucket', COLUMN_LABELS.bucket),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.bucket}
          </Text>
        ),
      },
      {
        id: 'total',
        header: () => renderSortHeader('total', COLUMN_LABELS.total),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="semibold">
            {row.original.total}
          </Text>
        ),
      },
      {
        id: 'workers',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.workers} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.workers}
          </Text>
        ),
      },
      {
        id: 'clients',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.clients} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.clients}
          </Text>
        ),
      },
      {
        id: 'onboarded',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.onboarded} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.onboarded}
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
          <StatTile label={SUMMARY_LABELS.total} value={kpiValue(kpis?.total)} />
          <StatTile label={SUMMARY_LABELS.workers} value={kpiValue(kpis?.workers)} />
          <StatTile label={SUMMARY_LABELS.clients} value={kpiValue(kpis?.clients)} />
          <StatTile
            label={SUMMARY_LABELS.onboardingRate}
            value={formatPercent(kpis?.onboardingCompletionRate)}
          />
          <StatTile
            label={SUMMARY_LABELS.verifiedWorkerShare}
            value={formatPercent(kpis?.verifiedWorkerShare)}
            tone="success"
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
          >
            <Select
              label={PERIOD_GRAIN_LABELS.label}
              value={grain}
              onValueChange={handleGrainChange}
              size="sm"
            >
              <SelectItem value="day">{PERIOD_GRAIN_LABELS.day}</SelectItem>
              <SelectItem value="week">{PERIOD_GRAIN_LABELS.week}</SelectItem>
              <SelectItem value="month">{PERIOD_GRAIN_LABELS.month}</SelectItem>
            </Select>
          </ReportFilters>
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
