import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

const routesSource = readFileSync(join(process.cwd(), 'src/routes/index.tsx'), 'utf8');
const htaccessSource = readFileSync(join(process.cwd(), 'public/.htaccess'), 'utf8');

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
    expect(routesSource).toContain("{ path: '/painel/biteplaner', element: <PainelRoute><RequireBiteplanerLicense><BiteplanerHome /></RequireBiteplanerLicense></PainelRoute> }");
    expect(routesSource).not.toContain("{ path: '/painel/biteplaner', element: <Navigate to=\"/painel/compra\" replace /> }");
  });
  it('routes purchase confirmation and the lean admin commerce pages separately', () => {
    expect(routesSource).toContain("import { RequireAdmin, RequireAuth, RequireBiteplanerLicense, RequireNonAdmin } from '../features/auth/guards';");
    expect(routesSource).toContain('<RequireBiteplanerLicense><Compra /></RequireBiteplanerLicense>');
    expect(routesSource).toContain("{ path: '/painel/compra', element: <PainelRoute><RequireBiteplanerLicense><Compra /></RequireBiteplanerLicense></PainelRoute>, errorElement: routeErrorElement }");
    expect(routesSource).toContain("{ path: '/painel/confirmacao-compra', element: <PainelRoute><RequireBiteplanerLicense><Compra /></RequireBiteplanerLicense></PainelRoute>, errorElement: routeErrorElement }");
    expect(routesSource).toContain("{ path: '/painel/biteplaner/ordens', element: <PainelRoute><RequireBiteplanerLicense><BiteplanerOrders /></RequireBiteplanerLicense></PainelRoute> }");
    expect(routesSource).toContain("{ path: '/painel/biteplaner/ordens/:orderId', element: <PainelRoute><RequireBiteplanerLicense><BiteplanerOrderDetail /></RequireBiteplanerLicense></PainelRoute> }");
    expect(routesSource).toContain("{ path: '/painel/biteplaner/ordens/:orderId/complemento', element: <PainelRoute><RequireBiteplanerLicense><BiteplanerOrderCompletion /></RequireBiteplanerLicense></PainelRoute> }");
    expect(routesSource).toContain("{ path: '/painel/admin/home', element: <AdminPainelRoute><AdminHome /></AdminPainelRoute> }");
    expect(routesSource).toContain("{ path: '/painel/admin/ordens', element: <AdminPainelRoute><AdminOrders /></AdminPainelRoute> }");
    expect(routesSource).toContain("{ path: '/painel/admin/dentistas', element: <AdminPainelRoute><AdminDentistLicensing /></AdminPainelRoute> }");
    expect(routesSource).toContain("{ path: '/painel/admin/relatorios', element: <AdminPainelRoute><RelatoriosBiteplaner /></AdminPainelRoute> }");
    expect(routesSource).not.toContain('/painel/admin/pagamentos');
    expect(routesSource).not.toContain('/painel/admin/configuracoes');
  });

  it('does not keep the retired demo admin route or public asset path', () => {
    expect(existsSync(join(process.cwd(), 'public/demo-adm'))).toBe(false);
    expect(existsSync(join(process.cwd(), 'src/pages/DemoAdm/index.tsx'))).toBe(false);
    expect(routesSource).not.toContain('/demo-adm');
    expect(htaccessSource).not.toContain('demo-adm');
  });
});
