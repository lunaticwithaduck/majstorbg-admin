import { Box, Icon, Text, TextPrice } from '@lunaticwithaduck/webui';
import type { LucideIcon } from 'lucide-react';
import {
  STAT_TILE_DELTA_ICON_SIZE,
  STAT_TILE_DELTA_META,
  STAT_TILE_ICON_SIZE,
  STAT_TILE_PLACEHOLDER,
  STAT_TILE_TONE_ICON_COLOR,
  type StatTileDeltaDirection,
  type StatTileTone,
} from './config/constants';
import styles from './StatTile.styles';

type StatTileProps = {
  label: string;
  value?: string | number | undefined;
  money?: { amount: number; currency?: string | undefined } | undefined;
  delta?: { value: number; direction: StatTileDeltaDirection } | undefined;
  icon?: LucideIcon | undefined;
  tone?: StatTileTone | undefined;
};

export default function StatTile({
  label,
  value,
  money,
  delta,
  icon,
  tone = 'default',
}: StatTileProps) {
  const deltaMeta = delta ? STAT_TILE_DELTA_META[delta.direction] : null;

  return (
    <Box padding="md" radius="lg" className={styles.tone[tone]}>
      <div className={styles.root}>
        <div className={styles.header}>
          <Text as="span" size="sm" color="muted" value={label} />
          {icon ? (
            <Icon icon={icon} size={STAT_TILE_ICON_SIZE} color={STAT_TILE_TONE_ICON_COLOR[tone]} />
          ) : null}
        </div>

        {money ? (
          <TextPrice
            as="span"
            size="2xl"
            weight="semibold"
            className={styles.value}
            amount={money.amount}
            {...(money.currency ? { currency: money.currency } : {})}
          />
        ) : (
          <Text as="span" size="2xl" weight="semibold" className={styles.value}>
            {value ?? STAT_TILE_PLACEHOLDER}
          </Text>
        )}

        {delta && deltaMeta ? (
          <div className={styles.delta}>
            <Icon icon={deltaMeta.icon} size={STAT_TILE_DELTA_ICON_SIZE} color={deltaMeta.color} />
            <Text as="span" size="sm" color={deltaMeta.color}>
              {delta.value}
            </Text>
          </div>
        ) : null}
      </div>
    </Box>
  );
}
