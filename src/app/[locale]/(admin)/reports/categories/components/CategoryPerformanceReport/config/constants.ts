// Copy + config for the Category performance report screen (R2). ALL_CAPS per-concern.

export const PAGE_SIZE = 25;

export const PAGE_COPY = {
  heading: 'Category performance',
  sub: 'Demand, conversion, pricing, quality, and worker supply for every job category.',
} as const;

// Summary KPI tile labels (StatTileRow). Runtime numbers come from the rows.
export const SUMMARY_LABELS = {
  categories: 'Categories',
  jobsPosted: 'Jobs posted',
  avgCompletion: 'Avg completion',
  topCategory: 'Top category',
} as const;

export const COLUMN_LABELS = {
  category: 'Category',
  jobsPosted: 'Jobs posted',
  completionRate: 'Completion rate',
  avgAcceptedBid: 'Avg accepted bid',
  avgRating: 'Avg rating',
  workerCoverage: 'Worker coverage',
} as const;

export const TABLE_COPY = {
  searchPlaceholder: 'Search category…',
  loading: 'Loading categories…',
  error: 'Failed to load category performance.',
  empty: 'No categories match these filters.',
  dash: '—',
} as const;

export const CHART_COPY = {
  title: 'Jobs by category',
  aria: 'Jobs posted by category',
} as const;

export const EXPORT_COPY = {
  label: 'Export CSV',
  filenamePrefix: 'category-performance',
} as const;

// CSV header row labels. Distinct from COLUMN_LABELS where the export carries a
// column the table folds into another (currency alongside the avg bid).
export const CSV_HEADERS = {
  category: 'Category',
  jobsPosted: 'Jobs posted',
  completed: 'Completed',
  completionRate: 'Completion rate',
  avgAcceptedBid: 'Avg accepted bid',
  avgAcceptedBidCurrency: 'Bid currency',
  avgRating: 'Avg rating',
  workerCoverage: 'Worker coverage',
} as const;

// Server-side sort. These map to ListCategoryPerfArgs.sortBy.
export const SORTABLE_KEYS = [
  'category',
  'jobsPosted',
  'completionRate',
  'avgAcceptedBid',
  'avgRating',
  'workerCoverage',
] as const;
export type SortKey = (typeof SORTABLE_KEYS)[number];
export type SortDir = 'asc' | 'desc';

export const DEFAULT_SORT_KEY: SortKey = 'jobsPosted';
export const DEFAULT_SORT_DIR: SortDir = 'desc';

export const DEFAULT_PERIOD_PRESET = 'last_30d';

// How many categories the bar chart renders (the heaviest by jobs posted). The
// chart is a quick demand read, not the full table — keep it scannable.
export const CHART_TOP_N = 8;

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
