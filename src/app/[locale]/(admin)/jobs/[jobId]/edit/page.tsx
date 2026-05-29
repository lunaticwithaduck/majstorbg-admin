import { setRequestLocale } from 'next-intl/server';
import JobEditPanel from './components/JobEditPanel/JobEditPanel';

type JobEditPageProps = {
  params: Promise<{ locale: string; jobId: string }>;
};

export default async function JobEditPage({ params }: JobEditPageProps) {
  const { locale, jobId } = await params;
  setRequestLocale(locale);

  return <JobEditPanel jobId={jobId} />;
}
