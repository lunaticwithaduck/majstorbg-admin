import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import WorkerLeaderboardReport from './components/WorkerLeaderboardReport/WorkerLeaderboardReport';

type WorkerLeaderboardPageProps = { params: Promise<{ locale: string }> };

export default async function WorkerLeaderboardPage({
  params,
}: WorkerLeaderboardPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <WorkerLeaderboardReport />
    </Suspense>
  );
}
