import { describe, expect, it } from 'vitest';
import { EMPTY_VALUE, formatDate, formatDateTime, formatEur } from './format.utils';

describe('formatEur', () => {
  it('formats integer cents as € with bg-BG grouping', () => {
    // bg-BG groups thousands and uses a comma decimal; assert structure not exact glyphs.
    const out = formatEur(123_456);
    expect(out.startsWith('€')).toBe(true);
    expect(out).toContain('1');
    expect(out).toContain(',');
    expect(formatEur(0)).toBe('€0,00');
  });

  it('returns the empty marker for nullish or non-finite input', () => {
    expect(formatEur(null)).toBe(EMPTY_VALUE);
    expect(formatEur(undefined)).toBe(EMPTY_VALUE);
    expect(formatEur(Number.NaN)).toBe(EMPTY_VALUE);
    expect(formatEur(Number.POSITIVE_INFINITY)).toBe(EMPTY_VALUE);
  });
});

describe('formatDate / formatDateTime', () => {
  it('returns the empty marker for missing or invalid input', () => {
    expect(formatDate(null)).toBe(EMPTY_VALUE);
    expect(formatDate('not-a-date')).toBe(EMPTY_VALUE);
    expect(formatDateTime(undefined)).toBe(EMPTY_VALUE);
  });

  it('formats a valid ISO string', () => {
    expect(formatDate('2026-06-26T10:30:00Z')).not.toBe(EMPTY_VALUE);
    expect(formatDateTime('2026-06-26T10:30:00Z')).not.toBe(EMPTY_VALUE);
  });
});
