// TODO: replace with @lunaticwithaduck/api adminTrafficEndpoints once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type TrafficPoint = { date: string; visitors: number; pageviews: number };
export type TrafficReferrer = { referrer: string; visitors: number; pageviews: number };
export type TrafficPage = { path: string; pageviews: number; uniqueVisitors: number };
export type TrafficDevice = { device: string; visitors: number };

export type TrafficOverview = {
  visitors: number;
  uniqueVisitors: number;
  pageviews: number;
  sessions: number;
  bounceRatePct: number;
  avgDurationSec: number;
  series: TrafficPoint[];
  referrers: TrafficReferrer[];
  pages: TrafficPage[];
  devices: TrafficDevice[];
};

export type GetTrafficArgs = {
  from?: string;
  to?: string;
};

// Read-only traffic stats; reuse the WelcomeStats tag (never invalidated).
// TODO(api-tags): add a `Traffic` tag.
export const adminTrafficEndpoints = (build: Build) => ({
  // BACKEND TODO: GET /admin/analytics/traffic?from=&to= → overview + series +
  //   per-referrer / per-page / per-device breakdowns.
  getTrafficOverview: build.query<TrafficOverview, GetTrafficArgs>({
    query: (params) => ({ url: '/admin/analytics/traffic', params }),
    providesTags: [{ type: API_TAGS.WelcomeStats, id: 'TRAFFIC' }],
  }),
});
