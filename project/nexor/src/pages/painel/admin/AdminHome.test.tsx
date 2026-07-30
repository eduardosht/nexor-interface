import { readFileSync } from 'node:fs';
import { join } from 'node:path';
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

    expect(screen.getByText(/fila de acionamento de produção externa/i)).toBeInTheDocument();
    expect(screen.queryByText(/envio para produção externa/i)).not.toBeInTheDocument();
  });

  it('keeps rendering the selected product dashboard when a product is already stored', async () => {
    window.localStorage.setItem('nexor-admin-selected-product', 'biteplaner');
    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /dashboard administrativo/i })).toBeInTheDocument();
    });

    expect(screen.getByText(/fila de acionamento de produção externa/i)).toBeInTheDocument();
  });

  it('uses compact density for shared administrative cards and licensing modals', () => {
    const adminStyles = readFileSync(join(process.cwd(), 'src/pages/painel/admin/styles.ts'), 'utf8');
    expect(adminStyles).toContain('@media (max-width: 1280px)');
    expect(adminStyles).toContain('min-height: 88px');
    expect(adminStyles).toContain('gap: 12px');
    expect(adminStyles).toContain('grid-template-columns: repeat(auto-fit, minmax(180px, 1fr))');
  });
});