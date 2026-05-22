// TODO: replace with @lunaticwithaduck/api adminUserMutations once BE lands.
// Mirrors the Build/EndpointBuilder pattern used by `adminUserEndpoints` in
// `@lunaticwithaduck/api` so the surface is drop-in when the real mutations
// ship. Endpoints are POST /admin/users, PATCH /admin/users/:id,
// DELETE /admin/users/:id; all of them invalidate the AdminUser list and
// the specific user record so the table + detail panel refetch on success.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  (typeof API_TAGS)[keyof typeof API_TAGS],
  'api'
>;

export type AdminUserMutationRole = 'worker' | 'client';

export type CreateAdminUserInput = {
  name: string;
  email: string;
  role: AdminUserMutationRole;
  phone?: string | null;
};

export type UpdateAdminUserInput = {
  id: string;
  name: string;
  email: string;
  role: AdminUserMutationRole;
  phone?: string | null;
};

export type AdminUserMutationResult = {
  id: string;
  email: string;
  name: string;
  role: AdminUserMutationRole;
  phone: string | null;
};

export const adminUserMutations = (build: Build) => ({
  createAdminUser: build.mutation<AdminUserMutationResult, CreateAdminUserInput>({
    query: (body) => ({ url: '/admin/users', method: 'POST', data: body }),
    invalidatesTags: [{ type: API_TAGS.AdminUser, id: 'LIST' }],
  }),
  updateAdminUser: build.mutation<AdminUserMutationResult, UpdateAdminUserInput>({
    query: ({ id, ...body }) => ({
      url: `/admin/users/${encodeURIComponent(id)}`,
      method: 'PATCH',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => [
      { type: API_TAGS.AdminUser, id: arg.id },
      { type: API_TAGS.AdminUser, id: 'LIST' },
    ],
  }),
  deleteAdminUser: build.mutation<{ id: string }, string>({
    query: (id) => ({
      url: `/admin/users/${encodeURIComponent(id)}`,
      method: 'DELETE',
    }),
    invalidatesTags: (_res, _err, id) => [
      { type: API_TAGS.AdminUser, id },
      { type: API_TAGS.AdminUser, id: 'LIST' },
    ],
  }),
});
