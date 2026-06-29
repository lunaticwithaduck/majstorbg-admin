// TODO: replace with @lunaticwithaduck/api adminFinanceEndpoints once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type TransactionType =
  | 'payment'
  | 'refund'
  | 'payout'
  | 'escrow_hold'
  | 'escrow_release'
  | 'fee'
  | 'chargeback';

export type TransactionStatus = 'pending' | 'succeeded' | 'failed' | 'refunded' | 'disputed';

export type TransactionRow = {
  id: string;
  type: TransactionType;
  status: TransactionStatus;
  amountCents: number;
  currency: 'EUR';
  userId?: string | null;
  userName?: string | null;
  jobId?: string | null;
  jobTitle?: string | null;
  /** Remaining refundable amount (cap for the refund action). */
  refundableCents?: number;
  /** True when the linked job is complete — gates escrow release. */
  jobCompleted?: boolean;
  /** Chargeback / fraud flag surfaced in the ledger. */
  flagged?: boolean;
  createdAt: string;
};

export type ListTransactionsArgs = {
  page: number;
  pageSize: number;
  type?: TransactionType;
  status?: TransactionStatus;
  userId?: string;
  jobId?: string;
};

export type ListTransactionsResponse = {
  items: TransactionRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type PayoutStatus = 'pending' | 'approved' | 'paid' | 'failed';

export type PayoutRow = {
  id: string;
  workerId: string;
  workerName: string;
  amountCents: number;
  currency: 'EUR';
  status: PayoutStatus;
  jobId?: string | null;
  jobTitle?: string | null;
  createdAt: string;
};

export type ListPayoutsArgs = {
  page: number;
  pageSize: number;
  status?: PayoutStatus;
};

export type ListPayoutsResponse = {
  items: PayoutRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type CommissionCategoryRate = {
  categoryId: string;
  categoryName: string;
  takeRatePct: number;
};

export type Commission = {
  takeRatePct: number;
  perCategory: CommissionCategoryRate[];
};

// Finance has no dedicated API tag; reuse the Escrow tag with namespaced ids.
// TODO(api-tags): add a `Finance` tag.
const TXN_LIST = 'TXN_LIST';
const PAYOUT_LIST = 'PAYOUT_LIST';
const COMMISSION = 'COMMISSION';

export const adminFinanceEndpoints = (build: Build) => ({
  // BACKEND TODO: GET /admin/finance/transactions?type=&status=&userId=&jobId=&page=&pageSize=
  listTransactions: build.query<ListTransactionsResponse, ListTransactionsArgs>({
    query: (params) => ({ url: '/admin/finance/transactions', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((t) => ({ type: API_TAGS.Escrow, id: `txn-${t.id}` })),
            { type: API_TAGS.Escrow, id: TXN_LIST },
          ]
        : [{ type: API_TAGS.Escrow, id: TXN_LIST }],
  }),
  // BACKEND TODO: GET /admin/finance/transactions/:id
  getTransaction: build.query<TransactionRow, string>({
    query: (id) => ({ url: `/admin/finance/transactions/${encodeURIComponent(id)}` }),
    providesTags: (_res, _err, id) => [{ type: API_TAGS.Escrow, id: `txn-${id}` }],
  }),
  // BACKEND TODO: GET /admin/finance/payouts?status=&page=&pageSize=
  listPayouts: build.query<ListPayoutsResponse, ListPayoutsArgs>({
    query: (params) => ({ url: '/admin/finance/payouts', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((p) => ({ type: API_TAGS.Escrow, id: `payout-${p.id}` })),
            { type: API_TAGS.Escrow, id: PAYOUT_LIST },
          ]
        : [{ type: API_TAGS.Escrow, id: PAYOUT_LIST }],
  }),
  // BACKEND TODO: GET /admin/finance/commission → { takeRatePct, perCategory[] }
  getCommission: build.query<Commission, void>({
    query: () => ({ url: '/admin/finance/commission' }),
    providesTags: [{ type: API_TAGS.Escrow, id: COMMISSION }],
  }),
});
