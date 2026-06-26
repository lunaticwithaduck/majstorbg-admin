import { describe, expect, it } from 'vitest';
import { amountToCents, isAmountWithinCap } from './resolution.utils';

describe('amountToCents', () => {
  it('parses euros (dot or comma decimal) to integer cents', () => {
    expect(amountToCents('12.34')).toBe(1234);
    expect(amountToCents('12,34')).toBe(1234);
    expect(amountToCents('250')).toBe(25_000);
    expect(amountToCents('0')).toBe(0);
  });

  it('returns NaN for empty or non-numeric input', () => {
    expect(Number.isNaN(amountToCents(''))).toBe(true);
    expect(Number.isNaN(amountToCents('abc'))).toBe(true);
  });
});

describe('isAmountWithinCap', () => {
  it('accepts amounts in (0, cap]', () => {
    expect(isAmountWithinCap(1000, 2000)).toBe(true);
    expect(isAmountWithinCap(2000, 2000)).toBe(true);
  });

  it('rejects zero, negative, over-cap, and NaN', () => {
    expect(isAmountWithinCap(0, 2000)).toBe(false);
    expect(isAmountWithinCap(-5, 2000)).toBe(false);
    expect(isAmountWithinCap(2001, 2000)).toBe(false);
    expect(isAmountWithinCap(Number.NaN, 2000)).toBe(false);
  });
});
