const styles = {
  root: 'grid gap-4',
  // Static, fully-spelled column classes so Tailwind's JIT keeps them. Tiles
  // stack on small admin viewports and fan out to the requested column count
  // from the `sm` breakpoint up.
  columns: {
    2: 'grid-cols-1 sm:grid-cols-2',
    3: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4',
  },
};

export default styles;
