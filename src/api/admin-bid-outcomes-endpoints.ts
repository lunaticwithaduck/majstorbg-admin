// TODO: replace with @lunaticwithaduck/api adminBidOutcomesEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

// Optional half-open [from, to) window on Bid.createdAt (date-only ISO
// yyyy-mm-dd). Both omitted -> report over every bid.
export type GetBidOutcomesArgs = {
  from?: string;
  to?: string;
};

// Window-wide status mix + rates (KPI tiles + donut). `winRate` /
// `withdrawalRate` are 0..1 fractions (accepted/total and withdrawn/total
// respectively), 0-guarded BE-side.
export type BidOutcomesOverall = {
  pending: number;
  accepted: number;
  rejected: number;
  withdrawn: number;
  total: number;
  winRate: number;
  withdrawalRate: number;
};

// One per-category breakdown row. A bid inherits the category of the job it was
// placed on. `total` counts every bid in the category (pending included), so
// `winRate` (accepted/total) shares the overall denominator semantics.
export type BidOutcomesByCategory = {
  category: string;
  accepted: number;
  rejected: number;
  withdrawn: number;
  total: number;
  winRate: number;
};

export type GetBidOutcomesResponse = {
  overall: BidOutcomesOverall;
  byCategory: BidOutcomesByCategory[];
};

// Bid outcomes is an aggregate over the Bid (+ Job) domain — tag with the Bid
// tag under a dedicated 'BID_OUTCOMES' sentinel so a future bid mutation can
// invalidate it. Args are optional: the screen calls it with a period window,
// but a bare call reports over all bids.
export const adminBidOutcomesEndpoints = (build: Build) => ({
  // Key `getBidOutcomes` -> RTK generates `useGetBidOutcomesQuery`, which is the
  // hook store.ts re-exports.
  getBidOutcomes: build.query<GetBidOutcomesResponse, GetBidOutcomesArgs | void>({
    query: (params) => ({
      url: '/admin/reports/bid-outcomes',
      params: params ?? undefined,
    }),
    providesTags: [{ type: API_TAGS.Bid, id: 'BID_OUTCOMES' }],
  }),
});
