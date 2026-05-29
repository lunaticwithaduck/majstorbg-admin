'use client';

import { Text } from '@lunaticwithaduck/webui';
import type { ColumnDef } from '@tanstack/react-table';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { CategoryRow } from '@/api/admin-category-endpoints';
import {
  useCreateAdminSkillCategoryMutation,
  useDeleteAdminSkillCategoryMutation,
  useListAdminSkillCategoriesQuery,
  useUpdateAdminSkillCategoryMutation,
} from '@/api/store';
import DataTable from '@/ui/components/composed/DataTable/DataTable';
import { COLUMNS, LABELS, PAGE_SIZE } from './config/constants';
import styles from './SkillCategoriesTable.styles';

type InlineEditCellProps = {
  row: CategoryRow;
};

function InlineEditCell({ row }: InlineEditCellProps) {
  const [editing, setEditing] = useState(false);
  const [draftNameEn, setDraftNameEn] = useState(row.nameEn);
  const [draftNameBg, setDraftNameBg] = useState(row.nameBg);
  const [draftSortOrder, setDraftSortOrder] = useState(String(row.sortOrder));
  const [deleteError, setDeleteError] = useState('');
  const firstInputRef = useRef<HTMLInputElement>(null);

  const [update, { isLoading: isUpdating }] = useUpdateAdminSkillCategoryMutation();
  const [deleteCategory, { isLoading: isDeleting }] = useDeleteAdminSkillCategoryMutation();

  const startEdit = useCallback(() => {
    setDraftNameEn(row.nameEn);
    setDraftNameBg(row.nameBg);
    setDraftSortOrder(String(row.sortOrder));
    setEditing(true);
    setDeleteError('');
    setTimeout(() => firstInputRef.current?.focus(), 0);
  }, [row.nameEn, row.nameBg, row.sortOrder]);

  const cancel = useCallback(() => {
    setEditing(false);
    setDeleteError('');
  }, []);

  const save = useCallback(async () => {
    const parsedOrder = parseInt(draftSortOrder, 10);
    try {
      await update({
        id: row.id,
        nameEn: draftNameEn,
        nameBg: draftNameBg,
        sortOrder: isNaN(parsedOrder) ? row.sortOrder : parsedOrder,
      }).unwrap();
      setEditing(false);
    } catch {
      // leave editing open so user can retry
    }
  }, [draftNameEn, draftNameBg, draftSortOrder, row.id, row.sortOrder, update]);

  const handleDelete = useCallback(async () => {
    setDeleteError('');
    try {
      await deleteCategory(row.id).unwrap();
    } catch (err: unknown) {
      const status =
        err !== null &&
        typeof err === 'object' &&
        'status' in err
          ? (err as { status: number }).status
          : undefined;
      if (status === 400) {
        setDeleteError(LABELS.deleteError);
      } else {
        setDeleteError(LABELS.deleteGenericError);
      }
    }
  }, [deleteCategory, row.id]);

  if (editing) {
    return (
      <div className={styles.editCell}>
        <input
          ref={firstInputRef}
          className={styles.editInput}
          value={draftNameEn}
          placeholder="English"
          onChange={(e) => setDraftNameEn(e.target.value)}
          disabled={isUpdating}
        />
        <input
          className={styles.editInput}
          value={draftNameBg}
          placeholder="Bulgarian"
          onChange={(e) => setDraftNameBg(e.target.value)}
          disabled={isUpdating}
        />
        <input
          className={styles.editInputSm}
          value={draftSortOrder}
          placeholder="Order"
          type="number"
          onChange={(e) => setDraftSortOrder(e.target.value)}
          disabled={isUpdating}
        />
        <div className={styles.editActions}>
          <button
            type="button"
            className={styles.editBtn}
            onClick={() => void save()}
            disabled={isUpdating}
          >
            {LABELS.save}
          </button>
          <button
            type="button"
            className={styles.cancelBtn}
            onClick={cancel}
            disabled={isUpdating}
          >
            {LABELS.cancel}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1">
      <div className={styles.actionsCell}>
        <button
          type="button"
          className={styles.editIconBtn}
          onClick={startEdit}
          title={LABELS.edit}
        >
          ✎
        </button>
        <button
          type="button"
          className={styles.deleteBtn}
          onClick={() => void handleDelete()}
          disabled={isDeleting}
          title={LABELS.delete}
        >
          ✕
        </button>
      </div>
      {deleteError && <p className={styles.deleteError}>{deleteError}</p>}
    </div>
  );
}

type NewCategoryFormProps = {
  onAdded: () => void;
};

function NewCategoryForm({ onAdded }: NewCategoryFormProps) {
  const [id, setId] = useState('');
  const [nameEn, setNameEn] = useState('');
  const [nameBg, setNameBg] = useState('');
  const [sortOrder, setSortOrder] = useState('0');
  const [error, setError] = useState('');

  const [create, { isLoading }] = useCreateAdminSkillCategoryMutation();

  const handleAdd = useCallback(async () => {
    setError('');
    const parsedOrder = parseInt(sortOrder, 10);
    try {
      await create({
        id: id.trim(),
        nameEn: nameEn.trim(),
        nameBg: nameBg.trim(),
        sortOrder: isNaN(parsedOrder) ? 0 : parsedOrder,
      }).unwrap();
      setId('');
      setNameEn('');
      setNameBg('');
      setSortOrder('0');
      onAdded();
    } catch (err: unknown) {
      const status =
        err !== null &&
        typeof err === 'object' &&
        'status' in err
          ? (err as { status: number }).status
          : undefined;
      setError(
        status === 400
          ? 'Invalid data. Check the fields and try again.'
          : 'Failed to add category. Try again.',
      );
    }
  }, [create, id, nameEn, nameBg, sortOrder, onAdded]);

  return (
    <div className={styles.newCategorySection}>
      <div className={styles.newCategoryHeading}>
        <Text as="h2" size="sm" weight="semibold">
          {LABELS.newCategoryHeading}
        </Text>
      </div>
      <div className={styles.newCategoryForm}>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>ID</label>
          <input
            className={styles.input}
            value={id}
            placeholder="e.g. plumbing"
            onChange={(e) => setId(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{COLUMNS.nameEn}</label>
          <input
            className={styles.input}
            value={nameEn}
            placeholder="English name"
            onChange={(e) => setNameEn(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{COLUMNS.nameBg}</label>
          <input
            className={styles.input}
            value={nameBg}
            placeholder="Bulgarian name"
            onChange={(e) => setNameBg(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <div className={styles.fieldGroup}>
          <label className={styles.label}>{COLUMNS.sortOrder}</label>
          <input
            className={styles.inputSm}
            value={sortOrder}
            type="number"
            onChange={(e) => setSortOrder(e.target.value)}
            disabled={isLoading}
          />
        </div>
        <button
          type="button"
          className={styles.addBtn}
          onClick={() => void handleAdd()}
          disabled={isLoading || !id.trim() || !nameEn.trim() || !nameBg.trim()}
        >
          {isLoading ? LABELS.adding : LABELS.add}
        </button>
      </div>
      {error && <p className={styles.addError}>{error}</p>}
    </div>
  );
}

export default function SkillCategoriesTable() {
  const [page, setPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = useCallback((next: string) => {
    setSearchQuery(next);
    setPage(1);
  }, []);

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(searchQuery.trim().length > 0 ? { search: searchQuery.trim() } : {}),
    }),
    [page, searchQuery],
  );

  const { data, isLoading, isFetching, isError } = useListAdminSkillCategoriesQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;

  const columns = useMemo<ColumnDef<CategoryRow>[]>(
    () => [
      {
        id: 'id',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMNS.id}
          </Text>
        ),
        cell: ({ row }) => (
          <span className={styles.idCell}>{row.original.id}</span>
        ),
      },
      {
        id: 'nameEn',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMNS.nameEn}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {row.original.nameEn}
          </Text>
        ),
      },
      {
        id: 'nameBg',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMNS.nameBg}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm">
            {row.original.nameBg}
          </Text>
        ),
      },
      {
        id: 'sortOrder',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMNS.sortOrder}
          </Text>
        ),
        cell: ({ row }) => (
          <span className={styles.sortOrderCell}>{row.original.sortOrder}</span>
        ),
      },
      {
        id: 'actions',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMNS.actions}
          </Text>
        ),
        cell: ({ row }) => <InlineEditCell row={row.original} />,
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
      <NewCategoryForm onAdded={() => setPage(1)} />
      <DataTable
        data={items}
        columns={columns}
        total={total}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onSearch={handleSearch}
        searchPlaceholder={LABELS.searchPlaceholder}
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
