---
title: Ratings & quality report (BE module + FE endpoint + FE screen)
created: 2026-06-22
status: done
---

## Goal
Build the "Ratings & quality" report end-to-end: avg worker rating, star
distribution 1-5, dispute rate (Dispute count / completed jobs), and a list
of lowest-rated workers (avg<3, min N reviews) with drilldown.

BE: new NestJS module `admin-ratings-reports` exporting two read endpoints
(GET /admin/reports/ratings summary; GET /admin/ratings/low list).
FE endpoint: local-stopgap RTK builder `adminRatingsEndpoints`.
FE screen: /reports/ratings with KPI tiles + donut star distribution + table.

## Steps
- [x] BE dto/*.ts (zod via createZodDto): ratings-summary query+response, list-low-rated query+response
- [x] BE admin-ratings-reports.service.ts (avg rating, star distribution, dispute rate, low-rated list)
- [x] BE admin-ratings-reports.controller.ts (@AllowAnonymous + TODO(auth))
- [x] BE admin-ratings-reports.module.ts (AdminRatingsReportsModule)
- [x] FE src/api/admin-ratings-endpoints.ts (builder, two query hooks)
- [x] FE screen: page.tsx + RatingsQualityReport.tsx + .styles.ts + config/constants.ts
- [x] Derive Row types from hooks; keep copy in constants

## Completion
When all steps above are done:
Run `/complete workflows/tasks/admin-ratings-quality-report.md` before starting any new work.
