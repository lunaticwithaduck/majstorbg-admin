'use client';

import { Badge, Button, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { useGetWorkerSupplyQuery } from '@/api/store';
import type {
  WorkerSupplyChartPoint,
  WorkerSupplyRow as EndpointSupplyRow,
} from '@/api/admin-worker-supply-endpoints';
import { csvFilename, downloadCsv, toCsv } from '@/lib/export.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import ReportChart from '@/ui/components/composed/ReportChart/ReportChart';
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
  CHART_COPY,
  COLUMN_LABELS,
  COVERAGE_BADGE_LABELS,
  DEFAULT_DIMENSION,
  DEFAULT_PERIOD,
  DEFAULT_SORT_DIR,
  DEFAULT_SORT_KEY,
  DIMENSION_VALUES,
  type DimensionFilter,
  DIMENSION_FILTER_LABELS,
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
} from './config/constants';
import styles from './WorkerSupplyReport.styles';

// Row type derived from the RTK Query response so the bracketed-path file
// doesn't trip TS's type-only resolution against the bundled schemas .d.ts.
// Falls back to the endpoint's own row type while the store wiring agent has
// yet to re-export the typed hook (the derived type is `any` until then).
type SupplyResp = NonNullable<ReturnType<typeof useGetWorkerSupplyQuery>['data']>;
type SupplyRow = SupplyResp extends { items: readonly unknown[] }
  ? SupplyResp['items'][number]
  : EndpointSupplyRow;

const percentFormatter = new Intl.NumberFormat(undefined, {
  style: 'percent',
  maximumFractionDigits: 0,
});

const ratioFormatter = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 2,
});

function formatPercent(fraction: number): string {
  return percentFormatter.format(fraction);
}

function formatRatio(ratio: number | null): string {
  return ratio === null ? TABLE_COPY.dash : `${ratioFormatter.format(ratio)}×`;
}

// StatTile.value is `string | number`; render a dash while the summary loads.
function kpiValue(n: number | undefined): string | number {
  return n ?? TABLE_COPY.dash;
}

function kpiPercent(fraction: number | undefined): string {
  return fraction === undefined ? TABLE_COPY.dash : formatPercent(fraction);
}

function isDimension(value: string): value is DimensionFilter {
  return (DIMENSION_VALUES as readonly string[]).includes(value);
}

function isSortKey(value: string): value is SortKey {
  return (SORTABLE_KEYS as readonly string[]).includes(value);
}

export default function WorkerSupplyReport() {
  // Filter/sort/page state lives in the URL (shareable, reload-safe). The shared
  // hook resets page to 1 on any non-page change and strips empty keys.
  const query = useReportQuery(QUERY_PARAM_KEYS.page);

  const page = query.getNumber(QUERY_PARAM_KEYS.page, 1);
  const searchQuery = query.get(QUERY_PARAM_KEYS.search) ?? '';
  const dimensionParam = query.get(QUERY_PARAM_KEYS.dimension) ?? DEFAULT_DIMENSION;
  const dimension: DimensionFilter = isDimension(dimensionParam)
    ? dimensionParam
    : DEFAULT_DIMENSION;
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

  const handleDimensionChange = useCallback(
    (value: string) => {
      set({ [QUERY_PARAM_KEYS.dimension]: value === DEFAULT_DIMENSION ? null : value });
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

  // The period window narrows the OPEN-JOB demand side (Job.createdAt). Supply
  // (worker rows) is a live snapshot the BE returns unfiltered.
  const queryArgs = useMemo(
    () => ({
      dimension,
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortDir,
      ...(searchQuery.trim().length > 0 ? { search: searchQuery.trim() } : {}),
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [dimension, page, sortBy, sortDir, searchQuery, periodRange?.from, periodRange?.to],
  );
  const { data, isLoading, isFetching, isError } = useGetWorkerSupplyQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const summary = data?.summary;
  const chartData = useMemo(
    () =>
      ((data?.chart ?? []) as WorkerSupplyChartPoint[]).map((point) => ({
        label: point.label,
        value: point.value,
      })),
    [data?.chart],
  );

  const bucketLabel =
    dimension === 'city' ? COLUMN_LABELS.bucketCity : COLUMN_LABELS.bucketCategory;
  const chartTitle = dimension === 'city' ? CHART_COPY.titleCity : CHART_COPY.titleCategory;

  const handleExport = useCallback(() => {
    const csv = toCsv<SupplyRow>(items, [
      { header: bucketLabel, value: (r) => r.label },
      { header: COLUMN_LABELS.activeWorkers, value: (r) => r.activeWorkers },
      { header: COLUMN_LABELS.verifiedShare, value: (r) => formatPercent(r.verifiedShare) },
      { header: COLUMN_LABELS.acceptingShare, value: (r) => formatPercent(r.acceptingShare) },
      { header: COLUMN_LABELS.openJobs, value: (r) => r.openJobs },
      { header: COLUMN_LABELS.coverageRatio, value: (r) => formatRatio(r.coverageRatio) },
      {
        header: COLUMN_LABELS.thinCoverage,
        value: (r) => (r.thinCoverage ? COVERAGE_BADGE_LABELS.thin : COVERAGE_BADGE_LABELS.ok),
      },
    ]);
    downloadCsv(csvFilename(`${EXPORT_COPY.filenamePrefix}-${dimension}`), csv);
  }, [items, bucketLabel, dimension]);

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

  const columns = useMemo<ColumnDef<SupplyRow>[]>(
    () => [
      {
        id: 'bucket',
        header: () => <Text as="span" size="sm" weight="semibold">{bucketLabel}</Text>,
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.label}
          </Text>
        ),
      },
      {
        id: 'activeWorkers',
        header: () => renderSortHeader('activeWorkers', COLUMN_LABELS.activeWorkers),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {row.original.activeWorkers}
          </Text>
        ),
      },
      {
        id: 'verifiedShare',
        header: () => renderSortHeader('verifiedShare', COLUMN_LABELS.verifiedShare),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatPercent(row.original.verifiedShare)}
          </Text>
        ),
      },
      {
        id: 'acceptingShare',
        header: () => renderSortHeader('acceptingShare', COLUMN_LABELS.acceptingShare),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatPercent(row.original.acceptingShare)}
          </Text>
        ),
      },
      {
        id: 'openJobs',
        header: () => renderSortHeader('openJobs', COLUMN_LABELS.openJobs),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {row.original.openJobs}
          </Text>
        ),
      },
      {
        id: 'coverageRatio',
        header: () => renderSortHeader('coverageRatio', COLUMN_LABELS.coverageRatio),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatRatio(row.original.coverageRatio)}
          </Text>
        ),
      },
      {
        id: 'thinCoverage',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.thinCoverage} />
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.thinCoverage ? 'destructive' : 'success'} size="sm">
            {row.original.thinCoverage
              ? COVERAGE_BADGE_LABELS.thin
              : COVERAGE_BADGE_LABELS.ok}
          </Badge>
        ),
      },
    ],
    [bucketLabel, renderSortHeader],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold" value={PAGE_COPY.heading} />
        <Text as="p" size="sm" color="muted" value={PAGE_COPY.sub} />
      </header>

      <div className={styles.summary}>
        <StatTileRow columns={4}>
          <StatTile label={SUMMARY_LABELS.activeWorkers} value={kpiValue(summary?.activeWorkers)} />
          <StatTile
            label={SUMMARY_LABELS.verifiedShare}
            value={kpiPercent(summary?.verifiedShare)}
            tone="success"
          />
          <StatTile
            label={SUMMARY_LABELS.acceptingShare}
            value={kpiPercent(summary?.acceptingShare)}
          />
          <StatTile label={SUMMARY_LABELS.openJobs} value={kpiValue(summary?.openJobs)} />
          <StatTile
            label={SUMMARY_LABELS.thinCoverage}
            value={kpiValue(summary?.thinCoverageBuckets)}
            tone="warning"
          />
        </StatTileRow>
      </div>

      <div className={styles.chart}>
        <Text as="h2" size="lg" weight="semibold" value={chartTitle} />
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
          >
            <Select
              label={DIMENSION_FILTER_LABELS.label}
              value={dimension}
              onValueChange={handleDimensionChange}
              size="sm"
            >
              <SelectItem value="category">{DIMENSION_FILTER_LABELS.category}</SelectItem>
              <SelectItem value="city">{DIMENSION_FILTER_LABELS.city}</SelectItem>
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
