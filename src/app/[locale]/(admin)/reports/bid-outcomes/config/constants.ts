// Copy + config for the Bid outcomes report screen (R2). ALL_CAPS per-concern.

// The byCategory series is returned whole (already sorted most-active first by
// the BE) — the table paginates that fixed array client-side.
export const PAGE_SIZE = 25;

export const PAGE_COPY = {
  heading: 'Bid outcomes',
  sub: 'Bid status mix with win and withdrawal rates, overall and by job category.',
} as const;

// Summary KPI tile labels (StatTileRow). Runtime numbers come from the hook.
// Order matches the rendered tiles: Win rate, Withdrawal rate, Accepted, Rejected.
export const SUMMARY_LABELS = {
  winRate: 'Win rate',
  withdrawalRate: 'Withdrawal rate',
  accepted: 'Accepted',
  rejected: 'Rejected',
} as const;

// The donut card heading + aria copy for the status-mix chart.
export const CHART_COPY = {
  heading: 'Status mix',
  ariaLabel: 'Bid status mix donut chart by status',
} as const;

// Status mix labels — overall donut legend. A plain string-keyed map indexed
// defensively (MAP[k] ?? k); never typed Record<BidStatus> then indexed by a
// row field.
export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
};

// The donut slice order — keeps the legend/colors stable regardless of count
// ordering. Mirrors the BidStatus enum order.
export const STATUS_ORDER = ['pending', 'accepted', 'rejected', 'withdrawn'] as const;

export const COLUMN_LABELS = {
  category: 'Category',
  accepted: 'Accepted',
  rejected: 'Rejected',
  withdrawn: 'Withdrawn',
  total: 'Total bids',
  winRate: 'Win rate',
} as const;

export const TABLE_COPY = {
  searchPlaceholder: 'Search category…',
  loading: 'Loading bid outcomes…',
  error: 'Failed to load bid outcomes.',
  empty: 'No bids match these filters.',
  dash: '—',
} as const;

export const EXPORT_COPY = {
  label: 'Export CSV',
  filenamePrefix: 'bid-outcomes',
} as const;

export const DEFAULT_PERIOD = 'last_30d';

// URL search-param keys the screen syncs filter/page state into.
export const QUERY_PARAM_KEYS = {
  page: 'page',
  search: 'q',
  period: 'period',
  from: 'from',
  to: 'to',
} as const;
