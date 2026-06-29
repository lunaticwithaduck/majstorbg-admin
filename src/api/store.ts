import { adminUserEndpoints, createAppApi } from '@lunaticwithaduck/api';
import { configureStore, type Middleware } from '@reduxjs/toolkit';
import { setupListeners } from '@reduxjs/toolkit/query';
// TODO: replace with @lunaticwithaduck/api adminActivityEndpoints once BE lands.
import { adminActivityEndpoints } from './admin-activity-endpoints';
// TODO: replace with @lunaticwithaduck/api adminBidOutcomesEndpoints once BE lands.
import { adminBidOutcomesEndpoints } from './admin-bid-outcomes-endpoints';
// TODO: replace with @lunaticwithaduck/api adminCancellationEndpoints once BE lands.
import { adminCancellationEndpoints } from './admin-cancellation-endpoints';
import { adminJobCategoryEndpoints, adminSkillCategoryEndpoints } from './admin-category-endpoints';
// TODO: replace with @lunaticwithaduck/api adminCategoryPerfEndpoints once BE lands.
import { adminCategoryPerfEndpoints } from './admin-category-perf-endpoints';
// TODO: replace with @lunaticwithaduck/api adminDisputesEndpoints once BE lands.
import { adminDisputesEndpoints } from './admin-disputes-endpoints';
// TODO: replace with @lunaticwithaduck/api adminEngagementEndpoints once BE lands.
import { adminEngagementEndpoints } from './admin-engagement-endpoints';
import { adminFeatureFlagEndpoints } from './admin-feature-flag-endpoints';
// TODO: replace with @lunaticwithaduck/api adminGrowthEndpoints once BE lands.
import { adminGrowthEndpoints } from './admin-growth-endpoints';
// TODO: replace with @lunaticwithaduck/api adminGrowthMutations once BE lands.
import { adminGrowthMutations } from './admin-growth-mutations';
// TODO: replace with @lunaticwithaduck/api adminFinanceEndpoints once BE lands.
import { adminFinanceEndpoints } from './admin-finance-endpoints';
// TODO: replace with @lunaticwithaduck/api adminFinanceMutations once BE lands.
import { adminFinanceMutations } from './admin-finance-mutations';
// TODO: replace with @lunaticwithaduck/api adminComplianceEndpoints once BE lands.
import { adminComplianceEndpoints } from './admin-compliance-endpoints';
// TODO: replace with @lunaticwithaduck/api adminComplianceMutations once BE lands.
import { adminComplianceMutations } from './admin-compliance-mutations';
// TODO: replace with @lunaticwithaduck/api adminDisputesMutations once BE lands.
import { adminDisputesMutations } from './admin-disputes-mutations';
// TODO: replace with @lunaticwithaduck/api adminInvoicesEndpoints once BE lands.
import { adminInvoicesEndpoints } from './admin-invoices-endpoints';
// TODO: replace with @lunaticwithaduck/api adminInvoicesMutations once BE lands.
import { adminInvoicesMutations } from './admin-invoices-mutations';
import { adminJobEndpoints } from './admin-job-endpoints';
// TODO: replace with @lunaticwithaduck/api adminJobMutations once BE lands.
import { adminJobMutations } from './admin-job-mutations';
// TODO: replace with @lunaticwithaduck/api adminLiquidityEndpoints once BE lands.
import { adminLiquidityEndpoints } from './admin-liquidity-endpoints';
// TODO: replace with @lunaticwithaduck/api adminMatchSpeedEndpoints once BE lands.
import { adminMatchSpeedEndpoints } from './admin-match-speed-endpoints';
// TODO: replace with @lunaticwithaduck/api adminPlatformEndpoints once BE lands.
import { adminPlatformEndpoints } from './admin-platform-endpoints';
// TODO: replace with @lunaticwithaduck/api adminPlatformMutations once BE lands.
import { adminPlatformMutations } from './admin-platform-mutations';
// TODO: replace with @lunaticwithaduck/api adminModerationEndpoints once BE lands.
import { adminModerationEndpoints } from './admin-moderation-endpoints';
// TODO: replace with @lunaticwithaduck/api adminModerationMutations once BE lands.
import { adminModerationMutations } from './admin-moderation-mutations';
// TODO: replace with @lunaticwithaduck/api adminPortfolioEndpoints once BE lands.
import { adminPortfolioEndpoints } from './admin-portfolio-endpoints';
// TODO: replace with @lunaticwithaduck/api adminProfileCompletenessEndpoints once BE lands.
import { adminProfileCompletenessEndpoints } from './admin-profile-completeness-endpoints';
// TODO: replace with @lunaticwithaduck/api adminRatingsEndpoints once BE lands.
import { adminRatingsEndpoints } from './admin-ratings-endpoints';
// TODO: replace with @lunaticwithaduck/api adminRegistrationsEndpoints once BE lands.
import { adminRegistrationsEndpoints } from './admin-registrations-endpoints';
// TODO: replace with @lunaticwithaduck/api adminReportsEndpoints once BE lands.
import { adminReportsEndpoints } from './admin-reports-endpoints';
import { adminTranslationEndpoints } from './admin-translation-endpoints';
// TODO: replace with @lunaticwithaduck/api adminUserMutations once BE lands.
import { adminUserMutations } from './admin-user-mutations';
// TODO: replace with @lunaticwithaduck/api adminWorkerLeaderboardEndpoints once BE lands.
import { adminWorkerLeaderboardEndpoints } from './admin-worker-leaderboard-endpoints';
// TODO: replace with @lunaticwithaduck/api adminWorkerSupplyEndpoints once BE lands.
import { adminWorkerSupplyEndpoints } from './admin-worker-supply-endpoints';
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
    ...adminReportsEndpoints(build),
    ...adminDisputesEndpoints(build),
    ...adminDisputesMutations(build),
    ...adminInvoicesEndpoints(build),
    ...adminLiquidityEndpoints(build),
    ...adminMatchSpeedEndpoints(build),
    ...adminCancellationEndpoints(build),
    ...adminBidOutcomesEndpoints(build),
    ...adminWorkerSupplyEndpoints(build),
    ...adminWorkerLeaderboardEndpoints(build),
    ...adminProfileCompletenessEndpoints(build),
    ...adminRegistrationsEndpoints(build),
    ...adminEngagementEndpoints(build),
    ...adminRatingsEndpoints(build),
    ...adminCategoryPerfEndpoints(build),
    ...adminPortfolioEndpoints(build),
    ...adminPlatformEndpoints(build),
    ...adminPlatformMutations(build),
    ...adminGrowthEndpoints(build),
    ...adminGrowthMutations(build),
    ...adminFinanceEndpoints(build),
    ...adminFinanceMutations(build),
    ...adminInvoicesMutations(build),
    ...adminModerationEndpoints(build),
    ...adminModerationMutations(build),
    ...adminComplianceEndpoints(build),
    ...adminComplianceMutations(build),
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
  useSuspendUserMutation,
  useBanUserMutation,
  useReinstateUserMutation,
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
  useGetUserDirectorySummaryQuery,
  useListUserDirectoryQuery,
  useGetJobsFunnelQuery,
  useGetJobsFunnelBreakdownQuery,
  useListOpenDisputesQuery,
  useGetDisputesSummaryQuery,
  useGetDisputeQuery,
  useAssignDisputeMutation,
  useAddDisputeNoteMutation,
  useResolveDisputeMutation,
  useReopenDisputeMutation,
  useGetArAgingQuery,
  useListInvoicesQuery,
  useGetVatSettingsQuery,
  useIssueInvoiceMutation,
  useCreditNoteMutation,
  useSetVatSettingsMutation,
  useGetLiquidityQuery,
  useGetMatchSpeedQuery,
  useGetCancellationSummaryQuery,
  useListStuckJobsQuery,
  useGetBidOutcomesQuery,
  useGetWorkerSupplyQuery,
  useListWorkerLeaderboardQuery,
  useGetProfileCompletenessSummaryQuery,
  useListIncompleteProfilesQuery,
  useGetRegistrationsReportQuery,
  useGetEngagementReportQuery,
  useGetRatingsSummaryQuery,
  useListLowRatedWorkersQuery,
  useListCategoryPerfQuery,
  useGetPortfolioSummaryQuery,
  useListPortfolioCoverageQuery,
  useListAdminsQuery,
  useListAuditQuery,
  useSetAdminRoleMutation,
  useListCampaignsQuery,
  useListTemplatesQuery,
  useCreateCampaignMutation,
  useSendCampaignMutation,
  useUpsertTemplateMutation,
  useListTransactionsQuery,
  useGetTransactionQuery,
  useListPayoutsQuery,
  useGetCommissionQuery,
  useRefundMutation,
  useReleaseEscrowMutation,
  useApprovePayoutMutation,
  useRejectPayoutMutation,
  useSetCommissionMutation,
  useListReportsQuery,
  useGetReportQuery,
  useGetUserModerationStatusQuery,
  useActionReportMutation,
  useListDataRequestsQuery,
  useGetDataRequestQuery,
  useVerifyRequesterIdentityMutation,
  useFulfilExportMutation,
  useConfirmErasureMutation,
} = appApi;
