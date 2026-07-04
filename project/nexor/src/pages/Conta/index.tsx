import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { api, ApiError } from '../../lib/api';
import {
  clearPendingRegistration,
  loadLegacyPendingRegistrationForMigration,
  loadPendingRegistration,
} from '../../lib/pending-registration';
import { Alert, Description, Success, Title } from '../auth-shared';
import { Hero, LogoutButton, Page, ProductCard, Shell } from './Conta.styles';

interface MeResponse {
  user?: { profileId?: string; email?: string; roles?: string[] };
  profile?: {
    full_name: string;
    role: 'customer' | 'partner' | 'dentist' | 'lab' | 'admin' | 'user';
  };
}

export function Conta() {
  const navigate = useNavigate();
  const location = useLocation();
  const { session, signOut, backendUser, refreshBackendUser } = useAuth();
  const [profile, setProfile] = useState<MeResponse['profile'] | null>(null);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(
    typeof location.state === 'object' && location.state && 'notice' in location.state
      ? String((location.state as { notice?: string }).notice ?? '')
      : ''
  );

  useEffect(() => {
    if (!session) {
      return;
    }

    const currentSession = session;
    let active = true;

    async function syncPendingRegistration(token: string, response: MeResponse) {
      const legacyPending = loadLegacyPendingRegistrationForMigration();
      const pending = legacyPending ?? loadPendingRegistration();

      if (!pending) {
        return response;
      }

      if (pending.email.toLowerCase() !== (currentSession.user.email ?? '').toLowerCase()) {
        clearPendingRegistration();
        return response;
      }

      if (!response.user?.profileId && !backendUser?.profileId && legacyPending) {
        try {
          await api.post(
            '/v1/auth/profile',
            {
              fullName: legacyPending.fullName,
              role: legacyPending.role,
              documentType: legacyPending.documentType,
              documentNumber: legacyPending.documentNumber,
              companyName: legacyPending.companyName
            },
            token
          );
        } catch (syncError) {
          if (!(syncError instanceof ApiError) || (syncError.status !== 403 && syncError.status !== 409)) {
            throw syncError;
          }
        }
      }

      try {
        await api.post('/v1/account/consents', { consents: pending.consents }, token);
      } catch (syncError) {
        if (!(syncError instanceof ApiError) || (syncError.status !== 403 && syncError.status !== 409)) {
          throw syncError;
        }
      }

      clearPendingRegistration();
      await refreshBackendUser();
      if (active) {
        setNotice(
          legacyPending
            ? 'Sua conta foi confirmada e o perfil Nexor foi concluído automaticamente.'
            : 'Sua conta foi confirmada e seus consentimentos foram sincronizados.'
        );
      }

      return api.get<MeResponse>('/v1/auth/me', token);
    }

    async function loadAccount() {
      try {
        const initial = await api.get<MeResponse>('/v1/auth/me', currentSession.access_token);
        const response = await syncPendingRegistration(currentSession.access_token, initial);

        if (!active) {
          return;
        }

        const rawProfile = response.profile ?? null;
        const fallbackRole =
          backendUser?.roles?.[0] === 'admin' || response.user?.roles?.[0] === 'admin'
            ? 'admin'
            : 'customer';

        setProfile(
          rawProfile ?? {
            full_name: currentSession.user.email ?? 'Conta Nexor',
            role: fallbackRole
          }
        );
      } catch (loadError) {
        if (!active) {
          return;
        }

        if (loadError instanceof ApiError && loadError.status === 404) {
          setProfile({
            full_name: currentSession.user.email ?? 'Conta Nexor',
            role: 'customer'
          });
          return;
        }

        setError('Não foi possível carregar os dados da conta.');
      }
    }

    void loadAccount();

    return () => {
      active = false;
    };
  }, [backendUser?.profileId, backendUser?.roles, refreshBackendUser, session]);

  const resolvedRole = useMemo(() => {
    if (profile?.role) {
      return profile.role;
    }

    if (backendUser?.roles.includes('admin')) {
      return 'admin';
    }

    if (backendUser?.dentistId) {
      return 'dentist';
    }

    if (backendUser?.labId) {
      return 'lab';
    }

    if (backendUser?.partnerId) {
      return 'partner';
    }

    return 'customer';
  }, [
    backendUser?.dentistId,
    backendUser?.labId,
    backendUser?.partnerId,
    backendUser?.roles,
    profile?.role
  ]);

  const isAdmin = resolvedRole === 'admin';
  const portalHref = isAdmin ? '/painel/admin/home' : '/painel/biteplaner';
  const productCardLabel = isAdmin ? 'Painel administrativo' : 'Biteplaner';
  const productCardAction = isAdmin
    ? 'Acessar painel administrativo'
    : 'Escolher acesso ao Biteplaner';

  return (
    <Page>
      <Shell>
        <Hero>
          <Title>{profile?.full_name ?? 'Conta Nexor'}</Title>
          <Description>Tipo de conta: {resolvedRole ?? 'carregando'}</Description>
          {error ? <Alert role="alert">{error}</Alert> : null}
          {notice ? <Success role="status">{notice}</Success> : null}
        </Hero>

        <ProductCard href={portalHref}>
          <strong>{productCardLabel}</strong>
          <span>{productCardAction}</span>
        </ProductCard>

        <LogoutButton
          type="button"
          onClick={() => {
            void signOut().finally(() => navigate('/entrar'));
          }}
        >
          Sair
        </LogoutButton>
      </Shell>
    </Page>
  );
}
