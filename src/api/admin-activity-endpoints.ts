// TODO: replace with @lunaticwithaduck/api adminActivityEndpoints once BE lands.
// Endpoint shape — GET /admin/users/:id/activity?limit? → { events: ActivityEvent[] }.
// `kind` enum is fixed at the type level here so the UI can switch on a closed
// union; mirror it exactly when the real endpoint ships.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  (typeof API_TAGS)[keyof typeof API_TAGS],
  'api'
>;

export type ActivityEventKind =
  | 'job_posted'
  | 'bid_placed'
  | 'message_sent'
  | 'payment'
  | 'review_written'
  | 'review_received';

export type ActivityEvent = {
  id: string;
  kind: ActivityEventKind;
  at: string;
  title: string;
  href?: string;
};

export type GetUserActivityArgs = {
  userId: string;
  limit?: number;
};

export type GetUserActivityResponse = {
  events: ActivityEvent[];
};

export const adminActivityEndpoints = (build: Build) => ({
  getUserActivity: build.query<GetUserActivityResponse, GetUserActivityArgs>({
    query: ({ userId, limit }) => ({
      url: `/admin/users/${encodeURIComponent(userId)}/activity`,
      params: typeof limit === 'number' ? { limit } : undefined,
    }),
    // Until the BE ships, the list arrives empty or errors out — keep the
    // shape stable so the UI can render the "no activity" empty state today.
    transformResponse: (raw: GetUserActivityResponse) => ({
      events: Array.isArray(raw?.events) ? raw.events : [],
    }),
    providesTags: (_res, _err, arg) => [{ type: API_TAGS.AdminUser, id: arg.userId }],
  }),
});
