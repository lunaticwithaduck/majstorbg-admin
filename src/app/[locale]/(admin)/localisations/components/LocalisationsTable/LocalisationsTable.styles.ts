const styles = {
  root: 'flex flex-col gap-4',
  header: 'flex flex-col gap-1',
  keyCell: 'font-mono text-xs text-muted break-all max-w-[280px]',
  valueCell: 'text-sm max-w-[360px] whitespace-pre-wrap break-words text-left',
  valueMuted: 'text-sm text-muted italic',
  editCell: 'flex flex-col gap-2',
  textarea:
    'w-full min-w-[240px] rounded border border-input bg-background px-2 py-1 text-sm resize-y focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50',
  editActions: 'flex gap-2',
  editBtn:
    'inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors',
  cancelBtn:
    'inline-flex items-center rounded px-2 py-1 text-xs font-medium border border-input hover:bg-muted/20 disabled:opacity-50 transition-colors',
  editIconBtn:
    'ml-2 shrink-0 rounded p-1 hover:bg-muted/20 text-muted hover:text-foreground transition-colors',
  actionBtn:
    'inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium border border-input hover:bg-muted/20 disabled:opacity-50 transition-colors',
  actionBtnPrimary:
    'inline-flex items-center gap-1.5 rounded px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors',
  badgeEn:
    'inline-flex items-center rounded-full px-2 py-0.5 bg-primary/10 text-primary',
  badgeBg:
    'inline-flex items-center rounded-full px-2 py-0.5 bg-warning/10 text-warning',
};

export default styles;
