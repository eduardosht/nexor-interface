import { lazy, Suspense, type ReactNode } from 'react';
import { createBrowserRouter, Navigate, type RouteObject } from 'react-router';
import { PublicLayout } from '../PublicLayout';
import { ErrorBoundary, RouteErrorFallback } from './RouteErrorFallback';

const Home = lazy(() => import('../pages/Home').then(({ Home }) => ({ default: Home })));
const Sobre = lazy(() => import('../pages/Sobre').then(({ Sobre }) => ({ default: Sobre })));
const BiteplanerPage = lazy(() => import('../pages/BiteplanerPage').then(({ BiteplanerPage }) => ({ default: BiteplanerPage })));
const ConhecaOBiteplaner = lazy(() => import('../pages/ConhecaOBiteplaner').then(({ ConhecaOBiteplaner }) => ({ default: ConhecaOBiteplaner })));
const Parceiros = lazy(() => import('../pages/Parceiros').then(({ Parceiros }) => ({ default: Parceiros })));
const Privacidade = lazy(() => import('../pages/Privacidade').then(({ Privacidade }) => ({ default: Privacidade })));
const Termos = lazy(() => import('../pages/Termos').then(({ Termos }) => ({ default: Termos })));
const Cookies = lazy(() => import('../pages/Cookies').then(({ Cookies }) => ({ default: Cookies })));

function LazyRoute({ children }: { children: ReactNode }) {
  return (
    <ErrorBoundary>
      <Suspense fallback={null}>{children}</Suspense>
    </ErrorBoundary>
  );
}

const routeErrorElement = <RouteErrorFallback />;

export const publicRoutes: RouteObject[] = [
  {
    element: <PublicLayout />,
    errorElement: routeErrorElement,
    children: [
      { path: '/', element: <LazyRoute><Home /></LazyRoute> },
      { path: '/sobre', element: <LazyRoute><Sobre /></LazyRoute> },
      { path: '/biteplaner', element: <LazyRoute><BiteplanerPage /></LazyRoute> },
      { path: '/conheca-biteplaner', element: <LazyRoute><ConhecaOBiteplaner /></LazyRoute> },
      { path: '/parceiros', element: <LazyRoute><Parceiros /></LazyRoute> },
      { path: '/privacidade', element: <LazyRoute><Privacidade /></LazyRoute> },
      { path: '/termos', element: <LazyRoute><Termos /></LazyRoute> },
      { path: '/cookies', element: <LazyRoute><Cookies /></LazyRoute> },
      { path: '*', element: <Navigate to="/" replace /> },
    ],
  },
];

export const publicRouter = createBrowserRouter(publicRoutes);
