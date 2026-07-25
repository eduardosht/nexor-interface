import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockGetFinancialOnboarding } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockGetFinancialOnboarding: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({ useAuth: mockUseAuth }));
vi.mock('../../../features/financialOnboarding/asaasFinancialAccount.api', () => ({
  getFinancialOnboarding: mockGetFinancialOnboarding,
}));

import { BiteplanerHome } from './index';

function renderPage() {
  mockUseAuth.mockReturnValue({
    session: { access_token: 'tok', user: { id: 'dentist-12', email: 'dentista12@nexor.dev' } },
    backendUser: {
      email: 'dentista12@nexor.dev',
      roles: ['dentist'],
      productRoles: [{ productKey: 'biteplaner', role: 'dentist', status: 'active' }],
    },
  });

  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <BiteplanerHome />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('BiteplanerHome', () => {
  it('shows Asaas financial status and shortcuts to purchase, finance and dentist orders', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({
      accounts: [
        {
          id: 'asaas-account-1',
          role: 'dentist',
          documentType: 'cpf',
          documentNumber: '52998224725',
          legalName: 'Dentista 12',
          status: 'pending_onboarding',
          asaasAccountId: null,
          asaasWalletId: null,
          providerStatus: null,
          commercialInfoStatus: null,
          bankAccountInfoStatus: null,
          documentationStatus: null,
          generalStatus: null,
          onboardingUrl: null,
          providerErrorCode: null,
          providerErrorMessage: null,
          termsVersion: null,
          updatedAt: '2026-07-24T12:00:00.000Z',
        },
      ],
    });

    renderPage();

    expect(await screen.findByText(/cadastro financeiro pendente/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /comprar biteplaner/i })).toHaveAttribute('href', '/painel/compra');
    expect(screen.getByRole('link', { name: /abrir financeiro/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/financeiro?role=dentist'
    );
    expect(screen.getByRole('link', { name: /ver ordens/i })).toHaveAttribute('href', '/painel/biteplaner/ordens');
  });
});
