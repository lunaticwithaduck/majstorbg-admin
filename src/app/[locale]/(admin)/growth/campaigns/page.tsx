import { setRequestLocale } from 'next-intl/server';
import CampaignsList from './components/CampaignsList/CampaignsList';

type CampaignsPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function CampaignsPage({ params }: CampaignsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <CampaignsList />;
}
