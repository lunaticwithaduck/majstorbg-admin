// TODO: replace with @lunaticwithaduck/api adminMatchSpeedEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

// One speed metric's summary statistics, in MINUTES. `count` is how many jobs
// contributed a sample. median/avg/p90 are null when count === 0 (render a
// dash, never a misleading 0).
export type MatchSpeedStat = {
  median: number | null;
  avg: number | null;
  p90: number | null;
  count: number;
};

export type MatchSpeedRange = {
  from: string | null;
  to: string | null;
};

// One weekly bucket. `bucket` is the UTC-Monday `YYYY-MM-DD` of the job's
// createdAt ISO week. The medians are in minutes (null when the bucket had no
// sample for that metric). `jobs` = jobs posted that week.
export type MatchSpeedSeriesPoint = {
  bucket: string;
  firstBidMedian: number | null;
  awardMedian: number | null;
  jobs: number;
};

// One per-category table row. `jobs` = jobs posted in the category over the
// window; `firstBid`/`award` are that category's speed stat blocks.
export type MatchSpeedCategoryRow = {
  category: string;
  jobs: number;
  firstBid: MatchSpeedStat;
  award: MatchSpeedStat;
};

export type GetMatchSpeedArgs = {
  page: number;
  pageSize: number;
  from?: string;
  to?: string;
  search?: string;
  sortBy?: 'category' | 'jobs' | 'firstBidMedian' | 'awardMedian';
  sortDir?: 'asc' | 'desc';
};

export type MatchSpeedResponse = {
  range: MatchSpeedRange;
  // Headline KPIs over the whole filtered set (not just the current page).
  kpis: {
    firstBid: MatchSpeedStat;
    award: MatchSpeedStat;
  };
  // Weekly medians over the whole filtered set, ascending by bucket.
  series: MatchSpeedSeriesPoint[];
  // The per-category table — paginated + sorted server-side.
  items: MatchSpeedCategoryRow[];
  total: number;
  page: number;
  pageSize: number;
};

export const adminMatchSpeedEndpoints = (build: Build) => ({
  // Single read-only report endpoint. Tags under the Report sentinel so a
  // future invalidation can blow the whole report cache at once. Mirrors
  // adminBidOutcomesEndpoints.
  getMatchSpeed: build.query<MatchSpeedResponse, GetMatchSpeedArgs>({
    query: (params) => ({ url: '/admin/reports/match-speed', params }),
    providesTags: [{ type: API_TAGS.Job, id: 'MATCH_SPEED' }],
  }),
});
