export type OrderDisplaySummary = {
  id: string;
  displayId?: string;
  display_number?: number | string | null;
  displayNumber?: number | string | null;
};

export type OrderStageSummary = {
  stage: string;
};

export type OrderStatusSummary = {
  status: string;
  statusLabel?: string;
};

export type StatusPresentation = {
  color: string;
  label: string;
};

export const JOURNEY_STAGE_LABELS = [
  'Pre-requisito',
  'Consulta inicial',
  'Decisão clínica',
  'Compra',
  'Laboratório',
  'Adaptação e acompanhamento',
] as const;

export const STAGE_LABELS: Record<string, (typeof JOURNEY_STAGE_LABELS)[number]> = {
  new_user_onboarding: 'Pre-requisito',
  pre_requisite_pending: 'Pre-requisito',
  registration_started: 'Pre-requisito',
  awaiting_initial_consultation: 'Consulta inicial',
  dentist_acceptance_pending: 'Consulta inicial',
  consultation_linked: 'Consulta inicial',
  consultation_confirmed: 'Consulta inicial',
  in_progress: 'Consulta inicial',
  appointment_confirmed: 'Decisão clínica',
  awaiting_clinical_decision: 'Decisão clínica',
  treatment_required: 'Decisão clínica',
  ineligible_reassessment: 'Consulta inicial',
  awaiting_payment: 'Compra',
  payment_confirmed: 'Compra',
  awaiting_dentist_forms: 'Laboratório',
  awaiting_lab_start: 'Laboratório',
  ready_for_lab: 'Laboratório',
  lab_production: 'Laboratório',
  lab_processing: 'Laboratório',
  dentist_adjustment_required: 'Laboratório',
  product_received_by_clinic: 'Adaptação e acompanhamento',
  awaiting_adaptation: 'Adaptação e acompanhamento',
  follow_up: 'Adaptação e acompanhamento',
  completed: 'Adaptação e acompanhamento',
  cancelled: 'Adaptação e acompanhamento',
};

const STATUS_LABELS: Record<string, string> = {
  awaiting_dentist_forms: 'Aguardando envio ao laboratório',
  awaiting_lab_start: 'Aguardando aceite do laboratório',
  lab_processing: 'Em produção',
  dentist_adjustment_required: 'Ajuste de produção',
  product_received_by_clinic: 'Aguardando recebimento pelo dentista',
  awaiting_adaptation: 'Aguardando adaptação',
  ineligible_reassessment: 'Inaptidão',
  completed: 'Finalizado',
};

function formatDisplayNumber(displayNumber: number | string | null | undefined) {
  if (typeof displayNumber === 'number' && Number.isFinite(displayNumber)) {
    return `#${displayNumber}`;
  }

  if (typeof displayNumber === 'string' && /^\d+$/.test(displayNumber.trim())) {
    return `#${displayNumber.trim()}`;
  }

  return '';
}

export function getOrderDisplayId(order: OrderDisplaySummary | null | undefined) {
  if (!order) {
    return '';
  }

  if (order.displayId?.trim()) {
    return order.displayId.trim();
  }

  const displayNumber = order.display_number ?? order.displayNumber;
  return formatDisplayNumber(displayNumber) || order.id;
}

export function getStageLabel(order: OrderStageSummary) {
  return STAGE_LABELS[order.stage] ?? order.stage;
}

export function getOrderStatusPresentation(order: OrderStatusSummary): StatusPresentation {
  const label = STATUS_LABELS[order.status] ?? order.statusLabel ?? order.status;

  if (
    order.status === 'registration_started' ||
    order.status === 'awaiting_scheduling' ||
    order.status === 'awaiting_dentist_acceptance' ||
    order.status === 'awaiting_payment' ||
    order.status === 'awaiting_dentist_forms' ||
    order.status === 'awaiting_lab_start' ||
    order.status === 'dentist_adjustment_required' ||
    order.status === 'product_received_by_clinic' ||
    order.status === 'awaiting_adaptation' ||
    order.status === 'treatment_required'
  ) {
    return { color: '#D18A00', label };
  }

  if (order.status === 'payment_confirmed' || order.status === 'follow_up' || order.status === 'completed') {
    return { color: '#15803D', label };
  }

  if (order.status === 'lab_processing' || order.status === 'in_progress' || order.status === 'appointment_confirmed') {
    return { color: '#2563EB', label };
  }

  if (order.status === 'cancelled') {
    return { color: '#B91C1C', label };
  }

  if (order.status === 'ineligible_reassessment') {
    return { color: '#D18A00', label };
  }

  return { color: '#737373', label };
}
