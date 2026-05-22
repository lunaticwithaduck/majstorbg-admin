import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/lib/i18n/request.ts');

const config: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@lunaticwithaduck/api',
    '@lunaticwithaduck/schemas',
    '@lunaticwithaduck/types',
    '@lunaticwithaduck/i18n',
    '@lunaticwithaduck/feature-flags',
    '@lunaticwithaduck/webui',
  ],
  typedRoutes: true,
  output: 'standalone',
};

export default withNextIntl(config);
