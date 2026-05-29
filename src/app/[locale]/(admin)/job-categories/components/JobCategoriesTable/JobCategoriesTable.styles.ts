const styles = {
  root: 'flex flex-col gap-4',
  header: 'flex flex-col gap-1',
  newCategorySection: 'rounded-lg border border-input bg-muted/10 p-4 flex flex-col gap-3',
  newCategoryHeading: 'flex flex-col gap-0.5',
  newCategoryForm: 'flex flex-wrap gap-3 items-end',
  fieldGroup: 'flex flex-col gap-1',
  label: 'text-xs font-medium text-muted',
  input:
    'rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 min-w-[120px]',
  inputSm:
    'rounded border border-input bg-background px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 w-[80px]',
  addBtn:
    'inline-flex items-center rounded px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors',
  addError: 'text-xs text-destructive',
  editCell: 'flex flex-wrap gap-2 items-center',
  editInput:
    'rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 min-w-[100px]',
  editInputSm:
    'rounded border border-input bg-background px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 w-[70px]',
  editActions: 'flex gap-1',
  editBtn:
    'inline-flex items-center rounded px-2 py-1 text-xs font-medium bg-primary text-primary-foreground hover:bg-primary/90 disabled:opacity-50 transition-colors',
  cancelBtn:
    'inline-flex items-center rounded px-2 py-1 text-xs font-medium border border-input hover:bg-muted/20 disabled:opacity-50 transition-colors',
  editIconBtn:
    'shrink-0 rounded p-1 hover:bg-muted/20 text-muted hover:text-foreground transition-colors',
  deleteBtn:
    'shrink-0 rounded p-1 hover:bg-destructive/10 text-muted hover:text-destructive transition-colors',
  deleteError: 'text-xs text-destructive mt-1',
  actionsCell: 'flex items-center gap-1',
  idCell: 'font-mono text-xs text-muted',
  sortOrderCell: 'text-sm tabular-nums',
};

export default styles;
