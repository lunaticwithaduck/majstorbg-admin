// Copy + config for the User registrations report screen (R2). ALL_CAPS per-concern.

export const PAGE_SIZE = 25;

export const PAGE_COPY = {
  heading: 'User registrations',
  sub: 'New signups over time, split by role, with onboarding completion and verified-worker share.',
} as const;

// Summary KPI tile labels (StatTileRow). value/runtime numbers come from the hook.
export const SUMMARY_LABELS = {
  total: 'New users',
  workers: 'New workers',
  clients: 'New clients',
  onboardingRate: 'Onboarding completion',
  verifiedWorkerShare: 'Verified-worker share',
} as const;

export const COLUMN_LABELS = {
  bucket: 'Period',
  total: 'New users',
  workers: 'Workers',
  clients: 'Clients',
  onboarded: 'Onboarded',
} as const;

export const TABLE_COPY = {
  searchPlaceholder: 'Search period…',
  loading: 'Loading registrations…',
  error: 'Failed to load registrations.',
  empty: 'No registrations in this window.',
  dash: '—',
} as const;

export const CHART_COPY = {
  ariaLabel: 'New user signups over time, split by role',
  seriesTotal: 'All signups',
  seriesWorkers: 'Workers',
  seriesClients: 'Clients',
} as const;

export const CHART_HEIGHT = 280;

export const EXPORT_COPY = {
  label: 'Export CSV',
  filenamePrefix: 'registrations',
} as const;

// Period grain Select (R2). Drives the in-memory bucketing on the BE.
export const PERIOD_GRAIN_VALUES = ['day', 'week', 'month'] as const;
export type PeriodGrain = (typeof PERIOD_GRAIN_VALUES)[number];

export const PERIOD_GRAIN_LABELS = {
  label: 'Group by',
  day: 'Day',
  week: 'Week',
  month: 'Month',
} as const;

export const DEFAULT_PERIOD_GRAIN: PeriodGrain = 'day';

// Server-side sort over the computed period buckets. These map to
// GetRegistrationsReportArgs.sortBy.
export const SORTABLE_KEYS = ['bucket', 'total'] as const;
export type SortKey = (typeof SORTABLE_KEYS)[number];
export type SortDir = 'asc' | 'desc';

export const DEFAULT_SORT_KEY: SortKey = 'bucket';
export const DEFAULT_SORT_DIR: SortDir = 'asc';

// The PeriodSelect window preset default (createdAt range driving the report).
export const DEFAULT_PERIOD_PRESET = 'last_30d';

// URL search-param keys the screen syncs filter/sort/page state into.
export const QUERY_PARAM_KEYS = {
  page: 'page',
  search: 'q',
  grain: 'grain',
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

// Percent formatter input is a [0,1] rate from the BE. One decimal is plenty
// for a KPI tile.
export const PERCENT_FRACTION_DIGITS = 1;
