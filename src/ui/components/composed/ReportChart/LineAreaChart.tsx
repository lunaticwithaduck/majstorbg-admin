'use client';

import { Empty, Text } from '@lunaticwithaduck/webui';
import {
  AREA_FILL_OPACITY,
  CHART_AXIS_COLOR,
  CHART_DEFAULT_HEIGHT,
  CHART_EMPTY_COPY,
  CHART_GRID_COLOR,
  CHART_PADDING,
  CHART_PALETTE,
  CHART_VIEWBOX_WIDTH,
  LINE_HGRID_LINES,
  LINE_STROKE_WIDTH,
} from './config/constants';
import styles from './ReportChart.styles';
import {
  bandPositions,
  extentFromZero,
  linearScale,
  paletteAt,
  ticks,
  toAreaPath,
  toPolylinePoints,
} from './utils/scale.utils';

export type LineAreaSeries = {
  name: string;
  points: { x: string | number; y: number }[];
};

type LineAreaChartProps = {
  kind: 'line' | 'area';
  series: LineAreaSeries[];
  height?: number | undefined;
  yFormat?: ((n: number) => string) | undefined;
  ariaLabel: string;
};

const defaultYFormat = (n: number): string => `${n}`;

export default function LineAreaChart({
  kind,
  series,
  height = CHART_DEFAULT_HEIGHT.lineArea,
  yFormat = defaultYFormat,
  ariaLabel,
}: LineAreaChartProps) {
  const hasData = series.some((s) => s.points.length > 0);
  if (!hasData) {
    return <Empty title={ariaLabel} description={CHART_EMPTY_COPY.description} />;
  }

  const vbWidth = CHART_VIEWBOX_WIDTH;
  const vbHeight = height;
  const plotLeft = CHART_PADDING.left;
  const plotRight = vbWidth - CHART_PADDING.right;
  const plotTop = CHART_PADDING.top;
  const plotBottom = vbHeight - CHART_PADDING.bottom;

  // The x-axis is ordinal: positions are derived from the longest series so all
  // series share one band, and labels come from the first series' x values.
  const maxLen = series.reduce((n, s) => Math.max(n, s.points.length), 0);
  const xPositions = bandPositions(maxLen, plotLeft, plotRight);

  const allY = series.flatMap((s) => s.points.map((p) => p.y));
  const yDomain = extentFromZero(allY);
  // Descending pixel range flips the axis so larger values sit higher.
  const yScale = linearScale(yDomain, [plotBottom, plotTop]);

  const gridTicks = ticks(yDomain, LINE_HGRID_LINES + 1);
  const labelSeries = series.reduce((longest, s) =>
    s.points.length > longest.points.length ? s : longest,
  );

  // Pre-built so the offscreen fallback children is a pure runtime reference.
  const srSummary = series
    .map((s) => `${s.name}: ${s.points.map((p) => `${p.x} ${yFormat(p.y)}`).join(', ')}`)
    .join('; ');

  return (
    <div className={styles.root}>
      <svg
        className={styles.svg}
        width="100%"
        height={vbHeight}
        viewBox={`0 0 ${vbWidth} ${vbHeight}`}
        preserveAspectRatio="xMidYMid meet"
        role="img"
        aria-label={ariaLabel}
      >
        <title>{ariaLabel}</title>

        {/* horizontal gridlines + y tick labels */}
        {gridTicks.map((tick) => {
          const y = yScale(tick);
          return (
            <g key={`grid-${tick}`}>
              <line
                x1={plotLeft}
                y1={y}
                x2={plotRight}
                y2={y}
                stroke={CHART_GRID_COLOR}
                strokeWidth={1}
                strokeOpacity={0.5}
              />
              <text
                x={plotLeft - 8}
                y={y + 4}
                textAnchor="end"
                fontSize={11}
                fill={CHART_AXIS_COLOR}
              >
                {yFormat(tick)}
              </text>
            </g>
          );
        })}

        {/* baseline / x-axis */}
        <line
          x1={plotLeft}
          y1={plotBottom}
          x2={plotRight}
          y2={plotBottom}
          stroke={CHART_AXIS_COLOR}
          strokeWidth={1}
        />

        {/* series */}
        {series.map((s, si) => {
          const color = paletteAt(CHART_PALETTE, si);
          const pairs = s.points.map(
            (p, i) => [xPositions[i] ?? plotLeft, yScale(p.y)] as [number, number],
          );
          return (
            <g key={s.name}>
              {kind === 'area' ? (
                <path
                  d={toAreaPath(pairs, plotBottom)}
                  fill={color}
                  fillOpacity={AREA_FILL_OPACITY}
                  stroke="none"
                />
              ) : null}
              <polyline
                points={toPolylinePoints(pairs)}
                fill="none"
                stroke={color}
                strokeWidth={LINE_STROKE_WIDTH}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {pairs.map(([cx, cy], i) => (
                <circle
                  key={`${s.name}-pt-${i}-${cx}`}
                  cx={cx}
                  cy={cy}
                  r={LINE_STROKE_WIDTH}
                  fill={color}
                />
              ))}
            </g>
          );
        })}

        {/* x labels from the longest series */}
        {labelSeries.points.map((p, i) => (
          <text
            key={`xl-${p.x}-${i}`}
            x={xPositions[i] ?? plotLeft}
            y={plotBottom + 16}
            textAnchor="middle"
            fontSize={11}
            fill={CHART_AXIS_COLOR}
          >
            {p.x}
          </text>
        ))}
      </svg>

      {/* Offscreen tabular fallback for assistive tech. */}
      <Text as="span" size="xs" className={styles.srOnly}>
        {srSummary}
      </Text>
    </div>
  );
}
