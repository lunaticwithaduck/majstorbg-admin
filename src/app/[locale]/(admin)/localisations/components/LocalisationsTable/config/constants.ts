export const LABELS = {
  pageHeading: 'Localisations',
  pageSub: 'Manage translation keys for English and Bulgarian.',
  searchPlaceholder: 'Search key or value…',
  localeFilterLabel: 'Locale',
  empty: 'No translations match the current filter.',
  loading: 'Loading translations…',
  error: 'Failed to load translations.',
  missingValue: '—',
  edit: 'Edit',
  save: 'Save',
  cancel: 'Cancel',
  saveError: 'Failed to save. Try again.',
  exportJson: 'Export JSON',
  importJson: 'Import JSON/CSV',
  importing: 'Importing…',
  importSuccess: (count: number) => `Imported ${count} entries.`,
  importError: 'Import failed. Check the file format and try again.',
  importErrorParse:
    'Could not read the file. Use flat JSON ({ "key": "value" }), a [{ locale, key, value }] array, or CSV with key/value columns.',
  importErrorCsvHeader:
    'CSV needs a header row with "key" and "value" columns (and optionally "locale").',
  importErrorNoKeys: 'No rows with a non-empty key were found.',
  importErrorBadLocale: (locale: string) => `Unknown locale "${locale}". Only "en" and "bg" are allowed.`,
  localeBadgeEn: 'EN',
  localeBadgeBg: 'BG',
} as const;

export const COLUMNS = {
  locale: 'Locale',
  key: 'Key',
  value: 'Value',
  updatedAt: 'Updated',
  actions: '',
} as const;

export const LOCALE_FILTER_VALUES = ['en', 'bg'] as const;
export type LocaleFilter = (typeof LOCALE_FILTER_VALUES)[number];

export const LOCALE_FILTER_LABELS: Record<LocaleFilter, string> = {
  en: 'English',
  bg: 'Bulgarian',
};

export const PAGE_SIZE = 50;
