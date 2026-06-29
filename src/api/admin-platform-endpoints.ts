// TODO: replace with @lunaticwithaduck/api adminPlatformEndpoints once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';
import type { AdminRole } from '@/auth/permissions';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type AdminRow = {
  id: string;
  name: string;
  email: string;
  role: AdminRole;
  lastActiveAt?: string | null;
};

export type ListAdminsResponse = {
  items: AdminRow[];
};

export type AuditEntry = {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  targetType: string;
  targetId: string;
  reason?: string | null;
  before?: unknown;
  after?: unknown;
  createdAt: string;
};

export type ListAuditArgs = {
  page: number;
  pageSize: number;
  actor?: string;
  action?: string;
  targetType?: string;
  from?: string;
  to?: string;
};

export type ListAuditResponse = {
  items: AuditEntry[];
  total: number;
  page: number;
  pageSize: number;
};

// Admins reuse the AdminUser tag; the audit log reuses Journal.
// TODO(api-tags): add `Admin` / `Audit` tags.
const ADMIN_LIST = 'ADMIN_LIST';
const AUDIT_LIST = 'AUDIT_LIST';

export const adminPlatformEndpoints = (build: Build) => ({
  // BACKEND TODO: GET /admin/admins → staff users with an admin role.
  listAdmins: build.query<ListAdminsResponse, void>({
    query: () => ({ url: '/admin/admins' }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((a) => ({ type: API_TAGS.AdminUser, id: `admin-${a.id}` })),
            { type: API_TAGS.AdminUser, id: ADMIN_LIST },
          ]
        : [{ type: API_TAGS.AdminUser, id: ADMIN_LIST }],
  }),
  // BACKEND TODO: GET /admin/audit?actor=&action=&targetType=&from=&to=&page=&pageSize=
  listAudit: build.query<ListAuditResponse, ListAuditArgs>({
    query: (params) => ({ url: '/admin/audit', params }),
    providesTags: [{ type: API_TAGS.Journal, id: AUDIT_LIST }],
  }),
});
