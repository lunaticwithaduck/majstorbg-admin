// TODO: replace with @lunaticwithaduck/api adminRegistrationsEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type RegistrationsPeriod = 'day' | 'week' | 'month';

export type RegistrationsReportSortBy = 'bucket' | 'total';

export type GetRegistrationsReportArgs = {
  period: RegistrationsPeriod;
  from?: string;
  to?: string;
  search?: string;
  sortBy?: RegistrationsReportSortBy;
  sortDir?: 'asc' | 'desc';
  page: number;
  pageSize: number;
};

// Headline KPI tiles, over EVERY user in the window (independent of the table's
// pagination). Rates are in [0, 1].
export type RegistrationsKpis = {
  total: number;
  workers: number;
  clients: number;
  onboarded: number;
  onboardingCompletionRate: number;
  verifiedWorkers: number;
  verifiedWorkerShare: number;
};

// One bucket of the full chronological signups series for the chart.
export type RegistrationsSeriesPoint = {
  bucket: string;
  total: number;
  workers: number;
  clients: number;
};

// One row of the paginated per-period table.
export type RegistrationsRow = {
  bucket: string;
  total: number;
  workers: number;
  clients: number;
  onboarded: number;
};

export type GetRegistrationsReportResponse = {
  range: { from: string | null; to: string | null };
  period: RegistrationsPeriod;
  kpis: RegistrationsKpis;
  series: RegistrationsSeriesPoint[];
  // `total` here is the COUNT OF BUCKETS (table rows), not the user count —
  // user totals live in `kpis`. Matches the { items, total, page, pageSize }
  // list envelope used across the admin reports.
  items: RegistrationsRow[];
  total: number;
  page: number;
  pageSize: number;
};

export const adminRegistrationsEndpoints = (build: Build) => ({
  // Registrations are aggregates over the User domain — reuse the AdminUser tag
  // with a dedicated 'REGISTRATIONS' sentinel (the report is a singleton view,
  // not addressable per row).
  getRegistrationsReport: build.query<
    GetRegistrationsReportResponse,
    GetRegistrationsReportArgs
  >({
    query: (params) => ({ url: '/admin/reports/registrations', params }),
    // Series arrives empty until the BE has rows in the window — keep the shape
    // stable so the chart can render its own empty state today.
    transformResponse: (raw: GetRegistrationsReportResponse) => ({
      ...raw,
      series: Array.isArray(raw?.series) ? raw.series : [],
      items: Array.isArray(raw?.items) ? raw.items : [],
    }),
    providesTags: [{ type: API_TAGS.AdminUser, id: 'REGISTRATIONS' }],
  }),
});
