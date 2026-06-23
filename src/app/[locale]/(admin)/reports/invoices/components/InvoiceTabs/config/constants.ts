import { routes } from '@/config/routes';

export const INVOICE_TABS_LABELS = {
  heading: 'Invoices',
  sub: 'Accounts-receivable aging and the full invoice ledger.',
} as const;

// Tab definitions in render order. `value` doubles as the Tabs active key and
// is matched against the current pathname to highlight the active tab.
export const INVOICE_TABS = [
  { value: 'aging', label: 'Aging', href: routes.reports.invoices },
  { value: 'list', label: 'List', href: routes.reports.invoicesList },
] as const;

export type InvoiceTabValue = (typeof INVOICE_TABS)[number]['value'];
