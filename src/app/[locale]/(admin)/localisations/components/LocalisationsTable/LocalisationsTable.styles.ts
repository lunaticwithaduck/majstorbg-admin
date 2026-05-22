const styles = {
  root: 'flex flex-col gap-4',
  header: 'flex flex-col gap-1',
  keyCell: 'font-mono text-xs text-muted break-all max-w-[280px]',
  valueCell: 'text-sm max-w-[360px] whitespace-pre-wrap break-words',
  valueMuted: 'text-sm text-muted italic',
  badgeComplete:
    'inline-flex items-center rounded-full px-2 py-0.5 bg-success/10 text-success',
  badgeMissingBg:
    'inline-flex items-center rounded-full px-2 py-0.5 bg-warning/10 text-warning',
  badgeMissingEn:
    'inline-flex items-center rounded-full px-2 py-0.5 bg-destructive/10 text-destructive',
  badgePlaceholder:
    'inline-flex items-center rounded-full px-2 py-0.5 bg-text/5 text-muted',
};

export default styles;
