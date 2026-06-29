/** Parse a euro amount string (accepts comma decimals) to integer cents, or NaN. */
export function amountToCents(input: string): number {
  const parsed = Number.parseFloat(input.replace(',', '.'));
  return Number.isFinite(parsed) ? Math.round(parsed * 100) : Number.NaN;
}

/** A money amount is valid iff it is > 0 and ≤ the cap (both in cents). */
export function isAmountWithinCap(cents: number, capCents: number): boolean {
  return Number.isFinite(cents) && cents > 0 && cents <= capCents;
}
