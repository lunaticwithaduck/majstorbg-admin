'use client';

import { Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useMemo } from 'react';
import type { AdminRow } from '@/api/admin-platform-endpoints';
import { useListAdminsQuery } from '@/api/store';
import { formatDateTime } from '@/lib/format.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import styles from './AdminsList.styles';
import PromoteUserModal from './components/PromoteUserModal/PromoteUserModal';
import RoleSelectCell from './components/RoleSelectCell/RoleSelectCell';
import { ADMINS_LABELS, COLUMN_LABELS, PAGE_SIZE } from './config/constants';

export default function AdminsList() {
  const { data, isLoading, isFetching, isError } = useListAdminsQuery();
  const items = data?.items ?? [];

  const columns = useMemo<ColumnDef<AdminRow>[]>(
    () => [
      {
        id: 'name',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.name}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.name}
          </Text>
        ),
      },
      {
        id: 'email',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.email}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.email}
          </Text>
        ),
      },
      {
        id: 'role',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.role}
          </Text>
        ),
        cell: ({ row }) => <RoleSelectCell admin={row.original} />,
      },
      {
        id: 'lastActive',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.lastActive}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDateTime(row.original.lastActiveAt)}
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
          {ADMINS_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {ADMINS_LABELS.pageSub}
        </Text>
      </header>

      <DataTable
        data={items}
        columns={columns}
        total={items.length}
        page={1}
        pageSize={PAGE_SIZE}
        onPageChange={() => undefined}
        actions={<PromoteUserModal />}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        loadingMessage={ADMINS_LABELS.loading}
        errorMessage={ADMINS_LABELS.error}
        emptyMessage={ADMINS_LABELS.empty}
      />
    </div>
  );
}
