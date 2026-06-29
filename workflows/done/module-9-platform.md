---
title: Module 9 — Platform (RBAC admins/roles + audit log)
created: 2026-06-26
status: done
---

## Goal
Role management (promote users to admin roles) + the read-only audit-log viewer.
The keystone module: every other module gates on `can(PERMISSIONS.x)`; this ships
the role assignment + the audit trail they feed.

## Steps
- [x] `admin-platform-endpoints.ts` — listAdmins, listAudit (+ AdminRow / AuditEntry types)
- [x] `admin-platform-mutations.ts` — setAdminRole (promote / change role)
- [x] Register in `store.ts`; `routes.ts` `platform.admins`/`platform.audit`; new "Platform" nav group
- [x] `/platform/admins` — admins table (name/email/role/last-active) + per-row RoleSelectCell (change role) + PromoteUserModal (search user → pick role → grant)
- [x] `/platform/audit` — audit log table (when/actor/action/target/reason) + action search
- [x] Permission-gated via `can(PERMISSIONS.admins)`; admins reuse the AdminUser tag, audit reuses Journal
- [x] Verify: typecheck ✓, biome ✓, lint:conventions ✓

## BACKEND TODO (for the BE agent)
- `GET /admin/admins` → staff users with an admin role.
- `PUT /admin/admins/:id/role { role }` — promote/change role; creates the admin record if the user wasn't one; emit admin-audit.
- `GET /admin/audit?actor=&action=&targetType=&from=&to=&page=&pageSize=`.
- **Add `admin` to the BE `UserRole`** (currently `worker | client`) with sub-roles `superadmin|finance|support|moderator|viewer`.
- Expose the **current admin's role** to the client (session claim / `GET /admin/me`) so the FE can graduate `can(permission, role)` and replace the interim `canOperate` gate.

## Notes / not-yet
- The interim `canOperate` gate (foundation) is NOT fully graduated yet: `can(permission, role)` is ready, but there's no client source for the *current* admin's role (auth still deferred — `src/auth/can.ts`). Once the BE exposes the session role, swap the gate to role-based — one wiring change, no UI changes.
- Role-permission matrix lives in `src/auth/permissions.ts` (foundation): superadmin=all (incl. `admins`), so only superadmins see the promote/role controls once RBAC is live.

## Outcome
Stacked on the foundation PR. FE complete against the contract; non-functional
until the BE admin role + routes land.
