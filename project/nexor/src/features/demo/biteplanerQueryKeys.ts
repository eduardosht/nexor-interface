import type { AccessMode } from './biteplanerFlow';

export const accountQueryKeys = {
  all: ['account'] as const,
  notifications: (ownerId: string) => [...accountQueryKeys.all, 'notifications', ownerId] as const,
};

export const biteplanerQueryKeys = {
  all: ['biteplaner'] as const,
  orders: (mode: AccessMode, ownerId: string) => [...biteplanerQueryKeys.all, 'orders', mode, ownerId] as const,
  reviews: (mode: AccessMode, ownerId: string) => [...biteplanerQueryKeys.all, 'reviews', mode, ownerId] as const,
  appointments: (orderId: string) => [...biteplanerQueryKeys.all, 'appointments', orderId] as const,
  workflowForms: (orderId: string) => [...biteplanerQueryKeys.all, 'workflow-forms', orderId] as const,
  workflowForm: (orderId: string, workflowFormId: string) =>
    [...biteplanerQueryKeys.workflowForms(orderId), workflowFormId] as const,
};
