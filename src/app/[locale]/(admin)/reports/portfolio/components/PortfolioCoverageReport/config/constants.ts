// Copy + config for the Portfolio & content coverage report screen (R2).
// ALL_CAPS per-concern.

export const PAGE_SIZE = 25;

export const PAGE_COPY = {
  heading: 'Portfolio & content coverage',
  sub: 'How many workers actually showcase their work — coverage, depth, and featured content by category.',
} as const;

// Summary KPI tile labels (StatTileRow). value/runtime numbers come from the hook.
export const SUMMARY_LABELS = {
  totalWorkers: 'Total workers',
  workersWithPortfolio: 'With a portfolio',
  coverageRate: 'Coverage',
  avgProjects: 'Avg projects / portfolio',
  featured: 'Featured projects',
} as const;

// Per-category bar chart copy.
export const CHART_COPY = {
  title: 'Projects by category',
  aria: 'Bar chart of portfolio projects per category',
} as const;

// Human labels for the PortfolioCategory enum (chart + CSV).
export const CATEGORY_LABELS: Record<string, string> = {
  kitchen: 'Kitchen',
  bathroom: 'Bathroom',
  electrical: 'Electrical',
  plumbing: 'Plumbing',
  painting: 'Painting',
  tiling: 'Tiling',
  carpentry: 'Carpentry',
  climate: 'Climate',
  roofing: 'Roofing',
  outdoor: 'Outdoor',
  other: 'Other',
};

export const COLUMN_LABELS = {
  name: 'Worker',
  verified: 'Verified',
  projects: 'Projects',
  photos: 'Photos',
  featured: 'Featured',
  lastCompletedAt: 'Last completed',
  createdAt: 'Joined',
} as const;

export const TABLE_COPY = {
  searchPlaceholder: 'Search worker name…',
  loading: 'Loading workers…',
  error: 'Failed to load portfolio coverage.',
  empty: 'No workers match these filters.',
  dash: '—',
} as const;

export const VERIFIED_BADGE_LABELS = {
  yes: 'Verified',
  no: 'Unverified',
} as const;

export const EXPORT_COPY = {
  label: 'Export CSV',
  filenamePrefix: 'portfolio-coverage',
} as const;

// Server-side sort. These map to ListPortfolioCoverageArgs.sortBy.
export const SORTABLE_KEYS = ['projects', 'photos', 'featured', 'createdAt'] as const;
export type SortKey = (typeof SORTABLE_KEYS)[number];
export type SortDir = 'asc' | 'desc';

export const DEFAULT_SORT_KEY: SortKey = 'projects';
export const DEFAULT_SORT_DIR: SortDir = 'desc';

export const DEFAULT_PERIOD_PRESET = 'last_30d';

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
