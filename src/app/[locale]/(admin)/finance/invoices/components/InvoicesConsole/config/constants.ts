export const PAGE_SIZE = 25;

export const INVOICES_LABELS = {
  pageHeading: 'Invoices',
  pageSub: 'Issue invoices, raise credit notes, and configure BG ДДС (VAT).',
  loading: 'Loading invoices…',
  error: 'Failed to load invoices.',
  empty: 'No invoices match these filters.',
  statusFilter: 'Status',
  searchPlaceholder: 'Search client or job…',
  vatIncluded: 'incl.',
  noVat: '—',
} as const;

export const COLUMN_LABELS = {
  client: 'Client',
  job: 'Job',
  amount: 'Amount',
  vat: 'VAT',
  status: 'Status',
  due: 'Due',
  actions: 'Actions',
} as const;

export const QUERY_KEYS = {
  page: 'page',
  status: 'status',
  search: 'q',
} as const;

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export const STATUS_BADGE: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  draft: 'secondary',
  sent: 'primary',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'secondary',
};

export const STATUS_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'sent', label: 'Sent' },
  { value: 'paid', label: 'Paid' },
  { value: 'overdue', label: 'Overdue' },
  { value: 'cancelled', label: 'Cancelled' },
];
