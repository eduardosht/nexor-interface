import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../../lib/api';
import {
  createPartnerInviteLink,
  fetchPartnerOverview,
  removePartnerInviteLink,
} from './partner.api';
import { partnerQueryKeys } from './partnerQueryKeys';

vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    patch: vi.fn(),
    post: vi.fn(),
  },
}));

const apiGet = vi.mocked(api.get);
const apiPatch = vi.mocked(api.patch);
const apiPost = vi.mocked(api.post);

describe('partner api module', () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPatch.mockReset();
    apiPost.mockReset();
  });

  it('keeps partner invite routes close to the partner domain', async () => {
    apiGet.mockResolvedValue({ inviteLinks: [] });
    apiPost.mockResolvedValue({ inviteLink: { id: 'link-1' } });
    apiPatch.mockResolvedValue({ inviteLink: { id: 'link-1' } });

    await fetchPartnerOverview('tok');
    await createPartnerInviteLink({ customerName: 'Cliente', customerEmail: 'cliente@nexor.test' }, 'tok');
    await removePartnerInviteLink('link-1', 'tok');

    expect(apiGet).toHaveBeenCalledWith('/v1/partner/invite-links', 'tok');
    expect(apiPost).toHaveBeenCalledWith(
      '/v1/partner/invite-links',
      { customerName: 'Cliente', customerEmail: 'cliente@nexor.test' },
      'tok',
    );
    expect(apiPatch).toHaveBeenCalledWith('/v1/partner/invite-links/link-1/remove', {}, 'tok');
  });

  it('exposes partner query keys', () => {
    expect(partnerQueryKeys.inviteLinks('partner-1')).toEqual([
      'biteplaner',
      'partners',
      'overview',
      'partner-1',
      'invite-links',
    ]);
  });
});

