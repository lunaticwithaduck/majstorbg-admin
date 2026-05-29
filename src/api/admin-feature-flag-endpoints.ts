import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type FeatureFlagRow = {
  id: string;
  key: string;
  value: boolean;
  updatedAt: string;
};

export type FeatureFlagMap = Record<string, boolean>;

export type UpsertAdminFeatureFlagArgs = { key: string; value: boolean };

export const adminFeatureFlagEndpoints = (build: Build) => ({
  getFeatureFlagMap: build.query<FeatureFlagMap, void>({
    query: () => ({ url: '/feature-flags' }),
    providesTags: [{ type: API_TAGS.FeatureFlag, id: 'LIST' }],
  }),
  upsertAdminFeatureFlag: build.mutation<FeatureFlagRow, UpsertAdminFeatureFlagArgs>({
    query: ({ key, value }) => ({
      url: `/admin/feature-flags/${key}`,
      method: 'PUT',
      data: { value },
    }),
    invalidatesTags: [{ type: API_TAGS.FeatureFlag, id: 'LIST' }],
  }),
  deleteAdminFeatureFlag: build.mutation<void, string>({
    query: (key) => ({ url: `/admin/feature-flags/${key}`, method: 'DELETE' }),
    invalidatesTags: [{ type: API_TAGS.FeatureFlag, id: 'LIST' }],
  }),
});
