'use client';

import { Badge, Button, Link, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { AlertTriangle, Download, Eye, Flame, Timer, Wallet } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import type { DisputeRow } from '@/api/admin-disputes-endpoints';
import {
  useGetDisputesSummaryQuery,
  useListOpenDisputesQuery,
} from '@/api/store';
import { routes } from '@/config/routes';
import { type CsvColumn, csvFilename, downloadCsv, toCsv } from '@/lib/export.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import ReportChart from '@/ui/components/composed/ReportChart/ReportChart';
import StatTile from '@/ui/components/composed/StatTile/StatTile';
import StatTileRow from '@/ui/components/composed/StatTileRow/StatTileRow';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import SortHeader from '@/ui/components/composed/SortHeader/SortHeader';
import {
  CHART_LABELS,
  COLUMN_LABELS,
  DEFAULT_SORT_DIR,
  DISPUTES_LABELS,
  KPI_LABELS,
  KPI_PLACEHOLDER,
  OPEN_FILTER_LABELS,
  OPEN_FILTER_VALUES,
  type OpenFilter,
  PAGE_SIZE,
  QUERY_KEYS,
  STATUS_BADGE_LABELS,
  STATUS_BADGE_VARIANT,
  STATUS_CHART_ORDER,
  STATUS_FILTER_LABELS,
  STATUS_FILTER_VALUES,
  type StatusFilter,
  TYPE_BADGE_LABELS,
  TYPE_FILTER_LABELS,
  TYPE_FILTER_VALUES,
  type TypeFilter,
} from './config/constants';
import styles from './DisputesQueueReport.styles';
import { formatAge, formatDate, formatMoney } from './utils/format.utils';

// Row type comes from the endpoint module's exported shape (not derived from the
// injected hook, whose generic widens to `any` through injectEndpoints).
type DisputeListRow = DisputeRow;

type SortDir = 'asc' | 'desc';

function isStatusFilter(value: string | null): value is StatusFilter {
  return value !== null && (STATUS_FILTER_VALUES as readonly string[]).includes(value);
}
function isTypeFilter(value: string | null): value is TypeFilter {
  return value !== null && (TYPE_FILTER_VALUES as readonly string[]).includes(value);
}
function isOpenFilter(value: string | null): value is OpenFilter {
  return value !== null && (OPEN_FILTER_VALUES as readonly string[]).includes(value);
}

export default function DisputesQueueReport() {
  const query = useReportQuery(QUERY_KEYS.page);

  const page = query.getNumber(QUERY_KEYS.page, 1);
  const search = query.get(QUERY_KEYS.search) ?? '';
  const statusRaw = query.get(QUERY_KEYS.status);
  const statusFilter: StatusFilter = isStatusFilter(statusRaw) ? statusRaw : 'all';
  const typeRaw = query.get(QUERY_KEYS.type);
  const typeFilter: TypeFilter = isTypeFilter(typeRaw) ? typeRaw : 'all';
  const openRaw = query.get(QUERY_KEYS.open);
  const openFilter: OpenFilter = isOpenFilter(openRaw) ? openRaw : 'open';
  const sortDir: SortDir = query.get(QUERY_KEYS.sortDir) === 'desc' ? 'desc' : DEFAULT_SORT_DIR;

  const { data: summary } = useGetDisputesSummaryQuery();

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sortBy: 'createdAt' as const,
      sortDir,
      ...(search.trim().length > 0 ? { search: search.trim() } : {}),
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(typeFilter !== 'all' ? { type: typeFilter } : {}),
      ...(openFilter === 'open' ? { open: true } : {}),
    }),
    [page, sortDir, search, statusFilter, typeFilter, openFilter],
  );
  const { data, isLoading, isFetching, isError } = useListOpenDisputesQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handlePageChange = useCallback(
    (next: number) => query.set({ [QUERY_KEYS.page]: next }),
    [query],
  );
  const handleSearch = useCallback(
    (next: string) => query.set({ [QUERY_KEYS.search]: next.trim() || null }),
    [query],
  );
  const handleStatusChange = useCallback(
    (next: string) => query.set({ [QUERY_KEYS.status]: next === 'all' ? null : next }),
    [query],
  );
  const handleTypeChange = useCallback(
    (next: string) => query.set({ [QUERY_KEYS.type]: next === 'all' ? null : next }),
    [query],
  );
  const handleOpenChange = useCallback(
    (next: string) => query.set({ [QUERY_KEYS.open]: next === 'open' ? null : next }),
    [query],
  );
  const handleToggleSort = useCallback(
    () => query.set({ [QUERY_KEYS.sortDir]: sortDir === 'asc' ? 'desc' : null }),
    [query, sortDir],
  );

  const handleExport = useCallback(() => {
    const csvColumns: CsvColumn<DisputeListRow>[] = [
      { header: COLUMN_LABELS.job, value: (r) => r.jobTitle },
      { header: COLUMN_LABELS.type, value: (r) => TYPE_BADGE_LABELS[r.type] },
      { header: COLUMN_LABELS.status, value: (r) => STATUS_BADGE_LABELS[r.status] },
      { header: COLUMN_LABELS.worker, value: (r) => r.workerName },
      { header: COLUMN_LABELS.raiser, value: (r) => r.raiserName },
      { header: COLUMN_LABELS.amount, value: (r) => r.escrowAmount },
      { header: COLUMN_LABELS.age, value: (r) => formatAge(r.ageHours) },
      { header: COLUMN_LABELS.opened, value: (r) => r.createdAt },
    ];
    downloadCsv(csvFilename('disputes'), toCsv(items, csvColumns));
  }, [items]);

  const columns = useMemo<ColumnDef<DisputeListRow>[]>(
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
            {row.original.jobTitle}
          </Text>
        ),
      },
      {
        id: 'type',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.type}
          </Text>
        ),
        cell: ({ row }) => (
          <span className={styles.badgeCell}>
            <Badge variant="outline" size="sm">
              {TYPE_BADGE_LABELS[row.original.type]}
            </Badge>
          </span>
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
            <Badge variant={STATUS_BADGE_VARIANT[row.original.status]} size="sm">
              {STATUS_BADGE_LABELS[row.original.status]}
            </Badge>
          </span>
        ),
      },
      {
        id: 'worker',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.worker}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.workerName}
          </Text>
        ),
      },
      {
        id: 'raiser',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.raiser}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.raiserName}
          </Text>
        ),
      },
      {
        id: 'amount',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.amount}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {formatMoney(row.original.escrowAmount, row.original.currency)}
          </Text>
        ),
      },
      {
        id: 'age',
        header: () => (
          <SortHeader
            label={COLUMN_LABELS.age}
            active
            dir={sortDir}
            onToggle={handleToggleSort}
          />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatAge(row.original.ageHours)}
          </Text>
        ),
      },
      {
        id: 'opened',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.opened}
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
            <Link href={routes.reports.disputeDetail(row.original.id)} variant="inherit">
              <Eye size={14} />
              {DISPUTES_LABELS.view}
            </Link>
          </Button>
        ),
      },
    ],
    [sortDir, handleToggleSort],
  );

  const avgAgeValue = summary ? formatAge(summary.avgAgeHours) : undefined;

  const statusChartData = useMemo(
    () =>
      STATUS_CHART_ORDER.map((status) => ({
        label: STATUS_BADGE_LABELS[status] ?? status,
        value: items.filter((d) => d.status === status).length,
      })),
    [items],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {DISPUTES_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {DISPUTES_LABELS.pageSub}
        </Text>
      </header>

      <StatTileRow columns={4}>
        <StatTile
          label={KPI_LABELS.open}
          value={summary?.open ?? KPI_PLACEHOLDER}
          icon={AlertTriangle}
        />
        <StatTile
          label={KPI_LABELS.escalated}
          value={summary?.escalated ?? KPI_PLACEHOLDER}
          icon={Flame}
          tone="destructive"
        />
        <StatTile
          label={KPI_LABELS.avgAge}
          value={avgAgeValue ?? KPI_PLACEHOLDER}
          icon={Timer}
          tone="warning"
        />
        <StatTile
          label={KPI_LABELS.atRisk}
          {...(summary
            ? { money: { amount: summary.totalAtRisk, currency: summary.currency } }
            : { value: KPI_PLACEHOLDER })}
          icon={Wallet}
        />
      </StatTileRow>

      <DataTable
        data={items}
        columns={columns}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchPlaceholder={DISPUTES_LABELS.searchPlaceholder}
        filters={
          <>
            <Select
              label={DISPUTES_LABELS.statusFilterLabel}
              value={statusFilter}
              onValueChange={handleStatusChange}
              size="sm"
            >
              {STATUS_FILTER_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {STATUS_FILTER_LABELS[value]}
                </SelectItem>
              ))}
            </Select>
            <Select
              label={DISPUTES_LABELS.typeFilterLabel}
              value={typeFilter}
              onValueChange={handleTypeChange}
              size="sm"
            >
              {TYPE_FILTER_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {TYPE_FILTER_LABELS[value]}
                </SelectItem>
              ))}
            </Select>
            <Select
              label={DISPUTES_LABELS.openFilterLabel}
              value={openFilter}
              onValueChange={handleOpenChange}
              size="sm"
            >
              {OPEN_FILTER_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {OPEN_FILTER_LABELS[value]}
                </SelectItem>
              ))}
            </Select>
          </>
        }
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={items.length === 0}>
            <Download size={14} />
            {DISPUTES_LABELS.exportCsv}
          </Button>
        }
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        loadingMessage={DISPUTES_LABELS.loading}
        errorMessage={DISPUTES_LABELS.error}
        emptyMessage={DISPUTES_LABELS.empty}
      />

      <div className={styles.chartCard}>
        <Text as="h2" size="lg" weight="semibold">
          {CHART_LABELS.statusMix}
        </Text>
        <ReportChart kind="donut" data={statusChartData} ariaLabel={CHART_LABELS.statusMix} />
      </div>
    </div>
  );
}
