import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPost, mockUseAdminPortal, mockClipboardWriteText } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
  mockUseAdminPortal: vi.fn(),
  mockClipboardWriteText: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    post: mockApiPost,
  },
}));

vi.mock('../../../features/admin/portal', () => ({
  useAdminPortal: mockUseAdminPortal,
}));

import { AdminPayments } from './AdminPayments';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function renderPage() {
  mockUseAuth.mockReturnValue({
    session: { access_token: 'tok', user: { id: '1', email: 'admin@nexor.dev' } },
  });

  mockUseAdminPortal.mockReturnValue({
    selectedProduct: { id: 'biteplaner', name: 'Biteplaner', label: 'Biteplaner', description: '', status: 'available' },
  });

  return render(
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <MemoryRouter>
          <AdminPayments />
        </MemoryRouter>
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('AdminPayments', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockUseAdminPortal.mockReset();
    mockClipboardWriteText.mockReset();
    Object.defineProperty(navigator, 'clipboard', {
      configurable: true,
      value: {
        writeText: mockClipboardWriteText,
      },
    });
  });

  it('lists purchase confirmations waiting for manual payment link delivery', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111003',
          displayId: 'BP-DEMO-003',
          status: 'awaiting_payment',
          statusLabel: 'Aguardando pagamento',
          stage: 'awaiting_payment',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'João Demo', email: 'joao@nexor.dev', phone: '+55 11 99999-0000' },
          purchaseConfiguration: { productKey: 'biteplaner', model: 'impacto', color: 'preto', quantity: 2 },
          paymentRequest: { status: 'pending_admin_message' },
        },
      ],
    });

    renderPage();

    await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith('/v1/orders?limit=30', 'tok'));
    const table = await screen.findByTestId('admin-payments-table');
    expect(table).toHaveTextContent(/joão demo/i);
    expect(table).toHaveTextContent(/joao@nexor.dev/i);
    expect(table).toHaveTextContent(/\+55 11 99999-0000/i);
    expect(table).toHaveTextContent(/r\$ 2\.740,00/i);
    expect(table).toHaveTextContent(/aguardando envio/i);
  });

  it('keeps orders after payment confirmation visible as confirmed payments', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111003',
          displayId: 'BP-DEMO-003',
          status: 'awaiting_dentist_forms',
          statusLabel: 'Aguardando preenchimento dentista',
          stage: 'awaiting_dentist_forms',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'João Demo', email: 'joao@nexor.dev', phone: '+55 11 99999-0000' },
          purchaseConfiguration: { productKey: 'biteplaner', model: 'impacto', color: 'preto', quantity: 2 },
          paymentRequest: { status: 'paid' },
        },
      ],
    });

    renderPage();

    const table = await screen.findByTestId('admin-payments-table');
    expect(table).toHaveTextContent(/bp-demo-003/i);
    expect(table).toHaveTextContent(/pagamento confirmado/i);
  });

  it('renders payments with the same responsive operational table pattern used by dentist orders', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111003',
          displayId: 'BP-DEMO-003',
          status: 'awaiting_payment',
          statusLabel: 'Aguardando pagamento',
          stage: 'awaiting_payment',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'João Demo', email: 'joao@nexor.dev', phone: '+55 11 99999-0000' },
          purchaseConfiguration: { productKey: 'biteplaner', model: 'impacto', color: 'preto', quantity: 2 },
          paymentRequest: { status: 'pending_admin_message' },
        },
      ],
    });

    renderPage();

    const mobileList = await screen.findByTestId('admin-payments-table-mobile');
    expect(mobileList).toHaveTextContent(/bp-demo-003/i);
    expect(mobileList).toHaveTextContent(/joão demo/i);
    expect(mobileList).toHaveTextContent(/joao@nexor.dev/i);
    expect(mobileList).toHaveTextContent(/\+55 11 99999-0000/i);
    expect(mobileList).toHaveTextContent(/r\$ 2\.740,00/i);
    expect(
      within(mobileList).getByRole('button', { name: /ver mensagem de pagamento bp-demo-003/i, hidden: true })
    ).toBeInTheDocument();
  });

  it('opens a ready-to-send payment message, copies it, and confirms payment', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111003',
          displayId: 'BP-DEMO-003',
          status: 'awaiting_payment',
          statusLabel: 'Aguardando pagamento',
          stage: 'awaiting_payment',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'João Demo', email: 'joao@nexor.dev', phone: '+55 11 99999-0000' },
          purchaseConfiguration: { productKey: 'biteplaner', model: 'impacto', color: 'preto', quantity: 2 },
          paymentRequest: { status: 'pending_admin_message' },
        },
      ],
    });
    mockApiPost.mockResolvedValueOnce({
      id: '11111111-1111-4111-8111-111111111003',
      displayId: 'BP-DEMO-003',
      status: 'awaiting_dentist_forms',
      statusLabel: 'Aguardando preenchimento dentista',
      stage: 'awaiting_dentist_forms',
      created_at: '2026-05-01T10:00:00.000Z',
      customer: { full_name: 'João Demo', email: 'joao@nexor.dev', phone: '+55 11 99999-0000' },
      purchaseConfiguration: { productKey: 'biteplaner', model: 'impacto', color: 'preto', quantity: 2 },
      paymentRequest: { status: 'paid' },
    });
    mockClipboardWriteText.mockResolvedValueOnce(undefined);

    renderPage();

    const viewButton = await screen.findByRole('button', { name: /ver mensagem de pagamento bp-demo-003/i });
    fireEvent.click(viewButton);

    const dialog = screen.getByRole('dialog', { name: /mensagem de pagamento/i });
    expect(within(dialog).getByText(/olá, joão demo/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/modelo: linha impact/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/valor: r\$ 2\.740,00/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/envie o link de pagamento/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: /copiar mensagem de pagamento/i }));

    await waitFor(() => expect(mockClipboardWriteText).toHaveBeenCalledWith(expect.stringContaining('Olá, João Demo.')));
    expect(screen.getByText(/mensagem copiada/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: /pagamento confirmado/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/admin/orders/11111111-1111-4111-8111-111111111003/payment-confirmation',
        {},
        'tok'
      )
    );
    expect(screen.getByRole('status')).toHaveTextContent(/pagamento confirmado/i);
    expect(screen.getByTestId('admin-payments-table')).toHaveTextContent(/bp-demo-003/i);
    expect(screen.getByTestId('admin-payments-table')).toHaveTextContent(/pagamento confirmado/i);
  });

  it('closes the payment message modal through an icon button', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111003',
          displayId: 'BP-DEMO-003',
          status: 'awaiting_payment',
          statusLabel: 'Aguardando pagamento',
          stage: 'awaiting_payment',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'João Demo', email: 'joao@nexor.dev', phone: '+55 11 99999-0000' },
          purchaseConfiguration: { productKey: 'biteplaner', model: 'impacto', color: 'preto', quantity: 2 },
          paymentRequest: { status: 'pending_admin_message' },
        },
      ],
    });

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /ver mensagem de pagamento bp-demo-003/i }));
    const dialog = screen.getByRole('dialog', { name: /mensagem de pagamento/i });
    expect(within(dialog).queryByRole('button', { name: /^fechar$/i })).not.toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: /fechar mensagem de pagamento/i }));

    expect(screen.queryByRole('dialog', { name: /mensagem de pagamento/i })).not.toBeInTheDocument();
  });
});
