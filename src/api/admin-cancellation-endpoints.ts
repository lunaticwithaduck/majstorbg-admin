// TODO: replace with @lunaticwithaduck/api adminCancellationEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

// ── Summary: GET /admin/reports/cancellations ───────────────────────────────

export type GetCancellationSummaryArgs = {
  from?: string;
  to?: string;
  category?: string;
  cityName?: string;
};

// Cancelled-job counts split by the furthest milestone reached before
// cancellation. Derived BE-side (no status-transition history exists), so the
// three buckets are mutually exclusive and sum to `totals.cancelled`.
export type CancellationByPriorStage = {
  beforeOffers: number;
  afterOffers: number;
  afterAccepted: number;
};

export type CancellationSummary = {
  range: { from: string | null; to: string | null };
  totals: { jobs: number; cancelled: number };
  // cancelled / jobs, in [0, 1]; 0 when jobs === 0.
  cancellationRate: number;
  byPriorStage: CancellationByPriorStage;
};

// ── Stuck list: GET /admin/cancellations/stuck ──────────────────────────────

// Only `open` and `awaiting_confirmation` jobs appear here by definition of
// the stuck rule.
export type StuckJobStatus = 'open' | 'awaiting_confirmation';

export type StuckJobRow = {
  id: string;
  title: string;
  status: StuckJobStatus;
  category: string;
  cityName: string | null;
  ageDays: number;
  createdAt: string;
  scheduledAt: string | null;
  completedAt: string | null;
};

export type ListStuckJobsArgs = {
  page: number;
  pageSize: number;
  search?: string;
  category?: string;
  cityName?: string;
  from?: string;
  to?: string;
  olderThanDays?: number;
  sortBy?: 'createdAt' | 'scheduledAt';
  sortDir?: 'asc' | 'desc';
};

export type ListStuckJobsResponse = {
  items: StuckJobRow[];
  total: number;
  page: number;
  pageSize: number;
};

// Cancellation reports are aggregates / lists over the Job domain — tag with
// API_TAGS.Job and dedicated sentinels so they invalidate alongside other job
// data without colliding with the explorer's 'LIST'.
export const adminCancellationEndpoints = (build: Build) => ({
  getCancellationSummary: build.query<
    CancellationSummary,
    GetCancellationSummaryArgs | void
  >({
    query: (params) => ({
      url: '/admin/reports/cancellations',
      params: params ?? undefined,
    }),
    providesTags: [{ type: API_TAGS.Job, id: 'CANCELLATION_SUMMARY' }],
  }),
  listStuckJobs: build.query<ListStuckJobsResponse, ListStuckJobsArgs>({
    query: (params) => ({ url: '/admin/cancellations/stuck', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((j) => ({ type: API_TAGS.Job, id: j.id })),
            { type: API_TAGS.Job, id: 'STUCK_LIST' },
          ]
        : [{ type: API_TAGS.Job, id: 'STUCK_LIST' }],
  }),
});
