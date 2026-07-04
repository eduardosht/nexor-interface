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

function renderPage(initialEntry = '/painel/confirmacao-compra') {
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
  let openSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
  });

  afterEach(() => {
    openSpy.mockRestore();
  });

  it('renders the purchase confirmation screen with hosted Pagar.me checkout copy', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111003',
          displayId: 'BP-DEMO-003',
          status: 'awaiting_payment',
          statusLabel: 'Aguardando pagamento',
          stage: 'awaiting_payment',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'João Demo', email: 'joao@nexor.dev', phone: null },
        },
      ],
    });

    renderPage();

    await waitFor(() => expect(screen.getByText('BP-DEMO-003')).toBeInTheDocument());

    expect(screen.getByRole('heading', { name: /confirmação de compra/i })).toBeInTheDocument();
    expect(screen.getByText(/checkout seguro do Pagar\.me/i)).toBeInTheDocument();
    expect(screen.getByText((_content, element) => element?.textContent?.replace(/\s/g, ' ') === 'R$ 1.370,00/unidade')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ir para pagamento pagar\.me/i })).toHaveAttribute('data-tone', 'success');
    expect(screen.queryByText(/enviaremos o link de pagamento por e-mail e celular/i)).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /enviar ordem de compra/i })).not.toBeInTheDocument();
  });

  it('creates a hosted Pagar.me checkout link and opens it in the current tab', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111003',
          displayId: 'BP-DEMO-003',
          status: 'awaiting_payment',
          statusLabel: 'Aguardando pagamento',
          stage: 'awaiting_payment',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'João Demo', email: 'joao@nexor.dev', phone: null },
        },
      ],
    });
    mockApiPost.mockResolvedValueOnce({ url: 'https://checkout.pagar.me/test-link' });

    renderPage();

    await waitFor(() => expect(screen.getByText('BP-DEMO-003')).toBeInTheDocument());
    fireEvent.change(screen.getByLabelText(/quantidade/i), { target: { value: '2' } });
    fireEvent.click(screen.getByRole('button', { name: /ir para pagamento pagar\.me/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/orders/11111111-1111-4111-8111-111111111003/payment-link',
        { model: 'impacto', color: 'preto', quantity: 2 },
        'tok'
      )
    );
    expect(openSpy).toHaveBeenCalledWith('https://checkout.pagar.me/test-link', '_self', 'noopener');
  });

  it('prefills Biteplaner configuration from dentist recommendation and recalculates total by quantity', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: '11111111-1111-4111-8111-111111111003',
          displayId: 'BP-DEMO-003',
          status: 'awaiting_payment',
          statusLabel: 'Aguardando pagamento',
          stage: 'awaiting_payment',
          created_at: '2026-05-01T10:00:00.000Z',
          customer: { full_name: 'João Demo', email: 'joao@nexor.dev', phone: null },
          dentistRecommendedPurchaseConfiguration: {
            productKey: 'biteplaner',
            model: 'esportes',
            color: 'branco',
            quantity: 3,
          },
        },
      ],
    });

    renderPage();

    await waitFor(() => expect(screen.getByText('BP-DEMO-003')).toBeInTheDocument());
    await waitFor(() =>
      expect(screen.getByRole('button', { name: /modelo do biteplaner/i })).toHaveTextContent(/linha strength/i)
    );
    expect(screen.getByRole('button', { name: /cor do biteplaner/i })).toHaveTextContent(/branco/i);
    expect(screen.getByLabelText(/quantidade/i)).toHaveValue(3);
    expect(screen.getByText('R$ 4.110,00')).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/quantidade/i), { target: { value: '4' } });

    expect(screen.getByText('R$ 5.480,00')).toBeInTheDocument();
  });
});
