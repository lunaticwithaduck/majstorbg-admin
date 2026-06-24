import { DISPUTES_LABELS, HOURS_PER_DAY } from '../config/constants';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return DISPUTES_LABELS.none;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return DISPUTES_LABELS.none;
  return dateFormatter.format(d);
}

/** Hours → "Nh" under a day, otherwise "Nd Nh" rounded to whole hours. */
export function formatAge(ageHours: number): string {
  if (!Number.isFinite(ageHours) || ageHours < 0) return DISPUTES_LABELS.none;
  const whole = Math.round(ageHours);
  if (whole < HOURS_PER_DAY) return `${whole}h`;
  const days = Math.floor(whole / HOURS_PER_DAY);
  const hours = whole % HOURS_PER_DAY;
  return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
}

export function formatMoney(amount: number, currency: string): string {
  return new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: currency || 'EUR',
    maximumFractionDigits: 2,
  }).format(amount);
}
