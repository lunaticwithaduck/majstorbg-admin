// TODO: replace with @lunaticwithaduck/api adminLiquidityEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type LiquidityGroupBy = 'category' | 'city';

export type LiquiditySortBy =
  | 'jobs'
  | 'avgBids'
  | 'withBidsPct'
  | 'with3PlusPct'
  | 'avgBidAmount';

export type GetLiquidityArgs = {
  page: number;
  pageSize: number;
  groupBy?: LiquidityGroupBy;
  search?: string;
  sortBy?: LiquiditySortBy;
  sortDir?: 'asc' | 'desc';
  // Half-open [from, to) window on Job.createdAt (date-only ISO yyyy-mm-dd).
  from?: string;
  to?: string;
};

// One aggregated liquidity row. `avgBids` is bids/job; `withBidsPct` /
// `with3PlusPct` are 0..1 fractions; `avgBidAmount` is the native-currency
// mean (see `currency` / `mixedCurrency` — never sum across rows).
export type LiquidityRow = {
  key: string;
  category: string;
  city: string | null;
  jobs: number;
  bids: number;
  avgBids: number;
  withBidsPct: number;
  with3PlusPct: number;
  avgBidAmount: number;
  currency: string;
  mixedCurrency: boolean;
};

export type LiquiditySummary = {
  groups: number;
  jobs: number;
  bids: number;
  avgBids: number;
  withBidsPct: number;
  with3PlusPct: number;
};

export type LiquidityByCategory = {
  category: string;
  jobs: number;
  avgBids: number;
};

export type GetLiquidityResponse = {
  items: LiquidityRow[];
  total: number;
  page: number;
  pageSize: number;
  summary: LiquiditySummary;
  byCategory: LiquidityByCategory[];
};

export const adminLiquidityEndpoints = (build: Build) => ({
  // Liquidity is an aggregate over the Job (+ Bid) domain — tag with the Job
  // tag under a dedicated 'LIQUIDITY' sentinel, mirroring the jobs-funnel
  // 'FUNNEL' sentinel so job mutations elsewhere can invalidate it later.
  getLiquidity: build.query<GetLiquidityResponse, GetLiquidityArgs>({
    query: (params) => ({ url: '/admin/reports/liquidity', params }),
    providesTags: [{ type: API_TAGS.Job, id: 'LIQUIDITY' }],
  }),
});
