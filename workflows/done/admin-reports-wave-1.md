---
title: Admin Reports module — wave 1 (BO-style)
created: 2026-06-22
completed: 2026-06-22
status: done
---

## Goal
Build a BO-style **Reports** module in `majstorbg-admin`, mirroring the backoffice reports anatomy (filter bar → table/KPI → totals/export) within R1–R10. Wave 1 ships 4 reports plus the shared scaffolding (nested nav, routes, composed components, RTK endpoints) and the BE aggregation endpoints they need.

### Locked decisions
- **Wave-1 reports:** User Directory, Jobs Funnel (posted→completed), Open Disputes Queue, Invoices & AR Aging.
- **Nav:** convert flat always-expanded sidebar → nested, collapsible, contextual (module → group → page; active module auto-expanded). Custom collapsible, not webui Accordion.
- **Dates:** named-preset `Select` (Today / Last 7d / Last 30d / This month / Custom).
- **Charts:** table + KPI tiles, PLUS a custom reusable SVG chart set under `src/ui/components/composed/ReportChart/` (no webui PR). Colors from webui `colors` token via a `CHART_PALETTE` constant (R4-safe).
- **Contract strategy:** local Nest DTOs on BE + local-stopgap RTK endpoint files on FE (`// TODO: replace with @lunaticwithaduck/api … once BE lands`). NO `@lunaticwithaduck/schemas`/`api` republish this wave. Matches `admin-jobs` precedent.

### Cross-repo note
BE work lands in `../majstorbg-backend` on a **branch/PR** (sibling repo — direct-to-main policy does NOT apply there). Admin FE may push to main.

## Steps

### Frontend (majstorbg-admin)
- [x] **Phase 0 — foundations:** add `reports` namespace to `src/config/routes.ts`; add `src/lib/export.utils.ts` (`toCsv`, `downloadCsv`, `csvFilename`).
- [x] **Phase 1 — composed components** (`src/ui/components/composed/`): `PeriodSelect/`, `ReportFilters/`, `StatTile/`, `StatTileRow/`, `ReportChart/` (dispatcher + `LineAreaChart`/`BarBreakdownChart`/`DonutChart`, CHART_PALETTE from `colors`, `utils/scale.utils.ts`).
- [x] **Phase 2 — RTK layer:** `admin-reports-endpoints.ts`, `admin-disputes-endpoints.ts`, `admin-invoices-endpoints.ts` wired into `src/api/store.ts`.
- [x] **Phase 3 — nav refactor:** `NavModule` extended with `groups`; `Sidebar.tsx` → contextual collapsible; `NavModuleSection/` + `NavLinkItem/` extracted; `nav.utils.ts`; `Sidebar.test.tsx` updated; Reports module added (later grouped in wave 2).
- [x] **Phase 4 — screens** under `(admin)/reports/`: `users/`, `jobs-funnel/` (+`breakdown`), `disputes/` (+`[id]`), `invoices/` (+`list`).
- [x] **Verify:** lint:conventions clean, typecheck 0, tests 6/6, production build all routes, Playwright smoke 18/18.

### Backend (majstorbg-backend, on `develop` working tree — needs branch/PR)
- [x] **Report 1 — User Directory:** local superset zod query DTO; `verified`/`emailVerified`/`lastActiveSince` filters + `sortBy`/`sortDir`; additive `verified`+`lastActiveAt`; `/admin/reports/users-summary`.
- [x] **Report 2 — Jobs Funnel:** `admin-reports` module → `/admin/reports/jobs-funnel` (+`/breakdown`).
- [x] **Report 3 — Open Disputes:** `admin-disputes` module → `/admin/disputes` (+`/:id`, `/summary`, `/export`).
- [x] **Report 4 — Invoices & AR Aging:** `admin-invoices` module → `/admin/invoices`, `/admin/reports/invoices-aging`, `/admin/invoices/export`.
- [x] Modules registered in `app.module.ts`; `@AllowAnonymous()` + `// TODO(auth): admin role` on handlers.

## Outcome

Completed 2026-06-22. Shipped wave 1 (4 reports) **and** a wave-2 expansion (12 more) for **16 reports total**, end-to-end across both repos:

- **Reports:** User Directory, Jobs Funnel (+breakdown), Open Disputes (+detail), Invoices & AR Aging (+list); Liquidity, Match Speed, Cancellations, Bid Outcomes; Worker Supply, Worker Leaderboard, Profile Completeness; Registrations, Engagement; Ratings; Category Performance; Portfolio Coverage.
- **Shared FE:** `PeriodSelect`, `ReportFilters`, `StatTile`/`StatTileRow`, custom SVG `ReportChart` (line/area/bar/donut), `export.utils.ts`. Nav converted to nested/collapsible BO-style with a grouped Reports module.
- **Backend:** 6 new NestJS modules + `admin-users` extensions, all registered; local Nest DTOs; `@AllowAnonymous` placeholder pending the future admin role.
- **Built with multi-agent workflows** (~35 agents across 3 workflows) on explicit user request for parallelism.

**Validation:** admin typecheck 0 · BE typecheck 0 · lint:conventions clean (new files) · vitest 6/6 · production build all 18 report routes · Playwright smoke 18/18 routes render with no runtime error.

**Not committed:** admin → eligible for `main`; backend on `develop` → needs `feat/admin-reports` branch + PR.

### Notable systemic gotchas (fed back mid-build)
- `tsconfig` `exactOptionalPropertyTypes` + `noUncheckedIndexedAccess`: optional props can't receive `T | undefined` (annotate `?: T | undefined` or spread conditionally); status/label maps must be `Record<string, X>` indexed with `?? fallback`, not `Record<Enum, X>`.
- `API_TAGS` has no `Report` member — reuse the nearest existing tag (`Job`, `User`, …).
- SVG chart colors must reference the webui `colors` token object (not hex literals) to satisfy R4.
