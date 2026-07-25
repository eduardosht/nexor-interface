import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPost, mockApiPatch } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
  mockApiPatch: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    post: mockApiPost,
    patch: mockApiPatch,
  },
}));

import { BiteplanerHub } from './index';

function renderPage() {
  mockUseAuth.mockReturnValue({
    loading: false,
    session: { access_token: 'tok', user: { id: 'dentist-1', email: 'dentista@nexor.dev' } },
    backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
    backendUserResolved: true,
    hasConfiguredAuth: true,
    isMockMode: true,
    demoPersona: 'dentistLicensed',
    signIn: vi.fn(),
    signInDemo: vi.fn(),
    signOut: vi.fn(),
    sendPasswordReset: vi.fn(),
    refreshBackendUser: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={['/painel/biteplaner?mode=dentist']}>
      <ThemeProvider theme={lightTheme}>
        <BiteplanerHub />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('BiteplanerHub financial onboarding notice', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockApiPatch.mockReset();
  });

  it('links approved dentists with pending Asaas account data to financial onboarding', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/products/biteplaner/access-options') {
        return Promise.resolve({
          productKey: 'biteplaner',
          defaultMode: 'dentist',
          enrollment: null,
          modes: [
            { key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null },
          ],
        });
      }

      if (path === '/v1/account/products/biteplaner/financial-onboarding') {
        return Promise.resolve({
          accounts: [
            {
              id: 'asaas-account-1',
              role: 'dentist',
              status: 'pending_onboarding',
              providerStatus: null,
              asaasAccountId: null,
              asaasWalletId: null,
              commercialInfoStatus: null,
              bankAccountInfoStatus: null,
              documentationStatus: null,
              generalStatus: null,
              onboardingUrl: null,
              providerErrorCode: null,
              providerErrorMessage: null,
              termsVersion: null,
              updatedAt: '2026-07-02T20:00:00.000Z',
            },
          ],
        });
      }

      if (path.startsWith('/v1/orders?as=dentist')) {
        return Promise.resolve({ orders: [] });
      }

      return Promise.resolve({ appointments: [], events: [], forms: [] });
    });

    renderPage();

    const link = await screen.findByRole('link', { name: /completar parte 2/i });

    expect(link).toHaveAttribute('href', '/painel/biteplaner/financeiro?role=dentist');
    await waitFor(() =>
      expect(mockApiGet).toHaveBeenCalledWith('/v1/account/products/biteplaner/financial-onboarding', 'tok')
    );
  });

  it('blocks the dentist order queue until financial onboarding is completed', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/products/biteplaner/access-options') {
        return Promise.resolve({
          productKey: 'biteplaner',
          defaultMode: 'dentist',
          enrollment: null,
          modes: [
            { key: 'dentist', label: 'Dentista', description: '', allowed: true, highlighted: true, reason: null },
          ],
        });
      }

      if (path === '/v1/account/products/biteplaner/financial-onboarding') {
        return Promise.resolve({
          accounts: [
            {
              id: 'asaas-account-1',
              role: 'dentist',
              status: 'pending_onboarding',
              providerStatus: null,
              asaasAccountId: null,
              asaasWalletId: null,
              commercialInfoStatus: null,
              bankAccountInfoStatus: null,
              documentationStatus: null,
              generalStatus: null,
              onboardingUrl: null,
              providerErrorCode: null,
              providerErrorMessage: null,
              termsVersion: null,
              updatedAt: '2026-07-02T20:00:00.000Z',
            },
          ],
        });
      }

      if (path.startsWith('/v1/orders?as=dentist')) {
        return Promise.resolve({
          orders: [
            {
              id: 'BP-DEMO-001',
              status: 'awaiting_dentist_forms',
              statusLabel: 'Aguardando solicitação de produção',
              stage: 'awaiting_dentist_forms',
              customer: { full_name: 'Cliente Demo', email: 'cliente@nexor.dev' },
              dentist: { full_name: 'Dra. Teste', email: 'dentista@nexor.dev' },
              lab: null,
              createdAt: '2026-07-02T20:00:00.000Z',
              updatedAt: '2026-07-02T20:00:00.000Z',
              nextActions: [],
            },
          ],
        });
      }

      return Promise.resolve({ appointments: [], events: [], forms: [] });
    });

    renderPage();

    expect(await screen.findByText(/complete seu cadastro financeiro/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /completar parte 2/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/financeiro?role=dentist'
    );
    expect(screen.queryByTestId('dentist-queue-table')).not.toBeInTheDocument();
    expect(screen.queryByText(/fila operacional do dentista/i)).not.toBeInTheDocument();
  });
});
