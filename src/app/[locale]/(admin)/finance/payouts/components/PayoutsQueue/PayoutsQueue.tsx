'use client';

import { Badge, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import type { PayoutRow, PayoutStatus } from '@/api/admin-finance-endpoints';
import { useListPayoutsQuery } from '@/api/store';
import { EMPTY_VALUE, formatDate, formatEur } from '@/lib/format.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import PayoutActions from './components/PayoutActions/PayoutActions';
import {
  COLUMN_LABELS,
  PAGE_SIZE,
  PAYOUTS_LABELS,
  QUERY_KEYS,
  STATUS_BADGE,
  STATUS_FILTER_OPTIONS,
  STATUS_LABELS,
} from './config/constants';
import styles from './PayoutsQueue.styles';

const ALL = 'all';

export default function PayoutsQueue() {
  const query = useReportQuery(QUERY_KEYS.page);
  const page = query.getNumber(QUERY_KEYS.page, 1);
  const statusValue = query.get(QUERY_KEYS.status) ?? ALL;

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(statusValue !== ALL ? { status: statusValue as PayoutStatus } : {}),
    }),
    [page, statusValue],
  );
  const { data, isLoading, isFetching, isError } = useListPayoutsQuery(queryArgs);
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

  const columns = useMemo<ColumnDef<PayoutRow>[]>(
    () => [
      {
        id: 'worker',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.worker}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.workerName}
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
            {formatEur(row.original.amountCents)}
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
        cell: ({ row }) => <PayoutActions payout={row.original} />,
      },
    ],
    [],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {PAYOUTS_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {PAYOUTS_LABELS.pageSub}
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
            <Select
              label={PAYOUTS_LABELS.statusFilter}
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
        loadingMessage={PAYOUTS_LABELS.loading}
        errorMessage={PAYOUTS_LABELS.error}
        emptyMessage={PAYOUTS_LABELS.empty}
      />
    </div>
  );
}
