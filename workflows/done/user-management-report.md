---
title: User Management module · User Report (BE + schemas + api + admin)
created: 2026-05-06
status: done
completed: 2026-05-06
---

## Goal

Add an admin "User Management" module containing a User Report page that lists all registered users (worker + client), with a "View details" row action that opens a per-user detail page. Wired to a real BE endpoint via the shared `@lunaticwithaduck/api` package. Sidebar restructures to show modules; all placeholder modules/pages get dropped (per user direction 2026-05-06).

## Cross-repo plan

1. **majstorbg-backend**: new `admin-users` module (`src/modules/admin-users/`) with `GET /admin/users` (paginated) + `GET /admin/users/:id` (detail). Open endpoint with `TODO(auth): require admin role` until BE adds an admin role.
2. **majstorbg/packages/schemas**: add `adminUserListItemSchema`, `adminUserDetailSchema`, `paginatedAdminUsersSchema`.
3. **majstorbg/packages/api**: add `endpoints/adminUsers.ts` with `listAdminUsers`, `getAdminUser` queries; export; add `AdminUser` tag.
4. **Local iteration via yalc**: build + push schemas + api into admin (no version bump until stable).
5. **majstorbg-admin**: wire Redux/RTK Query, restructure sidebar to module groups, drop placeholder pages, build the report + detail pages.

## Steps

- [x] **Phase A — BE**: `src/modules/admin-users/` (controller + service + module + DTOs), register in `app.module.ts`, smoke test `GET /admin/users` and `GET /admin/users/:id` via curl
- [x] **Phase B — schemas**: zod schemas + types, `pnpm build`, `yalc push`
- [x] **Phase C — api**: endpoint file, export, tag, `pnpm build`, `yalc push`
- [x] **Phase D — admin**:
  - [x] `yalc add @lunaticwithaduck/{schemas,api}` (pure)
  - [x] `src/config/env.ts` with `NEXT_PUBLIC_API_URL`
  - [x] `src/api/axios.ts` (no 401 retry — auth deferred)
  - [x] `src/api/store.ts` injecting only `adminUserEndpoints`
  - [x] `src/api/provider.tsx` (Redux Provider, no PersistGate)
  - [x] Wire `<StoreProvider>` into `[locale]/layout.tsx`
  - [x] Restructure sidebar: `NAV_MODULES` (groups + nested links)
  - [x] Drop placeholder pages: `(admin)/{dashboard,jobs,disputes,settings}/page.tsx` + `users/page.tsx`
  - [x] Update `src/config/routes.ts` (drop placeholders, add `users.report` + `users.detail`)
  - [x] Update `[locale]/page.tsx` redirect target to `/users/report`
  - [x] `(admin)/users/report/page.tsx` — server page that hosts the client `UserReportTable`
  - [x] `_components/admin-shell/components/UserReportTable/UserReportTable.tsx` — client, uses `@tanstack/react-table` + `useListAdminUsersQuery`
  - [x] `(admin)/users/[userId]/page.tsx` — detail view (server, uses RTK Query via a client component)
  - [x] Smoke test: `UserReportTable` renders with mocked data
- [x] **Phase E — end-to-end**: boot BE + admin, navigate `/en/users/report`, click View → `/en/users/[id]`, verify both render real data
- [x] `pnpm typecheck` / `pnpm test` / `pnpm lint:conventions` / `pnpm lint` clean in admin
- [x] BE `pnpm typecheck` clean
- [x] schemas + api `pnpm build` clean

## Discoveries during work

- **Two-copy schemas issue**: yalc rewrites `workspace:*` → `*` when publishing, so the api package (consumed via yalc by admin) still tries to resolve schemas via the `*` semver against GitHub Packages — landing on the OLD registry version that doesn't have the new admin schemas. Result: two physical copies of `@lunaticwithaduck/schemas` in `node_modules/.pnpm/`. Fixed via `pnpm.overrides` in admin's `package.json`, which routes every transitive schemas reference back to the yalc copy. Override goes away when we bump + republish for real.
- **TS bracketed-path resolution edge case**: `import type { AdminUserListItem } from '@lunaticwithaduck/schemas'` worked from `src/_test_import.ts` but failed from `src/app/[locale]/_components/.../UserReportTable.tsx` with "no exported member" — a TS resolution quirk specific to bracketed Next route paths consuming a single new type from a large bundled `.d.ts`. Worked around by deriving `AdminUserListItem` from the RTK Query response type instead of importing it.
- **Admin port bumped to 3001** to avoid collision with BE on 3000.
- **CORS in dev is `origin: true`** in BE's `main.ts`, so admin's localhost:3001 just works without CORS_ORIGINS edits.

## Open follow-ups (do NOT do here)
- Add `admin.users.*` translation keys to the consumer i18n catalogue (table headers, action labels) and migrate `<Text>{...}</Text>` → `<Text value=…>`.
- Republish schemas + api with version bumps once stable; remove `pnpm.overrides` and bump admin's package.json.
- Add admin role gate on BE endpoint once BE adds `admin` to `UserRole`. Currently `@AllowAnonymous()` with TODO comment.
- Real CORS_ORIGINS for staging/prod (admin origin must be added).
- Detail page: actions (suspend, reset onboarding, etc.).
- Pagination URL params so refresh preserves the page.

## Completion

When all steps above are done:
Run `/complete workflows/tasks/user-management-report.md` before starting any new work.

## Outcome

Completed on 2026-05-06. All acceptance criteria checked; typecheck / vitest / lint:conventions / biome / Playwright e2e (where applicable) all green.
