---
title: Feature flags toggle UI at /feature-flags
created: 2026-05-22
status: in-progress
---

## Goal
Build the `/feature-flags` admin screen that lists every flag defined in
`@lunaticwithaduck/feature-flags` and lets admins flip each on/off. Persistence
is browser-local (localStorage) since no BE-backed flag service exists yet.

Each row shows three indicators — `default` (from the package), `env`
(`NEXT_PUBLIC_FLAG_*` if set), `effective` (what the app reads right now) — and
a "Reset to default" action that clears the localStorage entry.

A banner at the top notes that overrides are stored in the browser only and
don't affect other users or production.

## Steps
- [x] Add `src/config/feature-flags.ts` exposing `resolveFlag`, `setFlagOverride`,
      `clearFlagOverride`, `getEnvFlag`, and a `useFeatureFlag` hook.
- [x] Create `src/app/[locale]/(admin)/feature-flags/page.tsx` (thin shell).
- [x] Create the `FeatureFlagsTable` component + styles + constants under
      `src/app/[locale]/(admin)/feature-flags/components/FeatureFlagsTable/`.
- [x] Use the existing `<DataTable>` primitive (columns map naturally).
- [x] Verify with `pnpm typecheck` and `pnpm lint:conventions`.

## Completion
When all steps above are done:
Run `/complete workflows/tasks/feature-flags-toggle-ui.md` before starting any new work.
