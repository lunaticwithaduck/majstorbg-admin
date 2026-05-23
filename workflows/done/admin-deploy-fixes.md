---
title: Admin deploy fixes — 0.0.0.0 redirect, root-locale 404, inner-page width, drop notifications
created: 2026-05-23
completed: 2026-05-23
status: done
---

## Goal
Fix three issues reported against the deployed admin app and remove the broken
notifications surface until the BE lands:

1. Editing a user redirects to `http://0.0.0.0/...`, which 404s in the browser.
2. Hitting the deployed admin without a locale prefix (`/`) 404s instead of
   redirecting to `/en` or `/bg`.
3. Inner panel pages (user detail/edit/create, job detail) render at ~50% of the
   available column width because each panel's root is hardcoded `max-w-3xl`.
4. `/notifications` cannot work — the BE has no `admin-notifications` module
   (only `/me/notifications`), so the FE call to `GET /admin/notifications`
   404s. Per user request, remove the route, sidebar entry, FE endpoints,
   store wiring, and the now-stale `notifications-inspector` task. BE work to
   land later.

## Steps
- [x] Confirm root cause of #1/#2: `next-intl` middleware emits absolute
      `Location: http://0.0.0.0/...` because `request.url` carries the
      container's internal listen host behind the reverse proxy. The existing
      port-strip in `src/middleware.ts` doesn't help when host is `0.0.0.0`.
- [x] Confirm root cause of #3: `max-w-3xl` (768px) on `UserCreatePanel`,
      `UserDetailPanel`, `UserEditPanel`, `JobDetailPanel` root styles.
- [x] Confirm BE has no `admin-notifications` module.
- [x] Middleware: rewrite the Location header's host/proto from
      `x-forwarded-host` / `x-forwarded-proto` (fall back to `host`), keeping
      the URL absolute. A relative-path Location was attempted first and
      broke the Next.js edge-runtime adapter (`new NextURL` threw
      `TypeError: Invalid URL`), so absolute-with-corrected-host it is.
- [x] Drop `max-w-3xl` from the four panel root styles.
- [x] Remove the `/notifications` route directory, sidebar entry,
      `routes.notifications`, FE endpoints file, and store wiring.
- [x] `pnpm typecheck` clean, `pnpm test --run` 5/5 pass,
      `pnpm lint:conventions` clean. (`pnpm lint` fails on pre-existing
      stale `biome.json` files inside `.claude/worktrees/` — not from this
      task; out of scope.)

## Outcome

Completed on 2026-05-23. Middleware now rewrites `Location` host/proto from
forwarded headers, verified locally with simulated `x-forwarded-host:
admin.staging.example.com` + `x-forwarded-proto: https` → redirect lands on
the public origin. Notifications route, sidebar entry, FE endpoints file, and
store wiring removed; `/en/notifications` now 404s. The four panel root
styles (UserCreate/Detail/Edit + JobDetail) dropped `max-w-3xl`. Stale
`notifications-inspector` task deleted. The notifications BE work
(`admin-notifications` module) is still owed on the backend — file a separate
task if/when that comes back into scope.
