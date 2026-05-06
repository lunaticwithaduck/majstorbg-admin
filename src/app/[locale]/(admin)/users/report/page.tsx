import { setRequestLocale } from 'next-intl/server';
import UserReportTable from '../../../_components/admin-shell/components/UserReportTable/UserReportTable';

type UserReportPageProps = { params: Promise<{ locale: string }> };

export default async function UserReportPage({ params }: UserReportPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <UserReportTable />;
}
