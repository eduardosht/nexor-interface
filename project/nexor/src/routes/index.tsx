import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAdmin, RequireAuth, RequireNonAdmin } from '../features/auth/guards';
import { Layout } from '../Layout';
import { PortalLayout } from '../components/portal/PortalLayout';
import { AdminPortalProvider } from '../features/admin/portal';
import { useAuth } from '../hooks/useAuth';

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
const DemoAdm = lazy(() => import('../pages/DemoAdm').then(({ DemoAdm }) => ({ default: DemoAdm })));
const PainelHome = lazy(() => import('../pages/painel/PainelHome').then(({ PainelHome }) => ({ default: PainelHome })));
const CadastroPerfilBiteplaner = lazy(() => import('../pages/painel/CadastroPerfilBiteplaner').then(({ CadastroPerfilBiteplaner }) => ({ default: CadastroPerfilBiteplaner })));
const CadastroUsuarioBiteplaner = lazy(() => import('../pages/painel/CadastroUsuarioBiteplaner').then(({ CadastroUsuarioBiteplaner }) => ({ default: CadastroUsuarioBiteplaner })));
const MinhaConta = lazy(() => import('../pages/painel/MinhaConta').then(({ MinhaConta }) => ({ default: MinhaConta })));
const PreRequisito = lazy(() => import('../pages/painel/PreRequisito').then(({ PreRequisito }) => ({ default: PreRequisito })));
const ConsultaInicial = lazy(() => import('../pages/painel/ConsultaInicial').then(({ ConsultaInicial }) => ({ default: ConsultaInicial })));
const Compra = lazy(() => import('../pages/painel/Compra').then(({ Compra }) => ({ default: Compra })));
const BiteplanerHub = lazy(() => import('../pages/painel/BiteplanerHub').then(({ BiteplanerHub }) => ({ default: BiteplanerHub })));
const PartnerReferralPage = lazy(() => import('../pages/painel/PartnerReferralPage').then(({ PartnerReferralPage }) => ({ default: PartnerReferralPage })));
const Avaliacoes = lazy(() => import('../pages/painel/Avaliacoes').then(({ Avaliacoes }) => ({ default: Avaliacoes })));
const Jornada = lazy(() => import('../pages/painel/Jornada').then(({ Jornada }) => ({ default: Jornada })));
const ProducaoDentista = lazy(() => import('../pages/painel/ProducaoDentista').then(({ ProducaoDentista }) => ({ default: ProducaoDentista })));
const AdminHome = lazy(() => import('../pages/painel/admin/AdminHome').then(({ AdminHome }) => ({ default: AdminHome })));
const AdminOrders = lazy(() => import('../pages/painel/admin/AdminOrders').then(({ AdminOrders }) => ({ default: AdminOrders })));
const RelatoriosBiteplaner = lazy(() => import('../pages/painel/RelatoriosBiteplaner').then(({ RelatoriosBiteplaner }) => ({ default: RelatoriosBiteplaner })));
const AdminDentistLicensing = lazy(() => import('../pages/painel/admin/AdminDentistLicensing').then(({ AdminDentistLicensing }) => ({ default: AdminDentistLicensing })));
const AdminLabLicensing = lazy(() => import('../pages/painel/admin/AdminLabLicensing').then(({ AdminLabLicensing }) => ({ default: AdminLabLicensing })));
const AdminPartnerLicensing = lazy(() => import('../pages/painel/admin/AdminPartnerLicensing').then(({ AdminPartnerLicensing }) => ({ default: AdminPartnerLicensing })));
const AdminAccountDeletions = lazy(() => import('../pages/painel/admin/AdminAccountDeletions').then(({ AdminAccountDeletions }) => ({ default: AdminAccountDeletions })));
const AdminUsers = lazy(() => import('../pages/painel/admin/AdminUsers').then(({ AdminUsers }) => ({ default: AdminUsers })));
const AdminBusinessSettings = lazy(() => import('../pages/painel/admin/AdminBusinessSettings').then(({ AdminBusinessSettings }) => ({ default: AdminBusinessSettings })));
const AdminSystemSettings = lazy(() => import('../pages/painel/admin/AdminSystemSettings').then(({ AdminSystemSettings }) => ({ default: AdminSystemSettings })));

function LazyRoute({ children }: { children: ReactNode }) {
  return <Suspense fallback={null}>{children}</Suspense>;
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
            <LazyRoute>{children}</LazyRoute>
          </PortalLayout>
        </AdminPortalProvider>
      </RequireAdmin>
    </RequireAuth>
  );
}

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

export const router = createBrowserRouter([
  {
    element: <Layout />,
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
  { path: '/demo-adm', element: <LazyRoute><DemoAdm /></LazyRoute> },
  { path: '/conta', element: <ProtectedRedirect><AccountRedirect /></ProtectedRedirect> },
  { path: '/painel', element: <ProtectedRedirect><PortalRootRedirect /></ProtectedRedirect> },
  { path: '/painel/home', element: <PainelRoute><PainelHome /></PainelRoute> },
  { path: '/painel/biteplaner/onboarding', element: <PainelRoute><CadastroUsuarioBiteplaner /></PainelRoute> },
  { path: '/painel/biteplaner/cadastro/:role', element: <PainelRoute><CadastroPerfilBiteplaner /></PainelRoute> },
  { path: '/painel/conta', element: <PainelRoute><MinhaConta /></PainelRoute> },
  { path: '/painel/pre-requisito', element: <PainelRoute><PreRequisito /></PainelRoute> },
  { path: '/painel/consulta-inicial', element: <PainelRoute><ConsultaInicial /></PainelRoute> },
  { path: '/painel/compra', element: <PainelRoute><Compra /></PainelRoute> },
  { path: '/painel/biteplaner', element: <PainelRoute><BiteplanerHub /></PainelRoute> },
  { path: '/painel/biteplaner/licenciamento', element: <PainelRoute><BiteplanerHub /></PainelRoute> },
  { path: '/painel/biteplaner/indicar', element: <PainelRoute><PartnerReferralPage /></PainelRoute> },
  { path: '/painel/biteplaner/avaliacoes', element: <PainelRoute><Avaliacoes /></PainelRoute> },
  { path: '/painel/biteplaner/jornada', element: <PainelRoute><Jornada /></PainelRoute> },
  { path: '/painel/dentista/producao/:orderId', element: <PainelRoute><ProducaoDentista /></PainelRoute> },
  { path: '/painel/admin/home', element: <AdminPainelRoute><AdminHome /></AdminPainelRoute> },
  { path: '/painel/admin/ordens', element: <AdminPainelRoute><AdminOrders /></AdminPainelRoute> },
  { path: '/painel/admin/relatorios', element: <AdminPainelRoute><RelatoriosBiteplaner /></AdminPainelRoute> },
  { path: '/painel/admin/parceiros', element: <AdminPainelRoute><AdminPartnerLicensing /></AdminPainelRoute> },
  { path: '/painel/admin/remocoes-conta', element: <AdminPainelRoute><AdminAccountDeletions /></AdminPainelRoute> },
  { path: '/painel/admin/dentistas', element: <AdminPainelRoute><AdminDentistLicensing /></AdminPainelRoute> },
  { path: '/painel/admin/laboratórios', element: <AdminPainelRoute><AdminLabLicensing /></AdminPainelRoute> },
  { path: '/painel/admin/laboratorios', element: <AdminPainelRoute><AdminLabLicensing /></AdminPainelRoute> },
  { path: '/painel/admin/usuarios', element: <AdminPainelRoute><AdminUsers /></AdminPainelRoute> },
  { path: '/painel/admin/configuracoes/negocio', element: <AdminPainelRoute><AdminBusinessSettings /></AdminPainelRoute> },
  { path: '/painel/admin/configuracoes/sistema', element: <AdminPainelRoute><AdminSystemSettings /></AdminPainelRoute> },
  { path: '*', element: <Navigate to="/" replace /> },
]);
