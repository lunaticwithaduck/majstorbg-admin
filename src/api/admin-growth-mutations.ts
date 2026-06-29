// TODO: replace with @lunaticwithaduck/api adminGrowthMutations once BE lands.
import type { AxiosBaseQueryArgs, AxiosBaseQueryError } from '@lunaticwithaduck/api';
import { API_TAGS, type ApiTag } from '@lunaticwithaduck/api';
import type { BaseQueryFn, EndpointBuilder } from '@reduxjs/toolkit/query';
import type {
  CampaignChannel,
  CampaignRow,
  CampaignSegment,
  TemplateRow,
} from './admin-growth-endpoints';

type Build = EndpointBuilder<
  BaseQueryFn<AxiosBaseQueryArgs, unknown, AxiosBaseQueryError>,
  ApiTag,
  'api'
>;

export type CreateCampaignArgs = {
  name: string;
  channel: CampaignChannel;
  segment: CampaignSegment;
  templateId: string;
  scheduleAt?: string;
};
export type SendCampaignArgs = { id: string };
export type UpsertTemplateArgs = {
  id: string;
  name: string;
  channel: CampaignChannel;
  subject: string;
  body: string;
  vars: string[];
};

export const adminGrowthMutations = (build: Build) => ({
  // BACKEND TODO: POST /admin/campaigns { name, channel, segment, templateId, scheduleAt? }
  //   — GDPR: email goes via Resend with EU-resident handling. Emit admin-audit.
  createCampaign: build.mutation<CampaignRow, CreateCampaignArgs>({
    query: (body) => ({ url: '/admin/campaigns', method: 'POST', data: body }),
    invalidatesTags: [{ type: API_TAGS.Notification, id: 'CAMPAIGN_LIST' }],
  }),
  // BACKEND TODO: POST /admin/campaigns/:id/send. Emit admin-audit.
  sendCampaign: build.mutation<CampaignRow, SendCampaignArgs>({
    query: ({ id }) => ({ url: `/admin/campaigns/${encodeURIComponent(id)}/send`, method: 'POST' }),
    invalidatesTags: (_res, _err, arg) => [
      { type: API_TAGS.Notification, id: `campaign-${arg.id}` },
      { type: API_TAGS.Notification, id: 'CAMPAIGN_LIST' },
    ],
  }),
  // BACKEND TODO: PUT /admin/templates/:id { name, channel, subject, body, vars }. Emit admin-audit.
  upsertTemplate: build.mutation<TemplateRow, UpsertTemplateArgs>({
    query: ({ id, ...body }) => ({
      url: `/admin/templates/${encodeURIComponent(id)}`,
      method: 'PUT',
      data: body,
    }),
    invalidatesTags: (_res, _err, arg) => [
      { type: API_TAGS.Notification, id: `template-${arg.id}` },
      { type: API_TAGS.Notification, id: 'TEMPLATE_LIST' },
    ],
  }),
});
