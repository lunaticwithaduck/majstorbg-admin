---
title: Module 7 — Invoices / ДДС (VAT)
created: 2026-06-26
status: done
---

## Goal
Turn the read-only invoices report into an actionable finance/invoices console:
issue invoices, raise credit notes, and configure BG ДДС (VAT).

## Steps
- [x] Extend `admin-invoices-endpoints.ts` — InvoiceRow `vatAmount`/`pdfUrl`, `VatSettings` type, `getVatSettings` query
- [x] `admin-invoices-mutations.ts` — issueInvoice, creditNote, setVatSettings
- [x] Register in `store.ts`; `routes.ts` `finance.invoices`; add "Invoices" to the Finance nav group
- [x] `/finance/invoices` — invoices table (status/search filters, amount/VAT via formatEur, status pills) + VatSettingsPanel
- [x] `InvoiceActions` — issue (draft), download PDF, credit note (sent/paid) with amount + reason
- [x] `VatSettingsPanel` — BG ДДС rate, registered toggle, VAT number
- [x] Permission-gated via `can(PERMISSIONS.invoices)`; invoices reuse the Escrow tag (+ `VAT` sentinel)
- [x] Verify: typecheck ✓, biome ✓, lint:conventions ✓

## BACKEND TODO (for the BE agent)
- `POST /admin/invoices/:id/issue` — generate/regenerate the PDF, return the row with `pdfUrl`; audit.
- `POST /admin/invoices/:id/credit-note { amountCents, reason }` — audit.
- `GET  /admin/finance/vat → { ratePct, registered, vatId? }`
- `PUT  /admin/finance/vat { ratePct, registered, vatId? }` — audit.
- Extend `GET /admin/invoices` rows with `vatAmount` (cents) + `pdfUrl`.

## Notes
- Invoice `amount` is major units; rendered via the cents-based `formatEur` (×100). `vatAmount` is cents.
- Stacked on Module 4 (finance) so "Invoices" joins the existing Finance nav group.
- Reused the existing `useListInvoicesQuery`; left the read-only reports/invoices screen untouched.
- Pre-existing `noConfusingVoidType` warning on `getArAging`'s `| void` left as-is (not mine).

## Outcome
Stacked on the finance PR (→ foundation). FE complete against the contract;
non-functional until the BE routes land.
