'use client';

import { Input, Select, SelectItem } from '@lunaticwithaduck/webui';
import { type ChangeEvent, useCallback } from 'react';
import { PERIOD_PRESET_LABELS, PERIOD_PRESETS, PERIOD_SELECT_LABELS } from './config/constants';
import styles from './PeriodSelect.styles';
import { type PeriodPreset, type PeriodRange, presetToRange } from './utils/period.utils';

type PeriodSelectProps = {
  value: PeriodPreset;
  range: PeriodRange | null;
  onChange: (preset: PeriodPreset, range: PeriodRange | null) => void;
  label?: string;
};

export default function PeriodSelect({ value, range, onChange, label }: PeriodSelectProps) {
  const handlePresetChange = useCallback(
    (next: string) => {
      const preset = next as PeriodPreset;
      // Non-custom presets resolve to a concrete range immediately; 'custom'
      // resolves to null until the user fills both date inputs below.
      onChange(preset, presetToRange(preset));
    },
    [onChange],
  );

  const handleFromChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange('custom', { from: event.target.value, to: range?.to ?? '' });
    },
    [onChange, range?.to],
  );

  const handleToChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      onChange('custom', { from: range?.from ?? '', to: event.target.value });
    },
    [onChange, range?.from],
  );

  return (
    <div className={styles.root}>
      <div className={styles.preset}>
        <Select
          label={label ?? PERIOD_SELECT_LABELS.periodLabel}
          placeholder={PERIOD_SELECT_LABELS.periodPlaceholder}
          size="sm"
          value={value}
          onValueChange={handlePresetChange}
        >
          {PERIOD_PRESETS.map((preset) => (
            <SelectItem key={preset} value={preset}>
              {PERIOD_PRESET_LABELS[preset]}
            </SelectItem>
          ))}
        </Select>
      </div>

      {value === 'custom' ? (
        <div className={styles.customRange}>
          <div className={styles.customField}>
            <Input
              label={PERIOD_SELECT_LABELS.fromLabel}
              type="date"
              size="sm"
              value={range?.from ?? ''}
              onChange={handleFromChange}
            />
          </div>
          <div className={styles.customField}>
            <Input
              label={PERIOD_SELECT_LABELS.toLabel}
              type="date"
              size="sm"
              value={range?.to ?? ''}
              onChange={handleToChange}
            />
          </div>
        </div>
      ) : null}
    </div>
  );
}
