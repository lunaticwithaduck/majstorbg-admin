// TODO: replace with @lunaticwithaduck/api adminWorkerSupplyEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

// Which axis supply is bucketed by: city (Worker.serviceCity/serviceArea) or
// job/skill category (WorkerSkill.jobCategoryId). Mirrors the BE enum.
export type WorkerSupplyDimension = 'city' | 'category';

// Sortable per-row metrics. Mirror the BE's WORKER_SUPPLY_SORT_KEYS.
export type WorkerSupplySortKey =
  | 'activeWorkers'
  | 'verifiedShare'
  | 'acceptingShare'
  | 'openJobs'
  | 'coverageRatio';

export type WorkerSupplyArgs = {
  dimension: WorkerSupplyDimension;
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: WorkerSupplySortKey;
  sortDir?: 'asc' | 'desc';
  // Open-job demand window (Job.createdAt). Supply itself is a live snapshot.
  from?: string;
  to?: string;
};

// One aggregated bucket row (a city or a category). `coverageRatio` is null
// when there is no open-job demand (would be Infinity). `thinCoverage` is the
// BE-computed flag: open demand exists but active supply is below it.
export type WorkerSupplyRow = {
  key: string;
  label: string;
  activeWorkers: number;
  verifiedWorkers: number;
  acceptingWorkers: number;
  verifiedShare: number;
  acceptingShare: number;
  openJobs: number;
  coverageRatio: number | null;
  thinCoverage: boolean;
};

// KPI tiles. Shares are platform-wide over the distinct active worker
// population (a worker spanning multiple buckets is counted once).
export type WorkerSupplySummary = {
  activeWorkers: number;
  verifiedWorkers: number;
  acceptingWorkers: number;
  verifiedShare: number;
  acceptingShare: number;
  openJobs: number;
  thinCoverageBuckets: number;
};

// Bar-chart datum: active workers per bucket (top N, BE-capped).
export type WorkerSupplyChartPoint = {
  label: string;
  value: number;
};

export type WorkerSupplyResponse = {
  summary: WorkerSupplySummary;
  chart: WorkerSupplyChartPoint[];
  items: WorkerSupplyRow[];
  total: number;
  page: number;
  pageSize: number;
};

export const adminWorkerSupplyEndpoints = (build: Build) => ({
  // Supply & coverage is read-only; tag under the Worker cache key with a
  // dedicated 'SUPPLY' sentinel so it invalidates with worker-side writes.
  getWorkerSupply: build.query<WorkerSupplyResponse, WorkerSupplyArgs>({
    query: (params) => ({ url: '/admin/reports/worker-supply', params }),
    providesTags: [{ type: API_TAGS.Worker, id: 'SUPPLY' }],
  }),
});
