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

function renderPage() {
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
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <Compra />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('Compra', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
  });

  it('renders the payment-ready shared order', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: 'BP-DEMO-003',
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
    expect(screen.getByRole('link', { name: /visão geral dos steps/i })).toHaveAttribute('href', '/painel/biteplaner/jornada');
    expect(screen.getByTestId('step-breadcrumb-current')).toHaveTextContent(/compra/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/pedido/i);
    expect(screen.getByText(/bp-demo-003/i)).toBeInTheDocument();
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/status atual/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/última atualização/i);
    expect(screen.getByTestId('athlete-order-card')).toHaveTextContent(/etapa atual/i);
    expect(screen.queryByRole('link', { name: /ver jornada/i })).not.toBeInTheDocument();
  });

  it('confirms the mock purchase and updates the visible status', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: 'BP-DEMO-003',
          status: 'awaiting_payment',
          statusLabel: 'Aguardando pagamento',
          stage: 'awaiting_payment',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
        },
      ],
    });
    mockApiPost.mockResolvedValueOnce({
      id: 'BP-DEMO-003',
        status: 'payment_confirmed',
        statusLabel: 'Pronto para laboratório',
        stage: 'ready_for_lab',
        created_at: '2026-05-01T10:00:00.000Z',
        customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
    });

    renderPage();

    await waitFor(() => expect(screen.getByRole('button', { name: /confirmar compra mock/i })).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /confirmar compra mock/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/admin/orders/BP-DEMO-003/payment-confirmation',
        {},
        'tok'
      )
    );
    expect(screen.getByTestId('athlete-order-status')).toHaveTextContent(/pronto para laboratório/i);
  });
});
