export const DETAIL_LABELS = {
  back: 'Back to disputes',
  loading: 'Loading dispute…',
  error: 'Failed to load dispute.',
  notFound: 'Dispute not found.',
  overview: 'Overview',
  disputeId: 'Dispute ID',
  type: 'Type',
  status: 'Status',
  amount: 'At risk',
  job: 'Job',
  worker: 'Worker',
  created: 'Opened',
  assignedTo: 'Assigned to',
  unassigned: 'Unassigned',
  heldEscrow: 'Held in escrow',
  released: 'Released',
  refunded: 'Refunded',
  resolutionSection: 'Resolution',
  evidenceSection: 'Evidence',
  notesSection: 'Notes',
  timelineSection: 'Timeline',
  timelineEmpty: 'No timeline events recorded yet.',
  viewJob: 'View job',
  none: '—',
} as const;

// Human copy for the Badge cells, keyed by the BE enum value.
export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  under_review: 'Under review',
  assigned: 'Assigned',
  resolved: 'Resolved',
  reopened: 'Reopened',
  escalated: 'Escalated',
};

export const TYPE_LABELS: Record<string, string> = {
  unfinished: 'Unfinished',
  poor_quality: 'Poor quality',
  money: 'Money',
  materials: 'Materials',
};

export const STATUS_BADGE_VARIANT: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  pending: 'warning',
  under_review: 'primary',
  assigned: 'primary',
  resolved: 'success',
  reopened: 'warning',
  escalated: 'destructive',
};

// Timeline actor → display label for the row meta.
export const ACTOR_LABELS: Record<string, string> = {
  client: 'Client',
  worker: 'Worker',
  mediator: 'Mediator',
  system: 'System',
};
