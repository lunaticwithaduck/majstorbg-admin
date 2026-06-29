import { setRequestLocale } from 'next-intl/server';
import TrafficDashboard from './components/TrafficDashboard/TrafficDashboard';

type TrafficPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TrafficPage({ params }: TrafficPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TrafficDashboard />;
}
