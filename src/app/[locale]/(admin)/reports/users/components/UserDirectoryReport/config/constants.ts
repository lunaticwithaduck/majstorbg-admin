// Copy + config for the User directory report screen (R2). ALL_CAPS per-concern.

export const PAGE_SIZE = 25;

export const PAGE_COPY = {
  heading: 'User directory',
  sub: 'Every registered user across the platform, with verification and activity at a glance.',
} as const;

// Summary KPI tile labels (StatTileRow). value/runtime numbers come from the hook.
export const SUMMARY_LABELS = {
  total: 'Total users',
  workers: 'Workers',
  clients: 'Clients',
  verifiedWorkers: 'Verified workers',
  onboarded: 'Onboarded',
} as const;

export const COLUMN_LABELS = {
  name: 'Name',
  email: 'Email',
  role: 'Role',
  verified: 'Verified',
  createdAt: 'Joined',
  lastActiveAt: 'Last active',
  actions: 'Actions',
} as const;

export const TABLE_COPY = {
  searchPlaceholder: 'Search name or email…',
  loading: 'Loading users…',
  error: 'Failed to load users.',
  empty: 'No users match these filters.',
  view: 'View',
  never: 'Never',
  dash: '—',
} as const;

export const ROLE_BADGE_LABELS: Record<string, string> = {
  worker: 'Worker',
  client: 'Client',
};

export const VERIFIED_BADGE_LABELS = {
  yes: 'Verified',
  no: 'Unverified',
} as const;

// Role filter Select (R2). 'all' is the sentinel for "no role filter".
export const ROLE_FILTER_VALUES = ['all', 'worker', 'client'] as const;
export type RoleFilter = (typeof ROLE_FILTER_VALUES)[number];

export const ROLE_FILTER_LABELS = {
  label: 'Role',
  all: 'All roles',
  worker: 'Workers',
  client: 'Clients',
} as const;

// Verified filter Select (R2). 'all' is the sentinel for "no verified filter".
export const VERIFIED_FILTER_VALUES = ['all', 'verified', 'unverified'] as const;
export type VerifiedFilter = (typeof VERIFIED_FILTER_VALUES)[number];

export const VERIFIED_FILTER_LABELS = {
  label: 'Verification',
  all: 'Any',
  verified: 'Verified',
  unverified: 'Unverified',
} as const;

export const EXPORT_COPY = {
  label: 'Export CSV',
  filenamePrefix: 'user-directory',
} as const;

// Server-side sort. These map to ListUserDirectoryArgs.sortBy.
export const SORTABLE_KEYS = ['createdAt', 'lastActiveAt'] as const;
export type SortKey = (typeof SORTABLE_KEYS)[number];
export type SortDir = 'asc' | 'desc';

export const DEFAULT_SORT_KEY: SortKey = 'createdAt';
export const DEFAULT_SORT_DIR: SortDir = 'desc';

// URL search-param keys the screen syncs filter/sort/page state into.
export const QUERY_PARAM_KEYS = {
  page: 'page',
  search: 'q',
  role: 'role',
  verified: 'verified',
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
