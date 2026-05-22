export const LOCALISATIONS_LABELS = {
  pageHeading: 'Localisations',
  pageSub:
    'Every i18n key shipped by @lunaticwithaduck/i18n, with English and Bulgarian side-by-side.',
  searchPlaceholder: 'Search key or value…',
  statusFilterLabel: 'Status',
  copyMissing: 'Copy missing keys',
  copyMissingCopied: 'Copied!',
  empty: 'No keys match the current filter.',
  loading: 'Loading translations…',
  missingValue: '—',
  statusComplete: 'Complete',
  statusMissingBg: 'Missing BG',
  statusMissingEn: 'Missing EN',
  statusPlaceholder: 'Placeholder',
} as const;

export const LOCALISATIONS_COLUMNS = {
  key: 'Key',
  en: 'English',
  bg: 'Bulgarian',
  status: 'Status',
} as const;

export const STATUS_FILTER_VALUES = [
  'all',
  'complete',
  'missing-bg',
  'missing-en',
  'placeholder',
] as const;
export type StatusFilter = (typeof STATUS_FILTER_VALUES)[number];

export const STATUS_FILTER_LABELS: Record<StatusFilter, string> = {
  all: 'All statuses',
  complete: 'Complete',
  'missing-bg': 'Missing BG',
  'missing-en': 'Missing EN',
  placeholder: 'Placeholder',
};

// Render in chunks so the rendered DOM stays lean — the i18n package ships
// well over a thousand keys.
export const LOCALISATIONS_PAGE_SIZE = 50;

// Marker recognised as an intentional placeholder. Matches the convention used
// across the consumer monorepo when a translation is stubbed.
export const PLACEHOLDER_MARKER = '__placeholder__';
