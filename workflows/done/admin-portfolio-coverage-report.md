---
title: Portfolio & content coverage report (BE + FE)
created: 2026-06-22
status: in-progress
---

## Goal
Build the "Portfolio & content coverage" report end-to-end: BE module (summary + list endpoints),
FE local-stopgap endpoint builder, and FE screen (KPI tiles + bar chart + table + CSV).

Report spec: share of workers with >=1 PortfolioProject, avg projects/worker, featured count,
breakdown by PortfolioCategory; list workers with project/photo counts.

## Steps
- [x] Confirm prisma models (PortfolioProject, PortfolioPhoto, PortfolioCategory enum, Worker)
- [x] BE module admin-portfolio-reports (module/controller/service + dto)
- [x] FE endpoint admin-portfolio-endpoints.ts
- [x] FE screen reports/portfolio (page + Report component + styles + constants)
- [x] Verify conventions/types match wave-1 outputs (BE typecheck clean; FE conventions clean; only expected unwired-store-export errors remain for the wiring agent)

## Completion
Run `/complete workflows/tasks/admin-portfolio-coverage-report.md` before starting any new work.
