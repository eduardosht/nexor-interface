import { afterEach, describe, expect, it, vi } from 'vitest';
import {
  approveBiteplanerAccessRequest,
  createBiteplanerCheckout,
  createBiteplanerOrder,
  finalizeBiteplanerOrderForPayment,
  getAdminCommerceSummary,
  getBiteplanerCommerceSummary,
  requestBiteplanerAccess,
  updateCommerceCatalogRequirement,
  updateCommerceCatalogVersion,
  updateCommerceFiscalRecord,
  updateCommerceOrderStatus,
  updateCommerceShipment,
} from './commerce.api';

function mockJsonResponse(body: unknown) {
  return Promise.resolve(new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  }));
}

describe('commerce api', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('requests Biteplaner access through the Nexor platform route', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      mockJsonResponse({ request: { id: 'req_1', status: 'pending' } })
    );

    await requestBiteplanerAccess('token_123');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/nexor/biteplaner/access-requests'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer token_123' }),
      })
    );
  });

  it('approves a Biteplaner access request through the admin Nexor route', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      mockJsonResponse({ grant: { id: 'grant_1', productKey: 'biteplaner', status: 'active' } })
    );

    await approveBiteplanerAccessRequest('req_1', 'admin_token');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/admin/nexor/biteplaner/access-requests/req_1/approve'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer admin_token' }),
      })
    );
  });

  it('creates a one-item Biteplaner order with quantity', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      mockJsonResponse({ order: { id: 'order_1' } })
    );

    await createBiteplanerOrder({ quantity: 3 }, 'token_123');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/nexor/biteplaner/orders'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({ quantity: 3 }),
      })
    );
  });

  it('creates a hosted Biteplaner checkout with commercial selection and callback URLs', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      mockJsonResponse({
        order: { id: 'order_1' },
        charge: {
          id: 'charge_1',
          status: 'created',
          checkoutUrl: 'https://sandbox.asaas.com/checkoutSession/show/checkout_1',
        },
      })
    );

    await createBiteplanerCheckout({
      model: 'impacto',
      color: 'preto',
      quantity: 1,
      successUrl: 'http://localhost:5173/painel/biteplaner?checkout=success',
      cancelUrl: 'http://localhost:5173/painel/biteplaner?checkout=cancel',
    }, 'token_123');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/commerce/biteplaner/checkout'),
      expect.objectContaining({
        method: 'POST',
        body: JSON.stringify({
          model: 'impacto',
          color: 'preto',
          quantity: 1,
          successUrl: 'http://localhost:5173/painel/biteplaner?checkout=success',
          cancelUrl: 'http://localhost:5173/painel/biteplaner?checkout=cancel',
        }),
      })
    );
  });

  it('finalizes the Biteplaner order before payment creation', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      mockJsonResponse({ charge: { id: 'charge_1', status: 'created' } })
    );

    const response = await finalizeBiteplanerOrderForPayment('order_1', 'token_123', 'pix');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/nexor/biteplaner/orders/order_1/finalize-payment'),
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({ Authorization: 'Bearer token_123' }),
        body: JSON.stringify({ method: 'pix' }),
      })
    );
    expect(response).toEqual({ charge: { id: 'charge_1', status: 'created' } });
  });

  it('loads the Biteplaner dentist commerce summary from the Nexor route', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      mockJsonResponse({ summary: { catalog: { productKey: 'biteplaner' } } })
    );

    await getBiteplanerCommerceSummary('token_123');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/nexor/biteplaner/commerce-summary'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer token_123' }),
      })
    );
  });

  it('loads the Nexor admin commerce summary from the admin route', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      mockJsonResponse({ summary: { catalogVersions: [], accessRequests: [], orders: [] } })
    );

    await getAdminCommerceSummary('admin_token');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/admin/nexor/commerce/summary'),
      expect.objectContaining({
        method: 'GET',
        headers: expect.objectContaining({ Authorization: 'Bearer admin_token' }),
      })
    );
  });

  it('updates catalog version price and active flag through the Nexor admin route', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      mockJsonResponse({
        catalogVersion: {
          id: 'version_1',
          productKey: 'biteplaner',
          sku: 'BITEPLANER-V1',
          name: 'Biteplaner',
          priceCents: 145000,
          currency: 'BRL',
          isActive: false,
        },
      })
    );

    const response = await updateCommerceCatalogVersion(
      'version_1',
      { priceCents: 145000, isActive: false },
      'admin_token'
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/admin/nexor/commerce/catalog/version_1'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ Authorization: 'Bearer admin_token' }),
        body: JSON.stringify({ priceCents: 145000, isActive: false }),
      })
    );
    expect(response.catalogVersion).toMatchObject({ id: 'version_1', priceCents: 145000, isActive: false });
  });

  it('updates catalog requirement settings through the Nexor admin route', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      mockJsonResponse({
        requirement: {
          id: 'requirement_1',
          requirementKey: 'upper_scan_file',
          isRequired: false,
          valueKind: 'file_ref',
        },
      })
    );

    const response = await updateCommerceCatalogRequirement(
      'requirement_1',
      { isRequired: false, valueKind: 'file_ref' },
      'admin_token'
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/admin/nexor/commerce/requirements/requirement_1'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ Authorization: 'Bearer admin_token' }),
        body: JSON.stringify({ isRequired: false, valueKind: 'file_ref' }),
      })
    );
    expect(response.requirement).toMatchObject({ id: 'requirement_1', isRequired: false });
  });

  it('updates fiscal record status through the Nexor admin route', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      mockJsonResponse({
        fiscalRecord: {
          id: 'fiscal_1',
          orderId: 'order_1',
          status: 'issued',
        },
      })
    );

    const response = await updateCommerceFiscalRecord('fiscal_1', { status: 'issued' }, 'admin_token');

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/admin/nexor/commerce/fiscal/fiscal_1'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ Authorization: 'Bearer admin_token' }),
        body: JSON.stringify({ status: 'issued' }),
      })
    );
    expect(response.fiscalRecord).toMatchObject({ id: 'fiscal_1', status: 'issued' });
  });

  it('updates shipment status and tracking through the Nexor admin route', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      mockJsonResponse({
        shipment: {
          id: 'shipment_1',
          orderId: 'order_1',
          status: 'shipped',
          carrier: 'Correios',
          trackingCode: 'BR123',
          trackingUrl: 'https://rastreamento.demo/BR123',
        },
      })
    );

    const response = await updateCommerceShipment(
      'shipment_1',
      {
        status: 'shipped',
        carrier: 'Correios',
        trackingCode: 'BR123',
        trackingUrl: 'https://rastreamento.demo/BR123',
      },
      'admin_token'
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/admin/nexor/commerce/shipments/shipment_1'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ Authorization: 'Bearer admin_token' }),
        body: JSON.stringify({
          status: 'shipped',
          carrier: 'Correios',
          trackingCode: 'BR123',
          trackingUrl: 'https://rastreamento.demo/BR123',
        }),
      })
    );
    expect(response.shipment).toMatchObject({ id: 'shipment_1', status: 'shipped' });
  });

  it('updates order status through the Nexor admin route', async () => {
    const fetchSpy = vi.spyOn(globalThis, 'fetch').mockImplementation(() =>
      mockJsonResponse({
        order: {
          id: 'order_1',
          status: 'in_production',
        },
      })
    );

    const response = await updateCommerceOrderStatus(
      'order_1',
      { status: 'in_production', reason: 'Produção iniciada' },
      'admin_token'
    );

    expect(fetchSpy).toHaveBeenCalledWith(
      expect.stringContaining('/v1/admin/nexor/commerce/orders/order_1/status'),
      expect.objectContaining({
        method: 'PATCH',
        headers: expect.objectContaining({ Authorization: 'Bearer admin_token' }),
        body: JSON.stringify({ status: 'in_production', reason: 'Produção iniciada' }),
      })
    );
    expect(response.order).toMatchObject({ id: 'order_1', status: 'in_production' });
  });
});
