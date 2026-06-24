'use client';

import { Text } from '@lunaticwithaduck/webui';
import { usePathname } from 'next/navigation';
import { ADMIN_SHELL_BRAND, NAV_MODULES } from '../../config/constants';
import { moduleIsActive, stripLocale } from '../../utils/nav.utils';
import NavModuleSection from '../NavModuleSection/NavModuleSection';
import styles from './Sidebar.styles';

export default function Sidebar() {
  const pathname = usePathname() ?? '/';
  const currentPath = stripLocale(pathname);

  return (
    <aside className={styles.root}>
      <header className={styles.header}>
        <Text as="span" size="lg" weight="bold">
          {ADMIN_SHELL_BRAND.name}
        </Text>
        <Text as="span" size="sm" weight="medium" color="muted">
          {ADMIN_SHELL_BRAND.suffix}
        </Text>
      </header>
      <div className={styles.modules}>
        {NAV_MODULES.map((module) => (
          <NavModuleSection
            key={module.label}
            module={module}
            currentPath={currentPath}
            active={moduleIsActive(currentPath, module)}
          />
        ))}
      </div>
    </aside>
  );
}
