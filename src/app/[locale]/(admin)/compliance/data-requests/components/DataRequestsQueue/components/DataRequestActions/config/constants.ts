export const ACTION_LABELS = {
  verify: 'Verify identity',
  verifyTitle: 'Verify requester identity',
  verifyBody:
    'Confirm you have verified the requester is the data subject (or an authorised representative) before fulfilling.',
  verifyConfirm: 'Confirm verified',
  fulfilExport: 'Generate export',
  download: 'Download bundle',
  erase: 'Erase data',
  eraseTitle: 'Confirm erasure',
  eraseBody: 'This permanently erases the personal data for this subject and cannot be undone.',
  retainedHeading: 'Retained records',
  retainedNote:
    'Legally-required records (invoices, tax and dispute/financial history) are retained per statutory obligations.',
  reasonLabel: 'Reason',
  reasonPlaceholder: 'Record the basis for this erasure…',
  eraseConfirm: 'Erase data',
  cancel: 'Cancel',
  error: 'Could not complete the action. Try again.',
} as const;
