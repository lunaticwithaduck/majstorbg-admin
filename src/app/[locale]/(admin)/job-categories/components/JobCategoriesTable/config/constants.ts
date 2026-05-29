export const LABELS = {
  pageHeading: 'Job categories',
  pageSub: 'Manage job categories for the post-a-job flow.',
  searchPlaceholder: 'Search by id or name…',
  empty: 'No job categories found.',
  loading: 'Loading job categories…',
  error: 'Failed to load job categories.',
  edit: 'Edit',
  save: 'Save',
  cancel: 'Cancel',
  delete: 'Delete',
  add: 'Add',
  adding: 'Adding…',
  newCategoryHeading: 'New category',
  deleteError: 'Cannot delete: jobs use this category.',
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
