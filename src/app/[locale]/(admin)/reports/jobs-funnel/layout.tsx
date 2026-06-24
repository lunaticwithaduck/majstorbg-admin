import type { ReactNode } from 'react';
import FunnelTabs from './components/FunnelTabs/FunnelTabs';

export default function JobsFunnelLayout({ children }: { children: ReactNode }) {
  return <FunnelTabs>{children}</FunnelTabs>;
}
