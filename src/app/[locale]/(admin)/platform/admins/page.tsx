import { setRequestLocale } from 'next-intl/server';
import AdminsList from './components/AdminsList/AdminsList';

type AdminsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AdminsPage({ params }: AdminsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AdminsList />;
}
