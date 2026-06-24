// TODO: replace with @lunaticwithaduck/api adminProfileCompletenessEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

// The six tracked profile fields. Mirrors the BE's field vocabulary
// (be: admin-profile-completeness-reports/dto). camelCase end-to-end.
export type ProfileCompletenessField =
  | 'bio'
  | 'avatar'
  | 'skills'
  | 'serviceArea'
  | 'bankAccount'
  | 'verifiedPhone';

// Per-field tally keyed by field. Used for both the missing counts and the
// missing-percentage map in the summary.
export type ProfileCompletenessFieldCounts = Record<
  ProfileCompletenessField,
  number
>;

export type ProfileCompletenessSummary = {
  totalWorkers: number;
  incompleteWorkers: number;
  completeWorkers: number;
  // Share (0..100) of workers that are fully complete.
  completionRate: number;
  missing: ProfileCompletenessFieldCounts;
  missingPct: ProfileCompletenessFieldCounts;
};

export type GetProfileCompletenessSummaryArgs = {
  from?: string;
  to?: string;
};

export type IncompleteProfileRow = {
  // Worker's User id — the drilldown target.
  id: string;
  name: string;
  email: string;
  missingCount: number;
  missing: ProfileCompletenessField[];
  createdAt: string;
};

export type ListIncompleteProfilesArgs = {
  page: number;
  pageSize: number;
  search?: string;
  from?: string;
  to?: string;
  sortBy?: 'createdAt' | 'name';
  sortDir?: 'asc' | 'desc';
};

export type ListIncompleteProfilesResponse = {
  items: IncompleteProfileRow[];
  total: number;
  page: number;
  pageSize: number;
};

export const adminProfileCompletenessEndpoints = (build: Build) => ({
  // Summary tags by a sentinel under the AdminUser tag (the report reads the
  // worker population — same tag the user-directory report uses); the list tags
  // individual worker rows + a LIST sentinel.
  getProfileCompletenessSummary: build.query<
    ProfileCompletenessSummary,
    GetProfileCompletenessSummaryArgs | void
  >({
    query: (params) => ({ url: '/admin/reports/profile-completeness', params: params ?? {} }),
    providesTags: [{ type: API_TAGS.AdminUser, id: 'PROFILE_COMPLETENESS_SUMMARY' }],
  }),
  listIncompleteProfiles: build.query<
    ListIncompleteProfilesResponse,
    ListIncompleteProfilesArgs
  >({
    query: (params) => ({ url: '/admin/profile-completeness', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((r) => ({ type: API_TAGS.AdminUser, id: r.id })),
            { type: API_TAGS.AdminUser, id: 'PROFILE_COMPLETENESS_LIST' },
          ]
        : [{ type: API_TAGS.AdminUser, id: 'PROFILE_COMPLETENESS_LIST' }],
  }),
});
