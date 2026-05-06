'use client';

import {
  Button,
  Input,
  Link,
  Select,
  SelectItem,
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
import { Eye, Search } from 'lucide-react';
import { type ChangeEvent, useCallback, useMemo, useRef, useState } from 'react';
import { useListAdminUsersQuery } from '@/api/store';
import { routes } from '@/config/routes';
import { COLUMN_LABELS, PAGE_SIZE, type RoleFilter, TABLE_LABELS } from './config/constants';
import styles from './UserReportTable.styles';

// Row type derived from the RTK Query response so the bracketed-path file
// doesn't trip TS's type-only resolution against the bundled schemas .d.ts.
type ListResp = NonNullable<ReturnType<typeof useListAdminUsersQuery>['data']>;
type AdminUserListItem = ListResp['items'][number];

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

function formatDate(iso: string | null): string {
  if (!iso) return TABLE_LABELS.notOnboarded;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return TABLE_LABELS.notOnboarded;
  return dateFormatter.format(d);
}

export default function UserReportTable() {
  const [page, setPage] = useState(1);
  // `searchInput` is the raw, instant display value. `searchQuery` is the
  // debounced value sent to the BE — keeps typing responsive while throttling
  // network traffic. webui's `SearchInput` controls its own debounce
  // differently and ended up feeling laggy here, so we hand-roll it.
  const [searchInput, setSearchInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleSearchChange = useCallback((event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.value;
    setSearchInput(next);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      setSearchQuery(next);
      setPage(1);
    }, 250);
  }, []);
  const handleRoleChange = useCallback((value: string) => {
    setRoleFilter(value as RoleFilter);
    setPage(1);
  }, []);

  const queryArgs = useMemo(
    () => ({
      page,
      pageSize: PAGE_SIZE,
      ...(searchQuery.trim().length > 0 ? { search: searchQuery.trim() } : {}),
      ...(roleFilter !== 'all' ? { role: roleFilter } : {}),
    }),
    [page, searchQuery, roleFilter],
  );
  const { data, isLoading, isFetching, isError } = useListAdminUsersQuery(queryArgs);

  const items = data?.items ?? [];
  const total = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const columns = useMemo<ColumnDef<AdminUserListItem>[]>(
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
        id: 'email',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.email}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.email}
          </Text>
        ),
      },
      {
        id: 'role',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.role}
          </Text>
        ),
        cell: ({ row }) => (
          <span className={styles.badge}>
            <Text as="span" size="xs" weight="medium">
              {row.original.role}
            </Text>
          </span>
        ),
      },
      {
        id: 'phone',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.phone}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.phone ?? TABLE_LABELS.noPhone}
          </Text>
        ),
      },
      {
        id: 'createdAt',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.createdAt}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {formatDate(row.original.createdAt)}
          </Text>
        ),
      },
      {
        id: 'onboardingCompletedAt',
        header: () => (
          <Text as="span" size="sm" weight="semibold">
            {COLUMN_LABELS.onboardingCompletedAt}
          </Text>
        ),
        cell: ({ row }) => (
          <Text as="span" size="sm" color="muted">
            {row.original.onboardingCompletedAt
              ? TABLE_LABELS.onboarded
              : TABLE_LABELS.notOnboarded}
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
        cell: ({ row }) => (
          <Button asChild variant="outline" size="sm">
            <Link href={routes.users.detail(row.original.id)} variant="inherit">
              <Eye size={14} />
              {TABLE_LABELS.view}
            </Link>
          </Button>
        ),
      },
    ],
    [],
  );

  const table = useReactTable({
    data: items,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  const pageLabel = `${page}/${totalPages}`;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {TABLE_LABELS.pageHeading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {TABLE_LABELS.pageSub}
        </Text>
      </header>
      <div className={styles.toolbar}>
        <div className={styles.toolbarSearch}>
          <Input
            label={TABLE_LABELS.searchLabel}
            size="sm"
            iconLeft={Search}
            placeholder={TABLE_LABELS.searchPlaceholder}
            value={searchInput}
            onChange={handleSearchChange}
          />
        </div>
        <div className={styles.toolbarFilter}>
          <Select
            label={TABLE_LABELS.roleFilterLabel}
            value={roleFilter}
            onValueChange={handleRoleChange}
            size="sm"
          >
            <SelectItem value="all">{TABLE_LABELS.roleAll}</SelectItem>
            <SelectItem value="worker">{TABLE_LABELS.roleWorker}</SelectItem>
            <SelectItem value="client">{TABLE_LABELS.roleClient}</SelectItem>
          </Select>
        </div>
        <div className={styles.toolbarSpacer} aria-hidden />
        <div className={styles.toolbarPagination}>
          <Button
            variant="outline"
            size="sm"
            disabled={page <= 1 || isFetching}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            {TABLE_LABELS.prev}
          </Button>
          <Text as="span" size="sm" color="muted">
            {pageLabel}
          </Text>
          <Button
            variant="outline"
            size="sm"
            disabled={page >= totalPages || isFetching}
            onClick={() => setPage((p) => p + 1)}
          >
            {TABLE_LABELS.next}
          </Button>
        </div>
      </div>
      {isLoading ? (
        <div className={styles.state}>
          <Spinner />
          <Text as="span" size="sm" color="muted">
            {TABLE_LABELS.loading}
          </Text>
        </div>
      ) : isError ? (
        <div className={styles.state}>
          <Text as="span" size="sm" color="destructive">
            {TABLE_LABELS.error}
          </Text>
        </div>
      ) : items.length === 0 ? (
        <div className={styles.state}>
          <Text as="span" size="sm" color="muted">
            {TABLE_LABELS.empty}
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
