import type { CommerceBackendOrderStatus } from './commerce.types';

export const COMMERCE_BACKEND_ORDER_STATUSES = [
  'draft',
  'expired',
  'awaiting_payment',
  'payment_failed',
  'awaiting_order_completion',
  'paid',
  'technical_review',
  'correction_requested',
  'ready_for_production',
  'in_production',
  'shipped',
  'delivered',
  'completed',
  'cancelled',
  'refunded',
] as const satisfies readonly CommerceBackendOrderStatus[];

export const COMMERCE_BACKEND_ORDER_STATUS_LABELS = {
  draft: 'Rascunho',
  expired: 'Expirado',
  awaiting_payment: 'Aguardando pagamento',
  payment_failed: 'Pagamento falhou',
  awaiting_order_completion: 'Aguardando complemento da ordem',
  paid: 'Pago',
  technical_review: 'Revisão técnica',
  correction_requested: 'Correção solicitada',
  ready_for_production: 'Pronto para produção',
  in_production: 'Em produção',
  shipped: 'Enviado',
  delivered: 'Entregue',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
} as const satisfies Record<CommerceBackendOrderStatus, string>;

const STATUS_COLORS = {
  draft: 'gray',
  expired: 'crimson',
  awaiting_payment: 'goldenrod',
  payment_failed: 'crimson',
  awaiting_order_completion: 'goldenrod',
  paid: 'green',
  technical_review: 'goldenrod',
  correction_requested: 'goldenrod',
  ready_for_production: 'green',
  in_production: 'goldenrod',
  shipped: 'goldenrod',
  delivered: 'green',
  completed: 'green',
  cancelled: 'crimson',
  refunded: 'gray',
} as const satisfies Record<CommerceBackendOrderStatus, string>;

const EXTRA_STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  failed: 'Falhou',
  not_created: 'Não criado',
};

export const COMMERCE_BACKEND_ORDER_STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  ...COMMERCE_BACKEND_ORDER_STATUSES.map((status) => ({
    value: status,
    label: COMMERCE_BACKEND_ORDER_STATUS_LABELS[status],
  })),
];

export function getCommerceBackendOrderStatusLabel(status: string) {
  return COMMERCE_BACKEND_ORDER_STATUS_LABELS[status as CommerceBackendOrderStatus] ?? EXTRA_STATUS_LABELS[status] ?? status;
}

export function getCommerceBackendOrderStatusColor(status: string) {
  return STATUS_COLORS[status as CommerceBackendOrderStatus] ?? (status === 'pending' ? 'goldenrod' : status === 'failed' ? 'crimson' : 'gray');
}
