---
title: Admin report screens — user directory + jobs funnel (overview/breakdown)
created: 2026-06-22
status: in-progress
---

## Goal
Build two report screens under `src/app/[locale]/(admin)/reports/` consuming the
already-existing composed components (PeriodSelect, ReportFilters, StatTile,
StatTileRow, ReportChart) and RTK hooks. URL-synced filter/period/sort state,
server-side sort via toggling column headers, CSV export of the current page.

## Steps
- [ ] reports/users/ — page.tsx (thin server) + components/UserDirectoryReport/
      (UserDirectoryReport.tsx + .styles.ts + config/constants.ts).
      KPI StatTileRow from useGetUserDirectorySummaryQuery; DataTable from
      useListUserDirectoryQuery; ReportFilters (PeriodSelect + role + verified
      Select); sortable Joined / Last active headers; View row action; CSV export.
- [ ] reports/jobs-funnel/ — layout.tsx (server) + components/FunnelTabs/FunnelTabs.tsx
      (Tabs/TabsList/TabsTrigger asChild -> Link, active via usePathname).
- [ ] reports/jobs-funnel/page.tsx (Overview) + components/JobsFunnelReport/
      (ReportFilters: PeriodSelect + category; StatTileRow KPIs; ReportChart bar
      funnel + line posted-vs-completed when period set).
- [ ] reports/jobs-funnel/breakdown/page.tsx + components/JobsFunnelBreakdown/
      (ReportFilters period + by Select; DataTable client-sortable; StatTileRow
      totals; CSV export).

## Completion
When all steps above are done:
Run `/complete workflows/tasks/admin-reports-users-jobs-funnel.md` before starting any new work.
