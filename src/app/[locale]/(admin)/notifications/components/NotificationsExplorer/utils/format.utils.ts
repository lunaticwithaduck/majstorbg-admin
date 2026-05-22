const dateFormatter = new Intl.DateTimeFormat(undefined, {
  year: 'numeric',
  month: 'short',
  day: 'numeric',
  hour: '2-digit',
  minute: '2-digit',
});

export function formatDate(iso: string | null | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '—';
  return dateFormatter.format(d);
}

export function shortId(id: string): string {
  if (id.length <= 8) return id;
  return `${id.slice(0, 8)}…`;
}

/** Compact, single-line JSON preview suitable for a table cell. Returns a
 *  fallback when the payload is null/empty/unserialisable. */
export function formatPayloadPreview(
  payload: Record<string, unknown> | null | undefined,
  max = 60,
): string {
  if (!payload || Object.keys(payload).length === 0) return '—';
  let json: string;
  try {
    json = JSON.stringify(payload);
  } catch {
    return '—';
  }
  if (json.length <= max) return json;
  return `${json.slice(0, max - 1)}…`;
}
