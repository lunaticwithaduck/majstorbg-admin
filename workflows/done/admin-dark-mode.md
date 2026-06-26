---
title: Dark ("black") mode for the admin panel
created: 2026-06-26
status: done
---

## Goal
Add a dark theme to the admin app with a user-facing toggle. The design system
exposes colours as Tailwind v4 `@theme` CSS variables (`--color-background`,
`--color-text`, …) generated from `webui/tokens.ts`. Rather than touch the shared
package (cross-repo), override the token *values* under a `.dark` scope in the
admin's own `globals.css`. Components keep using the same token classes
(`bg-background`, `text-text`, `border-border`, …) and adapt automatically — no
per-component `dark:` utilities, no R4 violations.

Persistence is cookie-based so the server renders the correct class on `<html>`
(no flash, no hydration mismatch). Default is light (current look).

## Steps
- [x] `src/config/theme.ts` — cookie name, theme names, max-age constants
- [x] `src/app/globals.css` — `.dark` token override block + `color-scheme`
- [x] `src/app/layout.tsx` — read theme cookie (server), apply `dark` class to `<html>`
- [x] `ThemeToggle` component (sidebar) — Button + Icon, toggles class + sets cookie
- [x] Wire `ThemeToggle` into the Sidebar footer
- [x] Verify: `pnpm install` ✓, `pnpm typecheck` ✓ (exit 0), `pnpm lint:conventions` ✓, Biome ✓

## Outcome
Implemented and machine-verified (typecheck exit 0, Biome clean, lint:conventions
clean for all touched files). The one Biome `noDocumentCookie` warning is
suppressed with a justification — `document.cookie` is intentional because the
Cookie Store API lacks stable Firefox/Safari support and the server layout reads
the cookie for flash-free rendering.

Scoped to admin only — no change to the shared `@lunaticwithaduck/webui` package.
The dark palette keeps brand orange (`primary`/`accent`/`ring`) identical and
swaps neutrals to a near-black surface set.

Remaining: visual eyeball of both themes + the toggle (user-side UX review).
