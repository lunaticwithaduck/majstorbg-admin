'use client';

import { Badge, Tabs, TabsList, TabsTrigger, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo } from 'react';
import type { ModerationReportRow, ReportTab } from '@/api/admin-moderation-endpoints';
import { useListReportsQuery } from '@/api/store';
import { formatDateTime } from '@/lib/format.utils';
import { useReportQuery } from '@/lib/report-query.utils';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import ModerationActionModal from './components/ModerationActionModal/ModerationActionModal';
import {
  COLUMN_LABELS,
  ENTITY_TYPE_LABELS,
  MODERATION_LABELS,
  PAGE_SIZE,
  QUERY_KEYS,
  REPORT_STATUS_BADGE,
  REPORT_STATUS_LABELS,
  TAB_OPTIONS,
} from './config/constants';
import styles from './ModerationQueue.styles';

function isTab(value: string | null): value is ReportTab {
  return value === 'user' || value === 'content' || value === 'review';
}

export default function ModerationQueue() {
  const query = useReportQuery(QUERY_KEYS.page);
  const page = query.getNumber(QUERY_KEYS.page, 1);
  const tabRaw = query.get(QUERY_KEYS.tab);
  const tab: ReportTab = isTab(tabRaw) ? tabRaw : 'user';

  const { data, isLoading, isFetching, isError } = useListReportsQuery({
    page,
    pageSize: PAGE_SIZE,
    type: tab,
  });
  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const handleTab = useCallback(
    (next: string) => query.set({ [QUERY_KEYS.tab]: next, [QUERY_KEYS.page]: 1 }),
    [query],
  );
  const handlePageChange = useCallback(
    (next: number) => query.set({ [QUERY_KEYS.page]: next }),
    [query],
  );

  const columns = useMemo<ColumnDef<ModerationReportRow>[]>(
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
            <Badge variant="outline" size="sm">
              {ENTITY_TYPE_LABELS[row.original.entityType]}
            </Badge>
            {row.original.excerpt ? (
              <Text as="span" size="sm" color="muted">
                {row.original.excerpt}
              </Text>
            ) : null}
          </div>
        ),
      },
      {
        id: 'reporter',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.reporter}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {row.original.reporterName}
          </Text>
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
          <Text as="span" size="sm">
            {row.original.reason}
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
          <Badge variant={REPORT_STATUS_BADGE[row.original.status]} size="sm">
            {REPORT_STATUS_LABELS[row.original.status]}
          </Badge>
        ),
      },
      {
        id: 'reportedAt',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.reportedAt}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDateTime(row.original.createdAt)}
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
        cell: ({ row }) => <ModerationActionModal report={row.original} />,
      },
    ],
    [],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {MODERATION_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {MODERATION_LABELS.pageSub}
        </Text>
      </header>

      <Tabs value={tab} onValueChange={handleTab}>
        <TabsList>
          {TAB_OPTIONS.map((option) => (
            <TabsTrigger key={option.value} value={option.value}>
              {option.label}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      <DataTable
        data={items}
        columns={columns}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={handlePageChange}
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        loadingMessage={MODERATION_LABELS.loading}
        errorMessage={MODERATION_LABELS.error}
        emptyMessage={MODERATION_LABELS.empty}
      />
    </div>
  );
}
