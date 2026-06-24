// Copy + config for the Match speed report screen (R2). ALL_CAPS per-concern.

export const PAGE_SIZE = 25;

export const CHART_HEIGHT = 280;

export const PAGE_COPY = {
  heading: 'Match speed',
  sub: 'How quickly posted jobs attract a first bid and get awarded — median, average, and p90, by category and by week.',
} as const;

// Summary KPI tile labels (StatTileRow). Values come from the hook's `kpis`.
export const SUMMARY_LABELS = {
  firstBidMedian: 'Median time to first bid',
  firstBidP90: 'p90 time to first bid',
  awardMedian: 'Median time to award',
  awardP90: 'p90 time to award',
} as const;

export const CHART_COPY = {
  ariaLabel: 'Weekly median time-to-first-bid and time-to-award, in hours',
  seriesFirstBid: 'First bid (median)',
  seriesAward: 'Award (median)',
} as const;

export const COLUMN_LABELS = {
  category: 'Category',
  jobs: 'Jobs',
  firstBidMedian: 'First bid (median)',
  firstBidAvg: 'First bid (avg)',
  firstBidP90: 'First bid (p90)',
  awardMedian: 'Award (median)',
  awardAvg: 'Award (avg)',
  awardP90: 'Award (p90)',
} as const;

export const TABLE_COPY = {
  searchPlaceholder: 'Search category…',
  loading: 'Loading match speed…',
  error: 'Failed to load the match speed report.',
  empty: 'No jobs match these filters.',
  dash: '—',
} as const;

export const EXPORT_COPY = {
  label: 'Export CSV',
  filenamePrefix: 'match-speed',
} as const;

// Period preset used to drive the createdAt window. Match speed needs a wide
// lens to gather enough samples per week, so default to 30 days.
export const DEFAULT_PERIOD_PRESET = 'last_30d' as const;

// Server-side sort. These map to GetMatchSpeedArgs.sortBy.
export const SORTABLE_KEYS = [
  'category',
  'jobs',
  'firstBidMedian',
  'awardMedian',
] as const;
export type SortKey = (typeof SORTABLE_KEYS)[number];
export type SortDir = 'asc' | 'desc';

export const DEFAULT_SORT_KEY: SortKey = 'jobs';
export const DEFAULT_SORT_DIR: SortDir = 'desc';

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
