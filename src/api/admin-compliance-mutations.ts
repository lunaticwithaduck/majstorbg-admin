// TODO: replace with @lunaticwithaduck/api adminComplianceMutations once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';
import type { DataRequestRow } from './admin-compliance-endpoints';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type VerifyRequesterIdentityArgs = { id: string; verified: boolean; note?: string };
export type FulfilExportArgs = { id: string };
export type ConfirmErasureArgs = { id: string; reason: string };

export type DataRequestMutationResult = DataRequestRow;

function requestTags(id: string) {
  return [
    { type: API_TAGS.Privacy, id: `request-${id}` },
    { type: API_TAGS.Privacy, id: 'DATA_REQUEST_LIST' },
  ];
}

export const adminComplianceMutations = (build: Build) => ({
  // BACKEND TODO: POST /admin/compliance/data-requests/:id/verify { verified, note? }
  //   — records the requester identity check (gates fulfilment). Emit admin-audit.
  verifyRequesterIdentity: build.mutation<DataRequestMutationResult, VerifyRequesterIdentityArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/compliance/data-requests/${encodeURIComponent(id)}/verify`,
      method: 'POST',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => requestTags(arg.id),
  }),
  // BACKEND TODO: POST /admin/compliance/data-requests/:id/export — generates the
  //   export bundle and returns the row with `bundleUrl`. Emit admin-audit.
  fulfilExport: build.mutation<DataRequestMutationResult, FulfilExportArgs>({
    query: ({ id }) => ({
      url: `/admin/compliance/data-requests/${encodeURIComponent(id)}/export`,
      method: 'POST',
    }),
    invalidatesTags: (_res, _err, arg) => requestTags(arg.id),
  }),
  // BACKEND TODO: POST /admin/compliance/data-requests/:id/erase { reason } — hard
  //   erasure; retains legally-required records only. Emit admin-audit.
  confirmErasure: build.mutation<DataRequestMutationResult, ConfirmErasureArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/compliance/data-requests/${encodeURIComponent(id)}/erase`,
      method: 'POST',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => requestTags(arg.id),
  }),
});
