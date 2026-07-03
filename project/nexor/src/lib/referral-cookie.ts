export const REFERRAL_COOKIE_NAME = 'nexor_partner_invite';

const MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

const isSecureContext = (): boolean =>
  typeof window !== 'undefined' && window.location.protocol === 'https:';

export function buildReferralInviteCookie(token: string, secure: boolean): string {
  const secureFlag = secure ? '; Secure' : '';
  return `${REFERRAL_COOKIE_NAME}=${encodeURIComponent(token)}; path=/; max-age=${MAX_AGE_SECONDS}; SameSite=Lax${secureFlag}`;
}

export function saveReferralInviteToken(token: string): void {
  const trimmed = token.trim();
  if (!trimmed || typeof document === 'undefined') return;

  document.cookie = buildReferralInviteCookie(trimmed, isSecureContext());
}

export function readReferralInviteToken(): string {
  if (typeof document === 'undefined') return '';

  const cookie = document.cookie
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith(`${REFERRAL_COOKIE_NAME}=`));

  return cookie ? decodeURIComponent(cookie.split('=').slice(1).join('=')) : '';
}

export function clearReferralInviteToken(): void {
  if (typeof document === 'undefined') return;
  const secureFlag = isSecureContext() ? '; Secure' : '';
  document.cookie = `${REFERRAL_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax${secureFlag}`;
}
