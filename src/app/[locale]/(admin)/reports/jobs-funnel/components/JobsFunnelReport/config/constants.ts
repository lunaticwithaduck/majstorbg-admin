// Copy + config for the Jobs funnel Overview tab (R2).

export const DASH = '—';

export const KPI_LABELS = {
  posted: 'Posted',
  withOffers: 'With offers',
  accepted: 'Accepted',
  completed: 'Completed',
  completionRate: 'Completion rate',
} as const;

export const FUNNEL_STAGE_LABELS = {
  posted: 'Posted',
  withOffers: 'With offers',
  accepted: 'Accepted',
  completed: 'Completed',
  cancelled: 'Cancelled',
} as const;

export const CHART_COPY = {
  funnelTitle: 'Funnel stages',
  funnelAria: 'Jobs funnel by stage',
  trendTitle: 'Posted vs completed over time',
  trendAria: 'Posted versus completed jobs over time',
  postedSeries: 'Posted',
  completedSeries: 'Completed',
} as const;

// Category filter Select (R2). 'all' is the sentinel for "no category filter".
// Keys are stable; labels are display copy. Until the BE exposes a category
// catalogue, these mirror the common service categories used elsewhere.
export const CATEGORY_FILTER_LABEL = 'Category';
export const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All categories' },
  { value: 'plumbing', label: 'Plumbing' },
  { value: 'electrical', label: 'Electrical' },
  { value: 'cleaning', label: 'Cleaning' },
  { value: 'painting', label: 'Painting' },
  { value: 'carpentry', label: 'Carpentry' },
  { value: 'gardening', label: 'Gardening' },
  { value: 'moving', label: 'Moving' },
] as const;

// Trend bucketing for the posted-vs-completed series. Sent as `period`.
export const TREND_PERIOD = 'week' as const;

// URL search-param keys the overview tab syncs into.
export const QUERY_PARAM_KEYS = {
  category: 'category',
  period: 'period',
  from: 'from',
  to: 'to',
} as const;

export const DEFAULT_PERIOD_PRESET = 'last_30d';
