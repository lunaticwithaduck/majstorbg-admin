// TODO: replace with @lunaticwithaduck/api adminReportsEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type UserRole = 'worker' | 'client';

export type UserDirectorySummary = {
  total: number;
  workers: number;
  clients: number;
  verifiedWorkers: number;
  onboarded: number;
};

export type GetUserDirectorySummaryArgs = {
  from?: string;
  to?: string;
};

export type UserDirectoryRow = {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  phone: string | null;
  emailVerified: boolean;
  phoneVerifiedAt: string | null;
  onboardingCompletedAt: string | null;
  createdAt: string;
  verified: boolean;
  lastActiveAt: string | null;
};

export type ListUserDirectoryArgs = {
  page: number;
  pageSize: number;
  role?: UserRole;
  search?: string;
  verified?: boolean;
  emailVerified?: boolean;
  lastActiveSince?: string;
  sortBy?: 'createdAt' | 'lastActiveAt' | 'name' | 'email';
  sortDir?: 'asc' | 'desc';
};

export type ListUserDirectoryResponse = {
  items: UserDirectoryRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type JobUrgency = 'WITHIN_24H' | 'THIS_WEEK' | 'FLEXIBLE';

export type GetJobsFunnelArgs = {
  from?: string;
  to?: string;
  category?: string;
  cityName?: string;
  urgency?: JobUrgency;
  period?: 'day' | 'week' | 'month';
};

export type JobsFunnelSeriesPoint = {
  period: string;
  posted: number;
  withOffers: number;
  accepted: number;
  completed: number;
  cancelled: number;
};

export type GetJobsFunnelResponse = {
  range: { from: string | null; to: string | null };
  totals: {
    posted: number;
    withOffers: number;
    accepted: number;
    completed: number;
    cancelled: number;
    noOffer: number;
  };
  rates: {
    offerRate: number;
    awardRate: number;
    completionRate: number;
    cancellationRate: number;
    noOfferRate: number;
  };
  byStatus: {
    open: number;
    accepted: number;
    in_progress: number;
    awaiting_confirmation: number;
    completed: number;
    cancelled: number;
  };
  series?: JobsFunnelSeriesPoint[];
};

export type GetJobsFunnelBreakdownArgs = {
  from?: string;
  to?: string;
  by?: 'category' | 'cityName' | 'urgency';
};

export type JobsFunnelBreakdownItem = {
  key: string;
  posted: number;
  withOffers: number;
  completed: number;
  completionRate: number;
};

export type GetJobsFunnelBreakdownResponse = {
  items: JobsFunnelBreakdownItem[];
  total: number;
};

export const adminReportsEndpoints = (build: Build) => ({
  // User directory reports reuse the AdminUser tag (same domain as the existing
  // admin users + activity endpoints) — summary is a singleton 'SUMMARY' sentinel.
  getUserDirectorySummary: build.query<
    UserDirectorySummary,
    GetUserDirectorySummaryArgs | void
  >({
    query: (params) => ({
      url: '/admin/reports/users-summary',
      params: params ?? undefined,
    }),
    providesTags: [{ type: API_TAGS.AdminUser, id: 'SUMMARY' }],
  }),
  listUserDirectory: build.query<ListUserDirectoryResponse, ListUserDirectoryArgs>({
    query: (params) => ({ url: '/admin/users', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((u) => ({ type: API_TAGS.AdminUser, id: u.id })),
            { type: API_TAGS.AdminUser, id: 'LIST' },
          ]
        : [{ type: API_TAGS.AdminUser, id: 'LIST' }],
  }),
  // Jobs-funnel reports are aggregates over the Job domain — use the Job tag.
  getJobsFunnel: build.query<GetJobsFunnelResponse, GetJobsFunnelArgs | void>({
    query: (params) => ({
      url: '/admin/reports/jobs-funnel',
      params: params ?? undefined,
    }),
    providesTags: [{ type: API_TAGS.Job, id: 'FUNNEL' }],
  }),
  getJobsFunnelBreakdown: build.query<
    GetJobsFunnelBreakdownResponse,
    GetJobsFunnelBreakdownArgs | void
  >({
    query: (params) => ({
      url: '/admin/reports/jobs-funnel/breakdown',
      params: params ?? undefined,
    }),
    providesTags: [{ type: API_TAGS.Job, id: 'FUNNEL_BREAKDOWN' }],
  }),
});
