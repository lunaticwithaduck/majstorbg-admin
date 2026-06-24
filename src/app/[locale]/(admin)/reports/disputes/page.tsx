import { setRequestLocale } from 'next-intl/server';
import DisputesQueueReport from './components/DisputesQueueReport/DisputesQueueReport';

type DisputesPageProps = { params: Promise<{ locale: string }> };

export default async function DisputesPage({ params }: DisputesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <DisputesQueueReport />;
}
