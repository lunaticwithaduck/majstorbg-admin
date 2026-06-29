export const PAGE_SIZE = 25;

export const PAYOUTS_LABELS = {
  pageHeading: 'Payouts',
  pageSub: 'Worker payouts awaiting approval, and their settlement status.',
  loading: 'Loading payouts…',
  error: 'Failed to load payouts.',
  empty: 'No payouts match this filter.',
  statusFilter: 'Status',
} as const;

export const COLUMN_LABELS = {
  worker: 'Worker',
  amount: 'Amount',
  job: 'Job',
  status: 'Status',
  created: 'Requested',
  actions: 'Actions',
} as const;

export const QUERY_KEYS = {
  page: 'page',
  status: 'status',
} as const;

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  approved: 'Approved',
  paid: 'Paid',
  failed: 'Failed',
};

export const STATUS_BADGE: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  pending: 'warning',
  approved: 'primary',
  paid: 'success',
  failed: 'destructive',
};

export const STATUS_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'paid', label: 'Paid' },
  { value: 'failed', label: 'Failed' },
];
