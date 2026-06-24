'use client';

import { Button, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useGetBidOutcomesQuery } from '@/api/store';
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
import StatTile from '@/ui/components/composed/StatTile/StatTile';
import StatTileRow from '@/ui/components/composed/StatTileRow/StatTileRow';
import {
  CHART_COPY,
  COLUMN_LABELS,
  DEFAULT_PERIOD,
  EXPORT_COPY,
  PAGE_COPY,
  PAGE_SIZE,
  QUERY_PARAM_KEYS,
  STATUS_LABELS,
  STATUS_ORDER,
  SUMMARY_LABELS,
  TABLE_COPY,
} from '../../config/constants';
import styles from './BidOutcomesReport.styles';

// Row types derived from the RTK Query response so the bracketed-path file
// doesn't trip TS's type-only resolution against the bundled schemas .d.ts.
type Resp = NonNullable<ReturnType<typeof useGetBidOutcomesQuery>['data']>;
type Overall = Resp['overall'];
type CategoryRow = Resp['byCategory'][number];

const ICON_SIZE = 14;

// 0..1 fraction -> "NN%". Defensive against undefined while data loads — always
// returns a string so a StatTile value never widens to undefined.
function formatPct(fraction: number | undefined): string {
  if (fraction === undefined || Number.isNaN(fraction)) return TABLE_COPY.dash;
  return `${Math.round(fraction * 100)}%`;
}

export default function BidOutcomesReport() {
  // Filter/page state lives in the URL (shareable, reload-safe). The shared hook
  // resets page to 1 on any non-page change and strips empty keys.
  const query = useReportQuery(QUERY_PARAM_KEYS.page);

  const page = query.getNumber(QUERY_PARAM_KEYS.page, 1);
  const searchQuery = query.get(QUERY_PARAM_KEYS.search) ?? '';
  const periodValue = (query.get(QUERY_PARAM_KEYS.period) ?? DEFAULT_PERIOD) as PeriodPreset;
  const fromParam = query.get(QUERY_PARAM_KEYS.from);
  const toParam = query.get(QUERY_PARAM_KEYS.to);
  const periodRange: PeriodRange | null =
    fromParam && toParam ? { from: fromParam, to: toParam } : presetToRange(periodValue);

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

  // Only the period window is sent to the BE; spread from/to conditionally so
  // optional props are never set to undefined (exactOptionalPropertyTypes).
  const queryArgs = useMemo(
    () => ({
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [periodRange?.from, periodRange?.to],
  );
  const { data, isLoading, isFetching, isError } = useGetBidOutcomesQuery(queryArgs);

  const overall: Overall | undefined = data?.overall;
  const allRows: CategoryRow[] = data?.byCategory ?? [];

  // Client-side category search + pagination over the whole returned series
  // (the BE returns byCategory already sorted, most-active first).
  const filteredRows = useMemo(() => {
    const needle = searchQuery.trim().toLowerCase();
    if (needle.length === 0) return allRows;
    return allRows.filter((r) => r.category.toLowerCase().includes(needle));
  }, [allRows, searchQuery]);

  const total = filteredRows.length;
  const pageRows = useMemo(() => {
    const start = (page - 1) * PAGE_SIZE;
    return filteredRows.slice(start, start + PAGE_SIZE);
  }, [filteredRows, page]);

  // Donut of the overall status mix, in the stable BidStatus order. STATUS_LABELS
  // is a string-keyed map indexed defensively (label ?? key).
  const chartData = useMemo(
    () =>
      STATUS_ORDER.map((status) => ({
        label: STATUS_LABELS[status] ?? status,
        value: overall ? overall[status] : 0,
      })),
    [overall],
  );

  const handleExport = useCallback(() => {
    const columns: CsvColumn<CategoryRow>[] = [
      { header: COLUMN_LABELS.category, value: (r) => r.category },
      { header: COLUMN_LABELS.accepted, value: (r) => r.accepted },
      { header: COLUMN_LABELS.rejected, value: (r) => r.rejected },
      { header: COLUMN_LABELS.withdrawn, value: (r) => r.withdrawn },
      { header: COLUMN_LABELS.total, value: (r) => r.total },
      { header: COLUMN_LABELS.winRate, value: (r) => formatPct(r.winRate) },
    ];
    downloadCsv(csvFilename(EXPORT_COPY.filenamePrefix), toCsv(filteredRows, columns));
  }, [filteredRows]);

  const columns = useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      {
        id: 'category',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.category} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.category}
          </Text>
        ),
      },
      {
        id: 'accepted',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.accepted} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.accepted}
          </Text>
        ),
      },
      {
        id: 'rejected',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.rejected} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.rejected}
          </Text>
        ),
      },
      {
        id: 'withdrawn',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.withdrawn} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.withdrawn}
          </Text>
        ),
      },
      {
        id: 'total',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.total} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.total}
          </Text>
        ),
      },
      {
        id: 'winRate',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.winRate} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatPct(row.original.winRate)}
          </Text>
        ),
      },
    ],
    [],
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
            label={SUMMARY_LABELS.winRate}
            value={formatPct(overall?.winRate)}
            tone="success"
          />
          <StatTile
            label={SUMMARY_LABELS.withdrawalRate}
            value={formatPct(overall?.withdrawalRate)}
            tone="warning"
          />
          <StatTile label={SUMMARY_LABELS.accepted} value={overall?.accepted ?? 0} />
          <StatTile label={SUMMARY_LABELS.rejected} value={overall?.rejected ?? 0} />
        </StatTileRow>
      </div>

      <div className={styles.chart}>
        <Text as="h2" size="lg" weight="semibold" value={CHART_COPY.heading} />
        <ReportChart kind="donut" data={chartData} ariaLabel={CHART_COPY.ariaLabel} />
      </div>

      <DataTable
        data={pageRows}
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
            disabled={filteredRows.length === 0}
          >
            <Download size={ICON_SIZE} />
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
