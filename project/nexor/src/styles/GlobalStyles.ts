import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { margin: 0; padding: 0; }

  :root {
    --public-header-height: 64px;
    --public-mobile-nav-height: calc(64px + env(safe-area-inset-bottom));
  }

  body {
    background: ${({ theme }) => theme.colors.bgBase};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.fonts.body};
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    transition: background 200ms ease-in-out, color 200ms ease-in-out;
  }

  @media (max-width: 768px) {
    body {
      padding-bottom: var(--public-mobile-nav-height);
    }
  }

  h1, h2, h3, h4, h5, h6 { margin-bottom: 16px; }

  a { color: inherit; text-decoration: none; }

  .skip-link {
    position: fixed;
    top: 12px;
    left: 12px;
    z-index: 1000;
    transform: translateY(-160%);
    padding: 10px 14px;
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.textPrimary};
    color: #fff;
    font-size: 14px;
    font-weight: 700;
    text-decoration: none;
    transition: transform 120ms ease;
  }

  .skip-link:focus-visible {
    transform: translateY(0);
    outline: 3px solid #2f6df6;
    outline-offset: 2px;
  }

  :where(a, button, input, select, textarea, [tabindex]):focus-visible {
    outline: 3px solid #2f6df6;
    outline-offset: 3px;
  }

  button,
  button * {
    font-weight: 400 !important;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
  }
`;
