import { Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { RequireAdmin, RequireAuth, RequireNonAdmin } from '../features/auth/guards';
import { Layout } from '../Layout';
import { Home } from '../pages/Home';
import { Privacidade } from '../pages/Privacidade';
import { Termos } from '../pages/Termos';
import { Cookies } from '../pages/Cookies';
import { Login } from '../pages/Login';
import { Cadastro } from '../pages/Cadastro';
import { RecuperarSenha } from '../pages/RecuperarSenha';
import { Sobre } from '../pages/Sobre';
import { BiteplanerPage } from '../pages/BiteplanerPage';
import { Parceiros } from '../pages/Parceiros';
import {
  BiteplanerHub,
  Avaliacoes,
  CadastroPerfilBiteplaner,
  Compra,
  ConsultaInicial,
  Jornada,
  MinhaConta,
  PainelHome,
  PartnerReferralPage,
  PreRequisito,
  ProducaoDentista,
} from '../pages/painel';
import { PortalLayout } from '../components/portal/PortalLayout';
import { AdminPortalProvider } from '../features/admin/portal';
import { AdminHome } from '../pages/painel/admin/AdminHome';
import { AdminOrders } from '../pages/painel/admin/AdminOrders';
import { AdminDentistLicensing } from '../pages/painel/admin/AdminDentistLicensing';
import { AdminLabLicensing } from '../pages/painel/admin/AdminLabLicensing';
import { AdminPartnerLicensing } from '../pages/painel/admin/AdminPartnerLicensing';
import { AdminUsers } from '../pages/painel/admin/AdminUsers';
import { AdminBusinessSettings } from '../pages/painel/admin/AdminBusinessSettings';
import { AdminSystemSettings } from '../pages/painel/admin/AdminSystemSettings';
import { useAuth } from '../hooks/useAuth';

function PainelRoute({ children }: { children: ReactNode }) {
  return (
    <RequireAuth>
      <RequireNonAdmin>
        <PortalLayout>
          <Suspense fallback={null}>{children}</Suspense>
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
            <Suspense fallback={null}>{children}</Suspense>
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
      { path: '/', element: <Home /> },
      { path: '/sobre', element: <Sobre /> },
      { path: '/biteplaner', element: <BiteplanerPage /> },
      { path: '/parceiros', element: <Parceiros /> },
      { path: '/privacidade', element: <Privacidade /> },
      { path: '/termos', element: <Termos /> },
      { path: '/cookies', element: <Cookies /> },
    ],
  },
  { path: '/entrar', element: <Login /> },
  { path: '/cadastro', element: <Cadastro /> },
  { path: '/recuperar-senha', element: <RecuperarSenha /> },
  { path: '/conta', element: <ProtectedRedirect><AccountRedirect /></ProtectedRedirect> },
  { path: '/painel', element: <ProtectedRedirect><PortalRootRedirect /></ProtectedRedirect> },
  { path: '/painel/home', element: <PainelRoute><PainelHome /></PainelRoute> },
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
  { path: '/painel/admin/parceiros', element: <AdminPainelRoute><AdminPartnerLicensing /></AdminPainelRoute> },
  { path: '/painel/admin/dentistas', element: <AdminPainelRoute><AdminDentistLicensing /></AdminPainelRoute> },
  { path: '/painel/admin/laboratórios', element: <AdminPainelRoute><AdminLabLicensing /></AdminPainelRoute> },
  { path: '/painel/admin/laboratorios', element: <AdminPainelRoute><AdminLabLicensing /></AdminPainelRoute> },
  { path: '/painel/admin/usuarios', element: <AdminPainelRoute><AdminUsers /></AdminPainelRoute> },
  { path: '/painel/admin/configuracoes/negocio', element: <AdminPainelRoute><AdminBusinessSettings /></AdminPainelRoute> },
  { path: '/painel/admin/configuracoes/sistema', element: <AdminPainelRoute><AdminSystemSettings /></AdminPainelRoute> },
  { path: '*', element: <Navigate to="/" replace /> },
]);
