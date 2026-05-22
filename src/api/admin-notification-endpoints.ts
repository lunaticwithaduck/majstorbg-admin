// TODO: replace with @lunaticwithaduck/api adminNotificationEndpoints once BE lands.
// Mirrors the Build/EndpointBuilder pattern used by `notificationEndpoints` in
// `@lunaticwithaduck/api`. The consumer-side endpoints are me-namespaced
// (`GET /me/notifications`) — these admin-facing endpoints reach across users
// and add a test-send mutation. Target wire shapes:
//   GET  /admin/notifications?userId&page&pageSize  → paginated list
//   POST /admin/notifications/test                  → fire one notification
// Kinds match the BE Prisma enum (`NotificationKind`).
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

/** Kinds the BE supports today (Prisma `NotificationKind` enum). Kept
 *  underscore-cased to match the BE serialization — the consumer
 *  `notificationEndpoints` exposes kebab-case strings, but admin-facing
 *  payloads stay on the raw enum until the BE settles on a canonical wire
 *  format. */
export const ADMIN_NOTIFICATION_KINDS = [
  'bid',
  'accepted',
  'message',
  'arriving',
  'review',
  'escrow_released',
  'milestone_alert',
  'system_info',
] as const;
export type AdminNotificationKind = (typeof ADMIN_NOTIFICATION_KINDS)[number];

export type AdminNotificationListItem = {
  id: string;
  userId: string;
  userName: string | null;
  kind: AdminNotificationKind;
  payload: Record<string, unknown> | null;
  createdAt: string;
  readAt: string | null;
};

export type ListAdminNotificationsArgs = {
  page: number;
  pageSize: number;
  userId?: string;
};

export type ListAdminNotificationsResponse = {
  page: number;
  pageSize: number;
  items: AdminNotificationListItem[];
  total: number;
};

export type SendTestNotificationInput = {
  userId: string;
  kind: AdminNotificationKind;
  payload?: Record<string, unknown> | null;
};

export type SendTestNotificationResult = {
  id: string;
  userId: string;
  kind: AdminNotificationKind;
  createdAt: string;
};

export const adminNotificationEndpoints = (build: Build) => ({
  listAdminNotifications: build.query<
    ListAdminNotificationsResponse,
    ListAdminNotificationsArgs | void
  >({
    query: (params) => ({ url: '/admin/notifications', params: params ?? undefined }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((n) => ({ type: API_TAGS.Notification, id: n.id })),
            { type: API_TAGS.Notification, id: 'LIST' },
          ]
        : [{ type: API_TAGS.Notification, id: 'LIST' }],
  }),
  sendTestNotification: build.mutation<SendTestNotificationResult, SendTestNotificationInput>({
    query: (body) => ({ url: '/admin/notifications/test', method: 'POST', data: body }),
    invalidatesTags: [{ type: API_TAGS.Notification, id: 'LIST' }],
  }),
});
