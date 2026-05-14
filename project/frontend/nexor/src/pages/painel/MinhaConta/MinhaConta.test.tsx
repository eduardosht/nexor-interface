import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPatch, mockSendPasswordReset } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPatch: vi.fn(),
  mockSendPasswordReset: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    patch: mockApiPatch,
  },
}));

import { MinhaConta } from './index';

function renderPage(authOverrides: Record<string, unknown> = {}) {
  mockUseAuth.mockReturnValue({
    session: { access_token: 'tok', user: { id: '1', email: 'joao@nexor.dev' } },
    backendUser: { email: 'joao@nexor.dev', roles: ['user'] },
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
    mockSendPasswordReset.mockReset();
  });

  it('shows account information without account type or document fields', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao@nexor.dev',
        fullName: 'Joao Silva',
        documentType: 'cpf',
        documentNumber: '52998224725',
      },
    });

    renderPage();

    expect(await screen.findByDisplayValue('Joao Silva')).toBeInTheDocument();
    expect(screen.getByText('joao@nexor.dev')).toBeInTheDocument();
    expect(screen.getAllByText('Ativo').length).toBeGreaterThan(0);
    expect(screen.getByRole('button', { name: /enviar link para trocar senha/i })).toBeInTheDocument();
    expect(screen.queryByText(/tipo de conta/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/tipo de documento/i)).not.toBeInTheDocument();
    expect(screen.queryByLabelText(/número do documento/i)).not.toBeInTheDocument();
  });

  it('saves only editable account name', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao@nexor.dev',
        fullName: 'Joao Silva',
        documentType: 'cpf',
        documentNumber: '52998224725',
      },
    });
    mockApiPatch.mockResolvedValueOnce({ ok: true });

    renderPage();

    fireEvent.change(await screen.findByLabelText(/nome completo/i), {
      target: { value: 'Joao Santos' },
    });
    fireEvent.click(screen.getByRole('button', { name: /salvar alteráções/i }));

    await waitFor(() => {
      expect(mockApiPatch).toHaveBeenCalledWith(
        '/v1/auth/profile',
        {
          fullName: 'Joao Santos',
        },
        'tok'
      );
    });
  });

  it('shows the acquired Biteplaner product for a user that has it', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao@nexor.dev',
        fullName: 'Joao Silva',
      },
    });

    renderPage();

    expect(await screen.findByRole('heading', { name: /produtos adquiridos/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /biteplaner/i })).toBeInTheDocument();
    expect(screen.getByText(/produto ativo na sua conta nexor/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /abrir biteplaner/i })).toHaveAttribute('href', '/painel/biteplaner?mode=user');
  });

  it('shows a Biteplaner request CTA for a user without the product', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'sem-produto@nexor.dev',
        fullName: 'Maria Costa',
      },
    });

    renderPage({
      session: { access_token: 'tok', user: { id: '2', email: 'sem-produto@nexor.dev' } },
      backendUser: { email: 'sem-produto@nexor.dev', roles: ['user'] },
    });

    expect(await screen.findByRole('heading', { name: /produtos adquiridos/i })).toBeInTheDocument();
    expect(screen.getByText(/você ainda não possui produtos ativos/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /pedir biteplaner/i })).toHaveAttribute('href', '/painel/biteplaner');
  });

  it('requests password reset for the account email', async () => {
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao@nexor.dev',
        fullName: 'Joao Silva',
      },
    });
    mockSendPasswordReset.mockResolvedValueOnce(undefined);

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /enviar link para trocar senha/i }));

    await waitFor(() => {
      expect(mockSendPasswordReset).toHaveBeenCalledWith('joao@nexor.dev');
    });
  });

  it('does not fail password reset in demo mode when Supabase is unavailable', async () => {
    mockUseAuth.mockReturnValue({
      session: { access_token: 'tok', user: { id: '1', email: 'joao@nexor.dev' } },
      backendUser: { email: 'joao@nexor.dev', roles: ['user'] },
      hasConfiguredAuth: true,
      isMockMode: true,
      sendPasswordReset: mockSendPasswordReset,
    });
    mockApiGet.mockResolvedValueOnce({
      user: {
        email: 'joao@nexor.dev',
        fullName: 'Joao Silva',
      },
    });
    mockSendPasswordReset.mockRejectedValueOnce(new Error('Autenticação não configurada neste ambiente.'));

    render(
      <MemoryRouter>
        <ThemeProvider theme={lightTheme}>
          <MinhaConta />
        </ThemeProvider>
      </MemoryRouter>
    );

    fireEvent.click(await screen.findByRole('button', { name: /enviar link para trocar senha/i }));

    expect(await screen.findByRole('status')).toHaveTextContent(/ambiente de demonstração/i);
    expect(mockSendPasswordReset).not.toHaveBeenCalled();
  });
});
