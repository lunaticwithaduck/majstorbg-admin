import type {
  CancellationByPriorStage,
  StuckJobStatus,
} from '@/api/admin-cancellation-endpoints';

export const PAGE_SIZE = 25;

// Default age threshold (days) sent as `olderThanDays` for the open half of
// the stuck rule. The BE defaults to the same; sent explicitly so the URL is
// self-describing once a user changes it.
export const DEFAULT_OLDER_THAN_DAYS = 7;

// Shown in KPI tiles / cells before the data resolves.
export const DASH = '—';

export const DEFAULT_PERIOD_PRESET = 'last_30d';

export const DEFAULT_SORT_BY = 'createdAt' as const;
export const DEFAULT_SORT_DIR = 'asc' as const;

export const PAGE_LABELS = {
  pageHeading: 'Cancellations & stuck jobs',
  pageSub:
    'Cancellation rate by the stage jobs reached, plus jobs that have stalled open or awaiting confirmation.',
  loading: 'Loading stuck jobs…',
  error: 'Failed to load stuck jobs.',
  empty: 'No stuck jobs match these filters.',
  view: 'View',
  searchPlaceholder: 'Search title, category or city…',
  exportCsv: 'Export CSV',
} as const;

export const KPI_LABELS = {
  totalJobs: 'Jobs in window',
  cancelled: 'Cancelled',
  cancellationRate: 'Cancellation rate',
  stuck: 'Stuck jobs',
} as const;

export const CHART_LABELS = {
  priorStageTitle: 'Cancelled by prior stage',
  priorStageAria: 'Cancelled jobs broken down by the stage reached before cancellation',
  beforeOffers: 'Before offers',
  afterOffers: 'After offers',
  afterAccepted: 'After accepted',
} as const;

export const COLUMN_LABELS = {
  job: 'Job',
  status: 'Status',
  category: 'Category',
  city: 'City',
  age: 'Age',
  scheduled: 'Scheduled',
  created: 'Created',
  actions: 'Actions',
} as const;

// Human-facing copy for the status Badge, keyed by the BE enum value. Typed
// loose-key Record<string,string> and indexed defensively at the call site so
// an unexpected status string falls back to the raw value (no TS7053).
export const STATUS_BADGE_LABELS: Record<string, string> = {
  open: 'Open',
  awaiting_confirmation: 'Awaiting confirmation',
};

type BadgeVariant =
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'outline';

// Badge variant per stuck status — awaiting_confirmation is the worse signal
// (work is done, client is silent), open-but-stale is a warning.
export const STATUS_BADGE_VARIANT: Record<string, BadgeVariant> = {
  open: 'warning',
  awaiting_confirmation: 'destructive',
};

// Donut slice order for the prior-stage chart. Keys are the
// CancellationByPriorStage fields so the component can index the summary
// directly with full type-safety.
export const PRIOR_STAGE_ORDER: {
  key: keyof CancellationByPriorStage;
  label: string;
}[] = [
  { key: 'beforeOffers', label: CHART_LABELS.beforeOffers },
  { key: 'afterOffers', label: CHART_LABELS.afterOffers },
  { key: 'afterAccepted', label: CHART_LABELS.afterAccepted },
];

// Stuck statuses, for typing the badge cell input without importing the enum
// shape into every call.
export type StuckStatus = StuckJobStatus;

// URL query-param keys this screen syncs into the address bar.
export const QUERY_KEYS = {
  page: 'page',
  search: 'q',
  period: 'period',
  from: 'from',
  to: 'to',
  sortBy: 'sortBy',
  sortDir: 'dir',
} as const;
