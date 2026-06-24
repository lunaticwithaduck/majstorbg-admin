import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import LiquidityReport from './components/LiquidityReport/LiquidityReport';

type LiquidityReportPageProps = { params: Promise<{ locale: string }> };

export default async function LiquidityReportPage({ params }: LiquidityReportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <LiquidityReport />
    </Suspense>
  );
}
