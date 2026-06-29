// TODO: replace with @lunaticwithaduck/api adminDisputesEndpoints once BE lands.

import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

// 'assigned' | 'reopened' are added by the resolution layer (Module 1).
// BACKEND TODO: extend the dispute status enum with `assigned` and `reopened`.
export type DisputeStatus =
  | 'pending'
  | 'under_review'
  | 'assigned'
  | 'resolved'
  | 'reopened'
  | 'escalated';

export type DisputeType = 'unfinished' | 'poor_quality' | 'money' | 'materials';

export type DisputeRow = {
  id: string;
  jobId: string;
  jobTitle: string;
  bidId: string;
  type: DisputeType;
  status: DisputeStatus;
  raiserName: string;
  workerName: string;
  escrowAmount: number;
  currency: 'EUR';
  ageHours: number;
  createdAt: string;
  updatedAt: string;
};

export type ListOpenDisputesArgs = {
  page: number;
  pageSize: number;
  status?: DisputeStatus;
  type?: DisputeType;
  open?: boolean;
  search?: string;
  sortBy?: 'createdAt' | 'updatedAt';
  sortDir?: 'asc' | 'desc';
};

export type ListOpenDisputesResponse = {
  items: DisputeRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type DisputesSummary = {
  open: number;
  escalated: number;
  avgAgeHours: number;
  totalAtRisk: number;
  currency: 'EUR';
};

export type DisputeTimelineEntry = {
  at: string;
  actor: 'client' | 'worker' | 'mediator' | 'system';
  summary: string;
};

// Internal/public mediation note thread on a dispute.
// BACKEND TODO: GET /admin/disputes/:id returns `notes` (author from session).
export type DisputeNote = {
  id: string;
  body: string;
  internal: boolean;
  authorName: string;
  createdAt: string;
};

// Chat excerpt + uploaded evidence + escrow state, pulled into the one view the
// mediator resolves from. All optional until the BE relations land.
// BACKEND TODO: GET /admin/disputes/:id returns `chat`, `photos`, `payment`.
export type DisputeChatMessage = {
  id: string;
  author: 'client' | 'worker';
  body: string;
  at: string;
};

export type DisputePhoto = {
  id: string;
  url: string;
  caption?: string;
};

export type DisputePaymentState = {
  heldCents: number;
  releasedCents?: number;
  refundedCents?: number;
  status: 'held' | 'released' | 'refunded' | 'partial';
};

export type DisputeDetail = {
  id: string;
  jobId: string;
  bidId: string;
  type: DisputeType;
  status: DisputeStatus;
  jobTitle: string;
  workerName: string;
  escrowAmount: number;
  currency: 'EUR';
  createdAt: string;
  assignedToId?: string | null;
  assignedToName?: string | null;
  evidence?: unknown;
  resolution?: unknown;
  timeline: DisputeTimelineEntry[];
  notes?: DisputeNote[];
  chat?: DisputeChatMessage[];
  photos?: DisputePhoto[];
  payment?: DisputePaymentState;
};

export const adminDisputesEndpoints = (build: Build) => ({
  // Disputes use the dedicated Dispute tag; lists/summary use 'LIST'/'SUMMARY'
  // sentinels and detail rows tag by id.
  listOpenDisputes: build.query<ListOpenDisputesResponse, ListOpenDisputesArgs>({
    query: (params) => ({ url: '/admin/disputes', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((d) => ({ type: API_TAGS.Dispute, id: d.id })),
            { type: API_TAGS.Dispute, id: 'LIST' },
          ]
        : [{ type: API_TAGS.Dispute, id: 'LIST' }],
  }),
  getDisputesSummary: build.query<DisputesSummary, void>({
    query: () => ({ url: '/admin/disputes/summary' }),
    providesTags: [{ type: API_TAGS.Dispute, id: 'SUMMARY' }],
  }),
  getDispute: build.query<DisputeDetail, string>({
    query: (id) => ({ url: `/admin/disputes/${encodeURIComponent(id)}` }),
    // Timeline arrives empty until the BE wires the relation — keep the shape
    // stable so the UI can render the "no timeline" empty state today.
    transformResponse: (raw: DisputeDetail) => ({
      ...raw,
      timeline: Array.isArray(raw?.timeline) ? raw.timeline : [],
    }),
    providesTags: (_res, _err, id) => [{ type: API_TAGS.Dispute, id }],
  }),
});
