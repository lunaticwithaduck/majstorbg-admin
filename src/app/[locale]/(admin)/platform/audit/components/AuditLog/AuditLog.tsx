'use client';

import { Badge, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import type { AuditEntry } from '@/api/admin-platform-endpoints';
import { useListAuditQuery } from '@/api/store';
import { EMPTY_VALUE, formatDateTime } from '@/lib/format.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import styles from './AuditLog.styles';
import { AUDIT_LABELS, COLUMN_LABELS, PAGE_SIZE, QUERY_KEYS } from './config/constants';

export default function AuditLog() {
  const query = useReportQuery(QUERY_KEYS.page);
  const page = query.getNumber(QUERY_KEYS.page, 1);
  const action = query.get(QUERY_KEYS.action) ?? '';

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(action.trim().length > 0 ? { action: action.trim() } : {}),
    }),
    [page, action],
  );
  const { data, isLoading, isFetching, isError } = useListAuditQuery(queryArgs);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handlePageChange = useCallback(
    (next: number) => query.set({ [QUERY_KEYS.page]: next }),
    [query],
  );
  const handleSearch = useCallback(
    (next: string) => query.set({ [QUERY_KEYS.action]: next.trim() || null, [QUERY_KEYS.page]: 1 }),
    [query],
  );

  const columns = useMemo<ColumnDef<AuditEntry>[]>(
    () => [
      {
        id: 'when',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.when}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDateTime(row.original.createdAt)}
          </Text>
        ),
      },
      {
        id: 'actor',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.actor}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.actorName}
          </Text>
        ),
      },
      {
        id: 'action',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.action}
          </Text>
        ),
        cell: ({ row }) => (
          <Badge variant="outline" size="sm">
            {row.original.action}
          </Badge>
        ),
      },
      {
        id: 'target',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.target}
          </Text>
        ),
        cell: ({ row }) => (
          <div className={styles.targetCell}>
            <Badge variant="secondary" size="sm">
              {row.original.targetType}
            </Badge>
            <Text as="span" size="sm" color="muted">
              {row.original.targetId}
            </Text>
          </div>
        ),
      },
      {
        id: 'reason',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.reason}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted" className={styles.reason}>
            {row.original.reason ?? EMPTY_VALUE}
          </Text>
        ),
      },
    ],
    [],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {AUDIT_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {AUDIT_LABELS.pageSub}
        </Text>
      </header>

      <DataTable
        data={items}
        columns={columns}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchPlaceholder={AUDIT_LABELS.searchPlaceholder}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        loadingMessage={AUDIT_LABELS.loading}
        errorMessage={AUDIT_LABELS.error}
        emptyMessage={AUDIT_LABELS.empty}
      />
    </div>
  );
}
