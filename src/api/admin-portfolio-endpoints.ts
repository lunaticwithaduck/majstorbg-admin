// TODO: replace with @lunaticwithaduck/api adminPortfolioEndpoints once BE lands.
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

// Mirrors the Prisma PortfolioCategory enum (the BE breakdown groups by it).
export type PortfolioCategory =
  | 'kitchen'
  | 'bathroom'
  | 'electrical'
  | 'plumbing'
  | 'painting'
  | 'tiling'
  | 'carpentry'
  | 'climate'
  | 'roofing'
  | 'outdoor'
  | 'other';

// One per-category breakdown row (drives the FE bar chart).
export type PortfolioCategoryBreakdownItem = {
  category: PortfolioCategory;
  projects: number;
  featured: number;
};

// GET /admin/reports/portfolio response.
export type PortfolioSummary = {
  totalWorkers: number;
  workersWithPortfolio: number;
  coverageRate: number;
  totalProjects: number;
  avgProjectsPerWorker: number;
  featuredProjects: number;
  byCategory: PortfolioCategoryBreakdownItem[];
};

// Optional [from, to) window anchored on PortfolioProject.completedAt.
export type GetPortfolioSummaryArgs = {
  from?: string;
  to?: string;
};

// One per-worker row of the coverage table.
export type PortfolioCoverageRow = {
  workerUserId: string;
  name: string;
  verified: boolean;
  projects: number;
  photos: number;
  featured: number;
  lastCompletedAt: string | null;
  createdAt: string;
};

export type PortfolioCoverageSortKey =
  | 'projects'
  | 'photos'
  | 'featured'
  | 'createdAt';

export type ListPortfolioCoverageArgs = {
  page: number;
  pageSize: number;
  search?: string;
  sortBy?: PortfolioCoverageSortKey;
  sortDir?: 'asc' | 'desc';
};

export type ListPortfolioCoverageResponse = {
  items: PortfolioCoverageRow[];
  total: number;
  page: number;
  pageSize: number;
};

export const adminPortfolioEndpoints = (build: Build) => ({
  // Portfolio coverage uses the shared Portfolio tag; the summary tags by a
  // 'SUMMARY' sentinel and the list rows tag by workerUserId + a 'LIST'
  // sentinel so a future invalidation can target either surface.
  getPortfolioSummary: build.query<PortfolioSummary, GetPortfolioSummaryArgs>({
    query: (params) => ({ url: '/admin/reports/portfolio', params }),
    providesTags: [{ type: API_TAGS.Portfolio, id: 'SUMMARY' }],
  }),
  listPortfolioCoverage: build.query<
    ListPortfolioCoverageResponse,
    ListPortfolioCoverageArgs
  >({
    query: (params) => ({ url: '/admin/portfolio-coverage', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((r) => ({
              type: API_TAGS.Portfolio,
              id: r.workerUserId,
            })),
            { type: API_TAGS.Portfolio, id: 'LIST' },
          ]
        : [{ type: API_TAGS.Portfolio, id: 'LIST' }],
  }),
});
