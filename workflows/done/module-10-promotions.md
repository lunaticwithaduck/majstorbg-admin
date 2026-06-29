---
title: Module 10 — Growth / promotions (vouchers + referrals)
created: 2026-06-26
status: done
---

## Goal
Promo/voucher/referral management: codes with discounts, caps, validity, status,
plus a redemption report. Joins the existing "Growth" nav group.

## Steps
- [x] `admin-promotions-endpoints.ts` — listPromotions (type/status filters), getPromotionRedemptions
- [x] `admin-promotions-mutations.ts` — createPromotion, updatePromotion, deletePromotion
- [x] Register in `store.ts`; `routes.ts` `growth.promotions`; add "Promotions" to the Growth nav group
- [x] `/growth/promotions` — table (code, type, discount %/€, validity range, usage/cap, status)
- [x] `PromotionFormModal` — create + edit (percent/fixed discount, caps, validity, status)
- [x] `RedemptionsModal` — per-promotion redemption list; `DeletePromotionButton` — confirm delete
- [x] Permission-gated via `can(PERMISSIONS.promotions)`; uses the `Notification` API tag
- [x] Verify: typecheck ✓, biome ✓, lint:conventions ✓

## BACKEND TODO (for the BE agent)
- `GET    /admin/promotions?type=&status=&page=&pageSize=` — rows include `discountType`, `value` (percent or cents), caps, validity, `usageCount`, `status`.
- `GET    /admin/promotions/:id/redemptions`
- `POST   /admin/promotions { code, type, discountType, value, maxRedemptions?, perUserLimit?, validFrom?, validTo? }` — audit.
- `PATCH  /admin/promotions/:id { …fields, status? }` — audit.
- `DELETE /admin/promotions/:id` — audit.

## Notes
- `value` is percent (0–100) for `percent`, integer cents for `fixed`; the form converts euros↔cents.
- No `Promotion` API tag; reused `Notification` with namespaced ids. TODO(api-tags).
- Stacked on Module 8 (growth) so "Promotions" joins the existing Growth nav group.

## Outcome
Stacked on the growth PR (→ foundation). FE complete against the contract;
non-functional until the BE routes land.
