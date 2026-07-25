import { describe, expect, it, vi } from 'vitest';
import { api } from '../../lib/api';
import { fetchBiteplanerDentistOrder, fetchBiteplanerDentistOrders } from './biteplanerDentistOrders.api';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn()
  }
}));

describe('biteplanerDentistOrders api', () => {
  it('fetches dentist orders from commerce account route with filters', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ orders: [] });

    await fetchBiteplanerDentistOrders('tok', {
      status: 'payment_failed',
      dateFrom: '2026-07-01',
      dateTo: '2026-07-31',
      limit: 25
    });

    expect(api.get).toHaveBeenCalledWith(
      '/v1/commerce/biteplaner/orders?status=payment_failed&dateFrom=2026-07-01&dateTo=2026-07-31&limit=25',
      'tok'
    );
  });

  it('fetches dentist order detail from commerce account route', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ order: { id: 'order-1' } });

    await fetchBiteplanerDentistOrder('order-1', 'tok');

    expect(api.get).toHaveBeenCalledWith('/v1/commerce/biteplaner/orders/order-1', 'tok');
  });
});
