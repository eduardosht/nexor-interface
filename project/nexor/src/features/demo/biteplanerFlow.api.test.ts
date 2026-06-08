import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../lib/api';
import {
  completeProductionRequest,
  createCheckoutSession,
  confirmPayment,
  registerClinicalDecision,
  reconcileCheckoutSession,
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

  it('reconciles a Stripe checkout session through the order checkout route', async () => {
    apiPost.mockResolvedValue({ order: { id: order.id, status: 'payment_confirmed' } });

    await expect(reconcileCheckoutSession(order.id, 'cs_test_123', 'token')).resolves.toEqual({
      order: { id: order.id, status: 'payment_confirmed' },
    });

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/checkout-session/cs_test_123/reconcile',
      {},
      'token'
    );
  });

  it('submits the production request through the backend clinical form route', async () => {
    const payload = {
      anamnesisSummary: 'Resumo clínico.',
      anamnesisDownloaded: true,
      productionRequestSummary: 'Solicitação preenchida.',
      labNotes: 'Observação operacional.',
      scan3dFileName: 'scan.stl',
      prescriptionFileName: 'prescricao.pdf',
      lgpdConfirmed: true,
      selectedLabId: 'lab-1',
    };
    apiPost.mockResolvedValue({ id: 'form-1' });

    await expect(completeProductionRequest(order.id, payload, 'token')).resolves.toEqual({ id: 'form-1' });

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/forms/production-request',
      { payload },
      'token'
    );
  });

  it('registers clinical eligibility through the backend clinical evaluation route', async () => {
    apiPost.mockResolvedValue(order);

    await expect(registerClinicalDecision(order.id, 'eligible', 'token')).resolves.toEqual({ order });

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/clinical-evaluation',
      { outcome: 'eligible' },
      'token'
    );
  });
});
