import { describe, expect, it } from 'vitest';
import { buildReferralInviteCookie } from './referral-cookie';

describe('referral invite cookie', () => {
  it('adds Secure when the current page is HTTPS', () => {
    expect(buildReferralInviteCookie('bp-partner-demo-001', true)).toContain('; Secure');
  });

  it('keeps the local development cookie usable without Secure', () => {
    expect(buildReferralInviteCookie('bp-partner-demo-001', false)).not.toContain('; Secure');
  });
});
