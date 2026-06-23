---
title: Worker leaderboard report (BE + FE endpoint + FE screen)
created: 2026-06-22
status: in-progress
---

## Goal
Build the "Worker leaderboard" report end-to-end:
- BE module admin-worker-leaderboard-reports (NestJS + local zod DTOs)
- FE endpoint builder admin-worker-leaderboard-endpoints.ts
- FE screen reports/worker-leaderboard (page.tsx + Report component)

Per-worker metrics: completedJobs, avgRating, acceptedBids count, total accepted bid value (native).
Server-side sort, CSV export, drilldown to routes.users.detail(id).

## Steps
- [x] Read references (disputes/reports BE & FE, schema.prisma, worker-money service)
- [x] BE: module/controller/service + dto
- [x] FE: endpoint builder
- [x] FE: screen (page + Report component + styles + constants)
- [x] Verify types match between BE and FE shapes (BE tsc clean; FE tsc clean except wiring-agent hook export; conventions clean)

## Completion
Run `/complete workflows/tasks/worker-leaderboard-report.md` before starting any new work.
