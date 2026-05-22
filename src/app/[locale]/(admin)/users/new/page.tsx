import { setRequestLocale } from 'next-intl/server';
import UserCreatePanel from '../../../_components/admin-shell/components/UserCreatePanel/UserCreatePanel';

type UserCreatePageProps = { params: Promise<{ locale: string }> };

export default async function UserCreatePage({ params }: UserCreatePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <UserCreatePanel />;
}
