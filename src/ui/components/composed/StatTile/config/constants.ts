import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export const STAT_TILE_ICON_SIZE = 'sm' as const;
export const STAT_TILE_DELTA_ICON_SIZE = 'xs' as const;

export const STAT_TILE_PLACEHOLDER = '—';

export type StatTileTone = 'default' | 'success' | 'warning' | 'destructive';
export type StatTileDeltaDirection = 'up' | 'down' | 'flat';

// Icon color token applied to the accent icon, per tone. `current` lets the
// default tone inherit the surrounding muted text color.
export const STAT_TILE_TONE_ICON_COLOR = {
  default: 'muted',
  success: 'success',
  warning: 'warning',
  destructive: 'destructive',
} as const;

// Delta direction → arrow icon + the Text/Icon color token. 'flat' is neutral.
export const STAT_TILE_DELTA_META = {
  up: { icon: ArrowUpRight as LucideIcon, color: 'success' },
  down: { icon: ArrowDownRight as LucideIcon, color: 'destructive' },
  flat: { icon: Minus as LucideIcon, color: 'muted' },
} as const;
