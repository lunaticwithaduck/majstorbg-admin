import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import CategoryPerformanceReport from './components/CategoryPerformanceReport/CategoryPerformanceReport';

type CategoryReportPageProps = { params: Promise<{ locale: string }> };

export default async function CategoryReportPage({ params }: CategoryReportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <CategoryPerformanceReport />
    </Suspense>
  );
}
