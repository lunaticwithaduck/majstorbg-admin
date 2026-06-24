---
title: Admin reports — Disputes queue + detail and Invoices (aging/list)
created: 2026-06-22
status: in-progress
---

## Goal
Build the Disputes and Invoices report screens under `src/app/[locale]/(admin)/reports/`,
consuming the existing composed components (StatTile, StatTileRow, ReportChart, ReportFilters,
PeriodSelect) and the local-stopgap RTK hooks (disputes / invoices). Same shared screen
mechanics as the other report agent: URL-synced filters via `useSearchParams`/`useRouter().replace`,
page reset on filter change, server-side sort headers via webui `<Button>`, CSV export `<Button>`
in DataTable actions slot (current-page rows), copy in `config/constants.ts`.

## Steps
- [ ] reports/disputes/page.tsx (server) + components/DisputesQueueReport/ — KPI tiles +
      DataTable (status/type/search/open-only filters, sortable createdAt, donut of status mix,
      View row action, CSV export)
- [ ] reports/disputes/[id]/page.tsx (server, await params) + components/DisputeDetail/ —
      field grid (FieldLabel/FieldValue), timeline list, link to job; loading/error/not-found
- [ ] reports/invoices/layout.tsx (server) + components/InvoiceTabs/ — tab strip (Aging | List)
- [ ] reports/invoices/page.tsx (Aging) + components/ArAgingReport/ — StatTileRow KPIs + bar chart
- [ ] reports/invoices/list/page.tsx + components/InvoicesListReport/ — DataTable (sortable
      issued/due/daysOverdue), period/status/aging-bucket filters, CSV export, totals strip

## Completion
When all steps above are done:
Run `/complete workflows/tasks/admin-reports-disputes-invoices.md` before starting any new work.
