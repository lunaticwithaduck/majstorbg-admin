'use client';

import { Button, Input, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { Send } from 'lucide-react';
import { type ChangeEvent, useCallback, useMemo, useState } from 'react';
import type { AdminNotificationListItem } from '@/api/admin-notification-endpoints';
import { useListAdminNotificationsQuery } from '@/api/store';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import SendTestNotificationModal from '../SendTestNotificationModal/SendTestNotificationModal';
import { COLUMN_LABELS, KIND_LABELS, PAGE_SIZE, TABLE_LABELS } from './config/constants';
import styles from './NotificationsExplorer.styles';
import { formatDate, formatPayloadPreview, shortId } from './utils/format.utils';

export default function NotificationsExplorer() {
  const [page, setPage] = useState(1);
  const [userIdFilter, setUserIdFilter] = useState('');
  const [sendOpen, setSendOpen] = useState(false);

  const handleUserIdChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    setUserIdFilter(event.target.value);
    setPage(1);
  }, []);
  const handleClearUserId = useCallback(() => {
    setUserIdFilter('');
    setPage(1);
  }, []);

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(userIdFilter.trim().length > 0 ? { userId: userIdFilter.trim() } : {}),
    }),
    [page, userIdFilter],
  );
  const { data, isLoading, isFetching, isError } = useListAdminNotificationsQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo<ColumnDef<AdminNotificationListItem>[]>(
    () => [
      {
        id: 'id',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.id}
          </Text>
        ),
        cell: ({ row }) => <span className={styles.idCell}>{shortId(row.original.id)}</span>,
      },
      {
        id: 'user',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.user}
          </Text>
        ),
        cell: ({ row }) => (
          <div>
            <Text as="span" size="sm" weight="medium">
              {row.original.userName ?? TABLE_LABELS.noUserName}
            </Text>
            <span className={styles.idCell}> {shortId(row.original.userId)}</span>
          </div>
        ),
      },
      {
        id: 'kind',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.kind}
          </Text>
        ),
        cell: ({ row }) => (
          <span className={styles.badge}>
            <Text as="span" size="xs" weight="medium">
              {KIND_LABELS[row.original.kind] ?? row.original.kind}
            </Text>
          </span>
        ),
      },
      {
        id: 'payload',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.payload}
          </Text>
        ),
        cell: ({ row }) => (
          <span className={styles.payloadCell}>
            {formatPayloadPreview(row.original.payload)}
          </span>
        ),
      },
      {
        id: 'createdAt',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.createdAt}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDate(row.original.createdAt)}
          </Text>
        ),
      },
      {
        id: 'read',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.read}
          </Text>
        ),
        cell: ({ row }) =>
          row.original.readAt ? (
            <span className={styles.readBadge}>
              <Text as="span" size="xs" weight="medium">
                {TABLE_LABELS.readYes}
              </Text>
            </span>
          ) : (
            <span className={styles.unreadBadge}>
              <Text as="span" size="xs" weight="medium">
                {TABLE_LABELS.readNo}
              </Text>
            </span>
          ),
      },
    ],
    [],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {TABLE_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {TABLE_LABELS.pageSub}
        </Text>
      </header>
      <DataTable
        data={items}
        columns={columns}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        filters={
          <div className={styles.userFilter}>
            <div className={styles.userFilterInput}>
              <Input
                label={TABLE_LABELS.userFilterLabel}
                placeholder={TABLE_LABELS.userFilterPlaceholder}
                value={userIdFilter}
                onChange={handleUserIdChange}
              />
            </div>
            {userIdFilter.length > 0 ? (
              <Button type="button" variant="ghost" size="sm" onClick={handleClearUserId}>
                {TABLE_LABELS.userFilterReset}
              </Button>
            ) : null}
          </div>
        }
        actions={
          <Button
            type="button"
            variant="primary"
            size="sm"
            iconLeft={Send}
            onClick={() => setSendOpen(true)}
          >
            {TABLE_LABELS.sendTestTrigger}
          </Button>
        }
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        loadingMessage={TABLE_LABELS.loading}
        errorMessage={TABLE_LABELS.error}
        emptyMessage={TABLE_LABELS.empty}
      />
      <SendTestNotificationModal
        open={sendOpen}
        onOpenChange={setSendOpen}
        defaultUserId={userIdFilter.trim().length > 0 ? userIdFilter.trim() : undefined}
      />
    </div>
  );
}
