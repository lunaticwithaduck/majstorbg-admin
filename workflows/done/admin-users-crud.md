---
title: Admin users CRUD (create / edit / delete)
created: 2026-05-22
status: done
completed: 2026-05-22
---

## Goal
Extend the admin Users module with full CRUD: a Create form, an Edit form,
a destructive Delete action with confirmation, and a "+ New user" toolbar
entrypoint on the list. BE has no mutation endpoints yet, so the mutations
are stubbed locally (matching the existing `adminUserEndpoints` pattern)
and injected into the same `appApi` so callers stay BE-agnostic once the
real endpoints land.

## Steps
- [x] Stub `src/api/admin-user-mutations.ts` with create / update / delete mutations
- [x] Inject the stubbed mutations into `src/api/store.ts` and export hooks
- [x] Shared `UserForm` composed component (used by create + edit)
- [x] `/users/new` page — create flow
- [x] `/users/[userId]/edit` page — edit flow (prefilled)
- [x] Add destructive delete + confirmation Modal to `UserDetailPanel`
- [x] Wire "+ New user" action into `UserReportTable` via DataTable `actions` slot
- [x] `pnpm typecheck` clean
- [x] `pnpm lint:conventions` clean

## Discoveries during work
- `@lunaticwithaduck/api` does not currently export an `EndpointBuilder` /
  `Build` type alias, but the underlying `AxiosBaseQueryArgs`,
  `AxiosBaseQueryError`, and `API_TAGS` exports are enough to reconstruct
  the same builder type used by the published endpoints. The stub uses that
  recipe so swapping to real `adminUserMutations` later is a single-import
  delete-and-replace.
- `exactOptionalPropertyTypes: true` plus webui's typed `Select.disabled`
  forced default values in `UserForm` (`isSubmitting = false`) instead of
  passing `boolean | undefined` through.

## Open follow-ups (do NOT do here)
- Replace `src/api/admin-user-mutations.ts` with `adminUserMutations` from
  `@lunaticwithaduck/api` once BE / package land. Hook names should stay
  identical so consumer files don't need to change.
- Add BE-side validation parity with the form's zod schema, then wire
  field-level server errors (RTK Query `error.data.fields`) back into
  `react-hook-form` via `setError`.
- Translate copy (`USER_FORM_LABELS`, `CREATE_LABELS`, `EDIT_LABELS`,
  `DELETE_LABELS`) once admin gets its own i18n catalogue.

## Outcome
Completed on 2026-05-22. `pnpm typecheck` and `pnpm lint:conventions` pass.
Mutations stubbed locally pending BE; UI flows wired and reachable via
`/users/new`, the new toolbar `+ New user` button, and the per-user
detail page's Edit / Delete actions.
