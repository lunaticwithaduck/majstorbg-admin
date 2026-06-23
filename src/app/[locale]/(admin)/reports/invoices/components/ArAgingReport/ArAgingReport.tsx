'use client';

import { Spinner, Text } from '@lunaticwithaduck/webui';
import { useMemo } from 'react';
import { useGetArAgingQuery } from '@/api/store';
import ReportChart from '@/ui/components/composed/ReportChart/ReportChart';
import StatTile from '@/ui/components/composed/StatTile/StatTile';
import StatTileRow from '@/ui/components/composed/StatTileRow/StatTileRow';
import { AGING_LABELS, BUCKET_ORDER, BUCKET_TONE, KPI_LABELS } from './config/constants';
import styles from './ArAgingReport.styles';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return dateFormatter.format(d);
}

export default function ArAgingReport() {
  const { data, isLoading, isError } = useGetArAgingQuery();

  const chartData = useMemo(() => {
    if (!data) return [];
    return BUCKET_ORDER.map(({ key, label }) => ({
      label,
      value: data.buckets[key].amount,
    }));
  }, [data]);

  if (isLoading) {
    return (
      <div className={styles.state}>
        <Spinner />
        <Text as="span" size="sm" color="muted">
          {AGING_LABELS.loading}
        </Text>
      </div>
    );
  }

  if (isError || !data) {
    return (
      <div className={styles.state}>
        <Text as="span" size="sm" color="destructive">
          {AGING_LABELS.error}
        </Text>
      </div>
    );
  }

  return (
    <div className={styles.root}>
      <StatTileRow columns={3}>
        <StatTile
          label={KPI_LABELS.total}
          money={{ amount: data.total.amount, currency: data.currency }}
        />
        {BUCKET_ORDER.map(({ key, label }) => (
          <StatTile
            key={key}
            label={label}
            money={{ amount: data.buckets[key].amount, currency: data.currency }}
            tone={BUCKET_TONE[key]}
          />
        ))}
      </StatTileRow>

      <div className={styles.chartCard}>
        <div className={styles.chartHead}>
          <Text as="h2" size="lg" weight="semibold">
            {AGING_LABELS.chartTitle}
          </Text>
          <Text
            as="span"
            size="sm"
            color="muted"
            value={AGING_LABELS.asOf}
            params={{ date: formatDate(data.asOf) }}
          />
        </div>
        <ReportChart kind="bar" data={chartData} ariaLabel={AGING_LABELS.chartTitle} />
      </div>
    </div>
  );
}
