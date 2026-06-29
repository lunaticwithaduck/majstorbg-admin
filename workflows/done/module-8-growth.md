---
title: Module 8 — Growth (campaigns + templates)
created: 2026-06-26
status: done
---

## Goal
Notification/campaign tooling: a campaigns console (segment builder, schedule,
send, delivery stats) and a template manager with live preview. New "Growth" nav group.

## Steps
- [x] `admin-growth-endpoints.ts` — listCampaigns, listTemplates
- [x] `admin-growth-mutations.ts` — createCampaign, sendCampaign, upsertTemplate
- [x] Register in `store.ts`; `routes.ts` `growth.campaigns`/`growth.templates`; "Growth" nav group
- [x] `/growth/campaigns` — list (channel/status filters, segment summary, delivery stats) + CreateCampaignModal (segment builder: role/city/category/activity + channel + template + schedule) + SendCampaignButton
- [x] `/growth/templates` — list (channel filter, transactional badge) + TemplateEditorModal (subject/body/vars + live preview)
- [x] Permission-gated via `can(PERMISSIONS.campaigns)`; uses the `Notification` API tag
- [x] Verify: typecheck ✓, biome ✓, lint:conventions ✓

## BACKEND TODO (for the BE agent)
- `GET  /admin/campaigns?channel=&status=&page=&pageSize=` — rows include `segment`, `stats`, `scheduleAt`, `templateName`.
- `POST /admin/campaigns { name, channel, segment, templateId, scheduleAt? }` — **email via Resend with EU-resident handling (GDPR)**; audit.
- `POST /admin/campaigns/:id/send` — audit.
- `GET  /admin/templates?channel=&page=&pageSize=` — rows include `subject`, `body`, `vars`, `transactional`.
- `PUT  /admin/templates/:id { name, channel, subject, body, vars }` — audit.

## Notes
- Segment-builder category dropdown is populated from the existing job-categories query.
- No `Campaign`/`Template` API tag; reused `Notification` with namespaced ids. TODO(api-tags).
- Transactional template management lives in the same Templates screen (transactional flag/badge).
- Playwright e2e for create/send deferred until BE endpoints exist.

## Outcome
Stacked on the foundation PR. FE complete against the contract; non-functional
until the BE routes land.
