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

export type Env = z.infer<typeof envSchema>;
