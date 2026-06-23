import type { InvoiceAgingBucket, InvoiceStatus } from '@/api/admin-invoices-endpoints';

export const PAGE_SIZE = 25;

export const INVOICES_LABELS = {
  loading: 'Loading invoices…',
  error: 'Failed to load invoices.',
  empty: 'No invoices match these filters.',
  searchPlaceholder: 'Search client or job…',
  exportCsv: 'Export CSV',
  statusFilterLabel: 'Status',
  bucketFilterLabel: 'Aging',
  none: '—',
} as const;

export const COLUMN_LABELS = {
  client: 'Client',
  job: 'Job',
  issued: 'Issued',
  due: 'Due',
  amount: 'Amount',
  daysOverdue: 'Days overdue',
  status: 'Status',
} as const;

export const TOTALS_LABELS = {
  count: 'Invoices (page)',
  amount: 'Amount (page)',
  overdue: 'Overdue (page)',
} as const;

export const STATUS_FILTER_VALUES = [
  'all',
  'draft',
  'sent',
  'paid',
  'overdue',
  'cancelled',
] as const;
export type StatusFilter = (typeof STATUS_FILTER_VALUES)[number];

export const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: 'All statuses',
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export const BUCKET_FILTER_VALUES = [
  'all',
  'current',
  'd1_30',
  'd31_60',
  'd61_90',
  'd90_plus',
] as const;
export type BucketFilter = (typeof BUCKET_FILTER_VALUES)[number];

export const BUCKET_FILTER_LABELS: Record<BucketFilter, string> = {
  all: 'All buckets',
  current: 'Current',
  d1_30: '1–30 days',
  d31_60: '31–60 days',
  d61_90: '61–90 days',
  d90_plus: '90+ days',
};

// Human copy + Badge variant per invoice status.
export const STATUS_BADGE_LABELS: Record<string, string> = {
  draft: 'Draft',
  sent: 'Sent',
  paid: 'Paid',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
};

export const STATUS_BADGE_VARIANT: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  draft: 'outline',
  sent: 'primary',
  paid: 'success',
  overdue: 'destructive',
  cancelled: 'secondary',
};

// Sortable columns map to the BE `sortBy` enum.
export const SORTABLE = {
  issuedAt: 'issuedAt',
  dueAt: 'dueAt',
  daysOverdue: 'amount',
} as const;

// URL query-param keys this screen syncs.
export const QUERY_KEYS = {
  page: 'page',
  search: 'q',
  status: 'status',
  bucket: 'bucket',
  period: 'period',
  from: 'from',
  to: 'to',
  sortBy: 'sort',
  sortDir: 'dir',
} as const;

export const DEFAULT_SORT_BY = 'dueAt' as const;
export const DEFAULT_SORT_DIR = 'asc' as const;

// Re-export so the component's narrowing helpers can stay typed.
export type { InvoiceAgingBucket, InvoiceStatus };
