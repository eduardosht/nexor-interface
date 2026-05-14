import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { useAuth } from '../../hooks/useAuth';
import { lightTheme } from '../../styles/theme';
import { clearPendingRegistration, savePendingRegistration } from '../../lib/pending-registration';

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn().mockResolvedValue({
      profile: { full_name: 'Joao Silva', role: 'customer' }
    }),
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

describe('Conta', () => {
  beforeEach(() => {
    clearPendingRegistration();
    vi.clearAllMocks();
    vi.mocked(useAuth).mockReturnValue(createAuthMock());
  });

  it('displays user name and product card linking to /painel/biteplaner', async () => {
    render(
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <Conta />
        </MemoryRouter>
      </ThemeProvider>
    );

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

    render(
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <Conta />
        </MemoryRouter>
      </ThemeProvider>
    );

    await waitFor(() => expect(screen.getByText(/Parceiro Nexor/i)).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Escolher acesso ao Biteplaner/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner'
    );
  });

  it('finalizes pending registration after confirmed session', async () => {
    (api.get as any)
      .mockResolvedValueOnce({ user: { email: 'joao@example.com' } })
      .mockResolvedValueOnce({ user: { profileId: 'p1', roles: ['customer'] } });
    (api.post as any)
      .mockResolvedValueOnce({ id: 'p1' })
      .mockResolvedValueOnce({ ok: true });

    savePendingRegistration({
      email: 'joao@example.com',
      fullName: 'Joao Silva',
      role: 'customer',
      documentType: 'cpf',
      documentNumber: '52998224725',
      consents: [
        { type: 'terms', accepted: true },
        { type: 'privacy', accepted: true },
        { type: 'marketing', accepted: false }
      ]
    });

    render(
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <Conta />
        </MemoryRouter>
      </ThemeProvider>
    );

    await waitFor(() => {
      expect(api.post).toHaveBeenCalled();
    });
  });

  it('shows Biteplaner card for all accounts', async () => {
    (api.get as any).mockResolvedValue({
      profile: { full_name: 'User Nexor', role: 'customer' }
    });

    render(
      <ThemeProvider theme={lightTheme}>
        <MemoryRouter>
          <Conta />
        </MemoryRouter>
      </ThemeProvider>
    );

    await waitFor(() => expect(screen.getByText(/User Nexor/i)).toBeInTheDocument());
    expect(screen.getByRole('link', { name: /Escolher acesso ao Biteplaner/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner'
    );
  });
});
