import { Link, Text } from '@lunaticwithaduck/webui';
import { ExternalLink } from 'lucide-react';
import { setRequestLocale } from 'next-intl/server';
import { env } from '@/config/env';
import { API_EXPLORER_LABELS, SWAGGER_PATH } from './config/constants';
import styles from './page.styles';

// If the BE ever sets restrictive `X-Frame-Options` / CSP `frame-ancestors`,
// the iframe will render blank — the "Open in new tab" link below is the
// escape hatch so the page still works.

type ApiExplorerPageProps = { params: Promise<{ locale: string }> };

export default async function ApiExplorerPage({ params }: ApiExplorerPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);

  const swaggerUrl = `${env.NEXT_PUBLIC_API_URL}${SWAGGER_PATH}`;

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <div className={styles.headerRow}>
          <div className={styles.headerCopy}>
            <Text as="h1" size="2xl" weight="bold">
              {API_EXPLORER_LABELS.heading}
            </Text>
            <Text as="p" size="sm" color="muted">
              {API_EXPLORER_LABELS.description}
            </Text>
          </div>
          {/* Render the lucide icon directly: webui's <Icon icon={Fn}> passes a
              function across the server/client boundary, which React rejects on
              a server component. Lucide components ARE server-renderable. */}
          <Link href={swaggerUrl} external variant="default" size="sm">
            <ExternalLink size={14} />
            <Text as="span" size="sm" weight="medium">
              {API_EXPLORER_LABELS.openInNewTab}
            </Text>
          </Link>
        </div>
      </header>
      <div className={styles.frameCard}>
        <iframe
          src={swaggerUrl}
          title={API_EXPLORER_LABELS.iframeTitle}
          className={styles.frame}
        />
      </div>
    </div>
  );
}
