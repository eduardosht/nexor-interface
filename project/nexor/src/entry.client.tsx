import { StrictMode } from 'react';
import { hydrateRoot } from 'react-dom/client';
import { HydratedRouter } from 'react-router/dom';
import { installCookieConsentFallback } from './features/cookies/cookieConsentFallback';

installCookieConsentFallback(document);
hydrateRoot(document, <StrictMode><HydratedRouter /></StrictMode>);
