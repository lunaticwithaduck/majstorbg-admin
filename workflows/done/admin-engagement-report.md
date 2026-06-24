---
title: Engagement & presence report (BE + FE endpoint + FE screen)
created: 2026-06-22
status: in-progress
---

## Goal
Build the "Engagement & presence" report end-to-end: active users by lastActiveAt windows (24h/7d/30d), unread-notification rate (Notification.unread snapshot), messages sent in period (Message.sentAt). KPI tiles + line of active-users-by-day + table.

## Steps
- [x] BE module admin-engagement-reports (module/controller/service/dto) GET /admin/reports/engagement
- [x] FE endpoint admin-engagement-endpoints.ts builder
- [x] FE screen reports/engagement (page.tsx + EngagementReport + .styles.ts + config/constants.ts)
- [x] Confirm prisma field names (User.lastActiveAt, Notification.unread/sentAt, Message.sentAt/readAt/type, Bid.job.title)

## Notes
- BE typecheck exit 0; FE conventions clean; FE typecheck clean except the expected
  TS2305 for useGetEngagementReportQuery (store.ts re-export owned by the wiring agent).
- Schema adaptations: MessageType enum is `text | system_milestone` (not the assumed
  text/system/image/file). Message has no jobId; resolved job via Bid -> Job relation.
  Message DOES carry readAt, so the list row exposes a `read` boolean (current state only,
  no latency). Notification has no readAt — unread rate is a pure snapshot.

## Completion
When all steps above are done:
Run `/complete workflows/tasks/admin-engagement-report.md` before starting any new work.
