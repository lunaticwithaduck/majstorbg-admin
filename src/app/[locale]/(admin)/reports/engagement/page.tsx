import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import EngagementReport from './components/EngagementReport/EngagementReport';

type EngagementReportPageProps = { params: Promise<{ locale: string }> };

export default async function EngagementReportPage({
  params,
}: EngagementReportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <EngagementReport />
    </Suspense>
  );
}
