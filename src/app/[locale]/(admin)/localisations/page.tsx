import bgMessages from '@lunaticwithaduck/i18n/messages/bg.json';
import enMessages from '@lunaticwithaduck/i18n/messages/en.json';
import { setRequestLocale } from 'next-intl/server';
import LocalisationsTable, {
  type LocalisationRow,
  type LocalisationStatus,
} from './components/LocalisationsTable/LocalisationsTable';
import { PLACEHOLDER_MARKER } from './components/LocalisationsTable/config/constants';

type LocalisationsPageProps = { params: Promise<{ locale: string }> };

type NestedMessages = { [key: string]: string | NestedMessages };

// Walk the nested message tree and emit `{ "section.sub.key": "value" }`. The
// shape is generated upstream by `i18n-generate-translation-map`, so leaves
// are always plain strings.
function flatten(source: NestedMessages, prefix = ''): Record<string, string> {
  const out: Record<string, string> = {};
  for (const [name, value] of Object.entries(source)) {
    const path = prefix.length === 0 ? name : `${prefix}.${name}`;
    if (typeof value === 'string') {
      out[path] = value;
    } else if (value !== null && typeof value === 'object') {
      Object.assign(out, flatten(value, path));
    }
  }
  return out;
}

function computeStatus(key: string, en: string, bg: string): LocalisationStatus {
  const enPresent = en.length > 0;
  const bgPresent = bg.length > 0;
  if (!enPresent && bgPresent) return 'missing-en';
  if (enPresent && !bgPresent) return 'missing-bg';
  const isPlaceholder =
    en === key ||
    bg === key ||
    en === PLACEHOLDER_MARKER ||
    bg === PLACEHOLDER_MARKER ||
    en === bg;
  if (isPlaceholder) return 'placeholder';
  return 'complete';
}

function buildRows(): LocalisationRow[] {
  const en = flatten(enMessages as NestedMessages);
  const bg = flatten(bgMessages as NestedMessages);
  const allKeys = new Set<string>([...Object.keys(en), ...Object.keys(bg)]);
  const rows: LocalisationRow[] = [];
  for (const key of allKeys) {
    const enValue = en[key] ?? '';
    const bgValue = bg[key] ?? '';
    rows.push({
      key,
      en: enValue,
      bg: bgValue,
      status: computeStatus(key, enValue, bgValue),
    });
  }
  rows.sort((a, b) => a.key.localeCompare(b.key));
  return rows;
}

export default async function LocalisationsPage({ params }: LocalisationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const rows = buildRows();

  return <LocalisationsTable rows={rows} />;
}
