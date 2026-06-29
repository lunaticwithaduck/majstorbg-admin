import { setRequestLocale } from 'next-intl/server';
import TransactionsLedger from './components/TransactionsLedger/TransactionsLedger';

type TransactionsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TransactionsPage({ params }: TransactionsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TransactionsLedger />;
}
