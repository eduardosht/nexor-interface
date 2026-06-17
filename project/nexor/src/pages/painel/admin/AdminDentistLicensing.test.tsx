import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { describe, expect, it, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockApiPost, mockUseAdminPortal } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockApiPost: vi.fn(),
  mockUseAdminPortal: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({ useAuth: mockUseAuth }));
vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    post: mockApiPost,
  },
}));
vi.mock('../../../features/admin/portal', () => ({ useAdminPortal: mockUseAdminPortal }));

import { AdminDentistLicensing } from './AdminDentistLicensing';

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
          <AdminDentistLicensing />
        </MemoryRouter>
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('AdminDentistLicensing', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockUseAdminPortal.mockReset();
  });

  it('lists pending dentist license requests, opens submitted data and approves the request', async () => {
    mockApiGet.mockResolvedValueOnce({
      requests: [
        {
          id: 'role-1',
          profileId: 'profile-dentist-1',
          dentistName: 'Dra Maria',
          croNumber: 'CRO-SP 12345',
          professionalSummary: 'Odontologia esportiva e DTM.',
          status: 'pending',
          workflowStatus: 'admin_review_pending',
          submittedAt: '2026-05-10T10:00:00.000Z',
          practiceLocations: [
            {
              name: 'Clínica Centro',
              address: 'Praca da Se - Se, São Paulo - SP',
              cep: '01001-000',
              phone: '(11) 99999-9999',
              serviceHours: 'Segunda a sexta, 8h as 18h',
              city: 'São Paulo',
              state: 'SP',
            },
          ],
        },
      ],
    });
    mockApiPost.mockResolvedValueOnce({ request: { id: 'role-1', status: 'active' } });
    mockApiGet.mockResolvedValueOnce({ requests: [] });

    renderPage();

    await waitFor(() => expect(screen.getByTestId('admin-dentist-requests-table')).toBeInTheDocument());
    expect(screen.getByTestId('admin-dentist-requests-mobile-list')).toBeInTheDocument();
    expect(within(screen.getByTestId('admin-dentist-requests-mobile-list')).getByText(/dra maria/i)).toBeInTheDocument();
    expect(screen.getByText(/dentistas querendo se licenciar/i)).toBeInTheDocument();
    expect(screen.getAllByText(/dra maria/i).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/cro-sp 12345/i).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /visualizar solicitação de dra maria/i }));

    const dialog = await screen.findByRole('dialog', { name: /dados enviados pelo dentista/i });
    expect(within(dialog).getByText(/odontologia esportiva e dtm/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/clínica centro/i)).toBeInTheDocument();

    fireEvent.click(within(dialog).getByRole('button', { name: /aprovar cadastro/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/admin/biteplaner/dentists/role-1/approve',
        {},
        'tok'
      )
    );
  });

  it('requires a reason before rejecting a dentist request', async () => {
    mockApiGet.mockResolvedValueOnce({
      requests: [
        {
          id: 'role-2',
          profileId: 'profile-dentist-2',
          dentistName: 'Dr Carlos',
          croNumber: 'CRO-RJ 999',
          professionalSummary: 'Clínica geral.',
          status: 'pending',
          workflowStatus: 'admin_review_pending',
          submittedAt: '2026-05-10T10:00:00.000Z',
          practiceLocations: [],
        },
      ],
    });
    mockApiPost.mockResolvedValueOnce({ request: { id: 'role-2', status: 'rejected' } });
    mockApiGet.mockResolvedValueOnce({ requests: [] });

    renderPage();

    await waitFor(() => expect(screen.getAllByText(/dr carlos/i).length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole('button', { name: /visualizar solicitação de dr carlos/i }));

    const dialog = await screen.findByRole('dialog', { name: /dados enviados pelo dentista/i });
    const rejectButton = within(dialog).getByRole('button', { name: /recusar cadastro/i });
    expect(rejectButton).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText(/motivo da recusa/i), {
      target: { value: 'CRO informado não foi localizado.' },
    });

    expect(rejectButton).toBeEnabled();
    fireEvent.click(rejectButton);

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/admin/biteplaner/dentists/role-2/reject',
        { reason: 'CRO informado não foi localizado.' },
        'tok'
      )
    );
  });

  it('filters dentist requests by search and status', async () => {
    mockApiGet.mockResolvedValueOnce({
      requests: [
        {
          id: 'role-1',
          profileId: 'profile-dentist-1',
          dentistName: 'Dra Maria',
          croNumber: 'CRO-SP 12345',
          professionalSummary: 'Odontologia esportiva e DTM.',
          status: 'pending',
          workflowStatus: 'admin_review_pending',
          submittedAt: '2026-05-10T10:00:00.000Z',
          practiceLocations: [],
        },
        {
          id: 'role-2',
          profileId: 'profile-dentist-2',
          dentistName: 'Dr Carlos',
          croNumber: 'CRO-RJ 999',
          professionalSummary: 'Clínica geral.',
          status: 'active',
          workflowStatus: 'approved_pending_payment',
          submittedAt: '2026-05-11T10:00:00.000Z',
          practiceLocations: [],
        },
      ],
    });

    renderPage();

    await waitFor(() => expect(screen.getAllByText(/dra maria/i).length).toBeGreaterThan(0));
    expect(screen.getAllByText(/dr carlos/i).length).toBeGreaterThan(0);

    fireEvent.change(screen.getByLabelText(/buscar dentistas/i), {
      target: { value: 'maria' },
    });

    expect(screen.getAllByText(/dra maria/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/dr carlos/i)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/buscar dentistas/i), {
      target: { value: '' },
    });
    fireEvent.click(screen.getByRole('button', { name: /filtrar solicitações por status/i }));
    fireEvent.click(screen.getByRole('option', { name: /aprovados/i }));

    expect(screen.queryByText(/dra maria/i)).not.toBeInTheDocument();
    expect(screen.getAllByText(/dr carlos/i).length).toBeGreaterThan(0);
  });
});
