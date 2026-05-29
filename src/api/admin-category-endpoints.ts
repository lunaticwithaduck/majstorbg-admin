import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type CategoryRow = {
  id: string;
  nameBg: string;
  nameEn: string;
  sortOrder: number;
  updatedAt: string;
};

export type PaginatedCategories = {
  items: CategoryRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type CreateCategoryArgs = { id: string; nameBg: string; nameEn: string; sortOrder: number };
export type UpdateCategoryArgs = { id: string; nameBg?: string; nameEn?: string; sortOrder?: number };

export const adminSkillCategoryEndpoints = (build: Build) => ({
  listAdminSkillCategories: build.query<PaginatedCategories, { page: number; pageSize: number; search?: string }>({
    query: ({ page, pageSize, search }) => ({
      url: '/admin/skill-categories',
      params: { page, pageSize, ...(search ? { search } : {}) },
    }),
    providesTags: [{ type: API_TAGS.SkillCategory, id: 'LIST' }],
  }),
  createAdminSkillCategory: build.mutation<CategoryRow, CreateCategoryArgs>({
    query: (body) => ({ url: '/admin/skill-categories', method: 'POST', data: body }),
    invalidatesTags: [{ type: API_TAGS.SkillCategory, id: 'LIST' }],
  }),
  updateAdminSkillCategory: build.mutation<CategoryRow, UpdateCategoryArgs>({
    query: ({ id, ...body }) => ({ url: `/admin/skill-categories/${id}`, method: 'PATCH', data: body }),
    invalidatesTags: [{ type: API_TAGS.SkillCategory, id: 'LIST' }],
  }),
  deleteAdminSkillCategory: build.mutation<void, string>({
    query: (id) => ({ url: `/admin/skill-categories/${id}`, method: 'DELETE' }),
    invalidatesTags: [{ type: API_TAGS.SkillCategory, id: 'LIST' }],
  }),
});

export const adminJobCategoryEndpoints = (build: Build) => ({
  listAdminJobCategories: build.query<PaginatedCategories, { page: number; pageSize: number; search?: string }>({
    query: ({ page, pageSize, search }) => ({
      url: '/admin/job-categories',
      params: { page, pageSize, ...(search ? { search } : {}) },
    }),
    providesTags: [{ type: API_TAGS.JobCategory, id: 'LIST' }],
  }),
  createAdminJobCategory: build.mutation<CategoryRow, CreateCategoryArgs>({
    query: (body) => ({ url: '/admin/job-categories', method: 'POST', data: body }),
    invalidatesTags: [{ type: API_TAGS.JobCategory, id: 'LIST' }],
  }),
  updateAdminJobCategory: build.mutation<CategoryRow, UpdateCategoryArgs>({
    query: ({ id, ...body }) => ({ url: `/admin/job-categories/${id}`, method: 'PATCH', data: body }),
    invalidatesTags: [{ type: API_TAGS.JobCategory, id: 'LIST' }],
  }),
  deleteAdminJobCategory: build.mutation<void, string>({
    query: (id) => ({ url: `/admin/job-categories/${id}`, method: 'DELETE' }),
    invalidatesTags: [{ type: API_TAGS.JobCategory, id: 'LIST' }],
  }),
});
