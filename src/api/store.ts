import { adminUserEndpoints, createAppApi } from '@lunaticwithaduck/api';
import { configureStore, type Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
// TODO: replace with @lunaticwithaduck/api adminActivityEndpoints once BE lands.
import { adminActivityEndpoints } from './admin-activity-endpoints';
import { adminJobEndpoints } from './admin-job-endpoints';
// TODO: replace with @lunaticwithaduck/api adminJobMutations once BE lands.
import { adminJobMutations } from './admin-job-mutations';
// TODO: replace with @lunaticwithaduck/api adminUserMutations once BE lands.
import { adminUserMutations } from './admin-user-mutations';
import { adminFeatureFlagEndpoints } from './admin-feature-flag-endpoints';
import { adminTranslationEndpoints } from './admin-translation-endpoints';
import { adminSkillCategoryEndpoints, adminJobCategoryEndpoints } from './admin-category-endpoints';
import { axiosClient } from './axios';

export const api = createAppApi({ client: axiosClient });

export const appApi = api.injectEndpoints({
  endpoints: (build) => ({
    ...adminUserEndpoints(build),
    ...adminUserMutations(build),
    ...adminJobEndpoints(build),
    ...adminJobMutations(build),
    ...adminActivityEndpoints(build),
    ...adminFeatureFlagEndpoints(build),
    ...adminTranslationEndpoints(build),
    ...adminSkillCategoryEndpoints(build),
    ...adminJobCategoryEndpoints(build),
  }),
});

export const store = configureStore({
  reducer: {
    [api.reducerPath]: api.reducer,
  },
  middleware: (getDefault) => getDefault().concat(api.middleware as Middleware),
});

setupListeners(store.dispatch);

export type AppStore = typeof store;
export type AppState = ReturnType<AppStore['getState']>;
export type AppDispatch = AppStore['dispatch'];

export const {
  useListAdminUsersQuery,
  useGetAdminUserQuery,
  useCreateAdminUserMutation,
  useUpdateAdminUserMutation,
  useDeleteAdminUserMutation,
  useListAdminJobsQuery,
  useGetAdminJobQuery,
  useCreateAdminJobMutation,
  useUpdateAdminJobMutation,
  useDeleteAdminJobMutation,
  useGetUserActivityQuery,
  useGetFeatureFlagMapQuery,
  useUpsertAdminFeatureFlagMutation,
  useDeleteAdminFeatureFlagMutation,
  useListAdminTranslationsQuery,
  useUpdateAdminTranslationMutation,
  useBulkUpsertAdminTranslationsMutation,
  useListAdminSkillCategoriesQuery,
  useCreateAdminSkillCategoryMutation,
  useUpdateAdminSkillCategoryMutation,
  useDeleteAdminSkillCategoryMutation,
  useListAdminJobCategoriesQuery,
  useCreateAdminJobCategoryMutation,
  useUpdateAdminJobCategoryMutation,
  useDeleteAdminJobCategoryMutation,
} = appApi;
