export const COMMISSION_LABELS = {
  pageHeading: 'Commission',
  pageSub: 'Platform take-rate, globally and per category.',
  loading: 'Loading commission settings…',
  error: 'Failed to load commission settings.',
  globalSection: 'Global take-rate',
  globalLabel: 'Take-rate',
  perCategorySection: 'Per-category overrides',
  perCategoryEmpty: 'No per-category overrides.',
  rateLabel: 'Rate',
  save: 'Save changes',
  saved: 'Saved.',
  invalid: 'Take-rate must be between 0 and 100.',
  saveError: 'Could not save commission settings. Try again.',
} as const;

export const MIN_RATE = 0;
export const MAX_RATE = 100;
