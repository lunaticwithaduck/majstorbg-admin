'use client';

import { Button, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import { useGetJobsFunnelBreakdownQuery } from '@/api/store';
import { csvFilename, downloadCsv, toCsv } from '@/lib/export.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import {
  type PeriodPreset,
  type PeriodRange,
  presetToRange,
} from '@/ui/components/composed/PeriodSelect/utils/period.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import ReportFilters from '@/ui/components/composed/ReportFilters/ReportFilters';
import StatTile from '@/ui/components/composed/StatTile/StatTile';
import StatTileRow from '@/ui/components/composed/StatTileRow/StatTileRow';
import {
  BY_FILTER_LABEL,
  BY_OPTIONS,
  type ByDimension,
  COLUMN_LABELS,
  DEFAULT_BY,
  DEFAULT_PERIOD_PRESET,
  DEFAULT_SORT_DIR,
  DEFAULT_SORT_KEY,
  EXPORT_COPY,
  PAGE_SIZE,
  QUERY_PARAM_KEYS,
  SORT_INDICATORS,
  type SortDir,
  type SortKey,
  SORTABLE_KEYS,
  TABLE_COPY,
  TOTALS_LABELS,
} from './config/constants';
import styles from './JobsFunnelBreakdown.styles';

type Resp = NonNullable<ReturnType<typeof useGetJobsFunnelBreakdownQuery>['data']>;
type BreakdownRow = Resp['items'][number];

function isBy(value: string): value is ByDimension {
  return (BY_OPTIONS as readonly { value: string }[]).some((o) => o.value === value);
}

function isSortKey(value: string): value is SortKey {
  return (SORTABLE_KEYS as readonly string[]).includes(value);
}

function formatPercent(fraction: number): string {
  if (Number.isNaN(fraction)) return TABLE_COPY.dash;
  return `${Math.round(fraction * 100)}%`;
}

export default function JobsFunnelBreakdown() {
  // Filters/sort/page live in the URL via the shared hook; non-page changes
  // auto-reset the page to 1.
  const { get, getNumber, set } = useReportQuery('page');

  const byParam = get(QUERY_PARAM_KEYS.by) ?? DEFAULT_BY;
  const by: ByDimension = isBy(byParam) ? byParam : DEFAULT_BY;
  const periodValue = (get(QUERY_PARAM_KEYS.period) ?? DEFAULT_PERIOD_PRESET) as PeriodPreset;
  const fromParam = get(QUERY_PARAM_KEYS.from);
  const toParam = get(QUERY_PARAM_KEYS.to);
  const periodRange: PeriodRange | null =
    fromParam && toParam ? { from: fromParam, to: toParam } : presetToRange(periodValue);
  const sortByParam = get(QUERY_PARAM_KEYS.sortBy) ?? DEFAULT_SORT_KEY;
  const sortBy: SortKey = isSortKey(sortByParam) ? sortByParam : DEFAULT_SORT_KEY;
  const sortDir: SortDir = get(QUERY_PARAM_KEYS.sortDir) === 'asc' ? 'asc' : DEFAULT_SORT_DIR;
  const page = getNumber('page', 1);

  const handleByChange = useCallback(
    (value: string) => {
      set({ [QUERY_PARAM_KEYS.by]: value });
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

  const handlePageChange = useCallback(
    (nextPage: number) => {
      set({ page: nextPage });
    },
    [set],
  );

  const queryArgs = useMemo(
    () => ({
      by,
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [by, periodRange?.from, periodRange?.to],
  );
  const { data, isLoading, isFetching, isError } = useGetJobsFunnelBreakdownQuery(queryArgs);

  const allItems = useMemo(() => data?.items ?? [], [data?.items]);

  // Client-side sort over the (small) breakdown set, then paginate the slice.
  const sortedItems = useMemo(() => {
    const dir = sortDir === 'asc' ? 1 : -1;
    return [...allItems].sort((a, b) => (a[sortBy] - b[sortBy]) * dir);
  }, [allItems, sortBy, sortDir]);

  const pageItems = useMemo(
    () => sortedItems.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE),
    [sortedItems, page],
  );

  const totals = useMemo(
    () => ({
      segments: allItems.length,
      posted: allItems.reduce((sum, item) => sum + item.posted, 0),
      completed: allItems.reduce((sum, item) => sum + item.completed, 0),
    }),
    [allItems],
  );

  const handleExport = useCallback(() => {
    const csv = toCsv<BreakdownRow>(sortedItems, [
      { header: COLUMN_LABELS.key, value: (r) => r.key },
      { header: COLUMN_LABELS.posted, value: (r) => r.posted },
      { header: COLUMN_LABELS.withOffers, value: (r) => r.withOffers },
      { header: COLUMN_LABELS.completed, value: (r) => r.completed },
      { header: COLUMN_LABELS.completionRate, value: (r) => formatPercent(r.completionRate) },
    ]);
    downloadCsv(csvFilename(EXPORT_COPY.filenamePrefix), csv);
  }, [sortedItems]);

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

  const columns = useMemo<ColumnDef<BreakdownRow>[]>(
    () => [
      {
        id: 'key',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.key} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.key}
          </Text>
        ),
      },
      {
        id: 'posted',
        header: () => renderSortHeader('posted', COLUMN_LABELS.posted),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.posted}
          </Text>
        ),
      },
      {
        id: 'withOffers',
        header: () => renderSortHeader('withOffers', COLUMN_LABELS.withOffers),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.withOffers}
          </Text>
        ),
      },
      {
        id: 'completed',
        header: () => renderSortHeader('completed', COLUMN_LABELS.completed),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.completed}
          </Text>
        ),
      },
      {
        id: 'completionRate',
        header: () => renderSortHeader('completionRate', COLUMN_LABELS.completionRate),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatPercent(row.original.completionRate)}
          </Text>
        ),
      },
    ],
    [renderSortHeader],
  );

  return (
    <div className={styles.root}>
      <StatTileRow columns={3}>
        <StatTile label={TOTALS_LABELS.segments} value={totals.segments} />
        <StatTile label={TOTALS_LABELS.posted} value={totals.posted} />
        <StatTile label={TOTALS_LABELS.completed} value={totals.completed} tone="success" />
      </StatTileRow>

      <DataTable
        data={pageItems}
        columns={columns}
        total={sortedItems.length}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        filters={
          <ReportFilters
            period={{ value: periodValue, range: periodRange, onChange: handlePeriodChange }}
          >
            <Select label={BY_FILTER_LABEL} value={by} onValueChange={handleByChange} size="sm">
              {BY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </ReportFilters>
        }
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={sortedItems.length === 0}
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
