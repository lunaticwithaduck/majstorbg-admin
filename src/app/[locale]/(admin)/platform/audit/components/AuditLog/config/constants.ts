export const PAGE_SIZE = 25;

export const AUDIT_LABELS = {
  pageHeading: 'Audit log',
  pageSub: 'Every state-changing admin action — actor, target, reason and time.',
  loading: 'Loading audit log…',
  error: 'Failed to load the audit log.',
  empty: 'No audit entries match this filter.',
  searchPlaceholder: 'Search action (e.g. dispute.resolve)…',
} as const;

export const COLUMN_LABELS = {
  when: 'When',
  actor: 'Actor',
  action: 'Action',
  target: 'Target',
  reason: 'Reason',
} as const;

export const QUERY_KEYS = {
  page: 'page',
  action: 'action',
} as const;
