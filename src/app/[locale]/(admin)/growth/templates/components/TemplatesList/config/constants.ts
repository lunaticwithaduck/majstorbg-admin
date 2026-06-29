export const PAGE_SIZE = 25;

export const TEMPLATES_LABELS = {
  pageHeading: 'Templates',
  pageSub: 'Campaign and transactional message templates, with live preview.',
  loading: 'Loading templates…',
  error: 'Failed to load templates.',
  empty: 'No templates yet.',
  channelFilter: 'Channel',
} as const;

export const COLUMN_LABELS = {
  name: 'Name',
  channel: 'Channel',
  subject: 'Subject',
  type: 'Type',
  updated: 'Updated',
  actions: 'Actions',
} as const;

export const QUERY_KEYS = {
  page: 'page',
  channel: 'channel',
} as const;

export const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email',
  push: 'Push',
};

export const TYPE_LABELS = {
  transactional: 'Transactional',
  campaign: 'Campaign',
} as const;

export const CHANNEL_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'all', label: 'All channels' },
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push' },
];
