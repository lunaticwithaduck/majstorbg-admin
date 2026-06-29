export const PAGE_SIZE = 25;

export const CAMPAIGNS_LABELS = {
  pageHeading: 'Campaigns',
  pageSub: 'Email and push campaigns — segment, schedule, send and track delivery.',
  loading: 'Loading campaigns…',
  error: 'Failed to load campaigns.',
  empty: 'No campaigns yet.',
  channelFilter: 'Channel',
  statusFilter: 'Status',
  newCampaign: 'New campaign',
  noStats: '—',
} as const;

export const COLUMN_LABELS = {
  name: 'Name',
  channel: 'Channel',
  segment: 'Segment',
  status: 'Status',
  schedule: 'Schedule',
  delivery: 'Delivery',
  actions: 'Actions',
} as const;

export const QUERY_KEYS = {
  page: 'page',
  channel: 'channel',
  status: 'status',
} as const;

export const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  push: 'Push',
};

export const STATUS_LABELS: Record<string, string> = {
  draft: 'Draft',
  scheduled: 'Scheduled',
  sending: 'Sending',
  sent: 'Sent',
  failed: 'Failed',
};

export const STATUS_BADGE: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  draft: 'secondary',
  scheduled: 'primary',
  sending: 'warning',
  sent: 'success',
  failed: 'destructive',
};

export const SEGMENT_ROLE_LABELS: Record<string, string> = {
  all: 'All users',
  worker: 'Workers',
  client: 'Clients',
};

export const SEGMENT_ACTIVITY_LABELS: Record<string, string> = {
  all: 'Any activity',
  active_30d: 'Active 30d',
  inactive_30d: 'Inactive 30d',
};

export const CHANNEL_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'all', label: 'All channels' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push' },
];

export const STATUS_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'draft', label: 'Draft' },
  { value: 'scheduled', label: 'Scheduled' },
  { value: 'sending', label: 'Sending' },
  { value: 'sent', label: 'Sent' },
  { value: 'failed', label: 'Failed' },
];
