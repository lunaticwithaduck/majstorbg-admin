---
title: Module 5 — Review moderation (hide/remove + ring signals)
created: 2026-06-26
status: done
---

## Goal
Make the reviews actionable: hide/remove with reason, and a "ring signals" view
that surfaces suspected review rings on a worker.

## Steps
- [x] `admin-reviews-endpoints.ts` — listReviews (status/worker/search filters)
- [x] `admin-reviews-mutations.ts` — hideReview, removeReview, flagRing (returns ring graph)
- [x] Register in `store.ts`; `routes.ts` `trust.reviews`; add "Reviews" to the Trust & Safety nav group
- [x] `/trust/reviews` — reviews queue (worker, reviewer, ★ rating, body, status pills) + status/search filters
- [x] `ReviewActions` — hide (visible only) / remove, with required-reason modals
- [x] `RingCheckPanel` — worker-ID input → flagRing → risk-scored signal clusters (mutual/burst/reciprocal/velocity)
- [x] Hide/remove invalidate the ratings report tags (RATINGS_SUMMARY / LOW_RATED_LIST) so the rating recomputes
- [x] Permission-gated via `can(PERMISSIONS.reviews)`
- [x] Verify: typecheck ✓, biome ✓, lint:conventions ✓

## BACKEND TODO (for the BE agent)
- `GET    /admin/reviews?status=&workerId=&search=&page=&pageSize=`
- `POST   /admin/reviews/:id/hide { reason }` — recompute worker rating; audit.
- `DELETE /admin/reviews/:id { reason }` — recompute worker rating; audit.
- `POST   /admin/reviews/ring-check { workerId }` → `{ workerId, clusters[] }` (suspected ring clusters).

## Notes
- Stacked on Module 3's branch so "Reviews" joins the existing Trust & Safety nav group (no nav conflict).
- No `Review` API tag; reused `Worker` with namespaced ids (`review-*`, `REVIEW_LIST`). TODO(api-tags).
- Playwright e2e for hide/remove deferred until BE endpoints exist.

## Outcome
Stacked on the moderation PR (→ foundation). FE complete against the contract;
non-functional until the BE routes land.
