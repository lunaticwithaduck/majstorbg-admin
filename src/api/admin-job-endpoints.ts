// TODO: replace with @lunaticwithaduck/api adminJobsEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

/** Status taxonomy used by the admin Jobs explorer. Mirrors the consumer
 *  `jobStatus` values (`open | matched | in-progress | completed | cancelled`)
 *  but is admin-facing only — keep here until the BE lands an admin schema. */
export type AdminJobStatus = 'open' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';

export type AdminJobBudgetType = 'fixed' | 'hourly' | 'open';

export type AdminJobBudget = {
  amount: number;
  currency: string;
  type: AdminJobBudgetType;
};

export type AdminJobListItem = {
  id: string;
  title: string;
  category: string;
  status: AdminJobStatus;
  clientName: string;
  budget: AdminJobBudget;
  city: string | null;
  createdAt: string;
};

export type AdminJobBid = {
  id: string;
  workerId: string;
  workerName: string;
  amount: number;
  currency: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'withdrawn';
};

export type AdminJobEscrow = {
  status: 'none' | 'pending' | 'funded' | 'released' | 'refunded' | 'disputed';
  amount: number | null;
  currency: string | null;
  fundedAt: string | null;
  releasedAt: string | null;
};

export type AdminJobDetail = AdminJobListItem & {
  description: string;
  clientId: string;
  bids: AdminJobBid[];
  escrow: AdminJobEscrow;
};

export type ListAdminJobsArgs = {
  page: number;
  pageSize: number;
  status?: AdminJobStatus;
  search?: string;
};

export type ListAdminJobsResponse = {
  page: number;
  pageSize: number;
  items: AdminJobListItem[];
  total: number;
};

export const adminJobEndpoints = (build: Build) => ({
  listAdminJobs: build.query<ListAdminJobsResponse, ListAdminJobsArgs | void>({
    query: (params) => ({ url: '/admin/jobs', params: params ?? undefined }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((j) => ({ type: API_TAGS.Job, id: j.id })),
            { type: API_TAGS.Job, id: 'LIST' },
          ]
        : [{ type: API_TAGS.Job, id: 'LIST' }],
  }),
  getAdminJob: build.query<AdminJobDetail, string>({
    query: (jobId) => ({ url: `/admin/jobs/${encodeURIComponent(jobId)}` }),
    // Bids list arrives empty until the BE wires the relation — keep the shape
    // stable so the UI can render the "no bids" empty state today.
    transformResponse: (raw: AdminJobDetail) => ({
      ...raw,
      bids: Array.isArray(raw?.bids) ? raw.bids : [],
    }),
    providesTags: (_res, _err, jobId) => [{ type: API_TAGS.Job, id: jobId }],
  }),
});
