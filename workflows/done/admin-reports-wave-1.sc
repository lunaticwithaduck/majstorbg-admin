---
domain: admin-reports
source_task: admin-reports-wave-1
date: 2026-06-22
keywords: [admin-reports, nextjs-app-router, rtk-query, nestjs, report-screen, statTile, reportChart]
---

## Extracted Knowledge

Building a BO-style report in `majstorbg-admin` (FE) backed by `majstorbg-backend` (BE):

**Report screen anatomy (mirror backoffice within R1–R10):**
- `(admin)/reports/<slug>/page.tsx` = thin async server wrapper (`await params` → `setRequestLocale` → render one `'use client'` body). R6: no shim logic in page.
- Body composes: `ReportFilters` (wraps `PeriodSelect` + report `Select`s) → `StatTileRow`/`StatTile` KPIs → `ReportChart` → `DataTable`. All in `src/ui/components/composed/`.
- Tabbed report group = a `layout.tsx` rendering a `'use client'` tab strip (webui `Tabs` backed by `<Link>` + `usePathname`) + `{children}`; base segment page IS the first tab (no `overview/` subfolder).
- Row type derive: `type Resp = NonNullable<ReturnType<typeof useXQuery>['data']>; type Row = Resp['items'][number];` — avoids `[locale]` bracketed-path d.ts resolution issues.
- URL-synced filter state via `useSearchParams` + `useRouter().replace`; reset page→1 on any filter/sort change; server-side sort = sortable headers as `<Button variant="ghost">` toggling `sortBy/sortDir` query args; CSV export `<Button>` in `DataTable` `actions` slot via `@/lib/export.utils` (`toCsv`/`downloadCsv`/`csvFilename`).

**Type-safety gotchas (tsconfig has `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess` + strict):**
- An optional prop `foo?: T` will NOT accept `T | undefined` — either annotate `foo?: T | undefined` (re-permits undefined) or spread conditionally `{...(x ? { foo: x } : {})}`. This bit every `StatTile value={maybeUndefined}` and `TextPrice currency={maybeUndefined}` call.
- Status/label/badge-variant maps MUST be `Record<string, X>` and indexed defensively (`MAP[k] ?? k`). Typing them `Record<SomeEnum, X>` then indexing with a row field that resolves to `string`/`any` throws TS7053. With `noUncheckedIndexedAccess`, indexing returns `X | undefined` → always `?? fallback`.

**RTK / contract strategy (local-stopgap, no package republish):**
- New admin endpoints ship as local Nest DTOs (zod `createZodDto`) on BE + local-stopgap files in `src/api/admin-*-endpoints.ts` on FE (header `// TODO: replace with @lunaticwithaduck/api once BE lands`), injected into `appApi` in `src/api/store.ts`, hooks re-exported there. Matches the `admin-jobs` precedent (which keeps DTOs local to avoid touching the published `@lunaticwithaduck/schemas`/`api` packages). The published endpoints `.parse()` responses (zod strips unknown keys) so additive BE fields are invisible to published consumers — read new fields via a local-stopgap endpoint.
- `API_TAGS` (from `@lunaticwithaduck/api`) has NO `Report` member — reuse the nearest existing tag (`Job`, `User`, `Dispute`…) with a `LIST`/sentinel id.
- List envelope is `{ items, total, page, pageSize }`.

**Custom SVG charts (no webui chart primitive, no webui PR):**
- `ReportChart` dispatcher + `LineAreaChart`/`BarBreakdownChart`/`DonutChart` siblings, all dependency-free SVG. R1 only bans `style={`; SVG geometry attributes (x/y/d/points) are fine. R4 forbids hex literals — source colors from the webui `colors` token object (`import { colors } from '@lunaticwithaduck/webui'`) into a `CHART_PALETTE` constant; `DonutDatum.label` is a required `string` (map with `?? ''`).

**Nav (nested/collapsible, contextual):**
- `NavModule` extended with optional `groups?: NavGroup[]` (module → group → link). Sidebar uses a custom collapsible (`<Button unstyled>` header toggling local state, seeded from active route via `useEffect(() => { if (active) setOverride(null) }, [active])`) — NOT webui `Accordion` (Radix fights route-driven contextual expansion + `aria-current` placement). Single-use children extracted to own files for R5 (`NavModuleSection`, `NavLinkItem`).

**BE aggregation patterns (NestJS + Prisma):**
- Copy `stats`/`worker-money` services: `Promise.all` of `prisma.count/aggregate/groupBy`; `Decimal.toNumber()`; in-memory date bucketing (`createdAt.toISOString().slice(0,10)` day / `slice(0,7)` month; UTC-Monday helper for week) — no `$queryRaw`. Lists via `$transaction([count, findMany])`. Rates guard divide-by-zero. `@AllowAnonymous()` + `// TODO(auth): admin role` on every handler until the BE adds an `admin` role.
- Aging buckets: 5 parallel `aggregate` over `dueAt` ranges for `status in (sent, overdue)`. Invoice has NO currency column → EUR-assumed; never sum across currencies (Job/Bid are BGN).

**Verification (per project policy):** typecheck (both repos) + `lint:conventions` + vitest + production build (catches RSC/client-boundary issues) + Playwright smoke (`webServer` auto-starts `pnpm dev` on :3001) asserting each route renders its `<h1>` with no `pageerror` — the only step that catches client-render crashes the others miss.

**Multi-agent orchestration:** independent reports built fastest as fully self-consistent vertical slices (one agent owns BE module + FE endpoint + FE screen — internal contract, no cross-agent drift), with shared files (`routes.ts`, `store.ts`, nav constants, `app.module.ts`) edited by dedicated single-owner wiring agents in a later phase. Disjoint file ownership = no write races. Stream-timeout failures need a targeted re-run that re-emits the SAME module/endpoint/hook names the wiring already references.

## Proposed Skill Content

A `admin-reports` skill should contain: the report-screen file/skeleton template; the composed-component APIs (`PeriodSelect`/`ReportFilters`/`StatTile`/`StatTileRow`/`ReportChart`/`DataTable`); the local-stopgap RTK + Nest DTO contract recipe; the strict-tsconfig gotchas (optional-prop undefined, `Record<string,>` maps, `API_TAGS` has no Report); the SVG-chart-with-token-colors rule; the nested-nav model; the BE aggregation/bucketing/aging recipes; and the verification ladder ending in the Playwright route smoke.
