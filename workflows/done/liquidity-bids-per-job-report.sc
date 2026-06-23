---
domain: admin-reports
source_task: liquidity-bids-per-job-report.md
date: 2026-06-22
keywords: ["admin report", "rtk query stopgap", "prisma aggregation", "stat tile", "report chart", "exactOptionalPropertyTypes", "createZodDto"]
---

## Extracted Knowledge

End-to-end pattern for adding an admin analytics report (BE NestJS module +
FE RTK stopgap endpoint + FE screen), as practiced in majstorbg-admin /
majstorbg-backend.

### Backend (NestJS + Prisma + nestjs-zod)
- One module per report under `src/modules/admin-<name>-reports/`:
  `<name>.module.ts` (exports the `@Module` class), `.controller.ts`,
  `.service.ts`, `dto/*.query.dto.ts`, `dto/*.response.dto.ts`.
- DTOs are LOCAL zod schemas wrapped with `createZodDto` from `nestjs-zod`
  (NOT promoted to `@lunaticwithaduck/schemas` while consumer monorepo work is
  in flight). Query params use `z.coerce.number()/boolean()` because they
  arrive as strings; `page`/`pageSize` get `.default()`s, sort enums get
  `.default()`s.
- EVERY handler gets `@AllowAnonymous()` (from
  `../../auth/decorators/allow-anonymous.decorator.js`) + a literal
  `// TODO(auth): require admin role once BE adds 'admin' to UserRole.`
- PrismaService is provided by a `@Global()` PrismaModule — report modules do
  NOT import a Prisma module; just inject `PrismaService` and list only their
  own controller/service in `@Module`.
- Lists return the envelope `{ items, total, page, pageSize }`. Reports also
  attach a `summary` (KPI tiles) and/or a chart series object.
- Aggregation choice: use `prisma.job.groupBy({ by, _count, where })` +
  `Promise.all` of count/aggregate for SINGLE-dimension counts. But when a row
  needs MULTIPLE derived metrics that depend on per-parent child counts (e.g.
  avg bids/job, % of jobs with >=1 bid, % with >=3, mean child amount), a
  single groupBy can't express it — instead `findMany` the parents with a
  minimal child `select`, then aggregate in a `Map<key, bucket>` in memory.
  The aggregated row set (one per category/city) is tiny, so sort + slice
  pagination in memory after aggregation is fine and stable (tiebreak on key).
- `Decimal` columns: convert with `Number(row.amount)` (or
  `.toNumber()`/`._sum.amount?.toNumber() ?? 0` for aggregates).
- Date windows are half-open `[from, to)`: `where.createdAt = { gte: new
  Date(from), lt: new Date(to) }`, both bounds optional.
- Unnormalized currency: NEVER sum money across rows/groups. Report each
  group's dominant currency (the code with the most rows) and a
  `mixedCurrency` boolean; the summary reports counts/ratios only.
- Divide-by-zero guard helper `ratio(n, d) => d === 0 ? 0 : n/d` so the FE
  never sees NaN/Infinity. Round ratios/means to 2dp before the wire.

### Frontend RTK stopgap endpoint
- `src/api/admin-<name>-endpoints.ts` exports
  `export const adminXEndpoints = (build: Build) => ({ ... })` where `Build` is
  `EndpointBuilder<BaseQueryFn<AxiosBaseQueryArgs, unknown,
  AxiosBaseQueryError>, ApiTag, 'api'>`. File header:
  `// TODO: replace with @lunaticwithaduck/api ... once BE lands.`
- Hook name is derived by RTK: a query `getLiquidity` → `useGetLiquidityQuery`,
  a `listX` → `useListXQuery`. A WIRING AGENT spreads the builder into
  `store.ts` `injectEndpoints` and re-exports the hook — do NOT edit `store.ts`.
- Tag aggregates with a domain tag + a sentinel id, e.g.
  `{ type: API_TAGS.Job, id: 'LIQUIDITY' }` (mirrors funnel's `'FUNNEL'`), so
  later mutations can invalidate it.

### Frontend screen (Next.js App Router + composed components)
- `page.tsx` is a THIN async server wrapper: `await params` →
  `setRequestLocale(locale)` → render the one `'use client'` body inside
  `<Suspense>` (required because the body calls `useSearchParams`).
- Body component is `'use client'`, colocated under
  `components/<Pascal>Report/`, with sibling `.styles.ts` (default-exported
  plain object of className strings) and `../../config/constants.ts`
  (ALL_CAPS_OBJECTS for every label/copy/PAGE_SIZE/param-key).
- URL-synced filter/sort/page state via `useReportQuery(pageKey)` from
  `@/lib/report-query.utils` — `get`/`getNumber`/`set`; `set` auto-resets page
  to 1 on any non-page change and strips empty keys.
- Composed building blocks: `StatTileRow`/`StatTile` (KPIs), `ReportChart`
  (discriminated `kind`: line/area/bar/donut — bar wants `data:{label,value}[]`
  + `ariaLabel`), `DataTable<T>` (tanstack ColumnDef[], server-side paging via
  `total/page/pageSize/onPageChange`, `filters`/`actions` slots), `SortHeader`
  (ghost-button column header toggling server sort), `ReportFilters` (wraps
  `PeriodSelect`, extra `<Select>` filters as children).
- CSV export: `toCsv`/`downloadCsv`/`csvFilename` from `@/lib/export.utils`,
  fired from a `<Button>` in the DataTable `actions` slot (client-side over the
  current page until BE export lands).
- Derive Row types from the hook to avoid bracketed-path `.d.ts` resolution
  issues:
  `type Resp = NonNullable<ReturnType<typeof useGetXQuery>['data']>;`
  `type Row = Resp['items'][number];`

### TypeScript strict + exactOptionalPropertyTypes gotchas (these bit prior waves)
- Pass concrete values to `StatTile value=` — `value={x ?? 0}` or a formatted
  string, never a raw possibly-undefined.
- Status/type → label or → Badge-variant maps: type them
  `Record<string, string>` (loose key) and index defensively
  `MAP[row.status] ?? row.status` — do NOT type as `Record<SomeEnum,...>` then
  index with a plain string field (TS7053).
- Optional props that may be undefined into webui components: spread
  conditionally `{...(x ? { prop: x } : {})}` rather than `prop={x}`.

### Convention enforcement
- `node scripts/lint-conventions.cjs` (NOT npm/pnpm) validates R1 (no `style=`),
  R3 (webui primitives only — no raw button/input/textarea/a/p/span/h1-6/label),
  R5 (one component per file), etc. Filter its output to your files; the repo
  carries pre-existing violations elsewhere. `<Text value="...">` for static
  copy, `children` for runtime data.

## Proposed Skill Content

A skill `admin-reports` documenting the full recipe to add a new admin
analytics report in this monorepo pair:

1. BE module scaffold (module/controller/service/dto), local createZodDto DTOs,
   `@AllowAnonymous()` + TODO(auth), global PrismaService, `{items,total,page,
   pageSize}` + summary + chart-series response triple.
2. Decision rule: Prisma `groupBy`+`Promise.all` for single-dimension counts
   vs `findMany`+in-memory `Map` bucket aggregation for multi-metric-per-group
   rows; Decimal→Number; half-open date windows; unnormalized-currency
   handling (dominant currency + mixedCurrency, never sum); `ratio()` guard.
3. FE stopgap RTK builder typing + hook-name derivation + tag sentinels +
   the "wiring agent owns store.ts/routes.ts/app.module.ts" boundary.
4. FE screen anatomy: thin server `page.tsx` + Suspense + `'use client'` body,
   `useReportQuery` URL state, composed StatTile/ReportChart/DataTable/
   SortHeader/ReportFilters, CSV export, hook-derived Row types.
5. The exactOptionalPropertyTypes checklist (StatTile value, Record<string,...>
   maps, conditional prop spread) and the `lint-conventions.cjs` rules.
