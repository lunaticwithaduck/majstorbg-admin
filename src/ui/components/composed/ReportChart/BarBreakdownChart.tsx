'use client';

import { Empty, Text } from '@lunaticwithaduck/webui';
import {
  BAR_GAP,
  BAR_HEIGHT,
  BAR_LABEL_WIDTH,
  BAR_TRACK_OPACITY,
  BAR_VALUE_GAP,
  CHART_DEFAULT_HEIGHT,
  CHART_EMPTY_COPY,
  CHART_GRID_COLOR,
  CHART_PADDING,
  CHART_PALETTE,
  CHART_VIEWBOX_WIDTH,
} from './config/constants';
import styles from './ReportChart.styles';
import { extentFromZero, linearScale, paletteAt } from './utils/scale.utils';

export type BarDatum = { label: string; value: number; color?: string };

type BarBreakdownChartProps = {
  data: BarDatum[];
  height?: number | undefined;
  ariaLabel: string;
};

export default function BarBreakdownChart({
  data,
  height = CHART_DEFAULT_HEIGHT.bar,
  ariaLabel,
}: BarBreakdownChartProps) {
  if (data.length === 0) {
    return <Empty title={ariaLabel} description={CHART_EMPTY_COPY.description} />;
  }

  const vbWidth = CHART_VIEWBOX_WIDTH;
  // Height grows with the row count so bars never squash; the prop is a floor.
  const contentHeight = data.length * BAR_HEIGHT + (data.length - 1) * BAR_GAP;
  const vbHeight = Math.max(height, contentHeight + CHART_PADDING.top + CHART_PADDING.bottom);

  const trackLeft = BAR_LABEL_WIDTH;
  const trackRight = vbWidth - CHART_PADDING.right;
  const xDomain = extentFromZero(data.map((d) => d.value));
  const xScale = linearScale(xDomain, [trackLeft, trackRight]);

  // Pre-built so the offscreen fallback children is a pure runtime reference.
  const srSummary = data.map((d) => `${d.label}: ${d.value}`).join('; ');

  return (
    <div className={styles.root}>
      <svg
        className={styles.svg}
        width="100%"
        height={vbHeight}
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        preserveAspectRatio="xMinYMin meet"
        role="img"
        aria-label={ariaLabel}
      >
        <title>{ariaLabel}</title>

        {data.map((d, i) => {
          const color = d.color ?? paletteAt(CHART_PALETTE, i);
          const y = CHART_PADDING.top + i * (BAR_HEIGHT + BAR_GAP);
          const barEnd = xScale(d.value);
          const barWidth = Math.max(0, barEnd - trackLeft);
          return (
            <g key={d.label}>
              {/* category label */}
              <text
                x={trackLeft - 12}
                y={y + BAR_HEIGHT / 2 + 4}
                textAnchor="end"
                fontSize={12}
                fill={color}
              >
                {d.label}
              </text>
              {/* track */}
              <rect
                x={trackLeft}
                y={y}
                width={trackRight - trackLeft}
                height={BAR_HEIGHT}
                rx={4}
                fill={CHART_GRID_COLOR}
                fillOpacity={BAR_TRACK_OPACITY}
              />
              {/* value bar */}
              <rect x={trackLeft} y={y} width={barWidth} height={BAR_HEIGHT} rx={4} fill={color} />
              {/* value label */}
              <text
                x={barEnd + BAR_VALUE_GAP}
                y={y + BAR_HEIGHT / 2 + 4}
                textAnchor="start"
                fontSize={12}
                fill={color}
              >
                {d.value}
              </text>
            </g>
          );
        })}
      </svg>

      {/* Offscreen fallback for assistive tech. */}
      <Text as="span" size="xs" className={styles.srOnly}>
        {srSummary}
      </Text>
    </div>
  );
}
