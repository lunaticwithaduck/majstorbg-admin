// TODO: replace with @lunaticwithaduck/api adminGrowthEndpoints once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type CampaignChannel = 'email' | 'push';
export type CampaignStatus = 'draft' | 'scheduled' | 'sending' | 'sent' | 'failed';

export type SegmentRole = 'all' | 'worker' | 'client';
export type SegmentActivity = 'all' | 'active_30d' | 'inactive_30d';

export type CampaignSegment = {
  role: SegmentRole;
  city?: string | null;
  categoryId?: string | null;
  activity: SegmentActivity;
};

export type CampaignStats = {
  recipients: number;
  delivered: number;
  opened?: number;
  clicked?: number;
  failed: number;
};

export type CampaignRow = {
  id: string;
  name: string;
  channel: CampaignChannel;
  status: CampaignStatus;
  segment: CampaignSegment;
  templateId: string;
  templateName?: string | null;
  scheduleAt?: string | null;
  createdAt: string;
  stats?: CampaignStats | null;
};

export type ListCampaignsArgs = {
  page: number;
  pageSize: number;
  channel?: CampaignChannel;
  status?: CampaignStatus;
};

export type ListCampaignsResponse = {
  items: CampaignRow[];
  total: number;
  page: number;
  pageSize: number;
};

export type TemplateRow = {
  id: string;
  name: string;
  channel: CampaignChannel;
  subject: string;
  body: string;
  vars: string[];
  transactional: boolean;
  updatedAt: string;
};

export type ListTemplatesArgs = {
  page: number;
  pageSize: number;
  channel?: CampaignChannel;
};

export type ListTemplatesResponse = {
  items: TemplateRow[];
  total: number;
  page: number;
  pageSize: number;
};

// Campaigns are notification-domain; reuse the Notification tag with namespaced
// ids. TODO(api-tags): add `Campaign` / `Template` tags.
const CAMPAIGN_LIST = 'CAMPAIGN_LIST';
const TEMPLATE_LIST = 'TEMPLATE_LIST';

export const adminGrowthEndpoints = (build: Build) => ({
  // BACKEND TODO: GET /admin/campaigns?channel=&status=&page=&pageSize=
  listCampaigns: build.query<ListCampaignsResponse, ListCampaignsArgs>({
    query: (params) => ({ url: '/admin/campaigns', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((c) => ({ type: API_TAGS.Notification, id: `campaign-${c.id}` })),
            { type: API_TAGS.Notification, id: CAMPAIGN_LIST },
          ]
        : [{ type: API_TAGS.Notification, id: CAMPAIGN_LIST }],
  }),
  // BACKEND TODO: GET /admin/templates?channel=&page=&pageSize=
  listTemplates: build.query<ListTemplatesResponse, ListTemplatesArgs>({
    query: (params) => ({ url: '/admin/templates', params }),
    providesTags: (res) =>
      res
        ? [
            ...res.items.map((t) => ({ type: API_TAGS.Notification, id: `template-${t.id}` })),
            { type: API_TAGS.Notification, id: TEMPLATE_LIST },
          ]
        : [{ type: API_TAGS.Notification, id: TEMPLATE_LIST }],
  }),
});
