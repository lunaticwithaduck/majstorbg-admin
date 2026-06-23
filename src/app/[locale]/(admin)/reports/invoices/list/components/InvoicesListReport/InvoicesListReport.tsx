'use client';

import { Badge, Button, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { Download } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import type { InvoiceRow } from '@/api/admin-invoices-endpoints';
import { useListInvoicesQuery } from '@/api/store';
import { type CsvColumn, csvFilename, downloadCsv, toCsv } from '@/lib/export.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import ReportFilters from '@/ui/components/composed/ReportFilters/ReportFilters';
import SortHeader from '@/ui/components/composed/SortHeader/SortHeader';
import StatTile from '@/ui/components/composed/StatTile/StatTile';
import StatTileRow from '@/ui/components/composed/StatTileRow/StatTileRow';
import {
  presetToRange,
  type PeriodPreset,
  type PeriodRange,
} from '@/ui/components/composed/PeriodSelect/utils/period.utils';
import { PERIOD_PRESETS } from '@/ui/components/composed/PeriodSelect/config/constants';
import {
  BUCKET_FILTER_LABELS,
  BUCKET_FILTER_VALUES,
  type BucketFilter,
  COLUMN_LABELS,
  DEFAULT_SORT_BY,
  DEFAULT_SORT_DIR,
  INVOICES_LABELS,
  PAGE_SIZE,
  QUERY_KEYS,
  SORTABLE,
  STATUS_BADGE_LABELS,
  STATUS_BADGE_VARIANT,
  STATUS_FILTER_LABELS,
  STATUS_FILTER_VALUES,
  type StatusFilter,
  TOTALS_LABELS,
} from './config/constants';
import styles from './InvoicesListReport.styles';

// Row type comes from the endpoint module's exported shape (not derived from the
// injected hook, whose generic widens to `any` through injectEndpoints).
type InvoiceListRow = InvoiceRow;

type SortBy = 'dueAt' | 'issuedAt' | 'amount';
type SortDir = 'asc' | 'desc';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

function formatDate(iso: string | null | undefined): string {
  if (!iso) return INVOICES_LABELS.none;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return INVOICES_LABELS.none;
  return dateFormatter.format(d);
}

function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);
}

function isStatusFilter(value: string | null): value is StatusFilter {
  return value !== null && (STATUS_FILTER_VALUES as readonly string[]).includes(value);
}
function isBucketFilter(value: string | null): value is BucketFilter {
  return value !== null && (BUCKET_FILTER_VALUES as readonly string[]).includes(value);
}
function isPeriodPreset(value: string | null): value is PeriodPreset {
  return value !== null && (PERIOD_PRESETS as readonly string[]).includes(value);
}
function isSortBy(value: string | null): value is SortBy {
  return value === 'dueAt' || value === 'issuedAt' || value === 'amount';
}

export default function InvoicesListReport() {
  const query = useReportQuery(QUERY_KEYS.page);

  const page = query.getNumber(QUERY_KEYS.page, 1);
  const search = query.get(QUERY_KEYS.search) ?? '';
  const statusRaw = query.get(QUERY_KEYS.status);
  const statusFilter: StatusFilter = isStatusFilter(statusRaw) ? statusRaw : 'all';
  const bucketRaw = query.get(QUERY_KEYS.bucket);
  const bucketFilter: BucketFilter = isBucketFilter(bucketRaw) ? bucketRaw : 'all';
  const periodRaw = query.get(QUERY_KEYS.period);
  const periodPreset: PeriodPreset = isPeriodPreset(periodRaw) ? periodRaw : 'last_30d';

  const from = query.get(QUERY_KEYS.from);
  const to = query.get(QUERY_KEYS.to);
  const periodRange: PeriodRange | null =
    from && to ? { from, to } : periodPreset === 'custom' ? null : presetToRange(periodPreset);

  const sortByRaw = query.get(QUERY_KEYS.sortBy);
  const sortBy: SortBy = isSortBy(sortByRaw) ? sortByRaw : DEFAULT_SORT_BY;
  const sortDir: SortDir = query.get(QUERY_KEYS.sortDir) === 'desc' ? 'desc' : DEFAULT_SORT_DIR;

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      sortBy,
      sortDir,
      ...(search.trim().length > 0 ? { search: search.trim() } : {}),
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
      ...(bucketFilter !== 'all' ? { agingBucket: bucketFilter } : {}),
    }),
    [page, sortBy, sortDir, search, statusFilter, bucketFilter],
  );
  const { data, isLoading, isFetching, isError } = useListInvoicesQuery(queryArgs);

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
  const handleBucketChange = useCallback(
    (next: string) => query.set({ [QUERY_KEYS.bucket]: next === 'all' ? null : next }),
    [query],
  );
  const handlePeriodChange = useCallback(
    (preset: PeriodPreset, range: PeriodRange | null) =>
      query.set({
        [QUERY_KEYS.period]: preset,
        [QUERY_KEYS.from]: range?.from ?? null,
        [QUERY_KEYS.to]: range?.to ?? null,
      }),
    [query],
  );
  const handleSort = useCallback(
    (column: SortBy) =>
      query.set({
        [QUERY_KEYS.sortBy]: column,
        [QUERY_KEYS.sortDir]:
          sortBy === column ? (sortDir === 'asc' ? 'desc' : null) : DEFAULT_SORT_DIR,
      }),
    [query, sortBy, sortDir],
  );

  const handleExport = useCallback(() => {
    const csvColumns: CsvColumn<InvoiceListRow>[] = [
      { header: COLUMN_LABELS.client, value: (r) => r.clientName },
      { header: COLUMN_LABELS.job, value: (r) => r.jobTitle },
      { header: COLUMN_LABELS.issued, value: (r) => r.issuedAt },
      { header: COLUMN_LABELS.due, value: (r) => r.dueAt },
      { header: COLUMN_LABELS.amount, value: (r) => r.amount },
      { header: COLUMN_LABELS.daysOverdue, value: (r) => r.daysOverdue },
      { header: COLUMN_LABELS.status, value: (r) => STATUS_BADGE_LABELS[r.status] },
    ];
    downloadCsv(csvFilename('invoices'), toCsv(items, csvColumns));
  }, [items]);

  const columns = useMemo<ColumnDef<InvoiceListRow>[]>(
    () => [
      {
        id: 'client',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.client}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.clientName}
          </Text>
        ),
      },
      {
        id: 'job',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.job}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.jobTitle}
          </Text>
        ),
      },
      {
        id: 'issued',
        header: () => (
          <SortHeader
            label={COLUMN_LABELS.issued}
            active={sortBy === SORTABLE.issuedAt}
            dir={sortDir}
            onToggle={() => handleSort('issuedAt')}
          />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDate(row.original.issuedAt)}
          </Text>
        ),
      },
      {
        id: 'due',
        header: () => (
          <SortHeader
            label={COLUMN_LABELS.due}
            active={sortBy === SORTABLE.dueAt}
            dir={sortDir}
            onToggle={() => handleSort('dueAt')}
          />
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDate(row.original.dueAt)}
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
            {formatMoney(row.original.amount, row.original.currency)}
          </Text>
        ),
      },
      {
        id: 'daysOverdue',
        header: () => (
          <SortHeader
            label={COLUMN_LABELS.daysOverdue}
            active={sortBy === SORTABLE.daysOverdue}
            dir={sortDir}
            onToggle={() => handleSort('amount')}
          />
        ),
        cell: ({ row }) => {
          const overdue = row.original.daysOverdue > 0;
          return (
            <Text as="span" size="sm" color={overdue ? 'destructive' : 'muted'}>
              {overdue ? row.original.daysOverdue : INVOICES_LABELS.none}
            </Text>
          );
        },
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
    ],
    [sortBy, sortDir, handleSort],
  );

  const pageCurrency = items[0]?.currency ?? 'EUR';
  const pageAmount = items.reduce((sum, i) => sum + i.amount, 0);
  const pageOverdue = items.filter((i) => i.daysOverdue > 0).length;

  return (
    <div className={styles.root}>
      <StatTileRow columns={3}>
        <StatTile label={TOTALS_LABELS.count} value={items.length} />
        <StatTile
          label={TOTALS_LABELS.amount}
          money={{ amount: pageAmount, currency: pageCurrency }}
        />
        <StatTile
          label={TOTALS_LABELS.overdue}
          value={pageOverdue}
          tone={pageOverdue > 0 ? 'destructive' : 'default'}
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
        searchPlaceholder={INVOICES_LABELS.searchPlaceholder}
        filters={
          <ReportFilters
            period={{ value: periodPreset, range: periodRange, onChange: handlePeriodChange }}
          >
            <Select
              label={INVOICES_LABELS.statusFilterLabel}
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
              label={INVOICES_LABELS.bucketFilterLabel}
              value={bucketFilter}
              onValueChange={handleBucketChange}
              size="sm"
            >
              {BUCKET_FILTER_VALUES.map((value) => (
                <SelectItem key={value} value={value}>
                  {BUCKET_FILTER_LABELS[value]}
                </SelectItem>
              ))}
            </Select>
          </ReportFilters>
        }
        actions={
          <Button variant="outline" size="sm" onClick={handleExport} disabled={items.length === 0}>
            <Download size={14} />
            {INVOICES_LABELS.exportCsv}
          </Button>
        }
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        loadingMessage={INVOICES_LABELS.loading}
        errorMessage={INVOICES_LABELS.error}
        emptyMessage={INVOICES_LABELS.empty}
      />
    </div>
  );
}
