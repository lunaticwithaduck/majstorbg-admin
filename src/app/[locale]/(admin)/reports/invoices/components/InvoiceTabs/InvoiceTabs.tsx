'use client';

import { Link, Tabs, TabsList, TabsTrigger, Text } from '@lunaticwithaduck/webui';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { routes } from '@/config/routes';
import {
  INVOICE_TABS,
  INVOICE_TABS_LABELS,
  type InvoiceTabValue,
} from './config/constants';
import styles from './InvoiceTabs.styles';

/**
 * Tab strip for the invoices section. Tabs are `<Link>`-backed (real navigation,
 * shareable URLs) rather than client-only state; the active tab is derived from
 * the pathname. The locale prefix means `usePathname` returns e.g.
 * `/en/reports/invoices/list`, so we match on the route suffix.
 */
export default function InvoiceTabs({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // The list tab owns the `/list` suffix; everything else under the section is
  // the base aging tab.
  const active: InvoiceTabValue = pathname.endsWith(routes.reports.invoicesList) ? 'list' : 'aging';

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <Text as="h1" size="2xl" weight="bold">
          {INVOICE_TABS_LABELS.heading}
        </Text>
        <Text as="p" size="sm" color="muted">
          {INVOICE_TABS_LABELS.sub}
        </Text>
      </header>

      <Tabs value={active}>
        <TabsList>
          {INVOICE_TABS.map((tab) => (
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
