import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import JobsFunnelBreakdown from './components/JobsFunnelBreakdown/JobsFunnelBreakdown';

type JobsFunnelBreakdownPageProps = { params: Promise<{ locale: string }> };

export default async function JobsFunnelBreakdownPage({
  params,
}: JobsFunnelBreakdownPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <JobsFunnelBreakdown />
    </Suspense>
  );
}
