import { setRequestLocale } from 'next-intl/server';
import SkillCategoriesTable from './components/SkillCategoriesTable/SkillCategoriesTable';

type Props = { params: Promise<{ locale: string }> };

export default async function SkillCategoriesPage({ params }: Props) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <SkillCategoriesTable />;
}
