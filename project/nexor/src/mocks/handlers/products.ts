import { Response } from 'miragejs';
import type { Server } from 'miragejs';
import {
  approveDentistLicenseRequest,
  approveLabLicenseRequest,
  approvePartnerRequest,
  createProductRole,
  getAccessOptions,
  getEnrollment,
  getProductRoles,
  listDentistLicenseRequests,
  listLabLicenseRequests,
  listPartnerRequests,
  rejectDentistLicenseRequest,
  rejectLabLicenseRequest,
  rejectPartnerRequest
} from '../demoState';
import { DEMO_LAB_LOCATIONS } from '../../features/demo/labLocations';

export function productHandlers(server: Server) {
  server.get('/v1/products', () => ({
    products: [
      {
        key: 'biteplaner',
        name: 'Biteplaner',
        description: 'Protetor bucal personalizado para atletas.',
        status: 'active'
      }
    ]
  }));

  server.get('/v1/account/product-enrollments', (_schema, request) => {
    const enrollment = getEnrollment({ requestHeaders: request.requestHeaders });

    return {
      enrollments: enrollment
        ?[
            {
              productKey: 'biteplaner',
              ...enrollment
            }
          ]
        : []
    };
  });

  server.get('/v1/account/product-roles', (_schema, request) => ({
    productRoles: getProductRoles({ requestHeaders: request.requestHeaders })
  }));

  server.get('/v1/products/biteplaner/enrollment', (_schema, request) => ({
    enrollment: getEnrollment({ requestHeaders: request.requestHeaders })
  }));

  server.get('/v1/products/biteplaner/access-options', (_schema, request) =>
    getAccessOptions({ requestHeaders: request.requestHeaders })
  );

  server.get('/v1/account/products/biteplaner/financial-onboarding', () => {
    return new Response(200, {}, {
      recipients: [
        {
          id: 'demo-pagarme-recipient-dentist',
          role: 'dentist',
          documentType: 'cpf',
          documentNumber: '52998224725',
          legalName: 'Dentista Demo',
          status: 'pending_data',
          providerStatus: null,
          providerErrorCode: null,
          providerErrorMessage: null,
          termsVersion: null,
          updatedAt: new Date().toISOString(),
        },
      ],
    });
  });

  server.post('/v1/account/products/biteplaner/financial-onboarding/pagarme-recipient', (_schema, request) => {
    const payload = JSON.parse(request.requestBody || '{}') as {
      role?: string;
      documentType?: 'cpf' | 'cnpj';
      documentNumber?: string;
      legalName?: string;
      termsVersion?: string;
    };

    return new Response(200, {}, {
      recipient: {
        id: `demo-pagarme-recipient-${payload.role ?? 'dentist'}`,
        role: payload.role ?? 'dentist',
        documentType: payload.documentType ?? 'cpf',
        documentNumber: payload.documentNumber ?? '52998224725',
        legalName: payload.legalName ?? 'Recebedor Demo',
        status: 'active',
        providerStatus: 'active',
        providerErrorCode: null,
        providerErrorMessage: null,
        termsVersion: payload.termsVersion ?? 'financial-v1',
        updatedAt: new Date().toISOString(),
      },
    });
  });

  server.post('/v1/account/products/biteplaner/financial-onboarding/pagarme-recipient/retry', (_schema, request) => {
    const payload = JSON.parse(request.requestBody || '{}') as {
      role?: string;
      documentType?: 'cpf' | 'cnpj';
      documentNumber?: string;
      legalName?: string;
      termsVersion?: string;
    };

    return new Response(200, {}, {
      recipient: {
        id: `demo-pagarme-recipient-${payload.role ?? 'dentist'}`,
        role: payload.role ?? 'dentist',
        documentType: payload.documentType ?? 'cpf',
        documentNumber: payload.documentNumber ?? '52998224725',
        legalName: payload.legalName ?? 'Recebedor Demo',
        status: 'active',
        providerStatus: 'active',
        providerErrorCode: null,
        providerErrorMessage: null,
        termsVersion: payload.termsVersion ?? 'financial-v1',
        updatedAt: new Date().toISOString(),
      },
    });
  });

  server.post('/v1/products/biteplaner/enroll', (_schema, request) => {
    const enrollment = getEnrollment({ requestHeaders: request.requestHeaders });
    return new Response(200, {}, { enrollment });
  });

  server.post('/v1/products/biteplaner/enrollments', (_schema, request) => {
    const enrollment = getEnrollment({ requestHeaders: request.requestHeaders });
    return new Response(200, {}, { enrollment });
  });

  server.post('/v1/account/products/biteplaner/roles/customer', (_schema, request) => {
    const productRole = createProductRole({ requestHeaders: request.requestHeaders }, 'customer', {});
    return new Response(200, {}, { productRole });
  });

  server.post('/v1/account/products/biteplaner/roles/partner', (_schema, request) => {
    const payload = JSON.parse(request.requestBody || '{}') as Record<string, unknown>;
    const productRole = createProductRole({ requestHeaders: request.requestHeaders }, 'partner', payload);
    return new Response(200, {}, { productRole });
  });

  server.post('/v1/account/products/biteplaner/roles/dentist', (_schema, request) => {
    const payload = JSON.parse(request.requestBody || '{}') as Record<string, unknown>;
    const productRole = createProductRole({ requestHeaders: request.requestHeaders }, 'dentist', payload);
    return new Response(200, {}, { productRole });
  });

  server.post('/v1/account/products/biteplaner/roles/lab', (_schema, request) => {
    const payload = JSON.parse(request.requestBody || '{}') as Record<string, unknown>;
    const productRole = createProductRole({ requestHeaders: request.requestHeaders }, 'lab', payload);
    return new Response(200, {}, { productRole });
  });

  server.get('/v1/admin/biteplaner/partner-requests', (_schema, request) => {
    const status = new URL(request.url, 'http://localhost').searchParams.get('status') ?? undefined;
    return new Response(200, {}, listPartnerRequests(status));
  });

  server.post('/v1/admin/biteplaner/partner-requests/:productRoleId/approve', (_schema, request) => {
    return new Response(200, {}, approvePartnerRequest(request.params.productRoleId));
  });

  server.post('/v1/admin/biteplaner/partner-requests/:productRoleId/reject', (_schema, request) => {
    const payload = JSON.parse(request.requestBody || '{}') as { reason?: string };
    return new Response(200, {}, rejectPartnerRequest(request.params.productRoleId, payload.reason ?? 'Recusado pela Nexor.'));
  });

  server.get('/v1/admin/biteplaner/dentist-license-requests', (_schema, request) => {
    const status = new URL(request.url, 'http://localhost').searchParams.get('status') ?? undefined;
    return new Response(200, {}, listDentistLicenseRequests(status));
  });

  server.post('/v1/admin/biteplaner/dentist-license-requests/:productRoleId/approve', (_schema, request) => {
    return new Response(200, {}, approveDentistLicenseRequest(request.params.productRoleId));
  });

  server.post('/v1/admin/biteplaner/dentists/:productRoleId/approve', (_schema, request) => {
    return new Response(200, {}, approveDentistLicenseRequest(request.params.productRoleId));
  });

  server.post('/v1/admin/biteplaner/dentist-license-requests/:productRoleId/reject', (_schema, request) => {
    const payload = JSON.parse(request.requestBody || '{}') as { reason?: string };
    return new Response(200, {}, rejectDentistLicenseRequest(request.params.productRoleId, payload.reason ?? 'Recusado pela Nexor.'));
  });

  server.post('/v1/admin/biteplaner/dentists/:productRoleId/reject', (_schema, request) => {
    const payload = JSON.parse(request.requestBody || '{}') as { reason?: string };
    return new Response(200, {}, rejectDentistLicenseRequest(request.params.productRoleId, payload.reason ?? 'Recusado pela Nexor.'));
  });

  server.get('/v1/admin/biteplaner/lab-license-requests', (_schema, request) => {
    const status = new URL(request.url, 'http://localhost').searchParams.get('status') ?? undefined;
    return new Response(200, {}, listLabLicenseRequests(status));
  });

  server.post('/v1/admin/biteplaner/lab-license-requests/:productRoleId/approve', (_schema, request) => {
    return new Response(200, {}, approveLabLicenseRequest(request.params.productRoleId));
  });

  server.post('/v1/admin/biteplaner/laboratories/:productRoleId/approve', (_schema, request) => {
    return new Response(200, {}, approveLabLicenseRequest(request.params.productRoleId));
  });

  server.post('/v1/admin/biteplaner/lab-license-requests/:productRoleId/reject', (_schema, request) => {
    const payload = JSON.parse(request.requestBody || '{}') as { reason?: string };
    return new Response(200, {}, rejectLabLicenseRequest(request.params.productRoleId, payload.reason ?? 'Recusado pela Nexor.'));
  });

  server.post('/v1/admin/biteplaner/laboratories/:productRoleId/reject', (_schema, request) => {
    const payload = JSON.parse(request.requestBody || '{}') as { reason?: string };
    return new Response(200, {}, rejectLabLicenseRequest(request.params.productRoleId, payload.reason ?? 'Recusado pela Nexor.'));
  });

  server.get('/v1/account/biteplaner/licensed-labs', () => {
    return new Response(200, {}, {
      labs: DEMO_LAB_LOCATIONS.map((lab) => ({
        id: lab.id,
        profileId: lab.profileId ?? lab.id,
        labName: lab.name,
        cnpj: lab.cnpj ?? '12.345.678/0001-90',
        professionalSummary: lab.professionalSummary ?? 'Laboratório licenciado para produção Biteplaner.',
        address: lab.address,
        cep: lab.cep,
        phone: lab.phone,
        serviceHours: lab.serviceHours ?? 'Segunda a sexta, 08:00 às 18:00',
        city: lab.city ?? 'São Paulo',
        state: lab.state ?? 'SP',
        coordinates: lab.coordinates,
      })),
    });
  });
}
