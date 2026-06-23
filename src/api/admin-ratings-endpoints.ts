// TODO: replace with @lunaticwithaduck/api adminRatingsEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

// One 1..5 star bucket of the worker-as-subject review histogram. Drives the
// donut slices on the summary screen.
export type RatingStarBucket = {
  stars: number;
  count: number;
};

// GET /admin/reports/ratings summary shape. `avgWorkerRating` is the mean of
// worker-as-subject Review.stars over the window; `disputeRate` is the lifetime
// disputes / completed-jobs ratio (0 when there are no completed jobs).
// `starDistribution` always carries all five buckets so the donut is stable.
export type RatingsSummary = {
  avgWorkerRating: number;
  reviewCount: number;
  starDistribution: RatingStarBucket[];
  disputeRate: number;
  totalDisputes: number;
  completedJobs: number;
};

export type GetRatingsSummaryArgs = {
  from?: string;
  to?: string;
};

// GET /admin/ratings/low — one lowest-rated worker row. `workerId` drives the
// drilldown. `avgRating`/`reviewCount` are the worker's windowed
// worker-as-subject aggregates; `disputeCount` is disputes on jobs they bid on.
export type LowRatedWorkerRow = {
  workerId: string;
  name: string;
  avgRating: number;
  reviewCount: number;
  disputeCount: number;
};

export type ListLowRatedWorkersArgs = {
  page: number;
  pageSize: number;
  search?: string;
  from?: string;
  to?: string;
  minReviews?: number;
  maxAvg?: number;
  sortBy?: 'avgRating' | 'reviewCount';
  sortDir?: 'asc' | 'desc';
};

export type ListLowRatedWorkersResponse = {
  items: LowRatedWorkerRow[];
  total: number;
  page: number;
  pageSize: number;
};

export const adminRatingsEndpoints = (build: Build) => ({
  // Ratings are a worker-quality surface; both endpoints tag under `Worker`
  // (no Review/Rating tag exists). The summary uses a 'RATINGS_SUMMARY'
  // sentinel; the list tags individual worker rows + a 'LOW_RATED_LIST'
  // sentinel so a worker mutation can invalidate the queue.
  getRatingsSummary: build.query<RatingsSummary, GetRatingsSummaryArgs>({
    query: (params) => ({ url: '/admin/reports/ratings', params }),
    providesTags: [{ type: API_TAGS.Worker, id: 'RATINGS_SUMMARY' }],
  }),
  listLowRatedWorkers: build.query<
    ListLowRatedWorkersResponse,
    ListLowRatedWorkersArgs
  >({
    query: (params) => ({ url: '/admin/ratings/low', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((w) => ({
              type: API_TAGS.Worker,
              id: w.workerId,
            })),
            { type: API_TAGS.Worker, id: 'LOW_RATED_LIST' },
          ]
        : [{ type: API_TAGS.Worker, id: 'LOW_RATED_LIST' }],
  }),
});
