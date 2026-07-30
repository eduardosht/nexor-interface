import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPatch, mockApiPost, mockSendPasswordReset } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPatch: vi.fn(),
  mockApiPost: vi.fn(),
  mockSendPasswordReset: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    patch: mockApiPatch,
    post: mockApiPost,
  },
}));

import { MinhaConta } from './index';

function renderPage(authOverrides: Record<string, unknown> = {}) {
  mockApiGet.mockImplementation((path: string) => {
    if (path === '/v1/account/consents') {
      return Promise.resolve({
        latestAccountConsents: {
          marketing: true,
          privacy: true,
          terms: true,
        },
      });
    }

    return Promise.resolve({});
  });

  mockUseAuth.mockReturnValue({
    session: { access_token: 'tok', user: { id: '1', email: 'joao@nexor.dev' } },
    backendUser: {
      email: 'joao@nexor.dev',
      fullName: 'João Silva',
      roles: ['user'],
      productRoles: [
        {
          productKey: 'biteplaner',
          role: 'dentist',
          status: 'pending',
          stage: 'licensing',
          metadata: {
            fullName: 'João Silva',
            cro: 'SP-12345',
          },
        },
      ],
    },
    hasConfiguredAuth: true,
    isMockMode: false,
    sendPasswordReset: mockSendPasswordReset,
    ...authOverrides,
  });

  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <MinhaConta />
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('MinhaConta', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPatch.mockReset();
    mockApiPost.mockReset();
    mockSendPasswordReset.mockReset();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
  });

  it('renders account data from auth state without requesting retired account endpoints', async () => {
    renderPage();

    expect(await screen.findByDisplayValue('João Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@nexor.dev')).toBeInTheDocument();
    expect(screen.getByText(/comunicações operacionais/i)).toBeInTheDocument();
    expect(screen.getByText(/solicitações LGPD/i)).toBeInTheDocument();

    await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith('/v1/account/consents', 'tok'));
    expect(mockApiGet).not.toHaveBeenCalledWith('/v1/account/product-roles', 'tok');
    expect(mockApiGet).not.toHaveBeenCalledWith('/v1/account/deletion-request/current', 'tok');
    expect(mockApiGet).not.toHaveBeenCalledWith('/v1/account/communication-preferences', 'tok');
  });

  it('does not patch the retired profile endpoint when the account name action is used', async () => {
    renderPage();

    fireEvent.change(await screen.findByLabelText(/nome completo/i), {
      target: { value: 'João Santos' },
    });
    fireEvent.click(screen.getByRole('button', { name: /atualizar localmente/i }));

    expect(mockApiPatch).not.toHaveBeenCalled();
    expect(await screen.findByRole('status')).toHaveTextContent(/cadastro centralizado/i);
  });



  it('keeps LGPD self-service actions on supported routes only', async () => {
    const createObjectURL = vi.fn(() => 'blob:nexor-export');
    const revokeObjectURL = vi.fn();
    const click = vi.fn();

    vi.stubGlobal('URL', {
      createObjectURL,
      revokeObjectURL,
    });
    vi.spyOn(document, 'createElement').mockImplementation((tagName: string) => {
      const element = document.createElementNS('http://www.w3.org/1999/xhtml', tagName) as HTMLAnchorElement;
      if (tagName === 'a') {
        element.click = click;
      }
      return element;
    });

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /exportar meus dados/i }));

    await waitFor(() => expect(mockApiGet).toHaveBeenCalledWith('/v1/account/privacy-export', 'tok'));
    expect(mockApiPost).not.toHaveBeenCalledWith('/v1/account/deletion-request', expect.anything(), 'tok');
  });
});
