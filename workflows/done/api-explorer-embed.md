---
title: Embed BE Swagger UI at /api-explorer
created: 2026-05-22
status: in-progress
---

## Goal
Subagent slice of `admin-wave-1-expansion` — ship the `/api-explorer` route that
iframes the backend's Swagger UI so devs can poke endpoints without leaving the
admin app.

## Steps
- [ ] Confirm Swagger path in `../majstorbg-backend/src/main.ts`
- [ ] Add `page.tsx`, `page.styles.ts`, `config/constants.ts` under
      `src/app/[locale]/(admin)/api-explorer/`
- [ ] Wire iframe src from `env.NEXT_PUBLIC_API_URL` + swagger path constant
- [ ] Include "Open in new tab" `<Link external>` escape hatch
- [ ] `pnpm typecheck` + `pnpm lint:conventions` both green

## Completion
When all steps above are done:
Run `/complete workflows/tasks/api-explorer-embed.md` before starting any new work.
