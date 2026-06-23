// Copy + config for the Worker leaderboard report screen (R2). ALL_CAPS per-concern.

export const PAGE_SIZE = 25;

export const PAGE_COPY = {
  heading: 'Worker leaderboard',
  sub: 'Top performers ranked by completed jobs, ratings, and accepted-bid value across the platform.',
} as const;

// Summary KPI tile labels (StatTileRow). value/runtime numbers come from the hook.
export const SUMMARY_LABELS = {
  workers: 'Ranked workers',
  completedJobs: 'Completed jobs',
  acceptedBids: 'Accepted bids',
  avgRating: 'Average rating',
} as const;

export const CHART_COPY = {
  title: 'Top workers by completed jobs',
  ariaLabel: 'Top workers ranked by completed jobs',
  empty: 'No completed jobs in this window yet.',
} as const;

// How many leaderboard rows feed the bar chart (the visible top slice).
export const CHART_TOP_N = 8;

export const COLUMN_LABELS = {
  rank: 'Rank',
  name: 'Worker',
  completedJobs: 'Completed jobs',
  avgRating: 'Avg rating',
  acceptedBids: 'Accepted bids',
  acceptedValue: 'Accepted value',
  actions: 'Actions',
} as const;

export const TABLE_COPY = {
  searchPlaceholder: 'Search worker name or email…',
  loading: 'Loading leaderboard…',
  error: 'Failed to load the leaderboard.',
  empty: 'No workers match these filters.',
  view: 'View',
  dash: '—',
  // Suffix appended to the review count beside the average rating.
  reviewsSuffix: 'reviews',
} as const;

export const EXPORT_COPY = {
  label: 'Export CSV',
  filenamePrefix: 'worker-leaderboard',
} as const;

// Server-side sort. These map to ListWorkerLeaderboardArgs.sortBy.
export const SORTABLE_KEYS = [
  'completedJobs',
  'avgRating',
  'acceptedBids',
  'acceptedValue',
  'name',
] as const;
export type SortKey = (typeof SORTABLE_KEYS)[number];
export type SortDir = 'asc' | 'desc';

export const DEFAULT_SORT_KEY: SortKey = 'completedJobs';
export const DEFAULT_SORT_DIR: SortDir = 'desc';

export const DEFAULT_PERIOD = 'last_30d';

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
