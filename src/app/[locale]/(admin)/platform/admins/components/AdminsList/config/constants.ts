import type { AdminRole } from '@/auth/permissions';

export const ADMINS_LABELS = {
  pageHeading: 'Admins & roles',
  pageSub: 'Staff with admin access — promote users and manage their roles.',
  loading: 'Loading admins…',
  error: 'Failed to load admins.',
  empty: 'No admins yet.',
} as const;

export const COLUMN_LABELS = {
  name: 'Name',
  email: 'Email',
  role: 'Role',
  lastActive: 'Last active',
} as const;

export const PAGE_SIZE = 100;

export const ROLE_LABELS: Record<string, string> = {
  superadmin: 'Super admin',
  finance: 'Finance',
  support: 'Support',
  moderator: 'Moderator',
  viewer: 'Viewer',
};

export const ROLE_BADGE: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  superadmin: 'primary',
  finance: 'secondary',
  support: 'secondary',
  moderator: 'secondary',
  viewer: 'outline',
};

export const ROLE_OPTIONS: readonly { value: AdminRole; label: string }[] = [
  { value: 'superadmin', label: 'Super admin' },
  { value: 'finance', label: 'Finance' },
  { value: 'support', label: 'Support' },
  { value: 'moderator', label: 'Moderator' },
  { value: 'viewer', label: 'Viewer' },
];

export const ROLE_CELL_LABELS = {
  change: 'Change',
  title: 'Change role',
  roleLabel: 'Role',
  save: 'Save',
  cancel: 'Cancel',
  error: 'Could not update the role. Try again.',
} as const;

export const PROMOTE_LABELS = {
  trigger: 'Promote user',
  title: 'Promote user to admin',
  body: 'Search a user, pick a role, and grant them admin access.',
  searchLabel: 'Find user',
  searchPlaceholder: 'Search name or email…',
  userLabel: 'User',
  userPlaceholder: 'Select a user…',
  roleLabel: 'Role',
  promote: 'Promote',
  cancel: 'Cancel',
  error: 'Could not promote the user. Try again.',
} as const;
