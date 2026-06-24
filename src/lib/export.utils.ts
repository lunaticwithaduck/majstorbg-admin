/**
 * CSV export helpers for report tables. Framework-agnostic; the download path
 * is guarded so it is a no-op outside the browser.
 *
 * Backoffice exports server-side CSV; until the BE export endpoints land, report
 * screens build CSV client-side from the current page of rows. The column-driven
 * shape mirrors the report's visible columns.
 */

export type CsvColumn<T> = {
  header: string;
  value: (row: T) => string | number | null | undefined;
};

/** RFC-4180 field quoting: wrap in quotes and double any embedded quotes. */
function escapeCsvField(raw: string | number | null | undefined): string {
  if (raw === null || raw === undefined) return '';
  const text = String(raw);
  if (/[",\n\r]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

export function toCsv<T>(rows: readonly T[], columns: readonly CsvColumn<T>[]): string {
  const headerLine = columns.map((column) => escapeCsvField(column.header)).join(',');
  const bodyLines = rows.map((row) =>
    columns.map((column) => escapeCsvField(column.value(row))).join(','),
  );
  return [headerLine, ...bodyLines].join('\r\n');
}

/** Trigger a browser download of `csv` as `filename`. No-op during SSR. */
export function downloadCsv(filename: string, csv: string): void {
  if (typeof window === 'undefined' || typeof document === 'undefined') return;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

/** `prefix_YYYY-MM-DD.csv` — stable, sortable export filenames. */
export function csvFilename(prefix: string, now: Date = new Date()): string {
  const stamp = now.toISOString().slice(0, 10);
  return `${prefix}_${stamp}.csv`;
}
