import { type ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { hasAdministrativeRole } from './adminRoles';

function currentPath() {
  if (typeof window === 'undefined') return '/';
  return `${window.location.pathname}${window.location.search}`;
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const { loading, session } = useAuth();

  if (loading && !session) return null;

  if (!session) {
    return <Navigate to={`/entrar?next=${encodeURIComponent(currentPath())}`} replace />;
  }

  return <>{children}</>;
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { loading, session, backendUser, backendUserResolved } = useAuth();

  if ((loading && !session) || (session && !backendUserResolved)) {
    return null;
  }

  if (!session) {
    return <Navigate to={`/entrar?next=${encodeURIComponent(currentPath())}`} replace />;
  }

  if (!hasAdministrativeRole(backendUser?.roles)) {
    return <Navigate to="/painel/home" replace />;
  }

  return <>{children}</>;
}

export function RequireNonAdmin({ children }: { children: ReactNode }) {
  const { loading, session, backendUser, backendUserResolved } = useAuth();

  if ((loading && !session) || (session && !backendUserResolved)) {
    return null;
  }

  if (!session) {
    return <Navigate to={`/entrar?next=${encodeURIComponent(currentPath())}`} replace />;
  }

  if (hasAdministrativeRole(backendUser?.roles)) {
    return <Navigate to="/painel/admin/home" replace />;
  }

  return <>{children}</>;
}

export function RequireBiteplanerLicense({ children }: { children: ReactNode }) {
  const { loading, session, backendUser, backendUserResolved } = useAuth();

  if ((loading && !session) || (session && !backendUserResolved)) {
    return null;
  }

  if (!session) {
    return <Navigate to={`/entrar?next=${encodeURIComponent(currentPath())}`} replace />;
  }

  const hasActiveDentistLicense = (backendUser?.productRoles ?? []).some((productRole) => (
    productRole.productKey === 'biteplaner' &&
    productRole.role === 'dentist' &&
    productRole.status === 'active'
  ));

  if (!hasActiveDentistLicense) {
    return <Navigate to="/painel/biteplaner/cadastro/dentista" replace />;
  }

  return <>{children}</>;
}
