export const FEATURE_FLAGS_LABELS = {
  pageHeading: 'Feature flags',
  pageSub: 'Toggle flags defined in @lunaticwithaduck/feature-flags. Overrides persist to your browser.',
  bannerCopy:
    'Overrides are stored in **your browser only** — they do not affect other users or production.',
  loading: 'Loading flags…',
  empty: 'No flags are defined in @lunaticwithaduck/feature-flags.',
  searchPlaceholder: 'Search flag key or description…',
  resetAll: 'Reset all overrides',
  reset: 'Reset',
  enable: 'Enable',
  disable: 'Disable',
  on: 'ON',
  off: 'OFF',
  overrideBadge: 'override',
  envSet: 'set',
  envUnset: '—',
} as const;

export const FEATURE_FLAGS_COLUMNS = {
  key: 'Flag',
  default: 'Default',
  env: 'Env',
  effective: 'Effective',
  toggle: 'Toggle',
  reset: 'Reset',
} as const;

// Render a small set per page so the UI is browseable. The package currently
// ships ~100 flags — pagination keeps the rendered DOM lean.
export const FEATURE_FLAGS_PAGE_SIZE = 25;
