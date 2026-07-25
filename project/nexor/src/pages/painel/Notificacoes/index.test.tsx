import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { TestQueryClientProvider } from '../../../test/renderWithQueryClient';
import { Notificacoes } from './index';

const { mockUseAuth, mockApiGet, mockApiPatch } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPatch: vi.fn(),
}));
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
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

function renderPage() {
  mockUseAuth.mockReturnValue({
    backendUser: { id: 'user-1', email: 'cliente@nexor.dev' },
    session: { access_token: 'tok', user: { id: 'auth-user-1', email: 'cliente@nexor.dev' } },
  });

  return render(
    <ThemeProvider theme={lightTheme}>
      <TestQueryClientProvider>
        <Notificacoes />
      </TestQueryClientProvider>
    </ThemeProvider>
  );
}

describe('Notificacoes', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPatch.mockReset();
    mockNavigate.mockReset();
    mockApiPatch.mockResolvedValue({});
    mockApiGet.mockResolvedValue({
      unreadCount: 2,
      notifications: Array.from({ length: 12 }, (_, index) => ({
        id: `notification-${index + 1}`,
        title: `Notificação ${index + 1}`,
        message: `Mensagem operacional ${index + 1}.`,
        read: index > 1,
        createdAt: `2026-05-${String(12 - index).padStart(2, '0')}T09:30:00.000Z`,
      })),
    });
  });

  it('lists account notifications with pagination', async () => {
    renderPage();

    expect(await screen.findByRole('heading', { name: /notificações/i })).toBeInTheDocument();
    expect(mockApiGet).toHaveBeenCalledWith('/v1/account/notifications?status=all&limit=100', 'tok');
    expect(await screen.findByText('Notificação 1')).toBeInTheDocument();
    expect(screen.getByText('Notificação 10')).toBeInTheDocument();
    expect(screen.queryByText('Notificação 11')).not.toBeInTheDocument();
    expect(screen.getByText(/página 1 de 2/i)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /próxima página/i }));

    await waitFor(() => expect(screen.getByText('Notificação 11')).toBeInTheDocument());
    expect(screen.getByText('Notificação 12')).toBeInTheDocument();
    expect(screen.queryByText('Notificação 1')).not.toBeInTheDocument();
    expect(screen.getByText(/página 2 de 2/i)).toBeInTheDocument();
  });

  it('keeps order actions inside the notification modal instead of the notification card', async () => {
    mockApiGet.mockResolvedValue({
      unreadCount: 3,
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
      ],
    });

    renderPage();

    expect(await screen.findByText(/ação necessária no pedido/i)).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ir para jornada/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /ver ordens do dentista/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /abrir notificação ação necessária no pedido/i }));
    expect(await screen.findByRole('dialog', { name: /ação necessária no pedido/i })).toHaveTextContent(/cliente precisa avançar/i);
    fireEvent.click(await screen.findByRole('button', { name: /ir para jornada/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/jornada');

    fireEvent.click(screen.getByRole('button', { name: /abrir notificação ação necessária do dentista/i }));
    fireEvent.click(await screen.findByRole('button', { name: /ver ordens do dentista/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner?mode=dentist');
  });

  it('shows the financial onboarding action in the notification card', async () => {
    mockApiGet.mockResolvedValue({
      unreadCount: 1,
      notifications: [
        {
          id: 'financial-onboarding',
          title: 'Cadastro financeiro pendente',
          message:
            'Seu cadastro de dentista Biteplaner foi aprovado. Finalize a Parte 2 no Asaas para configurar os dados financeiros.',
          type: 'biteplaner_dentist_licensing_approved',
          metadata: {
            financialOnboardingRequired: true,
            financialOnboardingPath: '/painel/biteplaner/financeiro?role=dentist',
          },
          read: false,
          createdAt: '2026-07-03T09:30:00.000Z',
        },
      ],
    });

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /completar cadastro financeiro/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/financeiro?role=dentist');
    expect(screen.queryByRole('dialog', { name: /cadastro financeiro pendente/i })).not.toBeInTheDocument();
    fireEvent.click(await screen.findByRole('button', { name: /abrir notificação cadastro financeiro pendente/i }));

    expect(screen.queryByRole('button', { name: /ver ordens do dentista/i })).not.toBeInTheDocument();
    expect(screen.getByRole('dialog', { name: /cadastro financeiro pendente/i })).toHaveTextContent(/dados financeiros/i);
  });

  it('opens a modal with the notification message when clicking a notification', async () => {
    mockApiGet.mockResolvedValue({
      unreadCount: 1,
      notifications: [
        {
          id: 'notification-message',
          title: 'Atualização operacional',
          message: 'Mensagem completa da notificação para ser lida dentro do modal.',
          read: false,
          createdAt: '2026-05-12T09:30:00.000Z',
        },
      ],
    });

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /abrir notificação atualização operacional/i }));

    await waitFor(() =>
      expect(mockApiPatch).toHaveBeenCalledWith(
        '/v1/account/notifications/notification-message/read',
        {},
        'tok'
      )
    );

    const dialog = screen.getByRole('dialog', { name: /atualização operacional/i });
    expect(dialog).toHaveTextContent(/mensagem completa da notificação/i);
    expect(dialog).toHaveTextContent(/12\/05\/2026/i);

    fireEvent.click(within(dialog).getByRole('button', { name: /fechar notificação/i }));
    expect(screen.queryByRole('dialog', { name: /atualização operacional/i })).not.toBeInTheDocument();
  });

  it('opens the message modal before navigating through a notification workflow action', async () => {
    mockApiGet.mockResolvedValue({
      unreadCount: 1,
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
      ],
    });

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /abrir notificação ação necessária no pedido/i }));

    expect(screen.getByRole('dialog', { name: /ação necessária no pedido/i })).toHaveTextContent(/cliente precisa avançar/i);
    fireEvent.click(await screen.findByRole('button', { name: /ir para jornada/i }));

    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/jornada');
    expect(screen.queryByRole('dialog', { name: /ação necessária no pedido/i })).not.toBeInTheDocument();
  });

  it('marks all notifications as read from the header action', async () => {
    mockApiGet.mockResolvedValue({
      unreadCount: 2,
      notifications: [
        {
          id: 'notification-1',
          title: 'Primeira notificação',
          message: 'Mensagem da primeira notificação.',
          read: false,
          createdAt: '2026-05-12T09:30:00.000Z',
        },
        {
          id: 'notification-2',
          title: 'Segunda notificação',
          message: 'Mensagem da segunda notificação.',
          read: false,
          createdAt: '2026-05-12T09:20:00.000Z',
        },
      ],
    });

    renderPage();

    const markAllReadButton = await screen.findByRole('button', { name: /marcar todas como lida/i });
    await waitFor(() => expect(markAllReadButton).toBeEnabled());
    fireEvent.click(markAllReadButton);

    await waitFor(() =>
      expect(mockApiPatch).toHaveBeenCalledWith('/v1/account/notifications/read-all', {}, 'tok')
    );
    expect(screen.getByText(/0 não lidas/i)).toBeInTheDocument();
    expect(screen.getAllByText('Lida')).toHaveLength(2);
  });

  it('keeps mobile pagination fixed in the page footer', () => {
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/painel/Notificacoes/styles.ts'), 'utf8');

    expect(stylesSource).toContain('position: sticky;');
    expect(stylesSource).toContain('bottom: 0;');
    expect(stylesSource).toContain('margin: 0 -12px;');
    expect(stylesSource).not.toContain('calc(-76px - env(safe-area-inset-bottom))');
    expect(stylesSource).toContain('padding: 10px 12px calc(10px + env(safe-area-inset-bottom));');
  });
});
