'use client';

import { Badge, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { Star } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import type { ReviewRow, ReviewStatus } from '@/api/admin-reviews-endpoints';
import { useListReviewsQuery } from '@/api/store';
import { EMPTY_VALUE, formatDate } from '@/lib/format.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import ReviewActions from './components/ReviewActions/ReviewActions';
import RingCheckPanel from './components/RingCheckPanel/RingCheckPanel';
import {
  COLUMN_LABELS,
  PAGE_SIZE,
  QUERY_KEYS,
  REVIEWS_LABELS,
  STATUS_BADGE,
  STATUS_FILTER_OPTIONS,
  STATUS_LABELS,
} from './config/constants';
import styles from './ReviewsQueue.styles';

const ALL = 'all';

export default function ReviewsQueue() {
  const query = useReportQuery(QUERY_KEYS.page);
  const page = query.getNumber(QUERY_KEYS.page, 1);
  const statusValue = query.get(QUERY_KEYS.status) ?? ALL;
  const search = query.get(QUERY_KEYS.search) ?? '';

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(statusValue !== ALL ? { status: statusValue as ReviewStatus } : {}),
      ...(search.trim().length > 0 ? { search: search.trim() } : {}),
    }),
    [page, statusValue, search],
  );
  const { data, isLoading, isFetching, isError } = useListReviewsQuery(queryArgs);
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

  const columns = useMemo<ColumnDef<ReviewRow>[]>(
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
        id: 'reviewer',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.reviewer}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {row.original.reviewerName}
          </Text>
        ),
      },
      {
        id: 'rating',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.rating}
          </Text>
        ),
        cell: ({ row }) => (
          <div className={styles.ratingCell}>
            <Star size={14} />
            <Text as="span" size="sm" weight="medium">
              {row.original.rating.toFixed(1)}
            </Text>
          </div>
        ),
      },
      {
        id: 'body',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.body}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted" className={styles.body}>
            {row.original.body}
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
            {formatDate(row.original.createdAt) || EMPTY_VALUE}
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
        cell: ({ row }) => <ReviewActions review={row.original} />,
      },
    ],
    [],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {REVIEWS_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {REVIEWS_LABELS.pageSub}
        </Text>
      </header>

      <RingCheckPanel />

      <DataTable
        data={items}
        columns={columns}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        onSearch={handleSearch}
        searchPlaceholder={REVIEWS_LABELS.searchPlaceholder}
        filters={
          <div className={styles.filters}>
            <Select
              label={REVIEWS_LABELS.statusFilter}
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
        loadingMessage={REVIEWS_LABELS.loading}
        errorMessage={REVIEWS_LABELS.error}
        emptyMessage={REVIEWS_LABELS.empty}
      />
    </div>
  );
}
