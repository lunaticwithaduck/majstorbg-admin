'use client';

import { Badge, Button, Link, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { Ban, Clock, Download, Eye, Hourglass, Percent } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import type { StuckJobRow } from '@/api/admin-cancellation-endpoints';
import {
  useGetCancellationSummaryQuery,
  useListStuckJobsQuery,
} from '@/api/store';
import { routes } from '@/config/routes';
import { type CsvColumn, csvFilename, downloadCsv, toCsv } from '@/lib/export.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import {
  type PeriodPreset,
  type PeriodRange,
  presetToRange,
} from '@/ui/components/composed/PeriodSelect/utils/period.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import ReportChart from '@/ui/components/composed/ReportChart/ReportChart';
import ReportFilters from '@/ui/components/composed/ReportFilters/ReportFilters';
import SortHeader from '@/ui/components/composed/SortHeader/SortHeader';
import StatTile from '@/ui/components/composed/StatTile/StatTile';
import StatTileRow from '@/ui/components/composed/StatTileRow/StatTileRow';
import {
  CHART_LABELS,
  COLUMN_LABELS,
  DASH,
  DEFAULT_OLDER_THAN_DAYS,
  DEFAULT_PERIOD_PRESET,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_DIR,
  KPI_LABELS,
  PAGE_LABELS,
  PAGE_SIZE,
  PRIOR_STAGE_ORDER,
  QUERY_KEYS,
  STATUS_BADGE_LABELS,
  STATUS_BADGE_VARIANT,
} from './config/constants';
import styles from './CancellationsReport.styles';
import { formatAgeDays, formatDate, formatPercent } from './utils/format.utils';

type SortBy = 'createdAt' | 'scheduledAt';
type SortDir = 'asc' | 'desc';

function isSortBy(value: string | null): value is SortBy {
  return value === 'createdAt' || value === 'scheduledAt';
}

export default function CancellationsReport() {
  const query = useReportQuery(QUERY_KEYS.page);

  const page = query.getNumber(QUERY_KEYS.page, 1);
  const search = query.get(QUERY_KEYS.search) ?? '';

  const periodValue = (query.get(QUERY_KEYS.period) ?? DEFAULT_PERIOD_PRESET) as PeriodPreset;
  const fromParam = query.get(QUERY_KEYS.from);
  const toParam = query.get(QUERY_KEYS.to);
  const periodRange: PeriodRange | null =
    fromParam && toParam ? { from: fromParam, to: toParam } : presetToRange(periodValue);

  const sortByRaw = query.get(QUERY_KEYS.sortBy);
  const sortBy: SortBy = isSortBy(sortByRaw) ? sortByRaw : DEFAULT_SORT_BY;
  const sortDir: SortDir = query.get(QUERY_KEYS.sortDir) === 'desc' ? 'desc' : DEFAULT_SORT_DIR;

  // Shared createdAt window for both the summary and the stuck list, so the
  // two halves of the screen always describe the same slice of jobs.
  const windowArgs = useMemo(
    () => ({
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [periodRange?.from, periodRange?.to],
  );

  const { data: summary } = useGetCancellationSummaryQuery(windowArgs);

  const listArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      olderThanDays: DEFAULT_OLDER_THAN_DAYS,
      sortBy,
      sortDir,
      ...windowArgs,
      ...(search.trim().length > 0 ? { search: search.trim() } : {}),
    }),
    [page, sortBy, sortDir, windowArgs, search],
  );
  const { data, isLoading, isFetching, isError } = useListStuckJobsQuery(listArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handlePeriodChange = useCallback(
    (preset: PeriodPreset, range: PeriodRange | null) => {
      query.set({
        [QUERY_KEYS.period]: preset,
        [QUERY_KEYS.from]: range?.from ?? null,
        [QUERY_KEYS.to]: range?.to ?? null,
      });
    },
    [query],
  );
  const handlePageChange = useCallback(
    (next: number) => query.set({ [QUERY_KEYS.page]: next }),
    [query],
  );
  const handleSearch = useCallback(
    (next: string) => query.set({ [QUERY_KEYS.search]: next.trim() || null }),
    [query],
  );
  const handleToggleSort = useCallback(
    (column: SortBy) => {
      if (sortBy !== column) {
        // First click on a column: select it, default to ascending.
        query.set({ [QUERY_KEYS.sortBy]: column, [QUERY_KEYS.sortDir]: null });
        return;
      }
      query.set({ [QUERY_KEYS.sortDir]: sortDir === 'asc' ? 'desc' : null });
    },
    [query, sortBy, sortDir],
  );

  const handleExport = useCallback(() => {
    const csvColumns: CsvColumn<StuckJobRow>[] = [
      { header: COLUMN_LABELS.job, value: (r) => r.title },
      { header: COLUMN_LABELS.status, value: (r) => STATUS_BADGE_LABELS[r.status] ?? r.status },
      { header: COLUMN_LABELS.category, value: (r) => r.category },
      { header: COLUMN_LABELS.city, value: (r) => r.cityName ?? DASH },
      { header: COLUMN_LABELS.age, value: (r) => formatAgeDays(r.ageDays) },
      { header: COLUMN_LABELS.scheduled, value: (r) => r.scheduledAt ?? DASH },
      { header: COLUMN_LABELS.created, value: (r) => r.createdAt },
    ];
    downloadCsv(csvFilename('stuck-jobs'), toCsv(items, csvColumns));
  }, [items]);

  const columns = useMemo<ColumnDef<StuckJobRow>[]>(
    () => [
      {
        id: 'job',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.job}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.title}
          </Text>
        ),
      },
      {
        id: 'status',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.status}
          </Text>
        ),
        cell: ({ row }) => (
          <span className={styles.badgeCell}>
            <Badge
              variant={STATUS_BADGE_VARIANT[row.original.status] ?? 'outline'}
              size="sm"
            >
              {STATUS_BADGE_LABELS[row.original.status] ?? row.original.status}
            </Badge>
          </span>
        ),
      },
      {
        id: 'category',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.category}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.category}
          </Text>
        ),
      },
      {
        id: 'city',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.city}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.cityName ?? DASH}
          </Text>
        ),
      },
      {
        id: 'age',
        header: () => (
          <SortHeader
            label={COLUMN_LABELS.age}
            active={sortBy === 'createdAt'}
            dir={sortDir}
            onToggle={() => handleToggleSort('createdAt')}
          />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatAgeDays(row.original.ageDays)}
          </Text>
        ),
      },
      {
        id: 'scheduled',
        header: () => (
          <SortHeader
            label={COLUMN_LABELS.scheduled}
            active={sortBy === 'scheduledAt'}
            dir={sortDir}
            onToggle={() => handleToggleSort('scheduledAt')}
          />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDate(row.original.scheduledAt)}
          </Text>
        ),
      },
      {
        id: 'created',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.created}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDate(row.original.createdAt)}
          </Text>
        ),
      },
      {
        id: 'actions',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.actions}
          </Text>
        ),
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm">
            <Link href={routes.jobs.detail(row.original.id)} variant="inherit">
              <Eye size={14} />
              {PAGE_LABELS.view}
            </Link>
          </Button>
        ),
      },
    ],
    [sortBy, sortDir, handleToggleSort],
  );

  const priorStageData = useMemo(
    () =>
      PRIOR_STAGE_ORDER.map((stage) => ({
        label: stage.label,
        value: summary ? summary.byPriorStage[stage.key] : 0,
      })),
    [summary],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {PAGE_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {PAGE_LABELS.pageSub}
        </Text>
      </header>

      <ReportFilters
        period={{ value: periodValue, range: periodRange, onChange: handlePeriodChange }}
      />

      <StatTileRow columns={4}>
        <StatTile
          label={KPI_LABELS.totalJobs}
          value={summary?.totals.jobs ?? DASH}
          icon={Clock}
        />
        <StatTile
          label={KPI_LABELS.cancelled}
          value={summary?.totals.cancelled ?? DASH}
          icon={Ban}
          tone="destructive"
        />
        <StatTile
          label={KPI_LABELS.cancellationRate}
          value={formatPercent(summary?.cancellationRate)}
          icon={Percent}
          tone="warning"
        />
        <StatTile label={KPI_LABELS.stuck} value={total} icon={Hourglass} />
      </StatTileRow>

      <div className={styles.chartCard}>
        <Text as="h2" size="lg" weight="semibold">
          {CHART_LABELS.priorStageTitle}
        </Text>
        <ReportChart kind="donut" data={priorStageData} ariaLabel={CHART_LABELS.priorStageAria} />
      </div>

      <DataTable
        data={items}
        columns={columns}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchPlaceholder={PAGE_LABELS.searchPlaceholder}
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={items.length === 0}>
            <Download size={14} />
            {PAGE_LABELS.exportCsv}
          </Button>
        }
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        loadingMessage={PAGE_LABELS.loading}
        errorMessage={PAGE_LABELS.error}
        emptyMessage={PAGE_LABELS.empty}
      />
    </div>
  );
}
