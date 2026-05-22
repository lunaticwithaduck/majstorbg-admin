import { setRequestLocale } from 'next-intl/server';
import NotificationsExplorer from './components/NotificationsExplorer/NotificationsExplorer';

type NotificationsPageProps = { params: Promise<{ locale: string }> };

export default async function NotificationsPage({ params }: NotificationsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <NotificationsExplorer />;
}
