import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { AdminLaboratories } from './AdminLaboratories';

const mockGet = vi.fn();
const mockPost = vi.fn();
const mockPatch = vi.fn();
const mockWindowOpen = vi.fn();

vi.mock('../../../hooks/useAuth', () => ({ useAuth: () => ({ session: { access_token: 'tok' } }) }));
vi.mock('../../../lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockGet(...args),
    post: (...args: unknown[]) => mockPost(...args),
    patch: (...args: unknown[]) => mockPatch(...args)
  }
}));

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

const laboratory = {
  id: 'lab-1',
  name: 'Lab Prime',
  legalName: 'Lab Prime Ltda',
  cnpj: '11222333000181',
  email: 'lab@nexor.dev',
  phone: null,
  cep: null,
  addressLine: null,
  addressNumber: null,
  addressComplement: null,
  neighborhood: null,
  city: null,
  state: null,
  asaasMode: 'linked_account' as const,
  companyType: null,
  mobilePhone: null,
  incomeValue: null,
  asaasAccountId: 'acc-1',
  asaasWalletId: 'wallet-1',
  integrationStatus: 'ready' as const,
  integrationErrorMessage: null,
  splitFixedValueCents: 17500,
  distributionWeightBasisPoints: 50,
  active: true,
  asaasValidationStatus: null,
  asaasValidationReason: null,
  paymentStatus: null,
  splitStatus: null,
  verifiedAt: null,
  lastWebhookEventAt: null,
  asaasSplitTest: null
};

function renderPage() {
  return render(
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <MemoryRouter><AdminLaboratories /></MemoryRouter>
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('AdminLaboratories', () => {
  beforeEach(() => {
    mockGet.mockReset();
    mockPost.mockReset();
    mockPatch.mockReset();
    mockWindowOpen.mockReset();
    vi.stubGlobal('open', mockWindowOpen);
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it('lists the wallet, fixed split and routing weight', async () => {
    mockGet.mockResolvedValue({ laboratories: [laboratory] });
    renderPage();

    await screen.findByText('Lab Prime');
    expect(screen.getByText('wallet-1')).toBeInTheDocument();
    expect(screen.getByText('R$ 175,00')).toBeInTheDocument();
    expect(screen.getAllByText('50,00%').length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText('Teste não enviado')).toBeInTheDocument();
  });

  it('does not offer validation when a wallet is missing', async () => {
    mockGet.mockResolvedValue({ laboratories: [{ ...laboratory, asaasWalletId: null, integrationStatus: 'pending' }] });
    renderPage();

    await screen.findByText('Lab Prime');
    expect(screen.queryByRole('button', { name: /validar integração asaas de lab prime/i })).not.toBeInTheDocument();
    expect(screen.getByText('Pendente Asaas')).toBeInTheDocument();
  });

  it('opens the linked-account modal with wallet and split controls', async () => {
    mockGet.mockResolvedValue({ laboratories: [] });
    renderPage();

    await screen.findByText(/Nenhum laboratório cadastrado/);
    fireEvent.click(screen.getByRole('button', { name: /cadastrar laboratório/i }));
    const modal = screen.getByRole('dialog', { name: /novo laboratório/i });

    expect(within(modal).getByLabelText('Wallet Asaas')).toBeInTheDocument();
    expect(within(modal).getByLabelText('Split fixo (R$)')).toBeInTheDocument();
    expect(within(modal).getByLabelText('Peso de distribuição (%)')).toBeInTheDocument();
    expect(within(modal).queryByText('Modo Asaas')).not.toBeInTheDocument();
  });

  it('submits the linked wallet and configurable split rules', async () => {
    mockGet.mockResolvedValue({ laboratories: [] });
    mockPost.mockResolvedValue({ laboratory });
    renderPage();

    await screen.findByText(/Nenhum laboratório cadastrado/);
    fireEvent.click(screen.getByRole('button', { name: /cadastrar laboratório/i }));
    const modal = screen.getByRole('dialog', { name: /novo laboratório/i });
    fireEvent.change(within(modal).getByLabelText('Nome do laboratório'), { target: { value: 'Lab Prime' } });
    fireEvent.change(within(modal).getByLabelText('Wallet Asaas'), { target: { value: 'wallet-1' } });
    fireEvent.change(within(modal).getByLabelText('Split fixo (R$)'), { target: { value: '175,00' } });
    fireEvent.change(within(modal).getByLabelText('Peso de distribuição (%)'), { target: { value: '50' } });
    fireEvent.click(within(modal).getByRole('button', { name: /cadastrar laboratório/i }));

    await waitFor(() => expect(mockPost).toHaveBeenCalledWith(
      '/v1/admin/commerce/laboratories',
      expect.objectContaining({
        asaasMode: 'linked_account',
        asaasWalletId: 'wallet-1',
        splitFixedValueCents: 17500,
        distributionWeightBasisPoints: 50
      }),
      'tok'
    ));
  });

  it('validates a pending linked account through the Asaas action', async () => {
    const pending = { ...laboratory, integrationStatus: 'pending' as const };
    mockGet.mockResolvedValueOnce({ laboratories: [pending] }).mockResolvedValueOnce({ laboratories: [laboratory] });
    mockPost.mockResolvedValue({ laboratory });
    renderPage();

    await screen.findByText('Pendente Asaas');
    fireEvent.click(screen.getByRole('button', { name: /validar integração asaas de lab prime/i }));

    await waitFor(() => expect(mockPost).toHaveBeenCalledWith(
      '/v1/admin/commerce/laboratories/lab-1/validate-asaas',
      {},
      'tok'
    ));
    expect(await screen.findByText('Integração Asaas validada.')).toBeInTheDocument();
  });

  it('maps persisted split validation states explicitly and only counts approved laboratories as ready', async () => {
    mockGet.mockResolvedValue({
      laboratories: [
        laboratory,
        {
          ...laboratory,
          id: 'lab-2',
          name: 'Lab Awaiting',
          distributionWeightBasisPoints: 10,
          asaasValidationStatus: 'awaiting_payment',
          asaasSplitTest: {
            status: 'awaiting_payment',
            paymentStatus: 'PENDING',
            splitStatus: null,
            failureReason: null,
            verifiedAt: null,
            lastWebhookEventAt: null
          }
        },
        {
          ...laboratory,
          id: 'lab-3',
          name: 'Lab Checkout',
          distributionWeightBasisPoints: 15,
          asaasValidationStatus: 'checkout_paid',
          paymentStatus: 'CONFIRMED',
          asaasSplitTest: {
            status: 'checkout_paid',
            paymentStatus: 'CONFIRMED',
            splitStatus: null,
            failureReason: null,
            verifiedAt: null,
            lastWebhookEventAt: '2026-08-06T12:05:00.000Z'
          }
        },
        {
          ...laboratory,
          id: 'lab-4',
          name: 'Lab Received',
          distributionWeightBasisPoints: 20,
          asaasValidationStatus: 'payment_received',
          paymentStatus: 'RECEIVED',
          splitStatus: 'PENDING',
          asaasSplitTest: {
            status: 'payment_received',
            paymentStatus: 'RECEIVED',
            splitStatus: 'PENDING',
            failureReason: null,
            verifiedAt: null,
            lastWebhookEventAt: '2026-08-06T12:05:00.000Z'
          }
        },
        {
          ...laboratory,
          id: 'lab-5',
          name: 'Lab Approved',
          asaasValidationStatus: 'approved',
          paymentStatus: 'CONFIRMED',
          splitStatus: 'DONE',
          verifiedAt: '2026-08-06T14:00:00.000Z',
          asaasSplitTest: {
            status: 'approved',
            paymentStatus: 'CONFIRMED',
            splitStatus: 'DONE',
            failureReason: null,
            verifiedAt: '2026-08-06T14:00:00.000Z',
            lastWebhookEventAt: '2026-08-06T14:05:00.000Z'
          }
        },
        {
          ...laboratory,
          id: 'lab-6',
          name: 'Lab Failed',
          distributionWeightBasisPoints: 30,
          asaasValidationStatus: 'failed',
          asaasValidationReason: 'Split cancelado.',
          paymentStatus: 'CONFIRMED',
          splitStatus: 'CANCELLED',
          asaasSplitTest: {
            status: 'failed',
            paymentStatus: 'CONFIRMED',
            splitStatus: 'CANCELLED',
            failureReason: 'Split cancelado.',
            verifiedAt: null,
            lastWebhookEventAt: '2026-08-06T12:05:00.000Z'
          }
        }
      ]
    });
    renderPage();

    await screen.findByText('Lab Failed');
    expect(screen.getByText('Teste não enviado')).toBeInTheDocument();
    expect(screen.getByText('Aguardando pagamento')).toBeInTheDocument();
    expect(screen.getByText('Checkout pago; aguardando confirmação')).toBeInTheDocument();
    expect(screen.getByText('Pagamento recebido; validando split')).toBeInTheDocument();
    expect(screen.getByText('Aprovado para split')).toBeInTheDocument();
    expect(screen.getByText('Falha na validação')).toBeInTheDocument();
    expect(screen.getAllByText('50,00%').length).toBeGreaterThanOrEqual(2);
  });

  it('keeps consulting disabled until a split test exists', async () => {
    mockGet.mockResolvedValue({ laboratories: [laboratory] });
    renderPage();

    await screen.findByText('Lab Prime');
    expect(screen.getByRole('button', { name: /consultar resultado do split de lab prime/i })).toBeDisabled();
  });

  it('retries a failed split test explicitly and blocks repeat submission while the request is in flight', async () => {
    let resolvePost: ((value: { test: { url: string; amountCents: number; splitFixedValueCents: number; testId: string; status: string } }) => void) | undefined;
    mockGet.mockResolvedValue({
      laboratories: [
        {
          ...laboratory,
          asaasValidationStatus: 'failed',
          asaasValidationReason: 'Split cancelado.',
          asaasSplitTest: {
            status: 'failed',
            paymentStatus: 'CONFIRMED',
            splitStatus: 'CANCELLED',
            failureReason: 'Split cancelado.',
            verifiedAt: null,
            lastWebhookEventAt: '2026-08-06T12:05:00.000Z'
          }
        }
      ]
    });
    mockPost.mockImplementation(
      () => new Promise((resolve) => {
        resolvePost = resolve;
      })
    );
    renderPage();

    await screen.findByText('Falha na validação');
    const retryButton = screen.getByRole('button', { name: /reenviar teste de split de lab prime/i });
    fireEvent.click(retryButton);

    await waitFor(() => expect(mockPost).toHaveBeenCalledWith(
      '/v1/admin/commerce/laboratories/lab-1/test-split',
      { retryFailed: true },
      'tok'
    ));
    expect(retryButton).toBeDisabled();

    resolvePost?.({
      test: {
        url: 'https://sandbox.example/checkout',
        amountCents: 500,
        splitFixedValueCents: 100,
        testId: 'split-test-1',
        status: 'awaiting_payment'
      }
    });
  });

  it('shows persisted split details and the actionable failure reason after consulting the result', async () => {
    mockGet
      .mockResolvedValueOnce({
        laboratories: [
          {
            ...laboratory,
            asaasValidationStatus: 'failed',
            asaasValidationReason: 'Split cancelado. Corrija o wallet no Asaas e tente novamente.',
            paymentStatus: 'CONFIRMED',
            splitStatus: 'CANCELLED',
            verifiedAt: null,
            lastWebhookEventAt: '2026-08-06T12:05:00.000Z',
            asaasSplitTest: {
              status: 'failed',
              paymentStatus: 'CONFIRMED',
              splitStatus: 'CANCELLED',
              failureReason: 'Split cancelado. Corrija o wallet no Asaas e tente novamente.',
              verifiedAt: null,
              lastWebhookEventAt: '2026-08-06T12:05:00.000Z'
            }
          }
        ]
      })
      .mockResolvedValueOnce({
        test: {
          id: 'split-test-1',
          laboratoryPartnerId: 'lab-1',
          externalReference: 'external-1',
          checkoutId: 'checkout-1',
          paymentId: 'payment-1',
          walletId: 'wallet-1',
          amountCents: 500,
          splitFixedValueCents: 100,
          status: 'failed',
          paymentStatus: 'CONFIRMED',
          splitId: 'split-1',
          splitStatus: 'CANCELLED',
          failureReason: 'Split cancelado. Corrija o wallet no Asaas e tente novamente.',
          verifiedAt: null,
          createdAt: '2026-08-06T11:00:00.000Z',
          updatedAt: '2026-08-06T12:00:00.000Z',
          lastWebhookEventAt: '2026-08-06T12:05:00.000Z'
        },
        reconciliation: {
          attempted: false,
          error: null
        }
      })
      .mockResolvedValueOnce({
        laboratories: [
          {
            ...laboratory,
            asaasValidationStatus: 'failed',
            asaasValidationReason: 'Split cancelado. Corrija o wallet no Asaas e tente novamente.',
            paymentStatus: 'CONFIRMED',
            splitStatus: 'CANCELLED',
            verifiedAt: null,
            lastWebhookEventAt: '2026-08-06T12:05:00.000Z',
            asaasSplitTest: {
              status: 'failed',
              paymentStatus: 'CONFIRMED',
              splitStatus: 'CANCELLED',
              failureReason: 'Split cancelado. Corrija o wallet no Asaas e tente novamente.',
              verifiedAt: null,
              lastWebhookEventAt: '2026-08-06T12:05:00.000Z'
            }
          }
        ]
      });
    renderPage();

    await screen.findByText('Falha na validação');
    fireEvent.click(screen.getByRole('button', { name: /consultar resultado do split de lab prime/i }));

    const row = screen.getByText('Lab Prime').closest('tr');
    expect(row).not.toBeNull();
    await waitFor(() => {
      const currentRow = row as HTMLTableRowElement;
      expect(within(currentRow).getByText(/wallet validado: wallet-1/i)).toBeInTheDocument();
      expect(within(currentRow).getByText(/valor do teste: r\$ 5,00/i)).toBeInTheDocument();
      expect(within(currentRow).getByText(/split cancelado\. corrija o wallet no asaas e tente novamente\./i)).toBeInTheDocument();
      expect(within(currentRow).getAllByText(/06\/08\/2026/)).toHaveLength(2);
    });
  });

  it('does not fabricate the test amount when the persisted summary omits it', async () => {
    mockGet.mockResolvedValue({
      laboratories: [
        {
          ...laboratory,
          asaasValidationStatus: 'awaiting_payment',
          asaasSplitTest: {
            status: 'awaiting_payment',
            paymentStatus: 'PENDING',
            splitStatus: null,
            failureReason: null,
            verifiedAt: null,
            lastWebhookEventAt: null
          }
        }
      ]
    });
    renderPage();

    const row = (await screen.findByText('Lab Prime')).closest('tr');
    expect(row).not.toBeNull();
    expect(within(row as HTMLTableRowElement).getByText('Valor do teste: não disponível')).toBeInTheDocument();
    expect(within(row as HTMLTableRowElement).queryByText(/valor do teste: r\$ 5,00/i)).not.toBeInTheDocument();
  });

  it('shows the reconciliation error instead of a generic success message', async () => {
    const reconciliationError = 'Consulta manual indisponível no Asaas. Aguarde o webhook e tente novamente.';
    mockGet
      .mockResolvedValueOnce({
        laboratories: [
          {
            ...laboratory,
            asaasValidationStatus: 'awaiting_payment',
            asaasSplitTest: {
              status: 'awaiting_payment',
              amountCents: 500,
              splitFixedValueCents: 100,
              paymentStatus: 'PENDING',
              splitStatus: null,
              failureReason: null,
              verifiedAt: null,
              lastWebhookEventAt: null
            }
          }
        ]
      })
      .mockResolvedValueOnce({
        test: {
          id: 'split-test-1',
          laboratoryPartnerId: 'lab-1',
          externalReference: 'external-1',
          checkoutId: 'checkout-1',
          paymentId: null,
          walletId: 'wallet-1',
          amountCents: 500,
          splitFixedValueCents: 100,
          status: 'awaiting_payment',
          paymentStatus: 'PENDING',
          splitId: null,
          splitStatus: null,
          failureReason: null,
          verifiedAt: null,
          createdAt: '2026-08-06T11:00:00.000Z',
          updatedAt: '2026-08-06T12:00:00.000Z',
          lastWebhookEventAt: null
        },
        reconciliation: {
          attempted: true,
          error: reconciliationError
        }
      })
      .mockResolvedValueOnce({
        laboratories: [
          {
            ...laboratory,
            asaasValidationStatus: 'awaiting_payment',
            asaasSplitTest: {
              status: 'awaiting_payment',
              amountCents: 500,
              splitFixedValueCents: 100,
              paymentStatus: 'PENDING',
              splitStatus: null,
              failureReason: null,
              verifiedAt: null,
              lastWebhookEventAt: null
            }
          }
        ]
      });
    renderPage();

    await screen.findByText('Aguardando pagamento');
    fireEvent.click(screen.getByRole('button', { name: /consultar resultado do split de lab prime/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(reconciliationError);
    expect(screen.queryByText(/status atualizado:/i)).not.toBeInTheDocument();
    const row = screen.getByText('Lab Prime').closest('tr');
    expect(row).not.toBeNull();
    expect(within(row as HTMLTableRowElement).getByText(reconciliationError)).toBeInTheDocument();
  });

  it('schedules a moderate refresh while a split test is pending', async () => {
    const timeoutSpy = vi.spyOn(window, 'setTimeout');
    mockGet.mockResolvedValue({
      laboratories: [
        {
          ...laboratory,
          asaasValidationStatus: 'awaiting_payment',
          asaasSplitTest: {
            status: 'awaiting_payment',
            paymentStatus: 'PENDING',
            splitStatus: null,
            failureReason: null,
            verifiedAt: null,
            lastWebhookEventAt: null
          }
        }
      ]
    });
    renderPage();

    await screen.findByText('Aguardando pagamento');
    expect(timeoutSpy).toHaveBeenCalledWith(expect.any(Function), 30000);
  });
});