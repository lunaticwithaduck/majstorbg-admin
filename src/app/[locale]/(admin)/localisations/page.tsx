import { setRequestLocale } from 'next-intl/server';
import LocalisationsTable from './components/LocalisationsTable/LocalisationsTable';

type LocalisationsPageProps = { params: Promise<{ locale: string }> };

export default async function LocalisationsPage({ params }: LocalisationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <LocalisationsTable />;
}
