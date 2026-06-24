// Copy + config for the Engagement & presence report screen (R2). ALL_CAPS
// per-concern. No runtime numbers here — those come from the hook.

export const PAGE_SIZE = 25;

export const PAGE_COPY = {
  heading: 'Engagement & presence',
  sub: 'Active users by recency, unread-notification pressure, and message volume across the platform.',
} as const;

// Active-users + unread + messages KPI tiles (StatTileRow). Values come from
// the hook; these are labels only.
export const KPI_LABELS = {
  active24h: 'Active (24h)',
  active7d: 'Active (7d)',
  active30d: 'Active (30d)',
  unreadRate: 'Unread rate',
  messagesInPeriod: 'Messages in period',
} as const;

export const CHART_COPY = {
  title: 'Active users by day',
  aria: 'Distinct active users per day over the trailing 30 days',
  series: 'Active users',
} as const;

export const COLUMN_LABELS = {
  sentAt: 'Sent',
  sender: 'Sender',
  job: 'Job',
  type: 'Type',
  preview: 'Message',
  read: 'Read',
} as const;

export const TABLE_COPY = {
  searchPlaceholder: 'Search by sender name…',
  loading: 'Loading messages…',
  error: 'Failed to load the engagement report.',
  empty: 'No messages match these filters.',
  dash: '—',
} as const;

// Message-type Badge labels. Typed loose (Record<string,string>) so indexing
// with a widened runtime string can't trip TS7053; index defensively.
export const MESSAGE_TYPE_LABELS: Record<string, string> = {
  text: 'Text',
  system_milestone: 'Milestone',
};

export const READ_BADGE_LABELS = {
  read: 'Read',
  unread: 'Unread',
} as const;

export const EXPORT_COPY = {
  label: 'Export CSV',
  filenamePrefix: 'engagement-messages',
} as const;

// Server-side sort. The only meaningful key for the messages list is sentAt.
export const SORTABLE_KEYS = ['sentAt'] as const;
export type SortKey = (typeof SORTABLE_KEYS)[number];
export type SortDir = 'asc' | 'desc';

export const DEFAULT_SORT_KEY: SortKey = 'sentAt';
export const DEFAULT_SORT_DIR: SortDir = 'desc';

export const DEFAULT_PERIOD_PRESET = 'last_30d' as const;

// URL search-param keys the screen syncs filter/sort/page state into.
export const QUERY_PARAM_KEYS = {
  page: 'page',
  search: 'q',
  period: 'period',
  from: 'from',
  to: 'to',
  sortBy: 'sortBy',
  sortDir: 'sortDir',
} as const;

// Sort-toggle affordance glyphs appended to a sortable header label.
export const SORT_INDICATORS = {
  asc: '↑',
  desc: '↓',
  none: '↕',
} as const;
