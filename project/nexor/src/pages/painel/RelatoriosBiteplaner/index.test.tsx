import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { RelatoriosBiteplaner } from './index';

const mockApiGet = vi.fn();

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    session: { access_token: 'tok', user: { id: 'admin', email: 'admin@nexor.dev' } },
    backendUser: { roles: ['finance'] }
  })
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: vi.fn()
  }
}));

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function renderPage() {
  return render(
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <MemoryRouter>
          <RelatoriosBiteplaner />
        </MemoryRouter>
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('RelatoriosBiteplaner', () => {
  beforeEach(() => {
    mockApiGet.mockReset();
  });

  it('shows the non-technical report purpose and hides sensitive fields by default', async () => {
    mockApiGet.mockResolvedValueOnce({
      fields: [
        { key: 'orderStatus', label: 'Status da ordem', classification: 'operational' },
        { key: 'paymentStatus', label: 'Status financeiro', classification: 'financial' }
      ],
      rows: [{ orderStatus: 'Cadastro iniciado', paymentStatus: 'Pendente' }]
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('heading', { name: /relatórios biteplaner/i })).toBeInTheDocument();
    });

    expect(mockApiGet).toHaveBeenCalledWith('/v1/reports/biteplaner/orders?purpose=finance', 'tok');
    expect(screen.getAllByText(/status financeiro/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('report-mobile-list')).toBeInTheDocument();
    expect(within(screen.getByTestId('report-mobile-list')).getByText(/status financeiro/i)).toBeInTheDocument();
    expect(screen.queryByText(/limitação atual de treino ou saúde/i)).not.toBeInTheDocument();
  });

  it('uses a status dropdown with Todos as the default filter', async () => {
    mockApiGet.mockResolvedValue({
      fields: [{ key: 'orderStatus', label: 'Status da ordem', classification: 'operational' }],
      rows: []
    });

    renderPage();

    const statusSelect = screen.getByLabelText(/^status$/i);

    expect(statusSelect).toHaveDisplayValue('Todos');
    expect(screen.getByRole('option', { name: /aguardando pagamento/i })).toHaveValue('awaiting_payment');

    fireEvent.change(statusSelect, { target: { value: 'awaiting_payment' } });

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenLastCalledWith(
        '/v1/reports/biteplaner/orders?purpose=finance&status=awaiting_payment',
        'tok'
      );
    });
  });

  it('enables CSV export only when the current report has rows', async () => {
    mockApiGet.mockResolvedValueOnce({
      fields: [{ key: 'orderStatus', label: 'Status da ordem', classification: 'operational' }],
      rows: []
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /exportar csv/i })).toBeDisabled();
    });
  });

  it('shows table skeletons while a changed filter reloads report data', async () => {
    let resolveSecondRequest: (value: unknown) => void = () => {};
    mockApiGet
      .mockResolvedValueOnce({
        fields: [{ key: 'orderStatus', label: 'Status da ordem', classification: 'operational' }],
        rows: [{ orderStatus: 'Cadastro iniciado' }]
      })
      .mockReturnValueOnce(new Promise((resolve) => {
        resolveSecondRequest = resolve;
      }));

    renderPage();

    await screen.findByText('Cadastro iniciado');

    fireEvent.change(screen.getByLabelText(/^status$/i), { target: { value: 'awaiting_payment' } });

    expect(screen.getAllByTestId('report-table-skeleton').length).toBeGreaterThan(0);

    resolveSecondRequest({
      fields: [{ key: 'orderStatus', label: 'Status da ordem', classification: 'operational' }],
      rows: []
    });
  });
});
