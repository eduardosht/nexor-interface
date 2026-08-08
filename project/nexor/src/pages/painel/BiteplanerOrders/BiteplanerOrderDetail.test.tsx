import { fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchBiteplanerDentistOrder } from '../../../features/commerce/biteplanerDentistOrders.api';
import { useAuth } from '../../../hooks/useAuth';
import { theme } from '../../../styles/theme';
import { BiteplanerOrderDetail } from './BiteplanerOrderDetail';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../features/commerce/biteplanerDentistOrders.api', () => ({
  fetchBiteplanerDentistOrder: vi.fn(),
}));

const order = (status: string) => ({
  id: 'order-1',
  status,
  paymentStatus: 'paid',
  shipmentStatus: null,
  quantity: 1,
  productName: 'Biteplaner',
  productVersionId: 'biteplaner-current',
  model: 'impacto',
  color: 'preto',
  sportCategory: 'racket_sports',
  currency: 'BRL',
  subtotalCents: 137000,
  totalCents: 137000,
  totalFormatted: 'R$ 1.370,00',
  createdAt: '2026-07-22T10:00:00.000Z',
  updatedAt: '2026-07-22T10:00:00.000Z',
  lockedAt: '2026-07-22T10:00:00.000Z',
  sourceApp: 'nexor_web',
  channelKey: 'nexor',
  items: [],
  charges: [],
  shipments: [],
  statusEvents: [],
});

const renderPage = () => render(
  <ThemeProvider theme={theme}>
    <MemoryRouter initialEntries={['/painel/biteplaner/ordens/order-1']}>
      <Routes>
        <Route path="/painel/biteplaner/ordens/:orderId" element={<BiteplanerOrderDetail />} />
      </Routes>
    </MemoryRouter>
  </ThemeProvider>
);

describe('BiteplanerOrderDetail completion CTA', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ session: { access_token: 'tok' } } as ReturnType<typeof useAuth>);
    vi.mocked(fetchBiteplanerDentistOrder).mockReset();
  });

  it('links awaiting completion orders to the completion screen', async () => {
    vi.mocked(fetchBiteplanerDentistOrder).mockResolvedValueOnce({ order: order('awaiting_order_completion') });

    renderPage();

    expect(await screen.findByRole('link', { name: /completar ordem/i }))
      .toHaveAttribute('href', '/painel/biteplaner/ordens/order-1/complemento');
  });

  it('links correction requested orders to review the completion', async () => {
    vi.mocked(fetchBiteplanerDentistOrder).mockResolvedValueOnce({ order: order('correction_requested') });

    renderPage();

    expect(await screen.findByRole('link', { name: /revisar complemento/i }))
      .toHaveAttribute('href', '/painel/biteplaner/ordens/order-1/complemento');
  });

  it('shows the payment status separately and allows a manual refresh', async () => {
    vi.mocked(fetchBiteplanerDentistOrder).mockResolvedValue({ order: order('awaiting_payment') });

    renderPage();

    expect(await screen.findByText('Status do pagamento')).toBeInTheDocument();
    expect(screen.getByText('Pago')).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: /atualizar status/i }));

    await waitFor(() => {
      expect(fetchBiteplanerDentistOrder).toHaveBeenCalledTimes(2);
    });
  });
});
