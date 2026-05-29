import { setRequestLocale } from 'next-intl/server';
import JobCreatePanel from './components/JobCreatePanel/JobCreatePanel';

type JobCreatePageProps = { params: Promise<{ locale: string }> };

export default async function JobCreatePage({ params }: JobCreatePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <JobCreatePanel />;
}
