/**
 * Feature flag resolution for admin.
 *
 * Source of truth for flag *definitions* is `@lunaticwithaduck/feature-flags`.
 * Admin reads the *effective* value with this priority (highest first):
 *   1. localStorage override (set via the /feature-flags toggle UI)
 *   2. `NEXT_PUBLIC_FLAG_<KEY>` env var (build-time, snapshotted via getFlagEnvSnapshot)
 *   3. The `default` baked into the flag definition
 *
 * There is no BE-backed flag service yet. Overrides live in the user's browser
 * only — they don't propagate to other admins or to production.
 *
 * R10: every component that needs a flag MUST go through this module. Never
 * read `process.env.NEXT_PUBLIC_FLAG_*` directly.
 *
 * Env-var support quirk: Next only inlines `process.env.NEXT_PUBLIC_*` for
 * *literal* property accesses at build time. Dynamic computed access does
 * NOT get replaced, so client-side resolution can only know about env vars
 * if they're snapshotted on the server. The /feature-flags screen does that
 * by passing the snapshot down from its Server Component.
 */

import { type FeatureFlagKey, featureFlags } from '@lunaticwithaduck/feature-flags';
import { useCallback, useSyncExternalStore } from 'react';

const STORAGE_KEY_PREFIX = 'majstor.flag.';
const OVERRIDE_EVENT = 'majstor:flag-override-changed';

export type FlagEnvSnapshot = Partial<Record<FeatureFlagKey, boolean>>;

// Module-scoped snapshot of env-var values, populated by the Server Component
// at render time via `setFlagEnvSnapshot`. Client-only code reads from this
// instead of `process.env` directly because Next only inlines literal accesses.
let flagEnvSnapshot: FlagEnvSnapshot = {};

export function setFlagEnvSnapshot(snapshot: FlagEnvSnapshot): void {
  flagEnvSnapshot = snapshot;
}

export function getFlagEnvSnapshot(): FlagEnvSnapshot {
  return flagEnvSnapshot;
}

export function getFlagDefault(key: FeatureFlagKey): boolean {
  return featureFlags[key].default;
}

export function getEnvFlag(key: FeatureFlagKey): boolean | null {
  const value = flagEnvSnapshot[key];
  return value === undefined ? null : value;
}

export function getFlagOverride(key: FeatureFlagKey): boolean | null {
  if (typeof window === 'undefined') return null;
  const raw = window.localStorage.getItem(`${STORAGE_KEY_PREFIX}${key}`);
  if (raw === null) return null;
  if (raw === 'true') return true;
  if (raw === 'false') return false;
  return null;
}

export function setFlagOverride(key: FeatureFlagKey, value: boolean): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(`${STORAGE_KEY_PREFIX}${key}`, value ? 'true' : 'false');
  window.dispatchEvent(new CustomEvent(OVERRIDE_EVENT, { detail: { key } }));
}

export function clearFlagOverride(key: FeatureFlagKey): void {
  if (typeof window === 'undefined') return;
  window.localStorage.removeItem(`${STORAGE_KEY_PREFIX}${key}`);
  window.dispatchEvent(new CustomEvent(OVERRIDE_EVENT, { detail: { key } }));
}

export function resolveFlag(key: FeatureFlagKey): boolean {
  const override = getFlagOverride(key);
  if (override !== null) return override;
  const env = getEnvFlag(key);
  if (env !== null) return env;
  return getFlagDefault(key);
}

function subscribeToOverrides(callback: () => void): () => void {
  if (typeof window === 'undefined') return () => undefined;
  const onChange = () => callback();
  window.addEventListener(OVERRIDE_EVENT, onChange);
  window.addEventListener('storage', onChange);
  return () => {
    window.removeEventListener(OVERRIDE_EVENT, onChange);
    window.removeEventListener('storage', onChange);
  };
}

/**
 * React hook for the *effective* value of a flag, kept in sync with override
 * writes from anywhere in the app (including other tabs via the `storage`
 * event). SSR returns the default-or-env value; the client snapshot lights up
 * after hydration.
 */
export function useFeatureFlag(key: FeatureFlagKey): boolean {
  const getSnapshot = useCallback(() => resolveFlag(key), [key]);
  const getServerSnapshot = useCallback(() => {
    const env = getEnvFlag(key);
    return env !== null ? env : getFlagDefault(key);
  }, [key]);
  return useSyncExternalStore(subscribeToOverrides, getSnapshot, getServerSnapshot);
}
