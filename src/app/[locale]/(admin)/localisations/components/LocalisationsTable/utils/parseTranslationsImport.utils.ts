import type { LocaleFilter } from '../config/constants';

export type ImportItem = { locale: string; key: string; value: string };

export type ImportErrorCode = 'parse' | 'csvHeader' | 'noKeys' | 'badLocale';
export type ImportError = { code: ImportErrorCode; locale?: string };
export type ParseImportResult = { items: ImportItem[]; error: ImportError | null };

const VALID_LOCALES = new Set<string>(['en', 'bg']);

// Flatten a nested catalog object to dot-keys (mirrors the BE/export shape), so
// a raw `${API}/translations/{locale}` dump imports without pre-flattening.
function flatten(obj: Record<string, unknown>, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [key, val] of Object.entries(obj)) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (typeof val === 'string') {
      out[path] = val;
    } else if (val !== null && typeof val === 'object') {
      Object.assign(out, flatten(val as Record<string, unknown>, path));
    }
  }
  return out;
}

function fromJson(text: string, fallbackLocale: string): ImportItem[] {
  const data: unknown = JSON.parse(text);
  // Explicit rows — `[{ locale, key, value }]` — carry their own locale, so one
  // file can seed en + bg at once.
  if (Array.isArray(data)) {
    return data.map((raw) => {
      const row = (raw ?? {}) as Record<string, unknown>;
      return {
        locale: typeof row.locale === 'string' ? row.locale.trim().toLowerCase() : fallbackLocale,
        key: typeof row.key === 'string' ? row.key.trim() : '',
        value: typeof row.value === 'string' ? row.value : String(row.value ?? ''),
      };
    });
  }
  // Flat or nested catalog `{ "dot.key": "value" }` — single locale = the filter.
  if (data !== null && typeof data === 'object') {
    return Object.entries(flatten(data as Record<string, unknown>)).map(([key, value]) => ({
      locale: fallbackLocale,
      key,
      value,
    }));
  }
  throw new Error('parse');
}

// RFC4180-ish row splitter: handles quoted fields, escaped "" quotes, and
// commas / newlines inside quotes. charAt keeps it strict-index safe.
function splitCsvRows(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < text.length; i++) {
    const c = text.charAt(i);
    if (inQuotes) {
      if (c === '"') {
        if (text.charAt(i + 1) === '"') {
          field += '"';
          i++;
        } else {
          inQuotes = false;
        }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field);
      field = '';
    } else if (c === '\n') {
      row.push(field);
      rows.push(row);
      row = [];
      field = '';
    } else if (c !== '\r') {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  // Drop blank rows (e.g. a trailing newline).
  return rows.filter((r) => !(r.length === 1 && (r[0] ?? '').trim() === ''));
}

function fromCsv(text: string, fallbackLocale: string): ImportItem[] {
  const rows = splitCsvRows(text);
  const header = rows[0];
  if (!header) throw new Error('csvHeader');
  const cols = header.map((h) => h.trim().toLowerCase());
  const keyIdx = cols.indexOf('key');
  const valueIdx = cols.indexOf('value');
  const localeIdx = cols.indexOf('locale');
  if (keyIdx === -1 || valueIdx === -1) throw new Error('csvHeader');
  return rows.slice(1).map((r) => ({
    locale: localeIdx >= 0 ? (r[localeIdx] ?? '').trim().toLowerCase() || fallbackLocale : fallbackLocale,
    key: (r[keyIdx] ?? '').trim(),
    value: r[valueIdx] ?? '',
  }));
}

// Parse a JSON or CSV translations file into bulk-upsert rows. Format is chosen
// by extension with a content sniff as fallback. Returns a machine error code
// (the component maps it to copy) so this util stays copy-free per R2.
export function parseTranslationsImport(
  fileName: string,
  text: string,
  fallbackLocale: LocaleFilter,
): ParseImportResult {
  const trimmed = text.trim();
  const looksJson = trimmed.charAt(0) === '{' || trimmed.charAt(0) === '[';
  const isCsv = /\.csv$/i.test(fileName) || (!/\.json$/i.test(fileName) && !looksJson);

  let parsed: ImportItem[];
  try {
    parsed = isCsv ? fromCsv(text, fallbackLocale) : fromJson(text, fallbackLocale);
  } catch (err) {
    const code: ImportErrorCode =
      err instanceof Error && err.message === 'csvHeader' ? 'csvHeader' : 'parse';
    return { items: [], error: { code } };
  }

  const items = parsed.filter((it) => it.key.length > 0);
  if (items.length === 0) return { items: [], error: { code: 'noKeys' } };
  const bad = items.find((it) => !VALID_LOCALES.has(it.locale));
  if (bad) return { items: [], error: { code: 'badLocale', locale: bad.locale } };
  return { items, error: null };
}
