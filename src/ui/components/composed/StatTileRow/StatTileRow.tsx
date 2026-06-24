import type { ReactNode } from 'react';
import {
  STAT_TILE_ROW_DEFAULT_COLUMNS,
  type StatTileRowColumns,
} from './config/constants';
import styles from './StatTileRow.styles';

type StatTileRowProps = {
  children: ReactNode;
  columns?: StatTileRowColumns;
};

export default function StatTileRow({
  children,
  columns = STAT_TILE_ROW_DEFAULT_COLUMNS,
}: StatTileRowProps) {
  return <div className={`${styles.root} ${styles.columns[columns]}`}>{children}</div>;
}
