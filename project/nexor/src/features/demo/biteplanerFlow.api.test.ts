import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../lib/api';
import {
  completeProductionRequest,
  createCheckoutSession,
  confirmPayment,
  confirmPurchaseRequest,
  fetchOrders,
  markPaymentMessageSent,
  registerClinicalDecision,
  reconcileCheckoutSession,
  scheduleInitialConsultation,
  selectPracticeLocation,
  type DemoOrderSummary,
} from './biteplanerFlow';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const apiGet = vi.mocked(api.get);
const apiPost = vi.mocked(api.post);

const order: DemoOrderSummary = {
  id: 'order-1',
  status: 'awaiting_scheduling',
  stage: 'awaiting_initial_consultation',
  created_at: '2026-05-15T00:00:00.000Z',
};

describe('biteplanerFlow backend route adapters', () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
  });

  it('serializes order date range filters through the backend list route', async () => {
    apiGet.mockResolvedValue({ orders: [] });

    await fetchOrders('dentist', 'token', {
      initDate: '2026-02-01T00:00:00.000Z',
      finalDate: '2026-05-31T23:59:59.999Z',
      limit: 30,
    });

    expect(apiGet).toHaveBeenCalledWith(
      '/v1/orders?as=dentist&limit=30&initDate=2026-02-01T00%3A00%3A00.000Z&finalDate=2026-05-31T23%3A59%3A59.999Z',
      'token'
    );
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

  it('creates an Asaas checkout through the order payment route', async () => {
    apiPost.mockResolvedValue({ url: 'https://sandbox.asaas.com/checkout/test-link' });

    await expect(createCheckoutSession(order.id, { model: 'impacto', color: 'preto', quantity: 2 }, 'token')).resolves.toEqual({
      url: 'https://sandbox.asaas.com/checkout/test-link',
    });

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/payment-link',
      { model: 'impacto', color: 'preto', quantity: 2 },
      'token'
    );
  });

  it('confirms a purchase request without creating an Asaas checkout', async () => {
    apiPost.mockResolvedValue({ order: { ...order, status: 'awaiting_payment' } });

    await expect(confirmPurchaseRequest(order.id, { model: 'impacto', color: 'preto', quantity: 2 }, 'token')).resolves.toEqual({
      order: { ...order, status: 'awaiting_payment' },
    });

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/purchase-confirmation',
      { model: 'impacto', color: 'preto', quantity: 2 },
      'token'
    );
  });

  it('marks the manual payment message as sent through the admin route', async () => {
    apiPost.mockResolvedValue({ order: { ...order, paymentRequest: { status: 'message_sent' } } });

    await expect(markPaymentMessageSent(order.id, 'token')).resolves.toEqual({
      order: { ...order, paymentRequest: { status: 'message_sent' } },
    });

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/admin/orders/order-1/payment-message-sent',
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

  it('reconciles an Asaas checkout through the order payment route', async () => {
    apiPost.mockResolvedValue({ order: { id: order.id, status: 'payment_confirmed' } });

    await expect(reconcileCheckoutSession(order.id, 'cs_test_123', 'token')).resolves.toEqual({
      order: { id: order.id, status: 'payment_confirmed' },
    });

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/payment-link/cs_test_123/reconcile',
      {},
      'token'
    );
  });

  it('submits the production request through the backend clinical form route', async () => {
    const payload = {
      anamnesisSummary: 'Resumo clínico.',
      anamnesisDownloaded: true,
      productionRequestSummary: 'Solicitação preenchida.',
      opsNotes: 'Observação operacional.',
      scan3dFileName: 'scan.stl',
      lgpdConfirmed: true,
      externalProductionProviderId: 'external-provider-1',
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
