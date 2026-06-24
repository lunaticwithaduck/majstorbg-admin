import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import RatingsReport from './components/RatingsReport/RatingsReport';

type RatingsReportPageProps = { params: Promise<{ locale: string }> };

export default async function RatingsReportPage({ params }: RatingsReportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <RatingsReport />
    </Suspense>
  );
}
