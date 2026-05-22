'use client';

import { Button, Link, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { Eye } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import type { AdminJobListItem } from '@/api/admin-job-endpoints';
import { useListAdminJobsQuery } from '@/api/store';
import { routes } from '@/config/routes';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import {
  COLUMN_LABELS,
  PAGE_SIZE,
  type StatusFilter,
  TABLE_LABELS,
} from './config/constants';
import styles from './JobsExplorer.styles';
import { formatBudget, formatDate, shortId } from './utils/format.utils';

export default function JobsExplorer() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');

  const handleSearch = useCallback((next: string) => {
    setSearchQuery(next);
    setPage(1);
  }, []);
  const handleStatusChange = useCallback((value: string) => {
    setStatusFilter(value as StatusFilter);
    setPage(1);
  }, []);

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(searchQuery.trim().length > 0 ? { search: searchQuery.trim() } : {}),
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    }),
    [page, searchQuery, statusFilter],
  );
  const { data, isLoading, isFetching, isError } = useListAdminJobsQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo<ColumnDef<AdminJobListItem>[]>(
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
        id: 'title',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.title}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.title}
          </Text>
        ),
      },
      {
        id: 'category',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.category}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.category}
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
          <span className={styles.badge}>
            <Text as="span" size="xs" weight="medium">
              {row.original.status}
            </Text>
          </span>
        ),
      },
      {
        id: 'client',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.client}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {row.original.clientName}
          </Text>
        ),
      },
      {
        id: 'budget',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.budget}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatBudget(row.original.budget)}
          </Text>
        ),
      },
      {
        id: 'city',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.city}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.city ?? TABLE_LABELS.noCity}
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
        id: 'actions',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.actions}
          </Text>
        ),
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm">
            <Link href={routes.jobs.detail(row.original.id)} variant="inherit">
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
            label={TABLE_LABELS.statusFilterLabel}
            value={statusFilter}
            onValueChange={handleStatusChange}
            size="sm"
          >
            <SelectItem value="all">{TABLE_LABELS.statusAll}</SelectItem>
            <SelectItem value="open">{TABLE_LABELS.statusOpen}</SelectItem>
            <SelectItem value="accepted">{TABLE_LABELS.statusAccepted}</SelectItem>
            <SelectItem value="in_progress">{TABLE_LABELS.statusInProgress}</SelectItem>
            <SelectItem value="completed">{TABLE_LABELS.statusCompleted}</SelectItem>
            <SelectItem value="cancelled">{TABLE_LABELS.statusCancelled}</SelectItem>
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
