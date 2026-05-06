import { setRequestLocale } from 'next-intl/server';
import UserDetailPanel from '../../../_components/admin-shell/components/UserDetailPanel/UserDetailPanel';

type UserDetailPageProps = {
  params: Promise<{ locale: string; userId: string }>;
};

export default async function UserDetailPage({ params }: UserDetailPageProps) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  return <UserDetailPanel userId={userId} />;
}
