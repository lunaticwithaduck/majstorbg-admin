export const MOD_CONTROLS_LABELS = {
  statusLabel: 'Account status',
  until: 'Suspended until',
  suspend: 'Suspend',
  ban: 'Ban',
  reinstate: 'Reinstate',
  reasonLabel: 'Reason',
  reasonPlaceholder: 'Record the rationale (sent to the user, and audited)…',
  durationLabel: 'Suspension length',
  days: 'days',
  confirm: 'Apply',
  cancel: 'Cancel',
  error: 'Could not update the account. Try again.',
} as const;

export const MODAL_TITLES: Record<'suspend' | 'ban' | 'reinstate', string> = {
  suspend: 'Suspend account',
  ban: 'Ban account',
  reinstate: 'Reinstate account',
};

export const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  suspended: 'Suspended',
  banned: 'Banned',
};

export const STATUS_BADGE: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  active: 'success',
  suspended: 'warning',
  banned: 'destructive',
};
