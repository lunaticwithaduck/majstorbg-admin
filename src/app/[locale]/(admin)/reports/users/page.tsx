import { setRequestLocale } from 'next-intl/server';
import { Suspense } from 'react';
import UserDirectoryReport from './components/UserDirectoryReport/UserDirectoryReport';

type UserReportPageProps = { params: Promise<{ locale: string }> };

export default async function UserReportPage({ params }: UserReportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  // useSearchParams() in the body requires a Suspense boundary at build time.
  return (
    <Suspense>
      <UserDirectoryReport />
    </Suspense>
  );
}
