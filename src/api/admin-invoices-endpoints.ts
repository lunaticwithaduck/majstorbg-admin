// TODO: replace with @lunaticwithaduck/api adminInvoicesEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type InvoiceStatus = 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';

export type InvoiceAgingBucket = 'current' | 'd1_30' | 'd31_60' | 'd61_90' | 'd90_plus';

export type ArAgingBucket = {
  count: number;
  amount: number;
};

export type GetArAgingArgs = {
  asOf?: string;
};

export type GetArAgingResponse = {
  asOf: string;
  currency: 'EUR';
  buckets: {
    current: ArAgingBucket;
    d1_30: ArAgingBucket;
    d31_60: ArAgingBucket;
    d61_90: ArAgingBucket;
    d90_plus: ArAgingBucket;
  };
  total: ArAgingBucket;
};

export type InvoiceRow = {
  id: string;
  clientName: string;
  jobTitle: string;
  amount: number;
  currency: 'EUR';
  vatIncluded: boolean;
  status: InvoiceStatus;
  issuedAt: string;
  dueAt: string;
  daysOverdue: number;
  agingBucket: InvoiceAgingBucket | null;
};

export type ListInvoicesArgs = {
  page: number;
  pageSize: number;
  status?: InvoiceStatus;
  agingBucket?: InvoiceAgingBucket;
  search?: string;
  sortBy?: 'dueAt' | 'issuedAt' | 'amount';
  sortDir?: 'asc' | 'desc';
};

export type ListInvoicesResponse = {
  items: InvoiceRow[];
  total: number;
  page: number;
  pageSize: number;
};

export const adminInvoicesEndpoints = (build: Build) => ({
  // No Invoice tag exists in API_TAGS — invoices/AR are money-flow data, so we
  // reuse the closest tag (Escrow) with 'LIST'/'AGING' sentinels. Swap to a
  // dedicated Invoice tag if/when one lands in @lunaticwithaduck/api.
  getArAging: build.query<GetArAgingResponse, GetArAgingArgs | void>({
    query: (params) => ({
      url: '/admin/reports/invoices-aging',
      params: params ?? undefined,
    }),
    providesTags: [{ type: API_TAGS.Escrow, id: 'AGING' }],
  }),
  listInvoices: build.query<ListInvoicesResponse, ListInvoicesArgs>({
    query: (params) => ({ url: '/admin/invoices', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((i) => ({ type: API_TAGS.Escrow, id: i.id })),
            { type: API_TAGS.Escrow, id: 'LIST' },
          ]
        : [{ type: API_TAGS.Escrow, id: 'LIST' }],
  }),
});
