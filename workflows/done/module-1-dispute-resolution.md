---
title: Module 1 — Dispute resolution (action layer)
created: 2026-06-26
status: done
---

## Goal
Add the action layer to the existing read-only disputes detail: assign, note,
resolve (with the money outcome), reopen — plus the one-view context (payment
state, evidence, notes) a mediator resolves from.

## Steps
- [x] `admin-disputes-mutations.ts` — assign / addNote / resolve / reopen (+ types), Dispute tag + LIST + SUMMARY invalidation
- [x] Extend `admin-disputes-endpoints.ts` — `assigned`/`reopened` states, `assignedTo*`, `notes`, `chat`, `photos`, `payment`
- [x] Register mutations + hooks in `store.ts`
- [x] `ResolutionPanel` — outcome RadioGroup, capped amount (refund/partial), reason, notify, confirm Modal
- [x] `DisputeActions` — assign-to-me + reopen (reason modal)
- [x] `NotesThread` — internal/shared notes list + composer
- [x] `DisputeEvidence` — chat excerpt + photo links (render-if-present)
- [x] Payment state + assignee + new status pills wired into `DisputeDetail`
- [x] `resolution.utils.ts` + vitest (amount→cents, cap validation)
- [x] Permission-gated via `can(PERMISSIONS.disputes)` (Phase 0 gate)
- [x] Verify: typecheck ✓, vitest ✓ (14), biome ✓, lint:conventions ✓

## BACKEND TODO (for tomorrow's BE agent)
- `PATCH /admin/disputes/:id/assign { adminId? }` — omit adminId = self-assign from session; sets status `assigned`; audit.
- `POST  /admin/disputes/:id/notes { body, internal }` — author from session; returns dispute w/ note; audit.
- `POST  /admin/disputes/:id/resolve { outcome, amountCents?, reason, notifyParties }` — MUST trigger the money action (escrow release / refund, Module 4) + audit with before/after.
- `POST  /admin/disputes/:id/reopen { reason }` — sets status `reopened`; audit.
- `GET   /admin/disputes/:id` — return `assignedToId/Name`, `notes[]`, `chat[]`, `photos[]`, `payment{heldCents,…}`.
- Extend the dispute status enum with `assigned` + `reopened`.

## Deferred
- Playwright e2e for the resolve flow — can't run until the BE endpoints exist.
- Rich photo thumbnails (next/image) — evidence renders as links for now.

## Outcome
Stacked on the foundation PR. FE complete against the contract; non-functional
until the BE routes land (expected). Resolve→money-action is BE-triggered.
