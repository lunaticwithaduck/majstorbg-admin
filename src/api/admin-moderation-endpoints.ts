// TODO: replace with @lunaticwithaduck/api adminModerationEndpoints once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

// Actual type of the reported thing.
export type ReportEntityType = 'user' | 'photo' | 'review' | 'chat';

// Queue tab / filter value. `content` groups photo + chat.
// BACKEND TODO: GET /admin/moderation/reports?type=user|content|review — `content`
// returns both photo and chat reports.
export type ReportTab = 'user' | 'content' | 'review';

export type ReportStatus = 'open' | 'actioned' | 'dismissed';

export type ModerationReportRow = {
  id: string;
  entityType: ReportEntityType;
  entityId: string;
  /** Display name of the reported subject (user / worker / review author). */
  subjectName: string;
  /** Compact preview — review/chat text, photo caption, or URL. */
  excerpt?: string | null;
  reporterName: string;
  reason: string;
  status: ReportStatus;
  createdAt: string;
};

export type ListReportsArgs = {
  page: number;
  pageSize: number;
  type: ReportTab;
  status?: ReportStatus;
};

export type ListReportsResponse = {
  items: ModerationReportRow[];
  total: number;
  page: number;
  pageSize: number;
};

// Moderation status of a user — drives the UserDetailPanel controls.
export type UserModerationState = 'active' | 'suspended' | 'banned';

export type UserModerationStatus = {
  status: UserModerationState;
  until?: string | null;
  reason?: string | null;
};

// Moderation has no dedicated API tag yet; reuse the user-centric AdminUser tag
// with namespaced ids. TODO(api-tags): add a `Moderation` tag.
const MODERATION_LIST = 'MODERATION_LIST';

export const adminModerationEndpoints = (build: Build) => ({
  // BACKEND TODO: GET /admin/moderation/reports?type=&status=&page=&pageSize=
  listReports: build.query<ListReportsResponse, ListReportsArgs>({
    query: (params) => ({ url: '/admin/moderation/reports', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((r) => ({ type: API_TAGS.AdminUser, id: `report-${r.id}` })),
            { type: API_TAGS.AdminUser, id: MODERATION_LIST },
          ]
        : [{ type: API_TAGS.AdminUser, id: MODERATION_LIST }],
  }),
  // BACKEND TODO: GET /admin/moderation/reports/:id
  getReport: build.query<ModerationReportRow, string>({
    query: (id) => ({ url: `/admin/moderation/reports/${encodeURIComponent(id)}` }),
    providesTags: (_res, _err, id) => [{ type: API_TAGS.AdminUser, id: `report-${id}` }],
  }),
  // BACKEND TODO: GET /admin/users/:id/moderation → { status, until?, reason? }
  getUserModerationStatus: build.query<UserModerationStatus, string>({
    query: (userId) => ({ url: `/admin/users/${encodeURIComponent(userId)}/moderation` }),
    providesTags: (_res, _err, userId) => [
      { type: API_TAGS.AdminUser, id: `moderation-${userId}` },
    ],
  }),
});
