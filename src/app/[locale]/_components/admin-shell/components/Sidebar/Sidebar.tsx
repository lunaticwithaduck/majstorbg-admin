'use client';

import { Icon, Link, Text } from '@lunaticwithaduck/webui';
import { usePathname } from 'next/navigation';
import { ADMIN_SHELL_BRAND, NAV_MODULES } from '../../config/constants';
import styles from './Sidebar.styles';

function stripLocale(pathname: string): string {
  const segments = pathname.split('/').filter(Boolean);
  if (segments.length === 0) return '/';
  return `/${segments.slice(1).join('/')}` || '/';
}

function isActive(currentPath: string, href: string): boolean {
  return currentPath === href || currentPath.startsWith(`${href}/`);
}

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
          <section key={module.label} className={styles.module}>
            <div className={styles.moduleHeader}>
              <Icon icon={module.icon} size="sm" />
              <Text as="span" size="xs" weight="semibold" color="muted">
                {module.label}
              </Text>
            </div>
            <div className={styles.moduleLinks}>
              {module.links.map((link) => {
                const active = isActive(currentPath, link.href);
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    variant="inherit"
                    className={active ? styles.linkActive : styles.link}
                    aria-current={active ? 'page' : undefined}
                  >
                    {link.icon ? <Icon icon={link.icon} size="sm" /> : null}
                    <Text as="span" size="sm" weight="medium">
                      {link.label}
                    </Text>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
    </aside>
  );
}
