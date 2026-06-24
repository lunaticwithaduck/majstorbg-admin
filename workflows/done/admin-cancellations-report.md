---
title: Cancellations & stuck jobs report (BE + FE endpoint + FE screen)
created: 2026-06-22
status: in-progress
---

## Goal
Ship the "Cancellations & stuck jobs" report end-to-end:
- BE module `admin-cancellation-reports` (NestJS) exposing
  `GET /admin/reports/cancellations` (summary) + `GET /admin/cancellations/stuck` (list).
- FE local-stopgap RTK endpoint builder `src/api/admin-cancellation-endpoints.ts`.
- FE screen under `reports/cancellations/` (StatTileRow + donut ReportChart + DataTable).

## Steps
- [x] Read reference impls (admin-disputes BE/FE, admin-reports BE, UserDirectoryReport FE).
- [x] Confirm Prisma Job model fields (status/createdAt/scheduledAt/completedAt/category/cityName/acceptedBidId/bids).
- [x] BE dto/module/controller/service.
- [x] FE endpoint builder.
- [x] FE page.tsx + CancellationsReport screen + styles + constants + format utils.
- [x] Fix page.tsx missing <Suspense> boundary (useReportQuery -> useSearchParams).
- [x] Verify contract consistency BE response <-> FE types.

## Completion
Run `/complete workflows/tasks/admin-cancellations-report.md` before starting any new work.
