---
title: Module 6 — Compliance / GDPR data requests
created: 2026-06-26
status: done
---

## Goal
EU legal obligation: a queue for GDPR export & erasure requests with SLA tracking,
requester identity verification, export-bundle download, and audited hard-erase.
New "Compliance" nav group.

## Steps
- [x] `admin-compliance-endpoints.ts` — listDataRequests, getDataRequest
- [x] `admin-compliance-mutations.ts` — verifyRequesterIdentity, fulfilExport, confirmErasure
- [x] Register in `store.ts`; `routes.ts` `compliance.dataRequests`; "Compliance" nav group
- [x] `/compliance/data-requests` — queue with SLA countdown (overdue/≤3d/secondary), identity badge, type/status filters
- [x] `DataRequestActions` — verify identity → generate export → download bundle (export); verify → hard-confirm erase w/ retained-records note (erase)
- [x] `sla.utils.ts` (daysUntil, slaTone) + vitest
- [x] Permission-gated via `can(PERMISSIONS.compliance)`; uses the `Privacy` API tag
- [x] Verify: typecheck ✓, sla vitest ✓ (3), biome ✓, lint:conventions ✓

## BACKEND TODO (for the BE agent)
- `GET  /admin/compliance/data-requests?type=&status=&page=&pageSize=` — rows include `identityVerified`, `dueAt` (SLA), `bundleUrl`.
- `GET  /admin/compliance/data-requests/:id`
- `POST /admin/compliance/data-requests/:id/verify { verified, note? }` — records identity check; audit.
- `POST /admin/compliance/data-requests/:id/export` — generates bundle, returns `bundleUrl`; audit.
- `POST /admin/compliance/data-requests/:id/erase { reason }` — hard erase, retains legally-required records; audit.

## Notes
- SLA is computed client-side from `dueAt` (GDPR 30-day deadline); `daysUntil`/`slaTone` are pure + unit-tested.
- Identity verification gates fulfilment in the UI (export/erase only show once verified).
- Playwright e2e for export/erase deferred until BE endpoints exist.

## Outcome
Stacked on the foundation PR. FE complete against the contract; non-functional
until the BE routes land.
