---
title: Match speed report (time-to-first-bid / time-to-award) end-to-end
created: 2026-06-22
status: in-progress
---

## Goal
Build the "Match speed" report end-to-end: BE module (NestJS) + FE stopgap endpoint
builder + FE screen. Surfaces time-to-first-bid (min Bid.createdAt - Job.createdAt)
and time-to-award (accepted Bid.acceptedAt - Job.createdAt), median/avg/p90, by
category and by week. Percentiles computed in memory from findMany.

## Steps
- [ ] BE: dto/match-speed.query.dto.ts (page,pageSize,search?,sortBy?,sortDir?,from?,to? anchored on Job.createdAt)
- [ ] BE: dto/match-speed.response.dto.ts (kpis, weekly series, paginated category items)
- [ ] BE: admin-match-speed-reports.service.ts (findMany jobs+bids, percentiles in memory, week bucket, category groups)
- [ ] BE: admin-match-speed-reports.controller.ts (GET /admin/reports/match-speed, @AllowAnonymous)
- [ ] BE: admin-match-speed-reports.module.ts (AdminMatchSpeedReportsModule)
- [ ] FE: src/api/admin-match-speed-endpoints.ts (local-stopgap builder)
- [ ] FE: reports/match-speed/page.tsx thin server wrapper
- [ ] FE: components/MatchSpeedReport/MatchSpeedReport.tsx ('use client') + .styles.ts + config/constants.ts

## Completion
When all steps above are done:
Run `/complete workflows/tasks/match-speed-report.md` before starting any new work.
