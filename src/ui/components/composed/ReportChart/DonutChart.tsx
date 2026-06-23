'use client';

import { Empty, Text } from '@lunaticwithaduck/webui';
import {
  CHART_DEFAULT_HEIGHT,
  CHART_EMPTY_COPY,
  CHART_PALETTE,
  DONUT_INNER_RATIO,
  DONUT_LEGEND_DOT,
  DONUT_OUTER_RATIO,
} from './config/constants';
import styles from './ReportChart.styles';
import { donutSlices, paletteAt, shares } from './utils/scale.utils';

export type DonutDatum = { label: string; value: number; color?: string };

type DonutChartProps = {
  data: DonutDatum[];
  height?: number | undefined;
  ariaLabel: string;
};

export default function DonutChart({
  data,
  height = CHART_DEFAULT_HEIGHT.donut,
  ariaLabel,
}: DonutChartProps) {
  const total = data.reduce((sum, d) => sum + Math.max(0, d.value), 0);
  if (data.length === 0 || total <= 0) {
    return <Empty title={ariaLabel} description={CHART_EMPTY_COPY.description} />;
  }

  // Square viewBox sized to the height; the donut centers within it.
  const size = height;
  const cx = size / 2;
  const cy = size / 2;
  const outerR = size * DONUT_OUTER_RATIO;
  const innerR = outerR * DONUT_INNER_RATIO;

  const colorFor = (d: DonutDatum, i: number): string => d.color ?? paletteAt(CHART_PALETTE, i);
  const slices = donutSlices(
    data.map((d) => d.value),
    cx,
    cy,
    outerR,
    innerR,
  );
  const pct = shares(data.map((d) => d.value));

  return (
    <div className={styles.donutRoot}>
      <div className={styles.donutChart}>
        <svg
          className={styles.svg}
          width={size}
          height={size}
          viewBox={`0 0 ${size} ${size}`}
          preserveAspectRatio="xMidYMid meet"
          role="img"
          aria-label={ariaLabel}
        >
          <title>{ariaLabel}</title>
          {slices.map((slice) => {
            const datum = data[slice.sourceIndex] as DonutDatum;
            return (
              <path
                key={datum.label}
                d={slice.path}
                fill={colorFor(datum, slice.sourceIndex)}
              />
            );
          })}
        </svg>
      </div>

      <div className={styles.legend}>
        {data.map((d, i) => (
          <div key={d.label} className={styles.legendItem}>
            <svg
              className={styles.legendDot}
              width={DONUT_LEGEND_DOT}
              height={DONUT_LEGEND_DOT}
              viewBox={`0 0 ${DONUT_LEGEND_DOT} ${DONUT_LEGEND_DOT}`}
              aria-hidden="true"
            >
              <circle
                cx={DONUT_LEGEND_DOT / 2}
                cy={DONUT_LEGEND_DOT / 2}
                r={DONUT_LEGEND_DOT / 2}
                fill={colorFor(d, i)}
              />
            </svg>
            <Text as="span" size="sm" color="muted">
              {`${d.label} — ${d.value} (${pct[i] ?? 0}%)`}
            </Text>
          </div>
        ))}
      </div>
    </div>
  );
}
