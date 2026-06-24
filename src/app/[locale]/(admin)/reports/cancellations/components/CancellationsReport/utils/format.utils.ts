import { DASH } from '../config/constants';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return DASH;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return DASH;
  return dateFormatter.format(d);
}

/** Whole days → "Nd". Negative / non-finite ages collapse to the dash. */
export function formatAgeDays(ageDays: number): string {
  if (!Number.isFinite(ageDays) || ageDays < 0) return DASH;
  return `${Math.round(ageDays)}d`;
}

/** Fraction in [0, 1] → "N%". Undefined / NaN collapse to the dash. */
export function formatPercent(fraction: number | undefined): string {
  if (fraction === undefined || Number.isNaN(fraction)) return DASH;
  return `${Math.round(fraction * 100)}%`;
}
