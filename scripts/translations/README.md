# Bulgarian translation seed

Generated bulk-import payload for the **Localisations** screen — covers the
Bulgarian i18n gap measured on staging (2026-06-19).

## Files
- `bg-seed.json` — `[{locale,key,value}]`, import-ready (the **Import JSON/CSV**
  button on `/localisations` takes this array directly).
- `bg-seed.csv` — same rows as `locale,key,value` (spreadsheet-friendly for
  editing before re-import).

## What's in it (283 rows)
- **142 `en` rows** registering source strings that weren't in the catalog yet
  (keyed `_pendingI18n.<hash-of-english>`), so they stop falling back to English
  and show up in the panel.
- **141 `bg` rows** — Bulgarian for 130 of those + 11 previously-untranslated
  catalog rows. 12 pure-placeholder strings (`{name} · {time}`, `{iban}`, …) are
  registered EN-only (no BG needed). Brands / codes / language endonyms
  (Apple, Visa, EUR, IBAN, CVC, SMS, Push, Български/English, Signal Pro, the
  `maj*s*tor*.*` wordmark, Praktiker/OMV vendor examples) are intentionally
  left as-is.

## Provenance & caveats
- Keys + English extracted via `apps/web` `pnpm i18n:coverage --json`
  (missingFromEn + identical-bg, staging). Bulgarian is **AI-drafted — review
  before trusting it customer-facing**; retype any row in the panel and
  re-import.
- "Escrow" is localised to "Ескроу" / "ЕСКРОУ" — flip to English if preferred.
- The coverage checker **skips template-literal copy by design**, so a few
  strings it never saw are NOT in here.
- Re-run `pnpm i18n:coverage` after import to confirm the missing count drops.

## How to import
`/localisations` → **Import JSON/CSV** → pick `bg-seed.json`. Rows upsert by
(locale, key), so re-importing an edited file is safe.
