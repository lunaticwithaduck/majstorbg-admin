const styles = {
  root: 'flex flex-col gap-2',
  header: 'flex items-center justify-between gap-2',
  value: 'leading-tight',
  delta: 'flex items-center gap-1',
  // Tone is expressed as a left accent border on the tile so the KPI reads at a
  // glance without recoloring the whole surface.
  tone: {
    default: 'border-l-4 border-l-border',
    success: 'border-l-4 border-l-success',
    warning: 'border-l-4 border-l-warning',
    destructive: 'border-l-4 border-l-destructive',
  },
};

export default styles;
