---
title: Localisations bulk import — add CSV (+ flexible JSON) to the existing JSON import
created: 2026-06-19
status: in-progress
---

## Goal
The admin localisations screen already bulk-imports a **flat JSON** catalog
(`{ "dot.key": "value" }`) for the active locale via `POST /admin/translations/bulk`.
Merge human asked for bulk upload of new entries from **JSON or CSV**. This adds:
- **CSV** import: header row with `key` + `value` (single locale = the filter) or
  `locale` + `key` + `value` (multi-locale). RFC4180 quoting handled.
- **Richer JSON**: in addition to the flat object, accept a
  `[{ locale, key, value }]` array (multi-locale in one file) and nested catalogs
  (auto-flattened).

No BE change — the `bulkUpsert` mutation + `/admin/translations/bulk` endpoint
already exist; this is purely the admin-side parse/upload.

## Approach
- New pure util `LocalisationsTable/utils/parseTranslationsImport.utils.ts`:
  `(fileName, text, fallbackLocale) → { items, error }`. Picks JSON vs CSV by
  extension with a content-sniff fallback; returns a machine error **code**
  (component maps to copy, so the util stays copy-free per R2). Strict-safe
  (charAt + nullish guards).
- `LocalisationsTable.tsx`: route `handleImportFile` through the util; widen the
  file input `accept` to `.csv` too.
- `config/constants.ts`: relabel the button to "Import JSON/CSV" and add the
  parse/csv-header/no-keys/bad-locale error copy.

## Steps
- [x] parseTranslationsImport util (JSON flat/array/nested + CSV)
- [x] wire into handleImportFile + widen accept
- [x] constants: button label + error copy

## QA
Route: /localisations (admin)
Auth: staff (auth deferred per repo scaffold)
Criteria:
- Importing a `.csv` with `locale,key,value` rows upserts each row and shows
  "Imported N entries."; a `key,value` CSV upserts under the active locale filter.
- Importing a `[{locale,key,value}]` JSON array upserts multi-locale; a flat
  `{key:value}` JSON still imports under the active locale (unchanged).
- A CSV with no `key`/`value` header shows the header error; an unknown locale
  shows the bad-locale error; neither calls the API.
- The list refreshes (tag invalidation) after a successful import.

## Completion
Run `/complete workflows/tasks/localisations-csv-import.md` once eyeballed.
