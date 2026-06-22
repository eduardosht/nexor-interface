import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../../lib/api';
import {
  completeProductionRequest,
  fetchOrderForm,
  fetchOrders,
  returnOrderToDentist,
} from './orders.api';
import { orderQueryKeys } from './orderQueryKeys';

vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const apiGet = vi.mocked(api.get);
const apiPost = vi.mocked(api.post);

describe('orders api module', () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
  });

  it('keeps order route contracts close to the order domain', async () => {
    apiGet.mockResolvedValueOnce({ orders: [] }).mockResolvedValueOnce({ id: 'form-1' });

    await fetchOrders('dentist', 'tok');
    await fetchOrderForm('order-1', 'form-1', 'tok');

    expect(apiGet).toHaveBeenNthCalledWith(1, '/v1/orders?as=dentist', 'tok');
    expect(apiGet).toHaveBeenNthCalledWith(2, '/v1/orders/order-1/forms/form-1', 'tok');
  });

  it('does not send admin role through the orders query string', async () => {
    apiGet.mockResolvedValueOnce({ orders: [] });

    await fetchOrders('admin', 'tok');

    expect(apiGet).toHaveBeenCalledWith('/v1/orders', 'tok');
  });

  it('serializes bounded order list filters', async () => {
    apiGet.mockResolvedValueOnce({ orders: [] });

    await fetchOrders('dentist', 'tok', {
      status: 'awaiting_payment',
      limit: 25,
      createdBefore: '2026-06-17T12:00:00.000Z',
    });

    expect(apiGet).toHaveBeenCalledWith(
      '/v1/orders?as=dentist&status=awaiting_payment&limit=25&createdBefore=2026-06-17T12%3A00%3A00.000Z',
      'tok',
    );
  });

  it('submits production requests through the clinical form route', async () => {
    const payload = {
      anamnesisSummary: '',
      anamnesisDownloaded: false,
      productionRequestSummary: 'Solicitação de produção',
      labNotes: '',
      scan3dFileName: 'scan.zip',
      prescriptionFileName: 'prescricao.pdf',
      lgpdConfirmed: true,
      selectedLabId: 'lab-profile',
    };

    apiPost.mockResolvedValue({ id: 'form-1' });

    await completeProductionRequest('order-1', payload, 'tok');

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/forms/production-request',
      { payload },
      'tok',
    );
  });

  it('routes lab adjustment requests through the order action endpoint', async () => {
    apiPost.mockResolvedValue({ order: { id: 'order-1' } });

    await returnOrderToDentist('order-1', 'Corrigir arquivo', 'tok');

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/lab-return-for-adjustment',
      { reason: 'Corrigir arquivo' },
      'tok',
    );
  });

  it('exposes domain query keys', () => {
    expect(orderQueryKeys.list('lab', 'user-1')).toEqual(['biteplaner', 'orders', 'lab', 'user-1']);
    expect(orderQueryKeys.form('order-1', 'form-1')).toEqual([
      'biteplaner',
      'orders',
      'order-1',
      'forms',
      'form-1',
    ]);
  });
});
