import { Button, Text } from '@lunaticwithaduck/webui';
import { setRequestLocale } from 'next-intl/server';
import styles from './page.styles';

type LoginPageProps = {
  params: Promise<{ locale: string }>;
};

export default async function LoginPage({ params }: LoginPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  return (
    <main className={styles.root}>
      <Text as="h1" size="2xl" weight="bold" value="Log in." />
      <Button variant="primary" size="xl">
        <Text value="Log in" />
      </Button>
    </main>
  );
}
