// Copy + config for the Jobs funnel Breakdown tab (R2).

export const PAGE_SIZE = 50;

export const COLUMN_LABELS = {
  key: 'Segment',
  posted: 'Posted',
  withOffers: 'With offers',
  completed: 'Completed',
  completionRate: 'Completion rate',
} as const;

export const TABLE_COPY = {
  loading: 'Loading breakdown…',
  error: 'Failed to load breakdown.',
  empty: 'No breakdown data for these filters.',
  dash: '—',
} as const;

// "Group by" dimension Select (R2). Maps to GetJobsFunnelBreakdownArgs.by.
export const BY_FILTER_LABEL = 'Group by';
export const BY_OPTIONS = [
  { value: 'category', label: 'Category' },
  { value: 'cityName', label: 'City' },
  { value: 'urgency', label: 'Urgency' },
] as const;
export type ByDimension = (typeof BY_OPTIONS)[number]['value'];
export const DEFAULT_BY: ByDimension = 'category';

export const TOTALS_LABELS = {
  segments: 'Segments',
  posted: 'Total posted',
  completed: 'Total completed',
} as const;

export const EXPORT_COPY = {
  label: 'Export CSV',
  filenamePrefix: 'jobs-funnel-breakdown',
} as const;

// Client-side sort over the (small) breakdown set.
export const SORTABLE_KEYS = ['posted', 'withOffers', 'completed', 'completionRate'] as const;
export type SortKey = (typeof SORTABLE_KEYS)[number];
export type SortDir = 'asc' | 'desc';
export const DEFAULT_SORT_KEY: SortKey = 'posted';
export const DEFAULT_SORT_DIR: SortDir = 'desc';

export const QUERY_PARAM_KEYS = {
  by: 'by',
  period: 'period',
  from: 'from',
  to: 'to',
  sortBy: 'sortBy',
  sortDir: 'sortDir',
} as const;

export const DEFAULT_PERIOD_PRESET = 'last_30d';

export const SORT_INDICATORS = {
  asc: '↑',
  desc: '↓',
  none: '↕',
} as const;
