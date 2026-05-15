import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

function currentPath() {
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname}${window.location.search}`;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, session } = useAuth();

  if (loading) return null;

  if (!session) {
    return <Navigate to={`/entrar?next=${encodeURIComponent(currentPath())}`} replace />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { loading, session, backendUser, backendUserResolved } = useAuth();

  if (loading || (session && !backendUserResolved)) {
    return null;
  }

  if (!session) {
    return <Navigate to={`/entrar?next=${encodeURIComponent(currentPath())}`} replace />;
  }

  if (!backendUser?.roles.includes('admin')) {
    return <Navigate to="/painel/home" replace />;
  }

  return <>{children}</>;
}

export function RequireNonAdmin({ children }: { children: ReactNode }) {
  const { loading, session, backendUser, backendUserResolved } = useAuth();

  if (loading || (session && !backendUserResolved)) {
    return null;
  }

  if (!session) {
    return <Navigate to={`/entrar?next=${encodeURIComponent(currentPath())}`} replace />;
  }

  if (backendUser?.roles.includes('admin')) {
    return <Navigate to="/painel/admin/home" replace />;
  }

  return <>{children}</>;
}
