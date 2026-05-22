import { setRequestLocale } from 'next-intl/server';
import JobsExplorer from './components/JobsExplorer/JobsExplorer';

type JobsPageProps = { params: Promise<{ locale: string }> };

export default async function JobsPage({ params }: JobsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return <JobsExplorer />;
}
