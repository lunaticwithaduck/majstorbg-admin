export const COLUMN_LABELS = {
  id: 'ID',
  title: 'Title',
  category: 'Category',
  status: 'Status',
  client: 'Client',
  budget: 'Budget',
  city: 'City',
  createdAt: 'Posted',
  actions: 'Actions',
} as const;

export const TABLE_LABELS = {
  pageHeading: 'Jobs explorer',
  pageSub: 'All jobs posted across the platform.',
  loading: 'Loading jobs…',
  error: 'Failed to load jobs.',
  empty: 'No jobs found.',
  view: 'View',
  noCity: '—',
  searchPlaceholder: 'Search title or client…',
  statusFilterLabel: 'Status',
  statusAll: 'All statuses',
  statusOpen: 'Open',
  statusAccepted: 'Accepted',
  statusInProgress: 'In progress',
  statusCompleted: 'Completed',
  statusCancelled: 'Cancelled',
  newJob: '+ New job',
} as const;

export const PAGE_SIZE = 25;

export const STATUS_FILTER_VALUES = [
  'all',
  'open',
  'accepted',
  'in_progress',
  'completed',
  'cancelled',
] as const;
export type StatusFilter = (typeof STATUS_FILTER_VALUES)[number];

export const BUDGET_TYPE_LABELS = {
  fixed: 'fixed',
  hourly: '/hr',
  open: 'open',
} as const;
