import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import RegistrationsReport from './components/RegistrationsReport/RegistrationsReport';

type RegistrationsReportPageProps = { params: Promise<{ locale: string }> };

export default async function RegistrationsReportPage({
  params,
}: RegistrationsReportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <RegistrationsReport />
    </Suspense>
  );
}
