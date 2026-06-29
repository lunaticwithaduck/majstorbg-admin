export const PAGE_SIZE = 25;

export const REVIEWS_LABELS = {
  pageHeading: 'Reviews',
  pageSub: 'Moderate reviews and surface suspected review rings.',
  loading: 'Loading reviews…',
  error: 'Failed to load reviews.',
  empty: 'No reviews match these filters.',
  statusFilter: 'Status',
  searchPlaceholder: 'Search worker, reviewer or text…',
} as const;

export const COLUMN_LABELS = {
  worker: 'Worker',
  reviewer: 'Reviewer',
  rating: 'Rating',
  body: 'Review',
  status: 'Status',
  created: 'Date',
  actions: 'Actions',
} as const;

export const QUERY_KEYS = {
  page: 'page',
  status: 'status',
  search: 'q',
} as const;

export const STATUS_LABELS: Record<string, string> = {
  visible: 'Visible',
  hidden: 'Hidden',
  removed: 'Removed',
};

export const STATUS_BADGE: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  visible: 'success',
  hidden: 'secondary',
  removed: 'destructive',
};

export const STATUS_FILTER_OPTIONS: readonly { value: string; label: string }[] = [
  { value: 'all', label: 'All statuses' },
  { value: 'visible', label: 'Visible' },
  { value: 'hidden', label: 'Hidden' },
];
