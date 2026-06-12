import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { beforeEach, describe, expect, it, vi } from 'vitest';
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

import { AdminPartnerLicensing } from './AdminPartnerLicensing';

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
          <AdminPartnerLicensing />
        </MemoryRouter>
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('AdminPartnerLicensing', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockUseAdminPortal.mockReset();
  });

  it('lists partner requests and enables approve/reject actions in the review modal', async () => {
    mockApiGet.mockResolvedValueOnce({
      requests: [
        {
          id: 'partner-role-1',
          profileId: 'profile-partner-1',
          partnerName: 'Performance Partners',
          contactEmail: 'contato@performancepartners.dev',
          documentType: 'cnpj',
          documentNumber: '19.131.243/0001-97',
          partnerType: 'coach_personal',
          location: null,
          serviceLocations: ['Academia', 'Box de Crossfit'],
          status: 'pending',
          submittedAt: '2026-05-10T10:00:00.000Z',
        },
      ],
    });
    mockApiPost.mockResolvedValueOnce({ request: { id: 'partner-role-1', status: 'active' } });
    mockApiGet.mockResolvedValueOnce({ requests: [] });

    renderPage();

    await waitFor(() => expect(screen.getByText(/performance partners/i)).toBeInTheDocument());
    expect(screen.getByText('contato@performancepartners.dev')).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: /visualizar solicitação de performance partners/i }));

    const dialog = await screen.findByRole('dialog', { name: /dados enviados pelo parceiro/i });
    expect(within(dialog).getByText(/coach\/personal/i)).toBeInTheDocument();
    expect(within(dialog).getByText(/academia, box de crossfit/i)).toBeInTheDocument();
    expect(within(dialog).getByRole('button', { name: /aprovar cadastro/i })).toBeEnabled();

    const rejectButton = within(dialog).getByRole('button', { name: /recusar cadastro/i });
    expect(rejectButton).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText(/motivo da recusa/i), {
      target: { value: 'Documento divergente.' },
    });

    expect(rejectButton).toBeEnabled();

    fireEvent.click(within(dialog).getByRole('button', { name: /aprovar cadastro/i }));

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/admin/biteplaner/partner-requests/partner-role-1/approve',
        {},
        'tok'
      )
    );
  });
});
