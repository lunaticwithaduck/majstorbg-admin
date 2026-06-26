export const RING_LABELS = {
  heading: 'Ring signals',
  sub: 'Check a worker for suspected review rings — clusters of mutual or bursty reviews.',
  workerLabel: 'Worker ID',
  workerPlaceholder: 'Enter a worker ID…',
  run: 'Run ring check',
  empty: 'No suspicious clusters found for this worker.',
  error: 'Could not run the ring check. Try again.',
  riskLabel: 'Risk:',
  reviewsLabel: 'Reviews:',
} as const;

export const SIGNAL_LABELS: Record<string, string> = {
  mutual: 'Mutual',
  burst: 'Burst',
  reciprocal: 'Reciprocal',
  velocity: 'Velocity',
};

export const SIGNAL_BADGE: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  mutual: 'warning',
  burst: 'warning',
  reciprocal: 'warning',
  velocity: 'destructive',
};
