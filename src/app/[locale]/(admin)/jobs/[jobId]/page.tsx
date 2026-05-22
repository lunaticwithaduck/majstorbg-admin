import { setRequestLocale } from 'next-intl/server';
import JobDetailPanel from '../components/JobDetailPanel/JobDetailPanel';

type JobDetailPageProps = {
  params: Promise<{ locale: string; jobId: string }>;
};

export default async function JobDetailPage({ params }: JobDetailPageProps) {
  const { locale, jobId } = await params;
  setRequestLocale(locale);

  return <JobDetailPanel jobId={jobId} />;
}
