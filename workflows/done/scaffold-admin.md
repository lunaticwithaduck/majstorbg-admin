---
title: Bootstrap majstorbg-admin scaffold
created: 2026-05-06
status: done
completed: 2026-05-06
---

## Goal

Stand up the empty admin shell so future feature tickets can ship without re-litigating tooling. No business code. Auth + deployment topology deferred per user direction (2026-05-06). Storybook deferred. i18n catalogue reused from `@lunaticwithaduck/i18n` as-is.

## Steps

- [x] `.npmrc` + `.env` (token from BE) so `@lunaticwithaduck/*` installs
- [x] `package.json` with the deps from the brief minus storybook/auth/etc.
- [x] `tsconfig.json` matching `../majstorbg/tsconfig.base.json` strictness
- [x] `next.config.ts` with `next-intl` plugin + `transpilePackages`
- [x] `biome.json` mirrored from `../majstorbg/biome.json`
- [x] `.gitignore`
- [x] `src/app/{layout.tsx, fonts.ts, globals.css}`
- [x] `src/app/[locale]/{layout.tsx, page.tsx, login/page.tsx}`
- [x] `src/lib/i18n/request.ts` shim
- [x] `src/middleware.ts` for locale routing
- [x] `src/auth/can.ts` placeholder (auth deferred)
- [x] `src/ui/components/composed/.gitkeep`
- [x] `vitest.config.ts` + `vitest.setup.ts` + smoke test of `/login`
- [x] `playwright.config.ts` + e2e smoke spec hitting `/login`
- [x] `scripts/lint-conventions.cjs` ported with admin SCAN_DIRS
- [x] `.claude/{settings.json, hooks/, commands/, skills/, agents/}` mirrored from `../majstorbg`
- [x] `workflows/{ideas,tasks,done,problems}/.gitkeep`
- [x] `CLAUDE.md` at root mirroring `apps/web/CLAUDE.md`
- [x] `pnpm install` succeeds with token from BE's .env
- [x] `pnpm dev` boots and `/login` renders (HTTP 200, "Welcome." + "Log in" in DOM)
- [x] `pnpm typecheck` — clean
- [x] `pnpm test` — 2/2 passing
- [x] `pnpm lint:conventions` — clean
- [x] `pnpm lint` (Biome) — no errors (2 warnings + 6 infos in copied hook files, kept verbatim)

## Discoveries during scaffold

- **Published `@lunaticwithaduck/i18n@1.1.0` catalogue is auto-parts content**, not majstorbg. Keys like `brand.tagline = "Quality auto parts for every vehicle…"` and `nav.cart`. The catalogue needs to be republished from the consumer monorepo's actual `messages/` files. Login page uses `"Welcome."` (`onboarding.role.headline`) and `"Log in"` (`intro.loginAction`) which happen to exist; the brief's literal `"Sign in"` and `"MajstorBG Admin"` strings were not in the catalogue.
- **Vitest 2 + Vite 7 are mutually incompatible.** Bumped to `vitest@4.1.5`. Web's `apps/web/package.json` still has the broken combo on paper but pnpm hoisting masks it there.
- **Tests need `server.deps.inline: true`** because webui's bundle transitively imports `next-intl`, which imports the bare `next/navigation` specifier — Node strict-ESM cannot resolve that under `.pnpm/`. Inlining routes the chain through Vite. The Text component is mocked at the next-intl layer so it renders translation keys in tests, not the source strings.
- **Tailwind `@source` points at `dist/`, not `src/`** — only `theme.css` ships from `src/` per webui's `package.json#files`.

## Open follow-ups (do NOT do here)
- Real auth wiring (better-auth client, role gate middleware, login form)
- BE PR adding `admin` to `UserRole` + `ALLOWED_ROLES`
- Deployment topology (same apex vs. locked-down host)
- Storybook reuse / dedicated stories build
- First business feature (data table, audit log, user search, etc.)
- Republish `@lunaticwithaduck/i18n` from the consumer's actual catalogue (currently shipping autoparts content)

## Completion

When all steps above are done:
Run `/complete workflows/tasks/scaffold-admin.md` before starting any new work.

## Outcome

Completed on 2026-05-06. All acceptance criteria checked; typecheck / vitest / lint:conventions / biome / Playwright e2e (where applicable) all green.
