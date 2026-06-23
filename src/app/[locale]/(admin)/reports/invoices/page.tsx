import { setRequestLocale } from 'next-intl/server';
import ArAgingReport from './components/ArAgingReport/ArAgingReport';

type InvoicesAgingPageProps = { params: Promise<{ locale: string }> };

export default async function InvoicesAgingPage({ params }: InvoicesAgingPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ArAgingReport />;
}
