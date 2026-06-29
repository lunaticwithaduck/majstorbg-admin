import { setRequestLocale } from 'next-intl/server';
import DataRequestsQueue from './components/DataRequestsQueue/DataRequestsQueue';

type DataRequestsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function DataRequestsPage({ params }: DataRequestsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DataRequestsQueue />;
}
