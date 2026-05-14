import { render, screen, waitFor } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { AdminPortalProvider } from '../../../features/admin/portal';
import { lightTheme } from '../../../styles/theme';
import { AdminHome } from './AdminHome';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    session: { access_token: 'demo-admin-token', user: { id: 'admin', email: 'admin@nexor.dev' } },
  }),
}));

vi.mock('../../../features/demo/biteplanerFlow', async () => {
  const actual = await vi.importActual<typeof import('../../../features/demo/biteplanerFlow')>(
    '../../../features/demo/biteplanerFlow'
  );

  return {
    ...actual,
    fetchOrders: vi.fn().mockResolvedValue({ orders: [] }),
    getAuthToken: vi.fn().mockReturnValue('demo-admin-token'),
  };
});

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function renderPage() {
  return render(
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <MemoryRouter>
          <AdminPortalProvider>
            <AdminHome />
          </AdminPortalProvider>
        </MemoryRouter>
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('AdminHome', () => {
  afterEach(() => {
    window.localStorage.removeItem('nexor-admin-selected-product');
  });

  it('renders the administrative dashboard for the default product', async () => {
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard administrativo/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/ordens do biteplaner/i)).toBeInTheDocument();
    expect(screen.getByText(/ordens no período/i)).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ordens por semana/i })).toBeInTheDocument();
  });

  it('keeps rendering the selected product dashboard when a product is already stored', async () => {
    window.localStorage.setItem('nexor-admin-selected-product', 'biteplaner');
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard administrativo/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/acompanhe a evolução operacional semanal das ordens do biteplaner/i)).toBeInTheDocument();
  });
});
