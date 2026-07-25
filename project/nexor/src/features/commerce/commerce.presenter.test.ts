import { describe, expect, it } from 'vitest';
import {
  adaptAdminCommerceSummary,
  adaptBiteplanerCommerceSummary,
  canDentistBuyBiteplaner,
  getBiteplanerLicenseStatusLabel,
  getCommerceOrderStatusLabel,
  getNextDentistCommerceAction,
} from './commerce.presenter';

describe('commerce presenter', () => {
  it('allows Biteplaner purchase only when the professional profile is complete and the license is active', () => {
    expect(canDentistBuyBiteplaner(true, 'active')).toBe(true);
    expect(canDentistBuyBiteplaner(false, 'active')).toBe(false);
    expect(canDentistBuyBiteplaner(true, 'pending')).toBe(false);
    expect(canDentistBuyBiteplaner(true, 'none')).toBe(false);
    expect(canDentistBuyBiteplaner(true, 'revoked')).toBe(false);
  });

  it('maps commerce statuses to operational labels without clinical journey language', () => {
    expect(getCommerceOrderStatusLabel('draft')).toBe('Rascunho');
    expect(getCommerceOrderStatusLabel('locked')).toBe('Pedido travado');
    expect(getCommerceOrderStatusLabel('awaiting_payment')).toBe('Aguardando pagamento');
    expect(getCommerceOrderStatusLabel('paid')).toBe('Pagamento confirmado');
    expect(getCommerceOrderStatusLabel('in_fulfillment')).toBe('Em operação');
    expect(getCommerceOrderStatusLabel('completed')).toBe('Concluído');
    expect(getCommerceOrderStatusLabel('cancelled')).toBe('Cancelado');
  });

  it('maps Biteplaner license statuses to concise admin labels', () => {
    expect(getBiteplanerLicenseStatusLabel('none')).toBe('Sem licença');
    expect(getBiteplanerLicenseStatusLabel('pending')).toBe('Licença em análise');
    expect(getBiteplanerLicenseStatusLabel('active')).toBe('Licenciado');
    expect(getBiteplanerLicenseStatusLabel('revoked')).toBe('Licença revogada');
  });

  it('chooses the next dentist action from profile and license state', () => {
    expect(getNextDentistCommerceAction({ profileComplete: false, licenseStatus: 'none' })).toEqual({
      label: 'Completar perfil',
      kind: 'complete_profile',
      enabled: true,
    });
    expect(getNextDentistCommerceAction({ profileComplete: true, licenseStatus: 'none' })).toEqual({
      label: 'Solicitar licença',
      kind: 'request_license',
      enabled: true,
    });
    expect(getNextDentistCommerceAction({ profileComplete: true, licenseStatus: 'pending' })).toEqual({
      label: 'Licença em análise',
      kind: 'wait_license',
      enabled: false,
    });
    expect(getNextDentistCommerceAction({ profileComplete: true, licenseStatus: 'active' })).toEqual({
      label: 'Comprar Biteplaner',
      kind: 'buy_biteplaner',
      enabled: true,
    });
  });

  it('adapts the backend Biteplaner summary to the dentist UI state', () => {
    const state = adaptBiteplanerCommerceSummary({
      summary: {
        profile: {
          profileId: 'profile-1',
          professionalProfileId: 'professional-1',
          fullName: 'Dra. Marina Azevedo',
          email: 'marina@nexor.demo',
          registrationNumber: '123456',
          registrationState: 'SP',
          isComplete: true,
          hasLocation: true,
        },
        license: { status: 'active', request: null },
        catalog: {
          id: 'version-1',
          productKey: 'biteplaner',
          sku: 'BITEPLANER-V1',
          name: 'Biteplaner',
          priceCents: 137000,
          currency: 'BRL',
          isActive: true,
        },
        requirements: [
          { id: 'req-scan', requirementKey: 'upper_scan_file', isRequired: true, valueKind: 'file_ref' },
        ],
        orders: [
          {
            id: 'order-1',
            salesChannelKey: 'nexor',
            status: 'awaiting_payment',
            totalCents: 137000,
            currency: 'BRL',
            items: [{ id: 'item-1', productKey: 'biteplaner', quantity: 1 }],
          },
        ],
      },
    });

    expect(state.profile).toMatchObject({
      fullName: 'Dra. Marina Azevedo',
      cro: 'SP-123456',
      profileComplete: true,
    });
    expect(state.license.status).toBe('active');
    expect(state.activeCatalog.requirements).toEqual(['Escaneamento superior']);
    expect(state.orders[0]).toMatchObject({
      orderNumber: 'order-1',
      productName: 'Biteplaner',
      quantity: 1,
      status: 'awaiting_payment',
    });
  });

  it('adapts the backend admin summary to the admin UI state', () => {
    const state = adaptAdminCommerceSummary({
      summary: {
        catalogVersions: [
          {
            id: 'version-1',
            productKey: 'biteplaner',
            sku: 'BITEPLANER-V1',
            name: 'Biteplaner',
            priceCents: 137000,
            currency: 'BRL',
            isActive: true,
            requirements: [
              { id: 'req-upper', requirementKey: 'upper_scan_file', isRequired: true, valueKind: 'file_ref' },
            ],
          },
        ],
        accessRequests: [
          {
            id: 'access-1',
            productKey: 'biteplaner',
            profileId: 'profile-1',
            status: 'submitted',
            submittedAt: '2026-07-15T09:00:00.000Z',
            applicant: {
              fullName: 'Dr. Lucas Pereira',
              email: 'lucas@nexor.demo',
              registrationNumber: '998877',
              registrationState: 'RJ',
            },
          },
        ],
        orders: [],
        charges: [
          {
            id: 'charge-1',
            orderId: 'order-1',
            provider: 'asaas',
            method: 'pix',
            status: 'created',
            amountCents: 137000,
            currency: 'BRL',
          },
        ],
        attachments: [],
        fiscalRecords: [],
        shipments: [
          {
            id: 'shipment-1',
            orderId: 'order-1',
            status: 'preparing',
            carrier: null,
            trackingCode: null,
            trackingUrl: null,
          },
        ],
      },
    });

    expect(state.accessRequests[0]).toEqual({
      id: 'access-1',
      dentistName: 'Dr. Lucas Pereira',
      email: 'lucas@nexor.demo',
      cro: 'RJ-998877',
      requestedAt: '2026-07-15T09:00:00.000Z',
      status: 'pending',
    });
    expect(state.catalogVersions[0]).toMatchObject({ productKey: 'biteplaner', active: true });
    expect(state.catalogVersions[0]?.requirements).toEqual(['Escaneamento superior']);
    expect(state.catalogVersions[0]?.requirementDetails?.[0]).toMatchObject({
      id: 'req-upper',
      label: 'Escaneamento superior',
      isRequired: true,
      valueKind: 'file_ref',
    });
    expect(state.charges[0]).toMatchObject({ id: 'charge-1', provider: 'asaas', method: 'pix' });
    expect(state.shipments[0]).toMatchObject({ id: 'shipment-1', orderId: 'order-1', status: 'preparing' });
  });

  it('keeps inactive catalog versions inactive in the admin UI state', () => {
    const state = adaptAdminCommerceSummary({
      summary: {
        catalogVersions: [
          {
            id: 'version-1',
            productKey: 'biteplaner',
            sku: 'BITEPLANER-V1',
            name: 'Biteplaner',
            priceCents: 137000,
            currency: 'BRL',
            isActive: false,
          },
        ],
        accessRequests: [],
        orders: [],
        charges: [],
        attachments: [],
        fiscalRecords: [],
        shipments: [],
      },
    });

    expect(state.catalogVersions[0]).toMatchObject({ productKey: 'biteplaner', active: false });
  });

  it('adapts backend fiscal records to the admin UI state', () => {
    const state = adaptAdminCommerceSummary({
      summary: {
        catalogVersions: [],
        accessRequests: [],
        orders: [],
        charges: [],
        attachments: [],
        fiscalRecords: [
          {
            id: 'fiscal-1',
            orderId: 'order-1',
            status: 'pending',
          },
        ],
        shipments: [],
      },
    });

    expect(state.fiscalRecords).toEqual([
      {
        id: 'fiscal-1',
        orderId: 'order-1',
        status: 'pending',
      },
    ]);
  });

  it('preserves reviewed technical attachment statuses in the admin UI state', () => {
    const state = adaptAdminCommerceSummary({
      summary: {
        catalogVersions: [],
        accessRequests: [],
        orders: [],
        charges: [],
        attachments: [
          {
            id: 'attachment-approved',
            orderId: 'order-1',
            originalFileName: 'scan-aprovado.stl',
            status: 'approved',
          },
          {
            id: 'attachment-rejected',
            orderId: 'order-2',
            originalFileName: 'scan-rejeitado.stl',
            status: 'rejected',
          },
        ],
        fiscalRecords: [],
        shipments: [],
      },
    });

    expect(state.attachments.map((attachment) => attachment.status)).toEqual(['approved', 'rejected']);
  });

  it('adapts awaiting order completion as a paid fulfillment order', () => {
    const state = adaptBiteplanerCommerceSummary({
      summary: {
        profile: null,
        license: { status: 'active', request: null },
        catalog: {
          id: 'version-1',
          productKey: 'biteplaner',
          sku: 'BITEPLANER-V1',
          name: 'Biteplaner',
          priceCents: 137000,
          currency: 'BRL',
          isActive: true,
        },
        requirements: [],
        orders: [
          {
            id: 'order-completion',
            salesChannelKey: 'nexor',
            status: 'awaiting_order_completion',
            totalCents: 137000,
            currency: 'BRL',
            items: [{ id: 'item-1', productKey: 'biteplaner', quantity: 1 }],
          },
        ],
      },
    });

    expect(state.orders[0]).toMatchObject({
      status: 'in_fulfillment',
      paymentStatus: 'paid',
    });
  });
  it('marks post-payment fulfillment order statuses as paid in the admin UI state', () => {
    const state = adaptAdminCommerceSummary({
      summary: {
        catalogVersions: [],
        accessRequests: [],
        orders: [
          {
            id: 'order-shipped',
            salesChannelKey: 'nexor',
            status: 'shipped',
            totalCents: 137000,
            currency: 'BRL',
            items: [{ id: 'item-1', productKey: 'biteplaner', quantity: 1 }],
          },
          {
            id: 'order-delivered',
            salesChannelKey: 'nexor',
            status: 'delivered',
            totalCents: 137000,
            currency: 'BRL',
            items: [{ id: 'item-2', productKey: 'biteplaner', quantity: 1 }],
          },
        ],
        charges: [],
        attachments: [],
        fiscalRecords: [],
        shipments: [],
      },
    });

    expect(state.orders.map((order) => order.paymentStatus)).toEqual(['paid', 'paid']);
  });
});
