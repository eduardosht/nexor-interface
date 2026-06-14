import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPost } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
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

import { Compra } from './index';

function renderPage(initialEntry = '/painel/compra') {
  mockUseAuth.mockReturnValue({
    loading: false,
    session: { access_token: 'tok', user: { id: '1', email: 'demo@nexor.dev' } },
    backendUser: { email: 'demo@nexor.dev', roles: ['customer'] },
    backendUserResolved: true,
    hasConfiguredAuth: true,
    isMockMode: true,
    demoPersona: 'athlete',
    signIn: vi.fn(),
    signInDemo: vi.fn(),
    signOut: vi.fn(),
    sendPasswordReset: vi.fn(),
    refreshBackendUser: vi.fn(),
  });

  return render(
    <MemoryRouter initialEntries={[initialEntry]}>
      <ThemeProvider theme={lightTheme}>
        <Compra />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Compra', () => {
  let locationAssign: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    locationAssign = vi.fn();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { ...window.location, assign: locationAssign },
    });
  });

  it('renders the payment-ready shared order', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111003',
          displayId: 'BP-DEMO-003',
          status: 'awaiting_payment',
          statusLabel: 'Aguardando pagamento',
          stage: 'awaiting_payment',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
        },
      ],
    });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('athlete-order-status')).toBeInTheDocument());
    expect(screen.queryByRole('link', { name: /visão geral dos steps/i })).not.toBeInTheDocument();
    expect(screen.queryByTestId('step-breadcrumb-current')).not.toBeInTheDocument();
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/pedido/i);
    expect(screen.getByText(/bp-demo-003/i)).toBeInTheDocument();
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/status atual/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/última atualização/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/etapa atual/i);
    expect(screen.queryByRole('link', { name: /ver jornada/i })).not.toBeInTheDocument();
    expect(screen.getByText(/próximos passos/i)).toBeInTheDocument();
    expect(screen.getByText(/aguardando pagamento pelo cliente/i)).toBeInTheDocument();
    expect(screen.getByText(/pedido será feito para a produção/i)).toBeInTheDocument();
    expect(screen.getByText(/dentista licenciado receberá o pedido/i)).toBeInTheDocument();
    expect(screen.queryByText(/próximos passos observáveis/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/pagamento via stripe checkout/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/biteplaner personalizado/i)).not.toBeInTheDocument();
    expect(screen.getByText(/importante/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /concluir pagamento/i })).toHaveAttribute('data-tone', 'success');
  });

  it('renders the success state only after the Stripe redirect success query param', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111003',
          displayId: 'BP-DEMO-003',
          status: 'payment_confirmed',
          statusLabel: 'Pagamento confirmado',
          stage: 'payment_confirmed',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
        },
      ],
    });

    renderPage('/painel/compra?checkout=success');

    await waitFor(() => expect(screen.getByText(/pagamento realizado com sucesso/i)).toBeInTheDocument());
    const orderCard = screen.getByTestId('payment-success-order-card');
    expect(orderCard).toHaveTextContent(/pedido/i);
    expect(orderCard).toHaveTextContent(/status atual/i);
    expect(orderCard).not.toHaveTextContent(/última atualização/i);
    expect(orderCard).not.toHaveTextContent(/data do pagamento/i);
    expect(orderCard).toHaveTextContent(/etapa atual/i);
    expect(orderCard).toHaveTextContent(/pagamento confirmado/i);
    expect(screen.queryByText(/aguardando pagamento pelo cliente/i)).not.toBeInTheDocument();
    expect(screen.getByText(/pedido será feito para a produção/i)).toBeInTheDocument();
    expect(screen.getByText(/aguardando/i)).toBeInTheDocument();
    expect(screen.getByText(/pagamento aprovado/i)).toBeInTheDocument();
    expect(screen.getByText(/transação processada com sucesso via stripe/i)).toBeInTheDocument();
    expect(screen.getByText(/comprovante e os informativos do pagamento serão enviados para o e-mail cadastrado/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver detalhes do pedido/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/jornada'
    );
    expect(screen.queryByRole('button', { name: /baixar comprovante/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /concluir pagamento/i })).not.toBeInTheDocument();
  });

  it('renders the paid success state when the current order was already paid', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111003',
          displayId: 'BP-DEMO-003',
          status: 'payment_confirmed',
          statusLabel: 'Pagamento confirmado',
          stage: 'payment_confirmed',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
        },
      ],
    });

    renderPage('/painel/compra');

    await waitFor(() => expect(screen.getByText(/pagamento realizado com sucesso/i)).toBeInTheDocument());
    expect(screen.queryByText(/nenhum pedido aguardando pagamento apareceu/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('payment-success-order-card')).toHaveTextContent(/pagamento confirmado/i);
    expect(screen.getByTestId('payment-success-order-card')).not.toHaveTextContent(/última atualização/i);
    expect(screen.getByText(/pagamento aprovado/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /concluir pagamento/i })).not.toBeInTheDocument();
  });

  it('renders the paid success state when the current order already advanced after payment', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111004',
          displayId: 'BP-DEMO-004',
          status: 'lab_processing',
          statusLabel: 'Em processo - Laboratório',
          stage: 'laboratory',
          created_at: '2026-05-02T10:00:00.000Z',
          customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
        },
      ],
    });

    renderPage('/painel/compra');

    await waitFor(() => expect(screen.getByText(/pagamento realizado com sucesso/i)).toBeInTheDocument());
    expect(screen.queryByText(/nenhum pedido aguardando pagamento apareceu/i)).not.toBeInTheDocument();
    expect(screen.getByTestId('payment-success-order-card')).toHaveTextContent(/em produção/i);
    expect(screen.getByTestId('payment-success-order-card')).not.toHaveTextContent(/última atualização/i);
    expect(screen.queryByRole('button', { name: /concluir pagamento/i })).not.toBeInTheDocument();
  });

  it('reconciles Stripe payment when checkout success returns with a session id', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111003',
          displayId: 'BP-DEMO-003',
          status: 'awaiting_payment',
          statusLabel: 'Aguardando pagamento',
          stage: 'awaiting_payment',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
        },
      ],
    });
    mockApiPost.mockResolvedValueOnce({
      order: {
        id: '11111111-1111-4111-8111-111111111003',
        status: 'payment_confirmed',
      },
    });

    renderPage('/painel/compra?checkout=success&session_id=cs_test_123');

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/11111111-1111-4111-8111-111111111003/checkout-session/cs_test_123/reconcile',
        {},
        'tok'
      )
    );
  });

  it('creates a Stripe checkout session and redirects the customer', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111003',
          displayId: 'BP-DEMO-003',
          status: 'awaiting_payment',
          statusLabel: 'Aguardando pagamento',
          stage: 'awaiting_payment',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
        },
      ],
    });
    mockApiPost.mockResolvedValueOnce({ url: 'https://checkout.stripe.test/session' });

    renderPage();

    await waitFor(() => expect(screen.getByText('BP-DEMO-003')).toBeInTheDocument());
    await waitFor(() => expect(screen.getByRole('button', { name: /concluir pagamento/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /concluir pagamento/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/11111111-1111-4111-8111-111111111003/checkout-session',
        {},
        'tok'
      )
    );
    expect(locationAssign).toHaveBeenCalledWith('https://checkout.stripe.test/session');
  });

  it('uses the real checkout order id when the loaded order comes from the demo mock', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: 'BP-DEMO-005',
          checkoutOrderId: '22222222-2222-4222-8222-222222222005',
          status: 'awaiting_payment',
          statusLabel: 'Aguardando pagamento',
          stage: 'awaiting_payment',
          created_at: '2026-05-02T14:00:00.000Z',
          customer: { full_name: 'Marina Lutadora', email: 'marina.demo@nexor.dev', phone: null },
        },
      ],
    });
    mockApiPost.mockResolvedValueOnce({ url: 'https://checkout.stripe.test/session' });

    renderPage();

    await waitFor(() => expect(screen.getByText('BP-DEMO-005')).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /concluir pagamento/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/22222222-2222-4222-8222-222222222005/checkout-session',
        {},
        'tok'
      )
    );
  });
});
