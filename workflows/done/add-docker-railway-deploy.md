---
title: Add Docker container + Railway config for deploy
created: 2026-05-22
completed: 2026-05-22
status: done
---

## Goal
Make the admin app deployable to Railway via a container. Mirrors the backend's pattern (single-repo, `.npmrc` + `NODE_AUTH_TOKEN` build-arg for GitHub Packages) since admin is a standalone repo, not a workspace member of the consumer monorepo.

## Steps
- [x] `Dockerfile` — multi-stage (deps / builder / runner) on `node:20-alpine`, pnpm via corepack, `NODE_AUTH_TOKEN` build-arg, Next.js standalone output, non-root runtime user, port 3001.
- [x] `.dockerignore` — exclude `node_modules`, `.next`, `.env*`, `.git`, tests, workflows, etc.
- [x] `railway.json` — `DOCKERFILE` builder, ON_FAILURE restart, no preDeploy.

## Notes
- Build locally: `docker build --build-arg NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN -t majstorbg-admin .`
- Railway: set `NODE_AUTH_TOKEN` as a **build-time** secret in the service settings (Variables → "Build" scope), plus runtime env vars `NEXT_PUBLIC_API_URL` and `NEXT_PUBLIC_APP_ENV`. Railway's `PORT` env overrides the container's default 3001.
- No healthcheck path wired — Next has no `/health` route in this app yet. Add later once an API route exists.

## Outcome

Completed on 2026-05-22. Added `Dockerfile`, `.dockerignore`, and `railway.json` to make the admin app deployable to Railway. Pattern mirrored from `majstorbg-backend` (standalone repo with `.npmrc` + `NODE_AUTH_TOKEN` build-arg) rather than the consumer web's monorepo Dockerfile. Next.js `output: 'standalone'` was already set; the runtime stage copies only `.next/standalone` + `.next/static`, runs as non-root `app` user, and listens on the port Railway injects via `$PORT` (default 3001). Build was not executed end-to-end on Railway in this session — verification still owed.
