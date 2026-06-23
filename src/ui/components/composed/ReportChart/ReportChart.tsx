'use client';

import BarBreakdownChart, { type BarDatum } from './BarBreakdownChart';
import DonutChart, { type DonutDatum } from './DonutChart';
import LineAreaChart, { type LineAreaSeries } from './LineAreaChart';

type LineAreaProps = {
  kind: 'line' | 'area';
  series: LineAreaSeries[];
  height?: number;
  yFormat?: (n: number) => string;
  ariaLabel: string;
};

type BarProps = {
  kind: 'bar';
  data: BarDatum[];
  height?: number;
  ariaLabel: string;
};

type DonutProps = {
  kind: 'donut';
  data: DonutDatum[];
  height?: number;
  ariaLabel: string;
};

export type ReportChartProps = LineAreaProps | BarProps | DonutProps;

/**
 * Dependency-free SVG chart. Discriminates on `kind` and delegates to the
 * matching renderer. Each renderer owns its own responsive viewBox, token-only
 * colors, `<svg role="img" aria-label>`, and the empty/Empty fallback.
 */
export default function ReportChart(props: ReportChartProps) {
  switch (props.kind) {
    case 'bar':
      return <BarBreakdownChart data={props.data} height={props.height} ariaLabel={props.ariaLabel} />;
    case 'donut':
      return <DonutChart data={props.data} height={props.height} ariaLabel={props.ariaLabel} />;
    default:
      return (
        <LineAreaChart
          kind={props.kind}
          series={props.series}
          height={props.height}
          yFormat={props.yFormat}
          ariaLabel={props.ariaLabel}
        />
      );
  }
}
