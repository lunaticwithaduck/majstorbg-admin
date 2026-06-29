import { setRequestLocale } from 'next-intl/server';
import AuditLog from './components/AuditLog/AuditLog';

type AuditPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function AuditPage({ params }: AuditPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <AuditLog />;
}
