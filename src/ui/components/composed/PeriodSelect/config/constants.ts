// The preset order doubles as the option order rendered in the Select.
export const PERIOD_PRESETS = [
  'today',
  'last_7d',
  'last_30d',
  'this_month',
  'custom',
] as const;

export const PERIOD_SELECT_LABELS = {
  periodLabel: 'Period',
  periodPlaceholder: 'Select a period',
  fromLabel: 'From',
  toLabel: 'To',
} as const;

// Visible option copy, keyed by preset value. Order is taken from
// PERIOD_PRESETS so adding a preset only needs one new entry here.
export const PERIOD_PRESET_LABELS = {
  today: 'Today',
  last_7d: 'Last 7 days',
  last_30d: 'Last 30 days',
  this_month: 'This month',
  custom: 'Custom range',
} as const;
