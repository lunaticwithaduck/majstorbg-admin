/**
 * Shared formatting helpers for admin feature modules.
 *
 * Money is the spec-mandated `formatEur`: € prefix + bg-BG grouping, fed integer
 * minor units (cents) so it round-trips the `amountCents` fields the BE uses.
 * Dates are localized to bg-BG (admin is BG-primary). Per-module `utils/` may
 * still add bespoke formatters, but these cover the common cases.
 */

const EUR_NUMBER = new Intl.NumberFormat('bg-BG', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const DATE = new Intl.DateTimeFormat('bg-BG', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

const DATE_TIME = new Intl.DateTimeFormat('bg-BG', {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

/** Em dash shown wherever a value is missing/invalid. */
export const EMPTY_VALUE = '—';

/**
 * Integer minor units (cents) → `"€1 234,56"`. € prefix, bg-BG grouping.
 * Returns {@link EMPTY_VALUE} for null/undefined/non-finite input.
 */
export function formatEur(amountCents: number | null | undefined): string {
  if (amountCents == null || !Number.isFinite(amountCents)) return EMPTY_VALUE;
  return `€${EUR_NUMBER.format(amountCents / 100)}`;
}

/** ISO string → localized date (bg-BG), or {@link EMPTY_VALUE}. */
export function formatDate(iso: string | null | undefined): string {
  if (!iso) return EMPTY_VALUE;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? EMPTY_VALUE : DATE.format(d);
}

/** ISO string → localized date + time (bg-BG), or {@link EMPTY_VALUE}. */
export function formatDateTime(iso: string | null | undefined): string {
  if (!iso) return EMPTY_VALUE;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? EMPTY_VALUE : DATE_TIME.format(d);
}
