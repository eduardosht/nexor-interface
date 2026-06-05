import type { AccessMode } from './orders.types';

export const orderQueryKeys = {
  all: ['biteplaner', 'orders'] as const,
  list: (mode: AccessMode, ownerId: string) => [...orderQueryKeys.all, mode, ownerId] as const,
  appointments: (orderId: string) => [...orderQueryKeys.all, orderId, 'appointments'] as const,
  timeline: (orderId: string) => [...orderQueryKeys.all, orderId, 'timeline'] as const,
  workflowForms: (orderId: string) => [...orderQueryKeys.all, orderId, 'workflow-forms'] as const,
  workflowForm: (orderId: string, workflowFormId: string) =>
    [...orderQueryKeys.workflowForms(orderId), workflowFormId] as const,
  forms: (orderId: string) => [...orderQueryKeys.all, orderId, 'forms'] as const,
  form: (orderId: string, formId: string) => [...orderQueryKeys.forms(orderId), formId] as const,
};

