/**
 * Admin RBAC permission map (Module 9 foundation).
 *
 * Roles come from the BE `admin` role enum, which has NOT shipped yet (the BE
 * `UserRole` is still `worker | client`). Until it does, `can()` in `./can.ts`
 * falls back to the interim `canOperate` gate. Every operational route, action,
 * and nav entry across modules 1–10 gates on a {@link Permission} via `can()`.
 *
 * Matrix mirrors the spec:
 *   superadmin → everything
 *   finance    → finance (mod 4) + invoices/VAT (mod 7)
 *   support    → disputes (mod 1) + moderation (mod 3)
 *   moderator  → verifications (mod 2) + moderation (mod 3) + reviews (mod 5)
 *   viewer     → reports only
 * Reports stay readable by every operational role.
 */

export const ADMIN_ROLES = ['superadmin', 'finance', 'support', 'moderator', 'viewer'] as const;
export type AdminRole = (typeof ADMIN_ROLES)[number];

export const PERMISSIONS = {
  reports: 'reports',
  disputes: 'disputes',
  verifications: 'verifications',
  moderation: 'moderation',
  reviews: 'reviews',
  finance: 'finance',
  invoices: 'invoices',
  compliance: 'compliance',
  campaigns: 'campaigns',
  promotions: 'promotions',
  admins: 'admins',
  audit: 'audit',
} as const;
export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL_PERMISSIONS = Object.values(PERMISSIONS) as readonly Permission[];

export const ROLE_PERMISSIONS: Record<AdminRole, readonly Permission[]> = {
  superadmin: ALL_PERMISSIONS,
  finance: [PERMISSIONS.reports, PERMISSIONS.finance, PERMISSIONS.invoices, PERMISSIONS.audit],
  support: [PERMISSIONS.reports, PERMISSIONS.disputes, PERMISSIONS.moderation],
  moderator: [
    PERMISSIONS.reports,
    PERMISSIONS.verifications,
    PERMISSIONS.moderation,
    PERMISSIONS.reviews,
  ],
  viewer: [PERMISSIONS.reports],
};

/** Whether a role grants a given permission. */
export function roleCan(role: AdminRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role].includes(permission);
}
