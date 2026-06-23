// Copy + config for the Liquidity (bids per job) report screen (R2).
// ALL_CAPS per-concern.

export const PAGE_SIZE = 25;

export const PAGE_COPY = {
  heading: 'Liquidity (bids per job)',
  sub: 'How much bid demand each job attracts — average bids/job, the share of jobs that get any bid, and average bid amount, per category and city.',
} as const;

// Summary KPI tile labels (StatTileRow). Runtime numbers come from the hook.
export const SUMMARY_LABELS = {
  jobs: 'Jobs posted',
  bids: 'Bids placed',
  avgBids: 'Avg bids / job',
  withBidsPct: 'Jobs with a bid',
  with3PlusPct: 'Jobs with 3+ bids',
} as const;

export const COLUMN_LABELS = {
  group: 'Category / City',
  jobs: 'Jobs',
  avgBids: 'Avg bids/job',
  withBidsPct: '% with ≥1 bid',
  with3PlusPct: '% with ≥3 bids',
  avgBidAmount: 'Avg bid',
} as const;

export const TABLE_COPY = {
  searchPlaceholder: 'Search category or city…',
  loading: 'Loading liquidity…',
  error: 'Failed to load the liquidity report.',
  empty: 'No jobs match these filters.',
  dash: '—',
  // Suffix appended to a group's avg-bid currency when its bids span more
  // than one currency (currency is unnormalized on Bid).
  mixedSuffix: ' (mixed)',
  noCity: 'No city',
} as const;

export const CHART_COPY = {
  title: 'Average bids per job, by category',
  aria: 'Bar chart of average bids per job for each job category',
} as const;

export const EXPORT_COPY = {
  label: 'Export CSV',
  filenamePrefix: 'liquidity-bids-per-job',
} as const;

// Group-by Select (R2). Drives whether rows are per-category or per (category, city).
export const GROUP_BY_VALUES = ['category', 'city'] as const;
export type GroupByFilter = (typeof GROUP_BY_VALUES)[number];

export const GROUP_BY_LABELS = {
  label: 'Group by',
  category: 'Category',
  city: 'Category + City',
} as const;

export const DEFAULT_GROUP_BY: GroupByFilter = 'category';

// Server-side sort. Keys map 1:1 to GetLiquidityArgs.sortBy.
export const SORTABLE_KEYS = [
  'jobs',
  'avgBids',
  'withBidsPct',
  'with3PlusPct',
  'avgBidAmount',
] as const;
export type SortKey = (typeof SORTABLE_KEYS)[number];
export type SortDir = 'asc' | 'desc';

export const DEFAULT_SORT_KEY: SortKey = 'avgBids';
export const DEFAULT_SORT_DIR: SortDir = 'desc';

export const DEFAULT_PERIOD = 'last_30d';

// URL search-param keys the screen syncs filter/sort/page state into.
export const QUERY_PARAM_KEYS = {
  page: 'page',
  search: 'q',
  groupBy: 'groupBy',
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
