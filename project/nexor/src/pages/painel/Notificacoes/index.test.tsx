import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { TestQueryClientProvider } from '../../../test/renderWithQueryClient';
import { Notificacoes } from './index';

const { mockUseAuth, mockApiGet } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
}));
const mockNavigate = vi.hoisted(() => vi.fn());

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
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
    mockNavigate.mockReset();
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

  it('navigates action-required notifications to the matching workflow area', async () => {
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
    });

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /ir para jornada/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner/jornada');

    fireEvent.click(screen.getByRole('button', { name: /ver ordens do dentista/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner?mode=dentist');

    fireEvent.click(screen.getByRole('button', { name: /ver ordens do laboratório/i }));
    expect(mockNavigate).toHaveBeenCalledWith('/painel/biteplaner?mode=lab');
  });

  it('keeps mobile pagination fixed in the page footer', () => {
    const stylesSource = readFileSync(join(process.cwd(), 'src/pages/painel/Notificacoes/styles.ts'), 'utf8');

    expect(stylesSource).toContain('position: sticky;');
    expect(stylesSource).toContain('bottom: 0;');
    expect(stylesSource).toContain('padding: 10px 12px calc(10px + env(safe-area-inset-bottom));');
  });
});
