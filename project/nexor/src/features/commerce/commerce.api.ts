import { api } from '../../lib/api';
import type {
  AdminCommerceSummaryResponse,
  BiteplanerAccessApprovalResponse,
  BiteplanerAccessRequestResponse,
  BiteplanerCommerceSummaryResponse,
  CommerceChargeMethod,
  CreateBiteplanerCheckoutInput,
  CreateBiteplanerCheckoutResponse,
  CreateBiteplanerOrderInput,
  CreateCommerceOrderResponse,
  FinalizeCommerceOrderResponse,
  UpdateCommerceCatalogVersionInput,
  UpdateCommerceCatalogVersionResponse,
  UpdateCommerceCatalogRequirementInput,
  UpdateCommerceCatalogRequirementResponse,
  UpdateCommerceFiscalRecordInput,
  UpdateCommerceFiscalRecordResponse,
  UpdateCommerceOrderStatusInput,
  UpdateCommerceOrderStatusResponse,
  UpdateCommerceShipmentInput,
  UpdateCommerceShipmentResponse,
} from './commerce.types';

export function getBiteplanerCommerceSummary(token: string) {
  return api.get<BiteplanerCommerceSummaryResponse>(
    '/v1/nexor/biteplaner/commerce-summary',
    token
  );
}

export function getAdminCommerceSummary(token: string) {
  return api.get<AdminCommerceSummaryResponse>(
    '/v1/admin/nexor/commerce/summary',
    token
  );
}

export function requestBiteplanerAccess(token: string) {
  return api.post<BiteplanerAccessRequestResponse>(
    '/v1/nexor/biteplaner/access-requests',
    {},
    token
  );
}

export function approveBiteplanerAccessRequest(requestId: string, token: string) {
  return api.post<BiteplanerAccessApprovalResponse>(
    `/v1/admin/nexor/biteplaner/access-requests/${requestId}/approve`,
    {},
    token
  );
}

export function updateCommerceCatalogVersion(
  versionId: string,
  input: UpdateCommerceCatalogVersionInput,
  token: string
) {
  return api.patch<UpdateCommerceCatalogVersionResponse>(
    `/v1/admin/nexor/commerce/catalog/${versionId}`,
    input,
    token
  );
}

export function updateCommerceCatalogRequirement(
  requirementId: string,
  input: UpdateCommerceCatalogRequirementInput,
  token: string
) {
  return api.patch<UpdateCommerceCatalogRequirementResponse>(
    `/v1/admin/nexor/commerce/requirements/${requirementId}`,
    input,
    token
  );
}

export function updateCommerceFiscalRecord(
  fiscalRecordId: string,
  input: UpdateCommerceFiscalRecordInput,
  token: string
) {
  return api.patch<UpdateCommerceFiscalRecordResponse>(
    `/v1/admin/nexor/commerce/fiscal/${fiscalRecordId}`,
    input,
    token
  );
}

export function updateCommerceShipment(
  shipmentId: string,
  input: UpdateCommerceShipmentInput,
  token: string
) {
  return api.patch<UpdateCommerceShipmentResponse>(
    `/v1/admin/nexor/commerce/shipments/${shipmentId}`,
    input,
    token
  );
}

export function updateCommerceOrderStatus(
  orderId: string,
  input: UpdateCommerceOrderStatusInput,
  token: string
) {
  return api.patch<UpdateCommerceOrderStatusResponse>(
    `/v1/admin/nexor/commerce/orders/${orderId}/status`,
    input,
    token
  );
}

export function createBiteplanerOrder(input: CreateBiteplanerOrderInput, token: string) {
  return api.post<CreateCommerceOrderResponse>(
    '/v1/nexor/biteplaner/orders',
    input,
    token
  );
}

export function createBiteplanerCheckout(input: CreateBiteplanerCheckoutInput, token: string) {
  return api.post<CreateBiteplanerCheckoutResponse>(
    '/v1/commerce/biteplaner/checkout',
    input,
    token
  );
}

export function finalizeBiteplanerOrderForPayment(
  orderId: string,
  token: string,
  method: CommerceChargeMethod = 'pix'
) {
  return api.post<FinalizeCommerceOrderResponse>(
    `/v1/nexor/biteplaner/orders/${orderId}/finalize-payment`,
    { method },
    token
  );
}
