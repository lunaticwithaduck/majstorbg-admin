// TODO: replace with @lunaticwithaduck/api adminEngagementEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

// Mirrors the BE shape from
// majstorbg-backend/src/modules/admin-engagement-reports/dto/engagement-report.response.dto.ts

export type EngagementMessageType = 'text' | 'system_milestone';

export type EngagementActiveUsers = {
  last24h: number;
  last7d: number;
  last30d: number;
};

export type EngagementUnread = {
  total: number;
  unread: number;
  rate: number;
};

export type EngagementKpis = {
  activeUsers: EngagementActiveUsers;
  unread: EngagementUnread;
  messagesInPeriod: number;
};

export type EngagementActiveUsersByDayPoint = {
  date: string;
  count: number;
};

export type EngagementMessageRow = {
  id: string;
  bidId: string;
  jobId: string;
  jobTitle: string;
  senderId: string;
  senderName: string;
  type: EngagementMessageType;
  preview: string;
  sentAt: string;
  read: boolean;
};

export type EngagementMessagesPage = {
  items: EngagementMessageRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type GetEngagementReportArgs = {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: 'sentAt';
  sortDir?: 'asc' | 'desc';
  from?: string;
  to?: string;
};

export type GetEngagementReportResponse = {
  kpis: EngagementKpis;
  activeUsersByDay: EngagementActiveUsersByDayPoint[];
  messages: EngagementMessagesPage;
  range: { from: string | null; to: string | null };
};

export const adminEngagementEndpoints = (build: Build) => ({
  // The engagement report is a single endpoint returning KPIs + trend series +
  // a paginated messages page. It spans the user/notification/message domains,
  // so it tags both AdminUser (presence/unread snapshot, a singleton) and
  // Messages (the paginated list) under an 'ENGAGEMENT' sentinel.
  getEngagementReport: build.query<
    GetEngagementReportResponse,
    GetEngagementReportArgs
  >({
    query: (params) => ({ url: '/admin/reports/engagement', params }),
    providesTags: [
      { type: API_TAGS.AdminUser, id: 'ENGAGEMENT' },
      { type: API_TAGS.Messages, id: 'ENGAGEMENT' },
    ],
  }),
});
