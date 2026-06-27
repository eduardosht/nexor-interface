import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAuth, mockApiGet, mockUseAdminPortal } = vi.hoisted(() => ({
  mockUseAuth: vi.fn(),
  mockApiGet: vi.fn(),
  mockUseAdminPortal: vi.fn(),
}));

vi.mock('../../../hooks/useAuth', () => ({ useAuth: mockUseAuth }));
vi.mock('../../../lib/api', () => ({
  api: {
    get: mockApiGet,
    patch: vi.fn(),
  },
}));
vi.mock('../../../features/admin/portal', () => ({ useAdminPortal: mockUseAdminPortal }));

import { AdminUsers } from './AdminUsers';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function renderPage() {
  mockUseAuth.mockReturnValue({
    session: { access_token: 'tok', user: { id: '1', email: 'admin@nexor.dev' } },
  });
  mockUseAdminPortal.mockReturnValue({
    selectedProduct: {
      id: 'biteplaner',
      name: 'Biteplaner',
      label: 'Biteplaner',
      description: '',
      status: 'available',
    },
  });

  return render(
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <MemoryRouter>
          <AdminUsers />
        </MemoryRouter>
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('AdminUsers', () => {
  beforeEach(() => {
    mockUseAuth.mockReset();
    mockApiGet.mockReset();
    mockUseAdminPortal.mockReset();
  });

  it('renders platform roles separately from Biteplaner product roles in the mobile list', async () => {
    mockApiGet.mockResolvedValue({
      profiles: [
        {
          id: 'profile-1',
          email: 'maria@nexor.dev',
          fullName: 'Maria Cliente',
          phone: '(11) 99999-9999',
          status: 'active',
          roles: ['admin'],
          platformRoles: ['admin'],
          productRoles: [
            {
              id: 'product-role-customer-1',
              productKey: 'biteplaner',
              role: 'customer',
              status: 'active',
              sourceType: 'self_service',
              metadata: {},
              approvedAt: null,
              createdAt: '2026-06-10T10:00:00.000Z',
              updatedAt: '2026-06-10T10:00:00.000Z',
            },
            {
              id: 'product-role-dentist-1',
              productKey: 'biteplaner',
              role: 'dentist',
              status: 'pending',
              sourceType: 'self_service',
              metadata: {},
              approvedAt: null,
              createdAt: '2026-06-10T10:00:00.000Z',
              updatedAt: '2026-06-10T10:00:00.000Z',
            },
          ],
          createdAt: '2026-06-10T10:00:00.000Z',
          updatedAt: '2026-06-11T10:00:00.000Z',
        },
      ],
      pagination: {
        page: 1,
        limit: 25,
        total: 1,
        totalPages: 1,
        rangeStart: 1,
        rangeEnd: 1,
      },
    });

    renderPage();

    await waitFor(() => expect(screen.getAllByText(/maria cliente/i).length).toBeGreaterThan(0));

    const mobileList = screen.getByTestId('admin-users-mobile-list');
    expect(mobileList).toBeInTheDocument();
    expect(within(mobileList).getByText(/maria cliente/i)).toBeInTheDocument();
    expect(within(mobileList).getByText(/admin/i)).toBeInTheDocument();
    expect(within(mobileList).getByText(/cliente ativo/i)).toBeInTheDocument();
    expect(within(mobileList).getByText(/dentista pendente/i)).toBeInTheDocument();
    expect(
      within(mobileList).getByRole('button', { name: /editar usuário maria cliente/i, hidden: true })
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /abrir filtros de usuários/i, hidden: true }));

    const filterDialog = screen.getByRole('dialog', { name: /filtros de usuários/i });
    expect(within(filterDialog).getByLabelText(/perfil/i)).toBeInTheDocument();
  });

  it('filters users by e-mail with backend pagination and labels deleted accounts', async () => {
    mockApiGet.mockResolvedValue({
      profiles: [
        {
          id: 'profile-removed',
          email: 'deleted+profile-removed@privacy.nexor.local',
          fullName: 'Conta removida',
          phone: null,
          status: 'blocked',
          deleted: true,
          roles: [],
          platformRoles: [],
          productRoles: [],
          createdAt: '2026-06-10T10:00:00.000Z',
          updatedAt: '2026-06-11T10:00:00.000Z',
        },
      ],
      pagination: {
        page: 2,
        limit: 25,
        total: 26,
        totalPages: 2,
        rangeStart: 26,
        rangeEnd: 26,
      },
    });

    renderPage();

    await waitFor(() => expect(screen.getAllByText(/conta removida/i).length).toBeGreaterThan(0));
    expect(screen.getAllByText(/conta deletada/i).length).toBeGreaterThan(0);
    expect(screen.getByText(/mostrando 26 a 26 de 26 resultados/i)).toBeInTheDocument();

    fireEvent.change(screen.getAllByLabelText(/e-mail/i)[0], { target: { value: 'dentista2@gmail.com' } });

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenLastCalledWith(
        expect.stringContaining('email=dentista2%40gmail.com'),
        'tok'
      );
    });
  });
});
