import type { ModerationActionKind } from '@/api/admin-moderation-mutations';

export const ACTION_LABELS = {
  trigger: 'Action',
  title: 'Action this report',
  body: 'Pick an action. Suspend/ban also update the reported user. All actions are audited.',
  actionLabel: 'Action',
  reasonLabel: 'Reason',
  reasonPlaceholder: 'Record the rationale for this decision…',
  durationLabel: 'Suspension length',
  days: 'days',
  confirm: 'Apply',
  cancel: 'Cancel',
  error: 'Could not action the report. Try again.',
} as const;

export const ACTION_OPTIONS: readonly { value: ModerationActionKind; label: string }[] = [
  { value: 'dismiss', label: 'Dismiss report' },
  { value: 'remove_content', label: 'Remove content' },
  { value: 'warn', label: 'Warn user' },
  { value: 'suspend', label: 'Suspend user' },
  { value: 'ban', label: 'Ban user' },
];
