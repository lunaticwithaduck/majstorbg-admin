'use client';

import { Badge, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo, useState } from 'react';
import type {
  DataRequestRow,
  DataRequestStatus,
  DataRequestType,
} from '@/api/admin-compliance-endpoints';
import { useListDataRequestsQuery } from '@/api/store';
import { formatDate } from '@/lib/format.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import DataRequestActions from './components/DataRequestActions/DataRequestActions';
import {
  COLUMN_LABELS,
  DR_LABELS,
  IDENTITY_LABELS,
  PAGE_SIZE,
  QUERY_KEYS,
  STATUS_BADGE,
  STATUS_FILTER_OPTIONS,
  STATUS_LABELS,
  TYPE_FILTER_OPTIONS,
  TYPE_LABELS,
} from './config/constants';
import styles from './DataRequestsQueue.styles';
import { daysUntil, slaTone } from './utils/sla.utils';

const ALL = 'all';

export default function DataRequestsQueue() {
  const query = useReportQuery(QUERY_KEYS.page);
  const [nowMs] = useState(() => Date.now());
  const page = query.getNumber(QUERY_KEYS.page, 1);
  const typeValue = query.get(QUERY_KEYS.type) ?? ALL;
  const statusValue = query.get(QUERY_KEYS.status) ?? ALL;

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(typeValue !== ALL ? { type: typeValue as DataRequestType } : {}),
      ...(statusValue !== ALL ? { status: statusValue as DataRequestStatus } : {}),
    }),
    [page, typeValue, statusValue],
  );
  const { data, isLoading, isFetching, isError } = useListDataRequestsQuery(queryArgs);
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

  const columns = useMemo<ColumnDef<DataRequestRow>[]>(
    () => [
      {
        id: 'subject',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.subject}
          </Text>
        ),
        cell: ({ row }) => (
          <div className={styles.subjectCell}>
            <Text as="span" size="sm" weight="medium">
              {row.original.subjectName}
            </Text>
            <Text as="span" size="sm" color="muted">
              {row.original.subjectEmail}
            </Text>
          </div>
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
        id: 'identity',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.identity}
          </Text>
        ),
        cell: ({ row }) => (
          <Badge variant={row.original.identityVerified ? 'success' : 'secondary'} size="sm">
            {row.original.identityVerified ? IDENTITY_LABELS.verified : IDENTITY_LABELS.notVerified}
          </Badge>
        ),
      },
      {
        id: 'sla',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.sla}
          </Text>
        ),
        cell: ({ row }) => {
          const days = daysUntil(row.original.dueAt, nowMs);
          const tone = slaTone(days);
          const slaText =
            tone === 'destructive'
              ? DR_LABELS.overdue
              : `${Math.max(days, 0)} ${DR_LABELS.daysLeftSuffix}`;
          return (
            <Badge variant={tone} size="sm">
              {slaText}
            </Badge>
          );
        },
      },
      {
        id: 'requested',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.requested}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDate(row.original.requestedAt)}
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
        cell: ({ row }) => <DataRequestActions request={row.original} />,
      },
    ],
    [nowMs],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {DR_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {DR_LABELS.pageSub}
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
            <Select label={DR_LABELS.typeFilter} value={typeValue} onValueChange={handleType}>
              {TYPE_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <Select label={DR_LABELS.statusFilter} value={statusValue} onValueChange={handleStatus}>
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
        loadingMessage={DR_LABELS.loading}
        errorMessage={DR_LABELS.error}
        emptyMessage={DR_LABELS.empty}
      />
    </div>
  );
}
