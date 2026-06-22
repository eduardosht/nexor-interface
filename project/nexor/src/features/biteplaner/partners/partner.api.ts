import { api } from '../../../lib/api';
import type { PartnerOverviewResponse } from './partner.types';

export const fetchPartnerOverview = (token?: string) =>
  api.get<PartnerOverviewResponse>('/v1/partner/invite-links', token);

export const createPartnerInviteLink = (
  payload: { customerName?: string; customerEmail?: string },
  token?: string,
) =>
  api.post<{ inviteLink: PartnerOverviewResponse['inviteLinks'][number] }>(
    '/v1/partner/invite-links',
    payload,
    token,
  );

export const removePartnerInviteLink = (inviteLinkId: string, token?: string) =>
  api.patch<{ inviteLink: PartnerOverviewResponse['inviteLinks'][number] }>(
    `/v1/partner/invite-links/${encodeURIComponent(inviteLinkId)}/remove`,
    {},
    token,
  );
