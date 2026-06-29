// TODO: replace with @lunaticwithaduck/api adminReviewsMutations once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type HideReviewArgs = { id: string; reason: string };
export type RemoveReviewArgs = { id: string; reason: string };
export type FlagRingArgs = { workerId: string };

export type RingSignal = 'mutual' | 'burst' | 'reciprocal' | 'velocity';
export type RingParticipant = { userId: string; name: string };
export type RingCluster = {
  id: string;
  signal: RingSignal;
  /** 0–100 confidence that this cluster is a review ring. */
  riskScore: number;
  reviewCount: number;
  participants: RingParticipant[];
};
export type RingGraph = { workerId: string; clusters: RingCluster[] };

// Hiding/removing a review recomputes the worker's rating → bust the ratings
// report tags as well as the reviews list.
const ratingRecomputeTags = (id: string) => [
  { type: API_TAGS.Worker, id: `review-${id}` },
  { type: API_TAGS.Worker, id: 'REVIEW_LIST' },
  { type: API_TAGS.Worker, id: 'RATINGS_SUMMARY' },
  { type: API_TAGS.Worker, id: 'LOW_RATED_LIST' },
];

export const adminReviewsMutations = (build: Build) => ({
  // BACKEND TODO: POST /admin/reviews/:id/hide { reason } — recompute worker rating. Emit admin-audit.
  hideReview: build.mutation<{ id: string }, HideReviewArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/reviews/${encodeURIComponent(id)}/hide`,
      method: 'POST',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => ratingRecomputeTags(arg.id),
  }),
  // BACKEND TODO: DELETE /admin/reviews/:id { reason } — recompute worker rating. Emit admin-audit.
  removeReview: build.mutation<{ id: string }, RemoveReviewArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/reviews/${encodeURIComponent(id)}`,
      method: 'DELETE',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => ratingRecomputeTags(arg.id),
  }),
  // BACKEND TODO: POST /admin/reviews/ring-check { workerId } — returns suspected
  // ring clusters (mutual/burst/reciprocal/velocity). Read-only analysis.
  flagRing: build.mutation<RingGraph, FlagRingArgs>({
    query: (body) => ({ url: '/admin/reviews/ring-check', method: 'POST', data: body }),
  }),
});
