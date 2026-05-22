---
title: Notifications inspector (/notifications log + test sender) with stub admin endpoints
created: 2026-05-22
status: in-progress
---

## Goal
Add a notifications inspector to the admin shell: a paginated list at `/notifications` (filterable by `userId`) with columns user / kind / payload preview / createdAt / read, plus a "Send test notification" modal that POSTs to the BE. There is no `/admin/notifications` controller on the BE yet — stub the RTK Query layer locally (mirroring the `admin-job-endpoints` pattern) so the UI compiles today and we can swap to `@lunaticwithaduck/api` once it lands.

## Steps
- [x] Read existing `JobsExplorer` / `UserReportTable` patterns to mirror conventions
- [x] Stub `src/api/admin-notification-endpoints.ts` (Build-based, list + send-test mutation)
- [x] Wire stub into `src/api/store.ts` alongside the other endpoint bundles
- [x] Build `NotificationsExplorer` composed table (filters slot: `userId` input, "Send test" action)
- [x] Build `SendTestNotificationModal` (target userId, NotificationKind select, optional payload JSON)
- [x] Add `e2e/notifications.spec.ts` smoke spec
- [x] `pnpm typecheck` clean
- [x] `pnpm lint:conventions` clean
- [x] `pnpm e2e --project=chromium --workers=1 -- e2e/notifications.spec.ts` clean

## Completion
When all steps above are done:
Run `/complete workflows/tasks/notifications-inspector.md` before starting any new work.

## Notes
- BE supports the Prisma enum `bid | accepted | message | arriving | review | escrow_released | milestone_alert | system_info` — match it verbatim in the admin types (consumer `notificationEndpoints` uses kebab-case for some kinds — we follow the BE Prisma enum here since it's admin-facing).
- Stub targets `GET /admin/notifications?userId&page&pageSize` (paginated list) and `POST /admin/notifications/test` (mutation).
- Uses the `Notification` API tag from `@lunaticwithaduck/api`.
- Payload is freeform `Record<string, unknown>` per kind — preview as JSON-truncated text in the table.
