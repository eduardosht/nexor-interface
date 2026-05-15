import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { Layout } from '../../Layout';
import { lightTheme } from '../../styles/theme';

const authMock = vi.hoisted(() => ({
  session: null as { access_token: string; user: { id: string; email: string } } | null,
}));
const apiMock = vi.hoisted(() => ({
  post: vi.fn(),
}));

vi.mock('../../components/Header', () => ({
  Header: () => <header>Header</header>,
}));
vi.mock('../../hooks/useAuth', () => ({
  useAuth: () => ({ session: authMock.session }),
}));
vi.mock('../../lib/api', () => ({
  api: { post: apiMock.post },
}));

const COOKIE_CONSENT_STORAGE_KEY = 'nexor-cookie-consent';
const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function Wrapper({ children }: { children: React.ReactNode }) {
  return (
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <DesignSystemRoot>{children}</DesignSystemRoot>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('cookie consent banner', () => {
  beforeEach(() => {
    window.localStorage.clear();
    window.scrollTo = vi.fn();
    authMock.session = null;
    apiMock.post.mockReset();
  });

  it('shows the banner when there is no saved decision', () => {
    render(<Layout />, { wrapper: Wrapper });

    expect(screen.getByText(/usamos cookies necessários para o site funcionar/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /aceitar cookies opcionais/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /recusar cookies opcionais/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /gerenciar preferências/i })).toBeInTheDocument();
  });

  it('accepts optional cookies and hides the banner', () => {
    render(<Layout />, { wrapper: Wrapper });

    fireEvent.click(screen.getByRole('button', { name: /aceitar cookies opcionais/i }));

    expect(JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) ?? '{}')).toMatchObject({
      necessary: true,
      preferences: true,
      analytics: true,
    });
    expect(screen.queryByText(/usamos cookies necessários para o site funcionar/i)).not.toBeInTheDocument();
  });

  it('rejects optional cookies and keeps only necessary cookies', () => {
    render(<Layout />, { wrapper: Wrapper });

    fireEvent.click(screen.getByRole('button', { name: /recusar cookies opcionais/i }));

    expect(JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) ?? '{}')).toMatchObject({
      necessary: true,
      preferences: false,
      analytics: false,
    });
    expect(screen.queryByText(/usamos cookies necessários para o site funcionar/i)).not.toBeInTheDocument();
  });

  it('saves custom cookie preferences from the management panel', () => {
    render(<Layout />, { wrapper: Wrapper });

    fireEvent.click(screen.getByRole('button', { name: /gerenciar preferências/i }));
    fireEvent.click(screen.getByLabelText(/cookies de preferências/i));
    fireEvent.click(screen.getByRole('button', { name: /salvar preferências/i }));

    expect(JSON.parse(window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) ?? '{}')).toMatchObject({
      necessary: true,
      preferences: true,
      analytics: false,
    });
    expect(screen.queryByText(/escolha quais cookies opcionais podem ser ativados/i)).not.toBeInTheDocument();
  });

  it('reopens preferences from the footer after a saved decision', () => {
    window.localStorage.setItem(
      COOKIE_CONSENT_STORAGE_KEY,
      JSON.stringify({
        version: 1,
        necessary: true,
        preferences: false,
        analytics: false,
        updatedAt: '2026-05-08T12:00:00.000Z',
      }),
    );

    render(<Layout />, { wrapper: Wrapper });

    expect(screen.queryByText(/usamos cookies necessários para o site funcionar/i)).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /preferências de cookies/i }));

    expect(screen.getByText(/escolha quais cookies opcionais podem ser ativados/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/cookies de analytics/i)).not.toBeChecked();
  });

  it('syncs a logged-in cookie decision with the backend', async () => {
    authMock.session = { access_token: 'tok', user: { id: '1', email: 'user@nexor.dev' } };
    apiMock.post.mockResolvedValueOnce({ consent: { id: 'cookie-consent-1' } });

    render(<Layout />, { wrapper: Wrapper });

    fireEvent.click(screen.getByRole('button', { name: /aceitar cookies opcionais/i }));

    await waitFor(() => {
      expect(apiMock.post).toHaveBeenCalledWith(
        '/v1/account/cookie-consent',
        expect.objectContaining({
          version: 1,
          necessary: true,
          preferences: true,
          analytics: true,
        }),
        'tok',
      );
    });
  });
});
