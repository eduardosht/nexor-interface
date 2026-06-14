import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { useAuth } from '../../hooks/useAuth';
import { RecuperarSenha } from './index';
import { lightTheme } from '../../styles/theme';

const { mockSendPasswordReset, mockUpdateUser, mockSignOut } = vi.hoisted(() => ({
  mockSendPasswordReset: vi.fn(),
  mockUpdateUser: vi.fn(),
  mockSignOut: vi.fn()
}));

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

vi.mock('../../lib/supabase', () => ({
  supabase: {
    auth: {
      updateUser: mockUpdateUser,
      signOut: mockSignOut
    }
  }
}));

function createAuthMock(overrides: Record<string, unknown> = {}) {
  return {
    session: null,
    backendUser: null,
    backendUserResolved: true,
    authError: '',
    loading: false,
    hasConfiguredAuth: true,
    isMockMode: false,
    demoPersona: null,
    signIn: vi.fn(),
    signInDemo: vi.fn(),
    signOut: vi.fn(),
    sendPasswordReset: mockSendPasswordReset,
    refreshBackendUser: vi.fn(),
    ...overrides
  };
}

function renderPage(initialPath = '/recuperar-senha') {
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={[initialPath]}>
        <RecuperarSenha />
      </MemoryRouter>
    </ThemeProvider>
  );
}

describe('RecuperarSenha', () => {
  beforeEach(() => {
    window.history.replaceState({}, '', '/recuperar-senha');
    mockSendPasswordReset.mockReset();
    mockUpdateUser.mockReset();
    mockSignOut.mockReset();
    vi.mocked(useAuth).mockReturnValue(createAuthMock());
  });

  it('calls sendPasswordReset with entered email', async () => {
    mockSendPasswordReset.mockResolvedValue(undefined);

    renderPage();

    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() => expect(mockSendPasswordReset).toHaveBeenCalledWith('a@b.com'));
  });

  it('shows confirmation message after successful reset request', async () => {
    mockSendPasswordReset.mockResolvedValue(undefined);

    renderPage();

    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'a@b.com' } });
    fireEvent.click(screen.getByRole('button', { name: /enviar/i }));

    await waitFor(() =>
      expect(screen.getByText(/enviamos um link de recuperação para o seu e-mail/i)).toBeInTheDocument()
    );
  });

  it('shows password reset form when recovery hash is present', () => {
    window.history.replaceState({}, '', '/recuperar-senha#access_token=tok&type=recovery');

    renderPage('/recuperar-senha#access_token=tok&type=recovery');

    expect(screen.getByText(/redefinir senha/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^nova senha$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^confirmar nova senha$/i)).toBeInTheDocument();
  });

  it('updates password and shows success CTA in recovery mode', async () => {
    window.history.replaceState({}, '', '/recuperar-senha#access_token=tok&type=recovery');
    mockUpdateUser.mockResolvedValue({ error: null });
    mockSignOut.mockResolvedValue({});

    renderPage('/recuperar-senha#access_token=tok&type=recovery');

    fireEvent.change(screen.getByLabelText(/^nova senha$/i), { target: { value: 'novaSenha123' } });
    fireEvent.change(screen.getByLabelText(/^confirmar nova senha$/i), { target: { value: 'novaSenha123' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar nova senha/i }));

    await waitFor(() => expect(mockUpdateUser).toHaveBeenCalledWith({ password: 'novaSenha123' }));
    await waitFor(() => expect(mockSignOut).toHaveBeenCalled());
    expect(screen.getByRole('button', { name: /voltar para entrar/i })).toBeInTheDocument();
    expect(screen.getByRole('status')).toHaveTextContent(/senha redefinida com sucesso/i);
  });

  it('shows error when recovery passwords do not match', async () => {
    window.history.replaceState({}, '', '/recuperar-senha#access_token=tok&type=recovery');

    renderPage('/recuperar-senha#access_token=tok&type=recovery');

    fireEvent.change(screen.getByLabelText(/^nova senha$/i), { target: { value: 'novaSenha123' } });
    fireEvent.change(screen.getByLabelText(/^confirmar nova senha$/i), { target: { value: 'outraSenha123' } });
    fireEvent.click(screen.getByRole('button', { name: /salvar nova senha/i }));

    await waitFor(() =>
      expect(screen.getByRole('alert')).toHaveTextContent(/senhas informadas não conferem/i)
    );
  });
});
