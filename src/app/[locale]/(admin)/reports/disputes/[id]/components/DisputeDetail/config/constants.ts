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
  timelineSection: 'Timeline',
  timelineEmpty: 'No timeline events recorded yet.',
  viewJob: 'View job',
  none: '—',
} as const;

// Human copy for the Badge cells, keyed by the BE enum value.
export const STATUS_LABELS: Record<string, string> = {
  pending: 'Pending',
  under_review: 'Under review',
  resolved: 'Resolved',
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
  resolved: 'success',
  escalated: 'destructive',
};

// Timeline actor → display label for the row meta.
export const ACTOR_LABELS: Record<string, string> = {
  client: 'Client',
  worker: 'Worker',
  mediator: 'Mediator',
  system: 'System',
};
