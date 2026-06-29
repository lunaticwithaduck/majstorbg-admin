export const REFUND_LABELS = {
  trigger: 'Refund',
  title: 'Refund transaction',
  body: 'Refund up to the remaining refundable amount. Audited, and reconciles any linked dispute.',
  amountLabel: 'Refund amount',
  refundable: 'Refundable:',
  invalid: 'Amount must be greater than 0 and at most the refundable amount.',
  reasonLabel: 'Reason',
  reasonPlaceholder: 'Record the rationale for this refund…',
  confirm: 'Refund',
  cancel: 'Cancel',
  error: 'Could not process the refund. Try again.',
} as const;
