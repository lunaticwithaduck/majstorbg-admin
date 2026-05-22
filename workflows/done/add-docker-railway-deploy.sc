---
domain: deployment
source_task: add-docker-railway-deploy.md
date: 2026-05-22
keywords: ["docker", "dockerfile", "railway", "deploy", "container", "next standalone"]
---

## Extracted Knowledge

### Next.js standalone output — Docker COPY layout
`output: 'standalone'` in `next.config.ts` emits a self-contained runtime tree at `.next/standalone/` that includes `server.js` and only the `node_modules` actually required at runtime. The runner stage must copy:
- `.next/standalone` → `./` (becomes the working directory root, contains `server.js` and pruned `node_modules`)
- `.next/static` → `./.next/static` (Next does NOT bundle static assets into standalone)
- `public` → `./public` (only if the directory exists — admin has no `public/` yet, so this COPY was omitted)

Skipping the `.next/static` copy results in a server that 404s every JS/CSS chunk. This is the single most common standalone-output footgun.

Entrypoint is `node server.js` from the root of the copied standalone tree. Do NOT prefix the path (e.g. `node apps/web/server.js`) unless you're in a pnpm workspace — admin is a single-repo so the standalone tree lives directly at `/app/`.

### GitHub Packages auth in Docker
`.npmrc` referencing `${NODE_AUTH_TOKEN}` requires the token to be present in the env at `pnpm install` time, NOT baked into the image. Pattern:
1. `ARG NODE_AUTH_TOKEN` in the deps stage
2. `RUN NODE_AUTH_TOKEN="$NODE_AUTH_TOKEN" pnpm install --frozen-lockfile`
3. Multi-stage build — runner stage never sees the ARG, so the token cannot leak into the final image layers
4. Build invocation: `docker build --build-arg NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN ...`

On Railway: set `NODE_AUTH_TOKEN` as a **build-scope** variable (not a regular service variable) so it's available during image build but not injected into the running container.

### pnpm in Docker via corepack
`RUN corepack enable && corepack prepare pnpm@9.12.0 --activate` pins the version explicitly. Relying on bare `corepack enable` requires a `packageManager` field in `package.json`; without it, corepack uses an arbitrary default. The admin `package.json` has no `packageManager` field, so explicit `corepack prepare` is mandatory.

### Railway container deployment
Minimal `railway.json` for a Dockerfile-built service:
```json
{
  "$schema": "https://railway.app/railway.schema.json",
  "build": { "builder": "DOCKERFILE", "dockerfilePath": "Dockerfile" },
  "deploy": { "restartPolicyType": "ON_FAILURE", "restartPolicyMaxRetries": 5 }
}
```
- Railway injects `PORT` at runtime; Next standalone's `server.js` reads `process.env.PORT` automatically, so EXPOSE in the Dockerfile is documentation only.
- Set `HOSTNAME=0.0.0.0` explicitly — Next standalone defaults to `localhost` in some setups, which makes the service unreachable from outside the container.
- `healthcheckPath` is optional; omit until an actual `/health` route exists. Setting it to `/` works but adds noise to logs.
- `preDeployCommand` runs once per deploy before the new container takes traffic — used by the backend for `prisma:deploy:full`; admin has no DB so it's omitted.

### .dockerignore essentials
Beyond the obvious `node_modules` / `.next` / `.git`:
- `.env*` with `!.env.example` — prevent secret leakage into the build context
- `.claude/` and `workflows/` — agentic flow files have no business in a production image
- `e2e/`, `playwright-report/`, `test-results/`, `*.tsbuildinfo` — test artifacts inflate build context and slow `COPY . .`

## Proposed Skill Content

A `deployment` skill would cover:
1. **Choosing a deploy target.** Decision tree: Vercel (Next-native, easy, opinionated) vs Railway (Docker, BYO infra, cheaper for always-on) vs k8s (custom orchestration, only when scale demands).
2. **Next.js standalone Dockerfile recipe.** Multi-stage layout, static + public COPY traps, port/hostname env vars.
3. **Private-registry auth in containers.** Build-arg + multi-stage isolation pattern so tokens don't end up in image layers.
4. **pnpm in containers.** corepack pin pattern, `--frozen-lockfile`, when to use `pnpm prune --prod` vs Next standalone's automatic pruning.
5. **Railway service config.** `railway.json` schema, build vs runtime variable scopes, `preDeployCommand` use cases, healthcheck wiring.
6. **Image hardening.** Non-root user (`addgroup -S app && adduser -S app -G app`), `NODE_ENV=production`, `NEXT_TELEMETRY_DISABLED=1`, no shell tools in runner stage.
