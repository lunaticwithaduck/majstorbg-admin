import { type AdminRole, type Permission, roleCan } from './permissions';

/**
 * Interim operate gate (Module 9 foundation).
 *
 * The BE has not shipped the `admin` role yet, so there is no per-user role to
 * evaluate. Until it does, every state-changing admin action is gated behind a
 * single switch so nothing dangerous is world-open:
 *   - explicit NEXT_PUBLIC_ADMIN_CAN_OPERATE wins ('true' | 'false')
 *   - otherwise: open in development, closed in staging/production
 *
 * Read `process.env` directly (not the zod `@/config/env`) so this stays usable
 * in unit tests without a full env, mirroring `config/feature-flags.ts`. Next
 * inlines literal `process.env.NEXT_PUBLIC_*` accesses at build time.
 */
export function canOperate(): boolean {
  const explicit = process.env.NEXT_PUBLIC_ADMIN_CAN_OPERATE;
  if (explicit === 'true') return true;
  if (explicit === 'false') return false;
  const appEnv = process.env.NEXT_PUBLIC_APP_ENV;
  return appEnv !== 'staging' && appEnv !== 'production';
}

/**
 * Permission check for a module-level action. When the caller knows the actor's
 * role (post-RBAC), it is evaluated against the role→permission map; until then
 * the interim {@link canOperate} gate applies.
 */
export function can(permission: Permission, role?: AdminRole): boolean {
  if (role) return roleCan(role, permission);
  return canOperate();
}
