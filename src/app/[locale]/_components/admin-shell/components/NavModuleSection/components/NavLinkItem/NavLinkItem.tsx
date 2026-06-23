'use client';

import { Icon, Link, Text } from '@lunaticwithaduck/webui';
import type { NavLink } from '../../../../config/constants';
import { isActive } from '../../../../utils/nav.utils';
import styles from './NavLinkItem.styles';

type NavLinkItemProps = {
  link: NavLink;
  currentPath: string;
};

export default function NavLinkItem({ link, currentPath }: NavLinkItemProps) {
  const active = isActive(currentPath, link.href);

  return (
    <Link
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
}
