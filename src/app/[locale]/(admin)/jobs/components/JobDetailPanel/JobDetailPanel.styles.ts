const styles = {
  root: 'flex flex-col gap-6',
  header: 'flex flex-col gap-2',
  backRow: 'flex items-center gap-2 text-muted',
  title: 'flex items-baseline gap-3',
  state: 'flex flex-col items-center justify-center gap-2 py-12',
  section: 'rounded-2xl border border-border bg-paper p-6 flex flex-col gap-4',
  sectionTitle: 'border-b border-border pb-2',
  grid: 'grid grid-cols-2 gap-x-6 gap-y-3',
  field: 'flex flex-col gap-1',
  badge: 'inline-flex items-center rounded-full px-2 py-0.5 bg-text/5 text-text w-fit',
  description: 'whitespace-pre-line',
  bidsList: 'flex flex-col gap-2',
  bidRow:
    'grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center gap-3 rounded-lg border border-border px-3 py-2',
  bidHeader:
    'grid grid-cols-[1.5fr_1fr_1fr_1fr] items-center gap-3 px-3 pb-2 border-b border-border',
  empty: 'text-muted',
};

export default styles;
