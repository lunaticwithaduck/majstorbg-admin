import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import WorkerSupplyReport from './components/WorkerSupplyReport/WorkerSupplyReport';

type WorkerSupplyReportPageProps = { params: Promise<{ locale: string }> };

export default async function WorkerSupplyReportPage({
  params,
}: WorkerSupplyReportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <WorkerSupplyReport />
    </Suspense>
  );
}
