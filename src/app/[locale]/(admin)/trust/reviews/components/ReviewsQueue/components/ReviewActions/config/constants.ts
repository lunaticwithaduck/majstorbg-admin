export const REVIEW_ACTION_LABELS = {
  hide: 'Hide',
  remove: 'Remove',
  reasonLabel: 'Reason',
  reasonPlaceholder: 'Record the rationale (audited; recomputes the worker rating)…',
  cancel: 'Cancel',
  error: 'Could not update the review. Try again.',
} as const;

export const MODAL_COPY: Record<
  'hide' | 'remove',
  { title: string; body: string; confirm: string }
> = {
  hide: {
    title: 'Hide review',
    body: 'The review is hidden from the worker profile and excluded from the rating.',
    confirm: 'Hide review',
  },
  remove: {
    title: 'Remove review',
    body: 'The review is permanently removed and excluded from the rating.',
    confirm: 'Remove review',
  },
};
