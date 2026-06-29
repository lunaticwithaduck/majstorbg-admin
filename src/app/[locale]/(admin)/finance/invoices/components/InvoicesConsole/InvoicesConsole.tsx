'use client';

import { Badge, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import type { InvoiceRow, InvoiceStatus } from '@/api/admin-invoices-endpoints';
import { useListInvoicesQuery } from '@/api/store';
import { formatDate, formatEur } from '@/lib/format.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import InvoiceActions from './components/InvoiceActions/InvoiceActions';
import VatSettingsPanel from './components/VatSettingsPanel/VatSettingsPanel';
import {
  COLUMN_LABELS,
  INVOICES_LABELS,
  PAGE_SIZE,
  QUERY_KEYS,
  STATUS_BADGE,
  STATUS_FILTER_OPTIONS,
  STATUS_LABELS,
} from './config/constants';
import styles from './InvoicesConsole.styles';

const ALL = 'all';

/** Invoice amounts come as major units; render via the cents-based formatEur. */
function eurFromMajor(amount: number): string {
  return formatEur(Math.round(amount * 100));
}

export default function InvoicesConsole() {
  const query = useReportQuery(QUERY_KEYS.page);
  const page = query.getNumber(QUERY_KEYS.page, 1);
  const statusValue = query.get(QUERY_KEYS.status) ?? ALL;
  const search = query.get(QUERY_KEYS.search) ?? '';

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(statusValue !== ALL ? { status: statusValue as InvoiceStatus } : {}),
      ...(search.trim().length > 0 ? { search: search.trim() } : {}),
    }),
    [page, statusValue, search],
  );
  const { data, isLoading, isFetching, isError } = useListInvoicesQuery(queryArgs);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handlePageChange = useCallback(
    (next: number) => query.set({ [QUERY_KEYS.page]: next }),
    [query],
  );
  const handleStatus = useCallback(
    (next: string) =>
      query.set({ [QUERY_KEYS.status]: next === ALL ? null : next, [QUERY_KEYS.page]: 1 }),
    [query],
  );
  const handleSearch = useCallback(
    (next: string) => query.set({ [QUERY_KEYS.search]: next.trim() || null, [QUERY_KEYS.page]: 1 }),
    [query],
  );

  const columns = useMemo<ColumnDef<InvoiceRow>[]>(
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
        id: 'amount',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.amount}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {eurFromMajor(row.original.amount)}
          </Text>
        ),
      },
      {
        id: 'vat',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.vat}
          </Text>
        ),
        cell: ({ row }) => {
          let vatText: string = INVOICES_LABELS.noVat;
          if (row.original.vatAmount != null) {
            vatText = formatEur(row.original.vatAmount);
          } else if (row.original.vatIncluded) {
            vatText = INVOICES_LABELS.vatIncluded;
          }
          return (
            <Text as="span" size="sm" color="muted">
              {vatText}
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
          <Badge variant={STATUS_BADGE[row.original.status]} size="sm">
            {STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        id: 'due',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.due}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDate(row.original.dueAt)}
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
        cell: ({ row }) => <InvoiceActions invoice={row.original} />,
      },
    ],
    [],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {INVOICES_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {INVOICES_LABELS.pageSub}
        </Text>
      </header>

      <VatSettingsPanel />

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
          <div className={styles.filters}>
            <Select
              label={INVOICES_LABELS.statusFilter}
              value={statusValue}
              onValueChange={handleStatus}
            >
              {STATUS_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
          </div>
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
