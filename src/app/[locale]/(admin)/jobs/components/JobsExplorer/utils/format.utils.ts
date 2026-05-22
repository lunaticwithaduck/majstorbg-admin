import { BUDGET_TYPE_LABELS } from '../config/constants';
import type { AdminJobBudget } from '@/api/admin-job-endpoints';

const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return dateFormatter.format(d);
}

export function formatBudget(budget: AdminJobBudget | null | undefined): string {
  if (!budget) return '—';
  const suffix = BUDGET_TYPE_LABELS[budget.type] ?? budget.type;
  const amount = new Intl.NumberFormat(undefined, {
    style: 'currency',
    currency: budget.currency || 'EUR',
    maximumFractionDigits: 0,
  }).format(budget.amount);
  return `${amount} (${suffix})`;
}

export function shortId(id: string): string {
  if (id.length <= 8) return id;
  return `${id.slice(0, 8)}…`;
}
