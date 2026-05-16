import { fireEvent, render, screen } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { ThemeProvider } from 'styled-components';
import { vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';

const { mockUseAdminPortal } = vi.hoisted(() => ({
  mockUseAdminPortal: vi.fn(),
}));

vi.mock('../../../features/admin/portal', () => ({
  useAdminPortal: mockUseAdminPortal,
}));

import { AdminSystemSettings } from './AdminSystemSettings';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function renderPage() {
  mockUseAdminPortal.mockReturnValue({
    selectedProduct: { id: 'biteplaner', name: 'Biteplaner', label: 'Biteplaner', description: '', status: 'available' },
  });

  render(
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <AdminSystemSettings />
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('AdminSystemSettings mobile flow', () => {
  beforeEach(() => {
    mockUseAdminPortal.mockReset();
  });

  it('shows a guided mobile step flow for system settings', () => {
    renderPage();

    expect(screen.getByRole('region', { name: /configuração de sistema mobile/i })).toBeInTheDocument();
    expect(screen.getByText('1/3')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /mensagem global/i }).length).toBeGreaterThan(0);

    fireEvent.click(screen.getByRole('button', { name: /avançar para controle de compras/i }));

    expect(screen.getByText('2/3')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /controle de compras/i }).length).toBeGreaterThan(0);
    expect(screen.getByText(/mensagem "manutencao preventiva agendada" preparada/i)).toBeInTheDocument();
  });

  it('uses a sticky save action in the mobile flow', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /^salvar e avançar$/i }));

    expect(screen.getByText(/mensagem "manutencao preventiva agendada" preparada/i)).toBeInTheDocument();
  });
});
