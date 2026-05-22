# syntax=docker/dockerfile:1.7
#
# Build:
#   docker build --build-arg NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN -t majstorbg-admin .
#
# Railway: set NODE_AUTH_TOKEN as a build-scope variable. Runtime env vars
# (NEXT_PUBLIC_API_URL, NEXT_PUBLIC_APP_ENV) go on the service.

# ---------- deps ----------
FROM node:20-alpine AS deps
ARG NODE_AUTH_TOKEN
WORKDIR /app
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

COPY package.json pnpm-lock.yaml .npmrc ./
RUN NODE_AUTH_TOKEN="$NODE_AUTH_TOKEN" pnpm install --frozen-lockfile

# ---------- builder ----------
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@9.12.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3001
ENV HOSTNAME=0.0.0.0
RUN addgroup -S app && adduser -S app -G app

# Next.js standalone output bundles only the minimal runtime + required deps.
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static

USER app
EXPOSE 3001
CMD ["node", "server.js"]
