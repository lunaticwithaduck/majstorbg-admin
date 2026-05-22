import {
  Briefcase,
  CircleDollarSign,
  Gavel,
  MessageCircle,
  Star,
  StarHalf,
  type LucideIcon,
} from 'lucide-react';
import type { ActivityEventKind } from '@/api/admin-activity-endpoints';

export const ACTIVITY_TIMELINE_LABELS = {
  loading: 'Loading activity…',
  error: 'Failed to load activity.',
  empty: 'No activity recorded yet.',
  view: 'View',
} as const;

type KindMeta = {
  icon: LucideIcon;
  iconClassName: string;
};

// Token-class colors only — see R4. `text-text` is the neutral fallback.
export const ACTIVITY_KIND_META: Record<ActivityEventKind, KindMeta> = {
  job_posted: { icon: Briefcase, iconClassName: 'text-primary' },
  bid_placed: { icon: Gavel, iconClassName: 'text-primary' },
  message_sent: { icon: MessageCircle, iconClassName: 'text-muted' },
  payment: { icon: CircleDollarSign, iconClassName: 'text-text' },
  review_written: { icon: StarHalf, iconClassName: 'text-text' },
  review_received: { icon: Star, iconClassName: 'text-text' },
};

export const ACTIVITY_ICON_SIZE = 16;
