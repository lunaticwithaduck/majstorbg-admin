import { describe, expect, it } from 'vitest';
import { can } from './can';

describe('can', () => {
  it('returns true (placeholder until auth wiring lands)', () => {
    expect(can('read', 'user')).toBe(true);
  });
});
