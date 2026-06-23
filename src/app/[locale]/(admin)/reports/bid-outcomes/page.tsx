import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import BidOutcomesReport from './components/BidOutcomesReport/BidOutcomesReport';

type BidOutcomesReportPageProps = { params: Promise<{ locale: string }> };

export default async function BidOutcomesReportPage({
  params,
}: BidOutcomesReportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <BidOutcomesReport />
    </Suspense>
  );
}
