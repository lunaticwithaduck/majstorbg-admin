---
title: Admin wave 1 — sidebar fix, DataTable primitive, User CRUD, Feature flags, Jobs explorer, Swagger embed
created: 2026-05-22
status: in-progress
---

## Goal
Expand admin from "2 read-only screens" to a useful day-to-day dev-stage tool. Land six pieces of work on a single feature branch (`feat/admin-wave-1`) — no main commits until merged, to avoid spamming Railway with deploys.

## Scope

### Foundation (sequential, before subagents)
- [x] Branch off main as `feat/admin-wave-1`
- [ ] Fix admin shell layout: sidebar fixed (no scroll), page content in its own scroll view
- [ ] Extract `<DataTable>` composed primitive from `UserReportTable` so subsequent resource explorers don't reroll the same TanStack-Table + toolbar pattern
- [ ] Pre-seed Sidebar nav entries for Jobs, Feature Flags, API Explorer so each subagent only owns its route content
- [ ] Phase-1 commit + push

### Subagents (parallel, isolated worktrees off the foundation commit)
- [ ] **User CRUD** — extend the existing User Management with create / edit / delete (admin's first write operations)
- [ ] **Feature flag toggle UI** — `/feature-flags` route reading `@lunaticwithaduck/feature-flags` and exposing on/off switches
- [ ] **Jobs explorer** — `/jobs` list + detail using the new `<DataTable>` primitive
- [ ] **Embedded Swagger** — `/api-explorer` iframing the BE Swagger UI

### Wrap-up
- [ ] Merge each subagent branch back into `feat/admin-wave-1`
- [ ] Final typecheck + build + test pass on the merged branch
- [ ] Hand off to user for PR review / merge

## Completion
When all steps above are done:
Run `/complete workflows/tasks/admin-wave-1-expansion.md` before starting any new work.

## Notes
- BE work is OUT OF SCOPE. Subagents use existing endpoints from `@lunaticwithaduck/api` where they exist; stub / TODO where they don't.
- Auth gating stays deferred — `can()` is still a no-op (CLAUDE.md flags this).
- All work strictly conforms to CLAUDE.md R1–R10 (no inline styles, no string literals in JSX, no hand-rolled primitives, all hrefs via `@/config/routes`).
