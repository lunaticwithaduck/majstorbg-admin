'use client';

import { Button, Icon, Text } from '@lunaticwithaduck/webui';
import { ChevronDown } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { NavModule } from '../../config/constants';
import NavLinkItem from './components/NavLinkItem/NavLinkItem';
import styles from './NavModuleSection.styles';

type NavModuleSectionProps = {
  module: NavModule;
  currentPath: string;
  active: boolean;
};

export default function NavModuleSection({ module, currentPath, active }: NavModuleSectionProps) {
  const [override, setOverride] = useState<boolean | null>(null);
  const open = override ?? active;

  useEffect(() => {
    if (active) setOverride(null);
  }, [active]);

  return (
    <section className={styles.module}>
      <Button
        unstyled
        type="button"
        onClick={() => setOverride(!open)}
        aria-expanded={open}
        className={styles.moduleHeader}
      >
        <Icon icon={module.icon} size="sm" />
        <Text as="span" size="xs" weight="semibold" color="muted" className={styles.moduleLabel}>
          {module.label}
        </Text>
        <Icon icon={ChevronDown} size="sm" className={open ? styles.chevronOpen : styles.chevron} />
      </Button>
      {open ? (
        <div className={styles.moduleLinks}>
          {module.groups?.map((group) => (
            <div key={group.label} className={styles.group}>
              <Text as="span" size="xs" weight="medium" color="muted">
                {group.label}
              </Text>
              {group.links.map((link) => (
                <NavLinkItem key={link.href} link={link} currentPath={currentPath} />
              ))}
            </div>
          ))}
          {module.links?.map((link) => (
            <NavLinkItem key={link.href} link={link} currentPath={currentPath} />
          ))}
        </div>
      ) : null}
    </section>
  );
}
