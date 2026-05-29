import { api } from '../../lib/api';
import type { DemoPersona } from './persona';

export type AccessMode = 'user' | 'partner' | 'dentist' | 'lab' | 'admin';

export type AccessOption = {
  key: AccessMode;
  label: string;
  description: string;
  allowed: boolean;
  highlighted: boolean;
  reason: string | null;
  status?: string;
};

export type AccessOptionsResponse = {
  productKey: 'biteplaner';
  defaultMode: AccessMode;
  enrollment: {
    id: string;
    status: string;
    source_type: string;
    created_at: string;
  } | null;
  modes: AccessOption[];
};

export type DemoOrderSummary = {
  id: string;
  displayId?: string;
  checkoutOrderId?: string;
  status: string;
  statusLabel?: string;
  stage: string;
  created_at: string;
  customer_profile_id?: string | null;
  user_profile_id?: string | null;
  practice_location_id?: string | null;
  customer?: {
    id?: string | null;
    full_name: string | null;
    email: string | null;
    phone: string | null;
  } | null;
  dentist?: {
    id?: string | null;
    full_name: string | null;
    email: string | null;
  } | null;
  practice_location?: {
    id: string;
    name: string;
  } | null;
  productionRequestDraft?: ProductionRequestDraft | null;
  preLabChecklistDraft?: {
    anamnesisSummary: string;
    clinicalNotes: string;
    dentalArchFileName: string;
    retentionAcknowledged: boolean;
  } | null;
  operationalReadiness?: {
    preLabReady: boolean;
    pendingItems: string[];
    summary: string;
  } | null;
};

export type ProductionRequestDraft = {
  anamnesisSummary: string;
  anamnesisDownloaded: boolean;
  productionRequestSummary: string;
  labNotes: string;
  scan3dFileName: string;
  prescriptionFileName: string;
  lgpdConfirmed: boolean;
  selectedLabId: string | null;
};

export type BiteplanerPrerequisitePayload = {
  documentType: string;
  documentNumber: string;
  sport: string;
  isMinor: boolean;
  guardianName?: string;
  guardianDocument?: string;
  eligibility: {
    orthodontic: boolean;
    activeDentalTreatment: boolean;
    relevantCondition: boolean;
  };
  consents: {
    service: boolean;
    sensitiveHealth: boolean;
    research: boolean;
    marketing: boolean;
  };
};

export type DemoPracticeLocationSelection = {
  id: string;
  name: string;
  address: string;
  cep: string;
  phone: string;
  dentistName: string;
  dentistReviewScore: number;
  distanceKm: number;
  coordinates: {
    lat: number;
    lng: number;
  };
};

export type PracticeLocationApiRecord = {
  id: string;
  name: string;
  phone: string | null;
  is_active?: boolean | null;
  address?: {
    street?: string | null;
    number?: string | null;
    complement?: string | null;
    district?: string | null;
    city?: string | null;
    state?: string | null;
    zip_code?: string | null;
    latitude?: number | null;
    longitude?: number | null;
  } | null;
  dentist?: {
    id: string;
    full_name?: string | null;
    status?: string | null;
    approval_status?: string | null;
    license_status?: string | null;
    training_status?: string | null;
  } | null;
};

export type DemoLicensedLabSelection = {
  id: string;
  name: string;
  address: string;
  cep: string;
  phone: string;
  reviewScore: number;
  distanceKm: number;
  coordinates: {
    lat: number;
    lng: number;
  };
};

export type DemoAppointment = {
  id: string;
  order_id: string;
  type: 'initial' | 'adaptation' | 'follow_up';
  status: 'scheduled' | 'rescheduled' | 'cancelled' | 'completed';
  scheduled_at: string;
  user_confirmed_at: string | null;
  dentist_confirmed_at: string | null;
};

export type DemoTimelineEvent = {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
  createdAt: string;
};

export type DemoWorkflowFormSummary = {
  scoreAverage: number | null;
  hasComment: boolean;
  responseCount: number;
  submittedAt: string | null;
  blocked?: boolean;
  blocker?: string;
  fieldCount?: number;
  deviceUsage?: string;
};

export type DemoWorkflowForm = {
  id: string;
  orderId: string;
  templateKey: string;
  stepKey: string;
  status: 'pending' | 'draft' | 'submitted';
  roleState?: {
    customer: 'pending' | 'submitted' | 'locked';
    dentist: 'locked' | 'pending' | 'submitted';
  };
  customerSubmittedAt?: string | null;
  dentistReviewStartedAt?: string | null;
  dentistSubmittedAt?: string | null;
  canViewPayload: boolean;
  summary: DemoWorkflowFormSummary | null;
  releasedAt: string;
  submittedAt: string | null;
  payload: Record<string, unknown> | null;
};

export type PartnerOverviewResponse = {
  inviteLinks: Array<{
    id: string;
    token: string;
    status: string;
    intendedCustomerName: string | null;
    intendedCustomerEmail: string | null;
    created_at: string;
    expires_at: string | null;
    consumed_at: string | null;
  }>;
  leads: Array<{
    id: string;
    partnerId: string;
    partnerLinkId: string;
    orderId: string;
    customerProfileId: string;
    customerName: string;
    customerEmail: string;
    customerPhone: string | null;
    funnelStage: string;
    statusLabel: string;
    created_at: string;
    orderStatus: string | null;
  }>;
  summary: {
    leadsCaptured: number;
    convertedToAccount: number;
    activeOrders: number;
  };
};

export type DentistLicenseRequest = {
  id: string;
  profileId: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  workflowStatus: string;
  dentistName: string;
  croNumber: string;
  professionalSummary: string;
  submittedAt: string;
  practiceLocations: Array<{
    name: string;
    address: string;
    cep: string;
    complement?: string;
    phone?: string;
    dentistName?: string;
    serviceHours: string;
    city?: string;
    state?: string;
  }>;
  metadata?: Record<string, unknown>;
};

export type LabLicenseRequest = {
  id: string;
  profileId: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  workflowStatus: string;
  labName: string;
  cnpj: string;
  professionalSummary: string;
  submittedAt: string;
  locations: Array<{
    name: string;
    address: string;
    cep: string;
    complement?: string;
    phone?: string;
    serviceHours: string;
    city?: string;
    state?: string;
  }>;
  metadata?: Record<string, unknown>;
};

export type PartnerRequest = {
  id: string;
  profileId: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  partnerName: string;
  documentType: 'cpf' | 'cnpj' | string;
  documentNumber: string;
  contactEmail: string;
  cityState: string;
  channels: string;
  submittedAt: string;
  metadata?: Record<string, unknown>;
};

export type DentistLicensingWorkflow = {
  id: string;
  status: string;
  paymentStatus: string;
  testAttempts: number;
  testPassed: boolean;
  certificateIssuedAt: string | null;
  metadata: Record<string, unknown>;
};

export type DentistLicensingCourseContent = {
  id: string;
  title: string;
  videoTitle: string;
  documentTitle: string;
};

export type AccountNotification = {
  id: string;
  title: string;
  message: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
};

export type DentistLicensingResponse = {
  workflow: DentistLicensingWorkflow | null;
  course: DentistLicensingCourseContent[];
  notifications: AccountNotification[];
};

export type LabLicensingResponse = DentistLicensingResponse;

export type StatusPresentation = {
  color: string;
  label: string;
};

export const STAGE_LABELS: Record<string, string> = {
  pre_requisite_pending: 'Pre-requisito',
  awaiting_initial_consultation: 'Consulta inicial',
  dentist_acceptance_pending: 'Aceite do dentista',
  consultation_linked: 'Consulta vinculada',
  consultation_confirmed: 'Consulta confirmada',
  awaiting_clinical_decision: 'Decisão clínica',
  awaiting_payment: 'Pagamento',
  awaiting_dentist_forms: 'Preenchimento do dentista',
  awaiting_lab_start: 'Inicio da produção',
  treatment_required: 'Tratamento prévio',
  ready_for_lab: 'Liberado para laboratório',
  lab_production: 'Laboratório',
  dentist_adjustment_required: 'Ajuste do dentista',
  product_received_by_clinic: 'Recebimento pelo dentista',
  awaiting_adaptation: 'Adaptacao',
  follow_up: 'Acompanhamento',
  closed_ineligible: 'Encerrado',
  cancelled: 'Cancelado'
};

export const PERSONA_MODE: Record<DemoPersona, AccessMode> = {
  athleteRegistered: 'user',
  athlete: 'user',
  athletePrerequisite: 'user',
  athleteScheduling: 'user',
  athletePreConsultation: 'user',
  athleteClinicalDecision: 'user',
  athleteDentistForms: 'user',
  athletePayment: 'user',
  athleteTreatmentRequired: 'user',
  athleteLabProduction: 'user',
  athleteAdaptation: 'user',
  athleteFollowUp: 'user',
  athleteIneligible: 'user',
  athleteCancelled: 'user',
  partner: 'partner',
  dentist: 'dentist',
  dentistApproved: 'dentist',
  dentistProgress: 'dentist',
  dentistLicensed: 'dentist',
  lab: 'lab',
  labApproved: 'lab',
  labProgress: 'lab',
  labLicensed: 'lab',
  admin: 'admin'
};

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', {
    dateStyle: 'short',
    timeStyle: 'short'
  }).format(new Date(value));
}

export function getStageLabel(order: DemoOrderSummary) {
  return STAGE_LABELS[order.stage] ?? order.stage;
}

export function getOrderStatusPresentation(order: Pick<DemoOrderSummary, 'status' | 'statusLabel'>): StatusPresentation {
  const label = order.statusLabel ?? order.status;

  if (
    order.status === 'registration_started' ||
    order.status === 'awaiting_scheduling' ||
    order.status === 'awaiting_dentist_acceptance' ||
    order.status === 'awaiting_payment' ||
    order.status === 'awaiting_dentist_forms' ||
    order.status === 'awaiting_lab_start' ||
    order.status === 'product_received_by_clinic' ||
    order.status === 'awaiting_adaptation' ||
    order.status === 'treatment_required'
  ) {
    return { color: '#D18A00', label };
  }

  if (order.status === 'payment_confirmed' || order.status === 'follow_up') {
    return { color: '#15803D', label };
  }

  if (order.status === 'lab_processing' || order.status === 'in_progress' || order.status === 'appointment_confirmed') {
    return { color: '#2563EB', label };
  }

  if (order.status === 'ineligible_refund' || order.status === 'cancelled') {
    return { color: '#B91C1C', label };
  }

  return { color: '#737373', label };
}

export function getAthletePrimaryOrder(orders: DemoOrderSummary[]) {
  const priority = [
    'registration_started',
    'awaiting_payment',
    'awaiting_dentist_forms',
    'awaiting_scheduling',
    'awaiting_dentist_acceptance',
    'in_progress',
    'awaiting_adaptation',
    'follow_up',
    'payment_confirmed'
  ];

  return [...orders].sort((left, right) => {
    const leftIndex = priority.indexOf(left.status);
    const rightIndex = priority.indexOf(right.status);
    return (leftIndex === -1 ? 999 : leftIndex) - (rightIndex === -1 ? 999 : rightIndex);
  })[0] ?? null;
}

export function isCustomerPreConsultationIntakeComplete(form: DemoWorkflowForm) {
  if (form.templateKey !== 'customer_pre_consultation_intake') {
    return false;
  }

  if (form.roleState) {
    return form.roleState.customer === 'submitted' || form.roleState.customer === 'locked';
  }

  return form.status === 'submitted';
}

export function getEffectiveAthleteOrder(
  order: DemoOrderSummary | null,
  forms: DemoWorkflowForm[] = []
): DemoOrderSummary | null {
  if (
    order?.status === 'registration_started' &&
    forms.some(isCustomerPreConsultationIntakeComplete)
  ) {
    return {
      ...order,
      status: 'awaiting_scheduling',
      statusLabel: 'Aguardando consulta inicial',
      stage: 'awaiting_initial_consultation',
    };
  }

  return order;
}

export function getAthleteNextPath(order: DemoOrderSummary | null) {
  if (!order) {
    return '/painel/biteplaner/jornada';
  }

  if (order.stage === 'new_user_onboarding') {
    return '/painel/biteplaner/onboarding';
  }

  if (order.status === 'registration_started' || order.stage === 'pre_requisite_pending') {
    return '/painel/pre-requisito';
  }

  if (order.status === 'awaiting_scheduling') {
    return '/painel/consulta-inicial';
  }

  if (order.status === 'awaiting_payment') {
    return '/painel/compra';
  }

  return '/painel/biteplaner/jornada';
}

export function getAuthToken(session: { access_token?: string } | null) {
  return session?.access_token;
}

export async function fetchAccessOptions(token?: string) {
  return api.get<AccessOptionsResponse>('/v1/products/biteplaner/access-options', token);
}

export async function fetchOrders(mode: AccessMode, token?: string) {
  return api.get<{ orders: DemoOrderSummary[] }>(`/v1/orders?as=${mode}`, token);
}

export async function fetchPracticeLocations(token?: string) {
  return api.get<{ practiceLocations: PracticeLocationApiRecord[] }>('/v1/practice-locations', token);
}

export async function fetchPartnerOverview(token?: string) {
  return api.get<PartnerOverviewResponse>('/v1/partner/invite-links', token);
}

export async function validatePartnerInviteToken(token: string) {
  return api.get<{
    inviteLink: {
      token: string;
      status: 'valid' | 'invalid' | 'expired' | 'consumed';
      partner: { id: string; name: string } | null;
    };
  }>(`/v1/partner-invite-links/${encodeURIComponent(token)}/validate`);
}

export async function fetchDentistLicenseRequests(token?: string, status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return api.get<{ requests: DentistLicenseRequest[] }>(
    `/v1/admin/biteplaner/dentist-license-requests${query}`,
    token
  );
}

export async function approveDentistLicenseRequest(productRoleId: string, token?: string) {
  return api.post<{ request: DentistLicenseRequest }>(
    `/v1/admin/biteplaner/dentists/${productRoleId}/approve`,
    {},
    token
  );
}

export async function rejectDentistLicenseRequest(productRoleId: string, reason: string, token?: string) {
  return api.post<{ request: DentistLicenseRequest }>(
    `/v1/admin/biteplaner/dentists/${productRoleId}/reject`,
    { reason },
    token
  );
}

export async function fetchLabLicenseRequests(token?: string, status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return api.get<{ requests: LabLicenseRequest[] }>(
    `/v1/admin/biteplaner/lab-license-requests${query}`,
    token
  );
}

export async function approveLabLicenseRequest(productRoleId: string, token?: string) {
  return api.post<{ request: LabLicenseRequest }>(
    `/v1/admin/biteplaner/laboratories/${productRoleId}/approve`,
    {},
    token
  );
}

export async function rejectLabLicenseRequest(productRoleId: string, reason: string, token?: string) {
  return api.post<{ request: LabLicenseRequest }>(
    `/v1/admin/biteplaner/laboratories/${productRoleId}/reject`,
    { reason },
    token
  );
}

export async function fetchPartnerRequests(token?: string, status?: string) {
  const query = status ? `?status=${encodeURIComponent(status)}` : '';
  return api.get<{ requests: PartnerRequest[] }>(
    `/v1/admin/biteplaner/partner-requests${query}`,
    token
  );
}

export async function approvePartnerRequest(productRoleId: string, token?: string) {
  return api.post<{ request: PartnerRequest }>(
    `/v1/admin/biteplaner/partner-requests/${productRoleId}/approve`,
    {},
    token
  );
}

export async function rejectPartnerRequest(productRoleId: string, reason: string, token?: string) {
  return api.post<{ request: PartnerRequest }>(
    `/v1/admin/biteplaner/partner-requests/${productRoleId}/reject`,
    { reason },
    token
  );
}

export async function fetchDentistLicensing(token?: string) {
  return api.get<DentistLicensingResponse>('/v1/account/biteplaner/dentist-licensing', token);
}

export async function fetchLabLicensing(token?: string) {
  return api.get<LabLicensingResponse>('/v1/account/biteplaner/lab-licensing', token);
}

export async function confirmDentistLicensingPayment(token?: string) {
  return api.post<{ workflow: DentistLicensingWorkflow }>(
    '/v1/account/biteplaner/dentist-licensing/payment-confirmed',
    {},
    token
  );
}

export async function confirmLabLicensingPayment(token?: string) {
  return api.post<{ workflow: DentistLicensingWorkflow }>(
    '/v1/account/biteplaner/lab-licensing/payment-confirmed',
    {},
    token
  );
}

export async function signDentistLicensingContract(type: 'intention' | 'licensing' | 'distrato', token?: string) {
  return api.post<{ workflow: DentistLicensingWorkflow }>(
    `/v1/account/biteplaner/dentist-licensing/contracts/${type}/sign`,
    {},
    token
  );
}

export async function signLabLicensingContract(type: 'intention' | 'licensing' | 'distrato', token?: string) {
  return api.post<{ workflow: DentistLicensingWorkflow }>(
    `/v1/account/biteplaner/lab-licensing/contracts/${type}/sign`,
    {},
    token
  );
}

export async function updateDentistLicensingCourseProgress(contentId: string, completed: boolean, token?: string) {
  return api.post<{ workflow: DentistLicensingWorkflow }>(
    '/v1/account/biteplaner/dentist-licensing/course/progress',
    { contentId, completed },
    token
  );
}

export async function updateLabLicensingCourseProgress(contentId: string, completed: boolean, token?: string) {
  return api.post<{ workflow: DentistLicensingWorkflow }>(
    '/v1/account/biteplaner/lab-licensing/course/progress',
    { contentId, completed },
    token
  );
}

export async function submitDentistLicensingTest(answers: string[], token?: string) {
  return api.post<{ workflow: DentistLicensingWorkflow }>(
    '/v1/account/biteplaner/dentist-licensing/test/submit',
    { answers },
    token
  );
}

export async function submitLabLicensingTest(answers: string[], token?: string) {
  return api.post<{ workflow: DentistLicensingWorkflow }>(
    '/v1/account/biteplaner/lab-licensing/test/submit',
    { answers },
    token
  );
}

export async function createPartnerInviteLink(
  payload: { customerName: string; customerEmail?: string },
  token?: string
) {
  return api.post<{ inviteLink: PartnerOverviewResponse['inviteLinks'][number] }>(
    '/v1/partner/invite-links',
    payload,
    token
  );
}

export async function fetchAppointments(orderId: string, token?: string) {
  return api.get<{ appointments: DemoAppointment[] }>(`/v1/orders/${orderId}/appointments`, token);
}

export async function confirmAppointmentByUser(
  orderId: string,
  appointmentId: string,
  token?: string
) {
  return api.post<{ appointment: DemoAppointment }>(
    `/v1/orders/${orderId}/appointments/${appointmentId}/user-confirmation`,
    {},
    token
  );
}

export async function confirmAppointmentByDentist(
  orderId: string,
  appointmentId: string,
  token?: string
) {
  return api.post<{ appointment: DemoAppointment }>(
    `/v1/orders/${orderId}/appointments/${appointmentId}/dentist-confirmation`,
    {},
    token
  );
}

export async function fetchTimeline(orderId: string, token?: string) {
  return api.get<{ events: DemoTimelineEvent[] }>(`/v1/orders/${orderId}/timeline`, token);
}

export async function fetchWorkflowForms(orderId: string, token?: string) {
  return api.get<{ forms: DemoWorkflowForm[] }>(`/v1/orders/${orderId}/workflow-forms`, token);
}

export async function fetchWorkflowForm(orderId: string, workflowFormId: string, token?: string) {
  return api.get<DemoWorkflowForm>(`/v1/orders/${orderId}/workflow-forms/${workflowFormId}`, token);
}

export async function submitWorkflowForm(
  orderId: string,
  workflowFormId: string,
  payload: Record<string, unknown>,
  token?: string
) {
  return api.post<DemoWorkflowForm>(
    `/v1/orders/${orderId}/workflow-forms/${workflowFormId}/submit`,
    { payload },
    token
  );
}

export async function createTrainingReport(orderId: string, token?: string) {
  return api.post<DemoWorkflowForm>(
    `/v1/orders/${orderId}/workflow-forms/training-report`,
    {},
    token
  );
}

export async function completePrerequisite(
  orderId: string,
  payload: BiteplanerPrerequisitePayload,
  token?: string
) {
  return api.post<{ order: DemoOrderSummary }>(`/v1/orders/${orderId}/prerequisite-completed`, payload, token);
}

export async function confirmPayment(orderId: string, token?: string) {
  const order = await api.post<DemoOrderSummary>(
    `/v1/admin/orders/${orderId}/payment-confirmation`,
    {},
    token
  );
  return { order };
}

export async function createCheckoutSession(orderId: string, token?: string) {
  return api.post<{ url: string }>(`/v1/orders/${orderId}/checkout-session`, {}, token);
}

export async function scheduleInitialConsultation(
  orderId: string,
  practiceLocationId: string,
  token?: string
) {
  const order = await api.post<DemoOrderSummary>(
    `/v1/orders/${orderId}/practice-location-selection`,
    { practiceLocationId },
    token
  );
  return { order };
}

export async function acceptInitialConsultation(orderId: string, token?: string) {
  return api.post<{ order: DemoOrderSummary }>(
    `/v1/orders/${orderId}/initial-consultation-accepted`,
    {},
    token
  );
}

export async function selectPracticeLocation(
  orderId: string,
  practiceLocationId: string,
  token?: string
) {
  const order = await api.post<DemoOrderSummary>(
    `/v1/orders/${orderId}/practice-location-selection`,
    { practiceLocationId },
    token
  );
  return { order };
}

export async function registerClinicalDecision(
  orderId: string,
  decision: 'eligible' | 'ineligible' | 'treatment_required',
  token?: string
) {
  return api.post<{ order: DemoOrderSummary }>(
    `/v1/orders/${orderId}/clinical-decision`,
    { decision },
    token
  );
}

export async function sendToLab(orderId: string, token?: string) {
  return api.post<{ order: DemoOrderSummary }>(`/v1/orders/${orderId}/send-to-lab`, {}, token);
}

export async function completePreLabChecklist(
  orderId: string,
  payload: {
    anamnesisSummary: string;
    clinicalNotes?: string;
    dentalArchFileName: string;
    retentionAcknowledged: boolean;
  },
  token?: string
) {
  return api.post<{ order: DemoOrderSummary }>(`/v1/orders/${orderId}/pre-lab-checklist/complete`, payload, token);
}

export async function savePreLabChecklistDraft(
  orderId: string,
  payload: {
    anamnesisSummary: string;
    clinicalNotes?: string;
    dentalArchFileName: string;
    retentionAcknowledged: boolean;
  },
  token?: string
) {
  return api.post<{ order: DemoOrderSummary }>(`/v1/orders/${orderId}/pre-lab-checklist/draft`, payload, token);
}

export async function saveProductionRequestDraft(
  orderId: string,
  payload: ProductionRequestDraft,
  token?: string
) {
  return api.post<{ order: DemoOrderSummary }>(`/v1/orders/${orderId}/production-request/draft`, payload, token);
}

export async function completeProductionRequest(
  orderId: string,
  payload: ProductionRequestDraft,
  token?: string
) {
  return api.post<{ order: DemoOrderSummary }>(`/v1/orders/${orderId}/production-request/complete`, payload, token);
}

export async function returnToDentist(orderId: string, reason: string, token?: string) {
  return api.post<{ order: DemoOrderSummary }>(
    `/v1/orders/${orderId}/lab-return-for-adjustment`,
    { reason },
    token
  );
}

export async function startLabProduction(orderId: string, token?: string) {
  return api.post<{ order: DemoOrderSummary }>(
    `/v1/orders/${orderId}/lab-production-started`,
    {},
    token
  );
}

export async function completeLabProduction(orderId: string, token?: string) {
  return api.post<{ order: DemoOrderSummary }>(
    `/v1/orders/${orderId}/lab-production-completed`,
    {},
    token
  );
}

export async function confirmProductReceived(orderId: string, token?: string) {
  return api.post<{ order: DemoOrderSummary }>(
    `/v1/orders/${orderId}/product-received`,
    {},
    token
  );
}
