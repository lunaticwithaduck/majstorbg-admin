---
title: Worker supply & coverage report (BE + FE endpoint + FE screen)
created: 2026-06-22
status: done
completed: 2026-06-22
---

## Goal
Build the "Worker supply & coverage" report end-to-end: by city and by skill/jobCategory,
show active worker count, verified share, acceptingWork share; flag thin coverage vs open-job
demand. BE module + FE stopgap endpoint builder + FE screen.

## Steps
- [x] Read prisma schema (Worker, WorkerSkill, Job) to confirm field names
- [x] Read BE reference modules (admin-disputes, admin-reports, worker-money)
- [x] BE: admin-worker-supply-reports module/controller/service/dto
- [x] FE: src/api/admin-worker-supply-endpoints.ts builder
- [x] FE: reports/worker-supply page.tsx + Report component + styles + constants
- [x] Verify against reference conventions (tsc clean for BE + FE; lint:conventions clean for new files)

## Completion
Run `/complete workflows/tasks/admin-worker-supply-report.md` when done.

## Outcome

Completed on 2026-06-22. Built the "Worker supply & coverage" report end-to-end.

BACKEND (majstorbg-backend) — new module `src/modules/admin-worker-supply-reports/`
exporting `AdminWorkerSupplyReportsModule`:
- `admin-worker-supply-reports.module.ts`, `.controller.ts`, `.service.ts`
- `dto/worker-supply.query.dto.ts`, `dto/worker-supply.response.dto.ts` (local zod via createZodDto)
- Endpoint: `GET /admin/reports/worker-supply?dimension(city|category)&page&pageSize&search&sortBy&sortDir&from&to`,
  `@AllowAnonymous()` + `// TODO(auth): admin role`.

FRONTEND endpoint: `src/api/admin-worker-supply-endpoints.ts` — `adminWorkerSupplyEndpoints(build)`
builder with `getWorkerSupply` query (hook: `useGetWorkerSupplyQuery`).

FRONTEND screen: `src/app/[locale]/(admin)/reports/worker-supply/` — page.tsx wrapper +
WorkerSupplyReport ('use client') + .styles.ts + config/constants.ts. KPI StatTileRow +
bar ReportChart + sortable/searchable DataTable with PeriodSelect + dimension Select + CSV export.

Schema adaptations (key findings):
- Worker has NO `cityName`/`category` columns. City = `Worker.serviceCity` (nullable) with
  fallback to `Worker.serviceArea` (required String). Category supply comes from `WorkerSkill`
  joined to the worker via shared `userId` (Worker.userId == WorkerSkill.userId), bucketed on
  `WorkerSkill.jobCategoryId`.
- `Job.category` is a free-text String that actually stores a `JobCategory.id` (validated by
  JobCategoriesService.validateCategoryId on create), so demand (open Jobs grouped by `category`)
  matches supply (skills grouped by `jobCategoryId`) on the same JobCategory id. Used JobCategory.nameEn
  for labels.
- "Active worker" = every Worker row (no soft-delete/archived flag exists). Workers with null userId
  cannot be matched to skills and are excluded from the category dimension only.
- Supply is a live snapshot (NOT time-filtered); the from/to window narrows only the open-job demand
  side (Job.status='open', anchored on Job.createdAt).

Verified: BE `tsc --noEmit` clean for the new module; FE `tsc --noEmit` clean for all worker-supply
files (validated by temporarily wiring `useGetWorkerSupplyQuery` into store.ts, then reverting so
store.ts is left untouched per the disjoint-files constraint); `lint:conventions` reports zero
violations in the new files.
