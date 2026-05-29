// TODO: replace with @lunaticwithaduck/api adminJobMutations once BE lands.
// Mirrors the Build/EndpointBuilder recipe used by `adminUserMutations`.
// Endpoints are POST /admin/jobs, PATCH /admin/jobs/:id,
// DELETE /admin/jobs/:id; each invalidates the Job list and the specific
// job record so the explorer + detail panel refetch on success.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';
import type {
  AdminJobBudget,
  AdminJobDetail,
  AdminJobStatus,
} from './admin-job-endpoints';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type CreateAdminJobInput = {
  title: string;
  category: string;
  description: string;
  status: AdminJobStatus;
  budget: AdminJobBudget;
  city: string | null;
  clientId: string;
  clientName: string;
};

export type UpdateAdminJobInput = CreateAdminJobInput & { id: string };

export const adminJobMutations = (build: Build) => ({
  createAdminJob: build.mutation<AdminJobDetail, CreateAdminJobInput>({
    query: (body) => ({ url: '/admin/jobs', method: 'POST', data: body }),
    invalidatesTags: [{ type: API_TAGS.Job, id: 'LIST' }],
  }),
  updateAdminJob: build.mutation<AdminJobDetail, UpdateAdminJobInput>({
    query: ({ id, ...body }) => ({
      url: `/admin/jobs/${encodeURIComponent(id)}`,
      method: 'PATCH',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => [
      { type: API_TAGS.Job, id: arg.id },
      { type: API_TAGS.Job, id: 'LIST' },
    ],
  }),
  deleteAdminJob: build.mutation<{ id: string }, string>({
    query: (id) => ({
      url: `/admin/jobs/${encodeURIComponent(id)}`,
      method: 'DELETE',
    }),
    invalidatesTags: (_res, _err, id) => [
      { type: API_TAGS.Job, id },
      { type: API_TAGS.Job, id: 'LIST' },
    ],
  }),
});
