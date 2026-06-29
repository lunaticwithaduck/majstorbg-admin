import { describe, expect, it } from 'vitest';
import { daysUntil, slaTone } from './sla.utils';

const NOW = Date.UTC(2026, 5, 26); // 2026-06-26T00:00:00Z

describe('daysUntil', () => {
  it('counts whole days to the deadline', () => {
    expect(daysUntil('2026-07-01T00:00:00Z', NOW)).toBe(5);
    expect(daysUntil('2026-06-26T00:00:00Z', NOW)).toBe(0);
    expect(daysUntil('2026-06-24T00:00:00Z', NOW)).toBe(-2);
  });

  it('returns NaN for an invalid date', () => {
    expect(Number.isNaN(daysUntil('not-a-date', NOW))).toBe(true);
  });
});

describe('slaTone', () => {
  it('escalates as the deadline nears', () => {
    expect(slaTone(10)).toBe('secondary');
    expect(slaTone(3)).toBe('warning');
    expect(slaTone(0)).toBe('warning');
    expect(slaTone(-1)).toBe('destructive');
    expect(slaTone(Number.NaN)).toBe('destructive');
  });
});
