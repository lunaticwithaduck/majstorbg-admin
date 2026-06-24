import { PERIOD_PRESETS } from '../config/constants';

export type PeriodPreset = (typeof PERIOD_PRESETS)[number];

// ISO `yyyy-mm-dd` (date-only) — this is the UI/URL representation that the
// native `<input type="date">` custom range speaks. The BE report endpoints
// actually validate `from`/`to` as ISO *datetimes*, so the axios request
// interceptor (see `src/api/axios.ts`) promotes these to inclusive day bounds
// (`from`→start-of-day, `to`→end-of-day, UTC) at the request boundary.
export type PeriodRange = { from: string; to: string };

// Local-date ISO (yyyy-mm-dd) WITHOUT timezone shifting. `toISOString()` would
// convert to UTC and roll the day over for users east/west of GMT, so we build
// the string from the local calendar fields instead.
function toIsoDate(date: Date): string {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function startOfDay(date: Date): Date {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/**
 * Resolve a preset to a concrete inclusive `{ from, to }` day range.
 * Returns `null` for `'custom'` — the caller supplies the range once the user
 * picks both dates. `now` is injectable for deterministic tests.
 */
export function presetToRange(preset: PeriodPreset, now: Date = new Date()): PeriodRange | null {
  const today = startOfDay(now);
  const to = toIsoDate(today);

  switch (preset) {
    case 'today':
      return { from: to, to };
    case 'last_7d':
      // Inclusive 7-day window ending today (today + 6 prior days).
      return { from: toIsoDate(addDays(today, -6)), to };
    case 'last_30d':
      return { from: toIsoDate(addDays(today, -29)), to };
    case 'this_month': {
      const firstOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      return { from: toIsoDate(firstOfMonth), to };
    }
    case 'custom':
      return null;
    default:
      return null;
  }
}
