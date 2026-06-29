import { setRequestLocale } from 'next-intl/server';
import ReviewsQueue from './components/ReviewsQueue/ReviewsQueue';

type ReviewsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ReviewsPage({ params }: ReviewsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ReviewsQueue />;
}
