'use client';

import { Badge, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import type {
  TransactionRow,
  TransactionStatus,
  TransactionType,
} from '@/api/admin-finance-endpoints';
import { useListTransactionsQuery } from '@/api/store';
import { EMPTY_VALUE, formatDate, formatEur } from '@/lib/format.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import RefundModal from './components/RefundModal/RefundModal';
import ReleaseEscrowModal from './components/ReleaseEscrowModal/ReleaseEscrowModal';
import {
  COLUMN_LABELS,
  LEDGER_LABELS,
  PAGE_SIZE,
  QUERY_KEYS,
  STATUS_BADGE,
  STATUS_FILTER_OPTIONS,
  STATUS_LABELS,
  TYPE_FILTER_OPTIONS,
  TYPE_LABELS,
} from './config/constants';
import styles from './TransactionsLedger.styles';

const ALL = 'all';

export default function TransactionsLedger() {
  const query = useReportQuery(QUERY_KEYS.page);
  const page = query.getNumber(QUERY_KEYS.page, 1);
  const typeValue = query.get(QUERY_KEYS.type) ?? ALL;
  const statusValue = query.get(QUERY_KEYS.status) ?? ALL;

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(typeValue !== ALL ? { type: typeValue as TransactionType } : {}),
      ...(statusValue !== ALL ? { status: statusValue as TransactionStatus } : {}),
    }),
    [page, typeValue, statusValue],
  );
  const { data, isLoading, isFetching, isError } = useListTransactionsQuery(queryArgs);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handlePageChange = useCallback(
    (next: number) => query.set({ [QUERY_KEYS.page]: next }),
    [query],
  );
  const handleType = useCallback(
    (next: string) =>
      query.set({ [QUERY_KEYS.type]: next === ALL ? null : next, [QUERY_KEYS.page]: 1 }),
    [query],
  );
  const handleStatus = useCallback(
    (next: string) =>
      query.set({ [QUERY_KEYS.status]: next === ALL ? null : next, [QUERY_KEYS.page]: 1 }),
    [query],
  );

  const columns = useMemo<ColumnDef<TransactionRow>[]>(
    () => [
      {
        id: 'type',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.type}
          </Text>
        ),
        cell: ({ row }) => (
          <Badge variant="outline" size="sm">
            {TYPE_LABELS[row.original.type]}
          </Badge>
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
          <Badge variant={STATUS_BADGE[row.original.status]} size="sm">
            {STATUS_LABELS[row.original.status]}
          </Badge>
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
          <div className={styles.amountCell}>
            <Text as="span" size="sm" weight="medium">
              {formatEur(row.original.amountCents)}
            </Text>
            {row.original.flagged ? (
              <Badge variant="destructive" size="sm">
                {LEDGER_LABELS.flagged}
              </Badge>
            ) : null}
          </div>
        ),
      },
      {
        id: 'user',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.user}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {row.original.userName ?? EMPTY_VALUE}
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
            {row.original.jobTitle ?? EMPTY_VALUE}
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
          <div className={styles.actionsCell}>
            <RefundModal transaction={row.original} />
            <ReleaseEscrowModal transaction={row.original} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {LEDGER_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {LEDGER_LABELS.pageSub}
        </Text>
      </header>

      <DataTable
        data={items}
        columns={columns}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        filters={
          <div className={styles.filters}>
            <Select label={LEDGER_LABELS.typeFilter} value={typeValue} onValueChange={handleType}>
              {TYPE_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              label={LEDGER_LABELS.statusFilter}
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
        loadingMessage={LEDGER_LABELS.loading}
        errorMessage={LEDGER_LABELS.error}
        emptyMessage={LEDGER_LABELS.empty}
      />
    </div>
  );
}
