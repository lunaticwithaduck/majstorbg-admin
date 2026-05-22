export const COLUMN_LABELS = {
  name: 'Name',
  email: 'Email',
  role: 'Role',
  phone: 'Phone',
  createdAt: 'Joined',
  onboardingCompletedAt: 'Onboarded',
  actions: 'Actions',
} as const;

export const TABLE_LABELS = {
  pageHeading: 'User report',
  pageSub: 'All registered users across the platform.',
  loading: 'Loading users…',
  error: 'Failed to load users.',
  empty: 'No users found.',
  view: 'View',
  noPhone: '—',
  notOnboarded: '—',
  onboarded: 'Yes',
  searchPlaceholder: 'Search name or email…',
  roleFilterLabel: 'Role',
  roleAll: 'All roles',
  roleWorker: 'Worker',
  roleClient: 'Client',
} as const;

export const PAGE_SIZE = 25;

export const ROLE_FILTER_VALUES = ['all', 'worker', 'client'] as const;
export type RoleFilter = (typeof ROLE_FILTER_VALUES)[number];
