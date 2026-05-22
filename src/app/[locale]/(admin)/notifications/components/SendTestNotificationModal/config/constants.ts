import { ADMIN_NOTIFICATION_KINDS } from '@/api/admin-notification-endpoints';

export const SEND_TEST_LABELS = {
  title: 'Send test notification',
  description: 'Fire a single notification at a target user. Useful for support reproductions.',
  userIdLabel: 'Target user id',
  userIdPlaceholder: 'usr_…',
  kindLabel: 'Kind',
  kindPlaceholder: 'Pick a notification kind',
  payloadLabel: 'Payload (JSON, optional)',
  payloadPlaceholder: '{ "jobId": "job_…" }',
  payloadHint: 'Must be a JSON object. Leave blank for no payload.',
  cancel: 'Cancel',
  submit: 'Send',
  submitting: 'Sending…',
  errorRequiredUserId: 'Target user id is required.',
  errorInvalidPayload: 'Payload must be valid JSON (object).',
  errorFallback: 'Failed to send the notification.',
  success: 'Notification sent.',
} as const;

export const KIND_OPTION_LABELS: Record<(typeof ADMIN_NOTIFICATION_KINDS)[number], string> = {
  bid: 'Bid',
  accepted: 'Accepted',
  message: 'Message',
  arriving: 'Arriving',
  review: 'Review',
  escrow_released: 'Escrow released',
  milestone_alert: 'Milestone alert',
  system_info: 'System info',
};
