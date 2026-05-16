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

import { AdminBusinessSettings } from './AdminBusinessSettings';

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function renderPage() {
  mockUseAdminPortal.mockReturnValue({
    selectedProduct: { id: 'biteplaner', name: 'Biteplaner', label: 'Biteplaner', description: '', status: 'available' },
  });

  render(
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <AdminBusinessSettings />
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('AdminBusinessSettings mobile flow', () => {
  beforeEach(() => {
    mockUseAdminPortal.mockReset();
  });

  it('shows a guided mobile step flow for business settings', () => {
    renderPage();

    expect(screen.getByRole('region', { name: /configuração de negócio mobile/i })).toBeInTheDocument();
    expect(screen.getByText('1/4')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /processo e pagamento/i }).length).toBeGreaterThan(0);

    expect(screen.queryByRole('button', { name: /avançar para regras de credenciamento/i })).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /^salvar e avançar$/i }));

    expect(screen.getByText('2/4')).toBeInTheDocument();
    expect(screen.getAllByRole('heading', { name: /regras de credenciamento/i }).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/última ação local salva nesta tela: pagamento/i).length).toBeGreaterThan(0);
  });

  it('uses a sticky save action in the mobile flow', () => {
    renderPage();

    fireEvent.click(screen.getByRole('button', { name: /^salvar e avançar$/i }));

    expect(screen.getAllByText(/última ação local salva nesta tela: pagamento/i).length).toBeGreaterThan(0);
  });
});
