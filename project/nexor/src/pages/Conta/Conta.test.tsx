import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { useAuth } from '../../hooks/useAuth';
import { clearPendingRegistration, savePendingRegistration } from '../../lib/pending-registration';
import { lightTheme } from '../../styles/theme';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn()
  }
}));

import { api } from '../../lib/api';
import { Conta } from './index';

function createAuthMock(overrides: Record<string, unknown> = {}) {
  return {
    session: { access_token: 'tok', user: { id: '1', email: 'joao@example.com' } },
    loading: false,
    backendUser: null,
    backendUserResolved: true,
    authError: '',
    hasConfiguredAuth: true,
    isMockMode: false,
    demoPersona: null,
    signIn: vi.fn(),
    signInDemo: vi.fn(),
    signOut: vi.fn(),
    sendPasswordReset: vi.fn(),
    refreshBackendUser: vi.fn(),
    ...overrides
  };
}

function renderConta() {
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter>
        <Conta />
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe('Conta', () => {
  beforeEach(() => {
    clearPendingRegistration();
    vi.clearAllMocks();
    (api.get as any).mockResolvedValue({
      profile: { full_name: 'Joao Silva', role: 'customer' }
    });
    (api.post as any).mockResolvedValue({ ok: true });
    vi.mocked(useAuth).mockReturnValue(createAuthMock());
  });

  it('displays user name and product card linking to /painel/biteplaner', async () => {
    renderConta();

    await waitFor(() => {
      expect(screen.getByText(/Joao Silva/i)).toBeInTheDocument();
      expect(screen.getByRole('link', { name: /Escolher acesso ao Biteplaner/i })).toHaveAttribute(
        'href',
        '/painel/biteplaner'
      );
    });
  });

  it('shows Biteplaner card for non-admin users', async () => {
    (api.get as any).mockResolvedValue({
      profile: { full_name: 'Parceiro Nexor', role: 'partner' }
    });

    renderConta();

    await waitFor(() => expect(screen.getByText(/Parceiro Nexor/i)).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Escolher acesso ao Biteplaner/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner'
    );
  });

  it('syncs safe pending registration consents without creating a profile from client storage', async () => {
    (api.get as any)
      .mockResolvedValueOnce({ user: { email: 'joao@example.com' } })
      .mockResolvedValueOnce({ user: { profileId: 'p1', roles: ['customer'] } });

    const consents = [
      { type: 'terms' as const, accepted: true },
      { type: 'privacy' as const, accepted: true },
      { type: 'marketing' as const, accepted: false }
    ];

    savePendingRegistration({
      email: 'joao@example.com',
      fullName: 'Joao Silva',
      role: 'customer',
      consents
    });

    renderConta();

    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/v1/account/consents', { consents }, 'tok');
    });
    expect(api.post).not.toHaveBeenCalledWith('/v1/auth/profile', expect.anything(), expect.anything());
  });

  it('shows Biteplaner card for all accounts', async () => {
    (api.get as any).mockResolvedValue({
      profile: { full_name: 'User Nexor', role: 'customer' }
    });

    renderConta();

    await waitFor(() => expect(screen.getByText(/User Nexor/i)).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Escolher acesso ao Biteplaner/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner'
    );
  });
});