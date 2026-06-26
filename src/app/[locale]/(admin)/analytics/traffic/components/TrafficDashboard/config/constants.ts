import type { PeriodPreset } from '@/ui/components/composed/PeriodSelect/utils/period.utils';

export const DEFAULT_PERIOD_PRESET: PeriodPreset = 'last_30d';
export const CHART_HEIGHT = 280;
export const TOP_N = 8;

export const QUERY_KEYS = {
  period: 'period',
  from: 'from',
  to: 'to',
} as const;

export const TRAFFIC_LABELS = {
  pageHeading: 'Traffic',
  pageSub: 'Visitors, unique hits, pageviews and referrers across the site.',
  periodLabel: 'Period',
  error: 'Failed to load traffic.',
  visitors: 'Visitors',
  uniqueVisitors: 'Unique visitors',
  pageviews: 'Pageviews',
  bounceRate: 'Bounce rate',
  avgDuration: 'Avg. duration',
  overTime: 'Traffic over time',
  byReferrer: 'By referrer',
  topPages: 'Top pages',
  byDevice: 'By device',
  empty: 'No data for this period.',
  none: '—',
  seriesVisitors: 'Visitors',
  seriesPageviews: 'Pageviews',
  pageviewsShort: 'views',
} as const;
