const styles = {
  // h-screen + overflow-hidden so the grid is pinned to the viewport — the
  // sidebar stays fixed (its own column doesn't scroll with the page) and the
  // main column owns its own scroll surface for long content.
  root: 'h-screen grid grid-cols-[260px_1fr] bg-background overflow-hidden',
  main: 'flex flex-col p-8 gap-6 overflow-y-auto',
};

export default styles;
