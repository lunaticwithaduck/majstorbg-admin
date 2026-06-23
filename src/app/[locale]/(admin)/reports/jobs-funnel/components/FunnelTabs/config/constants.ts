import { routes } from '@/config/routes';

// Tab strip for the Jobs funnel report (R2). `value` doubles as the active key,
// matched against the locale-stripped pathname; `href` is the destination.
export const FUNNEL_TABS = [
  { value: 'overview', label: 'Overview', href: routes.reports.jobsFunnel },
  { value: 'breakdown', label: 'Breakdown', href: routes.reports.jobsFunnelBreakdown },
] as const;

export type FunnelTabValue = (typeof FUNNEL_TABS)[number]['value'];

export const FUNNEL_TABS_LABELS = {
  heading: 'Jobs funnel',
  sub: 'Posting-to-completion conversion across the marketplace.',
} as const;
