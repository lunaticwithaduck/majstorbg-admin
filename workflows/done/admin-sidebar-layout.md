---
title: Admin sidebar layout shell
created: 2026-05-06
status: done
completed: 2026-05-06
---

## Goal

Build the chrome admin pages will live inside: a fixed-width left sidebar with brand, nav items, and a placeholder user chip, plus a main content area that hosts route children. Wraps everything inside a `(admin)` route group so `/login` stays full-bleed.

## Design choices (locked in)

- **Route group**: `src/app/[locale]/(admin)/layout.tsx` renders `<AdminShell>{children}</AdminShell>`. `/login` lives outside the group, no sidebar.
- **Shell location**: `src/app/[locale]/_components/admin-shell/` (mirrors web's `_components/<role>-desktop-shell/` convention).
- **Sidebar**: fixed 260px, no collapse for v1. Active route highlighted via `usePathname()`.
- **Nav items**: Dashboard, Users, Jobs, Disputes, Settings — each routes to a placeholder `(admin)/<slug>/page.tsx` so the active-state highlight works.
- **Routes config**: new `src/config/routes.ts` (per R7).
- **Translation gap**: the consumer `@lunaticwithaduck/i18n` catalogue has no `Dashboard|Users|Jobs|Disputes|Settings` keys. Labels pass through `<Text>` children with a TODO to migrate to `value=` once admin nav keys land in the shared catalogue.
- **`/` redirect**: `[locale]/page.tsx` now redirects to `/dashboard` instead of `/login` (auth deferred — admin routes are open).

## Steps

- [x] `src/config/routes.ts` with `routes.admin.{dashboard, users, jobs, disputes, settings}` + `routes.login`
- [x] `src/app/[locale]/_components/admin-shell/AdminShell.tsx` + `AdminShell.styles.ts`
- [x] `src/app/[locale]/_components/admin-shell/config/constants.ts` — NAV_ITEMS array
- [x] `src/app/[locale]/_components/admin-shell/components/Sidebar/Sidebar.tsx` + `.styles.ts` (client, `usePathname`)
- [x] `src/app/[locale]/(admin)/layout.tsx` wrapping AdminShell
- [x] Five placeholder pages: `(admin)/{dashboard,users,jobs,disputes,settings}/page.tsx`
- [x] Update `src/app/[locale]/page.tsx` redirect target from `/login` → `/dashboard`
- [x] Smoke test: render AdminShell, assert all 5 nav items present + active highlight on Dashboard route
- [x] Update Playwright spec to verify `/en/dashboard` shows the sidebar
- [x] `pnpm typecheck`, `pnpm test`, `pnpm lint:conventions`, `pnpm lint` clean
- [x] Boot dev server, hit `/en/dashboard` and `/en/users`, verify sidebar renders + active state highlights correctly

## Open follow-ups (do NOT do here)
- Add `admin.nav.{dashboard,users,jobs,disputes,settings}` keys to the consumer monorepo's `@lunaticwithaduck/i18n` catalogue, then swap admin's nav labels from children to `value=`.
- Real content for the five placeholder pages (data tables, audit logs, etc.).
- User chip wiring in the sidebar footer once auth lands.
- Collapsible sidebar (icon-only mode) — only if admin grows enough to warrant it.

## Completion

When all steps above are done:
Run `/complete workflows/tasks/admin-sidebar-layout.md` before starting any new work.

## Outcome

Completed on 2026-05-06. All acceptance criteria checked; typecheck / vitest / lint:conventions / biome / Playwright e2e (where applicable) all green.
