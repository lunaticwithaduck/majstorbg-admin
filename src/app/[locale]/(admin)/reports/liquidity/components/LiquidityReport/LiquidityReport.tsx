'use client';

import { Button, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import { useGetLiquidityQuery } from '@/api/store';
import { type CsvColumn, csvFilename, downloadCsv, toCsv } from '@/lib/export.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import ReportChart from '@/ui/components/composed/ReportChart/ReportChart';
import ReportFilters from '@/ui/components/composed/ReportFilters/ReportFilters';
import SortHeader from '@/ui/components/composed/SortHeader/SortHeader';
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
  DEFAULT_GROUP_BY,
  DEFAULT_PERIOD,
  DEFAULT_SORT_DIR,
  DEFAULT_SORT_KEY,
  EXPORT_COPY,
  GROUP_BY_LABELS,
  GROUP_BY_VALUES,
  type GroupByFilter,
  PAGE_COPY,
  PAGE_SIZE,
  QUERY_PARAM_KEYS,
  SORTABLE_KEYS,
  type SortDir,
  type SortKey,
  SUMMARY_LABELS,
  TABLE_COPY,
} from '../../config/constants';
import styles from './LiquidityReport.styles';

// Row types derived from the RTK Query response so the bracketed-path file
// doesn't trip TS's type-only resolution against the bundled schemas .d.ts.
type Resp = NonNullable<ReturnType<typeof useGetLiquidityQuery>['data']>;
type LiquidityRow = Resp['items'][number];
type ByCategory = Resp['byCategory'][number];

const ICON_SIZE = 14;

// 0..1 fraction -> "NN%". Defensive against undefined while data loads.
function formatPct(fraction: number | undefined): string {
  if (fraction === undefined || Number.isNaN(fraction)) return TABLE_COPY.dash;
  return `${Math.round(fraction * 100)}%`;
}

// Native-currency money. Currency is unnormalized on Bid, so we render per-row
// in the group's own code and flag mixed-currency groups rather than summing.
const moneyFormatters = new Map<string, Intl.NumberFormat>();
function moneyFormatter(currency: string): Intl.NumberFormat {
  const key = currency || 'XXX';
  let fmt = moneyFormatters.get(key);
  if (!fmt) {
    fmt = new Intl.NumberFormat(undefined, {
      maximumFractionDigits: 0,
    });
    moneyFormatters.set(key, fmt);
  }
  return fmt;
}

function formatBidAmount(row: LiquidityRow): string {
  if (row.bids === 0) return TABLE_COPY.dash;
  const amount = moneyFormatter(row.currency).format(Math.round(row.avgBidAmount));
  const code = row.currency || '';
  const base = code ? `${amount} ${code}` : amount;
  return row.mixedCurrency ? `${base}${TABLE_COPY.mixedSuffix}` : base;
}

function formatGroupLabel(row: LiquidityRow): string {
  if (row.city === null) return row.category;
  const city = row.city.trim().length > 0 ? row.city : TABLE_COPY.noCity;
  return `${row.category} · ${city}`;
}

// StatTile.value tolerates undefined now, but pass a concrete dash/number while
// the summary loads (TYPE-SAFETY note).
function kpiValue(n: number | undefined): string | number {
  return n ?? TABLE_COPY.dash;
}

function isGroupBy(value: string): value is GroupByFilter {
  return (GROUP_BY_VALUES as readonly string[]).includes(value);
}

function isSortKey(value: string): value is SortKey {
  return (SORTABLE_KEYS as readonly string[]).includes(value);
}

export default function LiquidityReport() {
  // Filter/sort/page state lives in the URL (shareable, reload-safe). The shared
  // hook resets page to 1 on any non-page change and strips empty keys.
  const query = useReportQuery(QUERY_PARAM_KEYS.page);

  const page = query.getNumber(QUERY_PARAM_KEYS.page, 1);
  const searchQuery = query.get(QUERY_PARAM_KEYS.search) ?? '';
  const groupByParam = query.get(QUERY_PARAM_KEYS.groupBy) ?? DEFAULT_GROUP_BY;
  const groupBy: GroupByFilter = isGroupBy(groupByParam) ? groupByParam : DEFAULT_GROUP_BY;
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

  const handleGroupByChange = useCallback(
    (value: string) => {
      set({ [QUERY_PARAM_KEYS.groupBy]: value === DEFAULT_GROUP_BY ? null : value });
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

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      groupBy,
      sortBy,
      sortDir,
      ...(searchQuery.trim().length > 0 ? { search: searchQuery.trim() } : {}),
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [page, groupBy, sortBy, sortDir, searchQuery, periodRange?.from, periodRange?.to],
  );
  const { data, isLoading, isFetching, isError } = useGetLiquidityQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const summary = data?.summary;
  const byCategory: ByCategory[] = data?.byCategory ?? [];

  const chartData = useMemo(
    () => byCategory.map((c) => ({ label: c.category, value: c.avgBids })),
    [byCategory],
  );

  const handleExport = useCallback(() => {
    const columns: CsvColumn<LiquidityRow>[] = [
      { header: COLUMN_LABELS.group, value: (r) => formatGroupLabel(r) },
      { header: COLUMN_LABELS.jobs, value: (r) => r.jobs },
      { header: COLUMN_LABELS.avgBids, value: (r) => r.avgBids },
      { header: COLUMN_LABELS.withBidsPct, value: (r) => formatPct(r.withBidsPct) },
      { header: COLUMN_LABELS.with3PlusPct, value: (r) => formatPct(r.with3PlusPct) },
      { header: COLUMN_LABELS.avgBidAmount, value: (r) => formatBidAmount(r) },
    ];
    downloadCsv(csvFilename(EXPORT_COPY.filenamePrefix), toCsv(items, columns));
  }, [items]);

  const columns = useMemo<ColumnDef<LiquidityRow>[]>(
    () => [
      {
        id: 'group',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.group} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {formatGroupLabel(row.original)}
          </Text>
        ),
      },
      {
        id: 'jobs',
        header: () => (
          <SortHeader
            label={COLUMN_LABELS.jobs}
            active={sortBy === 'jobs'}
            dir={sortDir}
            onToggle={() => handleSort('jobs')}
          />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.jobs}
          </Text>
        ),
      },
      {
        id: 'avgBids',
        header: () => (
          <SortHeader
            label={COLUMN_LABELS.avgBids}
            active={sortBy === 'avgBids'}
            dir={sortDir}
            onToggle={() => handleSort('avgBids')}
          />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.avgBids}
          </Text>
        ),
      },
      {
        id: 'withBidsPct',
        header: () => (
          <SortHeader
            label={COLUMN_LABELS.withBidsPct}
            active={sortBy === 'withBidsPct'}
            dir={sortDir}
            onToggle={() => handleSort('withBidsPct')}
          />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatPct(row.original.withBidsPct)}
          </Text>
        ),
      },
      {
        id: 'with3PlusPct',
        header: () => (
          <SortHeader
            label={COLUMN_LABELS.with3PlusPct}
            active={sortBy === 'with3PlusPct'}
            dir={sortDir}
            onToggle={() => handleSort('with3PlusPct')}
          />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatPct(row.original.with3PlusPct)}
          </Text>
        ),
      },
      {
        id: 'avgBidAmount',
        header: () => (
          <SortHeader
            label={COLUMN_LABELS.avgBidAmount}
            active={sortBy === 'avgBidAmount'}
            dir={sortDir}
            onToggle={() => handleSort('avgBidAmount')}
          />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatBidAmount(row.original)}
          </Text>
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
          <StatTile label={SUMMARY_LABELS.jobs} value={kpiValue(summary?.jobs)} />
          <StatTile label={SUMMARY_LABELS.bids} value={kpiValue(summary?.bids)} />
          <StatTile label={SUMMARY_LABELS.avgBids} value={kpiValue(summary?.avgBids)} />
          <StatTile
            label={SUMMARY_LABELS.withBidsPct}
            value={formatPct(summary?.withBidsPct)}
            tone="success"
          />
          <StatTile
            label={SUMMARY_LABELS.with3PlusPct}
            value={formatPct(summary?.with3PlusPct)}
          />
        </StatTileRow>
      </div>

      <div className={styles.chart}>
        <Text as="h2" size="lg" weight="semibold" value={CHART_COPY.title} />
        <ReportChart kind="bar" data={chartData} ariaLabel={CHART_COPY.aria} />
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
              label={GROUP_BY_LABELS.label}
              value={groupBy}
              onValueChange={handleGroupByChange}
              size="sm"
            >
              <SelectItem value="category">{GROUP_BY_LABELS.category}</SelectItem>
              <SelectItem value="city">{GROUP_BY_LABELS.city}</SelectItem>
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
