import { setRequestLocale } from 'next-intl/server';
import UserEditPanel from '../../../../_components/admin-shell/components/UserEditPanel/UserEditPanel';

type UserEditPageProps = {
  params: Promise<{ locale: string; userId: string }>;
};

export default async function UserEditPage({ params }: UserEditPageProps) {
  const { locale, userId } = await params;
  setRequestLocale(locale);

  return <UserEditPanel userId={userId} />;
}
