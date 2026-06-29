---
title: Operational layer — Phase 0 foundation (audit / RBAC gate / formatEur)
created: 2026-06-26
status: done
---

## Goal
Foundation for the 10-module operational/trust/money build (kure2 spec). Every
module 1–10 mutation must be permission-gated and audited, and money must render
via a shared `formatEur`. Build those shared primitives FIRST so the modules
stack on a stable base. No nav/route changes here (those land per module, with
their pages, to avoid 404 nav entries).

## Decisions
- **Audit = backend-emitted.** A client-side `appendAudit` is forgeable and can't
  know authoritative before/after. Instead: every mutation payload carries
  `reason`; the BE writes the audit row from the authenticated session; the FE
  owns the read-only audit *view* (Module 9) + invalidates the audit tag.
  → BACKEND TODO surfaced per consuming module.
- **`canOperate` is admin-local**, env-gated (open in dev / closed in
  staging+prod), not a cross-repo `@lunaticwithaduck/feature-flags` addition.
  Graduates to `can(permission, role)` when the BE ships the `admin` role.

## Steps
- [x] `src/lib/format.utils.ts` — `formatEur` (cents → "€1 234,56"), `formatDate`, `formatDateTime`
- [x] `src/auth/permissions.ts` — AdminRole, Permission, ROLE_PERMISSIONS map, `roleCan`
- [x] `src/auth/can.ts` — `canOperate` gate + `can(permission, role?)`
- [x] Update `src/auth/can.test.ts`; add `src/lib/format.utils.test.ts`
- [x] `.env.example` — document `NEXT_PUBLIC_ADMIN_CAN_OPERATE`
- [x] Verify: typecheck ✓, vitest ✓ (10 pass), biome ✓, lint:conventions ✓

## Outcome
Shipped as the foundation PR. Pure primitives, no UI — fully machine-verified
(typecheck exit 0, 10 unit tests, Biome + conventions clean). Modules 1–10 now
consume `formatEur`/`formatDate`, gate actions via `can(PERMISSIONS.x)`, and
pass `reason` in mutation payloads for BE-side audit.

Next: Module 1 (Dispute resolution) — the action layer on the existing
read-only disputes detail.
