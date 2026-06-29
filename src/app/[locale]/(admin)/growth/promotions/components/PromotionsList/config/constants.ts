export const PAGE_SIZE = 25;

export const PROMOTIONS_LABELS = {
  pageHeading: 'Promotions',
  pageSub: 'Vouchers and referral codes — discounts, caps, validity and redemptions.',
  loading: 'Loading promotions…',
  error: 'Failed to load promotions.',
  empty: 'No promotions yet.',
  typeFilter: 'Type',
  statusFilter: 'Status',
  unlimited: '∞',
  rangeSeparator: ' – ',
} as const;

export const COLUMN_LABELS = {
  code: 'Code',
  type: 'Type',
  discount: 'Discount',
  validity: 'Validity',
  usage: 'Usage',
  status: 'Status',
  actions: 'Actions',
} as const;

export const QUERY_KEYS = {
  page: 'page',
  type: 'type',
  status: 'status',
} as const;

export const TYPE_LABELS: Record<string, string> = {
  voucher: 'Voucher',
  referral: 'Referral',
};

export const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  scheduled: 'Scheduled',
  expired: 'Expired',
  disabled: 'Disabled',
};

export const STATUS_BADGE: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  active: 'success',
  scheduled: 'primary',
  expired: 'secondary',
  disabled: 'destructive',
};

export const TYPE_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'all', label: 'All types' },
  { value: 'voucher', label: 'Voucher' },
  { value: 'referral', label: 'Referral' },
];

export const STATUS_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'active', label: 'Active' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'expired', label: 'Expired' },
  { value: 'disabled', label: 'Disabled' },
];
