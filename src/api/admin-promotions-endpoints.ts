// TODO: replace with @lunaticwithaduck/api adminPromotionsEndpoints once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type PromotionType = 'voucher' | 'referral';
export type DiscountType = 'percent' | 'fixed';
export type PromotionStatus = 'active' | 'scheduled' | 'expired' | 'disabled';

export type Promotion = {
  id: string;
  code: string;
  type: PromotionType;
  discountType: DiscountType;
  /** percent (0–100) for `percent`, integer cents for `fixed`. */
  value: number;
  maxRedemptions?: number | null;
  perUserLimit?: number | null;
  validFrom?: string | null;
  validTo?: string | null;
  usageCount: number;
  status: PromotionStatus;
  createdAt: string;
};

export type ListPromotionsArgs = {
  page: number;
  pageSize: number;
  type?: PromotionType;
  status?: PromotionStatus;
};

export type ListPromotionsResponse = {
  items: Promotion[];
  total: number;
  page: number;
  pageSize: number;
};

export type RedemptionRow = {
  id: string;
  userId: string;
  userName: string;
  redeemedAt: string;
  orderId?: string | null;
};

export type ListRedemptionsResponse = {
  items: RedemptionRow[];
  total: number;
};

// No Promotion tag yet; reuse the growth-domain Notification tag with namespaced
// ids. TODO(api-tags): add a `Promotion` tag.
const PROMOTION_LIST = 'PROMOTION_LIST';

export const adminPromotionsEndpoints = (build: Build) => ({
  // BACKEND TODO: GET /admin/promotions?type=&status=&page=&pageSize=
  listPromotions: build.query<ListPromotionsResponse, ListPromotionsArgs>({
    query: (params) => ({ url: '/admin/promotions', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((p) => ({ type: API_TAGS.Notification, id: `promotion-${p.id}` })),
            { type: API_TAGS.Notification, id: PROMOTION_LIST },
          ]
        : [{ type: API_TAGS.Notification, id: PROMOTION_LIST }],
  }),
  // BACKEND TODO: GET /admin/promotions/:id/redemptions
  getPromotionRedemptions: build.query<ListRedemptionsResponse, string>({
    query: (id) => ({ url: `/admin/promotions/${encodeURIComponent(id)}/redemptions` }),
    providesTags: (_res, _err, id) => [{ type: API_TAGS.Notification, id: `redemptions-${id}` }],
  }),
});
