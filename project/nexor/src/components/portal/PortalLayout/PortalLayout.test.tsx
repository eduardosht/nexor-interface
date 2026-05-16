import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockNavigate, mockApiGet, mockApiPatch } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockNavigate: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPatch: vi.fn(),
}));

const mockElementScrollTo = vi.fn();
const mockMediaQueryListeners = new Map<string, (event: MediaQueryListEvent) => void>();

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    post: vi.fn(),
    patch: mockApiPatch,
  },
}));

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual<typeof import('react-router-dom')>('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});
import { PortalLayout } from './index';

function createAuthMock(overrides: Record<string, unknown> = {}) {
  return {
    signOut: vi.fn(),
    backendUser: { email: 'demo@nexor.dev', roles: ['customer'] },
    session: { access_token: 'tok', user: { id: '1', email: 'demo@nexor.dev' } },
    loading: false,
    backendUserResolved: true,
    hasConfiguredAuth: true,
    isMockMode: true,
    demoPersona: 'athlete',
    signIn: vi.fn(),
    signInDemo: vi.fn(),
    sendPasswordReset: vi.fn(),
    refreshBackendUser: vi.fn(),
    ...overrides,
  };
}

function renderLayout(path = '/painel/home', authOverrides: Record<string, unknown> = {}) {
  mockUseAuth.mockReturnValue(createAuthMock(authOverrides));

  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider theme={lightTheme}>
        <PortalLayout>
          <div>conteúdo</div>
        </PortalLayout>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('PortalLayout navigation', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockNavigate.mockReset();
    mockApiGet.mockReset();
    mockApiPatch.mockReset();
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/account/notifications') {
        return Promise.resolve({
          notifications: [
            {
              id: 'notification-unread',
              title: 'Notificação mock da API',
              message:
                'Mensagem completa da notificação operacional para orientar a equipe sobre novas etapas do painel. ' +
                'Ela ultrapassa o resumo do cartão para validar que o modal exibe o conteúdo completo sem truncar a leitura.',
              read: false,
              createdAt: '2026-05-12T09:30:00.000Z',
            },
            {
              id: 'notification-read',
              title: 'Resumo semanal disponível',
              message:
                'O resumo semanal de ordens, usuários e pendências administrativas já está disponível para consulta no painel.',
              read: true,
              createdAt: '2026-05-11T17:10:00.000Z',
            },
          ],
          unreadCount: 1,
        });
      }

      return Promise.resolve({ modes: [] });
    });
    mockApiPatch.mockResolvedValue({
      notification: {
        id: 'notification-unread',
        title: 'Notificação mock da API',
        message:
          'Mensagem completa da notificação operacional para orientar a equipe sobre novas etapas do painel. ' +
          'Ela ultrapassa o resumo do cartão para validar que o modal exibe o conteúdo completo sem truncar a leitura.',
        read: true,
        createdAt: '2026-05-12T09:30:00.000Z',
      },
    });
    mockElementScrollTo.mockReset();
    vi.stubEnv('VITE_MOCK', 'true');
    Object.defineProperty(HTMLElement.prototype, 'scrollTo', {
      configurable: true,
      value: mockElementScrollTo,
    });
    mockMediaQueryListeners.clear();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn((event: string, listener: (event: MediaQueryListEvent) => void) => {
          if (event === 'change') mockMediaQueryListeners.set(query, listener);
        }),
        removeEventListener: vi.fn((event: string) => {
          if (event === 'change') mockMediaQueryListeners.delete(query);
        }),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    window.localStorage.clear();
  });

  it('renders admin navigation for Biteplaner without access modal', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    expect(screen.getByText('Biteplaner')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /ordens/i }).at(0)).toHaveAttribute('href', '/painel/admin/ordens');
    expect(screen.queryByRole('dialog', { name: /selecionar acesso ao biteplaner/i })).not.toBeInTheDocument();
  });

  it('renders app-like admin mobile navigation destinations', () => {
    renderLayout('/painel/admin/ordens', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    const mobileNavigation = screen.getByRole('navigation', { name: /navegação principal mobile/i });

    expect(mobileNavigation).toBeInTheDocument();
    expect(within(mobileNavigation).getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/painel/admin/home');
    expect(within(mobileNavigation).getByRole('link', { name: /ordens/i })).toHaveAttribute('href', '/painel/admin/ordens');
    expect(within(mobileNavigation).getByRole('link', { name: /usuários/i })).toHaveAttribute('href', '/painel/admin/usuarios');
    expect(within(mobileNavigation).getByRole('link', { name: /configurações/i })).toHaveAttribute('href', '/painel/admin/configuracoes/negocio');
  });

  it('opens mobile admin drawer with secondary admin destinations', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    fireEvent.click(screen.getByRole('button', { name: /abrir menu mobile/i }));

    const drawer = screen.getByRole('dialog', { name: /menu administrativo/i });

    expect(drawer).toBeInTheDocument();
    expect(within(drawer).getByRole('link', { name: /parceiros/i })).toHaveAttribute('href', '/painel/admin/parceiros');
    expect(within(drawer).getByRole('link', { name: /dentistas/i })).toHaveAttribute('href', '/painel/admin/dentistas');
    expect(within(drawer).getByRole('link', { name: /laboratórios/i })).toHaveAttribute('href', '/painel/admin/laboratorios');
  });

  it('closes the mobile drawer when the current route link is selected', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    fireEvent.click(screen.getByRole('button', { name: /abrir menu mobile/i }));
    const drawer = screen.getByRole('dialog', { name: /menu administrativo/i });

    fireEvent.click(within(drawer).getByRole('link', { name: /dashboard/i }));

    expect(screen.queryByRole('dialog', { name: /menu administrativo/i })).not.toBeInTheDocument();
  });

  it('closes the mobile drawer with Escape and restores focus to the trigger', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    const trigger = screen.getByRole('button', { name: /abrir menu mobile/i });
    trigger.focus();
    fireEvent.click(trigger);

    const drawer = screen.getByRole('dialog', { name: /menu administrativo/i });
    expect(screen.getByRole('button', { name: /fechar menu mobile/i })).toHaveFocus();

    fireEvent.keyDown(drawer, { key: 'Escape' });

    expect(screen.queryByRole('dialog', { name: /menu administrativo/i })).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });

  it('closes the mobile drawer when the viewport returns to desktop', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    fireEvent.click(screen.getByRole('button', { name: /abrir menu mobile/i }));
    expect(screen.getByRole('dialog', { name: /menu administrativo/i })).toBeInTheDocument();

    act(() => {
      mockMediaQueryListeners.get('(min-width: 769px)')?.({ matches: true } as MediaQueryListEvent);
    });

    expect(screen.queryByRole('dialog', { name: /menu administrativo/i })).not.toBeInTheDocument();
  });

  it('lets the right-side content use the full available width', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    expect(screen.getByTestId('portal-content-inner')).toHaveStyle({
      width: '100%',
      maxWidth: 'none',
      boxSizing: 'border-box',
    });
  });

  it('scrolls the portal content container to the top when a panel route opens', () => {
    renderLayout('/painel/biteplaner/cadastro/parceiro');

    expect(screen.getByTestId('portal-content-scroll')).toBeInTheDocument();
    expect(mockElementScrollTo).toHaveBeenCalledWith({ top: 0, left: 0, behavior: 'auto' });
  });

  it('keeps the expand control visible when the admin sidebar starts collapsed', () => {
    window.localStorage.setItem('nexor-sidebar-collapsed', 'true');

    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    expect(screen.getByAltText('Nexor')).toHaveStyle({ width: '0px' });
    expect(screen.getByRole('button', { name: /expandir menu/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /expandir menu/i }));

    expect(screen.getByRole('button', { name: /colapsar menu/i })).toBeInTheDocument();
    expect(window.localStorage.getItem('nexor-sidebar-collapsed')).toBe('false');
  });

  it('highlights the notification icon when there are unread mock notifications', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    expect(screen.getByRole('button', { name: /notificações/i })).toHaveAttribute('data-has-unread', 'true');
  });

  it('opens the notifications box with read and unread mock notifications', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    fireEvent.click(screen.getByRole('button', { name: /notificações/i }));

    expect(screen.getByRole('dialog', { name: /notificações/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /abrir notificação nova atualização operacional/i })).toBeInTheDocument();
    expect(screen.getByText(/não lida/i)).toBeInTheDocument();
    expect(screen.getByText(/^lida$/i)).toBeInTheDocument();
    expect(screen.getByText(/12\/05\/2026, 09:30/i)).toBeInTheDocument();
  });

  it('opens a notification modal with the full message', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    fireEvent.click(screen.getByRole('button', { name: /notificações/i }));
    fireEvent.click(screen.getByRole('button', { name: /abrir notificação nova atualização operacional/i }));

    expect(screen.getByRole('dialog', { name: /nova atualização operacional/i })).toBeInTheDocument();
    expect(screen.getByText(/mensagem completa da notificação operacional/i)).toBeInTheDocument();
    expect(screen.getByText(/ela ultrapassa o resumo do cartão/i)).toBeInTheDocument();
  });

  it('requests the backend to mark an unread notification as read when clicked', async () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    fireEvent.click(screen.getByLabelText('Notificações'));
    fireEvent.click(await screen.findByRole('button', { name: /mock da api/i }));

    await waitFor(() =>
      expect(mockApiPatch).toHaveBeenCalledWith(
        '/v1/account/notifications/notification-unread/read',
        {},
        'tok'
      )
    );
  });

  it('opens the access modal for non-admin users', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/products/biteplaner/access-options') {
        return Promise.resolve({
          modes: [
            { key: 'user', label: 'Cliente', description: 'Fluxo principal', allowed: true, reason: null, status: 'available' },
          ],
        });
      }

      return Promise.resolve({ notifications: [], unreadCount: 0 });
    });

    renderLayout('/painel/home');

    fireEvent.click(screen.getByRole('button', { name: /biteplaner/i }));

    await waitFor(() =>
      expect(screen.getByRole('dialog', { name: /selecionar acesso ao biteplaner/i })).toBeInTheDocument()
    );
  });

  it('shows the licensing submenu and hides Ordem for dentist access', () => {
    renderLayout('/painel/biteplaner?mode=dentist', {
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
      demoPersona: 'dentist',
    });

    expect(screen.getByRole('link', { name: /licenciamento/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/licenciamento?mode=dentist'
    );
    expect(screen.getByRole('link', { name: /avaliações/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/avaliacoes?mode=dentist'
    );
    expect(screen.getByText('MVP1')).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^ordem$/i })).not.toBeInTheDocument();
  });

  it('shows the evaluations submenu for partner and lab access', () => {
    renderLayout('/painel/biteplaner?mode=partner', {
      backendUser: { email: 'parceiro@nexor.dev', roles: ['partner'] },
      demoPersona: 'partner',
    });

    expect(screen.getByRole('link', { name: /indicar/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/indicar?mode=partner'
    );
    expect(screen.getByRole('link', { name: /avaliações/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/avaliacoes?mode=partner'
    );
    expect(screen.queryByRole('link', { name: /^ordem$/i })).not.toBeInTheDocument();

    renderLayout('/painel/biteplaner?mode=lab', {
      backendUser: { email: 'lab@nexor.dev', roles: ['lab'] },
      demoPersona: 'lab',
    });

    expect(screen.getAllByRole('link', { name: /avaliações/i }).at(-1)).toHaveAttribute(
      'href',
      '/painel/biteplaner/avaliacoes?mode=lab'
    );
  });

  it('hides the licensing MVP submenu when mock mode is disabled', () => {
    vi.stubEnv('VITE_MOCK', 'false');

    renderLayout('/painel/biteplaner?mode=dentist', {
      backendUser: { email: 'dentista@nexor.dev', roles: ['dentist'] },
      demoPersona: 'dentist',
    });

    expect(screen.queryByRole('link', { name: /licenciamento/i })).not.toBeInTheDocument();
    expect(screen.queryByText('MVP1')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^ordem$/i })).not.toBeInTheDocument();
  });

  it('keeps access mode cards in one desktop row', () => {
    const source = readFileSync(join(process.cwd(), 'src/components/portal/PortalLayout/styles.ts'), 'utf8');

    expect(source).toContain('grid-template-columns: repeat(5, minmax(0, 1fr))');
    expect(source).toContain('@media (max-width: 1120px)');
  });

  it('contains responsive CSS that removes desktop sidebar from mobile flow', () => {
    const source = readFileSync(join(process.cwd(), 'src/components/portal/PortalLayout/styles.ts'), 'utf8');

    expect(source).toContain('@media (max-width: 768px)');
    expect(source).toContain('display: none');
    expect(source).toContain('padding-bottom: calc(76px + env(safe-area-inset-bottom))');
  });

  it('shows pending access modes without allowing selection', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/products/biteplaner/access-options') {
        return Promise.resolve({
          modes: [
            { key: 'user', label: 'Cliente', description: 'Fluxo principal', allowed: true, reason: null, status: 'available' },
            { key: 'dentist', label: 'Dentista', description: 'Fila operacional', allowed: false, reason: 'Sua solicitação está em análise.', status: 'pending' },
          ],
        });
      }

      return Promise.resolve({ notifications: [], unreadCount: 0 });
    });

    renderLayout('/painel/home');

    fireEvent.click(screen.getByRole('button', { name: /biteplaner/i }));

    await waitFor(() => {
      expect(screen.getAllByText(/em análise/i).length).toBeGreaterThan(0);
    });

    fireEvent.click(screen.getByText(/^dentista$/i));
    fireEvent.click(screen.getByRole('button', { name: /continuar/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner?mode=user');
  });
});
