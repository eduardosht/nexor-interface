// Stable key for the login/auth demo flow. Mock handlers read this directly so
// the UI can switch personas without inventing a parallel session contract.
export const ACTIVE_DEMO_PERSONA_STORAGE_KEY = 'nexor_demo_persona';
const DEMO_STRIPE_CHECKOUT_ORDER_ID =
  import.meta.env.VITE_DEMO_STRIPE_CHECKOUT_ORDER_ID?.trim() || '00000000-0000-4000-8000-000000000005';

export type DemoPersona =
  | 'athleteRegistered'
  | 'athlete'
  | 'athletePrerequisite'
  | 'athleteScheduling'
  | 'athletePreConsultation'
  | 'athleteClinicalDecision'
  | 'athleteDentistForms'
  | 'athletePayment'
  | 'athleteTreatmentRequired'
  | 'athleteLabProduction'
  | 'athleteAdaptation'
  | 'athleteFollowUp'
  | 'athleteIneligible'
  | 'athleteCancelled'
  | 'partner'
  | 'dentist'
  | 'dentistApproved'
  | 'dentistProgress'
  | 'dentistLicensed'
  | 'lab'
  | 'labApproved'
  | 'labProgress'
  | 'labLicensed'
  | 'admin';
export type AccessMode = 'user' | 'partner' | 'dentist' | 'lab' | 'admin';

type RequestContext = {
  requestHeaders?: Headers | Record<string, string | null | undefined>;
};

type EnrollmentPayload = {
  id: string;
  status: string;
  source_type: string;
  created_at: string;
};

type AccessOption = {
  key: AccessMode;
  label: string;
  description: string;
  allowed: boolean;
  highlighted: boolean;
  reason: string | null;
  status?: 'available' | 'missing' | 'pending' | 'active' | 'rejected' | 'suspended';
};

type AccessPayload = {
  productKey: 'biteplaner';
  defaultMode: AccessMode;
  enrollment: EnrollmentPayload | null;
  modes: AccessOption[];
};

type DemoSession = {
  id: string;
  persona: DemoPersona;
  accessToken: string;
  userId: string;
};

type DemoUser = {
  id: string;
  authUserId: string;
  profileId: string;
  fullName: string;
  email: string;
  phone: string | null;
  roles: string[];
  clinicIds: string[];
  dentistId: string | null;
  partnerId: string | null;
  labId: string | null;
  persona?: DemoPersona;
  defaultMode?: AccessMode;
  allowedModes?: AccessMode[];
  productRoles?: ProductRolePayload[];
  enrollment?: EnrollmentPayload | null;
};

type ProductRolePayload = {
  id: string;
  productKey: 'biteplaner';
  role: 'customer' | 'partner' | 'dentist' | 'lab';
  status: 'pending' | 'active' | 'rejected' | 'suspended';
  metadata: Record<string, unknown>;
  createdAt: string;
  updatedAt: string;
};

type DentistLicensingWorkflow = {
  id: string;
  profileId: string;
  productRoleId: string;
  dentistId: string | null;
  status: string;
  paymentStatus: string;
  testAttempts: number;
  testPassed: boolean;
  certificateIssuedAt: string | null;
  metadata: Record<string, unknown>;
};

type AccountNotification = {
  id: string;
  scope?: 'global' | 'profile';
  profileId: string | null;
  title: string;
  message: string;
  type: string;
  read: boolean;
  readAt?: string | null;
  readAtByProfileId?: Record<string, string>;
  metadata?: Record<string, unknown>;
  createdAt: string;
};

type DemoPartnerLink = {
  id: string;
  partnerId: string;
  token: string;
  status: 'active' | 'expired' | 'consumed';
  intendedCustomerName: string | null;
  intendedCustomerEmail: string | null;
  created_at: string;
  expires_at: string | null;
  consumed_at: string | null;
};

type DemoLead = {
  id: string;
  partnerId: string;
  partnerLinkId: string;
  orderId: string;
  customerProfileId: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string | null;
  funnelStage: 'lead_captured' | 'account_created' | 'pre_requisite_completed' | 'order_advanced';
  statusLabel: string;
  created_at: string;
};

type DemoPracticeLocation = {
  id: string;
  name: string;
};

type DemoCustomerSummary = {
  id: string;
  full_name: string;
  email: string;
  phone: string | null;
};

type DemoOrder = {
  id: string;
  checkoutOrderId?: string;
  status: string;
  statusLabel: string;
  stage: string;
  created_at: string;
  customer_profile_id: string;
  user_profile_id: string;
  practice_location_id: string;
  customer: DemoCustomerSummary;
  practice_location: DemoPracticeLocation;
  partnerId: string | null;
  dentistId: string | null;
  labId: string | null;
  visibleTo: DemoPersona[];
  nextActions: string[];
  prerequisiteSubmission?: {
    documentType: string;
    documentNumberMasked: string;
    sport: string;
    isMinor: boolean;
    guardianPresent: boolean;
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
  } | null;
  productionRequestDraft: {
    anamnesisSummary: string;
    anamnesisDownloaded: boolean;
    productionRequestSummary: string;
    labNotes: string;
    scan3dFileName: string;
    prescriptionFileName: string;
    lgpdConfirmed: boolean;
    selectedLabId: string | null;
  } | null;
  preLabChecklistDraft: {
    anamnesisSummary: string;
    clinicalNotes: string;
    dentalArchFileName: string;
    retentionAcknowledged: boolean;
  } | null;
  flags: {
    preRequisiteComplete: boolean;
    eligible: boolean | null;
    paymentConfirmed: boolean;
    productionFormCompleted: boolean;
    initialEvaluationCompleted: boolean;
    retentionAcknowledged: boolean;
    dentalArchFileAttached: boolean;
    sentToLab: boolean;
    productReceived: boolean;
  };
};

type DemoAppointment = {
  id: string;
  order_id: string;
  type: 'initial' | 'adaptation' | 'follow_up';
  status: 'scheduled' | 'rescheduled' | 'cancelled' | 'completed';
  scheduled_at: string;
  user_confirmed_at: string | null;
  dentist_confirmed_at: string | null;
};

type DemoOrderForm = {
  id: string;
  orderId: string;
  type: 'anamnesis' | 'production_request' | 'follow_up';
  version: number;
  created_at: string;
  dentist_id: string | null;
  clinic_id: string | null;
  practice_location_id: string | null;
};

type DemoWorkflowSummary = {
  scoreAverage: number | null;
  hasComment: boolean;
  responseCount: number;
  submittedAt: string | null;
  blocked?: boolean;
  blocker?: string;
  fieldCount?: number;
  deviceUsage?: string;
};

type DemoWorkflowForm = {
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
  summary: DemoWorkflowSummary | null;
  releasedAt: string;
  submittedAt: string | null;
  payload: Record<string, unknown> | null;
};

type DemoWorkflowVersion = {
  id: string;
  workflowFormId: string;
  submissionId: string;
  revision: number;
  payload: Record<string, unknown> | null;
  summary: DemoWorkflowSummary | null;
  changeReason: string | null;
  createdAt: string;
};

type DemoTimelineEvent = {
  id: string;
  orderId: string;
  fromStatus: string | null;
  toStatus: string;
  reason: string | null;
  createdAt: string;
};

type DemoState = {
  sessions: DemoSession[];
  users: DemoUser[];
  partnerLinks: DemoPartnerLink[];
  leads: DemoLead[];
  orders: DemoOrder[];
  appointments: DemoAppointment[];
  workflowForms: DemoWorkflowForm[];
  workflowFormVersions: DemoWorkflowVersion[];
  orderForms: DemoOrderForm[];
  timelineEvents: DemoTimelineEvent[];
  dentistLicensingWorkflows: DentistLicensingWorkflow[];
  notifications: AccountNotification[];
  counters: {
    consultationLinks: number;
    partnerLinks: number;
    timeline: number;
    workflowVersions: number;
    dentistLicensing: number;
    notifications: number;
  };
};

type AppointmentAction =
  | { type: 'user-confirmation'; appointmentId: string }
  | { type: 'dentist-confirmation'; appointmentId: string }
  | { type: 'complete-match'; appointmentId: string }
  | { type: 'no-show'; appointmentId: string; reason?: string };

type WorkflowAction =
  | { type: 'submit-workflow-form'; workflowFormId: string; payload: Record<string, unknown> }
  | { type: 'create-training-report' }
  | {
      type: 'revise-workflow-form';
      workflowFormId: string;
      payload: Record<string, unknown>;
      changeReason?: string;
    };

type OrderStatusAction =
  | {
      type: 'complete-prerequisite';
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
    }
  | { type: 'confirm-payment' }
  | { type: 'select-practice-location'; practiceLocationId: string }
  | { type: 'schedule-initial-consultation'; practiceLocationId: string }
  | { type: 'accept-initial-consultation' }
  | { type: 'product-received' }
  | { type: 'adaptation-completed' }
  | {
      type: 'save-production-request-draft';
      anamnesisSummary: string;
      anamnesisDownloaded: boolean;
      productionRequestSummary: string;
      labNotes: string;
      scan3dFileName: string;
      prescriptionFileName: string;
      lgpdConfirmed: boolean;
      selectedLabId: string | null;
    }
  | {
      type: 'complete-production-request';
      anamnesisSummary: string;
      anamnesisDownloaded: boolean;
      productionRequestSummary: string;
      labNotes: string;
      scan3dFileName: string;
      prescriptionFileName: string;
      lgpdConfirmed: boolean;
      selectedLabId: string | null;
    }
  | {
      type: 'save-pre-lab-checklist-draft';
      anamnesisSummary: string;
      clinicalNotes?: string;
      dentalArchFileName: string;
      retentionAcknowledged: boolean;
    }
  | {
      type: 'complete-pre-lab-checklist';
      anamnesisSummary: string;
      clinicalNotes?: string;
      dentalArchFileName: string;
      retentionAcknowledged: boolean;
    }
  | { type: 'send-to-lab' }
  | { type: 'lab-production-started' }
  | { type: 'lab-return-for-adjustment'; reason?: string }
  | { type: 'lab-production-completed' }
  | { type: 'register-clinical-decision'; decision: 'eligible' | 'ineligible' | 'treatment_required'; reason?: string };

export type DemoOrderAction = AppointmentAction | WorkflowAction | OrderStatusAction;

type OrderSummary = Omit<
  DemoOrder,
  'visibleTo' | 'nextActions' | 'flags' | 'partnerId' | 'dentistId' | 'labId' | 'stage'
> & {
  stage: string;
  dentist: {
    id: string;
    full_name: string;
    email: string;
  } | null;
  operationalReadiness: {
    preLabReady: boolean;
    pendingItems: string[];
    summary: string;
  };
};

function maskDocument(value: string) {
  const normalized = value.replace(/\s+/g, '').trim();

  if (normalized.length <= 4) {
    return '****';
  }

  return `${'*'.repeat(Math.max(4, normalized.length - 4))}${normalized.slice(-4)}`;
}

function sanitizeOpenText(value: unknown, maxLength = 500) {
  if (typeof value !== 'string') {
    return value;
  }

  return value.trim().slice(0, maxLength);
}

function sanitizeWorkflowPayload(payload: Record<string, unknown>) {
  return Object.fromEntries(
    Object.entries(payload).map(([key, value]) => [key, sanitizeOpenText(value)])
  );
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function getWorkflowPayloadSection(payload: Record<string, unknown> | null, key: 'customer' | 'dentist') {
  const section = payload?.[key];
  return isRecord(section) ? section : {};
}

function consentAccepted(value: unknown) {
  return Array.isArray(value) ? value.includes('accepted') : value === true || value === 'accepted';
}

function isUnderageByBirthDate(value: unknown, referenceDate = new Date()) {
  if (typeof value !== 'string') {
    return false;
  }

  const normalized = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  const brazilian = value.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  const year = normalized ? Number(normalized[1]) : brazilian ? Number(brazilian[3]) : null;
  const month = normalized ? Number(normalized[2]) : brazilian ? Number(brazilian[2]) : null;
  const day = normalized ? Number(normalized[3]) : brazilian ? Number(brazilian[1]) : null;

  if (year === null || month === null || day === null) {
    return false;
  }

  let age = referenceDate.getFullYear() - year;
  const birthdayAlreadyHappened =
    referenceDate.getMonth() + 1 > month ||
    (referenceDate.getMonth() + 1 === month && referenceDate.getDate() >= day);

  if (!birthdayAlreadyHappened) {
    age -= 1;
  }

  return age < 18;
}

function summarizeCustomerNewUserOnboarding(payload: Record<string, unknown>, submittedAt: string, responseCount: number) {
  const summary = createWorkflowSummary(payload, submittedAt, responseCount);

  if (!consentAccepted(payload.privacyConsent)) {
    return { ...summary, blocked: true, blocker: 'privacy_consent_required' };
  }

  if (isUnderageByBirthDate(payload.birthDate) || payload.isMinor === 'yes' || payload.isMinor === true) {
    return { ...summary, blocked: true, blocker: 'minor_without_guardian' };
  }

  return { ...summary, blocked: false, fieldCount: Object.keys(payload).length };
}

function summarizeCustomerTrainingReport(payload: Record<string, unknown>, submittedAt: string, responseCount: number) {
  return {
    ...createWorkflowSummary(payload, submittedAt, responseCount),
    deviceUsage: typeof payload.deviceUsage === 'string' ? payload.deviceUsage : undefined,
    fieldCount: Object.keys(payload).length
  };
}

const PERSONA_MODE: Record<DemoPersona, AccessMode> = {
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

const MODE_LABELS: Record<AccessMode, string> = {
  user: 'Cliente',
  partner: 'Parceiro',
  dentist: 'Dentista',
  lab: 'Laboratório',
  admin: 'Admin'
};

const MODE_DESCRIPTIONS: Record<AccessMode, string> = {
  user: 'Acompanhe sua jornada e seus pedidos do Biteplaner.',
  partner: 'Acompanhe a captação e a evolucao comercial dos seus indicados.',
  dentist: 'Gerencie consultas, decisoes clínicas e formulários operacionais.',
  lab: 'Acompanhe a fila produtiva e devolucoes do laboratório.',
  admin: 'Vejá o pipeline transversal da demo compartilhada do Biteplaner.'
};

const DEFAULT_PERSONA: DemoPersona = 'athlete';

const CUSTOMER_STAGE_PERSONAS: Array<{
  persona: DemoPersona;
  orderId: string;
  fullName: string;
  email: string;
}> = [
  {
    persona: 'athletePrerequisite',
    orderId: 'BP-DEMO-001',
    fullName: 'Cliente Pre-requisito',
    email: 'cliente.prerequisito@nexor.dev'
  },
  {
    persona: 'athleteScheduling',
    orderId: 'BP-DEMO-002',
    fullName: 'Cliente Selecao Clinica',
    email: 'cliente.selecao.clinica@nexor.dev'
  },
  {
    persona: 'athletePreConsultation',
    orderId: 'BP-DEMO-003',
    fullName: 'Cliente Pre-consulta Clinica',
    email: 'cliente.preconsulta@nexor.dev'
  },
  {
    persona: 'athleteClinicalDecision',
    orderId: 'BP-DEMO-014',
    fullName: 'Cliente Decisao Clinica',
    email: 'cliente.decisao@nexor.dev'
  },
  {
    persona: 'athleteDentistForms',
    orderId: 'BP-DEMO-004',
    fullName: 'Cliente Formularios Dentista',
    email: 'cliente.formularios@nexor.dev'
  },
  {
    persona: 'athletePayment',
    orderId: 'BP-DEMO-005',
    fullName: 'Cliente Pagamento',
    email: 'cliente.pagamento@nexor.dev'
  },
  {
    persona: 'athleteTreatmentRequired',
    orderId: 'BP-DEMO-006',
    fullName: 'Cliente Tratamento Previo',
    email: 'cliente.tratamento@nexor.dev'
  },
  {
    persona: 'athleteLabProduction',
    orderId: 'BP-DEMO-007',
    fullName: 'Cliente Laboratorio',
    email: 'cliente.laboratorio@nexor.dev'
  },
  {
    persona: 'athleteAdaptation',
    orderId: 'BP-DEMO-008',
    fullName: 'Cliente Adaptacao',
    email: 'cliente.adaptacao@nexor.dev'
  },
  {
    persona: 'athleteFollowUp',
    orderId: 'BP-DEMO-009',
    fullName: 'Cliente Acompanhamento',
    email: 'cliente.acompanhamento@nexor.dev'
  },
  {
    persona: 'athleteIneligible',
    orderId: 'BP-DEMO-010',
    fullName: 'Cliente Encerrado Inapto',
    email: 'cliente.inapto@nexor.dev'
  },
  {
    persona: 'athleteCancelled',
    orderId: 'BP-DEMO-011',
    fullName: 'Cliente Cancelado',
    email: 'cliente.cancelado@nexor.dev'
  }
];

const CUSTOMER_STAGE_ORDER_BY_PERSONA = CUSTOMER_STAGE_PERSONAS.reduce<Partial<Record<DemoPersona, string>>>(
  (accumulator, item) => {
    accumulator[item.persona] = item.orderId;
    return accumulator;
  },
  {}
);

const DEMO_PRACTICE_LOCATION_CATALOG: Record<string, DemoPracticeLocation> = {
  'practice-demo-001': {
    id: 'practice-demo-001',
    name: 'Clínica Esportiva Nexor'
  },
  'practice-demo-003': {
    id: 'practice-demo-003',
    name: 'Instituto Paulistano de Odontologia Esportiva'
  },
  'practice-demo-004': {
    id: 'practice-demo-004',
    name: 'Centro Integrado de Performance Bucal'
  }
};

const DEMO_DENTIST_BY_PRACTICE_LOCATION: Record<string, string> = {
  'practice-demo-001': 'dentist-demo-001',
  'practice-demo-003': 'dentist-demo-001',
  'practice-demo-004': 'dentist-demo-001'
};

export class DemoStateError extends Error {
  status: number;
  code: string;

  constructor(status: number, code: string, message: string) {
    super(message);
    this.name = 'DemoStateError';
    this.status = status;
    this.code = code;
  }
}

function createCustomerStageSession(item: (typeof CUSTOMER_STAGE_PERSONAS)[number]): DemoSession {
  return {
    id: `demo-session-${item.persona}`,
    persona: item.persona,
    accessToken: `demo-${item.persona}-token`,
    userId: `demo-user-${item.persona}`
  };
}

function createCustomerStageUser(item: (typeof CUSTOMER_STAGE_PERSONAS)[number]): DemoUser {
  return {
    id: `demo-user-${item.persona}`,
    authUserId: `demo-auth-${item.persona}`,
    profileId: `demo-profile-${item.persona}`,
    fullName: item.fullName,
    email: item.email,
    phone: '11999990100',
    roles: ['customer'],
    clinicIds: [],
    dentistId: null,
    partnerId: null,
    labId: null,
    persona: item.persona,
    defaultMode: 'user',
    allowedModes: ['user'],
    enrollment: {
      id: `demo-enrollment-${item.persona}`,
      status: 'active',
      source_type: 'internal_demo',
      created_at: '2026-05-01T09:00:00.000Z'
    }
  };
}

const seedState = (): DemoState => ({
  sessions: [
    { id: 'demo-session-athlete-registered', persona: 'athleteRegistered', accessToken: 'demo-athleteRegistered-token', userId: 'demo-user-athlete-registered' },
    { id: 'demo-session-athlete', persona: 'athlete', accessToken: 'demo-athlete-token', userId: 'demo-user-athlete' },
    ...CUSTOMER_STAGE_PERSONAS.map(createCustomerStageSession),
    { id: 'demo-session-partner', persona: 'partner', accessToken: 'demo-partner-token', userId: 'demo-user-partner' },
    { id: 'demo-session-dentist', persona: 'dentist', accessToken: 'demo-dentist-token', userId: 'demo-user-dentist' },
    { id: 'demo-session-dentist-approved', persona: 'dentistApproved', accessToken: 'demo-dentistApproved-token', userId: 'demo-user-dentist-approved' },
    { id: 'demo-session-dentist-progress', persona: 'dentistProgress', accessToken: 'demo-dentistProgress-token', userId: 'demo-user-dentist-progress' },
    { id: 'demo-session-dentist-licensed', persona: 'dentistLicensed', accessToken: 'demo-dentistLicensed-token', userId: 'demo-user-dentist-licensed' },
    { id: 'demo-session-lab', persona: 'lab', accessToken: 'demo-lab-token', userId: 'demo-user-lab' },
    { id: 'demo-session-lab-approved', persona: 'labApproved', accessToken: 'demo-labApproved-token', userId: 'demo-user-lab-approved' },
    { id: 'demo-session-lab-progress', persona: 'labProgress', accessToken: 'demo-labProgress-token', userId: 'demo-user-lab-progress' },
    { id: 'demo-session-lab-licensed', persona: 'labLicensed', accessToken: 'demo-labLicensed-token', userId: 'demo-user-lab-licensed' },
    { id: 'demo-session-admin', persona: 'admin', accessToken: 'demo-admin-token', userId: 'demo-user-admin' }
  ],
  users: [
    {
      id: 'demo-user-athlete-registered',
      authUserId: 'demo-auth-athleteRegistered',
      profileId: 'demo-profile-athlete-registered',
      fullName: 'Cliente Apenas Cadastrado',
      email: 'cliente.cadastrado@nexor.dev',
      phone: '11999990017',
      roles: [],
      clinicIds: [],
      dentistId: null,
      partnerId: null,
      labId: null,
      persona: 'athleteRegistered',
      defaultMode: 'user',
      allowedModes: ['user'],
      productRoles: [],
      enrollment: null
    },
    {
      id: 'demo-user-athlete',
      authUserId: 'demo-auth-athlete',
      profileId: 'demo-profile-athlete',
      fullName: 'Joao Demo',
      email: 'atleta.demo@nexor.dev',
      phone: '11999990001',
      roles: ['customer'],
      clinicIds: [],
      dentistId: null,
      partnerId: null,
      labId: null,
      persona: 'athlete',
      defaultMode: 'user',
      allowedModes: ['user'],
      enrollment: {
        id: 'demo-enrollment-athlete',
        status: 'active',
        source_type: 'partner_link',
        created_at: '2026-05-01T09:00:00.000Z'
      }
    },
    ...CUSTOMER_STAGE_PERSONAS.map(createCustomerStageUser),
    {
      id: 'demo-user-partner',
      authUserId: 'demo-auth-partner',
      profileId: 'demo-profile-partner',
      fullName: 'Paula Parceira',
      email: 'parceiro.demo@nexor.dev',
      phone: '11999990002',
      roles: ['partner'],
      clinicIds: [],
      dentistId: null,
      partnerId: 'partner-demo-001',
      labId: null,
      persona: 'partner',
      defaultMode: 'partner',
      allowedModes: ['partner'],
      enrollment: {
        id: 'demo-enrollment-partner',
        status: 'active',
        source_type: 'internal_demo',
        created_at: '2026-05-01T09:10:00.000Z'
      }
    },
    {
      id: 'demo-user-dentist',
      authUserId: 'demo-auth-dentist',
      profileId: 'demo-profile-dentist',
      fullName: 'Dr. Rafael Demo',
      email: 'dentista.demo@nexor.dev',
      phone: '11999990003',
      roles: ['dentist'],
      clinicIds: ['practice-demo-001'],
      dentistId: 'dentist-demo-001',
      partnerId: null,
      labId: null,
      persona: 'dentist',
      defaultMode: 'dentist',
      allowedModes: ['dentist'],
      enrollment: {
        id: 'demo-enrollment-dentist',
        status: 'active',
        source_type: 'internal_demo',
        created_at: '2026-05-01T09:20:00.000Z'
      }
    },
    {
      id: 'demo-user-dentist-approved',
      authUserId: 'demo-auth-dentistApproved',
      profileId: 'demo-profile-dentist-approved',
      fullName: 'Dra. Laura Aprovada',
      email: 'dentista.aprovada@nexor.dev',
      phone: '11999990010',
      roles: ['dentist'],
      clinicIds: ['practice-demo-003'],
      dentistId: 'dentist-demo-approved',
      partnerId: null,
      labId: null,
      persona: 'dentistApproved',
      defaultMode: 'dentist',
      allowedModes: ['dentist'],
      productRoles: [
        {
          id: 'demo-product-role-dentist-approved',
          productKey: 'biteplaner',
          role: 'dentist',
          status: 'active',
          metadata: {
            fullName: 'Dra. Laura Aprovada',
            croNumber: 'CRO-SP 77881',
            professionalSummary: 'Atendimento esportivo e acompanhamento preventivo.'
          },
          createdAt: '2026-05-08T09:00:00.000Z',
          updatedAt: '2026-05-08T09:30:00.000Z'
        }
      ],
      enrollment: {
        id: 'demo-enrollment-dentist-approved',
        status: 'active',
        source_type: 'internal_demo',
        created_at: '2026-05-08T09:30:00.000Z'
      }
    },
    {
      id: 'demo-user-dentist-progress',
      authUserId: 'demo-auth-dentistProgress',
      profileId: 'demo-profile-dentist-progress',
      fullName: 'Dr. Caio Em Progresso',
      email: 'dentista.progresso@nexor.dev',
      phone: '11999990011',
      roles: ['dentist'],
      clinicIds: ['practice-demo-004'],
      dentistId: 'dentist-demo-progress',
      partnerId: null,
      labId: null,
      persona: 'dentistProgress',
      defaultMode: 'dentist',
      allowedModes: ['dentist'],
      productRoles: [
        {
          id: 'demo-product-role-dentist-progress',
          productKey: 'biteplaner',
          role: 'dentist',
          status: 'active',
          metadata: {
            fullName: 'Dr. Caio Em Progresso',
            croNumber: 'CRO-SP 88117',
            professionalSummary: 'Odontologia esportiva com foco em qualidade operacional.'
          },
          createdAt: '2026-05-07T09:00:00.000Z',
          updatedAt: '2026-05-07T10:00:00.000Z'
        }
      ],
      enrollment: {
        id: 'demo-enrollment-dentist-progress',
        status: 'active',
        source_type: 'internal_demo',
        created_at: '2026-05-07T10:00:00.000Z'
      }
    },
    {
      id: 'demo-user-dentist-licensed',
      authUserId: 'demo-auth-dentistLicensed',
      profileId: 'demo-profile-dentist-licensed',
      fullName: 'Dra. Helena Licenciada',
      email: 'dentista.licenciada@nexor.dev',
      phone: '11999990012',
      roles: ['dentist'],
      clinicIds: ['practice-demo-001'],
      dentistId: 'dentist-demo-licensed',
      partnerId: null,
      labId: null,
      persona: 'dentistLicensed',
      defaultMode: 'dentist',
      allowedModes: ['dentist'],
      productRoles: [
        {
          id: 'demo-product-role-dentist-licensed',
          productKey: 'biteplaner',
          role: 'dentist',
          status: 'active',
          metadata: {
            fullName: 'Dra. Helena Licenciada',
            croNumber: 'CRO-SP 99001',
            professionalSummary: 'Dentista licenciada Biteplaner para operação completa.'
          },
          createdAt: '2026-05-02T09:00:00.000Z',
          updatedAt: '2026-05-02T11:00:00.000Z'
        }
      ],
      enrollment: {
        id: 'demo-enrollment-dentist-licensed',
        status: 'active',
        source_type: 'internal_demo',
        created_at: '2026-05-02T11:00:00.000Z'
      }
    },
    {
      id: 'demo-user-lab',
      authUserId: 'demo-auth-lab',
      profileId: 'demo-profile-lab',
      fullName: 'Lab Demo',
      email: 'laboratorio.demo@nexor.dev',
      phone: '11999990004',
      roles: ['lab'],
      clinicIds: [],
      dentistId: null,
      partnerId: null,
      labId: 'lab-demo-001',
      persona: 'lab',
      defaultMode: 'lab',
      allowedModes: ['lab'],
      productRoles: [
        {
          id: 'demo-product-role-lab',
          productKey: 'biteplaner',
          role: 'lab',
          status: 'active',
          metadata: {
            labName: 'Lab Demo',
            cnpj: '75.865.311/0001-02',
            professionalSummary: 'Laboratório licenciado Biteplaner para operação produtiva.'
          },
          createdAt: '2026-05-01T09:00:00.000Z',
          updatedAt: '2026-05-01T09:30:00.000Z'
        }
      ],
      enrollment: {
        id: 'demo-enrollment-lab',
        status: 'active',
        source_type: 'internal_demo',
        created_at: '2026-05-01T09:30:00.000Z'
      }
    },
    {
      id: 'demo-user-lab-approved',
      authUserId: 'demo-auth-labApproved',
      profileId: 'demo-profile-lab-approved',
      fullName: 'Lab Aprovado Demo',
      email: 'laboratorio.aprovado@nexor.dev',
      phone: '11999990013',
      roles: ['lab'],
      clinicIds: [],
      dentistId: null,
      partnerId: null,
      labId: 'lab-demo-approved',
      persona: 'labApproved',
      defaultMode: 'lab',
      allowedModes: ['lab'],
      productRoles: [
        {
          id: 'demo-product-role-lab-approved',
          productKey: 'biteplaner',
          role: 'lab',
          status: 'active',
          metadata: {
            labName: 'Lab Aprovado Demo',
            cnpj: '19.131.243/0001-97',
            professionalSummary: 'Laboratório aprovado para iniciar pagamento do licenciamento.',
            locations: [
              {
                name: 'Unidade Central',
                cep: '01001-000',
                address: 'Praca da Se - Se, São Paulo - SP',
                city: 'São Paulo',
                state: 'SP',
                phone: '(11) 3000-1000',
                serviceHours: 'Segunda a sexta, 8h as 18h'
              }
            ]
          },
          createdAt: '2026-05-08T09:00:00.000Z',
          updatedAt: '2026-05-08T09:30:00.000Z'
        }
      ],
      enrollment: {
        id: 'demo-enrollment-lab-approved',
        status: 'active',
        source_type: 'internal_demo',
        created_at: '2026-05-08T09:30:00.000Z'
      }
    },
    {
      id: 'demo-user-lab-progress',
      authUserId: 'demo-auth-labProgress',
      profileId: 'demo-profile-lab-progress',
      fullName: 'Lab Em Progresso Demo',
      email: 'laboratorio.progresso@nexor.dev',
      phone: '11999990014',
      roles: ['lab'],
      clinicIds: [],
      dentistId: null,
      partnerId: null,
      labId: 'lab-demo-progress',
      persona: 'labProgress',
      defaultMode: 'lab',
      allowedModes: ['lab'],
      productRoles: [
        {
          id: 'demo-product-role-lab-progress',
          productKey: 'biteplaner',
          role: 'lab',
          status: 'active',
          metadata: {
            labName: 'Lab Em Progresso Demo',
            cnpj: '42.318.949/0001-84',
            professionalSummary: 'Laboratório em curso de licenciamento Biteplaner.',
            locations: [
              {
                name: 'Unidade Operacional',
                cep: '04567-000',
                address: 'Rua Funchal, 500 - São Paulo - SP',
                city: 'São Paulo',
                state: 'SP',
                phone: '(11) 3000-2000',
                serviceHours: 'Segunda a sexta, 8h as 18h'
              }
            ]
          },
          createdAt: '2026-05-07T09:00:00.000Z',
          updatedAt: '2026-05-07T10:00:00.000Z'
        }
      ],
      enrollment: {
        id: 'demo-enrollment-lab-progress',
        status: 'active',
        source_type: 'internal_demo',
        created_at: '2026-05-07T10:00:00.000Z'
      }
    },
    {
      id: 'demo-user-lab-licensed',
      authUserId: 'demo-auth-labLicensed',
      profileId: 'demo-profile-lab-licensed',
      fullName: 'Lab Licenciado Demo',
      email: 'laboratorio.licenciado@nexor.dev',
      phone: '11999990015',
      roles: ['lab'],
      clinicIds: [],
      dentistId: null,
      partnerId: null,
      labId: 'lab-demo-001',
      persona: 'labLicensed',
      defaultMode: 'lab',
      allowedModes: ['lab'],
      productRoles: [
        {
          id: 'demo-product-role-lab-licensed',
          productKey: 'biteplaner',
          role: 'lab',
          status: 'active',
          metadata: {
            labName: 'Lab Licenciado Demo',
            cnpj: '75.865.311/0001-02',
            professionalSummary: 'Laboratório licenciado Biteplaner para operação completa.'
          },
          createdAt: '2026-05-02T09:00:00.000Z',
          updatedAt: '2026-05-02T11:00:00.000Z'
        }
      ],
      enrollment: {
        id: 'demo-enrollment-lab-licensed',
        status: 'active',
        source_type: 'internal_demo',
        created_at: '2026-05-02T11:00:00.000Z'
      }
    },
    {
      id: 'demo-user-admin',
      authUserId: 'demo-auth-admin',
      profileId: 'demo-profile-admin',
      fullName: 'Amanda Admin',
      email: 'admin.demo@nexor.dev',
      phone: '11999990005',
      roles: ['admin'],
      clinicIds: [],
      dentistId: null,
      partnerId: null,
      labId: null,
      persona: 'admin',
      defaultMode: 'admin',
      allowedModes: ['admin'],
      enrollment: {
        id: 'demo-enrollment-admin',
        status: 'active',
        source_type: 'internal_demo',
        created_at: '2026-05-01T09:40:00.000Z'
      }
    },
    {
      id: 'demo-user-dentist-applicant',
      authUserId: 'demo-auth-dentist-applicant',
      profileId: 'demo-profile-dentist-applicant',
      fullName: 'Dra Maria Solicitante',
      email: 'maria.dentista@nexor.dev',
      phone: '11999990009',
      roles: [],
      clinicIds: [],
      dentistId: null,
      partnerId: null,
      labId: null,
      productRoles: [
        {
          id: 'demo-product-role-dentist-request-001',
          productKey: 'biteplaner',
          role: 'dentist',
          status: 'pending',
          metadata: {
            fullName: 'Dra Maria Solicitante',
            croNumber: 'CRO-SP 12345',
            professionalSummary: 'Odontologia esportiva, DTM e acompanhamento de atletas.',
            practiceLocations: [
              {
                name: 'Clínica Centro',
                address: 'Praca da Se - Se, São Paulo - SP',
                cep: '01001-000',
                phone: '(11) 99999-9999',
                dentistName: 'Dra Maria Solicitante',
                serviceHours: 'Segunda a sexta, 8h as 18h',
                city: 'São Paulo',
                state: 'SP'
              }
            ]
          },
          createdAt: '2026-05-10T10:00:00.000Z',
          updatedAt: '2026-05-10T10:00:00.000Z'
        }
      ]
    },
    {
      id: 'demo-customer-marina',
      authUserId: 'demo-auth-marina',
      profileId: 'demo-profile-marina',
      fullName: 'Marina Lutadora',
      email: 'marina.demo@nexor.dev',
      phone: '11999990006',
      roles: ['customer'],
      clinicIds: [],
      dentistId: null,
      partnerId: null,
      labId: null
    }
  ],
  partnerLinks: [
    {
      id: 'partner-link-active-001',
      partnerId: 'partner-demo-001',
      token: 'bp-partner-demo-001',
      status: 'active',
      intendedCustomerName: 'Joao Demo',
      intendedCustomerEmail: 'atleta.demo@nexor.dev',
      created_at: '2026-05-01T10:00:00.000Z',
      expires_at: '2026-06-01T10:00:00.000Z',
      consumed_at: null
    },
    {
      id: 'partner-link-expired-001',
      partnerId: 'partner-demo-001',
      token: 'bp-partner-demo-expired',
      status: 'expired',
      intendedCustomerName: 'Contato não qualificado',
      intendedCustomerEmail: null,
      created_at: '2026-03-01T10:00:00.000Z',
      expires_at: '2026-04-01T10:00:00.000Z',
      consumed_at: null
    }
  ],
  leads: [
    {
      id: 'lead-demo-001',
      partnerId: 'partner-demo-001',
      partnerLinkId: 'partner-link-active-001',
      orderId: 'BP-DEMO-001',
      customerProfileId: 'demo-profile-athlete',
      customerName: 'Joao Demo',
      customerEmail: 'atleta.demo@nexor.dev',
      customerPhone: '11999990001',
      funnelStage: 'account_created',
      statusLabel: 'Pre-requisito pendente',
      created_at: '2026-05-01T10:10:00.000Z'
    },
    {
      id: 'lead-demo-002',
      partnerId: 'partner-demo-001',
      partnerLinkId: 'partner-link-active-001',
      orderId: 'BP-DEMO-002',
      customerProfileId: 'demo-profile-athlete',
      customerName: 'Joao Demo',
      customerEmail: 'atleta.demo@nexor.dev',
      customerPhone: '11999990001',
      funnelStage: 'pre_requisite_completed',
      statusLabel: 'Aguardando consulta inicial',
      created_at: '2026-05-01T11:10:00.000Z'
    },
    {
      id: 'lead-demo-004',
      partnerId: 'partner-demo-001',
      partnerLinkId: 'partner-link-active-001',
      orderId: 'BP-DEMO-004',
      customerProfileId: 'demo-profile-athlete',
      customerName: 'Joao Demo',
      customerEmail: 'atleta.demo@nexor.dev',
      customerPhone: '11999990001',
      funnelStage: 'order_advanced',
      statusLabel: 'Aguardando preenchimento dentista',
      created_at: '2026-05-02T12:10:00.000Z'
    }
  ],
  orders: [
    {
      id: 'BP-DEMO-001',
      status: 'registration_started',
      statusLabel: 'Pre-requisito pendente',
      stage: 'pre_requisite_pending',
      created_at: '2026-05-01T10:00:00.000Z',
      customer_profile_id: 'demo-profile-athlete',
      user_profile_id: 'demo-user-athlete',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-athlete',
        full_name: 'Joao Demo',
        email: 'atleta.demo@nexor.dev',
        phone: '11999990001'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: 'partner-demo-001',
      dentistId: null,
      labId: null,
      visibleTo: ['athlete', 'partner', 'admin'],
      nextActions: ['complete-prerequisite'],
      productionRequestDraft: null,
      preLabChecklistDraft: null,
      flags: {
        preRequisiteComplete: false,
        eligible: null,
        paymentConfirmed: false,
        productionFormCompleted: false,
        initialEvaluationCompleted: false,
        retentionAcknowledged: false,
        dentalArchFileAttached: false,
        sentToLab: false,
        productReceived: false
      }
    },
    {
      id: 'BP-DEMO-002',
      status: 'awaiting_scheduling',
      statusLabel: 'Aguardando consulta inicial',
      stage: 'awaiting_initial_consultation',
      created_at: '2026-05-01T11:00:00.000Z',
      customer_profile_id: 'demo-profile-athlete',
      user_profile_id: 'demo-user-athlete',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-athlete',
        full_name: 'Joao Demo',
        email: 'atleta.demo@nexor.dev',
        phone: '11999990001'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: 'partner-demo-001',
      dentistId: null,
      labId: null,
      visibleTo: ['athlete', 'partner', 'dentist', 'admin'],
      nextActions: ['schedule-initial-consultation'],
      productionRequestDraft: null,
      preLabChecklistDraft: null,
      flags: {
        preRequisiteComplete: true,
        eligible: null,
        paymentConfirmed: false,
        productionFormCompleted: false,
        initialEvaluationCompleted: false,
        retentionAcknowledged: false,
        dentalArchFileAttached: false,
        sentToLab: false,
        productReceived: false
      }
    },
    {
      id: 'BP-DEMO-003',
      status: 'in_progress',
      statusLabel: 'Aguardando confirmação de consulta',
      stage: 'consultation_linked',
      created_at: '2026-05-02T09:00:00.000Z',
      customer_profile_id: 'demo-profile-athlete',
      user_profile_id: 'demo-user-athlete',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-athlete',
        full_name: 'Joao Demo',
        email: 'atleta.demo@nexor.dev',
        phone: '11999990001'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: null,
      dentistId: 'dentist-demo-001',
      labId: null,
      visibleTo: ['athlete', 'dentist', 'admin'],
      nextActions: ['user-confirmation', 'dentist-confirmation', 'complete-match', 'register-clinical-decision'],
      productionRequestDraft: null,
      preLabChecklistDraft: null,
      flags: {
        preRequisiteComplete: true,
        eligible: null,
        paymentConfirmed: false,
        productionFormCompleted: false,
        initialEvaluationCompleted: true,
        retentionAcknowledged: true,
        dentalArchFileAttached: true,
        sentToLab: false,
        productReceived: false
      }
    },
    {
      id: 'BP-DEMO-004',
      status: 'awaiting_dentist_forms',
      statusLabel: 'Aguardando preenchimento dentista',
      stage: 'awaiting_dentist_forms',
      created_at: '2026-05-02T12:00:00.000Z',
      customer_profile_id: 'demo-profile-athlete',
      user_profile_id: 'demo-user-athlete',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-athlete',
        full_name: 'Joao Demo',
        email: 'atleta.demo@nexor.dev',
        phone: '11999990001'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: 'partner-demo-001',
      dentistId: 'dentist-demo-001',
      labId: null,
      visibleTo: ['athlete', 'partner', 'dentist', 'admin'],
      nextActions: ['save-production-request-draft', 'complete-production-request'],
      productionRequestDraft: {
        anamnesisSummary: 'Consulta realizada. Paciente apto para seguir com a solicitação de produção.',
        anamnesisDownloaded: false,
        productionRequestSummary: '',
        labNotes: '',
        scan3dFileName: '',
        prescriptionFileName: '',
        lgpdConfirmed: false,
        selectedLabId: null
      },
      preLabChecklistDraft: null,
      flags: {
        preRequisiteComplete: true,
        eligible: true,
        paymentConfirmed: true,
        productionFormCompleted: false,
        initialEvaluationCompleted: false,
        retentionAcknowledged: false,
        dentalArchFileAttached: false,
        sentToLab: false,
        productReceived: false
      }
    },
    {
      id: 'BP-DEMO-005',
      checkoutOrderId: DEMO_STRIPE_CHECKOUT_ORDER_ID,
      status: 'awaiting_payment',
      statusLabel: 'Aguardando pagamento',
      stage: 'awaiting_payment',
      created_at: '2026-05-02T14:00:00.000Z',
      customer_profile_id: 'demo-profile-marina',
      user_profile_id: 'demo-customer-marina',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-marina',
        full_name: 'Marina Lutadora',
        email: 'marina.demo@nexor.dev',
        phone: '11999990006'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: null,
      dentistId: 'dentist-demo-001',
      labId: null,
      visibleTo: ['athlete', 'dentist', 'admin'],
      nextActions: ['confirm-payment'],
      productionRequestDraft: null,
      preLabChecklistDraft: null,
      flags: {
        preRequisiteComplete: true,
        eligible: true,
        paymentConfirmed: false,
        productionFormCompleted: false,
        initialEvaluationCompleted: true,
        retentionAcknowledged: false,
        dentalArchFileAttached: false,
        sentToLab: false,
        productReceived: false
      }
    },
    {
      id: 'BP-DEMO-006',
      status: 'treatment_required',
      statusLabel: 'Tratamento prévio pendente',
      stage: 'treatment_required',
      created_at: '2026-05-02T16:00:00.000Z',
      customer_profile_id: 'demo-profile-athlete',
      user_profile_id: 'demo-user-athlete',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-athlete',
        full_name: 'Joao Demo',
        email: 'atleta.demo@nexor.dev',
        phone: '11999990001'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: null,
      dentistId: 'dentist-demo-001',
      labId: null,
      visibleTo: ['athlete', 'dentist', 'admin'],
      nextActions: ['register-clinical-decision'],
      productionRequestDraft: null,
      preLabChecklistDraft: null,
      flags: {
        preRequisiteComplete: true,
        eligible: null,
        paymentConfirmed: false,
        productionFormCompleted: false,
        initialEvaluationCompleted: true,
        retentionAcknowledged: false,
        dentalArchFileAttached: false,
        sentToLab: false,
        productReceived: false
      }
    },
    {
      id: 'BP-DEMO-007',
      status: 'awaiting_lab_start',
      statusLabel: 'Aguardando início da produção',
      stage: 'awaiting_lab_start',
      created_at: '2026-05-03T08:00:00.000Z',
      customer_profile_id: 'demo-profile-marina',
      user_profile_id: 'demo-customer-marina',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-marina',
        full_name: 'Marina Lutadora',
        email: 'marina.demo@nexor.dev',
        phone: '11999990006'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: null,
      dentistId: 'dentist-demo-001',
      labId: 'lab-demo-001',
      visibleTo: ['dentist', 'lab', 'admin'],
      nextActions: ['lab-production-started', 'lab-return-for-adjustment'],
      productionRequestDraft: {
        anamnesisSummary: 'Anamnese final revisada e baixada pelo dentista.',
        anamnesisDownloaded: true,
        productionRequestSummary: 'Solicitação de produção validada para o caso.',
        labNotes: 'Ajuste fino de mordida para atleta de combate.',
        scan3dFileName: 'marina-arcada-v2.stl',
        prescriptionFileName: 'prescricao-marina-demo.pdf',
        lgpdConfirmed: true,
        selectedLabId: 'lab-demo-001'
      },
      preLabChecklistDraft: {
        anamnesisSummary: 'Anamnese inicial revisada e liberada para a produção.',
        clinicalNotes: 'Arquivo 3D validado pelo dentista.',
        dentalArchFileName: 'marina-arcada-v2.stl',
        retentionAcknowledged: true
      },
      flags: {
        preRequisiteComplete: true,
        eligible: true,
        paymentConfirmed: true,
        productionFormCompleted: true,
        initialEvaluationCompleted: true,
        retentionAcknowledged: true,
        dentalArchFileAttached: true,
        sentToLab: true,
        productReceived: false
      }
    },
    {
      id: 'BP-DEMO-008',
      status: 'awaiting_adaptation',
      statusLabel: 'Aguardando adaptação',
      stage: 'awaiting_adaptation',
      created_at: '2026-05-03T12:30:00.000Z',
      customer_profile_id: 'demo-profile-athlete',
      user_profile_id: 'demo-user-athlete',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-athlete',
        full_name: 'Joao Demo',
        email: 'atleta.demo@nexor.dev',
        phone: '11999990001'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: null,
      dentistId: 'dentist-demo-001',
      labId: null,
      visibleTo: ['athlete', 'dentist', 'admin'],
      nextActions: ['adaptation-completed'],
      productionRequestDraft: {
        anamnesisSummary: 'Anamnese inicial concluída antes do envio ao laboratório.',
        anamnesisDownloaded: true,
        productionRequestSummary: 'Caso concluído e enviado com sucesso.',
        labNotes: 'Sem observações finais.',
        scan3dFileName: 'joao-arcada-final.stl',
        prescriptionFileName: 'prescricao-joao-demo.pdf',
        lgpdConfirmed: true,
        selectedLabId: 'lab-demo-001'
      },
      preLabChecklistDraft: {
        anamnesisSummary: 'Anamnese inicial concluída antes do envio ao laboratório.',
        clinicalNotes: 'Entrega finalizada sem pendencias.',
        dentalArchFileName: 'joao-arcada-final.stl',
        retentionAcknowledged: true
      },
      flags: {
        preRequisiteComplete: true,
        eligible: true,
        paymentConfirmed: true,
        productionFormCompleted: true,
        initialEvaluationCompleted: true,
        retentionAcknowledged: true,
        dentalArchFileAttached: true,
        sentToLab: true,
        productReceived: true
      }
    },
    {
      id: 'BP-DEMO-009',
      status: 'follow_up',
      statusLabel: 'Em acompanhamento',
      stage: 'follow_up',
      created_at: '2026-05-03T14:00:00.000Z',
      customer_profile_id: 'demo-profile-athlete',
      user_profile_id: 'demo-user-athlete',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-athlete',
        full_name: 'Joao Demo',
        email: 'atleta.demo@nexor.dev',
        phone: '11999990001'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: null,
      dentistId: 'dentist-demo-001',
      labId: null,
      visibleTo: ['athlete', 'dentist', 'admin'],
      nextActions: ['adaptation-completed'],
      productionRequestDraft: {
        anamnesisSummary: 'Anamnese inicial concluída antes do envio ao laboratório.',
        anamnesisDownloaded: true,
        productionRequestSummary: 'Caso finalizado e em acompanhamento.',
        labNotes: 'Paciente em fase de adaptação funcional.',
        scan3dFileName: 'joao-arcada-final.stl',
        prescriptionFileName: 'prescricao-joao-demo.pdf',
        lgpdConfirmed: true,
        selectedLabId: 'lab-demo-001'
      },
      preLabChecklistDraft: {
        anamnesisSummary: 'Anamnese inicial concluída antes do envio ao laboratório.',
        clinicalNotes: 'Entrega finalizada sem pendencias.',
        dentalArchFileName: 'joao-arcada-final.stl',
        retentionAcknowledged: true
      },
      flags: {
        preRequisiteComplete: true,
        eligible: true,
        paymentConfirmed: true,
        productionFormCompleted: true,
        initialEvaluationCompleted: true,
        retentionAcknowledged: true,
        dentalArchFileAttached: true,
        sentToLab: true,
        productReceived: true
      }
    },
    {
      id: 'BP-DEMO-010',
      status: 'ineligible_refund',
      statusLabel: 'Inapto - Encerrado',
      stage: 'closed_ineligible',
      created_at: '2026-05-04T09:00:00.000Z',
      customer_profile_id: 'demo-profile-marina',
      user_profile_id: 'demo-customer-marina',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-marina',
        full_name: 'Marina Lutadora',
        email: 'marina.demo@nexor.dev',
        phone: '11999990006'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: null,
      dentistId: 'dentist-demo-001',
      labId: null,
      visibleTo: ['athlete', 'dentist', 'admin'],
      nextActions: [],
      productionRequestDraft: null,
      preLabChecklistDraft: null,
      flags: {
        preRequisiteComplete: true,
        eligible: false,
        paymentConfirmed: false,
        productionFormCompleted: false,
        initialEvaluationCompleted: true,
        retentionAcknowledged: false,
        dentalArchFileAttached: false,
        sentToLab: false,
        productReceived: false
      }
    },
    {
      id: 'BP-DEMO-011',
      status: 'cancelled',
      statusLabel: 'Cancelado',
      stage: 'cancelled',
      created_at: '2026-05-04T11:00:00.000Z',
      customer_profile_id: 'demo-profile-athlete',
      user_profile_id: 'demo-user-athlete',
      practice_location_id: 'practice-demo-004',
      customer: {
        id: 'demo-profile-athlete',
        full_name: 'Joao Demo',
        email: 'atleta.demo@nexor.dev',
        phone: '11999990001'
      },
      practice_location: {
        id: 'practice-demo-004',
        name: 'Centro Integrado de Performance Bucal'
      },
      partnerId: 'partner-demo-001',
      dentistId: null,
      labId: null,
      visibleTo: ['partner', 'admin'],
      nextActions: [],
      productionRequestDraft: null,
      preLabChecklistDraft: null,
      flags: {
        preRequisiteComplete: false,
        eligible: null,
        paymentConfirmed: false,
        productionFormCompleted: false,
        initialEvaluationCompleted: false,
        retentionAcknowledged: false,
        dentalArchFileAttached: false,
        sentToLab: false,
        productReceived: false
      }
    },
    {
      id: 'BP-DEMO-012',
      status: 'awaiting_dentist_acceptance',
      statusLabel: 'Aguardando aceite do dentista',
      stage: 'dentist_acceptance_pending',
      created_at: '2026-05-05T08:30:00.000Z',
      customer_profile_id: 'demo-profile-bruno',
      user_profile_id: 'demo-user-bruno',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-bruno',
        full_name: 'Bruno Corredor',
        email: 'bruno.demo@nexor.dev',
        phone: '11999990021'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: null,
      dentistId: 'dentist-demo-licensed',
      labId: null,
      visibleTo: ['athlete', 'dentist', 'dentistLicensed', 'admin'],
      nextActions: ['accept-initial-consultation'],
      productionRequestDraft: null,
      preLabChecklistDraft: null,
      flags: {
        preRequisiteComplete: true,
        eligible: null,
        paymentConfirmed: false,
        productionFormCompleted: false,
        initialEvaluationCompleted: false,
        retentionAcknowledged: false,
        dentalArchFileAttached: false,
        sentToLab: false,
        productReceived: false
      }
    },
    {
      id: 'BP-DEMO-013',
      status: 'in_progress',
      statusLabel: 'Aguardando confirmação de consulta',
      stage: 'consultation_linked',
      created_at: '2026-05-05T10:00:00.000Z',
      customer_profile_id: 'demo-profile-larissa',
      user_profile_id: 'demo-user-larissa',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-larissa',
        full_name: 'Larissa Triatleta',
        email: 'larissa.demo@nexor.dev',
        phone: '11999990022'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: null,
      dentistId: 'dentist-demo-licensed',
      labId: null,
      visibleTo: ['athlete', 'dentist', 'dentistLicensed', 'admin'],
      nextActions: ['dentist-confirmation', 'complete-match', 'no-show'],
      productionRequestDraft: null,
      preLabChecklistDraft: null,
      flags: {
        preRequisiteComplete: true,
        eligible: null,
        paymentConfirmed: false,
        productionFormCompleted: false,
        initialEvaluationCompleted: true,
        retentionAcknowledged: true,
        dentalArchFileAttached: false,
        sentToLab: false,
        productReceived: false
      }
    },
    {
      id: 'BP-DEMO-014',
      status: 'appointment_confirmed',
      statusLabel: 'Aguardando decisão clínica',
      stage: 'awaiting_clinical_decision',
      created_at: '2026-05-05T11:30:00.000Z',
      customer_profile_id: 'demo-profile-renata',
      user_profile_id: 'demo-user-renata',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-renata',
        full_name: 'Renata Crossfit',
        email: 'renata.demo@nexor.dev',
        phone: '11999990023'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: 'partner-demo-001',
      dentistId: 'dentist-demo-licensed',
      labId: null,
      visibleTo: ['athlete', 'partner', 'dentist', 'dentistLicensed', 'admin'],
      nextActions: ['register-clinical-decision'],
      productionRequestDraft: null,
      preLabChecklistDraft: null,
      flags: {
        preRequisiteComplete: true,
        eligible: null,
        paymentConfirmed: false,
        productionFormCompleted: false,
        initialEvaluationCompleted: true,
        retentionAcknowledged: true,
        dentalArchFileAttached: true,
        sentToLab: false,
        productReceived: false
      }
    },
    {
      id: 'BP-DEMO-015',
      status: 'awaiting_dentist_forms',
      statusLabel: 'Aguardando preenchimento dentista',
      stage: 'awaiting_dentist_forms',
      created_at: '2026-05-05T13:00:00.000Z',
      customer_profile_id: 'demo-profile-victor',
      user_profile_id: 'demo-user-victor',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-victor',
        full_name: 'Victor Rugby',
        email: 'victor.demo@nexor.dev',
        phone: '11999990024'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: null,
      dentistId: 'dentist-demo-licensed',
      labId: null,
      visibleTo: ['athlete', 'dentist', 'dentistLicensed', 'admin'],
      nextActions: ['save-production-request-draft', 'complete-production-request'],
      productionRequestDraft: {
        anamnesisSummary: 'Atleta apto após consulta inicial. Aguardando documentação produtiva.',
        anamnesisDownloaded: true,
        productionRequestSummary: 'Protetor superior para treino de contato.',
        labNotes: '',
        scan3dFileName: '',
        prescriptionFileName: '',
        lgpdConfirmed: false,
        selectedLabId: null
      },
      preLabChecklistDraft: null,
      flags: {
        preRequisiteComplete: true,
        eligible: true,
        paymentConfirmed: true,
        productionFormCompleted: false,
        initialEvaluationCompleted: true,
        retentionAcknowledged: false,
        dentalArchFileAttached: false,
        sentToLab: false,
        productReceived: false
      }
    },
    {
      id: 'BP-DEMO-016',
      status: 'awaiting_lab_start',
      statusLabel: 'Aguardando início da produção',
      stage: 'awaiting_lab_start',
      created_at: '2026-05-05T15:00:00.000Z',
      customer_profile_id: 'demo-profile-camila',
      user_profile_id: 'demo-user-camila',
      practice_location_id: 'practice-demo-001',
      customer: {
        id: 'demo-profile-camila',
        full_name: 'Camila Boxe',
        email: 'camila.demo@nexor.dev',
        phone: '11999990025'
      },
      practice_location: {
        id: 'practice-demo-001',
        name: 'Clínica Esportiva Nexor'
      },
      partnerId: null,
      dentistId: 'dentist-demo-licensed',
      labId: 'lab-demo-001',
      visibleTo: ['dentist', 'dentistLicensed', 'lab', 'admin'],
      nextActions: [],
      productionRequestDraft: {
        anamnesisSummary: 'Anamnese revisada e baixada pela dentista licenciada.',
        anamnesisDownloaded: true,
        productionRequestSummary: 'Protetor personalizado para boxe amador, arcada superior.',
        labNotes: 'Priorizar conforto posterior e conferir estabilidade em impacto lateral.',
        scan3dFileName: 'camila-boxe-arcada-superior.stl',
        prescriptionFileName: 'prescricao-camila-boxe.pdf',
        lgpdConfirmed: true,
        selectedLabId: 'lab-demo-001'
      },
      preLabChecklistDraft: {
        anamnesisSummary: 'Sem impedimentos clínicos para uso esportivo.',
        clinicalNotes: 'Documentação completa enviada ao laboratório.',
        dentalArchFileName: 'camila-boxe-arcada-superior.stl',
        retentionAcknowledged: true
      },
      flags: {
        preRequisiteComplete: true,
        eligible: true,
        paymentConfirmed: true,
        productionFormCompleted: true,
        initialEvaluationCompleted: true,
        retentionAcknowledged: true,
        dentalArchFileAttached: true,
        sentToLab: true,
        productReceived: false
      }
    }
  ],
  appointments: [
    {
      id: 'BP-APT-002',
      order_id: 'BP-DEMO-002',
      type: 'initial',
      status: 'scheduled',
      scheduled_at: '2026-05-07T10:00:00.000Z',
      user_confirmed_at: null,
      dentist_confirmed_at: null
    },
    {
      id: 'BP-APT-003',
      order_id: 'BP-DEMO-003',
      type: 'initial',
      status: 'scheduled',
      scheduled_at: '2026-05-06T15:00:00.000Z',
      user_confirmed_at: null,
      dentist_confirmed_at: null
    },
    {
      id: 'BP-APT-006',
      order_id: 'BP-DEMO-006',
      type: 'adaptation',
      status: 'scheduled',
      scheduled_at: '2026-05-12T11:00:00.000Z',
      user_confirmed_at: null,
      dentist_confirmed_at: null
    },
    {
      id: 'BP-APT-012',
      order_id: 'BP-DEMO-012',
      type: 'initial',
      status: 'scheduled',
      scheduled_at: '2026-05-08T09:00:00.000Z',
      user_confirmed_at: null,
      dentist_confirmed_at: null
    },
    {
      id: 'BP-APT-013',
      order_id: 'BP-DEMO-013',
      type: 'initial',
      status: 'scheduled',
      scheduled_at: '2026-05-08T11:00:00.000Z',
      user_confirmed_at: '2026-05-08T11:20:00.000Z',
      dentist_confirmed_at: null
    },
    {
      id: 'BP-APT-014',
      order_id: 'BP-DEMO-014',
      type: 'initial',
      status: 'completed',
      scheduled_at: '2026-05-08T14:00:00.000Z',
      user_confirmed_at: '2026-05-08T14:35:00.000Z',
      dentist_confirmed_at: '2026-05-08T14:38:00.000Z'
    }
  ],
  workflowForms: [
    {
      id: 'BP-WF-001-ONBOARDING',
      orderId: 'BP-DEMO-001',
      templateKey: 'customer_new_user_onboarding',
      stepKey: 'new_user_onboarding',
      status: 'submitted',
      canViewPayload: true,
      summary: {
        scoreAverage: null,
        hasComment: true,
        responseCount: 1,
        submittedAt: '2026-05-01T10:04:00.000Z',
        blocked: false,
        fieldCount: 12
      },
      releasedAt: '2026-05-01T10:01:00.000Z',
      submittedAt: '2026-05-01T10:04:00.000Z',
      payload: {
        fullName: 'Joao Demo',
        email: 'atleta.demo@nexor.dev',
        phone: '11999990001',
        cpf: '52998224725',
        birthDate: '1990-01-10',
        residenceCityOrNeighborhood: 'São Paulo / Vila Mariana',
        profession: 'Educador físico',
        biologicalSex: 'male',
        dominantLaterality: 'right',
        bodyMassKg: 82,
        heightMeters: 1.78,
        currentSports: ['crossfit', 'strength_training'],
        trainingExperience: '5_to_10_years',
        trainingCityOrNeighborhood: 'São Paulo / Moema',
        clinicalPrivacyConsent: ['accepted'],
        privacyConsent: ['accepted']
      }
    },
    {
      id: 'BP-WF-001-INTAKE',
      orderId: 'BP-DEMO-001',
      templateKey: 'customer_pre_consultation_intake',
      stepKey: 'pre_requisite_pending',
      status: 'pending',
      roleState: { customer: 'pending', dentist: 'locked' },
      customerSubmittedAt: null,
      dentistReviewStartedAt: null,
      dentistSubmittedAt: null,
      canViewPayload: true,
      summary: null,
      releasedAt: '2026-05-01T10:05:00.000Z',
      submittedAt: null,
      payload: null
    },
    {
      id: 'BP-WF-002-INTAKE',
      orderId: 'BP-DEMO-002',
      templateKey: 'customer_pre_consultation_intake',
      stepKey: 'initial_consultation_preparation',
      status: 'pending',
      roleState: { customer: 'pending', dentist: 'locked' },
      customerSubmittedAt: null,
      dentistReviewStartedAt: null,
      dentistSubmittedAt: null,
      canViewPayload: true,
      summary: null,
      releasedAt: '2026-05-01T11:05:00.000Z',
      submittedAt: null,
      payload: null
    },
    {
      id: 'BP-WF-003-INTAKE',
      orderId: 'BP-DEMO-003',
      templateKey: 'customer_pre_consultation_intake',
      stepKey: 'initial_consultation_preparation',
      status: 'pending',
      roleState: { customer: 'pending', dentist: 'locked' },
      customerSubmittedAt: null,
      dentistReviewStartedAt: null,
      dentistSubmittedAt: null,
      canViewPayload: true,
      summary: null,
      releasedAt: '2026-05-02T10:05:00.000Z',
      submittedAt: null,
      payload: null
    },
    {
      id: 'BP-WF-004-INTAKE',
      orderId: 'BP-DEMO-004',
      templateKey: 'customer_pre_consultation_intake',
      stepKey: 'initial_consultation_preparation',
      status: 'submitted',
      roleState: { customer: 'submitted', dentist: 'pending' },
      customerSubmittedAt: '2026-05-02T11:10:00.000Z',
      dentistReviewStartedAt: null,
      dentistSubmittedAt: null,
      canViewPayload: true,
      summary: {
        scoreAverage: null,
        hasComment: true,
        responseCount: 1,
        submittedAt: '2026-05-02T11:10:00.000Z'
      },
      releasedAt: '2026-05-02T10:05:00.000Z',
      submittedAt: '2026-05-02T11:10:00.000Z',
      payload: {
        customer: {
          fullName: 'Marina Costa',
          phone: '11987654321',
          sportRoutine: 'Musculação cinco vezes por semana',
          hasRelevantMedicalDiagnosis: 'no',
          hasTmdDiagnosis: 'yes',
          averagePainLastWeek: 6,
          biteplanerDiscoverySource: 'coach',
          expectedUseBenefit: ['performance', 'jaw_control']
        }
      }
    },
    {
      id: 'BP-WF-006-CUSTOMER-DENTIST',
      orderId: 'BP-DEMO-006',
      templateKey: 'dentist_review_by_customer',
      stepKey: 'post_adaptation_feedback',
      status: 'pending',
      canViewPayload: true,
      summary: null,
      releasedAt: '2026-05-04T11:00:00.000Z',
      submittedAt: null,
      payload: null
    },
    {
      id: 'BP-WF-006-PARTNER',
      orderId: 'BP-DEMO-001',
      templateKey: 'partner_review_by_customer',
      stepKey: 'partner_referral_registration_feedback',
      status: 'pending',
      canViewPayload: true,
      summary: null,
      releasedAt: '2026-05-01T10:08:00.000Z',
      submittedAt: null,
      payload: null
    },
    {
      id: 'BP-WF-006-DENTIST-LAB',
      orderId: 'BP-DEMO-006',
      templateKey: 'lab_review_by_dentist',
      stepKey: 'lab_cycle_feedback_from_dentist',
      status: 'pending',
      canViewPayload: true,
      summary: null,
      releasedAt: '2026-05-04T09:00:00.000Z',
      submittedAt: null,
      payload: null
    },
    {
      id: 'BP-WF-005-LAB',
      orderId: 'BP-DEMO-007',
      templateKey: 'dentist_review_by_lab',
      stepKey: 'lab_cycle_feedback_from_lab',
      status: 'pending',
      canViewPayload: true,
      summary: {
        scoreAverage: null,
        hasComment: false,
        responseCount: 0,
        submittedAt: null
      },
      releasedAt: '2026-05-03T08:30:00.000Z',
      submittedAt: null,
      payload: null
    },
    {
      id: 'BP-WF-006-LAB',
      orderId: 'BP-DEMO-006',
      templateKey: 'dentist_review_by_lab',
      stepKey: 'lab_cycle_feedback_from_lab',
      status: 'submitted',
      canViewPayload: true,
      summary: {
        scoreAverage: 9,
        hasComment: true,
        responseCount: 1,
        submittedAt: '2026-05-04T10:00:00.000Z'
      },
      releasedAt: '2026-05-03T16:00:00.000Z',
      submittedAt: '2026-05-04T10:00:00.000Z',
      payload: {
        scanFileQuality: 9,
        comment: 'Laboratório finalizou a revisão e liberou o caso.'
      }
    },
    {
      id: 'BP-WF-009-CUSTOMER-DENTIST',
      orderId: 'BP-DEMO-009',
      templateKey: 'dentist_review_by_customer',
      stepKey: 'post_adaptation_feedback',
      status: 'submitted',
      canViewPayload: true,
      summary: {
        scoreAverage: 8.67,
        hasComment: true,
        responseCount: 1,
        submittedAt: '2026-05-05T09:00:00.000Z'
      },
      releasedAt: '2026-05-04T15:00:00.000Z',
      submittedAt: '2026-05-05T09:00:00.000Z',
      payload: {
        contactEase: 9,
        consultationLeadTime: 8,
        punctuality: 9,
        officeFacilities: 8,
        courtesy: 10,
        deviceUseAndAdjustmentGuidance: 8,
        comment: 'Atendimento claro, pontual e com boa orientação para adaptação do protetor.'
      }
    },
    {
      id: 'BP-WF-009-TRAINING-001',
      orderId: 'BP-DEMO-009',
      templateKey: 'customer_training_report',
      stepKey: 'post_adaptation_feedback',
      status: 'pending',
      canViewPayload: true,
      summary: null,
      releasedAt: '2026-05-05T09:05:00.000Z',
      submittedAt: null,
      payload: null
    },
    {
      id: 'BP-WF-014-PARTNER',
      orderId: 'BP-DEMO-014',
      templateKey: 'partner_review_by_customer',
      stepKey: 'partner_review_by_customer',
      status: 'submitted',
      canViewPayload: true,
      summary: {
        scoreAverage: 9,
        hasComment: true,
        responseCount: 1,
        submittedAt: '2026-05-08T15:00:00.000Z'
      },
      releasedAt: '2026-05-08T14:40:00.000Z',
      submittedAt: '2026-05-08T15:00:00.000Z',
      payload: {
        facilities: 8,
        courtesy: 9,
        followUpAvailability: 10,
        technicalGuidance: 9,
        comment: 'Parceiro explicou bem o fluxo e acompanhou o agendamento até a consulta.'
      }
    },
    {
      id: 'BP-WF-016-DENTIST-LAB',
      orderId: 'BP-DEMO-016',
      templateKey: 'lab_review_by_dentist',
      stepKey: 'lab_cycle_feedback_from_dentist',
      status: 'submitted',
      canViewPayload: true,
      summary: {
        scoreAverage: 8.67,
        hasComment: true,
        responseCount: 1,
        submittedAt: '2026-05-06T10:00:00.000Z'
      },
      releasedAt: '2026-05-06T09:00:00.000Z',
      submittedAt: '2026-05-06T10:00:00.000Z',
      payload: {
        deliveryLeadTime: 8,
        rawDeviceQuality: 9,
        contactEase: 9,
        comment: 'Laboratório respondeu rápido e entregou dispositivo bruto com bom acabamento.'
      }
    },
    {
      id: 'BP-WF-016-LAB-DENTIST',
      orderId: 'BP-DEMO-016',
      templateKey: 'dentist_review_by_lab',
      stepKey: 'lab_cycle_feedback_from_lab',
      status: 'submitted',
      canViewPayload: true,
      summary: {
        scoreAverage: 9,
        hasComment: true,
        responseCount: 1,
        submittedAt: '2026-05-06T11:00:00.000Z'
      },
      releasedAt: '2026-05-06T09:30:00.000Z',
      submittedAt: '2026-05-06T11:00:00.000Z',
      payload: {
        scanFileQuality: 9,
        contactEase: 9,
        comment: 'Arquivo 3D bem nomeado, orientações objetivas e contato fácil para dúvidas técnicas.'
      }
    }
  ],
  workflowFormVersions: [
    {
      id: 'workflow-version-006-1',
      workflowFormId: 'BP-WF-006-LAB',
      submissionId: 'BP-WF-006-LAB',
      revision: 1,
      payload: {
        scanFileQuality: 9,
        comment: 'Laboratório finalizou a revisão e liberou o caso.'
      },
      summary: {
        scoreAverage: 9,
        hasComment: true,
        responseCount: 1,
        submittedAt: '2026-05-04T10:00:00.000Z'
      },
      changeReason: 'Primeiro envio operacional do laboratório.',
      createdAt: '2026-05-04T10:00:00.000Z'
    }
  ],
  orderForms: [
    {
      id: 'BP-ORDER-FORM-003-ANA',
      orderId: 'BP-DEMO-003',
      type: 'anamnesis',
      version: 1,
      created_at: '2026-05-02T10:00:00.000Z',
      dentist_id: 'dentist-demo-001',
      clinic_id: null,
      practice_location_id: 'practice-demo-001'
    },
    {
      id: 'BP-ORDER-FORM-004-PROD',
      orderId: 'BP-DEMO-004',
      type: 'production_request',
      version: 1,
      created_at: '2026-05-02T13:00:00.000Z',
      dentist_id: 'dentist-demo-001',
      clinic_id: null,
      practice_location_id: 'practice-demo-001'
    },
    {
      id: 'BP-ORDER-FORM-005-PROD',
      orderId: 'BP-DEMO-005',
      type: 'production_request',
      version: 2,
      created_at: '2026-05-03T08:20:00.000Z',
      dentist_id: 'dentist-demo-001',
      clinic_id: null,
      practice_location_id: 'practice-demo-001'
    },
    {
      id: 'BP-ORDER-FORM-006-FOLLOW',
      orderId: 'BP-DEMO-006',
      type: 'follow_up',
      version: 1,
      created_at: '2026-05-04T14:00:00.000Z',
      dentist_id: 'dentist-demo-001',
      clinic_id: null,
      practice_location_id: 'practice-demo-001'
    }
  ],
  timelineEvents: [
    {
      id: 'timeline-001',
      orderId: 'BP-DEMO-001',
      fromStatus: null,
      toStatus: 'registration_started',
      reason: 'Conta Nexor criada pelo link do parceiro.',
      createdAt: '2026-05-01T10:00:00.000Z'
    },
    {
      id: 'timeline-002',
      orderId: 'BP-DEMO-002',
      fromStatus: 'registration_started',
      toStatus: 'awaiting_scheduling',
      reason: 'Pre-requisito concluído e dentista já selecionado.',
      createdAt: '2026-05-01T11:00:00.000Z'
    },
    {
      id: 'timeline-003',
      orderId: 'BP-DEMO-003',
      fromStatus: 'awaiting_scheduling',
      toStatus: 'in_progress',
      reason: 'Consulta inicial realizada e aguardando desfecho clínico.',
      createdAt: '2026-05-02T09:00:00.000Z'
    },
    {
      id: 'timeline-004',
      orderId: 'BP-DEMO-004',
      fromStatus: 'in_progress',
      toStatus: 'payment_confirmed',
      reason: 'Atleta apto, pagamento mock confirmado e pedido de produção preenchido. Falta revisar a avaliação inicial e anexar o arquivo 3D para liberar o laboratório.',
      createdAt: '2026-05-02T12:00:00.000Z'
    },
    {
      id: 'timeline-005',
      orderId: 'BP-DEMO-005',
      fromStatus: 'payment_confirmed',
      toStatus: 'awaiting_lab_start',
      reason: 'Pedido enviado para a fila inicial do laboratório.',
      createdAt: '2026-05-03T08:00:00.000Z'
    },
    {
      id: 'timeline-006',
      orderId: 'BP-DEMO-006',
      fromStatus: 'product_received_by_clinic',
      toStatus: 'follow_up',
      reason: 'Entrega concluída e acompanhamento iniciado.',
      createdAt: '2026-05-03T14:00:00.000Z'
    },
    {
      id: 'timeline-012',
      orderId: 'BP-DEMO-012',
      fromStatus: 'awaiting_scheduling',
      toStatus: 'awaiting_dentist_acceptance',
      reason: 'Cliente informou consulta agendada e aguarda aceite da dentista licenciada.',
      createdAt: '2026-05-05T08:30:00.000Z'
    },
    {
      id: 'timeline-013',
      orderId: 'BP-DEMO-013',
      fromStatus: 'awaiting_dentist_acceptance',
      toStatus: 'in_progress',
      reason: 'Consulta aceita pela dentista. Cliente já confirmou comparecimento.',
      createdAt: '2026-05-05T10:00:00.000Z'
    },
    {
      id: 'timeline-014',
      orderId: 'BP-DEMO-014',
      fromStatus: 'in_progress',
      toStatus: 'appointment_confirmed',
      reason: 'Consulta confirmada pelas duas partes, pronta para decisão clínica.',
      createdAt: '2026-05-05T11:30:00.000Z'
    },
    {
      id: 'timeline-015',
      orderId: 'BP-DEMO-015',
      fromStatus: 'awaiting_payment',
      toStatus: 'awaiting_dentist_forms',
      reason: 'Pagamento confirmado. Dentista precisa finalizar a documentação de produção.',
      createdAt: '2026-05-05T13:00:00.000Z'
    },
    {
      id: 'timeline-016',
      orderId: 'BP-DEMO-016',
      fromStatus: 'awaiting_dentist_forms',
      toStatus: 'awaiting_lab_start',
      reason: 'Documentação completa enviada ao laboratório licenciado.',
      createdAt: '2026-05-05T15:00:00.000Z'
    }
  ],
  dentistLicensingWorkflows: [
    {
      id: 'demo-dentist-licensing-approved',
      profileId: 'demo-profile-dentist-approved',
      productRoleId: 'demo-product-role-dentist-approved',
      dentistId: 'dentist-demo-approved',
      status: 'approved_pending_payment',
      paymentStatus: 'not_started',
      testAttempts: 0,
      testPassed: false,
      certificateIssuedAt: null,
      metadata: { courseProgress: {} }
    },
    {
      id: 'demo-dentist-licensing-progress',
      profileId: 'demo-profile-dentist-progress',
      productRoleId: 'demo-product-role-dentist-progress',
      dentistId: 'dentist-demo-progress',
      status: 'course_in_progress',
      paymentStatus: 'confirmed',
      testAttempts: 1,
      testPassed: false,
      certificateIssuedAt: null,
      metadata: { courseProgress: { fundamentos: true, operacao: true } }
    },
    {
      id: 'demo-dentist-licensing-licensed',
      profileId: 'demo-profile-dentist-licensed',
      productRoleId: 'demo-product-role-dentist-licensed',
      dentistId: 'dentist-demo-licensed',
      status: 'licensed',
      paymentStatus: 'confirmed',
      testAttempts: 1,
      testPassed: true,
      certificateIssuedAt: '2026-05-03T14:00:00.000Z',
      metadata: { courseProgress: { fundamentos: true, operacao: true, qualidade: true } }
    },
    {
      id: 'demo-lab-licensing-operational',
      profileId: 'demo-profile-lab',
      productRoleId: 'demo-product-role-lab',
      dentistId: null,
      status: 'licensed',
      paymentStatus: 'confirmed',
      testAttempts: 1,
      testPassed: true,
      certificateIssuedAt: '2026-05-01T14:00:00.000Z',
      metadata: { courseProgress: { fundamentos: true, operacao: true, qualidade: true }, licenseeType: 'lab' }
    },
    {
      id: 'demo-lab-licensing-approved',
      profileId: 'demo-profile-lab-approved',
      productRoleId: 'demo-product-role-lab-approved',
      dentistId: null,
      status: 'approved_pending_payment',
      paymentStatus: 'not_started',
      testAttempts: 0,
      testPassed: false,
      certificateIssuedAt: null,
      metadata: { courseProgress: {}, licenseeType: 'lab' }
    },
    {
      id: 'demo-lab-licensing-progress',
      profileId: 'demo-profile-lab-progress',
      productRoleId: 'demo-product-role-lab-progress',
      dentistId: null,
      status: 'course_in_progress',
      paymentStatus: 'confirmed',
      testAttempts: 1,
      testPassed: false,
      certificateIssuedAt: null,
      metadata: { courseProgress: { fundamentos: true, operacao: true }, licenseeType: 'lab' }
    },
    {
      id: 'demo-lab-licensing-licensed',
      profileId: 'demo-profile-lab-licensed',
      productRoleId: 'demo-product-role-lab-licensed',
      dentistId: null,
      status: 'licensed',
      paymentStatus: 'confirmed',
      testAttempts: 1,
      testPassed: true,
      certificateIssuedAt: '2026-05-03T16:00:00.000Z',
      metadata: { courseProgress: { fundamentos: true, operacao: true, qualidade: true }, licenseeType: 'lab' }
    }
  ],
  notifications: [
    {
      id: 'demo-notification-global-welcome',
      scope: 'global',
      profileId: null,
      title: 'Bem-vindo ao painel Nexor',
      message: 'Acompanhe suas etapas, pendências e atualizações importantes diretamente pelo painel.',
      type: 'nexor_general_update',
      read: false,
      readAtByProfileId: {},
      metadata: { channel: 'demo' },
      createdAt: '2026-05-09T08:00:00.000Z'
    },
    {
      id: 'demo-notification-global-feedbacks',
      scope: 'global',
      profileId: null,
      title: 'Avaliações disponíveis',
      message: 'As avaliações do fluxo Biteplaner já estão disponíveis para clientes, parceiros, dentistas e laboratórios.',
      type: 'biteplaner_reviews_available',
      read: false,
      readAtByProfileId: {
        'demo-profile-athlete': '2026-05-09T09:15:00.000Z'
      },
      metadata: { productKey: 'biteplaner' },
      createdAt: '2026-05-09T07:30:00.000Z'
    },
    {
      id: 'demo-notification-dentist-approved',
      scope: 'profile',
      profileId: 'demo-profile-dentist-approved',
      title: 'Cadastro aprovado',
      message: 'Seu cadastro foi aprovado pela Nexor. Realize o pagamento e avance pelo licenciamento.',
      type: 'biteplaner_dentist_licensing_approved',
      read: false,
      createdAt: '2026-05-08T09:30:00.000Z'
    },
    {
      id: 'demo-notification-dentist-progress',
      scope: 'profile',
      profileId: 'demo-profile-dentist-progress',
      title: 'Licenciamento em andamento',
      message: 'Seu curso de licenciamento está em progresso. Conclua os conteúdos e realize a prova.',
      type: 'biteplaner_dentist_licensing_progress',
      read: false,
      createdAt: '2026-05-07T10:30:00.000Z'
    },
    {
      id: 'demo-notification-dentist-licensed',
      scope: 'profile',
      profileId: 'demo-profile-dentist-licensed',
      title: 'Certificado emitido',
      message: 'Parabéns. Seu licenciamento Biteplaner está ativo e o certificado já pode ser baixado.',
      type: 'biteplaner_dentist_licensed',
      read: false,
      createdAt: '2026-05-03T14:00:00.000Z'
    },
    {
      id: 'demo-notification-lab-approved',
      scope: 'profile',
      profileId: 'demo-profile-lab-approved',
      title: 'Cadastro aprovado',
      message: 'Seu cadastro de laboratório foi aprovado pela Nexor. Realize o pagamento e avance pelo licenciamento.',
      type: 'biteplaner_lab_licensing_approved',
      read: false,
      createdAt: '2026-05-08T09:30:00.000Z'
    },
    {
      id: 'demo-notification-lab-progress',
      scope: 'profile',
      profileId: 'demo-profile-lab-progress',
      title: 'Licenciamento em andamento',
      message: 'Seu curso de licenciamento laboratorial está em progresso. Conclua os conteúdos e realize a prova.',
      type: 'biteplaner_lab_licensing_progress',
      read: false,
      createdAt: '2026-05-07T10:30:00.000Z'
    },
    {
      id: 'demo-notification-lab-licensed',
      scope: 'profile',
      profileId: 'demo-profile-lab-licensed',
      title: 'Certificado emitido',
      message: 'Parabéns. Seu licenciamento laboratorial Biteplaner está ativo e o certificado já pode ser baixado.',
      type: 'biteplaner_lab_licensed',
      read: false,
      createdAt: '2026-05-03T16:00:00.000Z'
    }
  ],
  counters: {
    consultationLinks: 1,
    partnerLinks: 2,
    timeline: 6,
    workflowVersions: 1,
    dentistLicensing: 0,
    notifications: 0
  }
});

let state = seedState();

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function isDemoPersona(value: string | null | undefined): value is DemoPersona {
  return (
    value === 'athleteRegistered' ||
    value === 'athlete' ||
    value === 'athletePrerequisite' ||
    value === 'athleteScheduling' ||
    value === 'athletePreConsultation' ||
    value === 'athleteClinicalDecision' ||
    value === 'athleteDentistForms' ||
    value === 'athletePayment' ||
    value === 'athleteTreatmentRequired' ||
    value === 'athleteLabProduction' ||
    value === 'athleteAdaptation' ||
    value === 'athleteFollowUp' ||
    value === 'athleteIneligible' ||
    value === 'athleteCancelled' ||
    value === 'partner' ||
    value === 'dentist' ||
    value === 'dentistApproved' ||
    value === 'dentistProgress' ||
    value === 'dentistLicensed' ||
    value === 'lab' ||
    value === 'labApproved' ||
    value === 'labProgress' ||
    value === 'labLicensed' ||
    value === 'admin'
  );
}

function isAccessMode(value: string | null | undefined): value is AccessMode {
  return value === 'user' || value === 'partner' || value === 'dentist' || value === 'lab' || value === 'admin';
}

function getHeaderValue(headers: RequestContext['requestHeaders'], targetName: string) {
  if (!headers) {
    return null;
  }

  if (headers instanceof Headers) {
    return headers.get(targetName);
  }

  const matchedKey = Object.keys(headers).find((key) => key.toLowerCase() === targetName.toLowerCase());
  return matchedKey ? headers[matchedKey] ?? null : null;
}

function readStoredPersona() {
  if (typeof window === 'undefined' || !window.localStorage) {
    return null;
  }

  return window.localStorage.getItem(ACTIVE_DEMO_PERSONA_STORAGE_KEY);
}

function resolvePersonaFromAuthorization(headers: RequestContext['requestHeaders']) {
  const authorization = getHeaderValue(headers, 'authorization');
  const token = authorization?.replace(/^Bearer\s+/i, '').trim();

  if (!token) {
    return null;
  }

  return state.sessions.find((session) => session.accessToken === token)?.persona ?? null;
}

function getPersonaUser(persona: DemoPersona) {
  const user = state.users.find((item) => item.persona === persona);

  if (!user) {
    throw new DemoStateError(500, 'missing_demo_user', `Missing demo user for persona ${persona}.`);
  }

  return user;
}

function getOrderOrThrow(orderId: string) {
  const order = state.orders.find((item) => item.id === orderId);

  if (!order) {
    throw new DemoStateError(404, 'order_not_found', `Demo order ${orderId} was not found.`);
  }

  return order;
}

function getAppointmentOrThrow(orderId: string, appointmentId: string) {
  const appointment = state.appointments.find(
    (item) => item.order_id === orderId && item.id === appointmentId
  );

  if (!appointment) {
    throw new DemoStateError(404, 'appointment_not_found', `Appointment ${appointmentId} was not found for ${orderId}.`);
  }

  return appointment;
}

function isOperationalDentistPersona(persona: DemoPersona) {
  return persona === 'dentist' || persona === 'dentistLicensed';
}

function isOperationalLabPersona(persona: DemoPersona) {
  return persona === 'lab' || persona === 'labLicensed';
}

function isCustomerPersona(persona: DemoPersona) {
  return persona === 'athleteRegistered' || persona === 'athlete' || Boolean(CUSTOMER_STAGE_ORDER_BY_PERSONA[persona]);
}

function canPersonaReadOrder(order: DemoOrder, persona: DemoPersona) {
  const scopedOrderId = CUSTOMER_STAGE_ORDER_BY_PERSONA[persona];

  if (scopedOrderId) {
    return order.id === scopedOrderId;
  }

  return (
    order.visibleTo.includes(persona) ||
    (isOperationalDentistPersona(persona) && order.visibleTo.includes('dentist')) ||
    (isOperationalLabPersona(persona) && order.visibleTo.includes('lab'))
  );
}

function getWorkflowFormOrThrow(orderId: string, workflowFormId: string) {
  const workflowForm = state.workflowForms.find(
    (item) => item.orderId === orderId && item.id === workflowFormId
  );

  if (!workflowForm) {
    throw new DemoStateError(404, 'workflow_form_not_found', `Workflow form ${workflowFormId} was not found for ${orderId}.`);
  }

  return workflowForm;
}

function createWorkflowSummary(
  payload: Record<string, unknown>,
  submittedAt: string,
  responseCount: number
): DemoWorkflowSummary {
  const numericValues = Object.values(payload).filter((value): value is number => typeof value === 'number');
  const comment = typeof payload.comment === 'string' ? payload.comment.trim() : '';

  return {
    scoreAverage:
      numericValues.length > 0
        ? Math.round((numericValues.reduce((sum, value) => sum + value, 0) / numericValues.length) * 100) / 100
        : null,
    hasComment: comment.length > 0,
    responseCount,
    submittedAt
  };
}

function sanitizeOrder(order: DemoOrder, activePersona: DemoPersona): OrderSummary {
  const pendingItems: string[] = [];
  const dentistUser = order.dentistId
    ? state.users.find((user) => user.dentistId === order.dentistId && user.roles.includes('dentist')) ?? null
    : null;

  if (order.status === 'awaiting_dentist_forms') {
    if (!order.flags.initialEvaluationCompleted) {
      pendingItems.push('Anamnese / avaliação inicial pendente');
    }

    if (!order.flags.productionFormCompleted) {
      pendingItems.push('Solicitação de produção pendente');
    }

    if (!order.flags.dentalArchFileAttached) {
      pendingItems.push('Escaneamento 3D intraoral pendente');
    }

    if (!(order.productionRequestDraft?.prescriptionFileName ?? '').trim()) {
      pendingItems.push('Prescrição médica assinada e carimbada pendente');
    }

    if (!order.flags.retentionAcknowledged) {
      pendingItems.push('Ciencia de responsabilidade e LGPD pendente');
    }

    if (!order.labId) {
      pendingItems.push('Laboratório licenciado ainda não selecionado');
    }
  }

  const canReadProductionRequestDraft = isOperationalDentistPersona(activePersona) || isOperationalLabPersona(activePersona);
  const canReadClinicalDraft = isOperationalDentistPersona(activePersona);

  return {
    id: order.id,
    checkoutOrderId: order.checkoutOrderId,
    status: order.status,
    statusLabel: order.statusLabel,
    stage: order.stage,
    created_at: order.created_at,
    customer_profile_id: order.customer_profile_id,
    user_profile_id: order.user_profile_id,
    practice_location_id: order.practice_location_id,
    customer: clone(order.customer),
    dentist: dentistUser
      ? {
          id: dentistUser.dentistId ?? dentistUser.id,
          full_name: dentistUser.fullName,
          email: dentistUser.email
        }
      : null,
    practice_location: clone(order.practice_location),
    prerequisiteSubmission:
      isCustomerPersona(activePersona) || activePersona === 'dentist'
        ? clone(order.prerequisiteSubmission ?? null)
        : null,
    productionRequestDraft: canReadProductionRequestDraft ? clone(order.productionRequestDraft) : null,
    preLabChecklistDraft: canReadClinicalDraft ? clone(order.preLabChecklistDraft) : null,
    operationalReadiness: {
      preLabReady: pendingItems.length === 0,
      pendingItems,
      summary:
        pendingItems.length === 0
          ? 'Ordem operacionalmente pronta para a próxima etapa.'
          : `Pendências antes da liberação: ${pendingItems.join('; ')}.`
    }
  };
}

function assertPersonaModeAccess(context: RequestContext | undefined, requestedMode: string | null | undefined) {
  const activePersona = resolveActiveDemoPersona(context);
  const user = getPersonaUser(activePersona);
  const defaultMode = user.defaultMode ?? PERSONA_MODE[activePersona];

  if (!requestedMode) {
    return defaultMode;
  }

  if (!isAccessMode(requestedMode)) {
    throw new DemoStateError(422, 'invalid_mode', `Mode ${requestedMode} is not a valid demo workspace.`);
  }

  if (requestedMode === 'user') {
    return requestedMode;
  }

  if (!(user.allowedModes ?? [defaultMode]).includes(requestedMode)) {
    throw new DemoStateError(
      403,
      'forbidden_mode',
      `Persona ${activePersona} cannot access the ${requestedMode} demo workspace.`
    );
  }

  return requestedMode;
}

function assertOrderReadAccess(orderId: string, context?: RequestContext) {
  const order = getOrderOrThrow(orderId);
  const activePersona = resolveActiveDemoPersona(context);

  if (!canPersonaReadOrder(order, activePersona)) {
    throw new DemoStateError(404, 'order_not_found', `Demo order ${orderId} is not visible for persona ${activePersona}.`);
  }

  return { order, activePersona };
}

function assertMutationAccess(orderId: string, action: DemoOrderAction, context?: RequestContext) {
  const { order, activePersona } = assertOrderReadAccess(orderId, context);

  if (activePersona === 'admin') {
    return order;
  }

  const customerActions: DemoOrderAction['type'][] = [
    'complete-prerequisite',
    'schedule-initial-consultation',
    'confirm-payment',
    'user-confirmation',
    'submit-workflow-form',
    'revise-workflow-form',
    'create-training-report'
  ];
  const allowedByPersona: Record<DemoPersona, DemoOrderAction['type'][]> = {
    athleteRegistered: customerActions,
    athlete: customerActions,
    athletePrerequisite: customerActions,
    athleteScheduling: customerActions,
    athletePreConsultation: customerActions,
    athleteClinicalDecision: customerActions,
    athleteDentistForms: customerActions,
    athletePayment: customerActions,
    athleteTreatmentRequired: customerActions,
    athleteLabProduction: customerActions,
    athleteAdaptation: customerActions,
    athleteFollowUp: customerActions,
    athleteIneligible: customerActions,
    athleteCancelled: customerActions,
    partner: [],
    dentist: [
      'dentist-confirmation',
      'accept-initial-consultation',
      'complete-match',
      'no-show',
      'register-clinical-decision',
      'save-production-request-draft',
      'complete-production-request',
      'save-pre-lab-checklist-draft',
      'complete-pre-lab-checklist',
      'send-to-lab',
      'product-received',
      'adaptation-completed',
      'submit-workflow-form',
      'revise-workflow-form'
    ],
    dentistApproved: [],
    dentistProgress: [],
    dentistLicensed: [
      'dentist-confirmation',
      'accept-initial-consultation',
      'complete-match',
      'no-show',
      'register-clinical-decision',
      'save-production-request-draft',
      'complete-production-request',
      'save-pre-lab-checklist-draft',
      'complete-pre-lab-checklist',
      'send-to-lab',
      'product-received',
      'adaptation-completed',
      'submit-workflow-form',
      'revise-workflow-form'
    ],
    lab: ['submit-workflow-form', 'revise-workflow-form', 'lab-production-started', 'lab-return-for-adjustment', 'lab-production-completed'],
    labApproved: [],
    labProgress: [],
    labLicensed: ['submit-workflow-form', 'revise-workflow-form', 'lab-production-started', 'lab-return-for-adjustment', 'lab-production-completed'],
    admin: []
  };

  if (!allowedByPersona[activePersona].includes(action.type)) {
    throw new DemoStateError(
      403,
      'forbidden_action',
      `Persona ${activePersona} cannot execute action ${action.type} for order ${orderId}.`
    );
  }

  return order;
}

function pushTimeline(orderId: string, toStatus: string, reason: string | null) {
  const order = getOrderOrThrow(orderId);

  state.counters.timeline += 1;
  state.timelineEvents.push({
    id: `timeline-${String(state.counters.timeline).padStart(3, '0')}`,
    orderId,
    fromStatus: order.status,
    toStatus,
    reason,
    createdAt: new Date().toISOString()
  });
}

function updateOrderStatus(
  orderId: string,
  nextStatus: string,
  nextLabel: string,
  nextStage: string,
  reason: string | null
) {
  const order = getOrderOrThrow(orderId);

  pushTimeline(orderId, nextStatus, reason);
  order.status = nextStatus;
  order.statusLabel = nextLabel;
  order.stage = nextStage;
}

export function parseClinicalDecisionPayload(
  payload: Record<string, unknown>
): Extract<DemoOrderAction, { type: 'register-clinical-decision' }> {
  const decision = payload.decision;

  if (decision !== 'eligible' && decision !== 'ineligible' && decision !== 'treatment_required') {
    throw new DemoStateError(
      422,
      'invalid_clinical_decision',
      'Clinical decision payload must include eligible, ineligible, or treatment_required.'
    );
  }

  return {
    type: 'register-clinical-decision' as const,
    decision,
    reason: typeof payload.reason === 'string' ? payload.reason : undefined
  };
}

export function resolveActiveDemoPersona(context?: RequestContext): DemoPersona {
  const personaFromHeader = getHeaderValue(context?.requestHeaders, 'x-demo-persona');

  if (isDemoPersona(personaFromHeader)) {
    return personaFromHeader;
  }

  const personaFromAuthorization = resolvePersonaFromAuthorization(context?.requestHeaders);

  if (isDemoPersona(personaFromAuthorization)) {
    return personaFromAuthorization;
  }

  const personaFromStorage = readStoredPersona();

  if (isDemoPersona(personaFromStorage)) {
    return personaFromStorage;
  }

  return DEFAULT_PERSONA;
}

export function setActiveDemoPersona(persona: DemoPersona) {
  if (typeof window !== 'undefined' && window.localStorage) {
    window.localStorage.setItem(ACTIVE_DEMO_PERSONA_STORAGE_KEY, persona);
  }
}

export function resetDemoState() {
  state = seedState();
}

export function getDemoStateSnapshot() {
  return clone(state);
}

export function getAuthPayload(context?: RequestContext) {
  const user = getPersonaUser(resolveActiveDemoPersona(context));

  return {
    user: {
      id: user.id,
      authUserId: user.authUserId,
      email: user.email,
      profileId: user.profileId,
      roles: clone(user.roles),
      productRoles: getProductRoles(context),
      clinicIds: clone(user.clinicIds),
      dentistId: user.dentistId,
      partnerId: user.partnerId,
      labId: user.labId
    }
  };
}

function roleForMode(mode: AccessMode): ProductRolePayload['role'] | null {
  if (mode === 'user') {
    return 'customer';
  }

  if (mode === 'partner' || mode === 'dentist' || mode === 'lab') {
    return mode;
  }

  return null;
}

function generatedProductRoles(user: DemoUser): ProductRolePayload[] {
  return user.roles
    .filter((role): role is ProductRolePayload['role'] =>
      role === 'customer' || role === 'partner' || role === 'dentist' || role === 'lab'
    )
    .map((role) => ({
      id: `demo-product-role-${user.profileId}-${role}`,
      productKey: 'biteplaner',
      role,
      status: 'active',
      metadata: {},
      createdAt: '2026-05-01T09:00:00.000Z',
      updatedAt: '2026-05-01T09:00:00.000Z'
    }));
}

export function getProductRoles(context?: RequestContext) {
  const user = getPersonaUser(resolveActiveDemoPersona(context));
  return clone(user.productRoles ?? generatedProductRoles(user));
}

function mapNotificationForProfile(notification: AccountNotification, profileId: string) {
  const scope = notification.scope ?? 'profile';
  const readAt =
    scope === 'global'
      ? notification.readAtByProfileId?.[profileId] ?? null
      : notification.read
        ? notification.readAt ?? notification.createdAt
        : null;

  return {
    id: notification.id,
    scope,
    profileId: notification.profileId,
    title: notification.title,
    message: notification.message,
    type: notification.type,
    read: readAt !== null,
    readAt,
    metadata: clone(notification.metadata ?? {}),
    createdAt: notification.createdAt
  };
}

function isReviewWorkflowTemplate(templateKey: string) {
  return templateKey.endsWith('_review_by_customer') ||
    templateKey.endsWith('_review_by_dentist') ||
    templateKey.endsWith('_review_by_lab');
}

function assertReviewPayloadScale(templateKey: string, payload: Record<string, unknown>) {
  if (!isReviewWorkflowTemplate(templateKey)) {
    return;
  }

  const invalidEntry = Object.entries(payload).find(([, value]) => {
    if (typeof value !== 'number') {
      return false;
    }

    return !Number.isInteger(value) || value < 1 || value > 5;
  });

  if (invalidEntry) {
    throw new DemoStateError(
      422,
      'invalid_review_score',
      'As notas de survey devem estar entre 1 e 5 estrelas.'
    );
  }
}

function getVisibleNotification(notificationId: string, profileId: string) {
  const notification = state.notifications.find((item) => item.id === notificationId);

  if (notification === undefined) {
    throw new DemoStateError(404, 'notification_not_found', 'Demo notification not found.');
  }

  const scope = notification.scope ?? 'profile';

  if (scope === 'profile' && notification.profileId !== profileId) {
    throw new DemoStateError(404, 'notification_not_found', 'Demo notification not found.');
  }

  return notification;
}

export function listAccountNotifications(
  context?: RequestContext,
  filters: { status?: string | null; limit?: number } = {}
) {
  const user = getPersonaUser(resolveActiveDemoPersona(context));
  const notifications = state.notifications
    .filter((notification) => {
      const scope = notification.scope ?? 'profile';
      return scope === 'global' || notification.profileId === user.profileId;
    })
    .map((notification) => mapNotificationForProfile(notification, user.profileId))
    .sort((left, right) => right.createdAt.localeCompare(left.createdAt));

  const unreadCount = notifications.filter((notification) => !notification.read).length;
  const status = filters.status ?? 'all';
  const limit = filters.limit ?? 30;
  const filtered =
    status === 'read'
      ? notifications.filter((notification) => notification.read)
      : status === 'unread'
        ? notifications.filter((notification) => !notification.read)
        : notifications;

  return {
    notifications: clone(filtered.slice(0, limit)),
    unreadCount
  };
}

export function markAccountNotificationRead(notificationId: string, context?: RequestContext) {
  const user = getPersonaUser(resolveActiveDemoPersona(context));
  const notification = getVisibleNotification(notificationId, user.profileId);
  const readAt = new Date().toISOString();

  if ((notification.scope ?? 'profile') === 'global') {
    notification.readAtByProfileId = {
      ...(notification.readAtByProfileId ?? {}),
      [user.profileId]: readAt
    };
  } else {
    notification.read = true;
    notification.readAt = readAt;
  }

  return { notification: mapNotificationForProfile(notification, user.profileId) };
}

export function markAccountNotificationUnread(notificationId: string, context?: RequestContext) {
  const user = getPersonaUser(resolveActiveDemoPersona(context));
  const notification = getVisibleNotification(notificationId, user.profileId);

  if ((notification.scope ?? 'profile') === 'global') {
    const readAtByProfileId = { ...(notification.readAtByProfileId ?? {}) };
    delete readAtByProfileId[user.profileId];
    notification.readAtByProfileId = readAtByProfileId;
  } else {
    notification.read = false;
    notification.readAt = null;
  }

  return { notification: mapNotificationForProfile(notification, user.profileId) };
}

function ensureInitialCustomerOrder(user: DemoUser, activePersona: DemoPersona, now: string) {
  if (state.orders.some((order) => order.customer_profile_id === user.profileId)) {
    return;
  }

  const orderId = `BP-DEMO-${user.profileId.replace(/^demo-profile-/, '').toUpperCase()}-001`;
  const practiceLocation = DEMO_PRACTICE_LOCATION_CATALOG['practice-demo-001'];

  state.orders.push({
    id: orderId,
    status: 'registration_started',
    statusLabel: 'Cadastro inicial pendente',
    stage: 'new_user_onboarding',
    created_at: now,
    customer_profile_id: user.profileId,
    user_profile_id: user.id,
    practice_location_id: practiceLocation.id,
    customer: {
      id: user.profileId,
      full_name: user.fullName,
      email: user.email,
      phone: user.phone
    },
    practice_location: clone(practiceLocation),
    partnerId: null,
    dentistId: null,
    labId: null,
    visibleTo: [activePersona, 'admin'],
    nextActions: ['submit-workflow-form'],
    productionRequestDraft: null,
    preLabChecklistDraft: null,
    flags: {
      preRequisiteComplete: false,
      eligible: null,
      paymentConfirmed: false,
      productionFormCompleted: false,
      initialEvaluationCompleted: false,
      retentionAcknowledged: false,
      dentalArchFileAttached: false,
      sentToLab: false,
      productReceived: false
    }
  });

  state.workflowForms.push(
    {
      id: `BP-WF-${orderId.replace(/^BP-DEMO-/, '')}-ONBOARDING`,
      orderId,
      templateKey: 'customer_new_user_onboarding',
      stepKey: 'new_user_onboarding',
      status: 'pending',
      canViewPayload: true,
      summary: null,
      releasedAt: now,
      submittedAt: null,
      payload: null
    },
    {
      id: `BP-WF-${orderId.replace(/^BP-DEMO-/, '')}-INTAKE`,
      orderId,
      templateKey: 'customer_pre_consultation_intake',
      stepKey: 'pre_requisite_pending',
      status: 'pending',
      roleState: { customer: 'pending', dentist: 'locked' },
      customerSubmittedAt: null,
      dentistReviewStartedAt: null,
      dentistSubmittedAt: null,
      canViewPayload: true,
      summary: null,
      releasedAt: now,
      submittedAt: null,
      payload: null
    }
  );
}

export function createAccountNotification(
  payload: {
    scope?: 'global' | 'profile';
    profileId?: string | null;
    title?: string;
    message?: string;
    type?: string;
    metadata?: Record<string, unknown>;
  },
  context?: RequestContext
) {
  const activePersona = resolveActiveDemoPersona(context);

  if (activePersona !== 'admin') {
    throw new DemoStateError(403, 'forbidden', 'Only admin can create demo notifications.');
  }

  const scope = payload.scope ?? 'profile';

  if (scope === 'profile' && !payload.profileId) {
    throw new DemoStateError(400, 'invalid_notification', 'profileId is required for profile notifications.');
  }

  state.counters.notifications += 1;

  const notification: AccountNotification = {
    id: `demo-notification-admin-${state.counters.notifications}`,
    scope,
    profileId: scope === 'profile' ? payload.profileId ?? null : null,
    title: payload.title ?? 'Notificação Nexor',
    message: payload.message ?? 'Nova atualização disponível no painel Nexor.',
    type: payload.type ?? 'nexor_general_update',
    read: false,
    readAt: null,
    readAtByProfileId: scope === 'global' ? {} : undefined,
    metadata: payload.metadata ?? {},
    createdAt: new Date().toISOString()
  };

  state.notifications.push(notification);

  return { notification: mapNotificationForProfile(notification, getPersonaUser(activePersona).profileId) };
}

export function createProductRole(
  context: RequestContext | undefined,
  role: ProductRolePayload['role'],
  metadata: Record<string, unknown>
) {
  const activePersona = resolveActiveDemoPersona(context);
  const user = getPersonaUser(activePersona);
  const current = user.productRoles ?? generatedProductRoles(user);
  const existing = current.find((item) => item.productKey === 'biteplaner' && item.role === role);

  if (existing) {
    user.productRoles = current;
    return clone(existing);
  }

  const now = new Date().toISOString();
  const productRole: ProductRolePayload = {
    id: `demo-product-role-${user.profileId}-${role}`,
    productKey: 'biteplaner',
    role,
    status: role === 'customer' ? 'active' : 'pending',
    metadata,
    createdAt: now,
    updatedAt: now
  };

  user.productRoles = [...current, productRole];

  if (role === 'customer' && !user.roles.includes('customer')) {
    user.roles = [...user.roles, 'customer'];
  }

  if (role === 'customer' && !user.enrollment) {
    user.enrollment = {
      id: `demo-enrollment-${user.profileId}`,
      status: 'active',
      source_type: 'self_service',
      created_at: now
    };
  }

  if (role === 'customer') {
    ensureInitialCustomerOrder(user, activePersona, now);
  }

  return clone(productRole);
}

function mapDentistLicenseRequest(role: ProductRolePayload, user: DemoUser) {
  const metadata = role.metadata;
  const practiceLocations = Array.isArray(metadata.practiceLocations)
    ? metadata.practiceLocations
    : metadata.practiceLocation
      ? [metadata.practiceLocation]
      : [];
  const workflow = state.dentistLicensingWorkflows.find((item) => item.productRoleId === role.id);

  return {
    id: role.id,
    profileId: user.profileId,
    status: role.status,
    workflowStatus: workflow?.status ?? (role.status === 'rejected' ? 'admin_rejected' : 'admin_review_pending'),
    dentistName: typeof metadata.fullName === 'string' ? metadata.fullName : user.fullName,
    croNumber: typeof metadata.croNumber === 'string' ? metadata.croNumber : '',
    professionalSummary: typeof metadata.professionalSummary === 'string' ? metadata.professionalSummary : '',
    submittedAt: role.createdAt,
    practiceLocations,
    metadata
  };
}

function mapLabLicenseRequest(role: ProductRolePayload, user: DemoUser) {
  const metadata = role.metadata;
  const locations = Array.isArray(metadata.locations)
    ? metadata.locations
    : metadata.location
      ? [metadata.location]
      : [];
  const workflow = state.dentistLicensingWorkflows.find((item) => item.productRoleId === role.id);

  return {
    id: role.id,
    profileId: user.profileId,
    status: role.status,
    workflowStatus: workflow?.status ?? (role.status === 'rejected' ? 'admin_rejected' : 'admin_review_pending'),
    labName: typeof metadata.labName === 'string' ? metadata.labName : user.fullName,
    cnpj: typeof metadata.cnpj === 'string' ? metadata.cnpj : '',
    professionalSummary: typeof metadata.professionalSummary === 'string' ? metadata.professionalSummary : '',
    submittedAt: role.createdAt,
    locations,
    metadata
  };
}

function mapPartnerRequest(role: ProductRolePayload, user: DemoUser) {
  const metadata = role.metadata;

  return {
    id: role.id,
    profileId: user.profileId,
    status: role.status,
    partnerName: typeof metadata.name === 'string' ? metadata.name : user.fullName,
    documentType: typeof metadata.documentType === 'string' ? metadata.documentType : 'cnpj',
    documentNumber: typeof metadata.documentNumber === 'string' ? metadata.documentNumber : '',
    contactEmail: typeof metadata.contactEmail === 'string' ? metadata.contactEmail : user.email,
    cityState: typeof metadata.cityState === 'string' ? metadata.cityState : '',
    channels: typeof metadata.channels === 'string' ? metadata.channels : '',
    submittedAt: role.createdAt,
    metadata
  };
}

export function listDentistLicenseRequests(status?: string) {
  const requests = state.users.flatMap((user) =>
    (user.productRoles ?? [])
      .filter((role) => role.productKey === 'biteplaner' && role.role === 'dentist')
      .filter((role) => !status || role.status === status)
      .map((role) => mapDentistLicenseRequest(role, user))
  );

  return { requests };
}

export function listPartnerRequests(status?: string) {
  const requests = state.users.flatMap((user) =>
    (user.productRoles ?? [])
      .filter((role) => role.productKey === 'biteplaner' && role.role === 'partner')
      .filter((role) => !status || role.status === status)
      .map((role) => mapPartnerRequest(role, user))
  );

  return { requests };
}

export function listLabLicenseRequests(status?: string) {
  const requests = state.users.flatMap((user) =>
    (user.productRoles ?? [])
      .filter((role) => role.productKey === 'biteplaner' && role.role === 'lab')
      .filter((role) => !status || role.status === status)
      .map((role) => mapLabLicenseRequest(role, user))
  );

  return { requests };
}

export function approveDentistLicenseRequest(productRoleId: string) {
  const user = state.users.find((candidate) =>
    candidate.productRoles?.some((role) => role.id === productRoleId)
  );
  const role = user?.productRoles?.find((item) => item.id === productRoleId);

  if (!user || !role) {
    throw new DemoStateError(404, 'request_not_found', 'Solicitação de dentista não encontrada.');
  }

  role.status = 'active';
  role.updatedAt = new Date().toISOString();
  if (!user.roles.includes('dentist')) user.roles.push('dentist');
  user.allowedModes = Array.from(new Set([...(user.allowedModes ?? []), 'dentist']));

  state.counters.dentistLicensing += 1;
  const workflow: DentistLicensingWorkflow = {
    id: `demo-dentist-licensing-${state.counters.dentistLicensing}`,
    profileId: user.profileId,
    productRoleId: role.id,
    dentistId: user.dentistId,
    status: 'approved_pending_payment',
    paymentStatus: 'not_started',
    testAttempts: 0,
    testPassed: false,
    certificateIssuedAt: null,
    metadata: { courseProgress: {} }
  };
  state.dentistLicensingWorkflows = [
    ...state.dentistLicensingWorkflows.filter((item) => item.productRoleId !== role.id),
    workflow
  ];

  state.counters.notifications += 1;
  state.notifications.push({
    id: `demo-notification-${state.counters.notifications}`,
    profileId: user.profileId,
    title: 'Cadastro aprovado',
    message: 'Seu cadastro foi aprovado pela Nexor. Realize o pagamento e avance pelo licenciamento.',
    type: 'biteplaner_dentist_licensing_approved',
    read: false,
    createdAt: new Date().toISOString()
  });

  return { request: mapDentistLicenseRequest(role, user) };
}

export function approveLabLicenseRequest(productRoleId: string) {
  const user = state.users.find((candidate) =>
    candidate.productRoles?.some((role) => role.id === productRoleId)
  );
  const role = user?.productRoles?.find((item) => item.id === productRoleId);

  if (!user || !role) {
    throw new DemoStateError(404, 'request_not_found', 'Solicitação de laboratório não encontrada.');
  }

  role.status = 'active';
  role.updatedAt = new Date().toISOString();
  if (!user.roles.includes('lab')) user.roles.push('lab');
  user.allowedModes = Array.from(new Set([...(user.allowedModes ?? []), 'lab']));

  state.counters.dentistLicensing += 1;
  const workflow: DentistLicensingWorkflow = {
    id: `demo-lab-licensing-${state.counters.dentistLicensing}`,
    profileId: user.profileId,
    productRoleId: role.id,
    dentistId: null,
    status: 'approved_pending_payment',
    paymentStatus: 'not_started',
    testAttempts: 0,
    testPassed: false,
    certificateIssuedAt: null,
    metadata: { courseProgress: {}, licenseeType: 'lab' }
  };
  state.dentistLicensingWorkflows = [
    ...state.dentistLicensingWorkflows.filter((item) => item.productRoleId !== role.id),
    workflow
  ];

  state.counters.notifications += 1;
  state.notifications.push({
    id: `demo-notification-${state.counters.notifications}`,
    profileId: user.profileId,
    title: 'Cadastro aprovado',
    message: 'Seu cadastro de laboratório foi aprovado pela Nexor. Realize o pagamento e avance pelo licenciamento.',
    type: 'biteplaner_lab_licensing_approved',
    read: false,
    createdAt: new Date().toISOString()
  });

  return { request: mapLabLicenseRequest(role, user) };
}

export function approvePartnerRequest(productRoleId: string) {
  const user = state.users.find((candidate) =>
    candidate.productRoles?.some((role) => role.id === productRoleId)
  );
  const role = user?.productRoles?.find((item) => item.id === productRoleId);

  if (!user || !role) {
    throw new DemoStateError(404, 'request_not_found', 'Solicitação de parceiro não encontrada.');
  }

  const now = new Date().toISOString();
  const partnerCode = `PARTNER-${user.profileId.replace(/-/g, '').slice(0, 8).toUpperCase()}`;
  role.status = 'active';
  role.updatedAt = now;
  role.metadata = {
    ...role.metadata,
    adminReview: { status: 'approved', approvedAt: now },
    partnerCode
  };
  if (!user.roles.includes('partner')) user.roles.push('partner');
  user.allowedModes = Array.from(new Set([...(user.allowedModes ?? []), 'partner']));

  state.counters.notifications += 1;
  state.notifications.push({
    id: `demo-notification-${state.counters.notifications}`,
    profileId: user.profileId,
    title: 'Cadastro aprovado',
    message: 'Seu cadastro de parceiro foi aprovado pela Nexor. Agora você pode gerar links de indicação.',
    type: 'biteplaner_partner_approved',
    read: false,
    createdAt: now
  });

  return { request: mapPartnerRequest(role, user) };
}

export function rejectDentistLicenseRequest(productRoleId: string, reason: string) {
  const user = state.users.find((candidate) =>
    candidate.productRoles?.some((role) => role.id === productRoleId)
  );
  const role = user?.productRoles?.find((item) => item.id === productRoleId);

  if (!user || !role) {
    throw new DemoStateError(404, 'request_not_found', 'Solicitação de dentista não encontrada.');
  }

  role.status = 'rejected';
  role.updatedAt = new Date().toISOString();
  role.metadata = { ...role.metadata, adminReview: { status: 'rejected', reason } };

  return { request: mapDentistLicenseRequest(role, user) };
}

export function rejectLabLicenseRequest(productRoleId: string, reason: string) {
  const user = state.users.find((candidate) =>
    candidate.productRoles?.some((role) => role.id === productRoleId)
  );
  const role = user?.productRoles?.find((item) => item.id === productRoleId);

  if (!user || !role) {
    throw new DemoStateError(404, 'request_not_found', 'Solicitação de laboratório não encontrada.');
  }

  role.status = 'rejected';
  role.updatedAt = new Date().toISOString();
  role.metadata = { ...role.metadata, adminReview: { status: 'rejected', reason } };

  return { request: mapLabLicenseRequest(role, user) };
}

export function rejectPartnerRequest(productRoleId: string, reason: string) {
  const user = state.users.find((candidate) =>
    candidate.productRoles?.some((role) => role.id === productRoleId)
  );
  const role = user?.productRoles?.find((item) => item.id === productRoleId);

  if (!user || !role) {
    throw new DemoStateError(404, 'request_not_found', 'Solicitação de parceiro não encontrada.');
  }

  role.status = 'rejected';
  role.updatedAt = new Date().toISOString();
  role.metadata = { ...role.metadata, adminReview: { status: 'rejected', reason } };

  return { request: mapPartnerRequest(role, user) };
}

const DENTIST_LICENSING_COURSE = [
  {
    id: 'fundamentos',
    title: 'Fundamentos clínicos do Biteplaner',
    videoTitle: 'Vídeo 1 - Fundamentos clínicos',
    documentTitle: 'Protocolo clínico Biteplaner'
  },
  {
    id: 'operacao',
    title: 'Fluxo operacional e documentação',
    videoTitle: 'Vídeo 2 - Operação e documentação',
    documentTitle: 'Checklist operacional'
  },
  {
    id: 'qualidade',
    title: 'Acompanhamento, qualidade e boas práticas',
    videoTitle: 'Vídeo 3 - Qualidade e acompanhamento',
    documentTitle: 'Guia de acompanhamento'
  }
];

const LAB_LICENSING_COURSE = [
  {
    id: 'fundamentos',
    title: 'Fundamentos laboratoriais do Biteplaner',
    videoTitle: 'Vídeo 1 - Fundamentos laboratoriais',
    documentTitle: 'Protocolo laboratorial Biteplaner'
  },
  {
    id: 'operacao',
    title: 'Fluxo de produção e documentação',
    videoTitle: 'Vídeo 2 - Produção e documentação',
    documentTitle: 'Checklist de produção'
  },
  {
    id: 'qualidade',
    title: 'Controle de qualidade e rastreabilidade',
    videoTitle: 'Vídeo 3 - Qualidade e rastreabilidade',
    documentTitle: 'Guia de controle laboratorial'
  }
];

export function getDentistLicensing(context?: RequestContext) {
  const user = getPersonaUser(resolveActiveDemoPersona(context));
  const workflow = state.dentistLicensingWorkflows.find((item) => item.profileId === user.profileId) ?? null;
  return {
    workflow: clone(workflow),
    course: clone(DENTIST_LICENSING_COURSE),
    notifications: clone(state.notifications.filter((item) => item.profileId === user.profileId))
  };
}

export function getLabLicensing(context?: RequestContext) {
  const user = getPersonaUser(resolveActiveDemoPersona(context));
  const workflow = state.dentistLicensingWorkflows.find((item) => item.profileId === user.profileId) ?? null;
  return {
    workflow: clone(workflow),
    course: clone(LAB_LICENSING_COURSE),
    notifications: clone(state.notifications.filter((item) => item.profileId === user.profileId))
  };
}

export function updateDentistLicensing(context: RequestContext | undefined, action: string, payload: Record<string, unknown> = {}) {
  const user = getPersonaUser(resolveActiveDemoPersona(context));
  const workflow = state.dentistLicensingWorkflows.find((item) => item.profileId === user.profileId);

  if (!workflow) {
    throw new DemoStateError(404, 'workflow_not_found', 'Fluxo de licenciamento não encontrado.');
  }

  if (action === 'payment') {
    workflow.status = 'payment_confirmed_pending_intention_contract';
    workflow.paymentStatus = 'confirmed';
  } else if (action === 'intention') {
    workflow.status = 'course_in_progress';
  } else if (action === 'course') {
    const progress = (workflow.metadata.courseProgress ?? {}) as Record<string, unknown>;
    workflow.metadata.courseProgress = { ...progress, [String(payload.contentId)]: payload.completed === true };
  } else if (action === 'test') {
    workflow.testAttempts += 1;
    workflow.testPassed = true;
    workflow.status = 'licensing_contract_pending';
  } else if (action === 'licensing') {
    workflow.status = 'licensed';
    workflow.certificateIssuedAt = new Date().toISOString();
  } else if (action === 'distrato') {
    workflow.status = 'distrato_signed';
  }

  return { workflow: clone(workflow) };
}

export function updateLabLicensing(context: RequestContext | undefined, action: string, payload: Record<string, unknown> = {}) {
  return updateDentistLicensing(context, action, payload);
}

export function getEnrollment(context?: RequestContext) {
  const user = getPersonaUser(resolveActiveDemoPersona(context));
  return clone(user.enrollment ?? null);
}

export function getAccessOptions(context?: RequestContext): AccessPayload {
  const user = getPersonaUser(resolveActiveDemoPersona(context));
  const defaultMode = user.defaultMode ?? PERSONA_MODE[resolveActiveDemoPersona(context)];
  const allowedModes = new Set(user.allowedModes ?? [defaultMode]);
  const productRoles = getProductRoles(context);

  return {
    productKey: 'biteplaner',
    defaultMode,
    enrollment: clone(user.enrollment ?? null),
    modes: (['user', 'partner', 'dentist', 'lab', 'admin'] as AccessMode[]).map((mode) => {
      const productRole = roleForMode(mode);
      const status = productRole
        ? productRoles.find((item) => item.role === productRole)?.status ?? (allowedModes.has(mode) ? 'active' : 'missing')
        : allowedModes.has(mode)
          ? 'active'
          : 'missing';
      const allowed = mode === 'user' ? true : allowedModes.has(mode) && status === 'active';

      return {
        key: mode,
        label: MODE_LABELS[mode],
        description: MODE_DESCRIPTIONS[mode],
        allowed,
        highlighted: mode === defaultMode,
        status,
        reason: allowed
          ? null
          : status === 'pending'
            ? `Sua solicitação para ${MODE_LABELS[mode].toLowerCase()} está em análise.`
            : `Este perfil demo não opera no modo ${MODE_LABELS[mode].toLowerCase()}.`
      };
    })
  };
}

export function listOrders(context?: RequestContext, requestedMode?: string | null) {
  assertPersonaModeAccess(context, requestedMode);
  const activePersona = resolveActiveDemoPersona(context);

  return {
    orders: state.orders
      .filter((order) => canPersonaReadOrder(order, activePersona))
      .map((order) => sanitizeOrder(order, activePersona))
  };
}

export function getAppointments(orderId: string, context?: RequestContext) {
  assertOrderReadAccess(orderId, context);

  return {
    appointments: state.appointments
      .filter((appointment) => appointment.order_id === orderId)
      .map((appointment) => clone(appointment))
  };
}

export function getTimelineEvents(orderId: string, context?: RequestContext) {
  assertOrderReadAccess(orderId, context);

  return {
    events: state.timelineEvents
      .filter((event) => event.orderId === orderId)
      .map((event) => clone(event))
  };
}

export function getOrderForms(orderId: string, context?: RequestContext) {
  assertOrderReadAccess(orderId, context);

  return {
    forms: state.orderForms
      .filter((form) => form.orderId === orderId)
      .map((form) => {
        const { orderId: _ignoredOrderId, ...rest } = form;
        return clone(rest);
      })
  };
}

export function getWorkflowForms(orderId: string, context?: RequestContext) {
  assertOrderReadAccess(orderId, context);

  return {
    forms: state.workflowForms
      .filter((form) => form.orderId === orderId)
      .map((form) => clone(form))
  };
}

export function getWorkflowForm(orderId: string, workflowFormId: string, context?: RequestContext) {
  const { activePersona } = assertOrderReadAccess(orderId, context);
  const workflowForm = clone(getWorkflowFormOrThrow(orderId, workflowFormId));

  if (!workflowForm.canViewPayload && activePersona !== 'admin') {
    workflowForm.payload = null;
  }

  return workflowForm;
}

export function getWorkflowVersions(orderId: string, workflowFormId: string, context?: RequestContext) {
  assertOrderReadAccess(orderId, context);
  getWorkflowFormOrThrow(orderId, workflowFormId);

  return {
    versions: state.workflowFormVersions
      .filter((version) => version.workflowFormId === workflowFormId)
      .map((version) => clone(version))
  };
}

export function getPartnerInviteLinks(context?: RequestContext) {
  const activePersona = resolveActiveDemoPersona(context);

  if (activePersona !== 'partner') {
    throw new DemoStateError(403, 'forbidden_partner_data', 'Partner invite data is only available for the partner demo persona.');
  }

  const user = getPersonaUser(activePersona);
  const partnerId = user.partnerId;

  if (!partnerId) {
    throw new DemoStateError(404, 'partner_not_found', `Partner persona ${activePersona} is missing a partner id.`);
  }

  const linkedOrderIds = new Set(
    state.leads.filter((lead) => lead.partnerId === partnerId).map((lead) => lead.orderId)
  );

  return {
    inviteLinks: state.partnerLinks
      .filter((link) => link.partnerId === partnerId)
      .map((link) => clone(link)),
    leads: state.leads
      .filter((lead) => lead.partnerId === partnerId)
      .map((lead) => ({
        ...clone(lead),
        orderStatus: state.orders.find((order) => order.id === lead.orderId)?.statusLabel ?? null
      })),
    summary: {
      leadsCaptured: state.leads.filter((lead) => lead.partnerId === partnerId).length,
      convertedToAccount: state.leads.filter(
        (lead) => lead.partnerId === partnerId && lead.funnelStage !== 'lead_captured'
      ).length,
      activeOrders: state.orders.filter((order) => linkedOrderIds.has(order.id)).length
    }
  };
}

export function createPartnerInviteLink(
  payload: { customerName?: string; customerEmail?: string | null },
  context?: RequestContext
) {
  const activePersona = resolveActiveDemoPersona(context);

  if (activePersona !== 'partner') {
    throw new DemoStateError(403, 'forbidden_partner_data', 'Partner invite data is only available for the partner demo persona.');
  }

  const user = getPersonaUser(activePersona);
  const partnerId = user.partnerId;
  const customerName = payload.customerName?.trim();
  const customerEmail = payload.customerEmail?.trim() ?? null;

  if (!partnerId) {
    throw new DemoStateError(404, 'partner_not_found', `Partner persona ${activePersona} is missing a partner id.`);
  }

  if (!customerName) {
    throw new DemoStateError(422, 'missing_customer_name', 'A partner invite link in the demo requires a qualified customer name.');
  }

  state.counters.partnerLinks += 1;
  const sequence = String(state.counters.partnerLinks).padStart(3, '0');
  const createdAt = new Date().toISOString();
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 14).toISOString();

  const inviteLink: DemoPartnerLink = {
    id: `partner-link-generated-${sequence}`,
    partnerId,
    token: `bp-partner-qualified-${sequence}`,
    status: 'active',
    intendedCustomerName: customerName,
    intendedCustomerEmail: customerEmail,
    created_at: createdAt,
    expires_at: expiresAt,
    consumed_at: null
  };

  state.partnerLinks.unshift(inviteLink);

  return {
    inviteLink: clone(inviteLink)
  };
}

export function inspectPartnerInviteToken(token: string) {
  const inviteLink = state.partnerLinks.find((link) => link.token === token);

  if (!inviteLink) {
    return { inviteLink: { token, status: 'invalid', partner: null } };
  }

  const partner = state.users.find((item) => item.partnerId === inviteLink.partnerId);
  const partnerSummary = partner ? { id: inviteLink.partnerId, name: partner.fullName } : null;

  if (!partner || !partner.roles.includes('partner')) {
    return { inviteLink: { token, status: 'invalid', partner: partnerSummary } };
  }

  if (inviteLink.status !== 'active') {
    return { inviteLink: { token, status: inviteLink.status, partner: partnerSummary } };
  }

  if (inviteLink.expires_at && new Date(inviteLink.expires_at).getTime() <= Date.now()) {
    return { inviteLink: { token, status: 'expired', partner: partnerSummary } };
  }

  if (inviteLink.consumed_at) {
    return { inviteLink: { token, status: 'consumed', partner: partnerSummary } };
  }

  return { inviteLink: { token, status: 'valid', partner: partnerSummary } };
}

export function applyOrderAction(orderId: string, action: DemoOrderAction, context?: RequestContext) {
  assertMutationAccess(orderId, action, context);

  if (
    action.type === 'user-confirmation' ||
    action.type === 'dentist-confirmation' ||
    action.type === 'complete-match' ||
    action.type === 'no-show'
  ) {
    const appointment = getAppointmentOrThrow(orderId, action.appointmentId);

    if (action.type === 'user-confirmation') {
      appointment.user_confirmed_at = new Date().toISOString();
      if (appointment.dentist_confirmed_at) {
        updateOrderStatus(
          orderId,
          'appointment_confirmed',
          'Aguardando decisão clínica',
          'awaiting_clinical_decision',
          'Consulta confirmada por paciente e dentista na demo.'
        );
      }
      return clone(appointment);
    }

    if (action.type === 'dentist-confirmation') {
      appointment.dentist_confirmed_at = new Date().toISOString();
      if (appointment.user_confirmed_at) {
        updateOrderStatus(
          orderId,
          'appointment_confirmed',
          'Aguardando decisão clínica',
          'awaiting_clinical_decision',
          'Consulta confirmada por paciente e dentista na demo.'
        );
      }
      return clone(appointment);
    }

    if (action.type === 'complete-match') {
      appointment.status = 'completed';
      if (!appointment.user_confirmed_at) {
        appointment.user_confirmed_at = new Date().toISOString();
      }
      if (!appointment.dentist_confirmed_at) {
        appointment.dentist_confirmed_at = new Date().toISOString();
      }
      updateOrderStatus(
        orderId,
        'appointment_confirmed',
        'Aguardando decisão clínica',
        'awaiting_clinical_decision',
        'Consulta confirmada pelas duas partes na demo.'
      );
      return clone(appointment);
    }

    appointment.status = 'scheduled';
    appointment.user_confirmed_at = null;
    appointment.dentist_confirmed_at = null;
    updateOrderStatus(
      orderId,
      'awaiting_scheduling',
      'Aguardando consulta inicial',
      'awaiting_initial_consultation',
      action.reason ?? 'No-show registrado na demo e ordem devolvida para reagendamento.'
    );
    return clone(appointment);
  }

  const ensureVisibility = (targetOrder: DemoOrder, persona: DemoPersona) => {
    if (!targetOrder.visibleTo.includes(persona)) {
      targetOrder.visibleTo.push(persona);
    }
  };

  if (action.type === 'create-training-report') {
    const order = getOrderOrThrow(orderId);

    if (order.status !== 'follow_up' && order.status !== 'completed') {
      throw new DemoStateError(
        409,
        'training_report_not_available',
        'Relatório de treino só pode ser criado após entrega e adaptação do Biteplaner.'
      );
    }

    const sequence = state.workflowForms.filter(
      (form) => form.orderId === orderId && form.templateKey === 'customer_training_report'
    ).length + 1;
    const releasedAt = new Date().toISOString();
    const workflowForm: DemoWorkflowForm = {
      id: `BP-WF-${orderId.replace(/^BP-DEMO-/, '')}-TRAINING-${String(sequence).padStart(3, '0')}`,
      orderId,
      templateKey: 'customer_training_report',
      stepKey: 'post_adaptation_feedback',
      status: 'pending',
      canViewPayload: true,
      summary: null,
      releasedAt,
      submittedAt: null,
      payload: null
    };

    state.workflowForms.push(workflowForm);
    return clone(workflowForm);
  }

  if (action.type === 'submit-workflow-form' || action.type === 'revise-workflow-form') {
    const workflowForm = getWorkflowFormOrThrow(orderId, action.workflowFormId);
    const nextSubmittedAt = new Date().toISOString();
    const previousVersions = state.workflowFormVersions.filter(
      (version) => version.workflowFormId === action.workflowFormId
    );
    const nextRevision = previousVersions.length + 1;
    const activePersona = resolveActiveDemoPersona(context);

    if (workflowForm.templateKey === 'customer_pre_consultation_intake') {
      const existingPayload = isRecord(workflowForm.payload) ? workflowForm.payload : {};
      const existingCustomerPayload = getWorkflowPayloadSection(workflowForm.payload, 'customer');
      const existingDentistPayload = getWorkflowPayloadSection(workflowForm.payload, 'dentist');

      if (isCustomerPersona(activePersona)) {
        if (workflowForm.dentistReviewStartedAt || workflowForm.roleState?.customer === 'locked') {
          throw new DemoStateError(
            409,
            'workflow_form_locked',
            'Formulário em revisão pelo dentista e bloqueado para edição do cliente.'
          );
        }

        const customerSource = isRecord(action.payload.customer) ? action.payload.customer : action.payload;
        const sanitizedCustomerPayload = sanitizeWorkflowPayload(customerSource);
        const nextPayload = {
          ...existingPayload,
          customer: sanitizedCustomerPayload,
          ...(Object.keys(existingDentistPayload).length > 0 ? { dentist: existingDentistPayload } : {})
        };
        const summary = createWorkflowSummary(sanitizedCustomerPayload, nextSubmittedAt, nextRevision);

        workflowForm.status = 'submitted';
        workflowForm.roleState = { customer: 'submitted', dentist: 'locked' };
        workflowForm.customerSubmittedAt = workflowForm.customerSubmittedAt ?? nextSubmittedAt;
        workflowForm.submittedAt = nextSubmittedAt;
        workflowForm.payload = clone(nextPayload);
        workflowForm.summary = summary;

        state.counters.workflowVersions += 1;
        state.workflowFormVersions.push({
          id: `workflow-version-${String(state.counters.workflowVersions).padStart(3, '0')}`,
          workflowFormId: workflowForm.id,
          submissionId: workflowForm.id,
          revision: nextRevision,
          payload: clone(nextPayload),
          summary: clone(summary),
          changeReason:
            action.type === 'revise-workflow-form'
              ? action.changeReason ?? 'Atualização do intake do cliente na demo.'
              : 'Primeiro envio do intake do cliente na demo.',
          createdAt: nextSubmittedAt
        });

        const order = getOrderOrThrow(orderId);
        if (order.status === 'registration_started') {
          order.flags.preRequisiteComplete = true;
          order.nextActions = ['schedule-initial-consultation'];
          updateOrderStatus(
            orderId,
            'awaiting_scheduling',
            'Aguardando consulta inicial',
            'awaiting_initial_consultation',
            'Pre-requisito preenchido na jornada demo.'
          );
        }

        return clone(workflowForm);
      }

      if (activePersona === 'dentist') {
        if (workflowForm.roleState?.customer === 'pending' || Object.keys(existingCustomerPayload).length === 0) {
          throw new DemoStateError(
            409,
            'customer_intake_required',
            'O cliente precisa enviar o intake antes do complemento do dentista.'
          );
        }

        const dentistSource = isRecord(action.payload.dentist) ? action.payload.dentist : action.payload;
        const sanitizedDentistPayload = sanitizeWorkflowPayload(dentistSource);
        const nextPayload = {
          ...existingPayload,
          customer: existingCustomerPayload,
          dentist: sanitizedDentistPayload
        };
        const summary = createWorkflowSummary(sanitizedDentistPayload, nextSubmittedAt, nextRevision);

        workflowForm.status = 'submitted';
        workflowForm.roleState = { customer: 'locked', dentist: 'submitted' };
        workflowForm.dentistReviewStartedAt = workflowForm.dentistReviewStartedAt ?? nextSubmittedAt;
        workflowForm.dentistSubmittedAt = nextSubmittedAt;
        workflowForm.submittedAt = nextSubmittedAt;
        workflowForm.payload = clone(nextPayload);
        workflowForm.summary = summary;

        state.counters.workflowVersions += 1;
        state.workflowFormVersions.push({
          id: `workflow-version-${String(state.counters.workflowVersions).padStart(3, '0')}`,
          workflowFormId: workflowForm.id,
          submissionId: workflowForm.id,
          revision: nextRevision,
          payload: clone(nextPayload),
          summary: clone(summary),
          changeReason:
            action.type === 'revise-workflow-form'
              ? action.changeReason ?? 'Atualização do complemento do dentista na demo.'
              : 'Primeiro complemento do dentista na demo.',
          createdAt: nextSubmittedAt
        });

        return clone(workflowForm);
      }
    }

    const sanitizedPayload = sanitizeWorkflowPayload(action.payload);
    assertReviewPayloadScale(workflowForm.templateKey, sanitizedPayload);
    const summary = workflowForm.templateKey === 'customer_new_user_onboarding'
      ? summarizeCustomerNewUserOnboarding(sanitizedPayload, nextSubmittedAt, nextRevision)
      : workflowForm.templateKey === 'customer_training_report'
        ? summarizeCustomerTrainingReport(sanitizedPayload, nextSubmittedAt, nextRevision)
        : createWorkflowSummary(sanitizedPayload, nextSubmittedAt, nextRevision);

    workflowForm.status = 'submitted';
    workflowForm.submittedAt = nextSubmittedAt;
    workflowForm.payload = clone(sanitizedPayload);
    workflowForm.summary = summary;

    state.counters.workflowVersions += 1;
    state.workflowFormVersions.push({
      id: `workflow-version-${String(state.counters.workflowVersions).padStart(3, '0')}`,
      workflowFormId: workflowForm.id,
      submissionId: workflowForm.id,
      revision: nextRevision,
      payload: clone(sanitizedPayload),
      summary: clone(summary),
      changeReason:
        action.type === 'revise-workflow-form'
          ? action.changeReason ?? 'Atualização operacional da demo.'
          : 'Primeiro envio operacional da demo.',
      createdAt: nextSubmittedAt
    });

    return clone(workflowForm);
  }

  if (action.type === 'complete-prerequisite') {
    const order = getOrderOrThrow(orderId);

    if (!action.consents.service || !action.consents.sensitiveHealth) {
      throw new DemoStateError(
        422,
        'biteplaner_consent_required',
        'Consentimentos obrigatórios do Biteplaner são necessários para concluir o pre-requisito.'
      );
    }

    if (action.isMinor && (!action.guardianName?.trim() || !action.guardianDocument?.trim())) {
      throw new DemoStateError(
        422,
        'guardian_required',
        'Usuário menor de idade exige responsável legal identificado.'
      );
    }

    if (
      action.eligibility.orthodontic ||
      action.eligibility.activeDentalTreatment ||
      action.eligibility.relevantCondition
    ) {
      throw new DemoStateError(
        422,
        'prerequisite_impediment',
        'Pre-requisito com impedimento não pode avançar automaticamente.'
      );
    }

    order.prerequisiteSubmission = {
      documentType: action.documentType,
      documentNumberMasked: maskDocument(action.documentNumber),
      sport: sanitizeOpenText(action.sport) as string,
      isMinor: action.isMinor,
      guardianPresent: action.isMinor,
      eligibility: clone(action.eligibility),
      consents: clone(action.consents)
    };
    order.flags.preRequisiteComplete = true;
    order.nextActions = ['schedule-initial-consultation'];
    updateOrderStatus(
      orderId,
      'awaiting_scheduling',
      'Aguardando consulta inicial',
      'awaiting_initial_consultation',
      'Pre-requisito concluído na jornada demo.'
    );
    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'select-practice-location') {
    const order = getOrderOrThrow(orderId);
    const practiceLocation = DEMO_PRACTICE_LOCATION_CATALOG[action.practiceLocationId];

    if (!practiceLocation) {
      throw new DemoStateError(
        422,
        'invalid_practice_location',
        `Practice location ${action.practiceLocationId} is not available in the shared demo.`
      );
    }

    order.practice_location_id = practiceLocation.id;
    order.practice_location = clone(practiceLocation);
    ensureVisibility(order, 'dentist');
    pushTimeline(
      orderId,
      order.status,
      `Atleta selecionou o consultório ${practiceLocation.name} na etapa de consulta inicial.`
    );
    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'schedule-initial-consultation') {
    const order = getOrderOrThrow(orderId);
    const practiceLocation = DEMO_PRACTICE_LOCATION_CATALOG[action.practiceLocationId];
    const dentistId = DEMO_DENTIST_BY_PRACTICE_LOCATION[action.practiceLocationId];

    if (!practiceLocation || !dentistId) {
      throw new DemoStateError(
        422,
        'invalid_practice_location',
        `Practice location ${action.practiceLocationId} is not available for initial consultation scheduling.`
      );
    }

    if (order.status !== 'awaiting_scheduling') {
      throw new DemoStateError(
        409,
        'initial_consultation_not_schedulable',
        'Está ordem não está aguardando agendamento de consulta inicial.'
      );
    }

    order.practice_location_id = practiceLocation.id;
    order.practice_location = clone(practiceLocation);
    order.dentistId = dentistId;
    order.visibleTo = Array.from(new Set([...order.visibleTo, 'dentist']));
    order.nextActions = ['accept-initial-consultation'];

    updateOrderStatus(
      orderId,
      'awaiting_dentist_acceptance',
      'Aguardando aceite do dentista',
      'dentist_acceptance_pending',
      `Cliente informou consulta agendada no consultório ${practiceLocation.name}; ordem aguardando aceite do dentista licenciado.`
    );

    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'accept-initial-consultation') {
    const order = getOrderOrThrow(orderId);

    if (order.status !== 'awaiting_dentist_acceptance') {
      throw new DemoStateError(
        409,
        'initial_consultation_not_pending_acceptance',
        'Está ordem não está aguardando aceite do dentista.'
      );
    }

    order.nextActions = ['user-confirmation', 'dentist-confirmation'];

    updateOrderStatus(
      orderId,
      'in_progress',
      'Aguardando confirmação de consulta',
      'consultation_linked',
      'Dentista aceitou a consulta agendada e vínculou a ordem para continuidade.'
    );

    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'confirm-payment') {
    const order = getOrderOrThrow(orderId);
    order.flags.paymentConfirmed = true;
    order.flags.productionFormCompleted = false;
    updateOrderStatus(
      orderId,
      'awaiting_dentist_forms',
      'Aguardando preenchimento dentista',
      'awaiting_dentist_forms',
      'Pagamento mock confirmado. Ordem aguardando solicitação de produção do dentista.'
    );
    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'save-production-request-draft') {
    const order = getOrderOrThrow(orderId);

    order.productionRequestDraft = {
      anamnesisSummary: action.anamnesisSummary.trim(),
      anamnesisDownloaded: action.anamnesisDownloaded,
      productionRequestSummary: action.productionRequestSummary.trim(),
      labNotes: action.labNotes.trim(),
      scan3dFileName: action.scan3dFileName.trim(),
      prescriptionFileName: action.prescriptionFileName.trim(),
      lgpdConfirmed: action.lgpdConfirmed,
      selectedLabId: action.selectedLabId?.trim() ? action.selectedLabId : null
    };

    pushTimeline(
      orderId,
      order.status,
      'Dentista salvou um rascunho da solicitação de produção com documentos e laboratório em andamento.'
    );

    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'complete-production-request') {
    const order = getOrderOrThrow(orderId);
    const anamnesisSummary = action.anamnesisSummary.trim();
    const productionRequestSummary = action.productionRequestSummary.trim();
    const scan3dFileName = action.scan3dFileName.trim();
    const prescriptionFileName = action.prescriptionFileName.trim();
    const selectedLabId = action.selectedLabId?.trim() ? action.selectedLabId : null;

    if (!anamnesisSummary) {
      throw new DemoStateError(422, 'missing_anamnesis_summary', 'Preencha o resumo da avaliação inicial / anamnese.');
    }

    if (!productionRequestSummary) {
      throw new DemoStateError(
        422,
        'missing_production_request_summary',
        'Preencha a solicitação de produção antes de concluir.'
      );
    }

    if (!scan3dFileName) {
      throw new DemoStateError(
        422,
        'missing_scan_3d',
        'Anexe o escaneamento 3D intraoral antes de concluir.'
      );
    }

    if (!prescriptionFileName) {
      throw new DemoStateError(
        422,
        'missing_prescription_file',
        'Anexe a prescrição médica assinada e carimbada antes de concluir.'
      );
    }

    if (!action.lgpdConfirmed) {
      throw new DemoStateError(
        422,
        'lgpd_confirmation_required',
        'Confirme a ciencia sobre responsabilidade e LGPD antes de concluir.'
      );
    }

    if (!selectedLabId) {
      throw new DemoStateError(
        422,
        'missing_lab_selection',
        'Selecione um laboratório licenciado antes de concluir.'
      );
    }

    order.productionRequestDraft = {
      anamnesisSummary,
      anamnesisDownloaded: action.anamnesisDownloaded,
      productionRequestSummary,
      labNotes: action.labNotes.trim(),
      scan3dFileName,
      prescriptionFileName,
      lgpdConfirmed: true,
      selectedLabId
    };
    order.flags.initialEvaluationCompleted = true;
    order.flags.productionFormCompleted = true;
    order.flags.dentalArchFileAttached = true;
    order.flags.retentionAcknowledged = true;
    order.flags.sentToLab = true;
    order.labId = selectedLabId;
    ensureVisibility(order, 'lab');

    pushTimeline(
      orderId,
      order.status,
      `Dentista concluiu a solicitação de produção, anexou ${scan3dFileName} e ${prescriptionFileName} e selecionou o laboratório ${selectedLabId}.`
    );

    updateOrderStatus(
      orderId,
      'awaiting_lab_start',
      'Aguardando início da produção',
      'awaiting_lab_start',
      'Dentista concluiu a solicitação de produção e enviou a ordem para a fila inicial do laboratório.'
    );

    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'save-pre-lab-checklist-draft') {
    const order = getOrderOrThrow(orderId);

    order.preLabChecklistDraft = {
      anamnesisSummary: action.anamnesisSummary.trim(),
      clinicalNotes: action.clinicalNotes?.trim() ?? '',
      dentalArchFileName: action.dentalArchFileName.trim(),
      retentionAcknowledged: action.retentionAcknowledged
    };

    pushTimeline(
      orderId,
      order.status,
      'Dentista salvou um rascunho da avaliação inicial/anamnese e do anexo 3D antes do envio ao laboratório.'
    );

    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'complete-pre-lab-checklist') {
    const order = getOrderOrThrow(orderId);
    const anamnesisSummary = action.anamnesisSummary.trim();
    const dentalArchFileName = action.dentalArchFileName.trim();

    if (!anamnesisSummary) {
      throw new DemoStateError(
        422,
        'missing_anamnesis_summary',
        'Preencha o resumo da avaliação inicial/anamnese antes de liberar o laboratório.'
      );
    }

    if (!action.retentionAcknowledged) {
      throw new DemoStateError(
        422,
        'retention_acknowledgement_required',
        'Confirme a responsabilidade de guarda do registro antes de prosseguir.'
      );
    }

    if (!dentalArchFileName) {
      throw new DemoStateError(
        422,
        'missing_dental_arch_file',
        'Anexe o arquivo 3D da arcada dentaria antes de prosseguir.'
      );
    }

    order.flags.initialEvaluationCompleted = true;
    order.flags.retentionAcknowledged = true;
    order.flags.dentalArchFileAttached = true;
    order.preLabChecklistDraft = {
      anamnesisSummary,
      clinicalNotes: action.clinicalNotes?.trim() ?? '',
      dentalArchFileName,
      retentionAcknowledged: true
    };

    const existingAnamnesisForm = state.orderForms.find(
      (form) => form.orderId === orderId && form.type === 'anamnesis'
    );

    if (!existingAnamnesisForm) {
      state.orderForms.push({
        id: `BP-ORDER-FORM-${orderId.replace('BP-DEMO-', '')}-ANA`,
        orderId,
        type: 'anamnesis',
        version: 1,
        created_at: new Date().toISOString(),
        dentist_id: order.dentistId,
        clinic_id: null,
        practice_location_id: order.practice_location_id
      });
    }

    pushTimeline(
      orderId,
      order.status,
      `Dentista revisou a avaliação inicial/anamnese e anexou o arquivo 3D ${dentalArchFileName} para liberar o laboratório.`
    );

    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'register-clinical-decision') {
    const order = getOrderOrThrow(orderId);

    if (action.decision === 'eligible') {
      order.flags.eligible = true;
      order.flags.productionFormCompleted = false;
      updateOrderStatus(
        orderId,
        'awaiting_payment',
        'Aguardando pagamento',
        'awaiting_payment',
        action.reason ?? 'Dentista registrou atleta apto na demo.'
      );
      return sanitizeOrder(order, resolveActiveDemoPersona(context));
    }

    if (action.decision === 'ineligible') {
      order.flags.eligible = false;
      updateOrderStatus(
        orderId,
        'ineligible_refund',
        'Inapto - Encerrado',
        'closed_ineligible',
        action.reason ?? 'Dentista registrou inaptidão na demo.'
      );
      return sanitizeOrder(order, resolveActiveDemoPersona(context));
    }

    order.flags.eligible = null;
    updateOrderStatus(
      orderId,
      'treatment_required',
      'Tratamento prévio pendente',
      'treatment_required',
      action.reason ?? 'Dentista registrou necessidade de tratamento prévio na demo.'
    );
    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'send-to-lab') {
    const order = getOrderOrThrow(orderId);

    if (
      !order.flags.productionFormCompleted ||
      !order.flags.initialEvaluationCompleted ||
      !order.flags.retentionAcknowledged ||
      !order.flags.dentalArchFileAttached
    ) {
      throw new DemoStateError(
        422,
        'pre_lab_requirements_missing',
        'Revise a avaliação inicial/anamnese, confirme a guarda do registro e anexe o arquivo 3D antes de enviar ao laboratório.'
      );
    }

    order.flags.sentToLab = true;
    ensureVisibility(order, 'lab');
    updateOrderStatus(
      orderId,
      'awaiting_lab_start',
      'Aguardando início da produção',
      'awaiting_lab_start',
      'Dentista liberou o pedido para a fila inicial do laboratório.'
    );
    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'lab-production-started') {
    const order = getOrderOrThrow(orderId);
    updateOrderStatus(
      orderId,
      'lab_processing',
      'Em processo - Laboratório',
      'lab_production',
      'Laboratório iniciou formalmente a produção na demo.'
    );
    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'lab-return-for-adjustment') {
    const order = getOrderOrThrow(orderId);
    order.flags.sentToLab = false;
    updateOrderStatus(
      orderId,
      'in_progress',
      'Ajuste solicitado pelo laboratório',
      'dentist_adjustment_required',
      action.reason ?? 'Laboratório devolveu o pedido para ajuste na demo.'
    );
    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'lab-production-completed') {
    const order = getOrderOrThrow(orderId);
    order.flags.productReceived = false;
    ensureVisibility(order, 'athlete');
    updateOrderStatus(
      orderId,
      'product_received_by_clinic',
      'Aguardando recebimento pelo dentista',
      'product_received_by_clinic',
      'Laboratório concluiu a produção e enviou o produto para recebimento pelo dentista na demo.'
    );
    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'product-received') {
    const order = getOrderOrThrow(orderId);
    order.flags.productReceived = true;
    updateOrderStatus(
      orderId,
      'awaiting_adaptation',
      'Aguardando adaptação',
      'awaiting_adaptation',
      'Dentista confirmou o recebimento do produto e liberou a consulta de adaptação na demo.'
    );
    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  if (action.type === 'adaptation-completed') {
    const order = getOrderOrThrow(orderId);
    updateOrderStatus(
      orderId,
      'follow_up',
      'Em acompanhamento',
      'follow_up',
      'Consulta de adaptação concluída na demo.'
    );
    if (!state.workflowForms.some((form) => form.orderId === orderId && form.templateKey === 'customer_training_report')) {
      state.workflowForms.push({
        id: `BP-WF-${orderId.replace(/^BP-DEMO-/, '')}-TRAINING-001`,
        orderId,
        templateKey: 'customer_training_report',
        stepKey: 'post_adaptation_feedback',
        status: 'pending',
        canViewPayload: true,
        summary: null,
        releasedAt: new Date().toISOString(),
        submittedAt: null,
        payload: null
      });
    }
    return sanitizeOrder(order, resolveActiveDemoPersona(context));
  }

  throw new DemoStateError(422, 'unsupported_order_action', 'Unsupported order action.');
}
