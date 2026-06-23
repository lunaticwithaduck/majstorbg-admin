'use client';

import { Button, Text } from '@lunaticwithaduck/webui';
import { ArrowDown, ArrowUp, ChevronsUpDown } from 'lucide-react';
import { SORT_HEADER_ICON_SIZE } from './config/constants';
import styles from './SortHeader.styles';

type SortDir = 'asc' | 'desc';

type SortHeaderProps = {
  label: string;
  active: boolean;
  dir: SortDir;
  onToggle: () => void;
};

/**
 * Column header that toggles server-side sort. Renders as a ghost webui Button
 * (never a bare HTML button element) so the whole header is the click target;
 * the arrow reflects the active direction, a neutral chevron when inactive.
 */
export default function SortHeader({ label, active, dir, onToggle }: SortHeaderProps) {
  const Glyph = !active ? ChevronsUpDown : dir === 'asc' ? ArrowUp : ArrowDown;

  return (
    <Button variant="ghost" size="sm" onClick={onToggle} className={styles.root}>
      <Text as="span" size="sm" weight="semibold">
        {label}
      </Text>
      <Glyph size={SORT_HEADER_ICON_SIZE} className={active ? styles.icon : styles.iconMuted} />
    </Button>
  );
}
