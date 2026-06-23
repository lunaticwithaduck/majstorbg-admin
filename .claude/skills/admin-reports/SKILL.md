---
name: admin-reports
description: This skill should be used when building or modifying a BO-style admin analytics report in majstorbg-admin (FE) backed by majstorbg-backend (BE) — "admin report", "reports module", "report screen", "StatTile", "ReportChart", "ReportFilters", "PeriodSelect", "DataTable report", "aggregation endpoint", "createZodDto report", "groupBy report", "supply/demand report", "ratings report", "report stopgap endpoint", or wiring a new `/admin/reports/*` route end-to-end.
keywords:
  - admin report
  - admin-reports
  - reports module
  - report screen
  - analytics report
  - StatTile
  - StatTileRow
  - ReportChart
  - ReportFilters
  - PeriodSelect
  - SortHeader
  - DataTable report
  - useReportQuery
  - report-query.utils
  - export.utils
  - toCsv
  - CSV export
  - aggregation endpoint
  - createZodDto
  - groupBy
  - prisma aggregate
  - in-memory aggregation
  - supply and demand
  - worker supply
  - coverage ratio
  - ratings report
  - reviews aggregate
  - dispute rate
  - donut chart
  - stat tile
  - half-open date window
  - exactOptionalPropertyTypes
  - noUncheckedIndexedAccess
  - AllowAnonymous
  - local-stopgap endpoint
  - nested sidebar
  - NavModule
---

# Admin Reports Skill

End-to-end recipe for adding a **BO-style analytics report** to the
`majstorbg-admin` / `majstorbg-backend` repo pair. One report = a new BE NestJS
module (aggregation) + a FE RTK local-stopgap endpoint + a FE App-Router screen.
All FE code obeys R1–R10 (see `CLAUDE.md`).

> Companion `.sc` records this is distilled from:
> `admin-reports-wave-1`, `liquidity-bids-per-job-report`,
> `admin-worker-supply-report`, `ratings-quality-report` (in `workflows/done/`).

---

## 1. Backend — NestJS module (Prisma + nestjs-zod)

One module per report under `src/modules/admin-<name>-reports/`:
```
<name>.module.ts      # @Module exporting the class (lists only its own ctrl+svc)
<name>.controller.ts
<name>.service.ts
dto/<name>.query.dto.ts
dto/<name>.response.dto.ts
```
Register the module in `src/app.module.ts`. Routes live under `/admin/reports/*`
(plus `/admin/disputes`, `/admin/invoices` for those two).

- **DTOs** are LOCAL zod schemas wrapped with `createZodDto` from `nestjs-zod` —
  **not** promoted to `@lunaticwithaduck/schemas` while the consumer monorepo is
  in flight. Query params use `z.coerce.number()/boolean()` (they arrive as
  strings); `page`/`pageSize`/sort-enums/thresholds get `.default()`s.
- **Auth:** EVERY handler gets `@AllowAnonymous()` (from
  `../../auth/decorators/allow-anonymous.decorator.js`) + literal
  `// TODO(auth): require admin role once BE adds 'admin' to UserRole.`
- **Prisma:** `PrismaService` comes from a `@Global()` PrismaModule — do NOT
  import a Prisma module; just inject `PrismaService`.
- **Response shape:** list envelope `{ items, total, page, pageSize }`, plus a
  `summary` (KPI tiles) and/or a chart-series object.

### Aggregation decision rule
- **Single-dimension counts** → `prisma.x.groupBy({ by, _count, where })` +
  `Promise.all` of `count`/`aggregate`. Lists via `$transaction([count, findMany])`.
- **Multiple derived metrics per parent** (avg bids/job, % with ≥1 bid, mean
  child amount, …) → a single `groupBy` can't express it. `findMany` the parents
  with a minimal child `select`, then aggregate in a `Map<key, bucket>` in
  memory. The aggregated row set (one per category/city, ~tiny) sorts +
  slice-paginates in memory; **tiebreak on key** for stable pagination.
- `Decimal` → `Number(row.amount)` / `.toNumber()` / `._sum.amount?.toNumber() ?? 0`.
- **Date windows are half-open `[from, to)`:**
  `where.createdAt = { gte: new Date(from), lt: new Date(to) }`, both optional.
  In-memory bucketing: day `createdAt.toISOString().slice(0,10)`, month
  `.slice(0,7)`, week via a UTC-Monday helper. No `$queryRaw`.
- **Unnormalized currency — NEVER sum money across rows/groups.** Report each
  group's dominant currency (most rows) + a `mixedCurrency` boolean; summary
  reports counts/ratios only. (Invoice has no currency column → EUR-assumed;
  Job/Bid are BGN.)
- **Divide-by-zero guard:** `ratio(n, d) => d === 0 ? 0 : n / d` so the FE never
  sees NaN/Infinity. Round ratios/means to 2dp before the wire. Aging buckets =
  5 parallel `aggregate` over `dueAt` ranges for `status in (sent, overdue)`.

---

## 2. Frontend — RTK local-stopgap endpoint

- `src/api/admin-<name>-endpoints.ts` exports
  `export const adminXEndpoints = (build: Build) => ({ ... })` where `Build` is
  `EndpointBuilder<BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>, ApiTag, 'api'>`.
  File header: `// TODO: replace with @lunaticwithaduck/api … once BE lands.`
- **Why local-stopgap:** the published endpoints `.parse()` responses (zod strips
  unknown keys), so additive BE fields are invisible to published consumers.
  Mirrors the `admin-jobs` precedent (DTOs kept local, published packages
  untouched).
- **Hook names are derived by RTK:** `getLiquidity → useGetLiquidityQuery`,
  `listX → useListXQuery`. This name is the **hard contract** with the wiring
  agent (below) — the component name is yours, the hook name is not.
- **Tags:** `API_TAGS` (from `@lunaticwithaduck/api`) has **no `Report` member**.
  Reuse the nearest existing tag with a sentinel id:
  `{ type: API_TAGS.Job, id: 'LIQUIDITY' }` (mirrors funnel's `'FUNNEL'`).
- **Wiring boundary:** a dedicated wiring agent spreads the builder into
  `store.ts` `injectEndpoints` and re-exports the hook, and owns `routes.ts`,
  nav constants, and `app.module.ts`. Do **not** edit those files from a screen
  agent — disjoint file ownership = no write races.

---

## 3. Frontend — the screen (App Router + composed components)

- `(admin)/reports/<slug>/page.tsx` = **thin async server wrapper**: `await params`
  → `setRequestLocale(locale)` → render one `'use client'` body inside
  `<Suspense>` (required — the body calls `useSearchParams`). R6: no shim logic.
- **Body** is `'use client'`, colocated under `components/<Pascal>Report/` with a
  sibling `.styles.ts` (default-exported plain object of className strings) and
  `../../config/constants.ts` (ALL_CAPS_OBJECTS for every label/copy/PAGE_SIZE/
  param-key).
- **Tabbed report group** = a `layout.tsx` rendering a `'use client'` tab strip
  (webui `Tabs` backed by `<Link>` + `usePathname`) + `{children}`; the base
  segment page IS the first tab (no `overview/` subfolder).
- **URL state:** `useReportQuery(pageKey)` from `@/lib/report-query.utils` —
  `get`/`getNumber`/`set`; `set` auto-resets page→1 on any non-page change and
  strips empty keys. Server-side sort = `SortHeader` (ghost-button column header
  toggling `sortBy`/`sortDir` query args).
- **Composed building blocks** (all in `src/ui/components/composed/`):
  - `StatTileRow` / `StatTile` — KPI tiles.
  - `ReportChart` — discriminated `kind`: `line | area | bar | donut`. Bar wants
    `data: {label,value}[]` + `ariaLabel`; donut `data: {label,value}[]` (label
    e.g. `"5★"`) + `ariaLabel`. Renders `<svg role="img" aria-label=…>` →
    Playwright targets `getByRole('img', { name: /…/i })`.
  - `DataTable<T>` — tanstack `ColumnDef[]`, server-side paging via
    `total/page/pageSize/onPageChange`, plus `filters` and `actions` slots.
  - `ReportFilters` — wraps `PeriodSelect`; extra `<Select>` filters go as
    children (rendered in a slot next to PeriodSelect). webui `Select` takes
    `label`/`value`/`onValueChange`/`size`; options are `<SelectItem value=…>`.
- **CSV export:** `toCsv`/`downloadCsv`/`csvFilename` from `@/lib/export.utils`,
  fired from a `<Button>` in the DataTable `actions` slot (client-side over the
  current page until BE export lands).
- **Derive row types from the hook** to dodge bracketed-`[locale]`-path `.d.ts`
  resolution issues:
  ```ts
  type Resp = NonNullable<ReturnType<typeof useGetXQuery>['data']>;
  type Row  = Resp['items'][number];
  // also: type Summary = …['data']>; type Bucket = Summary['starDistribution'][number];
  ```

### Custom SVG charts (no webui chart primitive)
`ReportChart` is a dispatcher over dependency-free SVG siblings
(`LineAreaChart`/`BarBreakdownChart`/`DonutChart`). R1 only bans `style={` — SVG
geometry attrs (x/y/d/points) are fine. R4 forbids hex literals → source colors
from the webui `colors` token (`import { colors } from '@lunaticwithaduck/webui'`)
into a `CHART_PALETTE` const. `DonutDatum.label` is a required `string` (`?? ''`).

---

## 4. Strict-tsconfig gotchas (these bit every prior wave)

tsconfig has `strict` + `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess`.

- An optional prop `foo?: T` will **not** accept `T | undefined`. Either annotate
  `foo?: T | undefined`, or spread conditionally `{...(x ? { foo: x } : {})}`.
  Bit every `StatTile value={maybeUndefined}` / `TextPrice currency={…}` call —
  pass concrete values: `value={x ?? 0}` or a formatted string.
- Status/label/badge-variant maps MUST be `Record<string, X>` (loose key) and
  indexed defensively `MAP[row.status] ?? row.status`. Typing as
  `Record<SomeEnum, X>` then indexing with a plain-string field throws **TS7053**.
  With `noUncheckedIndexedAccess`, indexing returns `X | undefined` → always
  `?? fallback`.

### Pre-wiring typecheck (hook not in store.ts yet)
The hook (`useGetXQuery`) doesn't exist in `store.ts` until the wiring agent
adds it, so `ReturnType<typeof useGetXQuery>['data']` resolves to `any` and
`.map(...)` trips `noImplicitAny` (TS7006). Fix without touching `store.ts`:
- Import the row/point TYPES from your own endpoints file and make the derived
  Row fall back: `type Row = Resp extends { items: readonly unknown[] } ? Resp['items'][number] : EndpointRow;`
- Cast map sources: `((data?.chart ?? []) as ChartPoint[]).map((point) => …)`.
- To self-verify the screen compiles, TEMPORARILY add the import/spread/
  hook-export to `store.ts`, run `tsc --noEmit`, then revert all three edits
  exactly (`git diff` to confirm `store.ts` is byte-identical).

---

## 5. Schema facts that aren't where you'd expect (majstorbg prisma)

### Worker supply / demand
- `Worker` has **no** `cityName`/`category` column. City = `Worker.serviceCity`
  (nullable) → fall back to `Worker.serviceArea` (required) when null. No
  soft-delete flag → "active worker" == every `Worker` row.
- A worker's skills/categories live in `WorkerSkill`, joined via the SHARED
  `userId` (`Worker.userId == WorkerSkill.userId`). `WorkerSkill` has two FKs:
  `categoryId → SkillCategory` (15-value profession taxonomy) and
  `jobCategoryId → JobCategory` (10-value). Use **`jobCategoryId`** to line
  workers up against jobs.
- `Job.category` is a plain `String`, NOT a relation — but it stores a
  `JobCategory.id`. So demand (`job.groupBy({ by:['category'] })`) and supply
  (`WorkerSkill.jobCategoryId`) match on the same `JobCategory.id`. Labels from
  `JobCategory.nameEn`/`nameBg`.
- `JobStatus` = `open | accepted | in_progress | awaiting_confirmation |
  completed | cancelled`. Open-job demand = `status: 'open'`.
- **Windowing split:** supply (Worker/WorkerSkill) is a CURRENT SNAPSHOT — never
  time-filter it. Only DEMAND (open Jobs) takes the `from`/`to` window on
  `Job.createdAt`. **State this in the query DTO.**
- In-memory cross-model aggregation: build `Map<userId, snapshot>` from workers,
  fold each skill row into its category bucket via that map (workers with
  `userId === null` drop out — note it); dedupe `(userId, categoryId)` with a
  `Set`; **seed zero-supply buckets from the demand groups** so thin coverage
  doesn't vanish. `coverageRatio = activeWorkers/openJobs` is `null` when
  `openJobs === 0` (FE renders `—`, nulls sort last). Compute `thinCoverage`
  server-side (one tunable const) so the FE never reimplements the heuristic.

### Ratings / reviews
- `Review` columns: `id, jobId, authorUserId, subjectUserId, stars (Int), body,
  response (String?), createdAt`. **No rating-chip/tag/aspect column** — `stars`
  is the only persisted signal. An unrated entity simply has no Review rows.
- Reviews are **bidirectional**. "Worker quality" = worker-AS-SUBJECT only:
  filter `subject: { is: { role: 'worker' } }`. Forgetting this doubles the set.
- `stars` is a free `Int` (1..5 by convention, not enum-enforced). Clamp
  `g.stars >= 1 && g.stars <= 5` and zero-fill all five buckets for a stable donut.
- Dispute → worker is INDIRECT: `Dispute.bidId → Bid.workerUserId` (Dispute has
  no worker FK). Filter `bid: { is: { workerUserId: { in: ids } } }`, then re-fold
  `groupBy(['bidId'])` to workers via one `bid.findMany({ select:{ id, workerUserId } })`.
- **House convention:** to-one relation filters use the `{ is: { … } }` wrapper
  (`subject: { is: { role } }`, `job: { is: { status: 'completed' } }`). Flat form
  compiles but `{ is }` matches worker-leaderboard service.
- **Windowed vs lifetime split (state in DTO):** rating tiles + star distribution
  + reviewCount window on `Review.createdAt`. `disputeRate = total disputes /
  completed jobs` is LIFETIME platform-wide on purpose (rolling window over a
  tiny dispute set is noise). Return `totalDisputes` + `completedJobs` raw so the
  FE shows the ratio's basis; `rate(n,d) => d===0 ? 0 : n/d`, 2dp.
- **In-memory HAVING:** "workers whose avg < threshold AND count >= min" can't be
  a Prisma HAVING+orderBy+paginate across the join. Do
  `review.groupBy({ by:['subjectUserId'], _avg:{stars}, _count:{_all} })` →
  `.filter(r => r.reviewCount >= minReviews && r.avgRating < maxAvg)` in memory →
  second trip for names/disputes over qualifying ids → sort + slice-paginate
  (tiebreak on id). Thresholds = `z.coerce.number().default(…)` query params
  (`minReviews` default 3, `maxAvg` default 3) so the FE filter bar tunes them.

---

## 6. Nav (nested / collapsible / contextual)

- `NavModule` extended with optional `groups?: NavGroup[]` (module → group →
  link). Sidebar uses a custom collapsible (`<Button unstyled>` header toggling
  local state, seeded from the active route via
  `useEffect(() => { if (active) setOverride(null) }, [active])`) — **not** webui
  `Accordion` (Radix fights route-driven contextual expansion + `aria-current`
  placement). Single-use children extracted to own files for R5
  (`NavModuleSection`, `NavLinkItem`).
- **Do NOT use webui `<Spacer />` as a horizontal flex grow-spacer here.** Its
  `size="flex"` base is `flex-1`, but the compound variants flip it at the `md:`
  breakpoint for the consumer app's mobile→desktop stacking: vertical →
  `md:w-full md:flex-none`, horizontal → `md:w-6 md:flex-none`. Admin is always
  ≥ `md`, so a `<Spacer />` in the 260px sidebar becomes full-width/fixed and
  forces a horizontal scrollbar on the `overflow-y-auto` aside (which computes
  `overflow-x` to `auto`). To push a trailing icon to the right edge, give the
  middle `Text` `flex-1 min-w-0 text-left truncate` and the trailing `Icon`
  `shrink-0` — no spacer, no wrapper (R3 bans a raw `<span>`).

---

## 7. Verification ladder (project policy — run all, in order)

```bash
# admin
pnpm typecheck && node scripts/lint-conventions.cjs && pnpm test && pnpm build
npx playwright test e2e/reports-smoke.spec.ts --project=chromium   # auto-starts dev :3001
# backend
cd ../majstorbg-backend && pnpm typecheck
```
- `lint-conventions.cjs` is run via **node** (not npm/pnpm). It validates R1 (no
  `style=`), R3 (webui primitives only — no raw button/input/textarea/a/p/span/
  h1-6/label), R5 (one component per file). **Filter its output to your files** —
  the repo carries pre-existing violations elsewhere.
- The Playwright smoke (`webServer` auto-starts `pnpm dev` on :3001) asserts each
  route renders its `<h1>` with no `pageerror` — **the only step that catches
  client-render crashes** the others miss. It runs without the BE up, so screens
  land in loading/error/empty state (validates render, not data). For data, run
  BE + DB and point the admin API client at it.

---

## 8. Multi-agent build pattern

Independent reports build fastest as **fully self-consistent vertical slices**
(one agent owns BE module + FE endpoint + FE screen — internal contract, no
cross-agent drift). Shared files (`routes.ts`, `store.ts`, nav constants,
`app.module.ts`) are edited by dedicated single-owner **wiring agents** in a
later phase. Disjoint file ownership = no write races. A stream-timeout failure
needs a targeted re-run that re-emits the SAME module/endpoint/hook names the
wiring already references.

**Process gotcha:** when a previous run left partials under a different component
name (e.g. `RatingsQualityReport` vs the wiring's `RatingsReport`), CREATE the
correctly-named folder and DELETE the stale one (R5) — don't leave both. Only the
`store.ts` hook name + endpoint-builder name are the hard contract; the component
name is yours but must match what `page.tsx` imports.
