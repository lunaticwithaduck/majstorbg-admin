---
title: Ratings & quality admin report (end-to-end)
created: 2026-06-22
status: done
completed: 2026-06-22
---

## Goal
Complete the "Ratings & quality" admin report end-to-end. A previous run left
partial files; (re)create ALL of them completely so the already-wired shared
plumbing (store.ts, routes.ts, app.module.ts, admin-shell) resolves.

- BE module `admin-ratings-reports` (module/controller/service/dto):
  - GET /admin/reports/ratings (summary) + GET /admin/ratings/low (paginated).
  - @AllowAnonymous() + `// TODO(auth): admin role`.
- FE endpoint `src/api/admin-ratings-endpoints.ts` exporting `adminRatingsEndpoints`
  with hooks `useGetRatingsSummaryQuery` + `useListLowRatedWorkersQuery`.
- FE screen `reports/ratings/`: thin server `page.tsx` + `RatingsReport`
  ('use client') + `.styles.ts` + `config/constants.ts`.
  StatTileRow + ReportChart kind='donut' star distribution + sortable DataTable
  of low-rated workers (drilldown routes.users.detail(workerUserId), CSV export).

## Steps
- [x] Read FE + BE convention examples and prisma schema.
- [x] Write BE module (module/controller/service/dto).
- [x] Write FE endpoint file (hook + builder names match store.ts).
- [x] Write FE screen under the exact `RatingsReport` component name.
- [x] Remove stale `RatingsQualityReport` partial folder.
- [x] typecheck + Playwright self-test against dev server.

## Completion
When all steps above are done:
Run `/complete workflows/tasks/ratings-quality-report.md` before starting any new work.

## Outcome

Completed on 2026-06-22.

Built the Ratings & quality admin report end-to-end across both repos.

**BE** (`majstorbg-backend/src/modules/admin-ratings-reports/`): module, controller
(`@Controller('admin')`, both endpoints `@AllowAnonymous()` + `// TODO(auth)`),
service, and 4 DTOs. `GET /admin/reports/ratings` returns avg worker rating +
1..5 star histogram (Review `_avg.stars`/`groupBy` over reviews whose SUBJECT is a
worker) + lifetime dispute rate (Dispute count / completed-job count). `GET
/admin/ratings/low` is the paginated low-rated-worker queue (avg < maxAvg=3 with
>= minReviews=3), sortable, with `workerId` drilldown and a `disputeCount`
secondary signal.

**FE** (`majstorbg-admin`): `src/api/admin-ratings-endpoints.ts` (builder
`adminRatingsEndpoints`, hooks `useGetRatingsSummaryQuery` +
`useListLowRatedWorkersQuery` — exact names the already-wired `store.ts`
re-exports). Screen at `reports/ratings/`: thin server `page.tsx` + `'use client'`
`RatingsReport` + `.styles.ts` + `config/constants.ts`. Renders StatTileRow (avg
rating / reviews / dispute rate / completed jobs), ReportChart `kind='donut'` of
the star distribution, and a sortable DataTable of low-rated workers with
`routes.users.detail(workerUserId)` drilldown + CSV export.

**Schema adaptations**: rating chips are NOT persisted (Review has only
stars/body/response/createdAt) — no chips used; the rating signal is `stars`
only. Reviews are bidirectional, so worker rating = Review where
`subject.role === 'worker'` (the worker-as-subject side). Dispute attributes to a
worker via `Dispute -> bid.workerUserId`. To-one relation filters use the
`{ is: { ... } }` form (matches the worker-leaderboard reference).

**Cleanup**: removed the stale `RatingsQualityReport` partial folder so the only
component is the required `RatingsReport` (R5 one-component-per-file).

**Verification**: BE `tsc` clean for the ratings module (8 pre-existing errors only
in the unrelated `admin-bid-outcomes-reports`); FE `tsc` clean for ratings
(pre-existing errors only in `match-speed`/`disputes`/`users`); Biome clean on the
5 ratings files; convention checker reports zero ratings violations. Added
`e2e/ratings-report.spec.ts` and ran it green against the dev server — KPI tiles,
donut SVG, low-rated rows, and the View → `/en/users/wkr_abc123` drilldown all
render and navigate.
