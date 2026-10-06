import { installCookieConsentFallback, REACT_READY_ATTRIBUTE } from './cookieConsentFallback';

const STORAGE_KEY = 'nexor-cookie-consent';

function renderStaticBanner() {
  document.body.innerHTML = `
    <div data-cookie-banner aria-label="Consentimento de cookies">
      <div data-cookie-actions>
        <button type="button" data-cookie-action="accept">Aceitar</button>
        <button type="button" data-cookie-action="reject">Recusar</button>
        <button type="button" data-cookie-action="manage">Gerenciar</button>
      </div>
      <div data-cookie-preferences-panel hidden>
        <input type="checkbox" data-cookie-preference="preferences" />
        <input type="checkbox" data-cookie-preference="analytics" />
        <button type="button" data-cookie-action="save">Salvar</button>
        <button type="button" data-cookie-action="close">Fechar</button>
      </div>
    </div>
  `;
}

describe('cookie consent fallback', () => {
  beforeEach(() => {
    window.localStorage.clear();
    renderStaticBanner();
  });

  it('persists acceptance and hides the banner without React hydration', () => {
    installCookieConsentFallback(document);

    document.querySelector<HTMLElement>('[data-cookie-action="accept"]')?.click();

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
      version: 1,
      necessary: true,
      preferences: true,
      analytics: true,
    });
    expect(document.querySelector('[data-cookie-banner]')).toHaveAttribute('hidden');
  });

  it('opens and saves the preferences panel without React hydration', () => {
    installCookieConsentFallback(document);

    document.querySelector<HTMLElement>('[data-cookie-action="manage"]')?.click();
    expect(document.querySelector('[data-cookie-preferences-panel]')).not.toHaveAttribute('hidden');

    document.querySelector<HTMLInputElement>('[data-cookie-preference="preferences"]')!.checked = true;
    document.querySelector<HTMLElement>('[data-cookie-action="save"]')?.click();

    expect(JSON.parse(window.localStorage.getItem(STORAGE_KEY) ?? '{}')).toMatchObject({
      version: 1,
      necessary: true,
      preferences: true,
      analytics: false,
    });
    expect(document.querySelector('[data-cookie-banner]')).toHaveAttribute('hidden');
  });

  it('leaves clicks to React after hydration is confirmed', () => {
    document.documentElement.setAttribute(REACT_READY_ATTRIBUTE, 'true');
    installCookieConsentFallback(document);

    document.querySelector<HTMLElement>('[data-cookie-action="accept"]')?.click();

    expect(window.localStorage.getItem(STORAGE_KEY)).toBeNull();
    expect(document.querySelector('[data-cookie-banner]')).not.toHaveAttribute('hidden');
  });
});
