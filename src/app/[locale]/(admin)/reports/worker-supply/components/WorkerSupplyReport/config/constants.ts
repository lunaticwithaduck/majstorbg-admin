// Copy + config for the Worker supply & coverage report screen (R2).
// ALL_CAPS per-concern.

export const PAGE_SIZE = 25;

export const PAGE_COPY = {
  heading: 'Worker supply & coverage',
  sub: 'Active worker supply by city and skill category, with verified / accepting-work shares and thin-coverage flags against open-job demand.',
} as const;

// Summary KPI tile labels (StatTileRow). Runtime numbers come from the hook.
export const SUMMARY_LABELS = {
  activeWorkers: 'Active workers',
  verifiedShare: 'Verified share',
  acceptingShare: 'Accepting work',
  openJobs: 'Open jobs',
  thinCoverage: 'Thin-coverage buckets',
} as const;

export const CHART_COPY = {
  titleCategory: 'Active workers by skill category',
  titleCity: 'Active workers by city',
  ariaLabel: 'Active workers per bucket',
} as const;

export const COLUMN_LABELS = {
  bucketCategory: 'Skill category',
  bucketCity: 'City',
  activeWorkers: 'Active workers',
  verifiedShare: 'Verified',
  acceptingShare: 'Accepting',
  openJobs: 'Open jobs',
  coverageRatio: 'Coverage',
  thinCoverage: 'Coverage flag',
} as const;

export const TABLE_COPY = {
  searchPlaceholder: 'Search city or category…',
  loading: 'Loading worker supply…',
  error: 'Failed to load worker supply.',
  empty: 'No buckets match these filters.',
  dash: '—',
} as const;

export const COVERAGE_BADGE_LABELS = {
  thin: 'Thin',
  ok: 'Covered',
} as const;

// Dimension filter Select (R2). Drives both the bucket axis and labels.
export const DIMENSION_VALUES = ['category', 'city'] as const;
export type DimensionFilter = (typeof DIMENSION_VALUES)[number];

export const DIMENSION_FILTER_LABELS = {
  label: 'Group by',
  category: 'Skill category',
  city: 'City',
} as const;

export const EXPORT_COPY = {
  label: 'Export CSV',
  filenamePrefix: 'worker-supply',
} as const;

// Server-side sort. These map to WorkerSupplyArgs.sortBy.
export const SORTABLE_KEYS = [
  'activeWorkers',
  'verifiedShare',
  'acceptingShare',
  'openJobs',
  'coverageRatio',
] as const;
export type SortKey = (typeof SORTABLE_KEYS)[number];
export type SortDir = 'asc' | 'desc';

export const DEFAULT_DIMENSION: DimensionFilter = 'category';
export const DEFAULT_SORT_KEY: SortKey = 'activeWorkers';
export const DEFAULT_SORT_DIR: SortDir = 'desc';

// URL search-param keys the screen syncs filter/sort/page state into.
export const QUERY_PARAM_KEYS = {
  page: 'page',
  search: 'q',
  dimension: 'by',
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

export const DEFAULT_PERIOD = 'last_30d' as const;
