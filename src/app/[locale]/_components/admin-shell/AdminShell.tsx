import type { ReactNode } from 'react';
import styles from './AdminShell.styles';
import Sidebar from './components/Sidebar/Sidebar';

type AdminShellProps = {
  children: ReactNode;
};

export default function AdminShell({ children }: AdminShellProps) {
  return (
    <div className={styles.root}>
      <Sidebar />
      <main className={styles.main}>{children}</main>
    </div>
  );
}
