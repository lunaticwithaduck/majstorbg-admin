import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import ProfileCompletenessReport from './components/ProfileCompletenessReport/ProfileCompletenessReport';

type ProfileCompletenessReportPageProps = { params: Promise<{ locale: string }> };

export default async function ProfileCompletenessReportPage({
  params,
}: ProfileCompletenessReportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <ProfileCompletenessReport />
    </Suspense>
  );
}
