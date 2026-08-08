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

function fillRequiredTechnicalForm() {
  fireEvent.click(screen.getByRole('button', { name: /categoria do esporte/i }));
  fireEvent.click(screen.getByRole('option', { name: /esportes de raquete/i }));
  fireEvent.change(screen.getByLabelText(/^idade$/i), { target: { value: '34' } });
  fireEvent.click(screen.getByRole('button', { name: /sexo biol/i }));
  fireEvent.click(screen.getByRole('option', { name: /feminino/i }));
  for (const [label, fileName, type] of [
    ['escaneamento 3d das duas arcadas', 'arcadas.stl', 'model/stl'],
    ['escaneamento 3d lateral com jig', 'lateral.stl', 'model/stl'],
    ['imagem da prescri', 'prescricao.png', 'image/png'],
  ] as const) {
    fireEvent.change(screen.getByLabelText(new RegExp(`selecionar ${label}`, 'i')), {
      target: { files: [new File(['file'], fileName, { type })] },
    });
  }
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
    expect(screen.getByText((_content, element) => element?.textContent?.replace(/\s/g, ' ') === 'R$ 1.400,00/unidade')).toBeInTheDocument();
    expect(screen.queryByText(/modelo do biteplaner/i)).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /ir para pagamento Asaas/i })).toBeDisabled();
    expect(screen.getByText(/dados para produ/i)).toBeInTheDocument();
    expect(mockApiGet).not.toHaveBeenCalled();
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('recalculates the Biteplaner total by quantity without creating legacy payment links', () => {
    renderPage();

    fireEvent.change(screen.getByLabelText(/quantidade/i), { target: { value: '4' } });

    expect(screen.getByText('R$ 5.600,00')).toBeInTheDocument();
    expect(mockApiGet).not.toHaveBeenCalled();
    expect(mockApiPost).not.toHaveBeenCalled();
  });

  it('creates a commerce checkout and redirects the dentist to Asaas', async () => {
    mockApiPost.mockImplementation(async (path: string) => {
      if (path.endsWith('/drafts')) return { orderId: 'draft-order-1', itemId: 'draft-item-1' };
      if (path.includes('/upload-intent')) return {
        uploadId: 'upload-1', objectKey: 'object-key', uploadUrl: 'https://s3.test/upload',
        requiredHeaders: {}, expiresAt: '2026-08-08T00:00:00.000Z',
      };
      if (path.includes('/confirm')) return { fileRef: { id: 'attachment-1', slotKey: 'two_arches_scan' } };
      return { orderId: 'draft-order-1', checkoutId: 'chk_123', checkoutUrl: 'https://sandbox.asaas.com/checkout/chk_123' };
    });
    vi.stubGlobal('fetch', vi.fn(async () => new Response(null, { status: 200 })));
    renderPage();
    fillRequiredTechnicalForm();
    fireEvent.click(screen.getByRole('button', { name: /ir para pagamento Asaas/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/commerce/biteplaner/drafts',
        {
          color: 'preto',
          quantity: 1,
          sportCategory: 'racket_sports',
          athleteAge: 34,
          biologicalSex: 'female',
        },
        'tok'
      );
      expect(mockApiPost).toHaveBeenLastCalledWith(
        '/v1/commerce/biteplaner/checkout',
        {
          draftOrderId: 'draft-order-1',
          successUrl: 'https://wildland-backed-renewable.ngrok-free.dev/painel/biteplaner/ordens?checkout=success',
          cancelUrl: 'https://wildland-backed-renewable.ngrok-free.dev/painel/biteplaner/ordens?checkout=cancel',
        },
        'tok'
      );
    });
    expect(window.location.assign).toHaveBeenCalledWith('https://sandbox.asaas.com/checkout/chk_123');
  });

  it('shows the backend reference when the checkout service fails', async () => {
    mockApiPost.mockRejectedValueOnce(Object.assign(new Error('Não foi possível preparar o upload do arquivo.'), {
      requestId: 'req-upload-123',
    }));
    renderPage();
    fillRequiredTechnicalForm();
    fireEvent.click(screen.getByRole('button', { name: /ir para pagamento Asaas/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent(
      'Não foi possível preparar o upload do arquivo. Referência: req-upload-123'
    );
  });
});
