import { readStorageJson, writeStorageJson } from '../../lib/browser-storage';

export const COOKIE_CONSENT_STORAGE_KEY = 'nexor-cookie-consent';
export const COOKIE_CONSENT_VERSION = 1;

export type CookieConsentState = {
  version: number;
  necessary: true;
  preferences: boolean;
  analytics: boolean;
  updatedAt: string;
};

export type CookieConsentDraft = Pick<CookieConsentState, 'preferences' | 'analytics'>;

function buildConsentState(draft: CookieConsentDraft): CookieConsentState {
  return {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    preferences: draft.preferences,
    analytics: draft.analytics,
    updatedAt: new Date().toISOString(),
  };
}

export function createAcceptedCookieConsent(): CookieConsentState {
  return buildConsentState({ preferences: true, analytics: true });
}

export function createRejectedCookieConsent(): CookieConsentState {
  return buildConsentState({ preferences: false, analytics: false });
}

export function createCustomCookieConsent(draft: CookieConsentDraft): CookieConsentState {
  return buildConsentState(draft);
}

export function readCookieConsent(): CookieConsentState | null {
  const parsed = readStorageJson<Partial<CookieConsentState>>(COOKIE_CONSENT_STORAGE_KEY);

  if (
    !parsed ||
    parsed.version !== COOKIE_CONSENT_VERSION ||
    parsed.necessary !== true ||
    typeof parsed.preferences !== 'boolean' ||
    typeof parsed.analytics !== 'boolean' ||
    typeof parsed.updatedAt !== 'string'
  ) {
    return null;
  }

  return {
    version: COOKIE_CONSENT_VERSION,
    necessary: true,
    preferences: parsed.preferences,
    analytics: parsed.analytics,
    updatedAt: parsed.updatedAt,
  };
}

export function saveCookieConsent(consent: CookieConsentState) {
  writeStorageJson(COOKIE_CONSENT_STORAGE_KEY, consent);
}
