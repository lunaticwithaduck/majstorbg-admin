export const VAT_LABELS = {
  sectionTitle: 'VAT (ДДС)',
  rateLabel: 'Rate',
  registeredLabel: 'VAT-registered',
  vatIdLabel: 'VAT number',
  vatIdPlaceholder: 'BG123456789…',
  save: 'Save VAT settings',
  saved: 'Saved.',
  invalid: 'Rate must be between 0 and 100.',
  error: 'Could not save VAT settings. Try again.',
  loading: 'Loading VAT settings…',
  loadError: 'Failed to load VAT settings.',
} as const;

export const MIN_RATE = 0;
export const MAX_RATE = 100;
