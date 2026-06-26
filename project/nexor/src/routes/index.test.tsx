import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const routesSource = readFileSync(join(process.cwd(), 'src/routes/index.tsx'), 'utf8');
const htaccessSource = readFileSync(join(process.cwd(), 'public/.htaccess'), 'utf8');
const demoAdmSource = readFileSync(join(process.cwd(), 'src/pages/DemoAdm/index.tsx'), 'utf8');

describe('routes', () => {
  it('lazy-loads public marketing pages instead of importing them into the entry chunk', () => {
    expect(routesSource).toContain("lazy(() => import('../pages/Home')");
    expect(routesSource).toContain("lazy(() => import('../pages/BiteplanerPage')");
    expect(routesSource).not.toContain("import { Home } from '../pages/Home'");
    expect(routesSource).not.toContain("import { BiteplanerPage } from '../pages/BiteplanerPage'");
  });

  it('wraps lazy routes with an application error boundary', () => {
    expect(routesSource).toContain("import { ErrorBoundary, RouteErrorFallback } from './RouteErrorFallback'");
    expect(routesSource).toContain('<ErrorBoundary>');
    expect(routesSource).toContain('errorElement: routeErrorElement');
  });

  it('keeps administrative panel buttons at least 100px wide', () => {
    expect(routesSource).toContain('<AdminRouteViewport>');
    expect(routesSource).toContain('const AdminRouteViewport = styled.div`');
    expect(routesSource).toContain('min-width: 100px;');
  });

  it('exposes the Biteplaner care guide at the requested public URL', () => {
    expect(routesSource).toContain("{ path: '/conheca-biteplaner', element: <LazyRoute><ConhecaOBiteplaner /></LazyRoute> }");
  });

  it('exposes a protected notifications page in the user panel', () => {
    expect(routesSource).toContain("const Notificacoes = lazy(() => import('../pages/painel/Notificacoes')");
    expect(routesSource).toContain("{ path: '/painel/notificacoes', element: <PainelRoute><Notificacoes /></PainelRoute> }");
  });

  it('routes purchase confirmation and admin payment operations separately', () => {
    expect(routesSource).toContain("const AdminPayments = lazy(() => import('../pages/painel/admin/AdminPayments')");
    expect(routesSource).toContain("{ path: '/painel/compra', element: <PainelRoute><Compra /></PainelRoute>, errorElement: routeErrorElement }");
    expect(routesSource).toContain("{ path: '/painel/confirmacao-compra', element: <PainelRoute><Compra /></PainelRoute>, errorElement: routeErrorElement }");
    expect(routesSource).toContain("{ path: '/painel/admin/pagamentos', element: <AdminPainelRoute><AdminPayments /></AdminPainelRoute> }");
  });

  it('rewrites the demo admin route before Apache treats the asset folder as a directory', () => {
    const demoAdmRewriteIndex = htaccessSource.indexOf('RewriteRule ^demo-adm/?$ /index.html [L]');
    const directorySkipIndex = htaccessSource.indexOf('RewriteCond %{REQUEST_FILENAME} !-d');

    expect(demoAdmRewriteIndex).toBeGreaterThanOrEqual(0);
    expect(directorySkipIndex).toBeGreaterThanOrEqual(0);
    expect(demoAdmRewriteIndex).toBeLessThan(directorySkipIndex);
  });

  it('keeps demo admin assets away from the public route path', () => {
    expect(existsSync(join(process.cwd(), 'public/demo-adm'))).toBe(false);
    expect(demoAdmSource).not.toContain('/demo-adm/assets/');
  });
});
