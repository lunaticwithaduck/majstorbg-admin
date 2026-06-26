import { afterEach, describe, expect, it, vi } from 'vitest';
import { can, canOperate } from './can';
import { PERMISSIONS } from './permissions';

afterEach(() => {
  vi.unstubAllEnvs();
});

describe('canOperate', () => {
  it('honours an explicit NEXT_PUBLIC_ADMIN_CAN_OPERATE=false', () => {
    vi.stubEnv('NEXT_PUBLIC_ADMIN_CAN_OPERATE', 'false');
    expect(canOperate()).toBe(false);
  });

  it('honours an explicit NEXT_PUBLIC_ADMIN_CAN_OPERATE=true even in production', () => {
    vi.stubEnv('NEXT_PUBLIC_ADMIN_CAN_OPERATE', 'true');
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'production');
    expect(canOperate()).toBe(true);
  });

  it('defaults closed in staging/production', () => {
    vi.stubEnv('NEXT_PUBLIC_ADMIN_CAN_OPERATE', '');
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'production');
    expect(canOperate()).toBe(false);
  });

  it('defaults open in development', () => {
    vi.stubEnv('NEXT_PUBLIC_ADMIN_CAN_OPERATE', '');
    vi.stubEnv('NEXT_PUBLIC_APP_ENV', 'development');
    expect(canOperate()).toBe(true);
  });
});

describe('can', () => {
  it('evaluates the role→permission map when a role is known', () => {
    expect(can(PERMISSIONS.disputes, 'support')).toBe(true);
    expect(can(PERMISSIONS.finance, 'support')).toBe(false);
    expect(can(PERMISSIONS.finance, 'finance')).toBe(true);
    expect(can(PERMISSIONS.audit, 'superadmin')).toBe(true);
    expect(can(PERMISSIONS.finance, 'viewer')).toBe(false);
  });

  it('falls back to the interim gate when no role is known', () => {
    vi.stubEnv('NEXT_PUBLIC_ADMIN_CAN_OPERATE', 'true');
    expect(can(PERMISSIONS.disputes)).toBe(true);
    vi.stubEnv('NEXT_PUBLIC_ADMIN_CAN_OPERATE', 'false');
    expect(can(PERMISSIONS.disputes)).toBe(false);
  });
});
