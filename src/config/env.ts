import { z } from 'zod';

// No default for NEXT_PUBLIC_API_URL — a localhost fallback silently ships
// in production bundles when the deploy platform forgets to set it.
// Devs set it in .env.local (see .env.example); deploys set it as a
// build-scope variable so the value is inlined into the client bundle.
const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url(),
  NEXT_PUBLIC_APP_ENV: z.enum(['development', 'staging', 'production']).default('development'),
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
  NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
});

/**
 * Server-only backend origin for service-to-service calls (the /api/be proxy,
 * any SSR fetch). Prefers INTERNAL_API_URL — the Railway private-network
 * address (e.g. `http://backend.railway.internal:3000`) — so server-to-server
 * traffic bypasses the staging access gate; falls back to the public URL when
 * unset, so behaviour is unchanged until the gate exists.
 *
 * NEVER import into browser code: INTERNAL_API_URL is not a NEXT_PUBLIC_ var,
 * so it is undefined client-side. Browser calls use the same-origin `/api/be`
 * proxy.
 */
export const serverApiBase = (process.env.INTERNAL_API_URL ?? env.NEXT_PUBLIC_API_URL).replace(
  /\/+$/,
  '',
);

export type Env = z.infer<typeof envSchema>;
