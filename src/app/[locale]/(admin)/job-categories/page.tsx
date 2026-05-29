import { setRequestLocale } from 'next-intl/server';
import JobCategoriesTable from './components/JobCategoriesTable/JobCategoriesTable';

type Props = { params: Promise<{ locale: string }> };

export default async function JobCategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <JobCategoriesTable />;
}
