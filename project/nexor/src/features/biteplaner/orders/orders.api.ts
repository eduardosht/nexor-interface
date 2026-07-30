import { api } from '../../../lib/api';
import type {
  AccessMode,
  ClinicalFollowUpCard,
  ClinicalFollowUpKind,
  DemoAppointment,
  DemoOrderSummary,
  DemoTimelineEvent,
  DemoWorkflowForm,
  OrderFormDetail,
  OrderFormSummary,
  ProductionRequestDraft,
} from './orders.types';

export interface OrderListParams {
  status?: string | undefined;
  limit?: number | undefined;
  createdBefore?: string | undefined;
  initDate?: string | undefined;
  finalDate?: string | undefined;
}

const buildOrdersPath = (mode: AccessMode, params: OrderListParams = {}) => {
  const query = new URLSearchParams();

  if (mode !== 'admin') {
    query.set('as', mode);
  }

  if (params.status !== undefined) {
    query.set('status', params.status);
  }

  if (params.limit !== undefined) {
    query.set('limit', String(params.limit));
  }

  if (params.createdBefore !== undefined) {
    query.set('createdBefore', params.createdBefore);
  }

  if (params.initDate !== undefined) {
    query.set('initDate', params.initDate);
  }

  if (params.finalDate !== undefined) {
    query.set('finalDate', params.finalDate);
  }

  const queryString = query.toString();
  return queryString ? `/v1/orders?${queryString}` : '/v1/orders';
};

export const fetchOrders = (mode: AccessMode, token?: string, params?: OrderListParams) =>
  api.get<{ orders: DemoOrderSummary[] }>(buildOrdersPath(mode, params), token);

export const fetchOrder = (orderId: string, token?: string) =>
  api.get<DemoOrderSummary>(`/v1/orders/${orderId}`, token);

export const fetchAppointments = (orderId: string, token?: string) =>
  api.get<{ appointments: DemoAppointment[] }>(`/v1/orders/${orderId}/appointments`, token);

export const fetchClinicalFollowUps = (orderId: string, token?: string) =>
  api.get<{ followUps: ClinicalFollowUpCard[] }>(`/v1/orders/${orderId}/clinical-follow-ups`, token);

export const scheduleClinicalFollowUp = (
  orderId: string,
  kind: ClinicalFollowUpKind,
  token?: string,
  payload: { practiceLocationId?: string; scheduledAt?: string } = {},
) => api.post<{ order: DemoOrderSummary }>(
  `/v1/orders/${orderId}/clinical-follow-ups/${kind}/schedule`,
  payload,
  token,
);

export const fetchTimeline = (orderId: string, token?: string) =>
  api.get<{ events: DemoTimelineEvent[] }>(`/v1/orders/${orderId}/timeline`, token);

export const fetchWorkflowForms = (orderId: string, token?: string) =>
  api.get<{ forms: DemoWorkflowForm[] }>(`/v1/orders/${orderId}/workflow-forms`, token);

export const fetchWorkflowForm = (orderId: string, workflowFormId: string, token?: string) =>
  api.get<DemoWorkflowForm>(`/v1/orders/${orderId}/workflow-forms/${workflowFormId}`, token);

export const fetchOrderForms = (orderId: string, token?: string) =>
  api.get<{ forms: OrderFormSummary[] }>(`/v1/orders/${orderId}/forms`, token);

export const fetchOrderForm = (orderId: string, formId: string, token?: string) =>
  api.get<OrderFormDetail>(`/v1/orders/${orderId}/forms/${formId}`, token);

export const completeProductionRequest = (
  orderId: string,
  payload: ProductionRequestDraft,
  token?: string,
) => api.post<unknown>(`/v1/orders/${orderId}/forms/production-request`, { payload }, token);

export interface ProductionScanUploadIntentRequest {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256?: string | undefined;
}

export interface ProductionScanUploadIntentResponse {
  uploadId: string;
  objectKey: string;
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
}

export interface ProductionScanConfirmRequest extends ProductionScanUploadIntentRequest {
  uploadId: string;
  objectKey: string;
}

export interface ProductionScanConfirmResponse {
  fileRef: NonNullable<ProductionRequestDraft['scan3dFileRef']>;
}

export const createProductionScanUploadIntent = (
  orderId: string,
  payload: ProductionScanUploadIntentRequest,
  token?: string,
) =>
  api.post<ProductionScanUploadIntentResponse>(
    `/v1/orders/${orderId}/attachments/production-scan3d/upload-intent`,
    payload,
    token,
  );

export const confirmProductionScanUpload = (
  orderId: string,
  payload: ProductionScanConfirmRequest,
  token?: string,
) =>
  api.post<ProductionScanConfirmResponse>(
    `/v1/orders/${orderId}/attachments/production-scan3d/confirm`,
    payload,
    token,
  );

export const createProductionScanDownloadUrl = (
  orderId: string,
  fileRefId: string,
  token?: string,
) =>
  api.post<{ downloadUrl: string; expiresAt: string }>(
    `/v1/orders/${orderId}/attachments/production-scan3d/download-url`,
    { fileRefId },
    token,
  );

export const startExternalProduction = (orderId: string, token?: string) =>
  api.post<{ order: DemoOrderSummary }>(`/v1/orders/${orderId}/external-production-started`, {}, token);

export const completeExternalProduction = (orderId: string, token?: string) =>
  api.post<{ order: DemoOrderSummary }>(`/v1/orders/${orderId}/external-production-completed`, {}, token);

export const requestProductionAdjustment = (orderId: string, reason: string, token?: string) =>
  api.post<{ order: DemoOrderSummary }>(
    `/v1/orders/${orderId}/external-production-adjustment-requested`,
    { reason },
    token,
  );

export const receiveProduct = (orderId: string, token?: string) =>
  api.post<{ order: DemoOrderSummary }>(`/v1/orders/${orderId}/product-received`, {}, token);
