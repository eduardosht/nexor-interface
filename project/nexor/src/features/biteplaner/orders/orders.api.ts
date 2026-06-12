import { api } from '../../../lib/api';
import type {
  AccessMode,
  DemoAppointment,
  DemoOrderSummary,
  DemoTimelineEvent,
  DemoWorkflowForm,
  OrderFormDetail,
  OrderFormSummary,
  ProductionRequestDraft,
} from './orders.types';

const buildOrdersPath = (mode: AccessMode) => (mode === 'admin' ? '/v1/orders' : `/v1/orders?as=${mode}`);

export const fetchOrders = (mode: AccessMode, token?: string) =>
  api.get<{ orders: DemoOrderSummary[] }>(buildOrdersPath(mode), token);

export const fetchAppointments = (orderId: string, token?: string) =>
  api.get<{ appointments: DemoAppointment[] }>(`/v1/orders/${orderId}/appointments`, token);

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

export const startLabProduction = (orderId: string, token?: string) =>
  api.post<{ order: DemoOrderSummary }>(`/v1/orders/${orderId}/lab-production-started`, {}, token);

export const completeLabProduction = (orderId: string, token?: string) =>
  api.post<{ order: DemoOrderSummary }>(`/v1/orders/${orderId}/lab-production-completed`, {}, token);

export const returnOrderToDentist = (orderId: string, reason: string, token?: string) =>
  api.post<{ order: DemoOrderSummary }>(
    `/v1/orders/${orderId}/lab-return-for-adjustment`,
    { reason },
    token,
  );

export const receiveProduct = (orderId: string, token?: string) =>
  api.post<{ order: DemoOrderSummary }>(`/v1/orders/${orderId}/product-received`, {}, token);
