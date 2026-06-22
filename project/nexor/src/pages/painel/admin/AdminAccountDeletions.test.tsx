import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { AdminPortalProvider } from '../../../features/admin/portal';

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

import { AdminAccountDeletions } from './AdminAccountDeletions';

function renderPage() {
  localStorage.setItem('nexor-admin-selected-product', 'biteplaner');
  mockUseAuth.mockReturnValue({
    session: { access_token: 'tok' },
  });

  return render(
    <MemoryRouter>
      <ThemeProvider theme={lightTheme}>
        <AdminPortalProvider>
          <AdminAccountDeletions />
        </AdminPortalProvider>
      </ThemeProvider>
    </MemoryRouter>
  );
}

describe('AdminAccountDeletions', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    localStorage.clear();
  });

  it('lists deletion requests and approves with a note', async () => {
    mockApiGet
      .mockResolvedValueOnce({
        requests: [
          {
            id: 'request-1',
            status: 'pending_admin_review',
            reason: 'privacy',
            reason_details: null,
            active_order_ids: ['order-1'],
            requested_at: '2026-06-14T12:00:00.000Z',
            admin_decision_note: null,
            profile: { full_name: 'Joao Silva', email: 'joao@nexor.dev', status: 'active' },
          },
        ],
      })
      .mockResolvedValueOnce({ requests: [] });
    mockApiPost.mockResolvedValueOnce({
      request: { id: 'request-1', status: 'approved_processing_privacy' },
    });

    renderPage();

    await waitFor(() => expect(screen.getAllByText('Joao Silva').length).toBeGreaterThan(0));
    expect(screen.getByTestId('admin-account-deletions-mobile-list')).toBeInTheDocument();
    expect(within(screen.getByTestId('admin-account-deletions-mobile-list')).getByText('Joao Silva')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /visualizar remoção de joao silva/i }));
    expect(await screen.findByRole('button', { name: /aprovar remoção/i })).toBeInTheDocument();
    fireEvent.change(screen.getByPlaceholderText(/registre a justificativa/i), {
      target: { value: 'Aprovado após análise operacional.' },
    });
    fireEvent.click(screen.getByRole('button', { name: /aprovar remoção/i }));

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/admin/account-deletion-requests/request-1/approve',
        { adminDecisionNote: 'Aprovado após análise operacional.' },
        'tok'
      );
    });
  });

  it('shows cancelled requests with customer-cancelled status', async () => {
    mockApiGet.mockResolvedValueOnce({
      requests: [
        {
          id: 'request-2',
          status: 'cancelled_by_user',
          reason: 'privacy',
          reason_details: null,
          active_order_ids: [],
          requested_at: '2026-06-14T12:00:00.000Z',
          admin_decision_note: null,
          profile: { full_name: 'Maria Cliente', email: 'maria@nexor.dev', status: 'active' },
        },
      ],
    });

    renderPage();

    expect(await screen.findByText('Cliente cancelou')).toBeInTheDocument();
  });
});
