import type { CampaignChannel, SegmentActivity, SegmentRole } from '@/api/admin-growth-endpoints';

export const CREATE_LABELS = {
  trigger: 'New campaign',
  title: 'New campaign',
  body: 'Build a segment, pick a template, and schedule or send later.',
  nameLabel: 'Name',
  namePlaceholder: 'Campaign name…',
  channelLabel: 'Channel',
  segmentHeading: 'Segment',
  roleLabel: 'Audience',
  cityLabel: 'City',
  cityPlaceholder: 'Any city…',
  categoryLabel: 'Category',
  activityLabel: 'Activity',
  templateLabel: 'Template',
  templatePlaceholder: 'Select a template…',
  scheduleLabel: 'Schedule (optional)',
  create: 'Create campaign',
  cancel: 'Cancel',
  error: 'Could not create the campaign. Try again.',
  anyCategory: 'Any category',
} as const;

export const NONE_CATEGORY = 'none';

export const CHANNEL_OPTIONS: readonly { value: CampaignChannel; label: string }[] = [
  { value: 'email', label: 'Email' },
  { value: 'push', label: 'Push' },
];

export const ROLE_OPTIONS: readonly { value: SegmentRole; label: string }[] = [
  { value: 'all', label: 'All users' },
  { value: 'worker', label: 'Workers' },
  { value: 'client', label: 'Clients' },
];

export const ACTIVITY_OPTIONS: readonly { value: SegmentActivity; label: string }[] = [
  { value: 'all', label: 'Any activity' },
  { value: 'active_30d', label: 'Active in 30 days' },
  { value: 'inactive_30d', label: 'Inactive 30 days' },
];
