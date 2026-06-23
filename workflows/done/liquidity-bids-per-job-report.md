---
title: Liquidity (bids per job) report — BE + FE end-to-end
created: 2026-06-22
status: done
completed: 2026-06-22
---

## Goal
Ship the "Liquidity (bids per job)" admin report end-to-end. Per category (and
optionally city): average bids/job, % of jobs with >=1 bid, % with >=3 bids,
and average bid amount (native currency). Date range anchored on Job.createdAt.

## Steps
- [x] BE: new module `admin-liquidity-reports` (module/controller/service + dto)
      exposing `GET /admin/reports/liquidity` ({ items,total,page,pageSize } +
      summary KPIs). @AllowAnonymous() + TODO(auth) on every handler.
- [x] FE endpoint: `src/api/admin-liquidity-endpoints.ts` local-stopgap builder
      returning the same shapes (header TODO: replace with @lunaticwithaduck/api).
- [x] FE screen: `reports/liquidity/page.tsx` (thin server wrapper) +
      `components/LiquidityReport/LiquidityReport.tsx` ('use client') + styles +
      config/constants.ts. KPI tiles + bar chart (avg-bids-by-category) +
      aggregated DataTable (PeriodSelect filters, server-side sort, CSV export).

## Completion
When all steps above are done:
Run `/complete workflows/tasks/liquidity-bids-per-job-report.md` before starting any new work.

## Outcome

Completed on 2026-06-22. Built the Liquidity (bids per job) report end-to-end.

BACKEND (majstorbg-backend) — new `admin-liquidity-reports` module:
- `admin-liquidity-reports.module.ts` (class `AdminLiquidityReportsModule`),
  `.controller.ts`, `.service.ts`, `dto/list-liquidity.query.dto.ts`,
  `dto/list-liquidity.response.dto.ts` (local zod via `createZodDto`).
- `GET /admin/reports/liquidity` with `@AllowAnonymous()` + `// TODO(auth): admin role`.
  Accepts page,pageSize,groupBy(category|city),search,sortBy,sortDir,from,to
  (date window on `Job.createdAt`, half-open [from,to)).
- Single `job.findMany` over the window pulling each job's bids
  (amount,currency); aggregated in memory per (category) or (category,city)
  group because the metrics (avg bids/job, % with >=1, % with >=3, mean bid
  amount) can't be a single Prisma groupBy. Sort + pagination in memory (the
  aggregated row set is tiny). Returns { items,total,page,pageSize } + a
  window-wide `summary` (counts/ratios only — never sums money) + a top-12
  `byCategory` series for the bar chart.

FRONTEND endpoint: `src/api/admin-liquidity-endpoints.ts` — `adminLiquidityEndpoints`
builder, `getLiquidity` query → hook `useGetLiquidityQuery`, tagged
`{ type: API_TAGS.Job, id: 'LIQUIDITY' }`.

FRONTEND screen: `src/app/[locale]/(admin)/reports/liquidity/` — `page.tsx`
(thin server wrapper, Suspense), `components/LiquidityReport/LiquidityReport.tsx`
('use client'), `.styles.ts`, `config/constants.ts`. StatTileRow of 5 KPIs +
ReportChart (bar, avg-bids-by-category) + DataTable with ReportFilters
(PeriodSelect + group-by Select), server-side SortHeader columns, URL-synced
state, and client-side CSV export. Passes `pnpm lint:conventions` with zero
violations in the new files.

Schema adaptations: spec named "Job (category, cityName, createdAt)" and
"Bid (amount, jobId)" — all confirmed present on the real Prisma models, no
adaptation needed. `Job.cityName` is nullable, so city grouping collapses
null/empty cities into a "No city" label on the FE. Currency is unnormalized
on `Bid`, so avg bid amount is reported in each group's dominant currency with
a `mixedCurrency` flag; money is never summed across rows/groups.
