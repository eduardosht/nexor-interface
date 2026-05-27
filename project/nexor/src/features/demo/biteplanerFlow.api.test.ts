import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../lib/api';
import {
  createCheckoutSession,
  confirmPayment,
  scheduleInitialConsultation,
  selectPracticeLocation,
  type DemoOrderSummary,
} from './biteplanerFlow';

vi.mock('../../lib/api', () => ({
  api: {
    post: vi.fn(),
  },
}));

const apiPost = vi.mocked(api.post);

const order: DemoOrderSummary = {
  id: 'order-1',
  status: 'awaiting_scheduling',
  stage: 'awaiting_initial_consultation',
  created_at: '2026-05-15T00:00:00.000Z',
};

describe('biteplanerFlow backend route adapters', () => {
  beforeEach(() => {
    apiPost.mockReset();
  });

  it('confirms payment through the backend admin payment confirmation route', async () => {
    apiPost.mockResolvedValue(order);

    await expect(confirmPayment(order.id, 'token')).resolves.toEqual({ order });

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/admin/orders/order-1/payment-confirmation',
      {},
      'token'
    );
  });

  it('creates a Stripe checkout session through the order checkout route', async () => {
    apiPost.mockResolvedValue({ url: 'https://checkout.stripe.test/session' });

    await expect(createCheckoutSession(order.id, 'token')).resolves.toEqual({
      url: 'https://checkout.stripe.test/session',
    });

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/checkout-session',
      {},
      'token'
    );
  });

  it('selects a practice location through the backend practice location route', async () => {
    apiPost.mockResolvedValue(order);

    await expect(selectPracticeLocation(order.id, 'practice-1', 'token')).resolves.toEqual({ order });

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/practice-location-selection',
      { practiceLocationId: 'practice-1' },
      'token'
    );
  });

  it('keeps the consultation scheduling facade on the backend practice location route', async () => {
    apiPost.mockResolvedValue(order);

    await expect(scheduleInitialConsultation(order.id, 'practice-1', 'token')).resolves.toEqual({
      order,
    });

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/practice-location-selection',
      { practiceLocationId: 'practice-1' },
      'token'
    );
  });
});
