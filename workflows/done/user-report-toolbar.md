---
title: User report — toolbar with search + role filter + compact top pagination
created: 2026-05-06
status: done
completed: 2026-05-06
---

## Goal

Add a toolbar above the User Report table holding a search input (name/email), a role filter dropdown (All / Worker / Client), and a compact pagination control — moving pagination from the bottom to the top so it stays visible without scrolling. BE already supports `?search=` and `?role=` so no BE changes.

## Steps

- [x] Add toolbar above the `<Table>`: `<SearchInput>` (debounced) + `<Select>` role filter + compact Prev/Next + page label
- [x] Remove the bottom pagination block
- [x] Wire `search` + `roleFilter` state into the RTK Query args; reset page to 1 when either changes
- [x] Update styles for the toolbar layout
- [x] Update column-labels constants if needed
- [x] `pnpm typecheck`, `pnpm test`, `pnpm lint:conventions`, `pnpm lint` — clean
- [x] Manual smoke in browser: search filters list, role filter narrows it, pagination at top works

## Completion

When all steps above are done:
Run `/complete workflows/tasks/user-report-toolbar.md` before starting any new work.

## Outcome

Completed on 2026-05-06. All acceptance criteria checked; typecheck / vitest / lint:conventions / biome / Playwright e2e (where applicable) all green.
