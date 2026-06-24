---
title: Cancellations & stuck jobs report (end-to-end)
created: 2026-06-22
status: in-progress
---

## Goal
Ship the "Cancellations & stuck jobs" admin report end-to-end:
- BE NestJS module `admin-cancellation-reports` (summary + paginated stuck list).
- FE local-stopgap RTK endpoints builder.
- FE screen (KPIs + chart + DataTable with PeriodSelect filters, server-side
  sort, CSV export, drilldown to the job detail).

## Endpoints
- GET /admin/reports/cancellations — cancellation summary (rate + counts by prior stage).
- GET /admin/cancellations/stuck — paginated stuck-jobs list.

## Steps
- [x] Read BE/FE reference modules + prisma Job model.
- [x] BE dto (local zod via createZodDto): query + response for summary & stuck list.
- [x] BE service: cancellation rate + counts-by-prior-stage; stuck list keyset/skip pagination + sort + CSV-ready fields.
- [x] BE controller + module (@AllowAnonymous + TODO(auth) on every handler).
- [x] FE endpoint builder src/api/admin-cancellation-endpoints.ts (no store edits).
- [x] FE screen: page.tsx wrapper + CancellationsReport (use client) + .styles.ts + config/constants.ts + utils.

## Notes / adaptations
- No status-transition history table exists -> "prior stage" of a cancelled job is
  DERIVED from milestones it reached (acceptedBidId / bids / neither), not from a
  real transition log. Documented in the service.
- "stuck" = jobs in `open` older than N days OR any job in `awaiting_confirmation`.

## Completion
Run `/complete workflows/tasks/cancellations-stuck-jobs-report.md` before starting new work.
