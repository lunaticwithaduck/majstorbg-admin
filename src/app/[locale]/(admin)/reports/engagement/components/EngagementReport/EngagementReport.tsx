'use client';

import { Badge, Button, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import type {
  EngagementActiveUsersByDayPoint,
  EngagementMessageRow,
} from '@/api/admin-engagement-endpoints';
import { useGetEngagementReportQuery } from '@/api/store';
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
  COLUMN_LABELS,
  DEFAULT_PERIOD_PRESET,
  DEFAULT_SORT_DIR,
  DEFAULT_SORT_KEY,
  EXPORT_COPY,
  KPI_LABELS,
  MESSAGE_TYPE_LABELS,
  PAGE_COPY,
  PAGE_SIZE,
  QUERY_PARAM_KEYS,
  READ_BADGE_LABELS,
  SORT_INDICATORS,
  SORTABLE_KEYS,
  type SortDir,
  type SortKey,
  TABLE_COPY,
} from '../../config/constants';
import styles from './EngagementReport.styles';

// Row type sourced from the local-stopgap endpoint module (the same pattern as
// the disputes report) so it typechecks cleanly regardless of whether the
// wiring agent has re-exported the hook into '@/api/store' yet.
type MessageRow = EngagementMessageRow;

const dateTimeFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDateTime(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return TABLE_COPY.dash;
  return dateTimeFormatter.format(d);
}

// StatTile tolerates undefined but we still pass a concrete value: a dash
// placeholder while the report loads, a formatted number/percent otherwise.
function kpiCount(n: number | undefined): string | number {
  return n ?? TABLE_COPY.dash;
}

function formatPercent(fraction: number | undefined): string {
  if (fraction === undefined || Number.isNaN(fraction)) return TABLE_COPY.dash;
  return `${Math.round(fraction * 100)}%`;
}

// MESSAGE_TYPE_LABELS is Record<string,string>; index defensively so a widened
// runtime type value never yields undefined (TS7053-safe).
function messageTypeLabel(type: string): string {
  return MESSAGE_TYPE_LABELS[type] ?? type;
}

function isSortKey(value: string): value is SortKey {
  return (SORTABLE_KEYS as readonly string[]).includes(value);
}

export default function EngagementReport() {
  // Filter/sort/page state lives in the URL (shareable, reload-safe). The
  // shared hook resets page to 1 on any non-page change and strips empty keys.
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

  // The period window anchors the messages KPI + list on Message.sentAt; the
  // active-users / unread snapshots ignore it server-side (now-relative).
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
    useGetEngagementReportQuery(queryArgs);

  const kpis = data?.kpis;
  const items = data?.messages.items ?? [];
  const total = data?.messages.total ?? 0;

  const trendSeries = useMemo(
    () => [
      {
        name: CHART_COPY.series,
        points: (data?.activeUsersByDay ?? []).map(
          (p: EngagementActiveUsersByDayPoint) => ({ x: p.date, y: p.count }),
        ),
      },
    ],
    [data?.activeUsersByDay],
  );

  const handleExport = useCallback(() => {
    const csv = toCsv<MessageRow>(items, [
      { header: COLUMN_LABELS.sentAt, value: (r) => r.sentAt },
      { header: COLUMN_LABELS.sender, value: (r) => r.senderName },
      { header: COLUMN_LABELS.job, value: (r) => r.jobTitle },
      { header: COLUMN_LABELS.type, value: (r) => r.type },
      { header: COLUMN_LABELS.preview, value: (r) => r.preview },
      { header: COLUMN_LABELS.read, value: (r) => (r.read ? 'yes' : 'no') },
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

  const columns = useMemo<ColumnDef<MessageRow>[]>(
    () => [
      {
        id: 'sentAt',
        header: () => renderSortHeader('sentAt', COLUMN_LABELS.sentAt),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDateTime(row.original.sentAt)}
          </Text>
        ),
      },
      {
        id: 'sender',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.sender} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.senderName}
          </Text>
        ),
      },
      {
        id: 'job',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.job} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.jobTitle}
          </Text>
        ),
      },
      {
        id: 'type',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.type} />
        ),
        cell: ({ row }) => (
          <Badge variant="secondary" size="sm">
            {messageTypeLabel(row.original.type)}
          </Badge>
        ),
      },
      {
        id: 'preview',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.preview} />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.preview}
          </Text>
        ),
      },
      {
        id: 'read',
        header: () => (
          <Text as="span" size="sm" weight="semibold" value={COLUMN_LABELS.read} />
        ),
        cell: ({ row }) => (
          <div className={styles.badgeCell}>
            <Badge variant={row.original.read ? 'success' : 'outline'} size="sm">
              {row.original.read ? READ_BADGE_LABELS.read : READ_BADGE_LABELS.unread}
            </Badge>
          </div>
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

      <StatTileRow columns={4}>
        <StatTile label={KPI_LABELS.active24h} value={kpiCount(kpis?.activeUsers.last24h)} />
        <StatTile label={KPI_LABELS.active7d} value={kpiCount(kpis?.activeUsers.last7d)} />
        <StatTile
          label={KPI_LABELS.active30d}
          value={kpiCount(kpis?.activeUsers.last30d)}
          tone="success"
        />
        <StatTile
          label={KPI_LABELS.unreadRate}
          value={formatPercent(kpis?.unread.rate)}
          tone="warning"
        />
        <StatTile
          label={KPI_LABELS.messagesInPeriod}
          value={kpiCount(kpis?.messagesInPeriod)}
        />
      </StatTileRow>

      <div className={styles.chartCard}>
        <Text as="h2" size="lg" weight="semibold" value={CHART_COPY.title} />
        <ReportChart kind="line" series={trendSeries} ariaLabel={CHART_COPY.aria} />
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
