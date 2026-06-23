import type { ReactNode } from 'react';
import InvoiceTabs from './components/InvoiceTabs/InvoiceTabs';

export default function InvoicesLayout({ children }: { children: ReactNode }) {
  return <InvoiceTabs>{children}</InvoiceTabs>;
}
