import type { ReportTab } from '@/api/admin-moderation-endpoints';

export const PAGE_SIZE = 25;

export const MODERATION_LABELS = {
  pageHeading: 'Moderation',
  pageSub: 'Reported users, flagged content and reviews awaiting a decision.',
  loading: 'Loading reports…',
  error: 'Failed to load reports.',
  empty: 'No reports in this queue.',
} as const;

export const COLUMN_LABELS = {
  subject: 'Reported',
  reporter: 'Reporter',
  reason: 'Reason',
  status: 'Status',
  reportedAt: 'Reported',
  actions: 'Actions',
} as const;

export const QUERY_KEYS = {
  page: 'page',
  tab: 'tab',
} as const;

export const TAB_OPTIONS: readonly { value: ReportTab; label: string }[] = [
  { value: 'user', label: 'Reported users' },
  { value: 'content', label: 'Flagged content' },
  { value: 'review', label: 'Flagged reviews' },
];

export const ENTITY_TYPE_LABELS: Record<string, string> = {
  user: 'User',
  photo: 'Photo',
  review: 'Review',
  chat: 'Chat',
};

export const REPORT_STATUS_LABELS: Record<string, string> = {
  open: 'Open',
  actioned: 'Actioned',
  dismissed: 'Dismissed',
};

export const REPORT_STATUS_BADGE: Record<
  string,
  'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'outline'
> = {
  open: 'warning',
  actioned: 'success',
  dismissed: 'secondary',
};
