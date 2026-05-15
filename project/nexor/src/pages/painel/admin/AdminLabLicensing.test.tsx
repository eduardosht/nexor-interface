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

import { AdminLabLicensing } from './AdminLabLicensing';

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
          <AdminLabLicensing />
        </MemoryRouter>
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('AdminLabLicensing', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockUseAdminPortal.mockReset();
  });

  it('enables approve immediately and enables the red reject action as soon as a reason is typed', async () => {
    mockApiGet.mockResolvedValueOnce({
      requests: [
        {
          id: 'lab-role-1',
          profileId: 'profile-lab-1',
          labName: 'Lab Centro',
          cnpj: '19.131.243/0001-97',
          professionalSummary: 'Produção laboratorial Biteplaner.',
          status: 'pending',
          workflowStatus: 'admin_review_pending',
          submittedAt: '2026-05-10T10:00:00.000Z',
          locations: [
            {
              name: 'Unidade Centro',
              address: 'Praça da Sé, 100',
              cep: '01001-000',
              phone: '(11) 99999-9999',
              serviceHours: 'Segunda a sexta, 8h às 18h',
              city: 'São Paulo',
              state: 'SP',
            },
          ],
        },
      ],
    });
    mockApiPost.mockResolvedValueOnce({ request: { id: 'lab-role-1', status: 'rejected' } });
    mockApiGet.mockResolvedValueOnce({ requests: [] });

    renderPage();

    await waitFor(() => expect(screen.getByText(/lab centro/i)).toBeInTheDocument());
    fireEvent.click(screen.getByRole('button', { name: /visualizar solicitação de lab centro/i }));

    const dialog = await screen.findByRole('dialog', { name: /dados enviados pelo laboratório/i });
    expect(within(dialog).getByRole('button', { name: /aprovar cadastro/i })).toBeEnabled();

    const rejectButton = within(dialog).getByRole('button', { name: /recusar cadastro/i });
    expect(rejectButton).toBeDisabled();

    fireEvent.change(within(dialog).getByLabelText(/motivo da recusa/i), {
      target: { value: 'CNPJ informado não foi localizado.' },
    });

    expect(rejectButton).toBeEnabled();
    expect(getComputedStyle(rejectButton).backgroundColor).toBe('rgb(185, 28, 28)');
    fireEvent.click(rejectButton);

    await waitFor(() =>
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/admin/biteplaner/laboratories/lab-role-1/reject',
        { reason: 'CNPJ informado não foi localizado.' },
        'tok'
      )
    );
  });
});
