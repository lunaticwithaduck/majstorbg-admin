import { setRequestLocale } from 'next-intl/server';
import PayoutsQueue from './components/PayoutsQueue/PayoutsQueue';

type PayoutsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PayoutsPage({ params }: PayoutsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PayoutsQueue />;
}
