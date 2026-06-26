import type { Metadata } from 'next';
import { cookies } from 'next/headers';
import { getLocale } from 'next-intl/server';
import type { ReactNode } from 'react';
import { THEME, THEME_COOKIE } from '@/config/theme';
import { fontVariables } from './fonts';
import './globals.css';

export const metadata: Metadata = {
  title: 'MajstorBG Admin',
  description: 'Internal admin app for the MajstorBG platform',
};

export default async function RootLayout({ children }: { children: ReactNode }) {
  const [locale, cookieStore] = await Promise.all([getLocale(), cookies()]);
  // Apply the persisted theme class server-side so <html> renders correctly on
  // first paint (no flash, no hydration mismatch). Default is light.
  const isDark = cookieStore.get(THEME_COOKIE)?.value === THEME.dark;
  const htmlClassName = isDark ? `${fontVariables} dark` : fontVariables;

  return (
    <html lang={locale} className={htmlClassName}>
      <body>{children}</body>
    </html>
  );
}
