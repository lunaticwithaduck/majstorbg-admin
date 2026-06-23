import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import JobsFunnelReport from './components/JobsFunnelReport/JobsFunnelReport';

type JobsFunnelPageProps = { params: Promise<{ locale: string }> };

export default async function JobsFunnelPage({ params }: JobsFunnelPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <JobsFunnelReport />
    </Suspense>
  );
}
