import { type FeatureFlagKey, featureFlags } from '@lunaticwithaduck/feature-flags';
import { setRequestLocale } from 'next-intl/server';
import type { FlagEnvSnapshot } from '@/config/feature-flags';
import FeatureFlagsTable from './components/FeatureFlagsTable/FeatureFlagsTable';

type FeatureFlagsPageProps = { params: Promise<{ locale: string }> };

function toEnvSuffix(key: string): string {
  return key.replace(/([a-z0-9])([A-Z])/g, '$1_$2').toUpperCase();
}

// Build the env snapshot on the server, where `process.env` has every var
// available (not just those Next inlined for the client bundle). The toggle UI
// uses this to show which flags are pinned by `NEXT_PUBLIC_FLAG_*` env vars.
function buildEnvSnapshot(): FlagEnvSnapshot {
  const snapshot: FlagEnvSnapshot = {};
  const keys = Object.keys(featureFlags) as FeatureFlagKey[];
  for (const key of keys) {
    const envKey = `NEXT_PUBLIC_FLAG_${toEnvSuffix(key)}`;
    const raw = process.env[envKey];
    if (raw === undefined || raw === '') continue;
    if (raw === 'true' || raw === '1') snapshot[key] = true;
    else if (raw === 'false' || raw === '0') snapshot[key] = false;
  }
  return snapshot;
}

export default async function FeatureFlagsPage({ params }: FeatureFlagsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const envSnapshot = buildEnvSnapshot();

  return <FeatureFlagsTable envSnapshot={envSnapshot} />;
}
