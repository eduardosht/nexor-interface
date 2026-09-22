import { useLayoutEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Footer } from './components/Footer';
import { Header } from './components/Header';
import { CookieConsentBanner } from './features/cookies/CookieConsentBanner';
import {
  createAcceptedCookieConsent,
  createCustomCookieConsent,
  createRejectedCookieConsent,
  readCookieConsent,
  saveCookieConsent,
  type CookieConsentDraft,
  type CookieConsentState,
} from './features/cookies/storage';
import { getAccessibleScrollBehavior } from './lib/accessibility';

function ScrollManager() {
  const { hash, pathname } = useLocation();

  useLayoutEffect(() => {
    if (!hash) {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      return;
    }

    window.requestAnimationFrame(() => {
      document.getElementById(decodeURIComponent(hash.slice(1)))?.scrollIntoView({
        behavior: getAccessibleScrollBehavior(),
        block: 'start',
      });
    });
  }, [hash, pathname]);

  return null;
}

export function PublicLayout() {
  const [cookieConsent, setCookieConsent] = useState<CookieConsentState | null>(() => readCookieConsent());
  const [showCookiePreferences, setShowCookiePreferences] = useState(false);

  const persist = (consent: CookieConsentState) => {
    saveCookieConsent(consent);
    setCookieConsent(consent);
    setShowCookiePreferences(false);
  };

  const handleSavePreferences = (draft: CookieConsentDraft) => persist(createCustomCookieConsent(draft));

  return (
    <>
      <ScrollManager />
      <a className="skip-link" href="#main-content">Pular para o conteúdo principal</a>
      <Header />
      <Outlet />
      <Footer onManageCookies={() => setShowCookiePreferences(true)} />
      <CookieConsentBanner
        consent={cookieConsent}
        isVisible={cookieConsent === null || showCookiePreferences}
        showPreferences={showCookiePreferences}
        onAcceptAll={() => persist(createAcceptedCookieConsent())}
        onRejectAll={() => persist(createRejectedCookieConsent())}
        onOpenPreferences={() => setShowCookiePreferences(true)}
        onSavePreferences={handleSavePreferences}
        onClosePreferences={() => setShowCookiePreferences(false)}
      />
    </>
  );
}
