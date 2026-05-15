import { createGlobalStyle } from 'styled-components';

export const GlobalStyles = createGlobalStyle`
  *, *::before, *::after { box-sizing: border-box; }
  html, body, #root { margin: 0; padding: 0; }

  body {
    background: ${({ theme }) => theme.colors.bgBase};
    color: ${({ theme }) => theme.colors.textPrimary};
    font-family: ${({ theme }) => theme.fonts.body};
    font-weight: 400;
    -webkit-font-smoothing: antialiased;
    transition: background 200ms ease-in-out, color 200ms ease-in-out;
  }

  h1, h2, h3, h4, h5, h6 { margin-bottom: 16px; }

  a { color: inherit; text-decoration: none; }

  button,
  button * {
    font-weight: 400 !important;
  }

  @media (prefers-reduced-motion: reduce) {
    *, *::before, *::after {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
`;
