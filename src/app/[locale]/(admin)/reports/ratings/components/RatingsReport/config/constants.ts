// Copy + config for the Ratings & quality report screen (R2). ALL_CAPS per-concern.

export const PAGE_SIZE = 25;

export const PAGE_COPY = {
  heading: 'Ratings & quality',
  sub: 'Worker rating health across the platform: average score, star spread, dispute rate, and the workers dragging quality down.',
} as const;

// Summary KPI tile labels (StatTileRow). value/runtime numbers come from the hook.
export const KPI_LABELS = {
  avgRating: 'Avg worker rating',
  reviewCount: 'Worker reviews',
  disputeRate: 'Dispute rate',
  completedJobs: 'Completed jobs',
} as const;

export const CHART_LABELS = {
  starDistribution: 'Star distribution',
  ariaLabel: 'Donut chart of the worker review star distribution (1 to 5 stars)',
  // {stars} is the 1..5 bucket; rendered into each donut slice label.
  starSlice: '{stars}★',
} as const;

export const COLUMN_LABELS = {
  worker: 'Worker',
  avgRating: 'Avg rating',
  reviewCount: 'Reviews',
  disputeCount: 'Disputes',
  actions: 'Actions',
} as const;

export const TABLE_COPY = {
  searchPlaceholder: 'Search worker name…',
  loading: 'Loading low-rated workers…',
  error: 'Failed to load low-rated workers.',
  empty: 'No workers fall below the rating threshold.',
  view: 'View',
  dash: '—',
} as const;

export const EXPORT_COPY = {
  label: 'Export CSV',
  filenamePrefix: 'low-rated-workers',
} as const;

// Min-reviews filter Select (R2). The value is the minimum review count a
// worker needs before they can appear in the low-rated list (guards against a
// single bad review tanking a brand-new worker). Strings for the Select;
// parsed to a number before the query.
export const MIN_REVIEWS_VALUES = ['3', '5', '10'] as const;
export type MinReviewsFilter = (typeof MIN_REVIEWS_VALUES)[number];
export const DEFAULT_MIN_REVIEWS: MinReviewsFilter = '3';

export const MIN_REVIEWS_LABELS: Record<MinReviewsFilter, string> = {
  '3': 'Min 3 reviews',
  '5': 'Min 5 reviews',
  '10': 'Min 10 reviews',
};

export const MIN_REVIEWS_FILTER_LABEL = 'Threshold' as const;

// Server-side sort. These map to ListLowRatedWorkersArgs.sortBy.
export const SORTABLE_KEYS = ['avgRating', 'reviewCount'] as const;
export type SortKey = (typeof SORTABLE_KEYS)[number];
export type SortDir = 'asc' | 'desc';

export const DEFAULT_SORT_KEY: SortKey = 'avgRating';
// asc avgRating = worst-first = the queue's default.
export const DEFAULT_SORT_DIR: SortDir = 'asc';

// URL search-param keys the screen syncs filter/sort/page state into.
export const QUERY_PARAM_KEYS = {
  page: 'page',
  search: 'q',
  minReviews: 'minReviews',
  period: 'period',
  from: 'from',
  to: 'to',
  sortBy: 'sortBy',
  sortDir: 'sortDir',
} as const;

export const DEFAULT_PERIOD = 'last_30d' as const;
