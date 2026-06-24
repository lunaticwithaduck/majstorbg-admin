'use client';

import { Select, SelectItem, Text } from '@lunaticwithaduck/webui';
import { useCallback, useMemo } from 'react';
import { useGetJobsFunnelQuery } from '@/api/store';
import { useReportQuery } from '@/lib/report-query.utils';
import {
  type PeriodPreset,
  type PeriodRange,
  presetToRange,
} from '@/ui/components/composed/PeriodSelect/utils/period.utils';
import ReportChart from '@/ui/components/composed/ReportChart/ReportChart';
import ReportFilters from '@/ui/components/composed/ReportFilters/ReportFilters';
import StatTile from '@/ui/components/composed/StatTile/StatTile';
import StatTileRow from '@/ui/components/composed/StatTileRow/StatTileRow';
import {
  CATEGORY_FILTER_LABEL,
  CATEGORY_OPTIONS,
  CHART_COPY,
  DASH,
  DEFAULT_PERIOD_PRESET,
  FUNNEL_STAGE_LABELS,
  KPI_LABELS,
  QUERY_PARAM_KEYS,
  TREND_PERIOD,
} from './config/constants';
import styles from './JobsFunnelReport.styles';

function formatPercent(fraction: number | undefined): string {
  if (fraction === undefined || Number.isNaN(fraction)) return DASH;
  return `${Math.round(fraction * 100)}%`;
}

// StatTile.value is `string | number` (no `undefined` under
// exactOptionalPropertyTypes); render a dash while the funnel totals load.
function kpiValue(n: number | undefined): string | number {
  return n ?? DASH;
}

export default function JobsFunnelReport() {
  // Filters live in the URL (shareable, reload-safe) via the shared hook. The
  // overview tab has no pagination, so there is no page key to reset.
  const { get, set } = useReportQuery();

  const periodValue = (get(QUERY_PARAM_KEYS.period) ?? DEFAULT_PERIOD_PRESET) as PeriodPreset;
  const fromParam = get(QUERY_PARAM_KEYS.from);
  const toParam = get(QUERY_PARAM_KEYS.to);
  const periodRange: PeriodRange | null =
    fromParam && toParam ? { from: fromParam, to: toParam } : presetToRange(periodValue);
  const category = get(QUERY_PARAM_KEYS.category) ?? 'all';

  const handlePeriodChange = useCallback(
    (preset: PeriodPreset, range: PeriodRange | null) => {
      set({
        [QUERY_PARAM_KEYS.period]: preset,
        [QUERY_PARAM_KEYS.from]: range?.from ?? null,
        [QUERY_PARAM_KEYS.to]: range?.to ?? null,
      });
    },
    [set],
  );

  const handleCategoryChange = useCallback(
    (value: string) => {
      set({ [QUERY_PARAM_KEYS.category]: value === 'all' ? null : value });
    },
    [set],
  );

  const hasRange = Boolean(periodRange?.from && periodRange?.to);
  const queryArgs = useMemo(
    () => ({
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
      ...(category !== 'all' ? { category } : {}),
      // A bucketed period is required to receive the trend `series`.
      ...(hasRange ? { period: TREND_PERIOD } : {}),
    }),
    [periodRange?.from, periodRange?.to, category, hasRange],
  );
  const { data } = useGetJobsFunnelQuery(queryArgs);

  const totals = data?.totals;
  const rates = data?.rates;

  const funnelBars = useMemo(
    () => [
      { label: FUNNEL_STAGE_LABELS.posted, value: totals?.posted ?? 0 },
      { label: FUNNEL_STAGE_LABELS.withOffers, value: totals?.withOffers ?? 0 },
      { label: FUNNEL_STAGE_LABELS.accepted, value: totals?.accepted ?? 0 },
      { label: FUNNEL_STAGE_LABELS.completed, value: totals?.completed ?? 0 },
      { label: FUNNEL_STAGE_LABELS.cancelled, value: totals?.cancelled ?? 0 },
    ],
    [totals],
  );

  const trendSeries = useMemo(
    () => [
      {
        name: CHART_COPY.postedSeries,
        points: (data?.series ?? []).map((p) => ({ x: p.period, y: p.posted })),
      },
      {
        name: CHART_COPY.completedSeries,
        points: (data?.series ?? []).map((p) => ({ x: p.period, y: p.completed })),
      },
    ],
    [data?.series],
  );

  return (
    <div className={styles.root}>
      <ReportFilters
        period={{ value: periodValue, range: periodRange, onChange: handlePeriodChange }}
      >
        <Select
          label={CATEGORY_FILTER_LABEL}
          value={category}
          onValueChange={handleCategoryChange}
          size="sm"
        >
          {CATEGORY_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </Select>
      </ReportFilters>

      <StatTileRow columns={4}>
        <StatTile label={KPI_LABELS.posted} value={kpiValue(totals?.posted)} />
        <StatTile label={KPI_LABELS.withOffers} value={kpiValue(totals?.withOffers)} />
        <StatTile label={KPI_LABELS.accepted} value={kpiValue(totals?.accepted)} />
        <StatTile label={KPI_LABELS.completed} value={kpiValue(totals?.completed)} tone="success" />
        <StatTile label={KPI_LABELS.completionRate} value={formatPercent(rates?.completionRate)} />
      </StatTileRow>

      <div className={styles.charts}>
        <div className={styles.card}>
          <Text as="h2" size="lg" weight="semibold" value={CHART_COPY.funnelTitle} />
          <ReportChart kind="bar" data={funnelBars} ariaLabel={CHART_COPY.funnelAria} />
        </div>
        {hasRange ? (
          <div className={styles.card}>
            <Text as="h2" size="lg" weight="semibold" value={CHART_COPY.trendTitle} />
            <ReportChart kind="line" series={trendSeries} ariaLabel={CHART_COPY.trendAria} />
          </div>
        ) : null}
      </div>
    </div>
  );
}
