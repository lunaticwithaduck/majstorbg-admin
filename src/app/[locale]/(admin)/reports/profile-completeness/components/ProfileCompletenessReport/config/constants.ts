// Copy + config for the Profile completeness report screen (R2). ALL_CAPS per-concern.

export const PAGE_SIZE = 25;

export const PAGE_COPY = {
  heading: 'Profile completeness',
  sub: 'Share of workers missing key profile fields, and the workers who still need to fill them in.',
} as const;

// Summary KPI tile labels (StatTileRow). Runtime numbers come from the hook.
export const SUMMARY_LABELS = {
  totalWorkers: 'Total workers',
  incompleteWorkers: 'Incomplete profiles',
  completeWorkers: 'Complete profiles',
  completionRate: 'Completion rate',
} as const;

// The six tracked profile fields. Keys mirror the BE/FE field vocabulary.
export const FIELD_LABELS = {
  bio: 'Bio',
  avatar: 'Avatar',
  skills: 'Skills',
  serviceArea: 'Service area',
  bankAccount: 'Bank account',
  verifiedPhone: 'Verified phone',
} as const;

// Render order for the missing-fields chips, CSV, and the chart bars.
export const FIELD_ORDER = [
  'bio',
  'avatar',
  'skills',
  'serviceArea',
  'bankAccount',
  'verifiedPhone',
] as const;

export const CHART_COPY = {
  title: 'Workers missing each field',
  ariaLabel: 'Bar chart of the number of workers missing each profile field',
} as const;

export const COLUMN_LABELS = {
  name: 'Worker',
  email: 'Email',
  missing: 'Missing fields',
  missingCount: 'Missing',
  createdAt: 'Joined',
  actions: 'Actions',
} as const;

export const TABLE_COPY = {
  searchPlaceholder: 'Search name or email…',
  loading: 'Loading incomplete profiles…',
  error: 'Failed to load incomplete profiles.',
  empty: 'No incomplete worker profiles match these filters.',
  view: 'View',
  dash: '—',
} as const;

export const EXPORT_COPY = {
  label: 'Export CSV',
  filenamePrefix: 'profile-completeness',
} as const;

// Server-side sort. These map to ListIncompleteProfilesArgs.sortBy.
export const SORTABLE_KEYS = ['createdAt', 'name'] as const;
export type SortKey = (typeof SORTABLE_KEYS)[number];
export type SortDir = 'asc' | 'desc';

export const DEFAULT_SORT_KEY: SortKey = 'createdAt';
export const DEFAULT_SORT_DIR: SortDir = 'desc';

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

export const DEFAULT_PERIOD = 'last_30d' as const;
