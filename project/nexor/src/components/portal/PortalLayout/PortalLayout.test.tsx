import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { act, fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { TestQueryClientProvider } from '../../../test/renderWithQueryClient';

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
    backendUser: {
      email: 'demo@nexor.dev',
      roles: ['customer'],
      productRoles: [{ productKey: 'biteplaner', role: 'customer', status: 'active' }],
    },
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
        <TestQueryClientProvider>
          <PortalLayout>
            <div>conteúdo</div>
          </PortalLayout>
        </TestQueryClientProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

function renderLayoutWithChildren(children: React.ReactNode, path = '/painel/home') {
  mockUseAuth.mockReturnValue(createAuthMock());

  return render(
    <MemoryRouter initialEntries={[path]}>
      <ThemeProvider theme={lightTheme}>
        <TestQueryClientProvider>
          <PortalLayout>{children}</PortalLayout>
        </TestQueryClientProvider>
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
    expect(screen.getAllByRole('link', { name: /relat.rio/i }).at(0)).toHaveAttribute('href', '/painel/admin/relatorios');
    expect(screen.queryByRole('dialog', { name: /selecionar acesso ao biteplaner/i })).not.toBeInTheDocument();
  });

  it('keeps form content mounted when notifications resolve', async () => {
    let resolveNotifications: (value: { notifications: never[]; unreadCount: number }) => void = () => { };
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/account/notifications') {
        return new Promise((resolve) => {
          resolveNotifications = resolve;
        });
      }

      return Promise.resolve({ modes: [] });
    });

    renderLayoutWithChildren(<input aria-label="Campo em edição" defaultValue="" />);

    fireEvent.change(screen.getByLabelText(/campo em edi/i), {
      target: { value: 'dados temporários do cadastro' },
    });

    await act(async () => {
      resolveNotifications({ notifications: [], unreadCount: 0 });
    });

    expect(screen.getByLabelText(/campo em edi/i)).toHaveValue('dados temporários do cadastro');
  });

  it('groups admin sidebar links by Biteplaner and system settings', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    expect(screen.getByText('Biteplaner')).toBeInTheDocument();
    expect(screen.getByText('Sistema')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /config\. sistema/i })).toHaveAttribute(
      'href',
      '/painel/admin/configuracoes/sistema'
    );
  });

  it('shows the application version above the sidebar user identity', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    const version = screen.getByText('v1.0.0');
    const profileName = screen.getByText('admin');

    expect(version).toBeInTheDocument();
    expect(version.compareDocumentPosition(profileName) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('renders report navigation for administrative roles without Biteplaner product access', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'financeiro@nexor.dev', roles: ['finance'], productRoles: [] },
      demoPersona: 'admin',
    });

    expect(screen.getByText('Biteplaner')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /relat.rio/i }).at(0)).toHaveAttribute('href', '/painel/admin/relatorios');
    expect(screen.queryByRole('button', { name: /^biteplaner$/i })).not.toBeInTheDocument();
  });

  it('keeps mobile navigation in the header drawer without rendering a bottom bar', () => {
    renderLayout('/painel/admin/ordens', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    expect(screen.queryByRole('navigation', { name: /navegação principal mobile/i })).not.toBeInTheDocument();
    expect(screen.getByRole('button', { name: /abrir menu mobile/i })).toBeInTheDocument();
  });

  it('opens mobile admin drawer with secondary admin destinations', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    fireEvent.click(screen.getByRole('button', { name: /abrir menu mobile/i }));

    const drawer = screen.getByRole('dialog', { name: /menu administrativo/i });

    expect(drawer).toBeInTheDocument();
    expect(within(drawer).getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/painel/admin/home');
    expect(within(drawer).getByRole('link', { name: /ordens/i })).toHaveAttribute('href', '/painel/admin/ordens');
    expect(within(drawer).getByRole('link', { name: /remoções/i })).toHaveAttribute('href', '/painel/admin/remocoes-conta');
    expect(within(drawer).getByRole('link', { name: /relatórios/i })).toHaveAttribute('href', '/painel/admin/relatorios');
    expect(within(drawer).getByRole('link', { name: /parceiros/i })).toHaveAttribute('href', '/painel/admin/parceiros');
    expect(within(drawer).getByRole('link', { name: /dentistas/i })).toHaveAttribute('href', '/painel/admin/dentistas');
    expect(within(drawer).getByRole('link', { name: /laboratórios/i })).toHaveAttribute('href', '/painel/admin/laboratorios');
    expect(within(drawer).getByRole('link', { name: /usuários/i })).toHaveAttribute('href', '/painel/admin/usuarios');
    expect(within(drawer).getByRole('link', { name: /config. negócio/i })).toHaveAttribute('href', '/painel/admin/configuracoes/negocio');
    expect(within(drawer).getByRole('link', { name: /config. sistema/i })).toHaveAttribute('href', '/painel/admin/configuracoes/sistema');
    expect(within(drawer).getByRole('button', { name: /^sair$/i })).toBeInTheDocument();
  });

  it('shows the notifications menu item below Minha Conta for regular users', () => {
    renderLayout('/painel/home', {
      backendUser: {
        email: 'cliente@nexor.dev',
        roles: ['customer'],
        productRoles: [{ productKey: 'biteplaner', role: 'customer', status: 'active' }],
      },
      demoPersona: 'athlete',
    });

    const minhaConta = screen.getByRole('link', { name: /minha conta/i });
    const notificacoes = screen.getByRole('link', { name: /^notificações$/i });

    expect(notificacoes).toHaveAttribute('href', '/painel/notificacoes');
    expect(minhaConta.compareDocumentPosition(notificacoes) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it('shows Minha Conta submenus only on the account page', () => {
    renderLayout('/painel/conta', {
      backendUser: {
        email: 'cliente@nexor.dev',
        roles: ['customer'],
        productRoles: [{ productKey: 'biteplaner', role: 'customer', status: 'active' }],
      },
      demoPersona: 'athlete',
    });

    expect(screen.getByRole('link', { name: /dados da conta/i })).toHaveAttribute('href', '/painel/conta#dados-da-conta');
    expect(screen.getByRole('link', { name: /privacidade e lgpd/i })).toHaveAttribute('href', '/painel/conta#privacidade-lgpd');
    expect(screen.getByRole('link', { name: /excluir conta/i })).toHaveAttribute('href', '/painel/conta#excluir-conta');
    expect(screen.queryByRole('link', { name: /preferências de comunicação/i })).not.toBeInTheDocument();
  });

  it('hides Minha Conta submenus outside the account page', () => {
    renderLayout('/painel/home', {
      backendUser: {
        email: 'cliente@nexor.dev',
        roles: ['customer'],
        productRoles: [{ productKey: 'biteplaner', role: 'customer', status: 'active' }],
      },
      demoPersona: 'athlete',
    });

    expect(screen.queryByRole('link', { name: /dados da conta/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /privacidade e lgpd/i })).not.toBeInTheDocument();
  });

  it('does not render submenus when the sidebar is collapsed', () => {
    renderLayout('/painel/conta', {
      backendUser: {
        email: 'cliente@nexor.dev',
        roles: ['customer'],
        productRoles: [
          {
            productKey: 'biteplaner',
            role: 'customer',
            status: 'active',
            stage: 'order_started',
            metadata: { orderStarted: true },
          },
        ],
      },
      demoPersona: 'athlete',
    });

    expect(screen.getByRole('link', { name: /dados da conta/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /colapsar menu/i }));

    expect(screen.queryByRole('link', { name: /dados da conta/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /preferências de comunicação/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^home$/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^ordem$/i })).not.toBeInTheDocument();
    expect(screen.getByTitle('Biteplaner')).toBeInTheDocument();
  });

  it('keeps the portal menu accessible on mobile for non-admin users', () => {
    renderLayout('/painel/home', {
      backendUser: {
        email: 'cliente@nexor.dev',
        roles: ['customer'],
        productRoles: [{ productKey: 'biteplaner', role: 'customer', status: 'active' }],
      },
      demoPersona: 'athlete',
    });

    fireEvent.click(screen.getByRole('button', { name: /abrir menu mobile/i }));

    const drawer = screen.getByRole('dialog', { name: /menu do portal/i });

    expect(drawer).toBeInTheDocument();
    expect(within(drawer).getByRole('link', { name: /dashboard/i })).toHaveAttribute('href', '/painel/home');
    expect(within(drawer).getByRole('link', { name: /minha conta/i })).toHaveAttribute('href', '/painel/conta');
    expect(within(drawer).getByRole('link', { name: /biteplaner/i })).toHaveAttribute('href', '/painel/biteplaner');
    expect(within(drawer).getByRole('button', { name: /^sair$/i })).toBeInTheDocument();
  });

  it('signs out from the mobile drawer logout action', () => {
    const signOut = vi.fn();
    renderLayout('/painel/home', {
      signOut,
      backendUser: { email: 'cliente@nexor.dev', roles: ['customer'] },
      demoPersona: 'athlete',
    });

    fireEvent.click(screen.getByRole('button', { name: /abrir menu mobile/i }));
    fireEvent.click(within(screen.getByRole('dialog', { name: /menu do portal/i })).getByRole('button', { name: /^sair$/i }));

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/entrar');
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

  it('hides the notification icon dot when there are no unread notifications', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/account/notifications') {
        return Promise.resolve({
          notifications: [
            {
              id: 'notification-read',
              title: 'Resumo semanal disponível',
              message: 'Resumo já lido.',
              read: true,
              createdAt: '2026-05-11T17:10:00.000Z',
            },
          ],
          unreadCount: 0,
        });
      }

      return Promise.resolve({ modes: [] });
    });

    renderLayout('/painel/home');

    await waitFor(() =>
      expect(screen.getByLabelText('Notificações')).toHaveAttribute('data-has-unread', 'false')
    );

    const stylesSource = readFileSync(join(process.cwd(), 'src/components/portal/PortalLayout/styles.ts'), 'utf8');
    expect(stylesSource).toContain("display: ${({ $hasUnread }) => ($hasUnread ? 'block' : 'none')};");
  });

  it('shows an unread dot beside the notifications menu item', async () => {
    renderLayout('/painel/home');

    const notificationsLink = screen.getByRole('link', { name: /^notificações$/i });

    expect(await within(notificationsLink).findByTestId('nav-unread-dot')).toBeInTheDocument();
  });

  it('opens the notifications box with read and unread mock notifications', () => {
    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    fireEvent.click(screen.getByRole('button', { name: /notificações/i }));

    expect(screen.getByRole('dialog', { name: /notificações/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /não lidas/i })).toHaveAttribute('aria-selected', 'true');
    expect(screen.getByRole('button', { name: /abrir notificação nova atualização operacional/i })).toBeInTheDocument();
    expect(screen.getByText(/^não lida$/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('tab', { name: /todas/i }));

    expect(screen.getByText(/^lida$/i)).toBeInTheDocument();
    expect(screen.getByText(/12\/05\/2026, 09:30/i)).toBeInTheDocument();
  });

  it('limits the Todas tab in the notifications popover to ten items', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/account/notifications') {
        return Promise.resolve({
          notifications: Array.from({ length: 12 }, (_, index) => ({
            id: `notification-${index + 1}`,
            title: `Notificação ${index + 1}`,
            message: `Mensagem ${index + 1}.`,
            read: index > 1,
            createdAt: `2026-05-${String(12 - index).padStart(2, '0')}T09:30:00.000Z`,
          })),
          unreadCount: 2,
        });
      }

      return Promise.resolve({ modes: [] });
    });

    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    fireEvent.click(screen.getByLabelText('Notificações'));
    fireEvent.click(await screen.findByRole('tab', { name: /todas/i }));

    expect(screen.getByRole('button', { name: /abrir notificação notificação 10/i })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /abrir notificação notificação 11/i })).not.toBeInTheDocument();
  });

  it('keeps notification popover rows from collapsing on mobile', () => {
    const stylesSource = readFileSync(join(process.cwd(), 'src/components/portal/PortalLayout/styles.ts'), 'utf8');

    expect(stylesSource).toContain('min-height: 86px;');
    expect(stylesSource).not.toContain('min-height: 0;\n    padding: 14px 16px;');
  });

  it('navigates to the full notifications page from the popover footer', () => {
    renderLayout('/painel/home');

    fireEvent.click(screen.getByLabelText('Notificações'));
    fireEvent.click(screen.getByRole('button', { name: /ver todas as notificações/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/painel/notificacoes');
  });

  it('keeps contextual order actions inside the notification modal', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/account/notifications') {
        return Promise.resolve({
          notifications: [
            {
              id: 'customer-action',
              title: 'Ação necessária no pedido',
              message: 'Cliente precisa avançar na jornada.',
              type: 'biteplaner_action_required',
              metadata: { actionFor: 'customer' },
              read: false,
              createdAt: '2026-05-12T09:30:00.000Z',
            },
            {
              id: 'dentist-action',
              title: 'Ação necessária do dentista',
              message: 'Dentista precisa revisar a ordem.',
              type: 'biteplaner_action_required',
              metadata: { actionFor: 'dentist' },
              read: false,
              createdAt: '2026-05-12T09:20:00.000Z',
            },
            {
              id: 'lab-action',
              title: 'Ação necessária do laboratório',
              message: 'Laboratório precisa revisar a ordem.',
              type: 'biteplaner_action_required',
              metadata: { actionFor: 'lab' },
              read: false,
              createdAt: '2026-05-12T09:10:00.000Z',
            },
          ],
          unreadCount: 3,
        });
      }

      return Promise.resolve({ modes: [] });
    });

    renderLayout('/painel/home');

    fireEvent.click(screen.getByLabelText('Notificações'));

    expect(await screen.findByText(/ação necessária no pedido/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ir para jornada/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver ordens do dentista/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver ordens do laboratório/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /abrir notificação ação necessária no pedido/i }));
    fireEvent.click(await screen.findByRole('button', { name: /ir para jornada/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/jornada');

    fireEvent.click(screen.getByLabelText('Notificações'));
    fireEvent.click(screen.getByRole('button', { name: /abrir notificação ação necessária do dentista/i }));
    fireEvent.click(await screen.findByRole('button', { name: /ver ordens do dentista/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner?mode=dentist');

    fireEvent.click(screen.getByLabelText('Notificações'));
    fireEvent.click(screen.getByRole('button', { name: /abrir notificação ação necessária do laboratório/i }));
    fireEvent.click(await screen.findByRole('button', { name: /ver ordens do laboratório/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner?mode=lab');
  });

  it('shows the financial onboarding action in the notifications box', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/account/notifications') {
        return Promise.resolve({
          notifications: [
            {
              id: 'financial-onboarding',
              title: 'Cadastro financeiro pendente',
              message:
                'Seu cadastro de dentista Biteplaner foi aprovado. Finalize a Parte 2 com os dados bancários pelo Pagar.me.',
              type: 'biteplaner_dentist_licensing_approved',
              metadata: {
                financialOnboardingRequired: true,
                financialOnboardingPath: '/painel/biteplaner/financeiro?role=dentist',
              },
              read: false,
              createdAt: '2026-07-03T09:30:00.000Z',
            },
          ],
          unreadCount: 1,
        });
      }

      return Promise.resolve({ modes: [] });
    });

    renderLayout('/painel/home');

    fireEvent.click(screen.getByLabelText('Notificações'));
    fireEvent.click(await screen.findByRole('button', { name: /completar cadastro financeiro/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/financeiro?role=dentist');
    expect(screen.queryByRole('dialog', { name: /cadastro financeiro pendente/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByLabelText('Notificações'));
    fireEvent.click(await screen.findByRole('button', { name: /abrir notificação cadastro financeiro pendente/i }));

    expect(screen.queryByRole('button', { name: /ver ordens do dentista/i })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /cadastro financeiro pendente/i })).toHaveTextContent(/dados bancários/i);
  });

  it('shows an empty state when no notifications are available', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/account/notifications') {
        return Promise.resolve({ notifications: [], unreadCount: 0 });
      }

      return Promise.resolve({ modes: [] });
    });

    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    await waitFor(() =>
      expect(screen.getByRole('button', { name: /notificações/i })).toHaveAttribute('data-has-unread', 'false')
    );

    fireEvent.click(screen.getByRole('button', { name: /notificações/i }));

    expect(screen.getByText('Nenhuma notificação não lida.')).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /não lidas\s*0/i })).toBeInTheDocument();
    expect(screen.getByRole('tab', { name: /todas\s*0/i })).toBeInTheDocument();
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

  it('marks every unread notification as read from the notifications panel', async () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/account/notifications') {
        return Promise.resolve({
          notifications: [
            {
              id: 'notification-unread-1',
              title: 'Primeira notificação',
              message: 'Primeira mensagem operacional.',
              read: false,
              createdAt: '2026-05-12T09:30:00.000Z',
            },
            {
              id: 'notification-unread-2',
              title: 'Segunda notificação',
              message: 'Segunda mensagem operacional.',
              read: false,
              createdAt: '2026-05-12T10:30:00.000Z',
            },
            {
              id: 'notification-read',
              title: 'Notificação já lida',
              message: 'Mensagem já lida.',
              read: true,
              createdAt: '2026-05-11T17:10:00.000Z',
            },
          ],
          unreadCount: 2,
        });
      }

      return Promise.resolve({ modes: [] });
    });
    mockApiPatch.mockResolvedValue({ markedCount: 2, unreadCount: 0 });

    renderLayout('/painel/admin/home', {
      backendUser: { email: 'admin@nexor.dev', roles: ['admin'] },
      demoPersona: 'admin',
    });

    fireEvent.click(screen.getByLabelText('Notificações'));
    expect(await screen.findByRole('button', { name: /primeira notificação/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /marcar todas como lidas/i }));

    await waitFor(() =>
      expect(mockApiPatch).toHaveBeenCalledWith('/v1/account/notifications/read-all', {}, 'tok')
    );
    expect(mockApiPatch).toHaveBeenCalledTimes(1);
    expect(mockApiPatch).not.toHaveBeenCalledWith(
      '/v1/account/notifications/notification-unread-1/read',
      {},
      'tok'
    );
    expect(mockApiPatch).not.toHaveBeenCalledWith(
      '/v1/account/notifications/notification-unread-2/read',
      {},
      'tok'
    );
    expect(mockApiPatch).not.toHaveBeenCalledWith(
      '/v1/account/notifications/notification-read/read',
      {},
      'tok'
    );
  });

  it('navigates directly to the Biteplaner page for non-admin users', () => {
    mockApiGet.mockImplementation((path: string) => {
      if (path === '/v1/products/biteplaner/access-options') {
        throw new Error('access options should not be requested from the sidebar');
      }

      return Promise.resolve({ notifications: [], unreadCount: 0 });
    });

    renderLayout('/painel/home');

    fireEvent.click(screen.getByRole('button', { name: /biteplaner/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner');
    expect(screen.queryByRole('dialog', { name: /selecionar acesso ao biteplaner/i })).not.toBeInTheDocument();
  });

  it('hides the Biteplaner menu until customer onboarding creates active access', () => {
    renderLayout('/painel/home', {
      backendUser: { email: 'cliente@nexor.dev', roles: ['customer'], productRoles: [] },
    });

    expect(screen.queryByRole('button', { name: /biteplaner/i })).not.toBeInTheDocument();
    expect(screen.queryByText('Produtos')).not.toBeInTheDocument();
  });

  it.each([
    ['partner', 'parceiro@nexor.dev'],
    ['dentist', 'dentista@nexor.dev'],
    ['lab', 'laboratorio@nexor.dev'],
  ])('hides the Biteplaner menu for pending %s licensing access', (role, email) => {
    renderLayout('/painel/home', {
      backendUser: {
        email,
        roles: [role],
        productRoles: [{ productKey: 'biteplaner', role, status: 'pending' }],
      },
    });

    expect(screen.queryByRole('button', { name: /biteplaner/i })).not.toBeInTheDocument();
  });

  it.each([
    ['partner', 'parceiro@nexor.dev'],
    ['dentist', 'dentista@nexor.dev'],
    ['lab', 'laboratorio@nexor.dev'],
  ])('shows the Biteplaner menu for active %s licensing access', (role, email) => {
    renderLayout('/painel/home', {
      backendUser: {
        email,
        roles: [role],
        productRoles: [{ productKey: 'biteplaner', role, status: 'active' }],
      },
    });

    expect(screen.getByRole('button', { name: /biteplaner/i })).toBeInTheDocument();
  });

  it('shows Biteplaner customer submenus from the panel home after the order is started', () => {
    renderLayout('/painel/home', {
      backendUser: {
        email: 'cliente@nexor.dev',
        roles: ['customer'],
        productRoles: [
          {
            productKey: 'biteplaner',
            role: 'customer',
            status: 'active',
            metadata: { orderStarted: true },
          },
        ],
      },
    });

    expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute('href', '/painel/biteplaner');
    expect(screen.getByRole('link', { name: /^ordem$/i })).toHaveAttribute('href', '/painel/biteplaner/jornada');
  });

  it('shows Biteplaner partner submenus from the panel home', () => {
    renderLayout('/painel/home', {
      backendUser: {
        email: 'parceiro@nexor.dev',
        roles: ['partner'],
        productRoles: [{ productKey: 'biteplaner', role: 'partner', status: 'active' }],
      },
      demoPersona: 'partner',
    });

    expect(screen.getByRole('link', { name: /^home$/i })).toHaveAttribute('href', '/painel/biteplaner?mode=partner');
    expect(screen.getByRole('link', { name: /indicar/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/indicar?mode=partner'
    );
    expect(screen.getByRole('link', { name: /avaliações/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/avaliacoes?mode=partner'
    );
    expect(screen.queryByRole('link', { name: /^ordem$/i })).not.toBeInTheDocument();
  });

  it('hides the customer Ordem submenu until the Biteplaner order is started', () => {
    renderLayout('/painel/biteplaner', {
      backendUser: {
        email: 'cliente@nexor.dev',
        roles: ['customer'],
        productRoles: [
          {
            productKey: 'biteplaner',
            role: 'customer',
            status: 'active',
            metadata: { orderStarted: false },
          },
        ],
      },
    });

    expect(screen.getByRole('button', { name: /biteplaner/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /^home$/i })).toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^ordem$/i })).not.toBeInTheDocument();
  });

  it('shows the customer Ordem submenu after the Biteplaner order is started', () => {
    renderLayout('/painel/biteplaner', {
      backendUser: {
        email: 'cliente@nexor.dev',
        roles: ['customer'],
        productRoles: [
          {
            productKey: 'biteplaner',
            role: 'customer',
            status: 'active',
            metadata: { orderStarted: true },
          },
        ],
      },
    });

    expect(screen.getByRole('link', { name: /^ordem$/i })).toHaveAttribute('href', '/painel/biteplaner/jornada');
  });

  it('shows dentist submenus without the deprecated licensing entry', () => {
    renderLayout('/painel/biteplaner?mode=dentist', {
      backendUser: {
        email: 'dentista@nexor.dev',
        roles: ['dentist'],
        productRoles: [{ productKey: 'biteplaner', role: 'dentist', status: 'active' }],
      },
      demoPersona: 'dentist',
    });

    expect(screen.queryByRole('link', { name: /licenciamento/i })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: /avaliações/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/avaliacoes?mode=dentist'
    );
    expect(screen.queryByText('MVP1')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^ordem$/i })).not.toBeInTheDocument();
  });

  it('shows the evaluations submenu for partner and lab access', () => {
    renderLayout('/painel/biteplaner?mode=partner', {
      backendUser: {
        email: 'parceiro@nexor.dev',
        roles: ['partner'],
        productRoles: [{ productKey: 'biteplaner', role: 'partner', status: 'active' }],
      },
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
      backendUser: {
        email: 'lab@nexor.dev',
        roles: ['lab'],
        productRoles: [{ productKey: 'biteplaner', role: 'lab', status: 'active' }],
      },
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
      backendUser: {
        email: 'dentista@nexor.dev',
        roles: ['dentist'],
        productRoles: [{ productKey: 'biteplaner', role: 'dentist', status: 'active' }],
      },
      demoPersona: 'dentist',
    });

    expect(screen.queryByRole('link', { name: /licenciamento/i })).not.toBeInTheDocument();
    expect(screen.queryByText('MVP1')).not.toBeInTheDocument();
    expect(screen.queryByRole('link', { name: /^ordem$/i })).not.toBeInTheDocument();
  });

  it('contains responsive CSS that removes desktop sidebar from mobile flow', () => {
    const source = readFileSync(join(process.cwd(), 'src/components/portal/PortalLayout/styles.ts'), 'utf8');

    expect(source).toContain('@media (max-width: 768px)');
    expect(source).toContain('display: none');
    expect(source).toContain('padding-bottom: calc(32px + env(safe-area-inset-bottom))');
  });

  it('uses dynamic viewport height so the mobile topbar stays visible after scrolling', () => {
    const source = readFileSync(join(process.cwd(), 'src/components/portal/PortalLayout/styles.ts'), 'utf8');
    const shellSource = source.slice(
      source.indexOf('export const Shell'),
      source.indexOf('export const Sidebar')
    );
    const sidebarSource = source.slice(
      source.indexOf('export const Sidebar'),
      source.indexOf('export const SidebarTop')
    );

    expect(shellSource).toContain('height: 100vh;');
    expect(shellSource).toContain('height: 100dvh;');
    expect(sidebarSource).toContain('height: 100vh;');
    expect(sidebarSource).toContain('height: 100dvh;');
  });

  it('defines compact dashboard density for notebook and mobile viewports', () => {
    const source = readFileSync(join(process.cwd(), 'src/components/portal/PortalLayout/styles.ts'), 'utf8');

    expect(source).toContain('@media (max-width: 1280px)');
    expect(source).toContain('--portal-panel-icon-size: 32px');
    expect(source).toContain('--portal-panel-card-padding: 16px');
    expect(source).toContain('max-width: var(--portal-panel-icon-size)');
    expect(source).toContain('width: 16px');
    expect(source).toContain('height: 16px');
    expect(source).toContain('font-size: 12px');
  });

  it('keeps the mobile drawer links aligned with the desktop sidebar density', () => {
    const source = readFileSync(join(process.cwd(), 'src/components/portal/PortalLayout/styles.ts'), 'utf8');
    const drawerSource = source.slice(
      source.indexOf('export const MobileDrawerNav'),
      source.indexOf('export const Topbar')
    );

    expect(drawerSource).toContain('export const MobileDrawerLink');
    expect(drawerSource).toContain('display: flex;');
    expect(drawerSource).toContain('flex-direction: column;');
    expect(drawerSource).toContain('padding: 10px 16px;');
    expect(drawerSource).toContain('font-size: 13px;');
    expect(drawerSource).toContain('export const MobileDrawerFooter');
    expect(drawerSource).toContain('export const MobileDrawerLogoutButton');
    expect(drawerSource).not.toContain('min-height: 40px;');
    expect(drawerSource).not.toContain('min-height: 44px;');
  });

  it('does not render the removed access mode modal from the sidebar', () => {
    renderLayout('/painel/home');

    fireEvent.click(screen.getByRole('button', { name: /biteplaner/i }));

    expect(screen.queryByRole('dialog', { name: /selecionar acesso ao biteplaner/i })).not.toBeInTheDocument();
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner');
  });

  it('redirects to the login page when signing out from the portal', () => {
    const signOut = vi.fn();
    renderLayout('/painel/admin/home', {
      signOut,
      backendUser: {
        email: 'admin@nexor.dev',
        roles: ['admin'],
        productRoles: [{ productKey: 'biteplaner', role: 'admin', status: 'active' }],
      },
      demoPersona: 'admin',
    });

    fireEvent.click(screen.getByRole('button', { name: /^sair$/i }));

    expect(signOut).toHaveBeenCalledTimes(1);
    expect(mockNavigate).toHaveBeenCalledWith('/entrar');
  });
});
