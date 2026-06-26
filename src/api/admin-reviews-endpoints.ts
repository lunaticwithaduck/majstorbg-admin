// TODO: replace with @lunaticwithaduck/api adminReviewsEndpoints once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type ReviewStatus = 'visible' | 'hidden' | 'removed';

export type ReviewRow = {
  id: string;
  workerId: string;
  workerName: string;
  reviewerId: string;
  reviewerName: string;
  jobId?: string | null;
  jobTitle?: string | null;
  rating: number;
  body: string;
  status: ReviewStatus;
  createdAt: string;
};

export type ListReviewsArgs = {
  page: number;
  pageSize: number;
  status?: ReviewStatus;
  workerId?: string;
  search?: string;
};

export type ListReviewsResponse = {
  items: ReviewRow[];
  total: number;
  page: number;
  pageSize: number;
};

// Reviews drive worker ratings; reuse the Worker tag with namespaced ids.
// TODO(api-tags): add a `Review` tag.
const REVIEW_LIST = 'REVIEW_LIST';

export const adminReviewsEndpoints = (build: Build) => ({
  // BACKEND TODO: GET /admin/reviews?status=&workerId=&search=&page=&pageSize=
  listReviews: build.query<ListReviewsResponse, ListReviewsArgs>({
    query: (params) => ({ url: '/admin/reviews', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((r) => ({ type: API_TAGS.Worker, id: `review-${r.id}` })),
            { type: API_TAGS.Worker, id: REVIEW_LIST },
          ]
        : [{ type: API_TAGS.Worker, id: REVIEW_LIST }],
  }),
});
