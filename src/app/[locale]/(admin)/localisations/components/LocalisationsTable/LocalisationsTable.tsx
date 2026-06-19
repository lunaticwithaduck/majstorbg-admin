'use client';

import { Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { TranslationRow } from '@/api/admin-translation-endpoints';
import {
  useBulkUpsertAdminTranslationsMutation,
  useListAdminTranslationsQuery,
  useUpdateAdminTranslationMutation,
} from '@/api/store';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import {
  COLUMNS,
  LABELS,
  LOCALE_FILTER_LABELS,
  LOCALE_FILTER_VALUES,
  PAGE_SIZE,
  type LocaleFilter,
} from './config/constants';
import styles from './LocalisationsTable.styles';
import { parseTranslationsImport } from './utils/parseTranslationsImport.utils';

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

type InlineCellProps = {
  row: TranslationRow;
};

function InlineValueCell({ row }: InlineCellProps) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(row.value);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [update, { isLoading }] = useUpdateAdminTranslationMutation();

  const startEdit = useCallback(() => {
    setDraft(row.value);
    setEditing(true);
    setTimeout(() => textareaRef.current?.focus(), 0);
  }, [row.value]);

  const cancel = useCallback(() => {
    setDraft(row.value);
    setEditing(false);
  }, [row.value]);

  const save = useCallback(async () => {
    if (draft === row.value) {
      setEditing(false);
      return;
    }
    try {
      await update({ id: row.id, value: draft }).unwrap();
      setEditing(false);
    } catch {
      // leave editing open so user can retry
    }
  }, [draft, row.id, row.value, update]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === 'Escape') cancel();
    },
    [cancel],
  );

  if (editing) {
    return (
      <div className={styles.editCell}>
        <textarea
          ref={textareaRef}
          className={styles.textarea}
          value={draft}
          rows={3}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={isLoading}
        />
        <div className={styles.editActions}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => void save()}
            disabled={isLoading}
          >
            {LABELS.save}
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={cancel}
            disabled={isLoading}
          >
            {LABELS.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-start gap-2">
      {row.value.length === 0 ? (
        <span className={styles.valueMuted}>{LABELS.missingValue}</span>
      ) : (
        <span className={styles.valueCell}>{row.value}</span>
      )}
      <button
        type="button"
        className={styles.editIconBtn}
        onClick={startEdit}
        title={LABELS.edit}
      >
        ✎
      </button>
    </div>
  );
}

function flattenNested(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'string') {
      out[path] = val;
    } else if (val !== null && typeof val === 'object') {
      Object.assign(out, flattenNested(val as Record<string, unknown>, path));
    }
  }
  return out;
}

export default function LocalisationsTable() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');
  const [localeFilter, setLocaleFilter] = useState<LocaleFilter>('en');
  const [importStatus, setImportStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [importMessage, setImportMessage] = useState('');
  const importInputRef = useRef<HTMLInputElement>(null);

  const [bulkUpsert] = useBulkUpsertAdminTranslationsMutation();

  const handleSearch = useCallback((next: string) => {
    setSearchQuery(next);
    setPage(1);
  }, []);

  const handleLocaleChange = useCallback((value: string) => {
    if ((LOCALE_FILTER_VALUES as readonly string[]).includes(value)) {
      setLocaleFilter(value as LocaleFilter);
      setPage(1);
    }
  }, []);

  const handleExport = useCallback(async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? '';
    const res = await fetch(`${apiUrl}/translations/${localeFilter}`);
    const nested = (await res.json()) as Record<string, unknown>;
    const flat = flattenNested(nested);
    const blob = new Blob([JSON.stringify(flat, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `translations-${localeFilter}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [localeFilter]);

  const handleImportFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (!file) return;
      e.target.value = '';
      setImportStatus('loading');
      setImportMessage('');
      try {
        const text = await file.text();
        const { items, error } = parseTranslationsImport(file.name, text, localeFilter);
        if (error) {
          setImportStatus('error');
          setImportMessage(
            error.code === 'csvHeader'
              ? LABELS.importErrorCsvHeader
              : error.code === 'noKeys'
                ? LABELS.importErrorNoKeys
                : error.code === 'badLocale'
                  ? LABELS.importErrorBadLocale(error.locale ?? '')
                  : LABELS.importErrorParse,
          );
          return;
        }
        const BATCH = 500;
        let total = 0;
        for (let i = 0; i < items.length; i += BATCH) {
          const res = await bulkUpsert({ items: items.slice(i, i + BATCH) }).unwrap();
          total += res.count;
        }
        setImportStatus('success');
        setImportMessage(LABELS.importSuccess(total));
      } catch {
        setImportStatus('error');
        setImportMessage(LABELS.importError);
      }
    },
    [bulkUpsert, localeFilter],
  );

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      locale: localeFilter,
      ...(searchQuery.trim().length > 0 ? { search: searchQuery.trim() } : {}),
    }),
    [page, localeFilter, searchQuery],
  );

  const { data, isLoading, isFetching, isError } = useListAdminTranslationsQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo<ColumnDef<TranslationRow>[]>(
    () => [
      {
        id: 'locale',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMNS.locale}
          </Text>
        ),
        cell: ({ row }) => (
          <span
            className={
              row.original.locale === 'en' ? styles.badgeEn : styles.badgeBg
            }
          >
            <Text as="span" size="xs" weight="medium">
              {row.original.locale === 'en' ? LABELS.localeBadgeEn : LABELS.localeBadgeBg}
            </Text>
          </span>
        ),
      },
      {
        id: 'key',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMNS.key}
          </Text>
        ),
        cell: ({ row }) => <span className={styles.keyCell}>{row.original.key}</span>,
      },
      {
        id: 'value',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMNS.value}
          </Text>
        ),
        cell: ({ row }) => <InlineValueCell row={row.original} />,
      },
      {
        id: 'updatedAt',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMNS.updatedAt}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDate(row.original.updatedAt)}
          </Text>
        ),
      },
    ],
    [],
  );

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {LABELS.pageSub}
        </Text>
      </header>
      <input
        ref={importInputRef}
        type="file"
        accept="application/json,.json,text/csv,.csv"
        className="hidden"
        onChange={handleImportFile}
      />
      {importMessage && (
        <p className={importStatus === 'error' ? 'text-sm text-destructive' : 'text-sm text-muted'}>
          {importMessage}
        </p>
      )}
      <DataTable
        data={items}
        columns={columns}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onSearch={handleSearch}
        searchPlaceholder={LABELS.searchPlaceholder}
        filters={
          <Select
            label={LABELS.localeFilterLabel}
            value={localeFilter}
            onValueChange={handleLocaleChange}
            size="sm"
          >
            {LOCALE_FILTER_VALUES.map((value) => (
              <SelectItem key={value} value={value}>
                {LOCALE_FILTER_LABELS[value]}
              </SelectItem>
            ))}
          </Select>
        }
        actions={
          <div className="flex gap-2">
            <button
              type="button"
              className={styles.actionBtn}
              onClick={handleExport}
            >
              {LABELS.exportJson}
            </button>
            <button
              type="button"
              className={styles.actionBtnPrimary}
              disabled={importStatus === 'loading'}
              onClick={() => importInputRef.current?.click()}
            >
              {importStatus === 'loading' ? LABELS.importing : LABELS.importJson}
            </button>
          </div>
        }
        isLoading={isLoading}
        isFetching={isFetching}
        isError={isError}
        loadingMessage={LABELS.loading}
        errorMessage={LABELS.error}
        emptyMessage={LABELS.empty}
      />
    </div>
  );
}
