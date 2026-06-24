import { colors } from '@lunaticwithaduck/webui';

// Categorical palette for charts. Token refs only (R4) — never hex literals.
// Series / slices / bars cycle through this list in order.
export const CHART_PALETTE = [
  colors.primary,
  colors.success,
  colors.warning,
  colors.destructive,
  colors.muted,
] as const;

// Neutral chrome colors (axes, gridlines, area fill baseline). Token refs.
export const CHART_AXIS_COLOR = colors.border;
export const CHART_GRID_COLOR = colors.border;

// Default rendered heights (px). Width is fluid via a responsive viewBox.
export const CHART_DEFAULT_HEIGHT = {
  lineArea: 240,
  bar: 280,
  donut: 220,
} as const;

// Internal viewBox width — geometry is computed against this, then the SVG
// scales to its container via `preserveAspectRatio`. Keep generous so a wide
// dashboard column doesn't blur thin strokes.
export const CHART_VIEWBOX_WIDTH = 640;

// Plot insets (viewBox units) leaving room for axis ticks / labels.
export const CHART_PADDING = {
  top: 12,
  right: 16,
  bottom: 24,
  left: 44,
} as const;

// Line / area geometry.
export const LINE_STROKE_WIDTH = 2;
export const AREA_FILL_OPACITY = 0.16;
export const LINE_HGRID_LINES = 4; // horizontal gridline count

// Horizontal bar geometry (viewBox units).
export const BAR_HEIGHT = 18;
export const BAR_GAP = 14;
export const BAR_LABEL_WIDTH = 160; // left gutter for category labels
export const BAR_VALUE_GAP = 8; // gap between bar end and its value label
export const BAR_TRACK_OPACITY = 0.18;

// Donut geometry (fractions of the smaller viewBox dimension).
export const DONUT_OUTER_RATIO = 0.46;
export const DONUT_INNER_RATIO = 0.62; // inner radius as a fraction of outer
export const DONUT_LEGEND_DOT = 10;

// Empty-state copy (R2). Each kind passes its own ariaLabel for the title.
export const CHART_EMPTY_COPY = {
  title: 'No data',
  description: 'There is nothing to chart for the selected filters yet.',
} as const;
