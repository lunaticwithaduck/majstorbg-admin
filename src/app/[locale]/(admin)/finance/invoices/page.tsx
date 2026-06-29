import { setRequestLocale } from 'next-intl/server';
import InvoicesConsole from './components/InvoicesConsole/InvoicesConsole';

type InvoicesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function InvoicesPage({ params }: InvoicesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <InvoicesConsole />;
}
