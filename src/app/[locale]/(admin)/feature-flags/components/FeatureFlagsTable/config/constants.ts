export const FEATURE_FLAGS_LABELS = {
  pageHeading: 'Feature flags',
  pageSub: 'Toggle flags for all environments. Changes take effect immediately on the next page load.',
  loading: 'Loading flags…',
  error: 'Failed to load flags.',
  empty: 'No flags match the search.',
  searchPlaceholder: 'Search flag key or description…',
  reset: 'Reset',
  enable: 'Enable',
  disable: 'Disable',
  on: 'ON',
  off: 'OFF',
  notSet: '—',
  dbBadge: 'db',
} as const;

export const FEATURE_FLAGS_COLUMNS = {
  key: 'Flag',
  default: 'Default',
  stored: 'DB',
  effective: 'Effective',
  toggle: 'Toggle',
  reset: 'Reset',
} as const;

export const FEATURE_FLAGS_PAGE_SIZE = 25;
