export const DELETE_LABELS = {
  trigger: 'Delete user',
  dialogTitle: 'Delete this user?',
  dialogBody:
    'This permanently removes the user and all associated profile data. This cannot be undone.',
  confirm: 'Delete',
  cancel: 'Cancel',
  deleting: 'Deleting…',
  errorFallback: 'Failed to delete the user. Please try again.',
} as const;
