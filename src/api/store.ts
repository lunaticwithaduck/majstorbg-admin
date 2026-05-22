import { adminUserEndpoints, createAppApi } from '@lunaticwithaduck/api';
import { configureStore, type Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
import { adminJobEndpoints } from './admin-job-endpoints';
// TODO: replace with @lunaticwithaduck/api adminUserMutations once BE lands.
import { adminUserMutations } from './admin-user-mutations';
import { axiosClient } from './axios';

export const api = createAppApi({ client: axiosClient });

export const appApi = api.injectEndpoints({
  endpoints: (build) => ({
    ...adminUserEndpoints(build),
    ...adminUserMutations(build),
    ...adminJobEndpoints(build),
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
} = appApi;
