---
title: Module 4 — Finance console (transactions / payouts / commission)
created: 2026-06-26
status: done
---

## Goal
Build the financial console: a transactions ledger with refund + escrow release,
a payouts approval queue, and commission/take-rate config. New "Finance" nav group.

## Steps
- [x] `admin-finance-endpoints.ts` — listTransactions, getTransaction, listPayouts, getCommission (+ types)
- [x] `admin-finance-mutations.ts` — refund, releaseEscrow, approvePayout, rejectPayout, setCommission
- [x] Register in `store.ts`; `routes.ts` `finance.*`; "Finance" nav group (Transactions/Payouts/Commission)
- [x] `/finance/transactions` — ledger (type/status Select filters, status pills, formatEur, flagged badge) + per-row RefundModal (capped) + ReleaseEscrowModal (job-completion gated)
- [x] `/finance/payouts` — approval queue (status filter) + PayoutActions (approve / reject-with-reason)
- [x] `/finance/settings` — CommissionSettings (global take-rate + per-category overrides)
- [x] `src/lib/money.utils.ts` (`amountToCents`, `isAmountWithinCap`) + vitest
- [x] Permission-gated via `can(PERMISSIONS.finance)`; refunds invalidate Dispute KPIs (reconcile w/ Module 1)
- [x] Verify: typecheck ✓, money utils vitest ✓ (4), biome ✓, lint:conventions ✓

## BACKEND TODO (for the BE agent)
- `GET  /admin/finance/transactions?type=&status=&userId=&jobId=&page=&pageSize=` — rows include `refundableCents`, `jobCompleted`, `flagged`.
- `GET  /admin/finance/transactions/:id`
- `POST /admin/finance/transactions/:id/refund { amountCents, reason }` — capped at refundable; audit.
- `POST /admin/finance/jobs/:jobId/release { reason }` — releases held escrow to worker; audit.
- `GET  /admin/finance/payouts?status=&page=&pageSize=`
- `POST /admin/finance/payouts/:id/approve` · `POST /admin/finance/payouts/:id/reject { reason }` — audit.
- `GET  /admin/finance/commission` · `PUT /admin/finance/commission { takeRatePct, perCategory? }` — audit.

## Notes
- No `Finance` API tag; reused `Escrow` with namespaced ids (`txn-*`, `payout-*`, `TXN_LIST`, `PAYOUT_LIST`, `COMMISSION`). TODO(api-tags).
- Refund/release also invalidate the Dispute LIST/SUMMARY tags — closing the financial side of a dispute outcome (Module 1).
- Playwright e2e for refund/release/approve deferred until BE endpoints exist.

## Outcome
Stacked on the foundation PR. FE complete against the contract; non-functional
until the BE routes land.
