import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { afterEach, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const {
  mockUseAuth,
  mockGetFinancialOnboarding,
  mockSubmitFinancialOnboarding
} = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockGetFinancialOnboarding: vi.fn(),
  mockSubmitFinancialOnboarding: vi.fn()
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth
}));

vi.mock('../../../features/financialOnboarding/pagarmeRecipient.api', () => ({
  getFinancialOnboarding: mockGetFinancialOnboarding,
  submitFinancialOnboarding: mockSubmitFinancialOnboarding,
  retryFinancialOnboarding: mockSubmitFinancialOnboarding
}));

import { FinanceiroRecebedor } from './index';

function renderPage() {
  mockUseAuth.mockReturnValue({
    session: { access_token: 'tok', user: { id: 'dentist-1', email: 'dentista@nexor.dev' } },
    backendUser: { email: 'dentista@nexor.dev', phone: '11988887777', roles: ['dentist'] }
  });

  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <FinanceiroRecebedor />
      </ThemeProvider>
    </MemoryRouter>
  );
}

function fillRequiredFields() {
  fireEvent.change(screen.getByLabelText(/perfil financeiro/i), { target: { value: 'dentist' } });
  fireEvent.change(screen.getByLabelText(/nome legal/i), { target: { value: 'Dra Teste' } });
  fireEvent.change(screen.getByLabelText(/e-mail financeiro/i), { target: { value: 'dentista@nexor.dev' } });
  fireEvent.change(screen.getByLabelText(/nome da mãe/i), { target: { value: 'Maria Teste' } });
  fireEvent.change(screen.getByLabelText(/data de nascimento/i), { target: { value: '1984-10-30' } });
  fireEvent.change(screen.getByLabelText(/renda mensal/i), { target: { value: '1200,00' } });
  fireEvent.change(screen.getByLabelText(/ocupação profissional/i), { target: { value: 'Dentista' } });
  fireEvent.change(screen.getByLabelText(/site do recebedor/i), { target: { value: 'https://nexoradvance.com.br' } });
  fireEvent.change(screen.getByLabelText(/^cep$/i), { target: { value: '20021130' } });
  fireEvent.change(screen.getByLabelText(/^logradouro$/i), { target: { value: 'Av. General Justo' } });
  fireEvent.change(screen.getByLabelText(/^número$/i), { target: { value: '375' } });
  fireEvent.change(screen.getByLabelText(/^complemento$/i), { target: { value: 'Bloco A' } });
  fireEvent.change(screen.getByLabelText(/^bairro$/i), { target: { value: 'Centro' } });
  fireEvent.change(screen.getByLabelText(/^cidade$/i), { target: { value: 'Rio de Janeiro' } });
  fireEvent.change(screen.getByLabelText(/^uf$/i), { target: { value: 'RJ' } });
  fireEvent.change(screen.getByLabelText(/ponto de referência/i), { target: { value: 'Ao lado da banca de jornal' } });
  fireEvent.change(screen.getByRole('combobox', { name: /banco/i }), { target: { value: '341' } });
  fireEvent.change(screen.getByLabelText(/^ag[eê]ncia$/i), { target: { value: '1234' } });
  fireEvent.change(screen.getByLabelText(/d[ií]gito da ag[eê]ncia/i), { target: { value: '5' } });
  fireEvent.change(screen.getByLabelText(/^conta$/i), { target: { value: '999999' } });
  fireEvent.change(screen.getByLabelText(/d[ií]gito da conta/i), { target: { value: '1' } });
  fireEvent.change(screen.getByLabelText(/tipo de conta/i), { target: { value: 'checking' } });
  fireEvent.change(screen.getByLabelText(/titular da conta/i), { target: { value: 'Dra Teste' } });
  fireEvent.change(screen.getByLabelText(/documento do titular/i), { target: { value: '52998224725' } });
  fireEvent.change(screen.getByLabelText(/tipo de titular/i), { target: { value: 'individual' } });
  fireEvent.change(screen.getByLabelText(/periodicidade de repasse/i), { target: { value: 'daily' } });
  fireEvent.click(screen.getByLabelText(/aceito os termos financeiros/i));
}

describe('FinanceiroRecebedor', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockGetFinancialOnboarding.mockReset();
    mockSubmitFinancialOnboarding.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('loads sanitized recipient status without bank data', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({
      recipients: [
        {
          id: 'recipient-1',
          role: 'dentist',
          documentType: 'cpf',
          documentNumber: '52998224725',
          legalName: 'Dra Teste',
          status: 'creation_failed',
          providerStatus: null,
          providerErrorCode: 'invalid_bank_account',
          providerErrorMessage: 'Dados bancarios invalidos.',
          termsVersion: null,
          updatedAt: '2026-07-02T20:00:00.000Z'
        }
      ]
    });

    renderPage();

    expect(await screen.findByText(/dados bancarios invalidos/i)).toBeInTheDocument();
    expect(screen.queryByDisplayValue('1234')).not.toBeInTheDocument();
    expect(screen.queryByDisplayValue('999999')).not.toBeInTheDocument();
    expect(JSON.stringify(screen.queryByText(/recipient-1/i))).not.toContain('999999');
  });

  it('submits bank data as transient input and clears bank fields after success', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({
      recipients: [
        {
          id: 'recipient-1',
          role: 'dentist',
          documentType: 'cpf',
          documentNumber: '52998224725',
          legalName: 'Dra Teste',
          status: 'pending_data',
          providerStatus: null,
          providerErrorCode: null,
          providerErrorMessage: null,
          termsVersion: null,
          updatedAt: '2026-07-02T20:00:00.000Z'
        }
      ]
    });
    mockSubmitFinancialOnboarding.mockResolvedValueOnce({
      recipient: {
        id: 'recipient-1',
        role: 'dentist',
        documentType: 'cpf',
        documentNumber: '52998224725',
        legalName: 'Dra Teste',
        status: 'active',
        providerStatus: 'active',
        providerErrorCode: null,
        providerErrorMessage: null,
        termsVersion: 'financial-v1',
        updatedAt: '2026-07-02T20:00:00.000Z'
      }
    });

    renderPage();
    await screen.findByRole('heading', { name: /onboarding financeiro/i });
    expect(screen.queryByLabelText(/tipo de documento/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/documento cpf\/cnpj/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(/telefone financeiro/i)).toHaveValue('(11) 98888-7777');
    expect(screen.getByRole('option', { name: /341 -/i })).toBeInTheDocument();
    fillRequiredFields();
    fireEvent.click(screen.getByRole('button', { name: /enviar para o pagar\.me/i }));

    await waitFor(() => {
      expect(mockSubmitFinancialOnboarding).toHaveBeenCalledWith(
        expect.objectContaining({
          role: 'dentist',
          documentType: 'cpf',
          documentNumber: '52998224725',
          phoneNumber: '11988887777',
          recipientProfile: {
            siteUrl: 'https://nexoradvance.com.br',
            motherName: 'Maria Teste',
            birthdate: '1984-10-30',
            monthlyIncome: 120000,
            professionalOccupation: 'Dentista',
            address: {
              street: 'Av. General Justo',
              complementary: 'Bloco A',
              streetNumber: '375',
              neighborhood: 'Centro',
              city: 'Rio de Janeiro',
              state: 'RJ',
              zipCode: '20021130',
              referencePoint: 'Ao lado da banca de jornal'
            }
          },
          bankAccount: expect.objectContaining({
            bankCode: '341',
            branchNumber: '1234',
            accountNumber: '999999'
          })
        }),
        'tok'
      );
    });

    expect(await screen.findByText(/recebedor criado/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^ag[eê]ncia$/i)).toHaveValue('');
    expect(screen.getByLabelText(/^conta$/i)).toHaveValue('');
  });

  it('formats financial fields and limits bank account input to Pagar.me patterns', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({
      recipients: [
        {
          id: 'recipient-1',
          role: 'dentist',
          documentType: 'cpf',
          documentNumber: '52998224725',
          legalName: 'Dra Teste',
          status: 'pending_data',
          providerStatus: null,
          providerErrorCode: null,
          providerErrorMessage: null,
          termsVersion: null,
          updatedAt: '2026-07-02T20:00:00.000Z'
        }
      ]
    });
    mockSubmitFinancialOnboarding.mockResolvedValueOnce({
      recipient: {
        id: 'recipient-1',
        role: 'dentist',
        documentType: 'cpf',
        documentNumber: '52998224725',
        legalName: 'Dra Teste',
        status: 'active',
        providerStatus: 'active',
        providerErrorCode: null,
        providerErrorMessage: null,
        termsVersion: 'financial-v1',
        updatedAt: '2026-07-02T20:00:00.000Z'
      }
    });

    renderPage();
    await screen.findByRole('heading', { name: /onboarding financeiro/i });

    fireEvent.change(screen.getByLabelText(/telefone financeiro/i), { target: { value: '11 91234-5678abc' } });
    fireEvent.change(screen.getByLabelText(/renda mensal/i), { target: { value: '1200,00' } });
    fireEvent.change(screen.getByRole('combobox', { name: /banco/i }), { target: { value: '001' } });
    fireEvent.change(screen.getByLabelText(/^ag[eê]ncia$/i), { target: { value: '12345' } });
    fireEvent.change(screen.getByLabelText(/d[ií]gito da ag[eê]ncia/i), { target: { value: 'x9' } });
    fireEvent.change(screen.getByLabelText(/^conta$/i), { target: { value: '123456789012345' } });
    fireEvent.change(screen.getByLabelText(/d[ií]gito da conta/i), { target: { value: 'x9z' } });
    fireEvent.change(screen.getByLabelText(/documento do titular/i), { target: { value: '52998224725' } });

    expect(screen.getByLabelText(/telefone financeiro/i)).toHaveValue('(11) 91234-5678');
    expect(screen.getByLabelText(/renda mensal/i)).toHaveValue('R$ 1.200,00');
    expect(screen.getByRole('combobox', { name: /banco/i })).toHaveDisplayValue(/001 - BCO DO BRASIL S\.A\./i);
    expect(screen.getByLabelText(/^ag[eê]ncia$/i)).toHaveValue('1234');
    expect(screen.getByLabelText(/d[ií]gito da ag[eê]ncia/i)).toHaveValue('X');
    expect(screen.getByLabelText(/^conta$/i)).toHaveValue('1234567890123');
    expect(screen.getByLabelText(/d[ií]gito da conta/i)).toHaveValue('X9');
    expect(screen.getByLabelText(/documento do titular/i)).toHaveValue('529.982.247-25');

    fireEvent.change(screen.getByLabelText(/perfil financeiro/i), { target: { value: 'dentist' } });
    fireEvent.change(screen.getByLabelText(/nome legal/i), { target: { value: 'Dra Teste' } });
    fireEvent.change(screen.getByLabelText(/e-mail financeiro/i), { target: { value: 'dentista@nexor.dev' } });
    fireEvent.change(screen.getByLabelText(/nome da mãe/i), { target: { value: 'Maria Teste' } });
    fireEvent.change(screen.getByLabelText(/data de nascimento/i), { target: { value: '1984-10-30' } });
    fireEvent.change(screen.getByLabelText(/ocupação profissional/i), { target: { value: 'Dentista' } });
    fireEvent.change(screen.getByLabelText(/^cep$/i), { target: { value: '20021130' } });
    fireEvent.change(screen.getByLabelText(/^logradouro$/i), { target: { value: 'Av. General Justo' } });
    fireEvent.change(screen.getByLabelText(/^número$/i), { target: { value: '375' } });
    fireEvent.change(screen.getByLabelText(/^complemento$/i), { target: { value: 'Bloco A' } });
    fireEvent.change(screen.getByLabelText(/^bairro$/i), { target: { value: 'Centro' } });
    fireEvent.change(screen.getByLabelText(/^cidade$/i), { target: { value: 'Rio de Janeiro' } });
    fireEvent.change(screen.getByLabelText(/^uf$/i), { target: { value: 'RJ' } });
    fireEvent.change(screen.getByLabelText(/ponto de referência/i), { target: { value: 'Ao lado da banca de jornal' } });
    fireEvent.change(screen.getByLabelText(/tipo de conta/i), { target: { value: 'checking' } });
    fireEvent.change(screen.getByLabelText(/titular da conta/i), { target: { value: 'Dra Teste' } });
    fireEvent.change(screen.getByLabelText(/tipo de titular/i), { target: { value: 'individual' } });
    fireEvent.change(screen.getByLabelText(/periodicidade de repasse/i), { target: { value: 'daily' } });
    fireEvent.change(screen.getByLabelText(/dia do repasse/i), { target: { value: '2' } });
    fireEvent.click(screen.getByLabelText(/aceito os termos financeiros/i));
    fireEvent.click(screen.getByRole('button', { name: /enviar para o pagar\.me/i }));

    await waitFor(() => {
      expect(mockSubmitFinancialOnboarding).toHaveBeenCalledWith(
        expect.objectContaining({
          phoneNumber: '11912345678',
          bankAccount: expect.objectContaining({
            bankCode: '001',
            branchNumber: '1234',
            branchDigit: 'X',
            accountNumber: '1234567890123',
            accountDigit: 'X9',
            holderDocument: '52998224725'
          }),
          transferSettings: expect.objectContaining({
            transferInterval: 'daily',
            transferDay: 0
          })
        }),
        'tok'
      );
    });
  });

  it('fills address fields from the existing CEP lookup API', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({
      recipients: [
        {
          id: 'recipient-1',
          role: 'dentist',
          documentType: 'cpf',
          documentNumber: '52998224725',
          legalName: 'Dra Teste',
          status: 'pending_data',
          providerStatus: null,
          providerErrorCode: null,
          providerErrorMessage: null,
          termsVersion: null,
          updatedAt: '2026-07-02T20:00:00.000Z'
        }
      ]
    });
    const fetchMock = vi.fn(async () => ({
      ok: true,
      json: async () => ({
        cep: '01232-011',
        address: 'Rua Conselheiro Brotero',
        district: 'Santa Cecília',
        city: 'São Paulo',
        state: 'SP'
      })
    }));
    vi.stubGlobal('fetch', fetchMock);

    renderPage();
    await screen.findByRole('heading', { name: /onboarding financeiro/i });

    fireEvent.change(screen.getByLabelText(/^cep$/i), { target: { value: '01232011' } });
    fireEvent.blur(screen.getByLabelText(/^cep$/i));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledWith('https://cep.awesomeapi.com.br/json/01232011');
    });
    expect(screen.getByLabelText(/^cep$/i)).toHaveValue('01232-011');
    expect(screen.getByLabelText(/^logradouro$/i)).toHaveValue('Rua Conselheiro Brotero');
    expect(screen.getByLabelText(/^bairro$/i)).toHaveValue('Santa Cecília');
    expect(screen.getByLabelText(/^cidade$/i)).toHaveValue('São Paulo');
    expect(screen.getByLabelText(/^uf$/i)).toHaveValue('SP');
  });

  it('does not allow submitting a future birthdate', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({
      recipients: [
        {
          id: 'recipient-1',
          role: 'dentist',
          documentType: 'cpf',
          documentNumber: '52998224725',
          legalName: 'Dra Teste',
          status: 'pending_data',
          providerStatus: null,
          providerErrorCode: null,
          providerErrorMessage: null,
          termsVersion: null,
          updatedAt: '2026-07-02T20:00:00.000Z'
        }
      ]
    });

    renderPage();
    await screen.findByRole('heading', { name: /onboarding financeiro/i });

    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/data de nascimento/i), { target: { value: '2999-07-09' } });

    expect(screen.getByRole('button', { name: /enviar para o pagar\.me/i })).toBeDisabled();
    expect(mockSubmitFinancialOnboarding).not.toHaveBeenCalled();
  });

  it('shows sanitized provider errors and lets the user retry with corrected bank data', async () => {
    mockGetFinancialOnboarding.mockResolvedValueOnce({
      recipients: [
        {
          id: 'recipient-1',
          role: 'dentist',
          documentType: 'cpf',
          documentNumber: '52998224725',
          legalName: 'Dra Teste',
          status: 'creation_failed',
          providerStatus: null,
          providerErrorCode: 'invalid_bank_account',
          providerErrorMessage: 'Dados bancarios invalidos.',
          termsVersion: null,
          updatedAt: '2026-07-02T20:00:00.000Z'
        }
      ]
    });
    mockSubmitFinancialOnboarding.mockResolvedValueOnce({
      recipient: {
        id: 'recipient-1',
        role: 'dentist',
        documentType: 'cpf',
        documentNumber: '52998224725',
        legalName: 'Dra Teste',
        status: 'active',
        providerStatus: 'active',
        providerErrorCode: null,
        providerErrorMessage: null,
        termsVersion: 'financial-v1',
        updatedAt: '2026-07-02T20:00:00.000Z'
      }
    });

    renderPage();

    expect(await screen.findByText(/dados bancarios invalidos/i)).toBeInTheDocument();
    fillRequiredFields();
    fireEvent.change(screen.getByLabelText(/^conta$/i), { target: { value: '888888' } });
    fireEvent.click(screen.getByRole('button', { name: /reenviar para o pagar\.me/i }));

    await waitFor(() => {
      expect(mockSubmitFinancialOnboarding).toHaveBeenCalledWith(
        expect.objectContaining({
          bankAccount: expect.objectContaining({ accountNumber: '888888' })
        }),
        'tok'
      );
    });
    expect(await screen.findByText(/recebedor criado/i)).toBeInTheDocument();
  });
});
