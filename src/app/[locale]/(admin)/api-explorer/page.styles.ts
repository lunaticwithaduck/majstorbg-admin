const styles = {
  // flex-1 + min-h-0 lets the page grow inside the admin shell's flex-column
  // main surface so the iframe wrapper can claim the remaining vertical space.
  root: 'flex flex-col flex-1 min-h-0 gap-6',
  header: 'flex flex-col gap-2',
  headerRow: 'flex items-start justify-between gap-4',
  headerCopy: 'flex flex-col gap-1',
  // Card hosting the iframe — owns its own scroll surface via overflow-hidden.
  frameCard: 'flex-1 min-h-0 rounded-2xl border border-border bg-paper overflow-hidden',
  frame: 'w-full h-full border-0',
};

export default styles;
