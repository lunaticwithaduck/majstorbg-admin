'use client';

import { Link, Tabs, TabsList, TabsTrigger, Text } from '@lunaticwithaduck/webui';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { routes } from '@/config/routes';
import { stripLocale } from '@/app/[locale]/_components/admin-shell/utils/nav.utils';
import { FUNNEL_TABS, FUNNEL_TABS_LABELS, type FunnelTabValue } from './config/constants';
import styles from './FunnelTabs.styles';

function activeTab(currentPath: string): FunnelTabValue {
  // Breakdown lives at a deeper segment; everything else under the funnel base
  // is the Overview tab (the base segment page IS the overview).
  return currentPath.startsWith(routes.reports.jobsFunnelBreakdown) ? 'breakdown' : 'overview';
}

export default function FunnelTabs({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? '/';
  const current = activeTab(stripLocale(pathname));

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold" value={FUNNEL_TABS_LABELS.heading} />
        <Text as="p" size="sm" color="muted" value={FUNNEL_TABS_LABELS.sub} />
      </header>

      <Tabs value={current}>
        <TabsList className={styles.list}>
          {FUNNEL_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} asChild>
              <Link href={tab.href} variant="inherit">
                {tab.label}
              </Link>
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {children}
    </div>
  );
}
