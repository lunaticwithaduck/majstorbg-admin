---
title: Category performance report (BE + FE endpoint + FE screen)
created: 2026-06-22
status: in-progress
---

## Goal
Build the "Category performance" admin report end-to-end. Per Job.category (free
string): jobs posted, completion rate, avg accepted bid (native currency), avg
rating, and worker coverage count. Sortable, with a jobs-by-category bar chart,
a sortable server-side DataTable, and CSV export.

## Steps
- [x] BE module `admin-category-perf-reports` (module/controller/service + dto)
      exposing GET /admin/reports/categories ({ items, total, page, pageSize },
      page/pageSize/search/sortBy/sortDir + from/to on Job.createdAt).
- [x] FE endpoint `src/api/admin-category-perf-endpoints.ts` (local stopgap builder).
- [x] FE screen `reports/categories/` (page.tsx + CategoryPerformanceReport + styles + constants).
- [x] Derive Row types from the hooks; keep all copy in config/constants.ts.

## Completion
When all steps above are done:
Run `/complete workflows/tasks/admin-category-performance-report.md` before starting any new work.
