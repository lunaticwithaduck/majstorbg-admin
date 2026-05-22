const styles = {
  root: 'flex flex-col gap-4',
  header: 'flex flex-col gap-1',
  banner: 'flex flex-col gap-1',
  keyCell: 'flex flex-col gap-1 min-w-[220px]',
  description: 'max-w-[420px]',
  indicator: 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 border border-border',
  indicatorOn: 'inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-success/10 text-success',
  indicatorOff:
    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-destructive/10 text-destructive',
  indicatorMuted:
    'inline-flex items-center gap-1 rounded-full px-2 py-0.5 bg-text/5 text-muted',
  effectiveCell: 'flex items-center gap-2',
  overrideBadge:
    'inline-flex items-center rounded-full px-2 py-0.5 bg-warning/10 text-warning text-xs',
  toggleCell: 'flex items-center justify-start',
  resetCell: 'flex items-center justify-start',
};

export default styles;
