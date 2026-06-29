import { setRequestLocale } from 'next-intl/server';
import ModerationQueue from './components/ModerationQueue/ModerationQueue';

type ModerationPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function ModerationPage({ params }: ModerationPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <ModerationQueue />;
}
