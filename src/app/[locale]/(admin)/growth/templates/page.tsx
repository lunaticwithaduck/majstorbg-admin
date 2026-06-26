import { setRequestLocale } from 'next-intl/server';
import TemplatesList from './components/TemplatesList/TemplatesList';

type TemplatesPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function TemplatesPage({ params }: TemplatesPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <TemplatesList />;
}
