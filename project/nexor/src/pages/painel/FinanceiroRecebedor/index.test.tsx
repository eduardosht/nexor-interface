import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { ApiError } from '../../../lib/api';

const { mockUseAuth, mockGetFinancialOnboarding, mockSubmitFinancialOnboarding, mockSyncFinancialOnboarding } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(), mockGetFinancialOnboarding: vi.fn(), mockSubmitFinancialOnboarding: vi.fn(), mockSyncFinancialOnboarding: vi.fn()
}));

vi.mock('../../../hooks/useAuth', () => ({ useAuth: mockUseAuth }));
vi.mock('../../../features/financialOnboarding/asaasFinancialAccount.api', () => ({
  getFinancialOnboarding: mockGetFinancialOnboarding,
  submitFinancialOnboarding: mockSubmitFinancialOnboarding,
  syncFinancialOnboarding: mockSyncFinancialOnboarding
}));

import { FinanceiroRecebedor } from './index';

const pendingDentistFinancialAccount = {
  id: 'asaas-account-1', role: 'dentist' as const, documentType: 'cpf' as const, documentNumber: '52998224725', legalName: 'Dra Teste',
  status: 'pending_onboarding' as const, asaasAccountId: null, asaasWalletId: null, providerStatus: null, commercialInfoStatus: null,
  bankAccountInfoStatus: null, documentationStatus: null, generalStatus: null, onboardingUrl: null, providerErrorCode: null,
  providerErrorMessage: null, termsVersion: null, updatedAt: '2026-07-13T20:00:00.000Z'
};

function renderPage() {
  mockUseAuth.mockReturnValue({
    session: { access_token: 'tok', user: { id: 'dentist-1', email: 'dentista@nexor.dev' } },
    backendUser: { email: 'dentista@nexor.dev', phone: '11988887777', roles: ['dentist'] }
  });
  return render(<MemoryRouter><ThemeProvider theme={lightTheme}><FinanceiroRecebedor /></ThemeProvider></MemoryRouter>);
}

function fillMinimumAsaasData() {
  fireEvent.change(screen.getByLabelText(/^celular$/i), { target: { value: '11 98765-4321' } });
  fireEvent.change(screen.getByLabelText(/data de nascimento/i), { target: { value: '1984-10-30' } });
  fireEvent.change(screen.getByLabelText(/renda mensal/i), { target: { value: '120000' } });
  fireEvent.change(screen.getByLabelText(/^cep$/i), { target: { value: '01232-011' } });
  fireEvent.change(screen.getByLabelText(/^logradouro$/i), { target: { value: 'Rua Conselheiro Brotero' } });
  fireEvent.change(screen.getByLabelText(/^número$/i), { target: { value: '100' } });
  fireEvent.change(screen.getByLabelText(/^bairro$/i), { target: { value: 'Santa Cecília' } });
}

afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); });

describe('FinanceiroRecebedor', () => {
  it('renders pending Asaas financial onboarding and submits minimum data', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({ accounts: [pendingDentistFinancialAccount] });
    mockSubmitFinancialOnboarding.mockResolvedValueOnce({ account: { ...pendingDentistFinancialAccount, asaasAccountId: 'asaas_acc_1', asaasWalletId: 'wallet_1', onboardingUrl: 'https://sandbox.asaas.com/onboarding/asaas_acc_1', termsVersion: 'financial-v1' } });
    renderPage();
    await screen.findByRole('button', { name: /criar conta asaas/i });
    expect(screen.queryByLabelText(/banco/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/agência/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/^conta$/i)).not.toBeInTheDocument();
    fillMinimumAsaasData();
    fireEvent.click(screen.getByLabelText(/autorizo a criação da conta asaas/i));
    fireEvent.click(screen.getByRole('button', { name: /criar conta asaas/i }));
    await waitFor(() => expect(mockSubmitFinancialOnboarding).toHaveBeenCalledWith(expect.objectContaining({ role: 'dentist', phoneNumber: '11987654321', birthDate: '1984-10-30', incomeValue: 1200, termsVersion: 'financial-v1' }), 'tok'));
    expect(await screen.findByRole('link', { name: /continuar cadastro/i })).toHaveAttribute(
      'href',
      'https://sandbox.asaas.com/onboarding/asaas_acc_1'
    );
  });

  it('navigates to Asaas onboarding without submitting when the URL exists', async () => {
    const onboardingUrl = 'https://sandbox.asaas.com/onboarding/asaas_acc_1';
    mockGetFinancialOnboarding.mockResolvedValueOnce({ accounts: [{ ...pendingDentistFinancialAccount, onboardingUrl }] });
    renderPage();
    const continueRegistration = await screen.findByRole('link', { name: /continuar cadastro/i });

    expect(continueRegistration).toHaveAttribute('href', onboardingUrl);
    expect(screen.queryByRole('button', { name: /continuar cadastro/i })).not.toBeInTheDocument();

    fireEvent.click(continueRegistration);

    expect(mockSubmitFinancialOnboarding).not.toHaveBeenCalled();
  });




  it('submits confirmed fiscal document data from the financial form', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({ accounts: [{
      ...pendingDentistFinancialAccount,
      documentType: 'cnpj' as const,
      documentNumber: '19.131.243/0001-97',
      legalName: 'Nome antigo'
    }] });
    mockSubmitFinancialOnboarding.mockResolvedValueOnce({ account: pendingDentistFinancialAccount });
    renderPage();
    const submit = await screen.findByRole('button', { name: /criar conta asaas/i });

    fireEvent.change(screen.getByLabelText(/nome legal/i), { target: { value: 'Dra Confirmada' } });
    fireEvent.change(screen.getByLabelText(/tipo de documento/i), { target: { value: 'cpf' } });
    fireEvent.change(screen.getByLabelText(/^documento$/i), { target: { value: '52998224725' } });
    fillMinimumAsaasData();
    fireEvent.click(screen.getByLabelText(/autorizo a criação da conta asaas/i));

    expect(screen.queryByLabelText(/tipo de empresa/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/^documento$/i)).toHaveValue('529.982.247-25');

    fireEvent.click(submit);

    await waitFor(() => expect(mockSubmitFinancialOnboarding).toHaveBeenCalledWith(expect.objectContaining({
      documentType: 'cpf',
      documentNumber: '52998224725',
      legalName: 'Dra Confirmada'
    }), 'tok'));
  });
  it('formats phone and monthly income while submitting normalized values', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({ accounts: [pendingDentistFinancialAccount] });
    mockSubmitFinancialOnboarding.mockResolvedValueOnce({ account: pendingDentistFinancialAccount });
    renderPage();
    const submit = await screen.findByRole('button', { name: /criar conta asaas/i });

    fireEvent.change(screen.getByLabelText(/^celular$/i), { target: { value: '11987654321' } });
    fireEvent.change(screen.getByLabelText(/data de nascimento/i), { target: { value: '1984-10-30' } });
    fireEvent.change(screen.getByLabelText(/renda mensal/i), { target: { value: '123456' } });
    fireEvent.change(screen.getByLabelText(/^cep$/i), { target: { value: '01232011' } });
    fireEvent.change(screen.getByLabelText(/^logradouro$/i), { target: { value: 'Rua Conselheiro Brotero' } });
    fireEvent.change(screen.getByLabelText(/^número$/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/^bairro$/i), { target: { value: 'Santa Cecília' } });
    fireEvent.click(screen.getByLabelText(/autorizo a criação da conta asaas/i));

    expect(screen.getByLabelText(/^celular$/i)).toHaveValue('(11) 98765-4321');
    expect(screen.getByLabelText(/renda mensal/i)).toHaveValue('R$ 1.234,56');

    fireEvent.click(submit);

    await waitFor(() => expect(mockSubmitFinancialOnboarding).toHaveBeenCalledWith(expect.objectContaining({
      phoneNumber: '11987654321',
      incomeValue: 1234.56
    }), 'tok'));
  });
  it('requires and submits company type for CNPJ Asaas accounts', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({ accounts: [{ ...pendingDentistFinancialAccount, documentType: 'cnpj' as const, documentNumber: '19.131.243/0001-97' }] });
    mockSubmitFinancialOnboarding.mockResolvedValueOnce({ account: pendingDentistFinancialAccount });
    renderPage();
    const submit = await screen.findByRole('button', { name: /criar conta asaas/i });

    fireEvent.change(screen.getByLabelText(/^celular$/i), { target: { value: '11 98765-4321' } });
    fireEvent.change(screen.getByLabelText(/renda mensal/i), { target: { value: 'R$ 1.200,00' } });
    fireEvent.change(screen.getByLabelText(/^cep$/i), { target: { value: '01232-011' } });
    fireEvent.change(screen.getByLabelText(/^logradouro$/i), { target: { value: 'Rua Conselheiro Brotero' } });
    fireEvent.change(screen.getByLabelText(/^número$/i), { target: { value: '100' } });
    fireEvent.change(screen.getByLabelText(/^bairro$/i), { target: { value: 'Santa Cecília' } });
    fireEvent.click(screen.getByLabelText(/autorizo a criação da conta asaas/i));

    expect(submit).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/tipo de empresa/i), { target: { value: 'MEI' } });

    expect(submit).toBeEnabled();

    fireEvent.click(submit);

    await waitFor(() => expect(mockSubmitFinancialOnboarding).toHaveBeenCalledWith(expect.objectContaining({
      role: 'dentist',
      companyType: 'MEI',
      incomeValue: 1200
    }), 'tok'));
  });
  it('disables submit for an active Asaas account', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({ accounts: [{ ...pendingDentistFinancialAccount, status: 'active' as const }] });
    renderPage();
    const submit = await screen.findByRole('button', { name: /criar conta asaas/i });
    fillMinimumAsaasData();
    fireEvent.click(screen.getByLabelText(/autorizo a criação da conta asaas/i));
    expect(submit).toBeDisabled();
  });


  it('shows the user-correctable field name when backend returns identifiable details', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({ accounts: [pendingDentistFinancialAccount] });
    mockSubmitFinancialOnboarding.mockRejectedValueOnce(new ApiError(
      'O número informado não é um número móvel válido.',
      409,
      'conflict',
      'request-1',
      { provider: 'asaas', providerCode: 'invalid_object', field: 'phoneNumber' }
    ));
    renderPage();
    const submit = await screen.findByRole('button', { name: /criar conta asaas/i });

    fillMinimumAsaasData();
    fireEvent.click(screen.getByLabelText(/autorizo a criação da conta asaas/i));
    fireEvent.click(submit);

    expect(await screen.findByRole('alert')).toHaveTextContent('Celular: O número informado não é um número móvel válido.');
  });
  it('syncs the selected Asaas account with the supported payload', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({ accounts: [pendingDentistFinancialAccount] });
    mockSyncFinancialOnboarding.mockResolvedValueOnce({ account: pendingDentistFinancialAccount });
    renderPage();
    fireEvent.click(await screen.findByRole('button', { name: /sincronizar status/i }));
    await waitFor(() => expect(mockSyncFinancialOnboarding).toHaveBeenCalledWith({ role: 'dentist' }, 'tok'));
  });
});