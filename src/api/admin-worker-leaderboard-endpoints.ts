// TODO: replace with @lunaticwithaduck/api adminWorkerLeaderboardEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type WorkerLeaderboardSortKey =
  | 'completedJobs'
  | 'avgRating'
  | 'acceptedBids'
  | 'acceptedValue'
  | 'name';

export type WorkerLeaderboardRow = {
  id: string;
  name: string;
  email: string;
  completedJobs: number;
  // null when the worker has no reviews yet — stars are the only persisted
  // rating signal, so an unrated worker has no average.
  avgRating: number | null;
  reviewCount: number;
  acceptedBids: number;
  // Native sum of the worker's accepted-bid amounts (bids default to BGN).
  // Currency is unnormalized platform-wide; never sum across `currency`.
  acceptedValue: number;
  currency: string;
};

export type ListWorkerLeaderboardArgs = {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: WorkerLeaderboardSortKey;
  sortDir?: 'asc' | 'desc';
  // Half-open [from, to) window anchored on the accepted-bid timestamp
  // (Bid.acceptedAt) — scopes the accepted-bid metrics.
  from?: string;
  to?: string;
};

export type ListWorkerLeaderboardResponse = {
  items: WorkerLeaderboardRow[];
  total: number;
  page: number;
  pageSize: number;
};

export const adminWorkerLeaderboardEndpoints = (build: Build) => ({
  // Leaderboard rows aggregate over the Worker domain — use the Worker tag
  // with a 'LEADERBOARD' sentinel (no per-row invalidation needed; this is a
  // read-only report surface).
  listWorkerLeaderboard: build.query<
    ListWorkerLeaderboardResponse,
    ListWorkerLeaderboardArgs
  >({
    query: (params) => ({ url: '/admin/worker-leaderboard', params }),
    providesTags: [{ type: API_TAGS.Worker, id: 'LEADERBOARD' }],
  }),
});
