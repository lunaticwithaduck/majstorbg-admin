// TODO: replace with @lunaticwithaduck/api adminInvoicesMutations once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';
import type { InvoiceRow, VatSettings } from './admin-invoices-endpoints';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type IssueInvoiceArgs = { id: string };
export type CreditNoteArgs = { id: string; amountCents: number; reason: string };
export type SetVatSettingsArgs = { ratePct: number; registered: boolean; vatId?: string };

// Invoices reuse the Escrow tag (no Invoice tag in API_TAGS) — bust the row + the
// list/aging so the read-only invoices report reflects the action.
function invoiceTags(id: string) {
  return [
    { type: API_TAGS.Escrow, id },
    { type: API_TAGS.Escrow, id: 'LIST' },
    { type: API_TAGS.Escrow, id: 'AGING' },
  ];
}

export const adminInvoicesMutations = (build: Build) => ({
  // BACKEND TODO: POST /admin/invoices/:id/issue — generates/regenerates the PDF and
  //   returns the row with `pdfUrl`. Emit admin-audit.
  issueInvoice: build.mutation<InvoiceRow, IssueInvoiceArgs>({
    query: ({ id }) => ({ url: `/admin/invoices/${encodeURIComponent(id)}/issue`, method: 'POST' }),
    invalidatesTags: (_res, _err, arg) => invoiceTags(arg.id),
  }),
  // BACKEND TODO: POST /admin/invoices/:id/credit-note { amountCents, reason }. Emit admin-audit.
  creditNote: build.mutation<InvoiceRow, CreditNoteArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/invoices/${encodeURIComponent(id)}/credit-note`,
      method: 'POST',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => invoiceTags(arg.id),
  }),
  // BACKEND TODO: PUT /admin/finance/vat { ratePct, registered, vatId? }. Emit admin-audit.
  setVatSettings: build.mutation<VatSettings, SetVatSettingsArgs>({
    query: (body) => ({ url: '/admin/finance/vat', method: 'PUT', data: body }),
    invalidatesTags: [{ type: API_TAGS.Escrow, id: 'VAT' }],
  }),
});
