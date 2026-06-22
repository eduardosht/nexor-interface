import { useEffect, useLayoutEffect, useRef, useState } from 'react';
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
import { useAuth } from './hooks/useAuth';
import { api } from './lib/api';
import { getAccessibleScrollBehavior } from './lib/accessibility';

function ScrollToTop() {
  const { hash, pathname } = useLocation();

  useLayoutEffect(() => {
    if (hash) {
      return;
    }

    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [hash, pathname]);

  return null;
}

function ScrollToHash() {
  const { hash, pathname } = useLocation();

  useLayoutEffect(() => {
    if (!hash) {
      return;
    }

    const targetId = decodeURIComponent(hash.slice(1));

    window.requestAnimationFrame(() => {
      document.getElementById(targetId)?.scrollIntoView({ behavior: getAccessibleScrollBehavior(), block: 'start' });
    });
  }, [hash, pathname]);

  return null;
}

function RecoveryHashRedirect() {
  const { pathname } = useLocation();

  useEffect(() => {
    if (pathname !== '/') {
      return;
    }

    const hash = window.location.hash;

    if (!hash) {
      return;
    }

    const params = new URLSearchParams(hash.startsWith('#') ? hash.slice(1) : hash);
    const isRecovery = params.get('type') === 'recovery' && params.has('access_token');

    if (!isRecovery) {
      return;
    }

    window.location.replace(`${window.location.origin}/recuperar-senha${hash}`);
  }, [pathname]);

  return null;
}

function persistConsent(
  nextConsent: CookieConsentState,
  setCookieConsent: (value: CookieConsentState) => void,
  setShowCookiePreferences: (value: boolean) => void,
) {
  saveCookieConsent(nextConsent);
  setCookieConsent(nextConsent);
  setShowCookiePreferences(false);
}

function syncAuthenticatedCookieConsent(consent: CookieConsentState, token: string | undefined) {
  if (!token) {
    return;
  }

  void api.post(
    '/v1/account/cookie-consent',
    {
      version: consent.version,
      necessary: consent.necessary,
      preferences: consent.preferences,
      analytics: consent.analytics,
    },
    token,
  ).catch(() => {
    // Local consent remains the UX source of truth for anonymous browsing.
  });
}

export function Layout() {
  const { session } = useAuth();
  const [cookieConsent, setCookieConsent] = useState<CookieConsentState | null>(() => readCookieConsent());
  const [showCookiePreferences, setShowCookiePreferences] = useState(false);
  const syncedConsentRef = useRef<string | null>(null);

  useEffect(() => {
    if (!cookieConsent || !session?.access_token) {
      return;
    }

    const syncKey = `${session.access_token}:${cookieConsent.updatedAt}`;

    if (syncedConsentRef.current === syncKey) {
      return;
    }

    syncedConsentRef.current = syncKey;
    syncAuthenticatedCookieConsent(cookieConsent, session.access_token);
  }, [cookieConsent, session?.access_token]);

  const handleAcceptCookies = () => {
    persistConsent(createAcceptedCookieConsent(), setCookieConsent, setShowCookiePreferences);
  };

  const handleRejectCookies = () => {
    persistConsent(createRejectedCookieConsent(), setCookieConsent, setShowCookiePreferences);
  };

  const handleSaveCookiePreferences = (draft: CookieConsentDraft) => {
    persistConsent(createCustomCookieConsent(draft), setCookieConsent, setShowCookiePreferences);
  };

  return (
    <>
      <ScrollToTop />
      <ScrollToHash />
      <RecoveryHashRedirect />
      <a className="skip-link" href="#main-content">Pular para o conteúdo principal</a>
      <Header />
      <Outlet />
      <Footer onManageCookies={() => setShowCookiePreferences(true)} />
      <CookieConsentBanner
        consent={cookieConsent}
        isVisible={cookieConsent === null || showCookiePreferences}
        showPreferences={showCookiePreferences}
        onAcceptAll={handleAcceptCookies}
        onRejectAll={handleRejectCookies}
        onOpenPreferences={() => setShowCookiePreferences(true)}
        onSavePreferences={handleSaveCookiePreferences}
        onClosePreferences={() => setShowCookiePreferences(false)}
      />
    </>
  );
}
