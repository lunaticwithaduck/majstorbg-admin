import { ADMIN_NOTIFICATION_KINDS } from '@/api/admin-notification-endpoints';

export const COLUMN_LABELS = {
  id: 'ID',
  user: 'User',
  kind: 'Kind',
  payload: 'Payload',
  createdAt: 'Sent',
  read: 'Read',
  actions: 'Actions',
} as const;

export const TABLE_LABELS = {
  pageHeading: 'Notifications',
  pageSub: 'Audit log of every notification dispatched by the platform.',
  loading: 'Loading notifications…',
  error: 'Failed to load notifications.',
  empty: 'No notifications found.',
  searchPlaceholder: 'Filter by user id…',
  userFilterLabel: 'User id',
  userFilterPlaceholder: 'e.g. usr_…',
  userFilterReset: 'Clear filter',
  sendTestTrigger: 'Send test notification',
  readYes: 'Read',
  readNo: 'Unread',
  noUserName: '—',
  noPayload: '—',
} as const;

export const PAGE_SIZE = 25;

/** Re-exported from the endpoint module so the UI can iterate kinds without
 *  re-declaring the list. Mirrors the BE Prisma enum verbatim. */
export const KIND_OPTIONS = ADMIN_NOTIFICATION_KINDS;

export const KIND_LABELS: Record<(typeof ADMIN_NOTIFICATION_KINDS)[number], string> = {
  bid: 'Bid',
  accepted: 'Accepted',
  message: 'Message',
  arriving: 'Arriving',
  review: 'Review',
  escrow_released: 'Escrow released',
  milestone_alert: 'Milestone alert',
  system_info: 'System info',
};
