import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import MatchSpeedReport from './components/MatchSpeedReport/MatchSpeedReport';

type MatchSpeedReportPageProps = { params: Promise<{ locale: string }> };

export default async function MatchSpeedReportPage({
  params,
}: MatchSpeedReportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <MatchSpeedReport />
    </Suspense>
  );
}
