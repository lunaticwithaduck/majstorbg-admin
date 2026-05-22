'use client';

import { Button, Link, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import { useListAdminUsersQuery } from '@/api/store';
import { routes } from '@/config/routes';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import { COLUMN_LABELS, PAGE_SIZE, type RoleFilter, TABLE_LABELS } from './config/constants';
import styles from './UserReportTable.styles';

// Row type derived from the RTK Query response so the bracketed-path file
// doesn't trip TS's type-only resolution against the bundled schemas .d.ts.
type ListResp = NonNullable<ReturnType<typeof useListAdminUsersQuery>['data']>;
type AdminUserListItem = ListResp['items'][number];

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

function formatDate(iso: string | null): string {
  if (!iso) return TABLE_LABELS.notOnboarded;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return TABLE_LABELS.notOnboarded;
  return dateFormatter.format(d);
}

export default function UserReportTable() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');

  const handleSearch = useCallback((next: string) => {
    setSearchQuery(next);
    setPage(1);
  }, []);
  const handleRoleChange = useCallback((value: string) => {
    setRoleFilter(value as RoleFilter);
    setPage(1);
  }, []);

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(searchQuery.trim().length > 0 ? { search: searchQuery.trim() } : {}),
      ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
    }),
    [page, searchQuery, roleFilter],
  );
  const { data, isLoading, isFetching, isError } = useListAdminUsersQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo<ColumnDef<AdminUserListItem>[]>(
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
        cell: ({ row }) => (
          <span className={styles.badge}>
            <Text as="span" size="xs" weight="medium">
              {row.original.role}
            </Text>
          </span>
        ),
      },
      {
        id: 'phone',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.phone}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.phone ?? TABLE_LABELS.noPhone}
          </Text>
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
        id: 'onboardingCompletedAt',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.onboardingCompletedAt}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.onboardingCompletedAt
              ? TABLE_LABELS.onboarded
              : TABLE_LABELS.notOnboarded}
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
            <Link href={routes.users.detail(row.original.id)} variant="inherit">
              <Eye size={14} />
              {TABLE_LABELS.view}
            </Link>
          </Button>
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
        onSearch={handleSearch}
        searchPlaceholder={TABLE_LABELS.searchPlaceholder}
        filters={
          <Select
            label={TABLE_LABELS.roleFilterLabel}
            value={roleFilter}
            onValueChange={handleRoleChange}
            size="sm"
          >
            <SelectItem value="all">{TABLE_LABELS.roleAll}</SelectItem>
            <SelectItem value="worker">{TABLE_LABELS.roleWorker}</SelectItem>
            <SelectItem value="client">{TABLE_LABELS.roleClient}</SelectItem>
          </Select>
        }
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        loadingMessage={TABLE_LABELS.loading}
        errorMessage={TABLE_LABELS.error}
        emptyMessage={TABLE_LABELS.empty}
      />
    </div>
  );
}
