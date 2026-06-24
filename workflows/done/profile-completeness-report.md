---
title: Profile completeness report (BE + FE end-to-end)
created: 2026-06-22
status: in-progress
---

## Goal
Build the "Profile completeness" report end-to-end: share of workers missing
bio, avatar, skills (WorkerSkill count 0), serviceArea, bank account, verified
phone. Summary KPIs + chart + list of incomplete workers (which fields missing)
with CSV export and drilldown.

## Steps
- [x] BE module admin-profile-completeness-reports (module/controller/service + dto)
- [x] BE GET /admin/reports/profile-completeness (summary)
- [x] BE GET /admin/profile-completeness (list)
- [x] FE endpoint builder admin-profile-completeness-endpoints.ts
- [x] FE screen page.tsx + ProfileCompletenessReport component + styles + constants

## Completion
When all steps above are done:
Run `/complete workflows/tasks/profile-completeness-report.md` before starting any new work.
