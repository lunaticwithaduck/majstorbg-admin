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
  /**
   * Client-only hint: the reported user's id (the report's `entityId` when it
   * targets a user). NOT sent to the BE — it derives the subject from the report
   * — but lets `suspend`/`ban` bust that user's moderation-status cache.
   */
  targetUserId?: string;
};

export const adminModerationMutations = (build: Build) => ({
  // BACKEND TODO: POST /admin/moderation/reports/:id/action
  //   { action, reason, durationDays? } — `suspend`/`ban` also update the user
  //   state; `remove_content` hides the entity. Actor from session. Emit admin-audit.
  actionReport: build.mutation<ModerationReportRow, ActionReportArgs>({
    // `targetUserId` is a cache-invalidation hint only — strip it from the body.
    query: ({ id, targetUserId: _targetUserId, ...body }) => ({
      url: `/admin/moderation/reports/${encodeURIComponent(id)}/action`,
      method: 'POST',
      data: body,
    }),
    // Refresh the moderation queue, and — when suspend/ban flips the user's
    // account state — that user's moderation status so the UserDetailPanel badge
    // (getUserModerationStatus → `moderation-${userId}`) stops showing "Active".
    invalidatesTags: (_res, _err, arg) => {
      const tags = [
        { type: API_TAGS.AdminUser, id: 'MODERATION_LIST' },
        { type: API_TAGS.AdminUser, id: 'LIST' },
      ];
      if (arg.targetUserId && (arg.action === 'suspend' || arg.action === 'ban')) {
        tags.push({ type: API_TAGS.AdminUser, id: `moderation-${arg.targetUserId}` });
      }
      return tags;
    },
  }),
});
