---
title: Jobs explorer (/jobs list + /jobs/[jobId] detail) with stub admin endpoints
created: 2026-05-22
status: in-progress
---

## Goal
Add a jobs explorer to the admin shell: a paginated list at `/jobs` with status filter and search, plus a per-job detail page at `/jobs/[jobId]` showing core fields, a (stub) bids list, and escrow state. The BE side (`adminJobsEndpoints`) does not exist yet — we stub the RTK Query layer locally so the UI compiles today and we can swap to the real `@lunaticwithaduck/api` export once it lands.

## Steps
- [x] Read existing `UserReportTable` / `UserDetailPanel` patterns to mirror conventions
- [x] Stub `src/api/admin-job-endpoints.ts` (Build-based, mirrors `adminUserEndpoints` shape)
- [x] Wire stub into `src/api/store.ts` alongside `adminUserEndpoints(build)`
- [x] Build `JobsExplorer` composed table (filters slot: status `<Select>`, view-button column)
- [x] Build `JobDetailPanel` with field grid, Bids section (stub), Escrow section (stub)
- [x] `pnpm typecheck` clean
- [x] `pnpm lint:conventions` clean

## Completion
When all steps above are done:
Run `/complete workflows/tasks/jobs-explorer.md` before starting any new work.

## Notes
- `@lunaticwithaduck/api` exports `jobEndpoints` for consumers but no `adminJobsEndpoints`. Stub targets `GET /admin/jobs` + `GET /admin/jobs/:id`; hand off shape to BE once they pick it up.
- Bids list on detail page is a stub array (`bids: []`) per task brief — kept minimal until BE ships.
- Uses the `Job` API tag from `@lunaticwithaduck/api` (there is no `AdminJob` tag).
