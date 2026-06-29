// TODO: replace with @lunaticwithaduck/api adminPromotionsMutations once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';
import type {
  DiscountType,
  Promotion,
  PromotionStatus,
  PromotionType,
} from './admin-promotions-endpoints';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type PromotionInput = {
  code: string;
  type: PromotionType;
  discountType: DiscountType;
  value: number;
  maxRedemptions?: number;
  perUserLimit?: number;
  validFrom?: string;
  validTo?: string;
};

export type CreatePromotionArgs = PromotionInput;
export type UpdatePromotionArgs = { id: string } & Partial<PromotionInput> & {
    status?: PromotionStatus;
  };

function promotionTags(id: string) {
  return [
    { type: API_TAGS.Notification, id: `promotion-${id}` },
    { type: API_TAGS.Notification, id: 'PROMOTION_LIST' },
  ];
}

export const adminPromotionsMutations = (build: Build) => ({
  // BACKEND TODO: POST /admin/promotions { code, type, discountType, value, caps, validity }. Emit admin-audit.
  createPromotion: build.mutation<Promotion, CreatePromotionArgs>({
    query: (body) => ({ url: '/admin/promotions', method: 'POST', data: body }),
    invalidatesTags: [{ type: API_TAGS.Notification, id: 'PROMOTION_LIST' }],
  }),
  // BACKEND TODO: PATCH /admin/promotions/:id { ...fields, status? }. Emit admin-audit.
  updatePromotion: build.mutation<Promotion, UpdatePromotionArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/promotions/${encodeURIComponent(id)}`,
      method: 'PATCH',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => promotionTags(arg.id),
  }),
  // BACKEND TODO: DELETE /admin/promotions/:id. Emit admin-audit.
  deletePromotion: build.mutation<{ id: string }, string>({
    query: (id) => ({ url: `/admin/promotions/${encodeURIComponent(id)}`, method: 'DELETE' }),
    invalidatesTags: (_res, _err, id) => promotionTags(id),
  }),
});
