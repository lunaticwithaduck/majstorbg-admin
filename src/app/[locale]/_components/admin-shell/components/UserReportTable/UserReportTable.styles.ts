const styles = {
  root: 'flex flex-col gap-4',
  header: 'flex flex-col gap-1',
  toolbar: 'flex items-center gap-3 flex-wrap rounded-2xl border border-border bg-paper px-4 py-3',
  toolbarSearch: 'flex-1 min-w-[240px]',
  toolbarFilter: 'min-w-[180px]',
  toolbarSpacer: 'flex-1',
  toolbarPagination: 'flex items-center gap-2',
  state: 'flex flex-col items-center justify-center gap-2 py-12',
  tableWrap: 'rounded-2xl border border-border bg-paper overflow-hidden',
  table: 'w-full',
  th: 'text-left px-4 py-3 border-b border-border bg-background',
  td: 'px-4 py-3 border-b border-border last:border-b-0 align-middle',
  badge: 'inline-flex items-center rounded-full px-2 py-0.5 bg-text/5 text-text',
};

export default styles;
