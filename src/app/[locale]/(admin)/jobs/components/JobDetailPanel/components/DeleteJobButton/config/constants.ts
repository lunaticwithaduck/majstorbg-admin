export const DELETE_LABELS = {
  trigger: 'Delete job',
  dialogTitle: 'Delete this job?',
  dialogBody:
    'This permanently removes the job along with any bids and escrow records. This cannot be undone.',
  confirm: 'Delete',
  cancel: 'Cancel',
  deleting: 'Deleting…',
  errorFallback: 'Failed to delete the job. Please try again.',
} as const;
