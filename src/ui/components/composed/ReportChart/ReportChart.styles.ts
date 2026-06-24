const styles = {
  // Chart container. Width fills the parent; the SVG keeps its own aspect ratio
  // via viewBox + preserveAspectRatio so the height prop is honoured.
  root: 'w-full',
  // Width/height come from the SVG's own width="100%"/height attributes so the
  // viewBox can scale; only the box-model/display lives here.
  svg: 'block max-w-full overflow-visible',
  // Visually-hidden text fallback for screen readers / no-SVG environments.
  // Mirrors the common `sr-only` recipe without an inline style attribute.
  srOnly:
    'absolute w-px h-px p-0 -m-px overflow-hidden whitespace-nowrap border-0 [clip:rect(0,0,0,0)]',
  // Donut needs the chart + legend side by side on wide columns.
  donutRoot: 'flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:justify-center',
  donutChart: 'shrink-0',
  legend: 'flex flex-col gap-2',
  legendItem: 'flex items-center gap-2',
  legendDot: 'inline-block shrink-0 rounded-full',
};

export default styles;
