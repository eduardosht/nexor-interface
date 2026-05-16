import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { useAuth } from '../../hooks/useAuth';
import { Login } from './index';
import { lightTheme } from '../../styles/theme';

const { mockSignIn, mockSignInDemo, mockRedirectToExternal } = vi.hoisted(() => ({
  mockSignIn: vi.fn(),
  mockSignInDemo: vi.fn(),
  mockRedirectToExternal: vi.fn()
}));

vi.mock('../../lib/navigation', async (importOriginal) => {
  const actual = await importOriginal<typeof import('../../lib/navigation')>();
  return { ...actual, redirectToExternal: mockRedirectToExternal };
});

vi.mock('../../hooks/useAuth', () => ({
  useAuth: vi.fn()
}));

function createAuthMock(overrides: Record<string, unknown> = {}) {
  return {
    session: null,
    backendUser: null,
    backendUserResolved: true,
    loading: false,
    hasConfiguredAuth: true,
    isMockMode: true,
    demoPersona: null,
    signIn: mockSignIn,
    signInDemo: mockSignInDemo,
    signOut: vi.fn(),
    sendPasswordReset: vi.fn(),
    refreshBackendUser: vi.fn(),
    ...overrides
  };
}

function renderLogin(search = '') {
  render(
    <ThemeProvider theme={lightTheme}>
      <MemoryRouter initialEntries={[`/entrar${search}`]}>
        <Login />
      </MemoryRouter>
    </ThemeProvider>
  );
}

function getSubmitButton() {
  return screen.getByRole('button', { name: /^entrar$/i });
}

describe('Login', () => {
  beforeEach(() => {
    mockSignIn.mockReset();
    mockSignInDemo.mockReset();
    mockRedirectToExternal.mockReset();
    vi.mocked(useAuth).mockReturnValue(createAuthMock());
  });

  it('calls signIn and shows no alert on success', async () => {
    mockSignIn.mockResolvedValue(undefined);
    renderLogin();

    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'senha1234' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => expect(mockSignIn).toHaveBeenCalledWith('a@b.com', 'senha1234'));
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows alert when signIn throws', async () => {
    mockSignIn.mockRejectedValue(new Error('wrong'));
    renderLogin();

    fireEvent.change(screen.getByLabelText(/e-mail/i), { target: { value: 'a@b.com' } });
    fireEvent.change(screen.getByLabelText(/^senha$/i), { target: { value: 'wrong' } });
    fireEvent.click(getSubmitButton());

    await waitFor(() => expect(screen.getByRole('alert')).toBeInTheDocument());
  });

  it('shows validation error when email is empty', async () => {
    renderLogin();
    fireEvent.click(getSubmitButton());
    await waitFor(() =>
      expect(screen.getByText(/informe seu e-mail para entrar/i)).toBeInTheDocument()
    );
  });

  it('preserves ref param in sessionStorage on mount', () => {
    sessionStorage.clear();
    renderLogin('?ref=PARTNER123');
    expect(sessionStorage.getItem('nexor_referral_ref')).toBe('PARTNER123');
  });

  it('does not overwrite sessionStorage when ref is absent', () => {
    sessionStorage.setItem('nexor_referral_ref', 'EXISTING');
    renderLogin();
    expect(sessionStorage.getItem('nexor_referral_ref')).toBe('EXISTING');
  });

  it('shows the Nexor logo image on the visual side', () => {
    renderLogin('?next=%2F');

    expect(screen.getByAltText('Nexor')).toHaveAttribute('src', expect.stringContaining('logo-nexor-white'));
  });

  it('redirects admin users to local admin panel after login', async () => {
    vi.mocked(useAuth).mockReturnValue(createAuthMock({
      session: { access_token: 'tok', user: { id: '1', email: 'admin@nexor.com' } },
      backendUser: { id: '1', authUserId: '1', roles: ['admin'], clinicIds: [] },
    }));

    renderLogin();

    await waitFor(() =>
      expect(screen.getByText(/entrar na conta nexor/i)).toBeInTheDocument()
    );
    expect(mockRedirectToExternal).not.toHaveBeenCalled();
  });

  it('keeps partner users inside Nexor routing after login', async () => {
    vi.mocked(useAuth).mockReturnValue(createAuthMock({
      session: { access_token: 'tok', user: { id: '1', email: 'partner@nexor.com' } },
      backendUser: { id: '1', authUserId: '1', roles: ['partner'], clinicIds: [] },
    }));

    renderLogin();

    await waitFor(() =>
      expect(screen.getByText(/entrar na conta nexor/i)).toBeInTheDocument()
    );
    expect(mockRedirectToExternal).not.toHaveBeenCalled();
  });

  it('keeps operational users with partnerId inside Nexor routing after login', async () => {
    vi.mocked(useAuth).mockReturnValue(createAuthMock({
      session: { access_token: 'tok', user: { id: '1', email: 'partner@nexor.com' } },
      backendUser: {
        id: '1',
        authUserId: '1',
        roles: ['customer'],
        clinicIds: [],
        partnerId: 'partner-1'
      },
    }));

    renderLogin();

    await waitFor(() =>
      expect(screen.getByText(/entrar na conta nexor/i)).toBeInTheDocument()
    );
    expect(mockRedirectToExternal).not.toHaveBeenCalled();
  });

  it('waits for backend user resolution before redirecting', async () => {
    vi.mocked(useAuth).mockReturnValue(createAuthMock({
      session: { access_token: 'tok', user: { id: '1', email: 'admin@nexor.com' } },
      backendUser: null,
      backendUserResolved: false,
    }));

    renderLogin();

    await waitFor(() =>
      expect(screen.getByText(/entrar na conta nexor/i)).toBeInTheDocument()
    );
    expect(mockRedirectToExternal).not.toHaveBeenCalled();
  });

  it('keeps customer users inside Nexor routing after login', async () => {
    vi.mocked(useAuth).mockReturnValue(createAuthMock({
      session: { access_token: 'tok', user: { id: '1', email: 'customer@nexor.com' } },
      backendUser: { id: '1', authUserId: '1', roles: ['customer'], clinicIds: [] },
      isMockMode: true,
    }));

    renderLogin();

    await waitFor(() =>
      expect(screen.getByText(/entrar na conta nexor/i)).toBeInTheDocument()
    );
    expect(mockRedirectToExternal).not.toHaveBeenCalled();
  });

  it('groups demo login shortcuts by role tabs in mock mode', () => {
    renderLogin();

    expect(screen.getByRole('tab', { name: /cliente/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByTestId('demo-login-athlete')).toBeInTheDocument();
    expect(screen.queryByTestId('demo-login-partner')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /parceiros/i }));
    expect(screen.getByTestId('demo-login-partner')).toBeInTheDocument();
    expect(screen.queryByTestId('demo-login-athlete')).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /dentista/i }));
    expect(screen.getByTestId('demo-login-dentist')).toBeInTheDocument();
    expect(screen.getByTestId('demo-login-dentist-approved')).toBeInTheDocument();
    expect(screen.getByTestId('demo-login-dentist-progress')).toBeInTheDocument();
    expect(screen.getByTestId('demo-login-dentist-licensed')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /lab/i }));
    expect(screen.getByTestId('demo-login-lab')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /admin/i }));
    expect(screen.getByTestId('demo-login-admin')).toBeInTheDocument();
  });

  it('calls signInDemo when a demo shortcut is selected', async () => {
    mockSignInDemo.mockResolvedValue(undefined);
    renderLogin();

    fireEvent.click(screen.getByRole('tab', { name: /admin/i }));
    fireEvent.click(screen.getByTestId('demo-login-admin'));

    await waitFor(() => expect(mockSignInDemo).toHaveBeenCalledWith('admin'));
  });
});
