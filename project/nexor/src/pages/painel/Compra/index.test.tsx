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
    isMockMode: false,
    demoPersona: null,
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
  const originalLocation = window.location;

  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: {
        ...originalLocation,
        origin: 'http://localhost:5173',
        assign: vi.fn(),
      },
    });
  });

  afterEach(() => {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: originalLocation,
    });
  });

  it('renders the reset Biteplaner purchase screen without loading legacy orders', () => {
    renderPage();

    expect(screen.getByRole('heading', { name: /confirmação de compra/i })).toBeInTheDocument();
    expect(screen.getByText(/dentista revisa o pedido/i)).toBeInTheDocument();
    expect(screen.getByText(/dentista conclui o pagamento/i)).toBeInTheDocument();
    expect(screen.queryByText(/cliente/i)).not.toBeInTheDocument();
    expect(screen.getByText(/novo checkout commerce da Nexor/i)).toBeInTheDocument();
    expect(screen.getByText((_content, element) => element?.textContent?.replace(/\s/g, ' ') === 'R$ 1.370,00/unidade')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ir para pagamento Asaas/i })).toHaveAttribute('data-tone', 'success');
    expect(mockApiGet).not.toHaveBeenCalled();
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('recalculates the Biteplaner total by quantity without creating legacy payment links', () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/quantidade/i), { target: { value: '4' } });

    expect(screen.getByText('R$ 5.480,00')).toBeInTheDocument();
    expect(mockApiGet).not.toHaveBeenCalled();
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('creates a commerce checkout and redirects the dentist to Asaas', async () => {
    mockApiPost.mockResolvedValueOnce({
      orderId: 'commerce-order-1',
      checkoutId: 'chk_123',
      checkoutUrl: 'https://sandbox.asaas.com/checkout/chk_123',
    });
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /ir para pagamento Asaas/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/commerce/biteplaner/checkout',
        {
          model: 'impacto',
          color: 'preto',
          quantity: 1,
          successUrl: 'https://wildland-backed-renewable.ngrok-free.dev/painel/biteplaner/ordens?checkout=success',
          cancelUrl: 'https://wildland-backed-renewable.ngrok-free.dev/painel/biteplaner/ordens?checkout=cancel',
        },
        'tok'
      );
    });
    expect(window.location.assign).toHaveBeenCalledWith('https://sandbox.asaas.com/checkout/chk_123');
  });
});
