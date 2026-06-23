import { setRequestLocale } from 'next-intl/server';
import DisputeDetail from './components/DisputeDetail/DisputeDetail';

type DisputeDetailPageProps = {
  params: Promise<{ locale: string; id: string }>;
};

export default async function DisputeDetailPage({ params }: DisputeDetailPageProps) {
  const { locale, id } = await params;
  setRequestLocale(locale);
  return <DisputeDetail disputeId={id} />;
}
