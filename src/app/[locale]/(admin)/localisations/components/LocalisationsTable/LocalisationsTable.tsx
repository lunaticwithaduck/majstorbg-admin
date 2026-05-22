'use client';

import { Button, Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { Copy } from 'lucide-react';
import { useCallback, useMemo, useState } from 'react';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import {
  LOCALISATIONS_COLUMNS,
  LOCALISATIONS_LABELS,
  LOCALISATIONS_PAGE_SIZE,
  STATUS_FILTER_LABELS,
  STATUS_FILTER_VALUES,
  type StatusFilter,
} from './config/constants';
import styles from './LocalisationsTable.styles';

export type LocalisationStatus = 'complete' | 'missing-bg' | 'missing-en' | 'placeholder';

export type LocalisationRow = {
  key: string;
  en: string;
  bg: string;
  status: LocalisationStatus;
};

type LocalisationsTableProps = {
  rows: LocalisationRow[];
};

function statusBadgeClass(status: LocalisationStatus): string {
  switch (status) {
    case 'complete':
      return styles.badgeComplete;
    case 'missing-bg':
      return styles.badgeMissingBg;
    case 'missing-en':
      return styles.badgeMissingEn;
    case 'placeholder':
      return styles.badgePlaceholder;
  }
}

function statusBadgeLabel(status: LocalisationStatus): string {
  switch (status) {
    case 'complete':
      return LOCALISATIONS_LABELS.statusComplete;
    case 'missing-bg':
      return LOCALISATIONS_LABELS.statusMissingBg;
    case 'missing-en':
      return LOCALISATIONS_LABELS.statusMissingEn;
    case 'placeholder':
      return LOCALISATIONS_LABELS.statusPlaceholder;
  }
}

export default function LocalisationsTable({ rows }: LocalisationsTableProps) {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [copied, setCopied] = useState(false);

  const handleSearch = useCallback((next: string) => {
    setSearchQuery(next);
    setPage(1);
  }, []);

  const handleStatusChange = useCallback((value: string) => {
    if ((STATUS_FILTER_VALUES as readonly string[]).includes(value)) {
      setStatusFilter(value as StatusFilter);
      setPage(1);
    }
  }, []);

  const filteredRows = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    return rows.filter((row) => {
      if (statusFilter !== 'all' && row.status !== statusFilter) return false;
      if (query.length === 0) return true;
      return (
        row.key.toLowerCase().includes(query) ||
        row.en.toLowerCase().includes(query) ||
        row.bg.toLowerCase().includes(query)
      );
    });
  }, [rows, searchQuery, statusFilter]);

  const pagedRows = useMemo(() => {
    const start = (page - 1) * LOCALISATIONS_PAGE_SIZE;
    return filteredRows.slice(start, start + LOCALISATIONS_PAGE_SIZE);
  }, [filteredRows, page]);

  const handleCopyMissing = useCallback(() => {
    const missing = rows
      .filter((row) => row.status === 'missing-bg' || row.status === 'missing-en')
      .map((row) => ({ key: row.key, en: row.en, bg: row.bg, status: row.status }));
    const json = JSON.stringify(missing, null, 2);
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      void navigator.clipboard.writeText(json).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 1500);
      });
    }
  }, [rows]);

  const columns = useMemo<ColumnDef<LocalisationRow>[]>(
    () => [
      {
        id: 'key',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {LOCALISATIONS_COLUMNS.key}
          </Text>
        ),
        cell: ({ row }) => <span className={styles.keyCell}>{row.original.key}</span>,
      },
      {
        id: 'en',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {LOCALISATIONS_COLUMNS.en}
          </Text>
        ),
        cell: ({ row }) => {
          const value = row.original.en;
          if (value.length === 0) {
            return (
              <span className={styles.valueMuted}>{LOCALISATIONS_LABELS.missingValue}</span>
            );
          }
          return <span className={styles.valueCell}>{value}</span>;
        },
      },
      {
        id: 'bg',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {LOCALISATIONS_COLUMNS.bg}
          </Text>
        ),
        cell: ({ row }) => {
          const value = row.original.bg;
          if (value.length === 0) {
            return (
              <span className={styles.valueMuted}>{LOCALISATIONS_LABELS.missingValue}</span>
            );
          }
          return <span className={styles.valueCell}>{value}</span>;
        },
      },
      {
        id: 'status',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {LOCALISATIONS_COLUMNS.status}
          </Text>
        ),
        cell: ({ row }) => (
          <span className={statusBadgeClass(row.original.status)}>
            <Text as="span" size="xs" weight="medium">
              {statusBadgeLabel(row.original.status)}
            </Text>
          </span>
        ),
      },
    ],
    [],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {LOCALISATIONS_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {LOCALISATIONS_LABELS.pageSub}
        </Text>
      </header>
      <DataTable
        data={pagedRows}
        columns={columns}
        total={filteredRows.length}
        page={page}
        pageSize={LOCALISATIONS_PAGE_SIZE}
        onPageChange={setPage}
        onSearch={handleSearch}
        searchPlaceholder={LOCALISATIONS_LABELS.searchPlaceholder}
        filters={
          <Select
            label={LOCALISATIONS_LABELS.statusFilterLabel}
            value={statusFilter}
            onValueChange={handleStatusChange}
            size="sm"
          >
            {STATUS_FILTER_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {STATUS_FILTER_LABELS[value]}
              </SelectItem>
            ))}
          </Select>
        }
        actions={
          <Button variant="outline" size="sm" onClick={handleCopyMissing}>
            <Copy size={14} />
            <Text as="span" size="sm" weight="medium">
              {copied ? LOCALISATIONS_LABELS.copyMissingCopied : LOCALISATIONS_LABELS.copyMissing}
            </Text>
          </Button>
        }
        emptyMessage={LOCALISATIONS_LABELS.empty}
        loadingMessage={LOCALISATIONS_LABELS.loading}
      />
    </div>
  );
}
