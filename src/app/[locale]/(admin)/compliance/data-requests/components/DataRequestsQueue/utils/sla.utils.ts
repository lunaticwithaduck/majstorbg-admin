const MS_PER_DAY = 86_400_000;

/** Whole days until `dueIso` from `nowMs` (negative = overdue). NaN for bad input. */
export function daysUntil(dueIso: string, nowMs: number): number {
  const due = new Date(dueIso).getTime();
  if (Number.isNaN(due)) return Number.NaN;
  return Math.ceil((due - nowMs) / MS_PER_DAY);
}

export type SlaTone = 'destructive' | 'warning' | 'secondary';

/** Badge tone for an SLA: overdue/invalid → destructive, ≤3 days → warning, else secondary. */
export function slaTone(days: number): SlaTone {
  if (!Number.isFinite(days) || days < 0) return 'destructive';
  if (days <= 3) return 'warning';
  return 'secondary';
}
