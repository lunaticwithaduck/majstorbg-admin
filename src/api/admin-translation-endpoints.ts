import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type TranslationRow = {
  id: string;
  locale: string;
  key: string;
  value: string;
  updatedAt: string;
};

export type ListAdminTranslationsArgs = {
  page: number;
  pageSize: number;
  locale?: 'en' | 'bg';
  search?: string;
};

export type ListAdminTranslationsResponse = {
  items: TranslationRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type UpdateAdminTranslationArgs = {
  id: string;
  value: string;
};

export type BulkUpsertAdminTranslationsArgs = {
  items: { locale: string; key: string; value: string }[];
};

export type BulkUpsertAdminTranslationsResponse = { count: number };

export const adminTranslationEndpoints = (build: Build) => ({
  listAdminTranslations: build.query<ListAdminTranslationsResponse, ListAdminTranslationsArgs | void>({
    query: (params) => ({ url: '/admin/translations', params: params ?? undefined }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((t) => ({ type: API_TAGS.Translation, id: t.id })),
            { type: API_TAGS.Translation, id: 'LIST' },
          ]
        : [{ type: API_TAGS.Translation, id: 'LIST' }],
  }),
  updateAdminTranslation: build.mutation<TranslationRow, UpdateAdminTranslationArgs>({
    query: ({ id, value }) => ({
      url: `/admin/translations/${encodeURIComponent(id)}`,
      method: 'PATCH',
      data: { value },
    }),
    invalidatesTags: (_res, _err, { id }) => [
      { type: API_TAGS.Translation, id },
      { type: API_TAGS.Translation, id: 'LIST' },
    ],
  }),
  bulkUpsertAdminTranslations: build.mutation<BulkUpsertAdminTranslationsResponse, BulkUpsertAdminTranslationsArgs>({
    query: ({ items }) => ({ url: '/admin/translations/bulk', method: 'POST', data: { items } }),
    invalidatesTags: [{ type: API_TAGS.Translation, id: 'LIST' }],
  }),
});
