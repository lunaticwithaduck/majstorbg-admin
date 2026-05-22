# syntax=docker/dockerfile:1.7
#
# Build:
#   docker build \
#     --build-arg NODE_AUTH_TOKEN=$NODE_AUTH_TOKEN \
#     --build-arg NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL \
#     --build-arg NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV \
#     -t majstorbg-admin .
#
# Railway: set these as service variables. Railway passes service variables
# as --build-arg only for ARGs declared in the Dockerfile, so the NEXT_PUBLIC_*
# ARGs below are required for the values to reach `next build` and be inlined
# into the client bundle.

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

# NEXT_PUBLIC_* must be present during `next build` — they're inlined into
# the client bundle as string literals at build time. Service-level env vars
# alone don't reach the build; they have to be declared as ARG here and
# promoted to ENV so `next build` sees them.
ARG NEXT_PUBLIC_API_URL
ARG NEXT_PUBLIC_APP_ENV
ENV NEXT_PUBLIC_API_URL=$NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_APP_ENV=$NEXT_PUBLIC_APP_ENV

COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN pnpm build

# ---------- runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
# libc6-compat: Next.js's SWC binary is built against glibc; Alpine ships musl.
# Without this, runtime native-binding loads can fail with an opaque error.
RUN apk add --no-cache libc6-compat && addgroup -S app && adduser -S app -G app

# Next.js standalone output bundles only the minimal runtime + required deps.
COPY --from=builder --chown=app:app /app/.next/standalone ./
COPY --from=builder --chown=app:app /app/.next/static ./.next/static

USER app
EXPOSE 8080
# HOSTNAME must be set in CMD, not ENV. Docker overrides ENV HOSTNAME at
# runtime with the container's hostname, which Next standalone then uses
# as the bind address — making it bind to a non-routable name (or localhost)
# instead of 0.0.0.0. Forcing it here, after Docker's runtime injection.
CMD ["sh", "-c", "HOSTNAME=0.0.0.0 exec node server.js"]
