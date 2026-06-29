import { setRequestLocale } from 'next-intl/server';
import PromotionsList from './components/PromotionsList/PromotionsList';

type PromotionsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function PromotionsPage({ params }: PromotionsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PromotionsList />;
}
