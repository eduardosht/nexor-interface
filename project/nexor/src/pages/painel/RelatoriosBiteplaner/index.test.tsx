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
  }),
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
  },
}));

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function expectedInitialReportPath() {
  const dateTo = new Date();
  const dateFrom = new Date(dateTo);
  dateFrom.setMonth(dateFrom.getMonth() - 3);

  return `/v1/admin/commerce/biteplaner/report?dateFrom=${formatDateInputValue(dateFrom)}&dateTo=${formatDateInputValue(dateTo)}`;
}

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

  it('loads the Biteplaner commerce report with an initial 3-month date range', async () => {
    mockApiGet.mockResolvedValueOnce({
      fields: [
        { key: 'orderId', label: 'Pedido' },
        { key: 'status', label: 'Status do pedido' },
        { key: 'buyerName', label: 'Dentista' },
      ],
      rows: [{ orderId: 'order-123456', status: 'paid', buyerName: 'Dra. Marina' }],
    });

    renderPage();

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith(expectedInitialReportPath(), 'tok');
    });

    expect(screen.getByRole('heading', { name: /relatórios biteplaner/i })).toBeInTheDocument();
    expect(screen.getAllByText(/status do pedido/i).length).toBeGreaterThan(0);
    expect(screen.getByTestId('report-mobile-list')).toBeInTheDocument();
    expect(within(screen.getByTestId('report-mobile-list')).getByText(/dra\. marina/i)).toBeInTheDocument();
    expect(screen.queryByText(/finalidade/i)).not.toBeInTheDocument();
  });

  it('keeps email and product detail fields out of the interface', async () => {
    mockApiGet.mockResolvedValueOnce({
      fields: [
        { key: 'orderId', label: 'Pedido' },
        { key: 'buyerEmail', label: 'E-mail' },
        { key: 'paymentStatus', label: 'Pagamento' },
        { key: 'quantity', label: 'Quantidade' },
        { key: 'model', label: 'Modelo' },
        { key: 'color', label: 'Cor' },
      ],
      rows: [{
        orderId: 'order-123456',
        buyerEmail: 'marina@nexor.dev',
        paymentStatus: 'pending',
        quantity: '2',
        model: 'impacto',
        color: 'preto',
      }],
    });

    renderPage();

    await screen.findByTestId('report-table');
    expect(screen.queryByText(/^E-mail$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/m\*+a@nexor\.dev/i)).not.toBeInTheDocument();
    expect(screen.queryByText('marina@nexor.dev')).not.toBeInTheDocument();
    expect(screen.queryByText(/^Quantidade$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Modelo$/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/^Cor$/i)).not.toBeInTheDocument();
    expect(screen.getAllByText('Pendente').length).toBeGreaterThan(0);
  });

  it('uses the form dropdown for commerce status filters', async () => {
    mockApiGet.mockResolvedValue({ fields: [{ key: 'status', label: 'Status do pedido' }], rows: [] });

    renderPage();

    const statusDropdown = screen.getByLabelText(/^status$/i);

    expect(statusDropdown).toHaveTextContent('Todos');
    fireEvent.click(statusDropdown);
    expect(screen.getByRole('option', { name: /pronto para produção/i })).toBeInTheDocument();

    fireEvent.click(screen.getByRole('option', { name: /^Pago$/i }));

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenLastCalledWith(
        expectedInitialReportPath().replace('/report?', '/report?status=paid&'),
        'tok'
      );
    });
  });

  it('enables CSV download only when the current report has rows', async () => {
    mockApiGet.mockResolvedValueOnce({
      fields: [{ key: 'status', label: 'Status do pedido' }],
      rows: [],
    });

    renderPage();

    await waitFor(() => {
      expect(screen.getByRole('button', { name: /baixar csv/i })).toBeDisabled();
    });
  });

  it('shows table skeletons while a changed filter reloads report data', async () => {
    let resolveSecondRequest: (value: unknown) => void = () => {};
    mockApiGet
      .mockResolvedValueOnce({
        fields: [{ key: 'status', label: 'Status do pedido' }],
        rows: [{ status: 'paid' }],
      })
      .mockReturnValueOnce(new Promise((resolve) => {
        resolveSecondRequest = resolve;
      }));

    renderPage();

    await screen.findAllByText('Pago');

    fireEvent.click(screen.getByLabelText(/^status$/i));
    fireEvent.click(screen.getByRole('option', { name: /aguardando pagamento/i }));

    expect(screen.getAllByTestId('report-table-skeleton').length).toBeGreaterThan(0);

    resolveSecondRequest({
      fields: [{ key: 'status', label: 'Status do pedido' }],
      rows: [],
    });
  });
});