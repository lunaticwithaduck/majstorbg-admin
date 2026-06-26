// TODO: replace with @lunaticwithaduck/api adminFinanceMutations once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';
import type { Commission, CommissionCategoryRate } from './admin-finance-endpoints';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type RefundArgs = { id: string; amountCents: number; reason: string };
export type ReleaseEscrowArgs = { jobId: string; reason: string };
export type RejectPayoutArgs = { id: string; reason: string };
export type SetCommissionArgs = {
  takeRatePct: number;
  perCategory?: CommissionCategoryRate[];
};

// A money movement reconciles the ledger AND the dispute KPIs (Module 1) — a
// refund/release closes the financial side of a dispute outcome.
const txnAndDisputeTags = [
  { type: API_TAGS.Escrow, id: 'TXN_LIST' },
  { type: API_TAGS.Dispute, id: 'LIST' },
  { type: API_TAGS.Dispute, id: 'SUMMARY' },
];

export const adminFinanceMutations = (build: Build) => ({
  // BACKEND TODO: POST /admin/finance/transactions/:id/refund { amountCents, reason }
  //   — capped at the refundable amount. Emit admin-audit.
  refund: build.mutation<{ id: string }, RefundArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/finance/transactions/${encodeURIComponent(id)}/refund`,
      method: 'POST',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => [
      { type: API_TAGS.Escrow, id: `txn-${arg.id}` },
      ...txnAndDisputeTags,
    ],
  }),
  // BACKEND TODO: POST /admin/finance/jobs/:jobId/release { reason } — releases
  //   held escrow to the worker once the job is complete. Emit admin-audit.
  releaseEscrow: build.mutation<{ jobId: string }, ReleaseEscrowArgs>({
    query: ({ jobId, ...body }) => ({
      url: `/admin/finance/jobs/${encodeURIComponent(jobId)}/release`,
      method: 'POST',
      data: body,
    }),
    invalidatesTags: txnAndDisputeTags,
  }),
  // BACKEND TODO: POST /admin/finance/payouts/:id/approve. Emit admin-audit.
  approvePayout: build.mutation<{ id: string }, string>({
    query: (id) => ({
      url: `/admin/finance/payouts/${encodeURIComponent(id)}/approve`,
      method: 'POST',
    }),
    invalidatesTags: (_res, _err, id) => [
      { type: API_TAGS.Escrow, id: `payout-${id}` },
      { type: API_TAGS.Escrow, id: 'PAYOUT_LIST' },
    ],
  }),
  // BACKEND TODO: POST /admin/finance/payouts/:id/reject { reason }. Emit admin-audit.
  rejectPayout: build.mutation<{ id: string }, RejectPayoutArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/finance/payouts/${encodeURIComponent(id)}/reject`,
      method: 'POST',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => [
      { type: API_TAGS.Escrow, id: `payout-${arg.id}` },
      { type: API_TAGS.Escrow, id: 'PAYOUT_LIST' },
    ],
  }),
  // BACKEND TODO: PUT /admin/finance/commission { takeRatePct, perCategory? }. Emit admin-audit.
  setCommission: build.mutation<Commission, SetCommissionArgs>({
    query: (body) => ({ url: '/admin/finance/commission', method: 'PUT', data: body }),
    invalidatesTags: [{ type: API_TAGS.Escrow, id: 'COMMISSION' }],
  }),
});
