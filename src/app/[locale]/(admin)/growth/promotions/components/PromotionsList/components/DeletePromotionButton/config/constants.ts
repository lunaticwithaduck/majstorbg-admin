export const DELETE_LABELS = {
  trigger: 'Delete',
  title: 'Delete promotion',
  body: 'This permanently deletes the promotion code. Existing redemptions are kept.',
  confirm: 'Delete',
  cancel: 'Cancel',
  error: 'Could not delete the promotion. Try again.',
} as const;
