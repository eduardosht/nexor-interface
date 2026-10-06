import {
  createAcceptedCookieConsent,
  createCustomCookieConsent,
  createRejectedCookieConsent,
  readCookieConsent,
  saveCookieConsent,
} from './storage';

const INSTALLATION_ATTRIBUTE = 'data-cookie-fallback-installed';
export const REACT_READY_ATTRIBUTE = 'data-cookie-consent-react-ready';

function getBanner(document: Document, target: Element): HTMLElement | null {
  return target.closest<HTMLElement>('[data-cookie-banner]') ?? document.querySelector<HTMLElement>('[data-cookie-banner]');
}

function setPreferencesMode(banner: HTMLElement, open: boolean) {
  const actions = banner.querySelector<HTMLElement>('[data-cookie-actions]');
  const panel = banner.querySelector<HTMLElement>('[data-cookie-preferences-panel]');

  if (actions) {
    actions.hidden = open;
  }

  if (panel) {
    panel.hidden = !open;
  }
}

function hideBanner(banner: HTMLElement) {
  banner.hidden = true;
}

export function installCookieConsentFallback(document: Document) {
  const banner = document.querySelector<HTMLElement>('[data-cookie-banner]');

  if (!banner || document.documentElement.hasAttribute(INSTALLATION_ATTRIBUTE)) {
    return;
  }

  document.documentElement.setAttribute(INSTALLATION_ATTRIBUTE, 'true');

  if (readCookieConsent()) {
    hideBanner(banner);
  }

  document.addEventListener('click', (event) => {
    const target = event.target;

    if (!(target instanceof Element)) {
      return;
    }

    const actionElement = target.closest<HTMLElement>('[data-cookie-action]');
    if (!actionElement) {
      return;
    }

    if (
      document.documentElement.hasAttribute(REACT_READY_ATTRIBUTE)
      && !actionElement.closest('[data-cookie-banner]')
    ) {
      return;
    }

    const action = actionElement.dataset.cookieAction;
    const activeBanner = getBanner(document, actionElement);

    if (!activeBanner) {
      return;
    }

    if (action === 'accept') {
      saveCookieConsent(createAcceptedCookieConsent());
      hideBanner(activeBanner);
      return;
    }

    if (action === 'reject') {
      saveCookieConsent(createRejectedCookieConsent());
      hideBanner(activeBanner);
      return;
    }

    if (action === 'manage') {
      activeBanner.hidden = false;
      setPreferencesMode(activeBanner, true);
      return;
    }

    if (action === 'close') {
      setPreferencesMode(activeBanner, false);
      return;
    }

    if (action === 'save') {
      const preferences = activeBanner.querySelector<HTMLInputElement>('[data-cookie-preference="preferences"]');
      const analytics = activeBanner.querySelector<HTMLInputElement>('[data-cookie-preference="analytics"]');

      saveCookieConsent(createCustomCookieConsent({
        preferences: preferences?.checked ?? false,
        analytics: analytics?.checked ?? false,
      }));
      hideBanner(activeBanner);
    }
  });
}
