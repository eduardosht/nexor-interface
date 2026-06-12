import type { AccessMode } from './biteplanerFlow';
import { orderQueryKeys } from '../biteplaner/orders/orderQueryKeys';

export const accountQueryKeys = {
  all: ['account'] as const,
  notifications: (ownerId: string) => [...accountQueryKeys.all, 'notifications', ownerId] as const,
};

export const biteplanerQueryKeys = {
  all: ['biteplaner'] as const,
  orders: (mode: AccessMode, ownerId: string) => orderQueryKeys.list(mode, ownerId),
  licensedLabs: (ownerId: string) => [...biteplanerQueryKeys.all, 'licensed-labs', ownerId] as const,
  reviews: (mode: AccessMode, ownerId: string) => [...biteplanerQueryKeys.all, 'reviews', mode, ownerId] as const,
  appointments: (orderId: string) => orderQueryKeys.appointments(orderId),
  workflowForms: (orderId: string) => orderQueryKeys.workflowForms(orderId),
  workflowForm: (orderId: string, workflowFormId: string) =>
    orderQueryKeys.workflowForm(orderId, workflowFormId),
  orderForms: (orderId: string) => orderQueryKeys.forms(orderId),
  orderForm: (orderId: string, formId: string) => orderQueryKeys.form(orderId, formId),
};
