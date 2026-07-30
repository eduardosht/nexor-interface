import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { initDesignSystem } from '@nexor/design-system';
import { MemoryRouter } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { lightTheme } from '../../../styles/theme';
import { AdminOrders } from './AdminOrders';

const mockApiGet = vi.fn();
const mockApiPost = vi.fn();
const mockWindowOpen = vi.fn();

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: () => ({
    session: { access_token: 'tok', user: { id: '1', email: 'admin@nexor.dev' } },
  }),
}));

vi.mock('../../../lib/api', () => ({
  api: {
    get: (...args: unknown[]) => mockApiGet(...args),
    post: (...args: unknown[]) => mockApiPost(...args),
  },
}));

const { DesignSystemRoot } = initDesignSystem({ brand: 'nexor' });

const order = {
  id: '5a8a8eb5-b63f-4e2a-9e77-a9d78f092333',
  buyerName: 'Dra. Marina',
  buyerEmail: 'marina@nexor.dev',
  status: 'paid',
  paymentStatus: 'pending',
  shipmentStatus: null,
  quantity: 2,
  model: 'Biteplaner Pro',
  color: 'Transparente',
  totalFormatted: 'R$ 1.200,00',
  createdAt: '2026-07-16T12:00:00.000Z',
  canStartExternalProduction: true,
};

function renderPage() {
  return render(
    <ThemeProvider theme={lightTheme}>
      <DesignSystemRoot>
        <MemoryRouter>
          <AdminOrders />
        </MemoryRouter>
      </DesignSystemRoot>
    </ThemeProvider>
  );
}

describe('AdminOrders', () => {
  beforeEach(() => {
    mockApiGet.mockReset();
    mockApiPost.mockReset();
    mockWindowOpen.mockReset();
    mockWindowOpen.mockReturnValue({ focus: vi.fn() });
    vi.stubGlobal('open', mockWindowOpen);
  });

  it('loads Biteplaner commerce orders for the admin queue with backend pagination', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [order], pagination: { page: 1, pageSize: 25, hasNextPage: false } });

    renderPage();

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenCalledWith('/v1/admin/commerce/biteplaner/orders?limit=25&page=1', 'tok');
    });

    expect(screen.getByText('Dra. Marina')).toBeInTheDocument();
    expect(screen.getByText('2x Biteplaner')).toBeInTheDocument();
    expect(screen.getByText('Biteplaner Pro / Transparente')).toBeInTheDocument();
    expect(screen.getByText('Pendente')).toBeInTheDocument();
  });

  it('filters the request by commerce status and resets pagination', async () => {
    mockApiGet.mockResolvedValue({ orders: [], pagination: { page: 1, pageSize: 25, hasNextPage: false } });

    renderPage();

    fireEvent.change(screen.getByLabelText(/status/i), { target: { value: 'paid' } });

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenLastCalledWith('/v1/admin/commerce/biteplaner/orders?status=paid&limit=25&page=1', 'tok');
    });
  });

  it('loads the next page when backend pagination has more results', async () => {
    mockApiGet
      .mockResolvedValueOnce({ orders: [order], pagination: { page: 1, pageSize: 25, hasNextPage: true } })
      .mockResolvedValueOnce({ orders: [], pagination: { page: 2, pageSize: 25, hasNextPage: false } });

    renderPage();

    const nextButton = await screen.findByRole('button', { name: /próxima/i });
    fireEvent.click(nextButton);

    await waitFor(() => {
      expect(mockApiGet).toHaveBeenLastCalledWith('/v1/admin/commerce/biteplaner/orders?limit=25&page=2', 'tok');
    });
  });

  it('renders friendly labels for refunded and correction requested statuses', async () => {
    mockApiGet.mockResolvedValueOnce({
      orders: [
        { ...order, id: '6b8a8eb5-b63f-4e2a-9e77-a9d78f092333', status: 'correction_requested' },
        { ...order, id: '7c8a8eb5-b63f-4e2a-9e77-a9d78f092333', status: 'refunded', paymentStatus: 'refunded' },
      ],
      pagination: { page: 1, pageSize: 25, hasNextPage: false },
    });

    renderPage();

    expect(await screen.findByText('Correção solicitada')).toBeInTheDocument();
    expect(screen.getAllByText('Reembolsado').length).toBeGreaterThan(0);
    expect(screen.queryByText('correction_requested')).not.toBeInTheDocument();
    expect(screen.queryByText('refunded')).not.toBeInTheDocument();
  });

  it('creates a external production email draft from a paid order', async () => {
    mockApiGet.mockResolvedValueOnce({ orders: [order], pagination: { page: 1, pageSize: 25, hasNextPage: false } });
    mockApiPost.mockResolvedValueOnce({
      email: {
        to: '',
        subject: 'Pedido Biteplaner 5a8a8eb5 para produção',
        body: 'Ordem: 5a8a8eb5-b63f-4e2a-9e77-a9d78f092333\n- scan3d.stl: https://signed.example/scan3d.stl',
        attachments: [
          {
            id: 'attachment-1',
            fileName: 'scan3d.stl',
            technicalFileName: 'scan3d.stl',
            mimeType: 'model/stl',
            sizeBytes: 1234,
            downloadUrl: 'https://signed.example/scan3d.stl',
            expiresAt: '2026-07-16T12:05:00.000Z',
          },
        ],
      },
    });

    renderPage();

    const row = await screen.findByText('Dra. Marina');
    const actionButton = within(row.closest('tr') as HTMLElement).getByRole('button', {
      name: /criar e-mail de produção externa para pedido 5a8a8eb5/i,
    });

    expect(actionButton).toHaveAccessibleName(/produção externa/i);
    fireEvent.click(actionButton);

    await waitFor(() => {
      expect(mockApiPost).toHaveBeenCalledWith(
        '/v1/admin/commerce/biteplaner/orders/5a8a8eb5-b63f-4e2a-9e77-a9d78f092333/compose-external-production-email',
        {},
        'tok'
      );
    });
    expect(mockWindowOpen).toHaveBeenCalledWith(
      expect.stringContaining('mailto:?subject=Pedido+Biteplaner+5a8a8eb5+para+produ%C3%A7%C3%A3o'),
      '_blank',
      'noopener,noreferrer'
    );
    expect(mockWindowOpen.mock.calls[0][0]).toContain('scan3d.stl');
  });
});
