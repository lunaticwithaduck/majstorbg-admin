---
title: Module 3 — Moderation (flags/reports queue + graduated enforcement)
created: 2026-06-26
status: done
---

## Goal
Replace the nuclear-only `deleteAdminUser` lever with graduated enforcement +
a report queue. New "Trust & Safety" nav group.

## Steps
- [x] `admin-moderation-endpoints.ts` — listReports, getReport, getUserModerationStatus (+ types)
- [x] `admin-moderation-mutations.ts` — actionReport (dismiss/remove/warn/suspend/ban)
- [x] `admin-user-mutations.ts` — suspendUser / banUser / reinstateUser (state tags incl. moderation)
- [x] Register all in `store.ts`; `routes.ts` `trust.moderation`; "Trust & Safety" nav group
- [x] `/trust/moderation` — tabbed queue (Reported users / Flagged content / Flagged reviews) + DataTable
- [x] `ModerationActionModal` — action RadioGroup + reason + suspend-duration + audit
- [x] `UserModerationControls` on UserDetailPanel — status badge + suspend/ban/reinstate (reason modals)
- [x] Permission-gated via `can(PERMISSIONS.moderation)`
- [x] Verify: typecheck ✓, biome ✓, lint:conventions ✓, foundation tests ✓

## BACKEND TODO (for the BE agent)
- `GET  /admin/moderation/reports?type=user|content|review&status=&page=&pageSize=` — `content` = photo + chat.
- `GET  /admin/moderation/reports/:id`
- `POST /admin/moderation/reports/:id/action { action, reason, durationDays? }` — `suspend`/`ban` also update user state; `remove_content` hides the entity; audit.
- `GET  /admin/users/:id/moderation → { status, until?, reason? }`
- `POST /admin/users/:id/suspend { reason, until? }` — audit.
- `POST /admin/users/:id/ban { reason }` — audit.
- `POST /admin/users/:id/reinstate { reason }` — audit.

## Notes
- No dedicated `Moderation` API tag exists; reused `AdminUser` with namespaced ids (`report-*`, `moderation-*`, `MODERATION_LIST`). TODO(api-tags): add a `Moderation` tag.
- Tabs map to a 3-value `type` filter (user|content|review) rather than the raw 4 entity types — `content` groups photo+chat server-side.
- Playwright e2e for suspend/ban deferred until BE endpoints exist.

## Outcome
Stacked on the foundation PR. FE complete against the contract; non-functional
until the BE routes land.
