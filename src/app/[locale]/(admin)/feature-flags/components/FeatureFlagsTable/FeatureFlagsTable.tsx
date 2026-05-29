'use client';

import { type FeatureFlagKey, featureFlags } from '@lunaticwithaduck/feature-flags';
import { Button, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { RotateCcw } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import {
  useDeleteAdminFeatureFlagMutation,
  useGetFeatureFlagMapQuery,
  useUpsertAdminFeatureFlagMutation,
} from '@/api/store';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import {
  FEATURE_FLAGS_COLUMNS,
  FEATURE_FLAGS_LABELS,
  FEATURE_FLAGS_PAGE_SIZE,
} from './config/constants';
import styles from './FeatureFlagsTable.styles';

type FlagRow = {
  key: FeatureFlagKey;
  description: string;
  defaultValue: boolean;
};

export default function FeatureFlagsTable() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const { data: dbMap = {}, isLoading, isError } = useGetFeatureFlagMapQuery();
  const [upsert] = useUpsertAdminFeatureFlagMutation();
  const [deleteFlag] = useDeleteAdminFeatureFlagMutation();

  const handleSearch = useCallback((next: string) => {
    setSearchQuery(next);
    setPage(1);
  }, []);

  const allRows = useMemo<FlagRow[]>(() => {
    return (Object.keys(featureFlags) as FeatureFlagKey[]).map((key) => ({
      key,
      description: featureFlags[key].description,
      defaultValue: featureFlags[key].default,
    }));
  }, []);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (!query) return allRows;
    return allRows.filter(
      (row) =>
        row.key.toLowerCase().includes(query) ||
        row.description.toLowerCase().includes(query),
    );
  }, [allRows, searchQuery]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * FEATURE_FLAGS_PAGE_SIZE;
    return filteredRows.slice(start, start + FEATURE_FLAGS_PAGE_SIZE);
  }, [filteredRows, page]);

  const columns = useMemo<ColumnDef<FlagRow>[]>(
    () => [
      {
        id: 'key',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {FEATURE_FLAGS_COLUMNS.key}
          </Text>
        ),
        cell: ({ row }) => (
          <div className={styles.keyCell}>
            <Text as="span" size="sm" weight="medium">
              {row.original.key}
            </Text>
            <div className={styles.description}>
              <Text as="span" size="xs" color="muted">
                {row.original.description}
              </Text>
            </div>
          </div>
        ),
      },
      {
        id: 'default',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {FEATURE_FLAGS_COLUMNS.default}
          </Text>
        ),
        cell: ({ row }) => (
          <span
            className={row.original.defaultValue ? styles.indicatorOn : styles.indicatorOff}
          >
            <Text as="span" size="xs" weight="medium">
              {row.original.defaultValue ? FEATURE_FLAGS_LABELS.on : FEATURE_FLAGS_LABELS.off}
            </Text>
          </span>
        ),
      },
      {
        id: 'stored',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {FEATURE_FLAGS_COLUMNS.stored}
          </Text>
        ),
        cell: ({ row }) => {
          const stored = dbMap[row.original.key];
          if (stored === undefined) {
            return (
              <span className={styles.indicatorMuted}>
                <Text as="span" size="xs" weight="medium">
                  {FEATURE_FLAGS_LABELS.notSet}
                </Text>
              </span>
            );
          }
          return (
            <span className={stored ? styles.indicatorOn : styles.indicatorOff}>
              <Text as="span" size="xs" weight="medium">
                {stored ? FEATURE_FLAGS_LABELS.on : FEATURE_FLAGS_LABELS.off}
              </Text>
            </span>
          );
        },
      },
      {
        id: 'effective',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {FEATURE_FLAGS_COLUMNS.effective}
          </Text>
        ),
        cell: ({ row }) => {
          const stored = dbMap[row.original.key];
          const effective = stored !== undefined ? stored : row.original.defaultValue;
          const isOverridden = stored !== undefined;
          return (
            <div className={styles.effectiveCell}>
              <span className={effective ? styles.indicatorOn : styles.indicatorOff}>
                <Text as="span" size="xs" weight="medium">
                  {effective ? FEATURE_FLAGS_LABELS.on : FEATURE_FLAGS_LABELS.off}
                </Text>
              </span>
              {isOverridden && (
                <span className={styles.overrideBadge}>
                  <Text as="span" size="xs" weight="medium">
                    {FEATURE_FLAGS_LABELS.dbBadge}
                  </Text>
                </span>
              )}
            </div>
          );
        },
      },
      {
        id: 'toggle',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {FEATURE_FLAGS_COLUMNS.toggle}
          </Text>
        ),
        cell: ({ row }) => {
          const stored = dbMap[row.original.key];
          const effective = stored !== undefined ? stored : row.original.defaultValue;
          return (
            <div className={styles.toggleCell}>
              <Button
                variant={effective ? 'primary' : 'outline'}
                size="sm"
                onClick={() => void upsert({ key: row.original.key, value: !effective })}
              >
                <Text as="span" size="sm" weight="medium">
                  {effective ? FEATURE_FLAGS_LABELS.disable : FEATURE_FLAGS_LABELS.enable}
                </Text>
              </Button>
            </div>
          );
        },
      },
      {
        id: 'reset',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {FEATURE_FLAGS_COLUMNS.reset}
          </Text>
        ),
        cell: ({ row }) => {
          const isOverridden = dbMap[row.original.key] !== undefined;
          return (
            <div className={styles.resetCell}>
              <Button
                variant="ghost"
                size="sm"
                disabled={!isOverridden}
                onClick={() => void deleteFlag(row.original.key)}
              >
                <RotateCcw size={14} />
                <Text as="span" size="sm" weight="medium">
                  {FEATURE_FLAGS_LABELS.reset}
                </Text>
              </Button>
            </div>
          );
        },
      },
    ],
    [dbMap, upsert, deleteFlag],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {FEATURE_FLAGS_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {FEATURE_FLAGS_LABELS.pageSub}
        </Text>
      </header>
      <DataTable
        data={pagedRows}
        columns={columns}
        total={filteredRows.length}
        page={page}
        pageSize={FEATURE_FLAGS_PAGE_SIZE}
        onPageChange={setPage}
        onSearch={handleSearch}
        searchPlaceholder={FEATURE_FLAGS_LABELS.searchPlaceholder}
        isLoading={isLoading}
        isError={isError}
        emptyMessage={FEATURE_FLAGS_LABELS.empty}
        loadingMessage={FEATURE_FLAGS_LABELS.loading}
        errorMessage={FEATURE_FLAGS_LABELS.error}
      />
    </div>
  );
}
