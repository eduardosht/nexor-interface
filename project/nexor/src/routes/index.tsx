import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import styled from 'styled-components';
import { RequireAdmin, RequireAuth, RequireBiteplanerLicense, RequireNonAdmin } from '../features/auth/guards';
import { Layout } from '../Layout';
import { PortalLayout } from '../components/portal/PortalLayout';
import { AdminPortalProvider } from '../features/admin/portal';
import { useAuth } from '../hooks/useAuth';
import { ErrorBoundary, RouteErrorFallback } from './RouteErrorFallback';

const Home = lazy(() => import('../pages/Home').then(({ Home }) => ({ default: Home })));
const Privacidade = lazy(() => import('../pages/Privacidade').then(({ Privacidade }) => ({ default: Privacidade })));
const Termos = lazy(() => import('../pages/Termos').then(({ Termos }) => ({ default: Termos })));
const Cookies = lazy(() => import('../pages/Cookies').then(({ Cookies }) => ({ default: Cookies })));
const Login = lazy(() => import('../pages/Login').then(({ Login }) => ({ default: Login })));
const Cadastro = lazy(() => import('../pages/Cadastro').then(({ Cadastro }) => ({ default: Cadastro })));
const RecuperarSenha = lazy(() => import('../pages/RecuperarSenha').then(({ RecuperarSenha }) => ({ default: RecuperarSenha })));
const Sobre = lazy(() => import('../pages/Sobre').then(({ Sobre }) => ({ default: Sobre })));
const BiteplanerPage = lazy(() => import('../pages/BiteplanerPage').then(({ BiteplanerPage }) => ({ default: BiteplanerPage })));
const ConhecaOBiteplaner = lazy(() => import('../pages/ConhecaOBiteplaner').then(({ ConhecaOBiteplaner }) => ({ default: ConhecaOBiteplaner })));
const Parceiros = lazy(() => import('../pages/Parceiros').then(({ Parceiros }) => ({ default: Parceiros })));
const PainelHome = lazy(() => import('../pages/painel/PainelHome').then(({ PainelHome }) => ({ default: PainelHome })));
const CadastroPerfilBiteplaner = lazy(() => import('../pages/painel/CadastroPerfilBiteplaner').then(({ CadastroPerfilBiteplaner }) => ({ default: CadastroPerfilBiteplaner })));
const MinhaConta = lazy(() => import('../pages/painel/MinhaConta').then(({ MinhaConta }) => ({ default: MinhaConta })));
const Notificacoes = lazy(() => import('../pages/painel/Notificacoes').then(({ Notificacoes }) => ({ default: Notificacoes })));
const Compra = lazy(() => import('../pages/painel/Compra').then(({ Compra }) => ({ default: Compra })));
const BiteplanerHome = lazy(() => import('../pages/painel/BiteplanerHome').then(({ BiteplanerHome }) => ({ default: BiteplanerHome })));
const BiteplanerOrders = lazy(() => import('../pages/painel/BiteplanerOrders').then(({ BiteplanerOrders }) => ({ default: BiteplanerOrders })));
const BiteplanerOrderDetail = lazy(() => import('../pages/painel/BiteplanerOrders').then(({ BiteplanerOrderDetail }) => ({ default: BiteplanerOrderDetail })));
const BiteplanerOrderCompletion = lazy(() => import('../pages/painel/BiteplanerOrders').then(({ BiteplanerOrderCompletion }) => ({ default: BiteplanerOrderCompletion })));
const PartnerReferralPage = lazy(() => import('../pages/painel/PartnerReferralPage').then(({ PartnerReferralPage }) => ({ default: PartnerReferralPage })));
const RelatoriosBiteplaner = lazy(() => import('../pages/painel/RelatoriosBiteplaner').then(({ RelatoriosBiteplaner }) => ({ default: RelatoriosBiteplaner })));
const AdminHome = lazy(() => import('../pages/painel/admin/AdminHome').then(({ AdminHome }) => ({ default: AdminHome })));
const AdminOrders = lazy(() => import('../pages/painel/admin/AdminOrders').then(({ AdminOrders }) => ({ default: AdminOrders })));
const AdminLaboratories = lazy(() => import('../pages/painel/admin/AdminLaboratories').then(({ AdminLaboratories }) => ({ default: AdminLaboratories })));
const AdminDentistLicensing = lazy(() => import('../pages/painel/admin/AdminDentistLicensing').then(({ AdminDentistLicensing }) => ({ default: AdminDentistLicensing })));

function LazyRoute({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>{children}</Suspense>
    </ErrorBoundary>
  );
}

function PainelRoute({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <RequireNonAdmin>
        <PortalLayout>
          <LazyRoute>{children}</LazyRoute>
        </PortalLayout>
      </RequireNonAdmin>
    </RequireAuth>
  );
}

function AdminPainelRoute({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <RequireAdmin>
        <AdminPortalProvider>
          <PortalLayout>
            <AdminRouteViewport>
              <LazyRoute>{children}</LazyRoute>
            </AdminRouteViewport>
          </PortalLayout>
        </AdminPortalProvider>
      </RequireAdmin>
    </RequireAuth>
  );
}

const AdminRouteViewport = styled.div`
  min-width: 100px;
`;

function AccountRedirect() {
  const { loading, session, backendUser, backendUserResolved } = useAuth();

  if (loading || (session && !backendUserResolved)) {
    return null;
  }

  if (!session) {
    return <Navigate to="/entrar" replace />;
  }

  return <Navigate to={backendUser?.roles.includes('admin') ? '/painel/admin/home' : '/painel/conta'} replace />;
}

function PortalRootRedirect() {
  const { loading, session, backendUser, backendUserResolved } = useAuth();

  if (loading || (session && !backendUserResolved)) {
    return null;
  }

  if (!session) {
    return <Navigate to="/entrar" replace />;
  }

  return <Navigate to={backendUser?.roles.includes('admin') ? '/painel/admin/home' : '/painel/home'} replace />;
}

function ProtectedRedirect({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      {children}
    </RequireAuth>
  );
}

const routeErrorElement = <RouteErrorFallback />;

export const router = createBrowserRouter([
  {
    element: <Layout />,
    errorElement: routeErrorElement,
    children: [
      { path: '/', element: <LazyRoute><Home /></LazyRoute> },
      { path: '/sobre', element: <LazyRoute><Sobre /></LazyRoute> },
      { path: '/biteplaner', element: <LazyRoute><BiteplanerPage /></LazyRoute> },
      { path: '/conheca-biteplaner', element: <LazyRoute><ConhecaOBiteplaner /></LazyRoute> },
      { path: '/conheca-o-biteplaner', element: <LazyRoute><ConhecaOBiteplaner /></LazyRoute> },
      { path: '/parceiros', element: <LazyRoute><Parceiros /></LazyRoute> },
      { path: '/privacidade', element: <LazyRoute><Privacidade /></LazyRoute> },
      { path: '/termos', element: <LazyRoute><Termos /></LazyRoute> },
      { path: '/cookies', element: <LazyRoute><Cookies /></LazyRoute> },
    ],
  },
  { path: '/entrar', element: <LazyRoute><Login /></LazyRoute> },
  { path: '/cadastro', element: <LazyRoute><Cadastro /></LazyRoute> },
  { path: '/recuperar-senha', element: <LazyRoute><RecuperarSenha /></LazyRoute> },
  { path: '/conta', element: <ProtectedRedirect><AccountRedirect /></ProtectedRedirect> },
  { path: '/painel', element: <ProtectedRedirect><PortalRootRedirect /></ProtectedRedirect> },
  { path: '/painel/home', element: <PainelRoute><PainelHome /></PainelRoute> },
  { path: '/painel/biteplaner/onboarding', element: <Navigate to="/painel/compra" replace /> },
  { path: '/painel/biteplaner/cadastro/:role', element: <PainelRoute><CadastroPerfilBiteplaner /></PainelRoute> },
  { path: '/painel/conta', element: <PainelRoute><MinhaConta /></PainelRoute> },
  { path: '/painel/notificacoes', element: <PainelRoute><Notificacoes /></PainelRoute> },
  { path: '/painel/pre-requisito', element: <Navigate to="/painel/compra" replace /> },
  { path: '/painel/pre-consulta', element: <Navigate to="/painel/compra" replace /> },
  { path: '/painel/consulta-inicial', element: <Navigate to="/painel/compra" replace /> },
  { path: '/painel/compra', element: <PainelRoute><RequireBiteplanerLicense><Compra /></RequireBiteplanerLicense></PainelRoute>, errorElement: routeErrorElement },
  { path: '/painel/confirmacao-compra', element: <PainelRoute><RequireBiteplanerLicense><Compra /></RequireBiteplanerLicense></PainelRoute>, errorElement: routeErrorElement },
  { path: '/painel/biteplaner', element: <PainelRoute><RequireBiteplanerLicense><BiteplanerHome /></RequireBiteplanerLicense></PainelRoute> },
  { path: '/painel/biteplaner/ordens', element: <PainelRoute><RequireBiteplanerLicense><BiteplanerOrders /></RequireBiteplanerLicense></PainelRoute> },
  { path: '/painel/biteplaner/ordens/:orderId', element: <PainelRoute><RequireBiteplanerLicense><BiteplanerOrderDetail /></RequireBiteplanerLicense></PainelRoute> },
  { path: '/painel/biteplaner/ordens/:orderId/complemento', element: <PainelRoute><RequireBiteplanerLicense><BiteplanerOrderCompletion /></RequireBiteplanerLicense></PainelRoute> },
  { path: '/painel/biteplaner/indicar', element: <PainelRoute><PartnerReferralPage /></PainelRoute> },
  { path: '/painel/biteplaner/avaliacoes', element: <Navigate to="/painel/home" replace /> },
  { path: '/painel/biteplaner/jornada', element: <Navigate to="/painel/home" replace /> },
  { path: '/painel/dentista/producao/:orderId', element: <Navigate to="/painel/home" replace /> },
  { path: '/painel/admin/home', element: <AdminPainelRoute><AdminHome /></AdminPainelRoute> },
  { path: '/painel/admin/ordens', element: <AdminPainelRoute><AdminOrders /></AdminPainelRoute> },
  { path: '/painel/admin/laboratorios', element: <AdminPainelRoute><AdminLaboratories /></AdminPainelRoute> },
  { path: '/painel/admin/relatorios', element: <AdminPainelRoute><RelatoriosBiteplaner /></AdminPainelRoute> },
  { path: '/painel/admin/dentistas', element: <AdminPainelRoute><AdminDentistLicensing /></AdminPainelRoute> },
  { path: '*', element: <Navigate to="/" replace /> },
]);
