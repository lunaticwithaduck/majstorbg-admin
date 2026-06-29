import type { DisputeOutcome } from '@/api/admin-disputes-mutations';

export const RESOLUTION_LABELS = {
  outcomeLabel: 'Outcome',
  amountLabel: 'Refund amount',
  heldPrefix: 'Held in escrow:',
  amountInvalid: 'Amount must be greater than 0 and at most the held escrow.',
  reasonLabel: 'Reason',
  reasonPlaceholder: 'Record the rationale for this decision…',
  notify: 'Notify both parties by email',
  resolve: 'Resolve dispute',
  alreadyResolved: 'This dispute is resolved. Reopen it to take further action.',
  confirmTitle: 'Confirm resolution',
  confirmBody:
    'This triggers the matching money action (refund or escrow release) and cannot be undone without reopening.',
  confirm: 'Confirm & resolve',
  cancel: 'Cancel',
  error: 'Could not resolve the dispute. Try again.',
} as const;

export const OUTCOME_OPTIONS: readonly { value: DisputeOutcome; label: string }[] = [
  { value: 'release_worker', label: 'Release escrow to worker' },
  { value: 'refund_client', label: 'Refund the client' },
  { value: 'partial', label: 'Partial refund / split' },
  { value: 'no_fault', label: 'No fault — close without money movement' },
];

export const OUTCOME_LABELS: Record<DisputeOutcome, string> = {
  release_worker: 'Release escrow to worker',
  refund_client: 'Refund the client',
  partial: 'Partial refund / split',
  no_fault: 'No fault',
};

/** Outcomes that require an explicit amount field (capped at held escrow). */
export const OUTCOMES_NEEDING_AMOUNT: readonly DisputeOutcome[] = ['refund_client', 'partial'];
