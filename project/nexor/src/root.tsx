import { Links, Meta, Outlet, Scripts, ScrollRestoration } from 'react-router';
import { initDesignSystem } from '@nexor/design-system';
import { ThemeProvider } from 'styled-components';
import { GlobalStyles } from './styles/GlobalStyles';
import { lightTheme } from './styles/theme';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta name="description" content="Nexor Biteplaner conecta dentistas licenciados e operação Nexor em uma jornada de compra, produção externa e acompanhamento com privacidade, segurança e rastreabilidade." />
        <meta name="theme-color" content="#f7f8fb" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Nexor Biteplaner" />
        <meta property="og:description" content="Jornada Biteplaner com compra direta do dentista, operação Nexor, privacidade e rastreabilidade." />
        <meta property="og:locale" content="pt_BR" />
        <meta property="og:site_name" content="Nexor" />
        <link rel="icon" type="image/png" href="/favicon-96x96.png" sizes="96x96" />
        <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Orbitron:wght@500;600;700;800&display=swap" rel="stylesheet" />
        <title>Nexor Biteplaner | Plataforma operacional e clínica</title>
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function Root() {
  return (
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <GlobalStyles />
        <Outlet />
      </DesignSystemRoot>
    </ThemeProvider>
  );
}
