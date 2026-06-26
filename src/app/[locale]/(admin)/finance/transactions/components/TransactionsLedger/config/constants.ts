export const PAGE_SIZE = 25;

export const LEDGER_LABELS = {
  pageHeading: 'Transactions',
  pageSub: 'Payments, refunds, escrow movements and payouts across the platform.',
  loading: 'Loading transactions…',
  error: 'Failed to load transactions.',
  empty: 'No transactions match these filters.',
  flagged: 'Flagged',
  typeFilter: 'Type',
  statusFilter: 'Status',
} as const;

export const COLUMN_LABELS = {
  type: 'Type',
  status: 'Status',
  amount: 'Amount',
  user: 'User',
  job: 'Job',
  created: 'Date',
  actions: 'Actions',
} as const;

export const QUERY_KEYS = {
  page: 'page',
  type: 'type',
  status: 'status',
} as const;

export const TYPE_LABELS: Record<string, string> = {
  payment: 'Payment',
  refund: 'Refund',
  payout: 'Payout',
  escrow_hold: 'Escrow hold',
  escrow_release: 'Escrow release',
  fee: 'Fee',
  chargeback: 'Chargeback',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  succeeded: 'Succeeded',
  failed: 'Failed',
  refunded: 'Refunded',
  disputed: 'Disputed',
};

export const STATUS_BADGE: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  pending: 'warning',
  succeeded: 'success',
  failed: 'destructive',
  refunded: 'secondary',
  disputed: 'destructive',
};

export const TYPE_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'payment', label: 'Payment' },
  { value: 'refund', label: 'Refund' },
  { value: 'payout', label: 'Payout' },
  { value: 'escrow_hold', label: 'Escrow hold' },
  { value: 'escrow_release', label: 'Escrow release' },
  { value: 'fee', label: 'Fee' },
  { value: 'chargeback', label: 'Chargeback' },
];

export const STATUS_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'succeeded', label: 'Succeeded' },
  { value: 'failed', label: 'Failed' },
  { value: 'refunded', label: 'Refunded' },
  { value: 'disputed', label: 'Disputed' },
];
