// TODO: replace with @lunaticwithaduck/api adminPlatformMutations once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';
import type { AdminRole } from '@/auth/permissions';
import type { AdminRow } from './admin-platform-endpoints';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type SetAdminRoleArgs = { id: string; role: AdminRole };

export const adminPlatformMutations = (build: Build) => ({
  // BACKEND TODO: PUT /admin/admins/:id/role { role } — promotes/changes a user's
  //   admin role (creates the admin record if the user wasn't an admin yet).
  //   Emit admin-audit (role change is itself audited).
  setAdminRole: build.mutation<AdminRow, SetAdminRoleArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/admins/${encodeURIComponent(id)}/role`,
      method: 'PUT',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => [
      { type: API_TAGS.AdminUser, id: `admin-${arg.id}` },
      { type: API_TAGS.AdminUser, id: 'ADMIN_LIST' },
      { type: API_TAGS.AdminUser, id: arg.id },
      { type: API_TAGS.AdminUser, id: 'LIST' },
      { type: API_TAGS.Journal, id: 'AUDIT_LIST' },
    ],
  }),
});
