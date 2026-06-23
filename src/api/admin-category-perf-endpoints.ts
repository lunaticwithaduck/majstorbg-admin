// TODO: replace with @lunaticwithaduck/api once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

// Server-side sort keys accepted by GET /admin/reports/categories. Mirror the
// BE `SORTABLE_CATEGORY_KEYS` enum exactly.
export type CategoryPerfSortKey =
  | 'category'
  | 'jobsPosted'
  | 'completionRate'
  | 'avgAcceptedBid'
  | 'avgRating'
  | 'workerCoverage';

export type CategoryPerfSortDir = 'asc' | 'desc';

// One per distinct Job.category in the window. Mirrors the BE
// `categoryPerfRowSchema`. `avgAcceptedBid` / `avgAcceptedBidCurrency` /
// `avgRating` are null when the category has nothing to average. Currency is
// native (unnormalised) — never summed across categories.
export type CategoryPerfRow = {
  category: string;
  jobsPosted: number;
  completed: number;
  completionRate: number;
  avgAcceptedBid: number | null;
  avgAcceptedBidCurrency: string | null;
  avgRating: number | null;
  workerCoverage: number;
};

export type ListCategoryPerfArgs = {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: CategoryPerfSortKey;
  sortDir?: CategoryPerfSortDir;
  // ISO date(-time) bounds on Job.createdAt (half-open [from, to) window).
  from?: string;
  to?: string;
};

export type ListCategoryPerfResponse = {
  items: CategoryPerfRow[];
  total: number;
  page: number;
  pageSize: number;
};

export const adminCategoryPerfEndpoints = (build: Build) => ({
  // Derived read over jobs/bids/reviews, so it tags API_TAGS.Job (mirrors how
  // the jobs-funnel report tags) under a dedicated CATEGORY_PERF sentinel so a
  // job mutation refreshes it without coupling to the jobs-explorer LIST cache.
  listCategoryPerf: build.query<ListCategoryPerfResponse, ListCategoryPerfArgs>({
    query: (params) => ({ url: '/admin/reports/categories', params }),
    providesTags: [{ type: API_TAGS.Job, id: 'CATEGORY_PERF' }],
  }),
});
