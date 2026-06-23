import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import PortfolioCoverageReport from './components/PortfolioCoverageReport/PortfolioCoverageReport';

type PortfolioReportPageProps = { params: Promise<{ locale: string }> };

export default async function PortfolioReportPage({ params }: PortfolioReportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <PortfolioCoverageReport />
    </Suspense>
  );
}
