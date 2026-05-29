import { setRequestLocale } from 'next-intl/server';
import FeatureFlagsTable from './components/FeatureFlagsTable/FeatureFlagsTable';

type FeatureFlagsPageProps = { params: Promise<{ locale: string }> };

export default async function FeatureFlagsPage({ params }: FeatureFlagsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FeatureFlagsTable />;
}
