import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import CancellationsReport from './components/CancellationsReport/CancellationsReport';

type CancellationsPageProps = { params: Promise<{ locale: string }> };

export default async function CancellationsPage({ params }: CancellationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <CancellationsReport />
    </Suspense>
  );
}
