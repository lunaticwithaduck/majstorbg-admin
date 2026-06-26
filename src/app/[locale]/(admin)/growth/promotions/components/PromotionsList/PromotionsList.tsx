'use client';

import { Badge, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import type { Promotion, PromotionStatus, PromotionType } from '@/api/admin-promotions-endpoints';
import { useListPromotionsQuery } from '@/api/store';
import { formatDate, formatEur } from '@/lib/format.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import DeletePromotionButton from './components/DeletePromotionButton/DeletePromotionButton';
import PromotionFormModal from './components/PromotionFormModal/PromotionFormModal';
import RedemptionsModal from './components/RedemptionsModal/RedemptionsModal';
import {
  COLUMN_LABELS,
  PAGE_SIZE,
  PROMOTIONS_LABELS,
  QUERY_KEYS,
  STATUS_BADGE,
  STATUS_FILTER_OPTIONS,
  STATUS_LABELS,
  TYPE_FILTER_OPTIONS,
  TYPE_LABELS,
} from './config/constants';
import styles from './PromotionsList.styles';

const ALL = 'all';

export default function PromotionsList() {
  const query = useReportQuery(QUERY_KEYS.page);
  const page = query.getNumber(QUERY_KEYS.page, 1);
  const typeValue = query.get(QUERY_KEYS.type) ?? ALL;
  const statusValue = query.get(QUERY_KEYS.status) ?? ALL;

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(typeValue !== ALL ? { type: typeValue as PromotionType } : {}),
      ...(statusValue !== ALL ? { status: statusValue as PromotionStatus } : {}),
    }),
    [page, typeValue, statusValue],
  );
  const { data, isLoading, isFetching, isError } = useListPromotionsQuery(queryArgs);
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

  const columns = useMemo<ColumnDef<Promotion>[]>(
    () => [
      {
        id: 'code',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.code}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" weight="medium">
            {row.original.code}
          </Text>
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
        id: 'discount',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.discount}
          </Text>
        ),
        cell: ({ row }) => {
          const discount =
            row.original.discountType === 'fixed'
              ? formatEur(row.original.value)
              : `${row.original.value}%`;
          return (
            <Text as="span" size="sm" weight="medium">
              {discount}
            </Text>
          );
        },
      },
      {
        id: 'validity',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.validity}
          </Text>
        ),
        cell: ({ row }) => {
          const validity = `${formatDate(row.original.validFrom)}${PROMOTIONS_LABELS.rangeSeparator}${formatDate(row.original.validTo)}`;
          return (
            <Text as="span" size="sm" color="muted">
              {validity}
            </Text>
          );
        },
      },
      {
        id: 'usage',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.usage}
          </Text>
        ),
        cell: ({ row }) => {
          const cap = row.original.maxRedemptions ?? PROMOTIONS_LABELS.unlimited;
          const usage = `${row.original.usageCount}/${cap}`;
          return (
            <Text as="span" size="sm">
              {usage}
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
        id: 'actions',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.actions}
          </Text>
        ),
        cell: ({ row }) => (
          <div className={styles.actionsCell}>
            <RedemptionsModal promotion={row.original} />
            <PromotionFormModal promotion={row.original} />
            <DeletePromotionButton promotion={row.original} />
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
          {PROMOTIONS_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {PROMOTIONS_LABELS.pageSub}
        </Text>
      </header>

      <DataTable
        data={items}
        columns={columns}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        actions={<PromotionFormModal />}
        filters={
          <div className={styles.filters}>
            <Select
              label={PROMOTIONS_LABELS.typeFilter}
              value={typeValue}
              onValueChange={handleType}
            >
              {TYPE_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              label={PROMOTIONS_LABELS.statusFilter}
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
        loadingMessage={PROMOTIONS_LABELS.loading}
        errorMessage={PROMOTIONS_LABELS.error}
        emptyMessage={PROMOTIONS_LABELS.empty}
      />
    </div>
  );
}
