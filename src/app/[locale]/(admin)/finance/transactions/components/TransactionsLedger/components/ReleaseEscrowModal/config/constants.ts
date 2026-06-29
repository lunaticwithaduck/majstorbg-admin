export const RELEASE_LABELS = {
  trigger: 'Release',
  title: 'Release escrow',
  body: 'Release the held escrow to the worker. Only available once the job is complete. Audited.',
  reasonLabel: 'Reason',
  reasonPlaceholder: 'Record the rationale for releasing the escrow…',
  confirm: 'Release escrow',
  cancel: 'Cancel',
  error: 'Could not release the escrow. Try again.',
} as const;
