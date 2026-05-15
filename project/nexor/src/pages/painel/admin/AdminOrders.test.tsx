import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { within } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockUseAdminPortal } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockUseAdminPortal: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: mockUseAuth,
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
  },
}));

vi.mock('../../../features/admin/portal', () => ({
  useAdminPortal: mockUseAdminPortal,
}));

import { AdminOrders } from './AdminOrders';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function renderPage() {
  mockUseAuth.mockReturnValue({
    session: { access_token: 'tok', user: { id: '1', email: 'admin@nexor.dev' } },
  });

  mockUseAdminPortal.mockReturnValue({
    selectedProduct: { id: 'biteplaner', name: 'Biteplaner', label: 'Biteplaner', description: '', status: 'available' },
  });

  return render(
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <MemoryRouter>
          <AdminOrders />
        </MemoryRouter>
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('AdminOrders', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockUseAdminPortal.mockReset();
  });

  it('shows operational readiness for orders awaiting dentist production filling', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: 'BP-DEMO-004',
          status: 'awaiting_dentist_forms',
          statusLabel: 'Aguardando preenchimento dentista',
          stage: 'awaiting_dentist_forms',
          created_at: '2026-05-02T12:00:00.000Z',
          customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
          operationalReadiness: {
            preLabReady: false,
            pendingItems: [
              'Anamnese / avaliação inicial pendente',
              'Escaneamento 3D intraoral pendente',
            ],
            summary:
              'Pendências antes da liberação: Anamnese / avaliação inicial pendente; Escaneamento 3D intraoral pendente.',
          },
        },
        {
          id: 'BP-DEMO-005',
          status: 'lab_processing',
          statusLabel: 'Em processo - Laboratório',
          stage: 'lab_production',
          created_at: '2026-05-03T08:00:00.000Z',
          customer: { full_name: 'Marina Demo', email: 'marina@nexor.dev', phone: null },
          operationalReadiness: {
            preLabReady: true,
            pendingItems: [],
            summary: 'Ordem operacionalmente pronta para a próxima etapa.',
          },
        },
      ],
    });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('admin-orders-table')).toBeInTheDocument());
    expect(screen.getAllByText(/aguardando preenchimento dentista/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/escaneamento 3d intraoral pendente/i)).toBeInTheDocument();
    const pendingLabStat = screen.getByText(/aguardando liberação ao lab/i).closest('div');
    expect(pendingLabStat).not.toBeNull();
    expect(within(pendingLabStat as HTMLElement).getByText('1')).toBeInTheDocument();
  });

  it('uses the design-system multi-select removable chips for admin filters', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        {
          id: 'BP-DEMO-004',
          status: 'awaiting_dentist_forms',
          statusLabel: 'Aguardando preenchimento dentista',
          stage: 'awaiting_dentist_forms',
          created_at: '2026-05-02T12:00:00.000Z',
          customer: { full_name: 'Joao Demo', email: 'joao@nexor.dev', phone: null },
          operationalReadiness: {
            preLabReady: false,
            pendingItems: [],
            summary: 'Pendências antes da liberação.',
          },
        },
        {
          id: 'BP-DEMO-005',
          status: 'lab_processing',
          statusLabel: 'Em processo - Laboratório',
          stage: 'lab_production',
          created_at: '2026-05-03T08:00:00.000Z',
          customer: { full_name: 'Marina Demo', email: 'marina@nexor.dev', phone: null },
          operationalReadiness: {
            preLabReady: true,
            pendingItems: [],
            summary: 'Ordem operacionalmente pronta.',
          },
        },
      ],
    });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('admin-orders-table')).toBeInTheDocument());

    const statusFilter = screen.getByTestId('admin-orders-filter-status');
    fireEvent.click(within(statusFilter).getByRole('button', { name: /todos os status/i }));
    fireEvent.click(screen.getByRole('option', { name: /em processo - laboratório/i }));

    expect(within(statusFilter).getByRole('button', { name: /remover em processo - laboratório/i })).toBeInTheDocument();
    expect(screen.queryByText('BP-DEMO-004')).not.toBeInTheDocument();
    expect(screen.getByText('BP-DEMO-005')).toBeInTheDocument();

    fireEvent.click(within(statusFilter).getByRole('button', { name: /remover em processo - laboratório/i }));

    expect(screen.getByText('BP-DEMO-004')).toBeInTheDocument();
    expect(screen.getByText('BP-DEMO-005')).toBeInTheDocument();
  });
});
