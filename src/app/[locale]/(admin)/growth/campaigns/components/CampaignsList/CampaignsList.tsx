'use client';

import { Badge, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import type { CampaignChannel, CampaignRow, CampaignStatus } from '@/api/admin-growth-endpoints';
import { useListCampaignsQuery } from '@/api/store';
import { formatDateTime } from '@/lib/format.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import styles from './CampaignsList.styles';
import CreateCampaignModal from './components/CreateCampaignModal/CreateCampaignModal';
import SendCampaignButton from './components/SendCampaignButton/SendCampaignButton';
import {
  CAMPAIGNS_LABELS,
  CHANNEL_FILTER_OPTIONS,
  CHANNEL_LABELS,
  COLUMN_LABELS,
  PAGE_SIZE,
  QUERY_KEYS,
  SEGMENT_ACTIVITY_LABELS,
  SEGMENT_ROLE_LABELS,
  STATUS_BADGE,
  STATUS_FILTER_OPTIONS,
  STATUS_LABELS,
} from './config/constants';

const ALL = 'all';

export default function CampaignsList() {
  const query = useReportQuery(QUERY_KEYS.page);
  const page = query.getNumber(QUERY_KEYS.page, 1);
  const channelValue = query.get(QUERY_KEYS.channel) ?? ALL;
  const statusValue = query.get(QUERY_KEYS.status) ?? ALL;

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(channelValue !== ALL ? { channel: channelValue as CampaignChannel } : {}),
      ...(statusValue !== ALL ? { status: statusValue as CampaignStatus } : {}),
    }),
    [page, channelValue, statusValue],
  );
  const { data, isLoading, isFetching, isError } = useListCampaignsQuery(queryArgs);
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
  const handleStatus = useCallback(
    (next: string) =>
      query.set({ [QUERY_KEYS.status]: next === ALL ? null : next, [QUERY_KEYS.page]: 1 }),
    [query],
  );

  const columns = useMemo<ColumnDef<CampaignRow>[]>(
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
        id: 'segment',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.segment}
          </Text>
        ),
        cell: ({ row }) => {
          const segment = row.original.segment;
          const parts = [SEGMENT_ROLE_LABELS[segment.role] ?? segment.role];
          if (segment.city) parts.push(segment.city);
          parts.push(SEGMENT_ACTIVITY_LABELS[segment.activity] ?? segment.activity);
          const summary = parts.join(' · ');
          return (
            <Text as="span" size="sm" color="muted">
              {summary}
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
        id: 'schedule',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.schedule}
          </Text>
        ),
        cell: ({ row }) => {
          const scheduledText = row.original.scheduleAt
            ? formatDateTime(row.original.scheduleAt)
            : CAMPAIGNS_LABELS.noStats;
          return (
            <Text as="span" size="sm" color="muted">
              {scheduledText}
            </Text>
          );
        },
      },
      {
        id: 'delivery',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.delivery}
          </Text>
        ),
        cell: ({ row }) => {
          const stats = row.original.stats;
          const delivery = stats
            ? `${stats.delivered}/${stats.recipients}`
            : CAMPAIGNS_LABELS.noStats;
          return (
            <Text as="span" size="sm">
              {delivery}
            </Text>
          );
        },
      },
      {
        id: 'actions',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.actions}
          </Text>
        ),
        cell: ({ row }) => <SendCampaignButton campaign={row.original} />,
      },
    ],
    [],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {CAMPAIGNS_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {CAMPAIGNS_LABELS.pageSub}
        </Text>
      </header>

      <DataTable
        data={items}
        columns={columns}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        actions={<CreateCampaignModal />}
        filters={
          <div className={styles.filters}>
            <Select
              label={CAMPAIGNS_LABELS.channelFilter}
              value={channelValue}
              onValueChange={handleChannel}
            >
              {CHANNEL_FILTER_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </Select>
            <Select
              label={CAMPAIGNS_LABELS.statusFilter}
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
        loadingMessage={CAMPAIGNS_LABELS.loading}
        errorMessage={CAMPAIGNS_LABELS.error}
        emptyMessage={CAMPAIGNS_LABELS.empty}
      />
    </div>
  );
}
