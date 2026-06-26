import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';
import type { DisputeDetail } from './admin-disputes-endpoints';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type DisputeOutcome = 'refund_client' | 'release_worker' | 'partial' | 'no_fault';

/** Omit `adminId` to self-assign — the BE resolves the actor from the session. */
export type AssignDisputeArgs = { id: string; adminId?: string };

export type AddDisputeNoteArgs = { id: string; body: string; internal: boolean };

export type ResolveDisputeArgs = {
  id: string;
  outcome: DisputeOutcome;
  /** Required for `refund_client` / `partial`; capped at the held escrow. */
  amountCents?: number;
  reason: string;
  notifyParties: boolean;
};

export type ReopenDisputeArgs = { id: string; reason: string };

// Mutations return the updated dispute so the detail can refresh from the
// response in addition to the tag-driven refetch.
export type DisputeMutationResult = DisputeDetail;

// Invalidate the dispute row + the queue list + the summary KPI tiles so the
// read-only disputes report reflects the action immediately.
function disputeTags(id: string) {
  return [
    { type: API_TAGS.Dispute, id },
    { type: API_TAGS.Dispute, id: 'LIST' },
    { type: API_TAGS.Dispute, id: 'SUMMARY' },
  ];
}

export const adminDisputesMutations = (build: Build) => ({
  // BACKEND TODO: PATCH /admin/disputes/:id/assign { adminId? } — omit adminId to
  // self-assign (resolve actor from session). Sets status `assigned`. Emit admin-audit.
  assignDispute: build.mutation<DisputeMutationResult, AssignDisputeArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/disputes/${encodeURIComponent(id)}/assign`,
      method: 'PATCH',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => disputeTags(arg.id),
  }),

  // BACKEND TODO: POST /admin/disputes/:id/notes { body, internal } — author from
  // session. Returns the dispute with the appended note. Emit admin-audit.
  addDisputeNote: build.mutation<DisputeMutationResult, AddDisputeNoteArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/disputes/${encodeURIComponent(id)}/notes`,
      method: 'POST',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => [{ type: API_TAGS.Dispute, id: arg.id }],
  }),

  // BACKEND TODO: POST /admin/disputes/:id/resolve { outcome, amountCents?, reason,
  // notifyParties } — MUST trigger the matching money action (escrow release /
  // refund, Module 4) and emit admin-audit with before/after.
  resolveDispute: build.mutation<DisputeMutationResult, ResolveDisputeArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/disputes/${encodeURIComponent(id)}/resolve`,
      method: 'POST',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => disputeTags(arg.id),
  }),

  // BACKEND TODO: POST /admin/disputes/:id/reopen { reason } — sets status
  // `reopened`. Emit admin-audit.
  reopenDispute: build.mutation<DisputeMutationResult, ReopenDisputeArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/disputes/${encodeURIComponent(id)}/reopen`,
      method: 'POST',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => disputeTags(arg.id),
  }),
});
