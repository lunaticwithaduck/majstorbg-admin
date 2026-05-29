export const LABELS = {
  pageHeading: 'Skill categories',
  pageSub: 'Manage worker skill categories.',
  searchPlaceholder: 'Search by id or name…',
  empty: 'No skill categories found.',
  loading: 'Loading skill categories…',
  error: 'Failed to load skill categories.',
  edit: 'Edit',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  add: 'Add',
  adding: 'Adding…',
  newCategoryHeading: 'New category',
  deleteError: 'Cannot delete: workers have this skill.',
  deleteGenericError: 'Failed to delete. Try again.',
} as const;

export const COLUMNS = {
  id: 'ID',
  nameEn: 'English Name',
  nameBg: 'Bulgarian Name',
  sortOrder: 'Sort Order',
  actions: 'Actions',
} as const;

export const PAGE_SIZE = 25;
