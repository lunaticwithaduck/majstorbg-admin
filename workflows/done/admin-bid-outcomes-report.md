---
title: Bid outcomes report (end-to-end)
created: 2026-06-22
status: done
completed: 2026-06-22
---

## Goal
Build the "Bid outcomes" report end-to-end: bid status mix
(pending/accepted/rejected/withdrawn) counts + win rate (accepted/total) +
withdrawal rate, overall and by category. Data sources: Bid.status, Bid.jobId,
Job.category. Render KPI tiles + donut status mix + table by category.

## Steps
- [x] BE module `admin-bid-outcomes-reports` (module/controller/service + dto local zod)
- [x] BE endpoint GET /admin/reports/bid-outcomes (@AllowAnonymous + TODO auth)
- [x] FE stopgap endpoint builder `admin-bid-outcomes-endpoints.ts`
- [x] FE screen: page.tsx + BidOutcomesReport.tsx + .styles.ts + config/constants.ts
- [x] StatTileRow KPIs + ReportChart donut + DataTable by category w/ ReportFilters, server sort, CSV export

## Completion
When all steps above are done:
Run `/complete workflows/tasks/admin-bid-outcomes-report.md` before starting any new work.

## Outcome

Completed on 2026-06-22. Built the "Bid outcomes" report end-to-end.

BACKEND (majstorbg-backend) — new module `src/modules/admin-bid-outcomes-reports/`:
- `admin-bid-outcomes-reports.module.ts` (exports `AdminBidOutcomesReportsModule`),
  `.controller.ts`, `.service.ts`, `dto/bid-outcomes.query.dto.ts`,
  `dto/bid-outcomes.response.dto.ts` (local zod via `createZodDto`).
- Endpoint `GET /admin/reports/bid-outcomes` — `@AllowAnonymous()` +
  `// TODO(auth): require admin role`. Accepts `page,pageSize,from?,to?,search?,
  sortBy?,sortDir?`. Window anchored on `Bid.createdAt`.
- Service: `bid.groupBy({ by:['status'] })` for the overall mix (KPIs + donut),
  plus `bid.findMany({ select: { status, job:{ select:{ category } } } })`
  folded into a `Map<category, StatusCounts>` in memory (Prisma `groupBy` cannot
  group by a relation field). Search/sort/paginate the per-category rows in
  memory. `rate(n,d)` divide-by-zero guard. Date-only `to` bumped +1 UTC day so
  the end day is inclusive.

FRONTEND (majstorbg-admin):
- `src/api/admin-bid-outcomes-endpoints.ts` — stopgap builder
  `adminBidOutcomesEndpoints(build)` with `getBidOutcomes` query (hook
  `useGetBidOutcomesQuery`), tagged `{ type: API_TAGS.Bid, id: 'OUTCOMES_REPORT' }`.
- `src/app/[locale]/(admin)/reports/bid-outcomes/` — thin `page.tsx` server
  wrapper + `components/BidOutcomesReport/BidOutcomesReport.tsx` ('use client') +
  `.styles.ts` + `config/constants.ts`. KPI StatTileRow (total/accepted/winRate/
  withdrawalRate) + donut status-mix ReportChart (from overall `totals`,
  page-independent) + per-category DataTable with ReportFilters (PeriodSelect),
  server-side sort headers, and CSV export in the actions slot. URL-synced state
  via `useReportQuery`. Row types derived from the hook.

Schema adaptation: the report spec's "Bid.status, Bid.jobId; Job.category" maps
cleanly to real models — `Bid.status` (enum pending/accepted/rejected/withdrawn),
`Bid.jobId`, `Bid.createdAt` (the window anchor), and the related `Job.category`
(non-null string). No `Report` API tag exists in `@lunaticwithaduck/api`, so the
endpoint tags `API_TAGS.Bid` (mirrors how the jobs-funnel report tags
`API_TAGS.Job`). Convention checker (`node scripts/lint-conventions.cjs`) reports
zero violations in the new files.
