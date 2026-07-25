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

  it('routes Biteplaner home to its dashboard page instead of purchase', () => {
    expect(routesSource).toContain("const BiteplanerHome = lazy(() => import('../pages/painel/BiteplanerHome')");
    expect(routesSource).toContain("{ path: '/painel/biteplaner', element: <PainelRoute><BiteplanerHome /></PainelRoute> }");
    expect(routesSource).not.toContain("{ path: '/painel/biteplaner', element: <Navigate to=\"/painel/compra\" replace /> }");
  });
  it('routes purchase confirmation and the lean admin commerce pages separately', () => {
    expect(routesSource).toContain("{ path: '/painel/compra', element: <PainelRoute><Compra /></PainelRoute>, errorElement: routeErrorElement }");
    expect(routesSource).toContain("{ path: '/painel/confirmacao-compra', element: <PainelRoute><Compra /></PainelRoute>, errorElement: routeErrorElement }");
    expect(routesSource).toContain("{ path: '/painel/biteplaner/ordens', element: <PainelRoute><BiteplanerOrders /></PainelRoute> }");
    expect(routesSource).toContain("{ path: '/painel/biteplaner/ordens/:orderId', element: <PainelRoute><BiteplanerOrderDetail /></PainelRoute> }");
    expect(routesSource).toContain("{ path: '/painel/biteplaner/ordens/:orderId/complemento', element: <PainelRoute><BiteplanerOrderCompletion /></PainelRoute> }");
    expect(routesSource).toContain("{ path: '/painel/admin/home', element: <AdminPainelRoute><AdminHome /></AdminPainelRoute> }");
    expect(routesSource).toContain("{ path: '/painel/admin/ordens', element: <AdminPainelRoute><AdminOrders /></AdminPainelRoute> }");
    expect(routesSource).toContain("{ path: '/painel/admin/dentistas', element: <AdminPainelRoute><AdminDentistLicensing /></AdminPainelRoute> }");
    expect(routesSource).toContain("{ path: '/painel/admin/relatorios', element: <AdminPainelRoute><RelatoriosBiteplaner /></AdminPainelRoute> }");
    expect(routesSource).not.toContain('/painel/admin/pagamentos');
    expect(routesSource).not.toContain('/painel/admin/configuracoes');
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
