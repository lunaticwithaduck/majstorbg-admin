export const PAGE_SIZE = 25;

export const DR_LABELS = {
  pageHeading: 'Data requests',
  pageSub: 'GDPR export and erasure requests, with SLA tracking and identity checks.',
  loading: 'Loading data requests…',
  error: 'Failed to load data requests.',
  empty: 'No data requests match these filters.',
  typeFilter: 'Type',
  statusFilter: 'Status',
  overdue: 'Overdue',
  daysLeftSuffix: 'days left',
} as const;

export const COLUMN_LABELS = {
  subject: 'Subject',
  type: 'Type',
  status: 'Status',
  identity: 'Identity',
  sla: 'SLA',
  requested: 'Requested',
  actions: 'Actions',
} as const;

export const QUERY_KEYS = {
  page: 'page',
  type: 'type',
  status: 'status',
} as const;

export const TYPE_LABELS: Record<string, string> = {
  export: 'Export',
  erase: 'Erasure',
};

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  verifying: 'Verifying',
  in_progress: 'In progress',
  fulfilled: 'Fulfilled',
  rejected: 'Rejected',
};

export const STATUS_BADGE: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  pending: 'warning',
  verifying: 'primary',
  in_progress: 'primary',
  fulfilled: 'success',
  rejected: 'secondary',
};

export const IDENTITY_LABELS = {
  verified: 'Verified',
  notVerified: 'Not verified',
} as const;

export const TYPE_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'export', label: 'Export' },
  { value: 'erase', label: 'Erasure' },
];

export const STATUS_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'pending', label: 'Pending' },
  { value: 'verifying', label: 'Verifying' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'fulfilled', label: 'Fulfilled' },
  { value: 'rejected', label: 'Rejected' },
];
