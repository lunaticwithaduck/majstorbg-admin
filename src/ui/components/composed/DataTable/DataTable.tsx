'use client';

import {
  Button,
  Input,
  Spinner,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Text,
} from '@lunaticwithaduck/webui';
import { type ColumnDef, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { Search } from 'lucide-react';
import {
  type ChangeEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';
import { DATA_TABLE_LABELS, SEARCH_DEBOUNCE_MS } from './config/constants';
import styles from './DataTable.styles';

type DataTableProps<T> = {
  data: T[];
  columns: ColumnDef<T>[];
  total: number;
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;

  // Search input is rendered (and debounced) by DataTable itself; the consumer
  // only needs to know when the *debounced* value changes. Omit to hide search.
  onSearch?: (query: string) => void;
  searchPlaceholder?: string;

  // Toolbar slots — render whatever filter / action UI fits the resource.
  filters?: ReactNode;
  actions?: ReactNode;

  isLoading?: boolean;
  isFetching?: boolean;
  isError?: boolean;
  emptyMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
};

export default function DataTable<T>({
  data,
  columns,
  total,
  page,
  pageSize,
  onPageChange,
  onSearch,
  searchPlaceholder,
  filters,
  actions,
  isLoading,
  isFetching,
  isError,
  emptyMessage,
  loadingMessage,
  errorMessage,
}: DataTableProps<T>) {
  const [searchInput, setSearchInput] = useState('');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const next = event.target.value;
      setSearchInput(next);
      if (!onSearch) return;
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onSearch(next), SEARCH_DEBOUNCE_MS);
    },
    [onSearch],
  );

  useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const pageLabel = `${page}/${totalPages}`;

  return (
    <div className={styles.root}>
      <div className={styles.toolbar}>
        {onSearch ? (
          <div className={styles.toolbarSearch}>
            <Input
              label={DATA_TABLE_LABELS.searchLabel}
              size="sm"
              iconLeft={Search}
              placeholder={searchPlaceholder ?? DATA_TABLE_LABELS.searchPlaceholder}
              value={searchInput}
              onChange={handleSearchChange}
            />
          </div>
        ) : null}
        {filters ? <div className={styles.toolbarFilters}>{filters}</div> : null}
        <div className={styles.toolbarSpacer} aria-hidden />
        {actions ? <div className={styles.toolbarActions}>{actions}</div> : null}
        <div className={styles.toolbarPagination}>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => onPageChange(Math.max(1, page - 1))}
          >
            {DATA_TABLE_LABELS.prev}
          </Button>
          <Text as="span" size="sm" color="muted">
            {pageLabel}
          </Text>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isFetching}
            onClick={() => onPageChange(page + 1)}
          >
            {DATA_TABLE_LABELS.next}
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className={styles.state}>
          <Spinner />
          <Text as="span" size="sm" color="muted">
            {loadingMessage ?? DATA_TABLE_LABELS.loading}
          </Text>
        </div>
      ) : isError ? (
        <div className={styles.state}>
          <Text as="span" size="sm" color="destructive">
            {errorMessage ?? DATA_TABLE_LABELS.error}
          </Text>
        </div>
      ) : data.length === 0 ? (
        <div className={styles.state}>
          <Text as="span" size="sm" color="muted">
            {emptyMessage ?? DATA_TABLE_LABELS.empty}
          </Text>
        </div>
      ) : (
        <div className={styles.tableWrap}>
          <Table className={styles.table}>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id} className={styles.th}>
                      {flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={styles.td}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
