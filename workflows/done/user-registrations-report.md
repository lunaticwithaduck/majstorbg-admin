---
title: User registrations report (end-to-end)
created: 2026-06-22
status: in-progress
---

## Goal
Build the "User registrations" report end-to-end: new users by day/week/month,
split by role, plus onboarding-completion rate and verified-worker share.

BE: new module `admin-registrations-reports` exposing
`GET /admin/reports/registrations`. FE: local-stopgap RTK endpoint builder +
report screen (KPI tiles + line chart + per-period table) under
`(admin)/reports/registrations`.

Data: `User.createdAt`, `User.role`, `User.onboardingCompletedAt`,
`Worker.verified`. In-memory period bucketing (day/week/month).

## Steps
- [x] Read reference wave-1 outputs (disputes/reports BE + users FE) + prisma schema
- [x] BE dto/registrations-report.query.dto.ts (local zod, createZodDto)
- [x] BE dto/registrations-report.response.dto.ts (KPIs + series + per-period rows)
- [x] BE admin-registrations-reports.service.ts (in-memory bucketing, role split, rates)
- [x] BE admin-registrations-reports.controller.ts (@AllowAnonymous + TODO(auth))
- [x] BE admin-registrations-reports.module.ts (export AdminRegistrationsReportsModule)
- [x] FE src/api/admin-registrations-endpoints.ts (build-typed stopgap)
- [x] FE screen page.tsx (thin server wrapper) + RegistrationsReport body + styles + constants

## Completion
When all steps above are done:
Run `/complete workflows/tasks/user-registrations-report.md` before starting any new work.
