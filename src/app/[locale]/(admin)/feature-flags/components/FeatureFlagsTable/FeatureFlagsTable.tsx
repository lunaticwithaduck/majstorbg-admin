'use client';

import { type FeatureFlagKey, featureFlags } from '@lunaticwithaduck/feature-flags';
import { Banner, Button, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { RotateCcw } from 'lucide-react';
import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from 'react';
import {
  clearFlagOverride,
  type FlagEnvSnapshot,
  getFlagOverride,
  resolveFlag,
  setFlagEnvSnapshot,
  setFlagOverride,
} from '@/config/feature-flags';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import { FEATURE_FLAGS_COLUMNS, FEATURE_FLAGS_LABELS, FEATURE_FLAGS_PAGE_SIZE } from './config/constants';
import styles from './FeatureFlagsTable.styles';

type FeatureFlagsTableProps = {
  envSnapshot: FlagEnvSnapshot;
};

type FlagRow = {
  key: FeatureFlagKey;
  description: string;
  defaultValue: boolean;
  envValue: boolean | null;
};

// Subscribe to override changes so every row's `effective`, `override`, and the
// row-level controls stay in sync when one row is toggled.
const OVERRIDE_EVENT = 'majstor:flag-override-changed';
function subscribeOverrides(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onChange = () => callback();
  window.addEventListener(OVERRIDE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(OVERRIDE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}
// Returns an opaque tick that increments whenever any override changes. We use
// it to invalidate the column closures so cells re-read live override + effective values.
function useOverridesTick(): number {
  const [tick, setTick] = useState(0);
  const subscribe = useCallback((callback: () => void) => {
    return subscribeOverrides(() => {
      setTick((t) => t + 1);
      callback();
    });
  }, []);
  const getSnapshot = useCallback(() => tick, [tick]);
  const getServerSnapshot = useCallback(() => 0, []);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

export default function FeatureFlagsTable({ envSnapshot }: FeatureFlagsTableProps) {
  // Hydrate the module-level env snapshot so resolveFlag() picks env values
  // up across the whole app (not just on this page).
  useEffect(() => {
    setFlagEnvSnapshot(envSnapshot);
  }, [envSnapshot]);

  const tick = useOverridesTick();

  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((next: string) => {
    setSearchQuery(next);
    setPage(1);
  }, []);

  const allRows = useMemo<FlagRow[]>(() => {
    const keys = Object.keys(featureFlags) as FeatureFlagKey[];
    return keys.map((key) => {
      const def = featureFlags[key];
      const envValue = envSnapshot[key];
      return {
        key,
        description: def.description,
        defaultValue: def.default,
        envValue: envValue === undefined ? null : envValue,
      };
    });
  }, [envSnapshot]);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    if (query.length === 0) return allRows;
    return allRows.filter((row) => {
      return (
        row.key.toLowerCase().includes(query) || row.description.toLowerCase().includes(query)
      );
    });
  }, [allRows, searchQuery]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * FEATURE_FLAGS_PAGE_SIZE;
    return filteredRows.slice(start, start + FEATURE_FLAGS_PAGE_SIZE);
  }, [filteredRows, page]);

  const handleResetAll = useCallback(() => {
    for (const row of allRows) {
      clearFlagOverride(row.key);
    }
  }, [allRows]);

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
        id: 'env',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {FEATURE_FLAGS_COLUMNS.env}
          </Text>
        ),
        cell: ({ row }) => {
          const env = row.original.envValue;
          if (env === null) {
            return (
              <span className={styles.indicatorMuted}>
                <Text as="span" size="xs" weight="medium">
                  {FEATURE_FLAGS_LABELS.envUnset}
                </Text>
              </span>
            );
          }
          return (
            <span className={env ? styles.indicatorOn : styles.indicatorOff}>
              <Text as="span" size="xs" weight="medium">
                {env ? FEATURE_FLAGS_LABELS.on : FEATURE_FLAGS_LABELS.off}
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
          const effective = resolveFlag(row.original.key);
          const isOverridden = getFlagOverride(row.original.key) !== null;
          return (
            <div className={styles.effectiveCell}>
              <span className={effective ? styles.indicatorOn : styles.indicatorOff}>
                <Text as="span" size="xs" weight="medium">
                  {effective ? FEATURE_FLAGS_LABELS.on : FEATURE_FLAGS_LABELS.off}
                </Text>
              </span>
              {isOverridden ? (
                <span className={styles.overrideBadge}>
                  <Text as="span" size="xs" weight="medium">
                    {FEATURE_FLAGS_LABELS.overrideBadge}
                  </Text>
                </span>
              ) : null}
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
          const effective = resolveFlag(row.original.key);
          return (
            <div className={styles.toggleCell}>
              <Button
                variant={effective ? 'primary' : 'outline'}
                size="sm"
                onClick={() => setFlagOverride(row.original.key, !effective)}
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
          const isOverridden = getFlagOverride(row.original.key) !== null;
          return (
            <div className={styles.resetCell}>
              <Button
                variant="ghost"
                size="sm"
                disabled={!isOverridden}
                onClick={() => clearFlagOverride(row.original.key)}
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
    // `tick` is intentionally a dep so the columns re-render when an override
    // flips elsewhere — cells read live state from resolveFlag/getFlagOverride
    // rather than from the row model.
    [tick],
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
      <Banner variant="info">
        <div className={styles.banner}>
          <Text as="p" size="sm">
            {FEATURE_FLAGS_LABELS.bannerCopy}
          </Text>
        </div>
      </Banner>
      <DataTable
        data={pagedRows}
        columns={columns}
        total={filteredRows.length}
        page={page}
        pageSize={FEATURE_FLAGS_PAGE_SIZE}
        onPageChange={setPage}
        onSearch={handleSearch}
        searchPlaceholder={FEATURE_FLAGS_LABELS.searchPlaceholder}
        actions={
          <Button variant="outline" size="sm" onClick={handleResetAll}>
            <RotateCcw size={14} />
            <Text as="span" size="sm" weight="medium">
              {FEATURE_FLAGS_LABELS.resetAll}
            </Text>
          </Button>
        }
        emptyMessage={FEATURE_FLAGS_LABELS.empty}
        loadingMessage={FEATURE_FLAGS_LABELS.loading}
      />
    </div>
  );
}
