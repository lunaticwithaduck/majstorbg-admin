// TODO: replace with @lunaticwithaduck/api adminComplianceEndpoints once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type DataRequestType = 'export' | 'erase';

export type DataRequestStatus = 'pending' | 'verifying' | 'in_progress' | 'fulfilled' | 'rejected';

export type DataRequestRow = {
  id: string;
  type: DataRequestType;
  status: DataRequestStatus;
  subjectId: string;
  subjectName: string;
  subjectEmail: string;
  /** Whether the requester's identity has been verified (gates fulfilment). */
  identityVerified: boolean;
  requestedAt: string;
  /** SLA deadline (GDPR: 30 days from request). */
  dueAt: string;
  /** Download URL for a fulfilled export bundle. */
  bundleUrl?: string | null;
};

export type ListDataRequestsArgs = {
  page: number;
  pageSize: number;
  type?: DataRequestType;
  status?: DataRequestStatus;
};

export type ListDataRequestsResponse = {
  items: DataRequestRow[];
  total: number;
  page: number;
  pageSize: number;
};

// GDPR data requests are privacy-domain; use the Privacy tag.
const DATA_REQUEST_LIST = 'DATA_REQUEST_LIST';

export const adminComplianceEndpoints = (build: Build) => ({
  // BACKEND TODO: GET /admin/compliance/data-requests?type=&status=&page=&pageSize=
  listDataRequests: build.query<ListDataRequestsResponse, ListDataRequestsArgs>({
    query: (params) => ({ url: '/admin/compliance/data-requests', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((r) => ({ type: API_TAGS.Privacy, id: `request-${r.id}` })),
            { type: API_TAGS.Privacy, id: DATA_REQUEST_LIST },
          ]
        : [{ type: API_TAGS.Privacy, id: DATA_REQUEST_LIST }],
  }),
  // BACKEND TODO: GET /admin/compliance/data-requests/:id
  getDataRequest: build.query<DataRequestRow, string>({
    query: (id) => ({ url: `/admin/compliance/data-requests/${encodeURIComponent(id)}` }),
    providesTags: (_res, _err, id) => [{ type: API_TAGS.Privacy, id: `request-${id}` }],
  }),
});
