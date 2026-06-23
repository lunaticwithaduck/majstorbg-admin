'use client';

import type { ReactNode } from 'react';
import PeriodSelect from '../PeriodSelect/PeriodSelect';
import type { PeriodPreset, PeriodRange } from '../PeriodSelect/utils/period.utils';
import { REPORT_FILTERS_LABELS } from './config/constants';
import styles from './ReportFilters.styles';

type ReportFiltersProps = {
  period: {
    value: PeriodPreset;
    range: PeriodRange | null;
    onChange: (preset: PeriodPreset, range: PeriodRange | null) => void;
  };
  children?: ReactNode;
};

export default function ReportFilters({ period, children }: ReportFiltersProps) {
  return (
    <div className={styles.root}>
      <PeriodSelect
        label={REPORT_FILTERS_LABELS.periodLabel}
        value={period.value}
        range={period.range}
        onChange={period.onChange}
      />
      {children ? <div className={styles.slots}>{children}</div> : null}
    </div>
  );
}
