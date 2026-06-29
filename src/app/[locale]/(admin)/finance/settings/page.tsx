import { setRequestLocale } from 'next-intl/server';
import CommissionSettings from './components/CommissionSettings/CommissionSettings';

type FinanceSettingsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function FinanceSettingsPage({ params }: FinanceSettingsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CommissionSettings />;
}
