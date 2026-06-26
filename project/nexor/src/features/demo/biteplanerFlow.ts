import { api } from '../../lib/api';
import type { DemoPersona } from './persona';
export {
  getOrderDisplayId,
  getOrderStatusPresentation,
  getStageLabel,
  STAGE_LABELS,
  type StatusPresentation,
} from '../biteplaner/orders/orderPresenter';

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

export type ClinicalLinkSnapshot = {
  stage?: 'selection' | 'accepted' | string;
  orderId?: string;
  capturedAt?: string;
  selectedAt?: string;
  acceptedAt?: string;
  selectedByProfileId?: string | null;
  acceptedByProfileId?: string | null;
  acceptedDentistId?: string | null;
  practiceLocation?: {
    id?: string | null;
    name?: string | null;
    phone?: string | null;
    email?: string | null;
    address?: {
      street?: string | null;
      number?: string | null;
      complement?: string | null;
      district?: string | null;
      city?: string | null;
      state?: string | null;
      zipCode?: string | null;
      zip_code?: string | null;
    } | null;
  } | null;
  dentist?: {
    id?: string | null;
    fullName?: string | null;
    croNumber?: string | null;
  } | null;
};
export type DemoOrderSummary = {
  id: string;
  displayId?: string;
  display_number?: number | string | null;
  displayNumber?: number | string | null;
  checkoutOrderId?: string;
  status: string;
  statusLabel?: string;
  stage: string;
  created_at: string;
  customer_profile_id?: string | null;
  user_profile_id?: string | null;
  practice_location_id?: string | null;
  lab_profile_id?: string | null;
  labAssignments?: DemoLabAssignmentSummary[];
  labAssignmentView?: (DemoLabAssignmentSummary & { isCurrent: boolean }) | null;
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
    address?: {
      street?: string | null;
      number?: string | null;
      district?: string | null;
      city?: string | null;
      state?: string | null;
      zip_code?: string | null;
      zipCode?: string | null;
    } | null;
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
  payment?: BiteplanerPaymentSummary | null;
  paymentDetails?: BiteplanerPaymentSummary | null;
  paymentRequest?: BiteplanerPaymentRequestSummary | null;
  dentistRecommendedPurchaseConfiguration?: BiteplanerPurchaseConfiguration | null;
  purchaseConfiguration?: BiteplanerPurchaseConfiguration | null;
  clinicalLinkSnapshot?: ClinicalLinkSnapshot | null;
};

export type DemoLabAssignmentSummary = {
  id: string;
  orderId: string;
  labProfileId: string;
  sequence: number;
  status:
    | 'awaiting_acceptance'
    | 'in_production'
    | 'returned_for_adjustment'
    | 'replaced_by_other_lab'
    | 'completed'
    | 'cancelled';
  productionRequestVersionId: string | null;
  returnReason: string | null;
  assignedAt: string;
  returnedAt: string | null;
  replacedAt: string | null;
  completedAt: string | null;
};

export function getOrderClinicalPracticeLocation(order: DemoOrderSummary | null | undefined) {
  const snapshotLocation = order?.clinicalLinkSnapshot?.practiceLocation;

  if (snapshotLocation?.id || snapshotLocation?.name) {
    return {
      id: snapshotLocation.id ?? order?.practice_location_id ?? '',
      name: snapshotLocation.name ?? 'Clínica não informada',
      phone: snapshotLocation.phone ?? null,
      email: snapshotLocation.email ?? null,
      address: snapshotLocation.address ?? null,
    };
  }

  return order?.practice_location ?? null;
}

export function getOrderClinicalDentistName(order: DemoOrderSummary | null | undefined) {
  return (
    order?.clinicalLinkSnapshot?.dentist?.fullName?.trim() ||
    order?.dentist?.full_name?.trim() ||
    order?.dentist?.email?.trim() ||
    'Profissional não informado'
  );
}
export type BiteplanerPaymentSummary = {
  id?: string;
  order_id?: string;
  provider?: string;
  status?: string;
  currency?: string;
  amountCents?: number | null;
  amount_cents?: number | null;
  method?: string | null;
  paymentMethod?: string | null;
  payment_method?: string | null;
  payment_method_type?: string | null;
  paidAt?: string | null;
  paid_at?: string | null;
  confirmed_at?: string | null;
  created_at?: string | null;
  receiptEmail?: string | null;
  receipt_email?: string | null;
  discountCents?: number | null;
  discount_cents?: number | null;
  couponCode?: string | null;
  coupon_code?: string | null;
};

export type BiteplanerPaymentRequestSummary = {
  status: 'pending_admin_message' | 'message_sent' | string;
  confirmedAt?: string | null;
  messageSentAt?: string | null;
};

export type ExternalFileReference = {
  id: string;
  fileName: string;
  provider: 'simulated-external-storage';
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
};

export type ProductionRequestDraft = {
  anamnesisSummary: string;
  anamnesisDownloaded: boolean;
  productionRequestSummary: string;
  labNotes: string;
  scan3dFileName: string;
  scan3dFileRef?: ExternalFileReference | null;
  lgpdConfirmed: boolean;
  selectedLabId: string | null;
  purchaseConfiguration?: BiteplanerPurchaseConfiguration | null;
  purchaseDivergenceConfirmed?: boolean;
};

export type BiteplanerPurchaseConfiguration = {
  productKey: 'biteplaner';
  quantity: number;
  model: string;
  color: string;
};

export type CheckoutSessionRequest = {
  model: string;
  color: string;
  quantity: number;
};

export type OrderFormSummary = {
  id: string;
  order_id?: string;
  type: 'anamnesis' | 'production_request' | 'follow_up';
  version: number;
  dentist_id?: string | null;
  clinic_id?: string | null;
  practice_location_id?: string | null;
  created_at: string;
};

export type OrderFormDetail = OrderFormSummary & {
  profile_id?: string;
  payload: Record<string, unknown>;
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
  isAdapted: boolean;
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
  is_adapted?: boolean | null;
  isAdapted?: boolean | null;
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
  profileId?: string;
  name: string;
  cnpj?: string;
  professionalSummary?: string;
  address: string;
  cep: string;
  phone: string;
  serviceHours?: string;
  city?: string;
  state?: string;
  reviewScore: number;
  distanceKm: number;
  coordinates: {
    lat: number;
    lng: number;
  };
};

export type LicensedLabSelectionApiRecord = {
  id: string;
  profileId: string;
  labName: string;
  cnpj: string;
  professionalSummary: string;
  address: string;
  cep: string;
  phone: string;
  email?: string;
  serviceHours: string;
  city?: string;
  state?: string;
  coordinates?: {
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
  purpose?: string | null;
  metadata?: Record<string, unknown> | null;
};

export type ClinicalFollowUpKind = 'return_15_days' | 'return_30_days' | 'on_demand';

export type ClinicalFollowUpStatus = 'available' | 'locked' | 'scheduled' | 'completed' | 'overdue';

export type ClinicalFollowUpCard = {
  kind: ClinicalFollowUpKind;
  sequence: number;
  title: string;
  description: string;
  status: ClinicalFollowUpStatus;
  availableAt: string | null;
  scheduledAt: string | null;
  appointmentId: string | null;
  lockedReason: string | null;
};

export type DemoTimelineEvent = {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
  metadata?: Record<string, unknown> | null;
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
  status: 'pending' | 'draft' | 'submitted' | 'superseded' | 'cancelled';
  roleState?: {
    customer: 'pending' | 'submitted' | 'locked';
    dentist: 'locked' | 'pending' | 'submitted';
  };
  customerSubmittedAt?: string | null;
  dentistReviewStartedAt?: string | null;
  dentistSubmittedAt?: string | null;
  dentistId?: string | null;
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
    finishedOrders?: number;
  };
};

export type DentistLicenseRequest = {
  id: string;
  profileId: string;
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  workflowStatus: string;
  dentistName: string;
  croNumber: string;
  cnpj?: string;
  cpf?: string;
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
  cpf?: string;
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
  partnerType?: string;
  location?: {
    cep?: string;
    address?: string;
    complement?: string;
    city?: string;
    state?: string;
  } | null;
  serviceLocations?: string[];
  contactEmail: string;
  cityState: string;
  channels: string;
  submittedAt: string;
  metadata?: Record<string, unknown>;
};

export type AccountNotification = {
  id: string;
  title: string;
  message: string;
  type?: string;
  read?: boolean;
  createdAt?: string;
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

export function getAthletePrimaryOrder(orders: DemoOrderSummary[]) {
  const priority = [
    'registration_started',
    'awaiting_payment',
    'awaiting_dentist_forms',
    'ineligible_reassessment',
    'awaiting_scheduling',
    'awaiting_dentist_acceptance',
    'in_progress',
    'awaiting_lab_start',
    'lab_processing',
    'product_received_by_clinic',
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

export function isCustomerOnboardingComplete(form: DemoWorkflowForm) {
  if (form.templateKey !== 'customer_new_user_onboarding') {
    return false;
  }

  if (form.roleState) {
    return form.roleState.customer === 'submitted' || form.roleState.customer === 'locked';
  }

  return form.status === 'submitted';
}

export function hasCustomerPreConsultationIntakeReleased(forms: DemoWorkflowForm[]) {
  return forms.some((form) => form.templateKey === 'customer_pre_consultation_intake');
}

export function getEffectiveAthleteOrder(
  order: DemoOrderSummary | null,
  forms: DemoWorkflowForm[] = []
): DemoOrderSummary | null {
  const hasCompletedCustomerOnboarding = forms.some(isCustomerOnboardingComplete);
  const hasReleasedCustomerIntake = hasCustomerPreConsultationIntakeReleased(forms);

  if (
    order?.status === 'registration_started' &&
    !hasCompletedCustomerOnboarding &&
    !hasReleasedCustomerIntake
  ) {
    return {
      ...order,
      statusLabel: 'Cadastro iniciado',
      stage: 'new_user_onboarding',
    };
  }

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

  if (
    order?.status === 'registration_started' &&
    order.stage === 'new_user_onboarding' &&
    (hasCompletedCustomerOnboarding || hasReleasedCustomerIntake)
  ) {
    return {
      ...order,
      statusLabel: 'Pré-consulta pendente',
      stage: 'pre_requisite_pending',
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
    return '/painel/pre-consulta';
  }

  if (order.status === 'awaiting_scheduling' || order.status === 'ineligible_reassessment') {
    return '/painel/consulta-inicial';
  }

  if (order.status === 'awaiting_payment') {
    return '/painel/confirmacao-compra';
  }

  return '/painel/biteplaner/jornada';
}

export function getAuthToken(session: { access_token?: string } | null) {
  return session?.access_token;
}

export async function fetchAccessOptions(token?: string) {
  return api.get<AccessOptionsResponse>('/v1/products/biteplaner/access-options', token);
}

export interface OrderListParams {
  status?: string | undefined;
  limit?: number | undefined;
  createdBefore?: string | undefined;
  initDate?: string | undefined;
  finalDate?: string | undefined;
}

export async function fetchOrders(mode: AccessMode, token?: string, params: OrderListParams = {}) {
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
  const path = queryString ? `/v1/orders?${queryString}` : '/v1/orders';
  return api.get<{ orders: DemoOrderSummary[] }>(path, token);
}

export async function createBiteplanerOrder(token?: string) {
  return api.post<DemoOrderSummary>('/v1/orders', {}, token);
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

export async function markAccountNotificationRead(notificationId: string, token?: string) {
  return api.patch<{ notification: AccountNotification }>(
    `/v1/account/notifications/${notificationId}/read`,
    {},
    token
  );
}

export async function fetchLicensedLabs(token?: string) {
  return api.get<{ labs: LicensedLabSelectionApiRecord[] }>('/v1/account/biteplaner/licensed-labs', token);
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

export async function removePartnerInviteLink(inviteLinkId: string, token?: string) {
  return api.patch<{ inviteLink: PartnerOverviewResponse['inviteLinks'][number] }>(
    `/v1/partner/invite-links/${encodeURIComponent(inviteLinkId)}/remove`,
    {},
    token
  );
}

export async function fetchAppointments(orderId: string, token?: string) {
  return api.get<{ appointments: DemoAppointment[] }>(`/v1/orders/${orderId}/appointments`, token);
}

export async function fetchClinicalFollowUps(orderId: string, token?: string) {
  return api.get<{ followUps: ClinicalFollowUpCard[] }>(`/v1/orders/${orderId}/clinical-follow-ups`, token);
}

export async function scheduleClinicalFollowUp(
  orderId: string,
  kind: ClinicalFollowUpKind,
  token?: string,
  payload: { practiceLocationId?: string; scheduledAt?: string } = {},
) {
  return api.post<{ order: DemoOrderSummary }>(
    `/v1/orders/${orderId}/clinical-follow-ups/${kind}/schedule`,
    payload,
    token,
  );
}

export async function createAppointment(
  orderId: string,
  payload: { type: 'initial' | 'adaptation' | 'follow_up'; scheduledAt: string },
  token?: string
) {
  return api.post<DemoAppointment>(`/v1/orders/${orderId}/appointments`, payload, token);
}

export async function updateAppointment(
  orderId: string,
  appointmentId: string,
  payload: { status: 'scheduled' | 'rescheduled' | 'cancelled'; scheduledAt?: string; reason?: string },
  token?: string
) {
  return api.patch<DemoAppointment>(`/v1/orders/${orderId}/appointments/${appointmentId}`, payload, token);
}

export async function confirmAppointmentByUser(
  orderId: string,
  appointmentId: string,
  token?: string
) {
  const response = await api.post<{ appointment: DemoAppointment } | DemoAppointment>(
    `/v1/orders/${orderId}/appointments/${appointmentId}/user-confirmation`,
    {},
    token
  );

  return { appointment: 'appointment' in response ? response.appointment : response };
}

export async function confirmAppointmentByDentist(
  orderId: string,
  appointmentId: string,
  token?: string
) {
  const response = await api.post<{ appointment: DemoAppointment } | DemoAppointment>(
    `/v1/orders/${orderId}/appointments/${appointmentId}/dentist-confirmation`,
    {},
    token
  );

  return { appointment: 'appointment' in response ? response.appointment : response };
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

export async function fetchOrderForms(orderId: string, token?: string) {
  return api.get<{ forms: OrderFormSummary[] }>(`/v1/orders/${orderId}/forms`, token);
}

export async function fetchOrderForm(orderId: string, formId: string, token?: string) {
  return api.get<OrderFormDetail>(`/v1/orders/${orderId}/forms/${formId}`, token);
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

export async function requestOrderSupport(
  orderId: string,
  payload: { reason: string; message: string },
  token?: string
) {
  return api.post<{ accepted: true }>(`/v1/orders/${orderId}/support-requests`, payload, token);
}

export async function confirmPurchaseRequest(orderId: string, payload: CheckoutSessionRequest, token?: string) {
  return api.post<{ order: DemoOrderSummary }>(`/v1/orders/${orderId}/purchase-confirmation`, payload, token);
}

export async function markPaymentMessageSent(orderId: string, token?: string) {
  return api.post<{ order: DemoOrderSummary }>(`/v1/admin/orders/${orderId}/payment-message-sent`, {}, token);
}
export async function createCheckoutSession(orderId: string, payload: CheckoutSessionRequest, token?: string) {
  return api.post<{ url: string }>(`/v1/orders/${orderId}/checkout-session`, payload, token);
}

export async function reconcileCheckoutSession(orderId: string, sessionId: string, token?: string) {
  return api.post<{ order: DemoOrderSummary }>(
    `/v1/orders/${orderId}/checkout-session/${sessionId}/reconcile`,
    {},
    token
  );
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

export async function cancelPracticeLocationSelection(orderId: string, token?: string) {
  const order = await api.post<DemoOrderSummary>(
    `/v1/orders/${orderId}/practice-location-selection/cancel`,
    {},
    token
  );
  return { order };
}

export async function registerClinicalDecision(
  orderId: string,
  decision: 'eligible' | 'ineligible' | 'treatment_required',
  token?: string
) {
  if (decision === 'treatment_required') {
    return api.post<{ order: DemoOrderSummary }>(
      `/v1/orders/${orderId}/clinical-decision`,
      { decision },
      token
    );
  }

  const order = await api.post<DemoOrderSummary>(
    `/v1/orders/${orderId}/clinical-evaluation`,
    { outcome: decision },
    token
  );
  return { order };
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
  return api.post<unknown>(`/v1/orders/${orderId}/forms/production-request`, { payload }, token);
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

export async function completeAdaptation(orderId: string, token?: string) {
  return api.post<DemoOrderSummary>(`/v1/orders/${orderId}/adaptation-completed`, {}, token);
}
