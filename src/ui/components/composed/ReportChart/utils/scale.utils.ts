/**
 * Dependency-free chart math. All helpers are pure and frame-agnostic — they
 * take plain numbers + a target pixel/viewBox range and return geometry that
 * the SVG renderers drop straight into `points` / `d` / `x` / `y` attributes.
 */

export type Point = { x: number | string; y: number };

export type Extent = { min: number; max: number };

/** Min/max of a numeric list. Returns a `0..1` extent for an empty input so a
 *  flat / empty series still produces a sane (non-NaN) axis. */
export function extent(values: number[]): Extent {
  if (values.length === 0) return { min: 0, max: 1 };
  let min = values[0] as number;
  let max = values[0] as number;
  for (const v of values) {
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return { min, max };
}

/** Extent that always includes zero — the right baseline for value charts so
 *  bars/areas anchor to 0 rather than to the smallest data point. */
export function extentFromZero(values: number[]): Extent {
  const e = extent(values);
  return { min: Math.min(0, e.min), max: Math.max(0, e.max) };
}

/**
 * Build a linear scale `value -> pixel`. `domain` is the data range, `range`
 * is the pixel/viewBox span (use a descending range, e.g. [bottom, top], to
 * flip the y-axis so larger values render higher). Degenerate domains (min ===
 * max) map every value to the range midpoint instead of dividing by zero.
 */
export function linearScale(domain: Extent, range: [number, number]): (value: number) => number {
  const [r0, r1] = range;
  const span = domain.max - domain.min;
  if (span === 0) {
    const mid = (r0 + r1) / 2;
    return () => mid;
  }
  return (value: number) => r0 + ((value - domain.min) / span) * (r1 - r0);
}

/** Evenly spaced x positions for a categorical/ordinal axis (n items across
 *  [x0, x1]). A single point sits at the midpoint; otherwise the first/last
 *  hug the edges. */
export function bandPositions(count: number, x0: number, x1: number): number[] {
  if (count <= 0) return [];
  if (count === 1) return [(x0 + x1) / 2];
  const step = (x1 - x0) / (count - 1);
  return Array.from({ length: count }, (_, i) => x0 + step * i);
}

/** Round to a fixed precision to keep generated SVG strings compact + stable
 *  (avoids 1.0000000002 noise in `points`/`d`). */
function r(n: number): number {
  return Math.round(n * 100) / 100;
}

/** Turn (x, y) pixel pairs into a `points="x,y x,y …"` string for <polyline>. */
export function toPolylinePoints(pairs: Array<[number, number]>): string {
  return pairs.map(([x, y]) => `${r(x)},${r(y)}`).join(' ');
}

/** Closed area path: the line across the top, dropped to the baseline and
 *  closed, for a filled <path>. Returns '' when there are no points. */
export function toAreaPath(pairs: Array<[number, number]>, baselineY: number): string {
  if (pairs.length === 0) return '';
  const first = pairs[0] as [number, number];
  const last = pairs[pairs.length - 1] as [number, number];
  const line = pairs.map(([x, y], i) => `${i === 0 ? 'M' : 'L'} ${r(x)} ${r(y)}`).join(' ');
  return `${line} L ${r(last[0])} ${r(baselineY)} L ${r(first[0])} ${r(baselineY)} Z`;
}

/** Evenly spaced tick values across an extent (inclusive of both ends). */
export function ticks(domain: Extent, count: number): number[] {
  if (count <= 1) return [domain.max];
  const step = (domain.max - domain.min) / (count - 1);
  return Array.from({ length: count }, (_, i) => domain.min + step * i);
}

const TAU = Math.PI * 2;

/** Cartesian point on a circle. Angles measured clockwise from 12 o'clock so
 *  donut slices read like a clock face. */
function polarToCartesian(cx: number, cy: number, radius: number, angle: number): [number, number] {
  // -PI/2 puts angle 0 at the top; positive angles sweep clockwise.
  const a = angle - Math.PI / 2;
  return [cx + radius * Math.cos(a), cy + radius * Math.sin(a)];
}

export type DonutSlice = {
  /** SVG `d` for the ring segment (outer arc + inner arc, closed). */
  path: string;
  startAngle: number;
  endAngle: number;
  /** Index of this slice's value in the input array — lets the caller map a
   *  slice back to its color/label even when zero-value entries are skipped. */
  sourceIndex: number;
};

/**
 * Compute ring-segment paths for a donut. `values` are summed to a total; each
 * slice's sweep is proportional to its share. Zero/negative totals yield no
 * slices (caller renders the Empty state).
 */
export function donutSlices(
  values: number[],
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
): DonutSlice[] {
  const total = values.reduce((sum, v) => sum + Math.max(0, v), 0);
  if (total <= 0) return [];
  const slices: DonutSlice[] = [];
  let cursor = 0;
  for (let index = 0; index < values.length; index += 1) {
    const value = values[index] as number;
    const share = Math.max(0, value) / total;
    if (share <= 0) continue;
    const startAngle = cursor * TAU;
    cursor += share;
    // Clamp the final slice so floating error can't overshoot a full turn.
    const endAngle = Math.min(cursor, 1) * TAU;
    slices.push({
      path: ringSegmentPath(cx, cy, outerR, innerR, startAngle, endAngle),
      startAngle,
      endAngle,
      sourceIndex: index,
    });
  }
  return slices;
}

/** `d` for a single donut ring segment between two angles. A full circle is
 *  rendered as two half-arcs so the single-slice (100%) case still draws. */
function ringSegmentPath(
  cx: number,
  cy: number,
  outerR: number,
  innerR: number,
  startAngle: number,
  endAngle: number,
): string {
  const sweep = endAngle - startAngle;
  const isFull = sweep >= TAU - 1e-6;
  if (isFull) {
    const mid = startAngle + Math.PI;
    return [
      ringSegmentPath(cx, cy, outerR, innerR, startAngle, mid),
      ringSegmentPath(cx, cy, outerR, innerR, mid, startAngle + TAU),
    ].join(' ');
  }
  const largeArc = sweep > Math.PI ? 1 : 0;
  const [ox0, oy0] = polarToCartesian(cx, cy, outerR, startAngle);
  const [ox1, oy1] = polarToCartesian(cx, cy, outerR, endAngle);
  const [ix1, iy1] = polarToCartesian(cx, cy, innerR, endAngle);
  const [ix0, iy0] = polarToCartesian(cx, cy, innerR, startAngle);
  return [
    `M ${r(ox0)} ${r(oy0)}`,
    `A ${r(outerR)} ${r(outerR)} 0 ${largeArc} 1 ${r(ox1)} ${r(oy1)}`,
    `L ${r(ix1)} ${r(iy1)}`,
    `A ${r(innerR)} ${r(innerR)} 0 ${largeArc} 0 ${r(ix0)} ${r(iy0)}`,
    'Z',
  ].join(' ');
}

/** Percentage share of each value, rounded to whole percents. */
export function shares(values: number[]): number[] {
  const total = values.reduce((sum, v) => sum + Math.max(0, v), 0);
  if (total <= 0) return values.map(() => 0);
  return values.map((v) => Math.round((Math.max(0, v) / total) * 100));
}

/** Cycle through the palette by index. */
export function paletteAt<T>(palette: readonly T[], index: number): T {
  return palette[index % palette.length] as T;
}
