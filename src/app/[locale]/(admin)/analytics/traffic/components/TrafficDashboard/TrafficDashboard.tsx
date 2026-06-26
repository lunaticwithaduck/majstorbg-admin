'use client';

import { Text } from '@lunaticwithaduck/webui';
import { Eye, Globe, Timer, UserCheck, Users } from 'lucide-react';
import { useCallback, useMemo } from 'react';
import type { TrafficPoint } from '@/api/admin-traffic-endpoints';
import { useGetTrafficOverviewQuery } from '@/api/store';
import { useReportQuery } from '@/lib/report-query.utils';
import PeriodSelect from '@/ui/components/composed/PeriodSelect/PeriodSelect';
import {
  type PeriodPreset,
  type PeriodRange,
  presetToRange,
} from '@/ui/components/composed/PeriodSelect/utils/period.utils';
import ReportChart from '@/ui/components/composed/ReportChart/ReportChart';
import StatTile from '@/ui/components/composed/StatTile/StatTile';
import StatTileRow from '@/ui/components/composed/StatTileRow/StatTileRow';
import {
  CHART_HEIGHT,
  DEFAULT_PERIOD_PRESET,
  QUERY_KEYS,
  TOP_N,
  TRAFFIC_LABELS,
} from './config/constants';
import styles from './TrafficDashboard.styles';

const numberFormatter = new Intl.NumberFormat('bg-BG');

function formatNumber(value: number | undefined): string {
  if (value == null || !Number.isFinite(value)) return TRAFFIC_LABELS.none;
  return numberFormatter.format(value);
}

function formatDuration(sec: number | undefined): string {
  if (sec == null || !Number.isFinite(sec)) return TRAFFIC_LABELS.none;
  const minutes = Math.floor(sec / 60);
  const seconds = Math.floor(sec % 60);
  return `${minutes}m ${seconds}s`;
}

function formatPercent(pct: number | undefined): string {
  if (pct == null || !Number.isFinite(pct)) return TRAFFIC_LABELS.none;
  return `${pct}%`;
}

export default function TrafficDashboard() {
  const query = useReportQuery(QUERY_KEYS.period);
  const { set } = query;
  const periodValue = (query.get(QUERY_KEYS.period) ?? DEFAULT_PERIOD_PRESET) as PeriodPreset;
  const fromParam = query.get(QUERY_KEYS.from);
  const toParam = query.get(QUERY_KEYS.to);
  const periodRange: PeriodRange | null =
    fromParam && toParam ? { from: fromParam, to: toParam } : presetToRange(periodValue);

  const handlePeriodChange = useCallback(
    (preset: PeriodPreset, range: PeriodRange | null) => {
      set({
        [QUERY_KEYS.period]: preset,
        [QUERY_KEYS.from]: range?.from ?? null,
        [QUERY_KEYS.to]: range?.to ?? null,
      });
    },
    [set],
  );

  const queryArgs = useMemo(
    () => ({
      ...(periodRange?.from ? { from: periodRange.from } : {}),
      ...(periodRange?.to ? { to: periodRange.to } : {}),
    }),
    [periodRange?.from, periodRange?.to],
  );
  const { data, isError } = useGetTrafficOverviewQuery(queryArgs);

  const series = data?.series ?? [];
  const referrers = data?.referrers ?? [];
  const pages = data?.pages ?? [];
  const devices = data?.devices ?? [];
  const countries = data?.countries ?? [];

  const chartSeries = useMemo(
    () => [
      {
        name: TRAFFIC_LABELS.seriesVisitors,
        points: series.map((point: TrafficPoint) => ({ x: point.date, y: point.visitors })),
      },
      {
        name: TRAFFIC_LABELS.seriesPageviews,
        points: series.map((point: TrafficPoint) => ({ x: point.date, y: point.pageviews })),
      },
    ],
    [series],
  );
  const referrerData = useMemo(
    () => referrers.slice(0, TOP_N).map((ref) => ({ label: ref.referrer, value: ref.visitors })),
    [referrers],
  );
  const deviceData = useMemo(
    () => devices.map((device) => ({ label: device.device, value: device.visitors })),
    [devices],
  );
  const countryData = useMemo(
    () =>
      countries
        .slice(0, TOP_N)
        .map((country) => ({ label: country.country, value: country.visitors })),
    [countries],
  );
  const topPages = pages.slice(0, TOP_N);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.heading}>
          <Text as="h1" size="2xl" weight="bold">
            {TRAFFIC_LABELS.pageHeading}
          </Text>
          <Text as="p" size="sm" color="muted">
            {TRAFFIC_LABELS.pageSub}
          </Text>
        </div>
        <PeriodSelect
          value={periodValue}
          range={periodRange}
          onChange={handlePeriodChange}
          label={TRAFFIC_LABELS.periodLabel}
        />
      </header>

      {isError ? (
        <div className={styles.state}>
          <Text as="span" size="sm" color="destructive">
            {TRAFFIC_LABELS.error}
          </Text>
        </div>
      ) : null}

      <StatTileRow columns={4}>
        <StatTile
          label={TRAFFIC_LABELS.visitors}
          value={formatNumber(data?.visitors)}
          icon={Users}
        />
        <StatTile
          label={TRAFFIC_LABELS.uniqueVisitors}
          value={formatNumber(data?.uniqueVisitors)}
          icon={UserCheck}
        />
        <StatTile
          label={TRAFFIC_LABELS.pageviews}
          value={formatNumber(data?.pageviews)}
          icon={Eye}
        />
        <StatTile
          label={TRAFFIC_LABELS.bounceRate}
          value={formatPercent(data?.bounceRatePct)}
          icon={Globe}
        />
        <StatTile
          label={TRAFFIC_LABELS.avgDuration}
          value={formatDuration(data?.avgDurationSec)}
          icon={Timer}
        />
      </StatTileRow>

      <div className={styles.card}>
        <Text as="h2" size="lg" weight="semibold" className={styles.cardTitle}>
          {TRAFFIC_LABELS.overTime}
        </Text>
        <ReportChart
          kind="area"
          series={chartSeries}
          height={CHART_HEIGHT}
          yFormat={(n) => numberFormatter.format(n)}
          ariaLabel={TRAFFIC_LABELS.overTime}
        />
      </div>

      <div className={styles.grid3}>
        <div className={styles.card}>
          <Text as="h2" size="lg" weight="semibold" className={styles.cardTitle}>
            {TRAFFIC_LABELS.byReferrer}
          </Text>
          <ReportChart
            kind="bar"
            data={referrerData}
            height={CHART_HEIGHT}
            ariaLabel={TRAFFIC_LABELS.byReferrer}
          />
        </div>
        <div className={styles.card}>
          <Text as="h2" size="lg" weight="semibold" className={styles.cardTitle}>
            {TRAFFIC_LABELS.byCountry}
          </Text>
          <ReportChart
            kind="bar"
            data={countryData}
            height={CHART_HEIGHT}
            ariaLabel={TRAFFIC_LABELS.byCountry}
          />
        </div>
        <div className={styles.card}>
          <Text as="h2" size="lg" weight="semibold" className={styles.cardTitle}>
            {TRAFFIC_LABELS.byDevice}
          </Text>
          <ReportChart
            kind="donut"
            data={deviceData}
            height={CHART_HEIGHT}
            ariaLabel={TRAFFIC_LABELS.byDevice}
          />
        </div>
      </div>

      <div className={styles.card}>
        <Text as="h2" size="lg" weight="semibold" className={styles.cardTitle}>
          {TRAFFIC_LABELS.topPages}
        </Text>
        {topPages.length === 0 ? (
          <Text as="span" size="sm" color="muted">
            {TRAFFIC_LABELS.empty}
          </Text>
        ) : (
          <div className={styles.pages}>
            {topPages.map((pageRow) => (
              <div key={pageRow.path} className={styles.pageRow}>
                <Text as="span" size="sm" weight="medium" className={styles.pagePath}>
                  {pageRow.path}
                </Text>
                <div className={styles.pageMeta}>
                  <Text as="span" size="sm">
                    {formatNumber(pageRow.pageviews)}
                  </Text>
                  <Text as="span" size="sm" color="muted">
                    {TRAFFIC_LABELS.pageviewsShort}
                  </Text>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
