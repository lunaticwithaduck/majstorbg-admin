import type { DisputeStatus } from '@/api/admin-disputes-endpoints';

export const PAGE_SIZE = 25;

// Hours-per-day divisor for the "age" column / KPI conversion.
export const HOURS_PER_DAY = 24;

export const DISPUTES_LABELS = {
  pageHeading: 'Disputes queue',
  pageSub: 'Open and in-flight disputes across the platform, oldest first.',
  loading: 'Loading disputes…',
  error: 'Failed to load disputes.',
  empty: 'No disputes match these filters.',
  view: 'View',
  searchPlaceholder: 'Search job, worker or raiser…',
  exportCsv: 'Export CSV',
  statusFilterLabel: 'Status',
  typeFilterLabel: 'Type',
  openFilterLabel: 'Scope',
  none: '—',
} as const;

export const COLUMN_LABELS = {
  job: 'Job',
  type: 'Type',
  status: 'Status',
  worker: 'Worker',
  raiser: 'Raiser',
  amount: 'At risk',
  age: 'Age',
  opened: 'Opened',
  actions: 'Actions',
} as const;

export const KPI_LABELS = {
  open: 'Open',
  escalated: 'Escalated',
  avgAge: 'Avg age',
  atRisk: 'Total at risk',
} as const;

// Shown in KPI tiles before the summary resolves.
export const KPI_PLACEHOLDER = '—';

export const CHART_LABELS = {
  statusMix: 'Disputes by status',
} as const;

// 'all' is the UI-only sentinel for "no filter"; the rest map 1:1 to the BE enum.
export const STATUS_FILTER_VALUES = [
  'all',
  'pending',
  'under_review',
  'resolved',
  'escalated',
] as const;
export type StatusFilter = (typeof STATUS_FILTER_VALUES)[number];

export const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: 'All statuses',
  pending: 'Pending',
  under_review: 'Under review',
  resolved: 'Resolved',
  escalated: 'Escalated',
};

export const TYPE_FILTER_VALUES = [
  'all',
  'unfinished',
  'poor_quality',
  'money',
  'materials',
] as const;
export type TypeFilter = (typeof TYPE_FILTER_VALUES)[number];

export const TYPE_FILTER_LABELS: Record<TypeFilter, string> = {
  all: 'All types',
  unfinished: 'Unfinished',
  poor_quality: 'Poor quality',
  money: 'Money',
  materials: 'Materials',
};

// 'open' restricts to non-terminal disputes (BE `open=true`); 'any' clears it.
export const OPEN_FILTER_VALUES = ['open', 'any'] as const;
export type OpenFilter = (typeof OPEN_FILTER_VALUES)[number];

export const OPEN_FILTER_LABELS: Record<OpenFilter, string> = {
  open: 'Open only',
  any: 'All disputes',
};

// Human-facing copy for the Badge cells, keyed by the BE enum value.
export const STATUS_BADGE_LABELS: Record<string, string> = {
  pending: 'Pending',
  under_review: 'Under review',
  resolved: 'Resolved',
  escalated: 'Escalated',
};

export const TYPE_BADGE_LABELS: Record<string, string> = {
  unfinished: 'Unfinished',
  poor_quality: 'Poor quality',
  money: 'Money',
  materials: 'Materials',
};

// Badge variant per status — escalated is destructive, resolved is success.
export const STATUS_BADGE_VARIANT: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  pending: 'warning',
  under_review: 'primary',
  resolved: 'success',
  escalated: 'destructive',
};

// Donut slice order + label for the status-mix chart.
export const STATUS_CHART_ORDER: DisputeStatus[] = [
  'pending',
  'under_review',
  'escalated',
  'resolved',
];

// URL query-param keys this screen syncs into the address bar.
export const QUERY_KEYS = {
  page: 'page',
  search: 'q',
  status: 'status',
  type: 'type',
  open: 'open',
  sortDir: 'dir',
} as const;

export const DEFAULT_SORT_DIR = 'asc' as const;
