// TODO: replace with @lunaticwithaduck/api adminModerationMutations once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';
import type { ModerationReportRow } from './admin-moderation-endpoints';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type ModerationActionKind = 'dismiss' | 'remove_content' | 'warn' | 'suspend' | 'ban';

export type ActionReportArgs = {
  id: string;
  action: ModerationActionKind;
  reason: string;
  /** Only for `suspend` — days the suspension lasts (omitted = indefinite). */
  durationDays?: number;
};

export const adminModerationMutations = (build: Build) => ({
  // BACKEND TODO: POST /admin/moderation/reports/:id/action
  //   { action, reason, durationDays? } — `suspend`/`ban` also update the user
  //   state; `remove_content` hides the entity. Actor from session. Emit admin-audit.
  actionReport: build.mutation<ModerationReportRow, ActionReportArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/moderation/reports/${encodeURIComponent(id)}/action`,
      method: 'POST',
      data: body,
    }),
    // Refresh the whole moderation queue + any user moderation status it touched.
    invalidatesTags: [
      { type: API_TAGS.AdminUser, id: 'MODERATION_LIST' },
      { type: API_TAGS.AdminUser, id: 'LIST' },
    ],
  }),
});
