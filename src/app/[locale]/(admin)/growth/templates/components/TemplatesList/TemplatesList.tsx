'use client';

import { Badge, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import type { CampaignChannel, TemplateRow } from '@/api/admin-growth-endpoints';
import { useListTemplatesQuery } from '@/api/store';
import { formatDate } from '@/lib/format.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import TemplateEditorModal from './components/TemplateEditorModal/TemplateEditorModal';
import {
  CHANNEL_FILTER_OPTIONS,
  CHANNEL_LABELS,
  COLUMN_LABELS,
  PAGE_SIZE,
  QUERY_KEYS,
  TEMPLATES_LABELS,
  TYPE_LABELS,
} from './config/constants';
import styles from './TemplatesList.styles';

const ALL = 'all';

export default function TemplatesList() {
  const query = useReportQuery(QUERY_KEYS.page);
  const page = query.getNumber(QUERY_KEYS.page, 1);
  const channelValue = query.get(QUERY_KEYS.channel) ?? ALL;

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(channelValue !== ALL ? { channel: channelValue as CampaignChannel } : {}),
    }),
    [page, channelValue],
  );
  const { data, isLoading, isFetching, isError } = useListTemplatesQuery(queryArgs);
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handlePageChange = useCallback(
    (next: number) => query.set({ [QUERY_KEYS.page]: next }),
    [query],
  );
  const handleChannel = useCallback(
    (next: string) =>
      query.set({ [QUERY_KEYS.channel]: next === ALL ? null : next, [QUERY_KEYS.page]: 1 }),
    [query],
  );

  const columns = useMemo<ColumnDef<TemplateRow>[]>(
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
        id: 'channel',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.channel}
          </Text>
        ),
        cell: ({ row }) => (
          <Badge variant="outline" size="sm">
            {CHANNEL_LABELS[row.original.channel]}
          </Badge>
        ),
      },
      {
        id: 'subject',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.subject}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted" className={styles.subject}>
            {row.original.subject}
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
          <Badge variant={row.original.transactional ? 'primary' : 'secondary'} size="sm">
            {row.original.transactional ? TYPE_LABELS.transactional : TYPE_LABELS.campaign}
          </Badge>
        ),
      },
      {
        id: 'updated',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.updated}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDate(row.original.updatedAt)}
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
        cell: ({ row }) => <TemplateEditorModal template={row.original} />,
      },
    ],
    [],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {TEMPLATES_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {TEMPLATES_LABELS.pageSub}
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
              label={TEMPLATES_LABELS.channelFilter}
              value={channelValue}
              onValueChange={handleChannel}
            >
              {CHANNEL_FILTER_OPTIONS.map((option) => (
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
        loadingMessage={TEMPLATES_LABELS.loading}
        errorMessage={TEMPLATES_LABELS.error}
        emptyMessage={TEMPLATES_LABELS.empty}
      />
    </div>
  );
}
