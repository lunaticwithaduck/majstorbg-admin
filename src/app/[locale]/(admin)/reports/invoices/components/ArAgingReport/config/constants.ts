import type { InvoiceAgingBucket } from '@/api/admin-invoices-endpoints';

export const AGING_LABELS = {
  loading: 'Loading aging…',
  error: 'Failed to load aging report.',
  chartTitle: 'Outstanding by aging bucket',
  asOf: 'As of {date}',
} as const;

export const KPI_LABELS = {
  total: 'Total outstanding',
  current: 'Current',
  d1_30: '1–30 days',
  d31_60: '31–60 days',
  d61_90: '61–90 days',
  d90_plus: '90+ days',
} as const;

// Bucket render order + label for KPI tiles and the bar chart.
export const BUCKET_ORDER: { key: InvoiceAgingBucket; label: string }[] = [
  { key: 'current', label: KPI_LABELS.current },
  { key: 'd1_30', label: KPI_LABELS.d1_30 },
  { key: 'd31_60', label: KPI_LABELS.d31_60 },
  { key: 'd61_90', label: KPI_LABELS.d61_90 },
  { key: 'd90_plus', label: KPI_LABELS.d90_plus },
];

// Tile tone escalates with bucket age so overdue weight reads at a glance.
export const BUCKET_TONE: Record<
  InvoiceAgingBucket,
  'default' | 'success' | 'warning' | 'destructive'
> = {
  current: 'success',
  d1_30: 'default',
  d31_60: 'warning',
  d61_90: 'warning',
  d90_plus: 'destructive',
};
