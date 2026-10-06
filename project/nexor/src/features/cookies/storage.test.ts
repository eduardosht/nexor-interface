import {
  COOKIE_CONSENT_MAX_AGE_MS,
  COOKIE_CONSENT_STORAGE_KEY,
  createAcceptedCookieConsent,
  readCookieConsent,
} from './storage';

describe('cookie consent storage', () => {
  beforeEach(() => {
    window.localStorage.clear();
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-10-06T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('keeps a consent decision valid for twelve months', () => {
    const consent = createAcceptedCookieConsent();
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));

    vi.setSystemTime(new Date(consent.updatedAt).getTime() + COOKIE_CONSENT_MAX_AGE_MS - 1);

    expect(readCookieConsent()).toEqual(consent);
  });

  it('requires consent again after twelve months', () => {
    const consent = createAcceptedCookieConsent();
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, JSON.stringify(consent));

    vi.setSystemTime(new Date(consent.updatedAt).getTime() + COOKIE_CONSENT_MAX_AGE_MS + 1);

    expect(readCookieConsent()).toBeNull();
  });
});
