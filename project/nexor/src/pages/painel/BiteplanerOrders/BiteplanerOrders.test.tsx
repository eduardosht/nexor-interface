import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { StrictMode } from 'react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { ThemeProvider } from 'styled-components';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { fetchBiteplanerDentistOrder, fetchBiteplanerDentistOrders } from '../../../features/commerce/biteplanerDentistOrders.api';
import type { BiteplanerDentistOrdersResponse } from '../../../features/commerce/biteplanerDentistOrders.types';
import { useAuth } from '../../../hooks/useAuth';
import { ApiError } from '../../../lib/api';
import { theme } from '../../../styles/theme';
import { BiteplanerOrders } from './BiteplanerOrders';
import { BiteplanerOrderDetail } from './BiteplanerOrderDetail';

vi.mock('../../../hooks/useAuth', () => ({
  useAuth: vi.fn(),
}));

vi.mock('../../../features/commerce/biteplanerDentistOrders.api', () => ({
  fetchBiteplanerDentistOrders: vi.fn(),
  fetchBiteplanerDentistOrder: vi.fn(),
}));

const renderPage = (initialEntry = '/painel/biteplaner/ordens') => render(
  <ThemeProvider theme={theme}>
    <MemoryRouter initialEntries={[initialEntry]}>
      <BiteplanerOrders />
    </MemoryRouter>
  </ThemeProvider>
);

const renderStrictModePage = () => render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <MemoryRouter>
        <BiteplanerOrders />
      </MemoryRouter>
    </ThemeProvider>
  </StrictMode>
);

const renderDetailPage = () => render(
  <ThemeProvider theme={theme}>
    <MemoryRouter initialEntries={['/painel/biteplaner/ordens/order-1']}>
      <Routes>
        <Route path="/painel/biteplaner/ordens/:orderId" element={<BiteplanerOrderDetail />} />
      </Routes>
    </MemoryRouter>
  </ThemeProvider>
);

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((promiseResolve) => {
    resolve = promiseResolve;
  });

  return { promise, resolve };
}


function formatDateInputValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function getExpectedDefaultDateRange() {
  const dateTo = new Date();
  const dateFrom = new Date(dateTo);
  dateFrom.setDate(dateFrom.getDate() - 30);

  return {
    dateFrom: formatDateInputValue(dateFrom),
    dateTo: formatDateInputValue(dateTo),
  };
}
describe('BiteplanerOrders', () => {
  beforeEach(() => {
    vi.mocked(useAuth).mockReturnValue({ session: { access_token: 'tok' } } as ReturnType<typeof useAuth>);
    vi.mocked(fetchBiteplanerDentistOrders).mockReset();
    vi.mocked(fetchBiteplanerDentistOrder).mockReset();
  });

  it('lists all dentist orders including pending and failed payment statuses', async () => {
    vi.mocked(fetchBiteplanerDentistOrders).mockResolvedValueOnce({
      orders: [
        { id: 'order-awaiting', status: 'awaiting_payment', paymentStatus: 'pending', shipmentStatus: null, quantity: 1, productName: 'Biteplaner', productVersionId: 'biteplaner-current', model: 'impacto', color: 'preto', currency: 'BRL', subtotalCents: 50000, totalCents: 50000, totalFormatted: 'R$ 500,00', createdAt: '2026-07-16T12:00:00.000Z', updatedAt: '2026-07-16T12:00:00.000Z', lockedAt: '2026-07-16T12:00:00.000Z' },
        { id: 'order-failed', status: 'payment_failed', paymentStatus: 'failed', shipmentStatus: null, quantity: 2, productName: 'Biteplaner', productVersionId: 'biteplaner-current', model: 'esportes', color: 'branco', currency: 'BRL', subtotalCents: 100000, totalCents: 100000, totalFormatted: 'R$ 1.000,00', createdAt: '2026-07-15T12:00:00.000Z', updatedAt: '2026-07-15T12:00:00.000Z', lockedAt: '2026-07-15T12:00:00.000Z' },
      ],
    });

    renderPage();

    expect(await screen.findByText('order-a')).toBeInTheDocument();
    expect(screen.getAllByText(/Aguardando pagamento/i)).toHaveLength(2);
    expect(screen.getAllByText(/Pagamento falhou/i)).toHaveLength(2);
    expect(screen.getByText('2x Biteplaner')).toBeInTheDocument();
    expect(screen.getAllByRole('link', { name: /ver detalhes/i }).map((link) => link.getAttribute('href'))).toEqual([
      '/painel/biteplaner/ordens/order-awaiting',
      '/painel/biteplaner/ordens/order-failed',
    ]);
  });

  it('explains the checkout return and highlights the created order', async () => {
    vi.mocked(fetchBiteplanerDentistOrders).mockResolvedValueOnce({
      orders: [
        { id: 'order-created', status: 'awaiting_payment', paymentStatus: 'pending', shipmentStatus: null, quantity: 1, productName: 'Biteplaner', productVersionId: 'biteplaner-current', model: 'impacto', color: 'preto', currency: 'BRL', subtotalCents: 137000, totalCents: 137000, totalFormatted: 'R$ 1.370,00', createdAt: '2026-08-08T12:00:00.000Z', updatedAt: '2026-08-08T12:00:00.000Z', lockedAt: null },
      ],
    });

    renderPage('/painel/biteplaner/ordens?checkout=success&orderId=order-created');

    expect(await screen.findByText(/checkout concluído/i)).toBeInTheDocument();
    expect(screen.getByText(/ordem criada: order-created/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /ver ordem criada/i })).toHaveAttribute(
      'href',
      '/painel/biteplaner/ordens/order-created'
    );
  });

  it('refreshes the order list when the user requests an updated payment status', async () => {
    vi.mocked(fetchBiteplanerDentistOrders).mockResolvedValue({ orders: [] });

    renderPage();

    await screen.findByText('Nenhuma ordem encontrada.');
    fireEvent.click(screen.getByRole('button', { name: /atualizar lista/i }));

    await waitFor(() => {
      expect(fetchBiteplanerDentistOrders).toHaveBeenCalledTimes(2);
    });
  });

  it('shows a loading table while orders are being fetched', () => {
    const request = deferred<BiteplanerDentistOrdersResponse>();
    vi.mocked(fetchBiteplanerDentistOrders).mockReturnValueOnce(request.promise);

    renderPage();

    expect(screen.getByRole('region', { name: /carregando dados/i })).toBeInTheDocument();
  });

  it('renders loaded orders inside React StrictMode', async () => {
    vi.mocked(fetchBiteplanerDentistOrders).mockResolvedValue({
      orders: [{ id: 'order-strict', status: 'paid', paymentStatus: 'paid', shipmentStatus: null, quantity: 1, productName: 'Biteplaner', productVersionId: 'biteplaner-current', model: 'impacto', color: 'preto', currency: 'BRL', subtotalCents: 50000, totalCents: 50000, totalFormatted: 'R$ 500,00', createdAt: '2026-07-16T12:00:00.000Z', updatedAt: '2026-07-16T12:00:00.000Z', lockedAt: null }],
    });

    renderStrictModePage();

    expect(await screen.findByText('order-s')).toBeInTheDocument();
    expect(screen.queryByRole('region', { name: /carregando dados/i })).not.toBeInTheDocument();
  });


  it('starts with the last 30 days as the default order period', async () => {
    vi.mocked(fetchBiteplanerDentistOrders).mockResolvedValueOnce({ orders: [] });
    const expectedRange = getExpectedDefaultDateRange();

    renderPage();

    await waitFor(() => {
      expect(fetchBiteplanerDentistOrders).toHaveBeenCalledWith(
        'tok',
        expect.objectContaining({
          dateFrom: expectedRange.dateFrom,
          dateTo: expectedRange.dateTo,
          limit: 100,
        })
      );
    });
    expect(screen.getByLabelText(/de/i)).toHaveValue(expectedRange.dateFrom);
    expect(screen.getByLabelText(/até/i)).toHaveValue(expectedRange.dateTo);
  });
  it('filters by status through the commerce route client', async () => {
    vi.mocked(fetchBiteplanerDentistOrders).mockResolvedValue({ orders: [] });

    renderPage();
    fireEvent.change(await screen.findByLabelText(/status/i), { target: { value: 'paid' } });

    await waitFor(() => {
      expect(fetchBiteplanerDentistOrders).toHaveBeenLastCalledWith('tok', expect.objectContaining({ status: 'paid', limit: 100 }));
    });
  });

  it('offers every backend order status with friendly labels', async () => {
    vi.mocked(fetchBiteplanerDentistOrders).mockResolvedValueOnce({
      orders: [
        { id: 'order-draft', status: 'draft', paymentStatus: 'not_created', shipmentStatus: null, quantity: 1, productName: 'Biteplaner', productVersionId: 'biteplaner-current', model: 'impacto', color: 'preto', currency: 'BRL', subtotalCents: 50000, totalCents: 50000, totalFormatted: 'R$ 500,00', createdAt: '2026-07-16T12:00:00.000Z', updatedAt: '2026-07-16T12:00:00.000Z', lockedAt: null },
        { id: 'order-correction', status: 'correction_requested', paymentStatus: 'paid', shipmentStatus: null, quantity: 1, productName: 'Biteplaner', productVersionId: 'biteplaner-current', model: 'impacto', color: 'preto', currency: 'BRL', subtotalCents: 50000, totalCents: 50000, totalFormatted: 'R$ 500,00', createdAt: '2026-07-16T12:00:00.000Z', updatedAt: '2026-07-16T12:00:00.000Z', lockedAt: null },
        { id: 'order-refunded', status: 'refunded', paymentStatus: 'cancelled', shipmentStatus: null, quantity: 1, productName: 'Biteplaner', productVersionId: 'biteplaner-current', model: 'impacto', color: 'preto', currency: 'BRL', subtotalCents: 50000, totalCents: 50000, totalFormatted: 'R$ 500,00', createdAt: '2026-07-16T12:00:00.000Z', updatedAt: '2026-07-16T12:00:00.000Z', lockedAt: null },
      ],
    });

    renderPage();

    const statusSelect = await screen.findByLabelText(/status/i);
    expect(within(statusSelect).getByRole('option', { name: /rascunho/i })).toHaveValue('draft');
    expect(within(statusSelect).getByRole('option', { name: /expirado/i })).toHaveValue('expired');
    expect(within(statusSelect).getByRole('option', { name: /correção solicitada/i })).toHaveValue('correction_requested');
    expect(within(statusSelect).getByRole('option', { name: /reembolsado/i })).toHaveValue('refunded');

    expect(screen.getByRole('cell', { name: /Rascunho/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /Correção solicitada/i })).toBeInTheDocument();
    expect(screen.getByRole('cell', { name: /Reembolsado/i })).toBeInTheDocument();
    expect(screen.queryByText(/correction_requested/i)).not.toBeInTheDocument();
  });

  it('filters by period through the commerce route client', async () => {
    vi.mocked(fetchBiteplanerDentistOrders).mockResolvedValue({ orders: [] });

    renderPage();
    fireEvent.change(await screen.findByLabelText(/de/i), { target: { value: '2026-07-01' } });
    fireEvent.change(screen.getByLabelText(/até/i), { target: { value: '2026-07-31' } });

    await waitFor(() => {
      expect(fetchBiteplanerDentistOrders).toHaveBeenLastCalledWith(
        'tok',
        expect.objectContaining({ dateFrom: '2026-07-01', dateTo: '2026-07-31', limit: 100 })
      );
    });
  });

  it('keeps the latest filter response when requests resolve out of order', async () => {
    const initialRequest = deferred<BiteplanerDentistOrdersResponse>();
    const paidRequest = deferred<BiteplanerDentistOrdersResponse>();
    vi.mocked(fetchBiteplanerDentistOrders)
      .mockReturnValueOnce(initialRequest.promise)
      .mockReturnValueOnce(paidRequest.promise);

    renderPage();
    fireEvent.change(await screen.findByLabelText(/status/i), { target: { value: 'paid' } });

    await waitFor(() => expect(fetchBiteplanerDentistOrders).toHaveBeenCalledTimes(2));

    paidRequest.resolve({ orders: [{ id: 'order-paid', status: 'paid', paymentStatus: 'paid', shipmentStatus: null, quantity: 1, productName: 'Paid order', productVersionId: 'biteplaner-current', model: 'impacto', color: 'preto', currency: 'BRL', subtotalCents: 50000, totalCents: 50000, totalFormatted: 'R$ 500,00', createdAt: '2026-07-16T12:00:00.000Z', updatedAt: '2026-07-16T12:00:00.000Z', lockedAt: null }] });
    expect(await screen.findByText('order-p')).toBeInTheDocument();

    initialRequest.resolve({ orders: [{ id: 'order-initial', status: 'awaiting_payment', paymentStatus: 'pending', shipmentStatus: null, quantity: 1, productName: 'Initial order', productVersionId: 'biteplaner-current', model: 'impacto', color: 'preto', currency: 'BRL', subtotalCents: 50000, totalCents: 50000, totalFormatted: 'R$ 500,00', createdAt: '2026-07-16T12:00:00.000Z', updatedAt: '2026-07-16T12:00:00.000Z', lockedAt: null }] });
    await waitFor(() => expect(screen.getByText('order-p')).toBeInTheDocument());
    expect(screen.queryByText('order-i')).not.toBeInTheDocument();
  });

  it('retries after an error', async () => {
    vi.mocked(fetchBiteplanerDentistOrders)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ orders: [] });

    renderPage();

    fireEvent.click(await screen.findByRole('button', { name: /tentar novamente/i }));
    await waitFor(() => {
      expect(fetchBiteplanerDentistOrders).toHaveBeenCalledTimes(2);
    });
    expect(screen.getByText(/nenhuma ordem/i)).toBeInTheDocument();
  });

  it('does not render legacy patient, clinic, triage or journey copy', async () => {
    vi.mocked(fetchBiteplanerDentistOrders).mockResolvedValueOnce({ orders: [] });

    renderPage();

    await screen.findByText(/nenhuma ordem/i);
    expect(screen.queryByText(/paciente/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/clínica/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/triagem/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/jornada/i)).not.toBeInTheDocument();
  });

  it('renders complete dentist order detail from the backend contract without clinical or raw operational data', async () => {
    vi.mocked(fetchBiteplanerDentistOrder).mockResolvedValueOnce({
      order: {
        id: 'order-1',
        status: 'paid',
        paymentStatus: 'paid',
        shipmentStatus: 'pending',
        quantity: 2,
        productName: 'Biteplaner',
        productVersionId: 'version-current',
        model: 'impacto',
        color: 'preto',
        currency: 'BRL',
        subtotalCents: 100000,
        totalCents: 100000,
        totalFormatted: 'R$ 1.000,00',
        createdAt: '2026-07-16T12:00:00.000Z',
        updatedAt: '2026-07-16T12:20:00.000Z',
        lockedAt: '2026-07-16T12:00:00.000Z',
        sourceApp: 'nexor_web',
        channelKey: 'nexor',
        items: [{ id: 'item-1', productKey: 'biteplaner', productVersionId: 'version-current', name: 'Biteplaner', quantity: 2, unitPriceCents: 50000, totalCents: 100000, model: 'impacto', color: 'preto', createdAt: '2026-07-16T12:00:00.000Z' }],
        charges: [{ id: 'charge-1', provider: 'asaas', status: 'paid', method: 'pix', amountCents: 100000, paidAt: '2026-07-16T12:10:00.000Z', createdAt: '2026-07-16T12:01:00.000Z' }],
        shipments: [{ id: 'shipment-1', status: 'preparing', carrier: 'Correios', trackingCode: 'BR123', trackingUrl: 'https://rastreamento.example/BR123', shippedAt: null, deliveredAt: null, createdAt: '2026-07-16T12:20:00.000Z' }],
        statusEvents: [{ id: 'event-1', fromStatus: 'paid', toStatus: 'in_production', reason: null, createdAt: '2026-07-16T12:20:00.000Z' }],
      },
    });

    renderDetailPage();

    expect(await screen.findByRole('heading', { name: /detalhe da ordem/i })).toBeInTheDocument();
    expect(screen.getAllByText('R$ 1.000,00').length).toBeGreaterThan(0);
    expect(screen.getByText(/Biteplaner/)).toBeInTheDocument();
    expect(screen.getByText('Status do pagamento')).toBeInTheDocument();
    expect(screen.getByText(/asaas/i)).toBeInTheDocument();
    expect(screen.getByText(/pix/i)).toBeInTheDocument();
    expect(screen.getByText(/Preparando/i)).toBeInTheDocument();
    expect(screen.getByText(/version-current/i)).toBeInTheDocument();
    expect(screen.getByText(/valor unitário: R\$ 500,00/i)).toBeInTheDocument();
    expect(screen.getAllByText('R$ 1.000,00').length).toBeGreaterThan(1);
    expect(screen.getByText(/Correios/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /acompanhar envio/i })).toHaveAttribute('href', 'https://rastreamento.example/BR123');
    expect(screen.queryByText(/preparing/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/forma não informada/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/paciente/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/clínica/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/triagem/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/jornada/i)).not.toBeInTheDocument();
  });

  it('renders missing backend money fields without NaN', async () => {
    vi.mocked(fetchBiteplanerDentistOrder).mockResolvedValueOnce({
      order: {
        id: 'order-1',
        status: 'paid',
        paymentStatus: 'paid',
        shipmentStatus: 'returned',
        quantity: 1,
        productName: 'Biteplaner',
        productVersionId: 'version-current',
        model: 'impacto',
        color: 'preto',
        currency: 'BRL',
        totalFormatted: 'R$ 0,00',
        createdAt: '2026-07-16T12:00:00.000Z',
        updatedAt: '2026-07-16T12:20:00.000Z',
        lockedAt: null,
        sourceApp: 'nexor_web',
        channelKey: 'nexor',
        items: [{ id: 'item-1', productKey: 'biteplaner', productVersionId: 'version-current', name: 'Biteplaner', quantity: 1, model: 'impacto', color: 'preto', createdAt: '2026-07-16T12:00:00.000Z' }],
        charges: [{ id: 'charge-1', provider: 'asaas', status: 'pending', method: 'card', paidAt: null, createdAt: '2026-07-16T12:01:00.000Z' }],
        shipments: [{ id: 'shipment-1', status: 'returned', carrier: null, trackingCode: null, trackingUrl: null, shippedAt: null, deliveredAt: null, createdAt: '2026-07-16T12:20:00.000Z' }],
        statusEvents: [],
      },
    });

    renderDetailPage();

    expect(await screen.findByText(/Devolvido/i)).toBeInTheDocument();
    expect(screen.getByText(/card/i)).toBeInTheDocument();
    expect(screen.getAllByText(/valor não informado/i).length).toBeGreaterThan(0);
    expect(screen.queryByText(/NaN/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/returned/i)).not.toBeInTheDocument();
  });

  it('shows an empty state instead of retry controls when the dentist order detail is not found', async () => {
    vi.mocked(fetchBiteplanerDentistOrder).mockRejectedValueOnce(new ApiError('not found', 404));

    renderDetailPage();

    expect(await screen.findByText('Nenhuma ordem encontrada.')).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /tentar novamente/i })).not.toBeInTheDocument();
  });

  it('omits payment date copy when a charge has no paidAt value', async () => {
    vi.mocked(fetchBiteplanerDentistOrder).mockResolvedValueOnce({
      order: {
        id: 'order-1',
        status: 'awaiting_payment',
        paymentStatus: 'pending',
        shipmentStatus: null,
        quantity: 1,
        productName: 'Biteplaner',
        productVersionId: 'biteplaner-current',
        model: 'impacto',
        color: 'preto',
        currency: 'BRL',
        subtotalCents: 50000,
        totalCents: 50000,
        totalFormatted: 'R$ 500,00',
        createdAt: '2026-07-16T12:00:00.000Z',
        updatedAt: '2026-07-16T12:00:00.000Z',
        lockedAt: null,
        sourceApp: 'nexor_web',
        channelKey: 'nexor',
        items: [],
        charges: [{ id: 'charge-1', provider: 'asaas', status: 'pending', method: 'pix', amountCents: 50000, paidAt: null, createdAt: '2026-07-16T12:01:00.000Z' }],
        shipments: [],
        statusEvents: [],
      },
    });

    renderDetailPage();

    expect(await screen.findByText(/pix/i)).toBeInTheDocument();
    expect(screen.queryByText(/pago em/i)).not.toBeInTheDocument();
  });

  it('renders optional shipment tracking fields without missing date filler text', async () => {
    vi.mocked(fetchBiteplanerDentistOrder).mockResolvedValueOnce({
      order: {
        id: 'order-1',
        status: 'shipped',
        paymentStatus: 'paid',
        shipmentStatus: 'shipped',
        quantity: 1,
        productName: 'Biteplaner',
        productVersionId: 'biteplaner-current',
        model: 'impacto',
        color: 'preto',
        currency: 'BRL',
        subtotalCents: 50000,
        totalCents: 50000,
        totalFormatted: 'R$ 500,00',
        createdAt: '2026-07-16T12:00:00.000Z',
        updatedAt: '2026-07-16T12:00:00.000Z',
        lockedAt: null,
        sourceApp: 'nexor_web',
        channelKey: 'nexor',
        items: [],
        charges: [],
        shipments: [{ id: 'shipment-1', status: 'shipped', carrier: 'Correios', trackingCode: 'BR123', trackingUrl: 'https://rastreamento.example/BR123', shippedAt: '2026-07-17T10:00:00.000Z', deliveredAt: null, createdAt: '2026-07-16T12:20:00.000Z' }],
        statusEvents: [],
      },
    });

    renderDetailPage();

    expect(await screen.findByText(/Correios/i)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /acompanhar envio/i })).toHaveAttribute('href', 'https://rastreamento.example/BR123');
    expect(screen.getByText(/enviado em 17\/07\/2026/i)).toBeInTheDocument();
    expect(screen.queryByText(/entregue em Não informado/i)).not.toBeInTheDocument();
  });

  it('retries loading a dentist order detail after an error', async () => {
    vi.mocked(fetchBiteplanerDentistOrder)
      .mockRejectedValueOnce(new Error('network'))
      .mockResolvedValueOnce({ order: { id: 'order-1', status: 'paid', paymentStatus: 'paid', shipmentStatus: null, quantity: 1, productName: 'Biteplaner', productVersionId: 'biteplaner-current', model: 'impacto', color: 'preto', currency: 'BRL', subtotalCents: 50000, totalCents: 50000, totalFormatted: 'R$ 500,00', createdAt: '2026-07-16T12:00:00.000Z', updatedAt: '2026-07-16T12:00:00.000Z', lockedAt: null, sourceApp: 'nexor_web', channelKey: 'nexor', items: [], charges: [], shipments: [], statusEvents: [] } });

    renderDetailPage();

    fireEvent.click(await screen.findByRole('button', { name: /tentar novamente/i }));
    expect(await screen.findByText('R$ 500,00')).toBeInTheDocument();
  });
});
