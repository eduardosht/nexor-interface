import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import { AlertTriangle, ArrowLeft, ClipboardCheck, Search, Star } from 'lucide-react';
import {
  AdminFormButton,
  Field,
  Snackbar,
  SnackbarStack,
} from '@nexor/design-system';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { divIcon, latLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { SkeletonCard, SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  completeProductionRequest,
  fetchOrder,
  fetchOrderForm,
  fetchOrderForms,
  fetchOrders,
  fetchWorkflowForm,
  fetchWorkflowForms,
} from '../../../features/biteplaner/orders/orders.api';
import {
  getOrderDisplayId,
  getAuthToken,
  registerClinicalDecision,
  type DemoOrderSummary,
  type DemoWorkflowForm,
  type ProductionRequestDraft,
} from '../../../features/demo/biteplanerFlow';
import { fetchLicensedLabs } from '../../../features/biteplaner/labs/labs.api';
import type {
  DemoLicensedLabSelection,
  LicensedLabSelectionApiRecord,
} from '../../../features/biteplaner/labs/labs.types';
import { mapProductionRequestPayload } from '../../../features/biteplaner/production/productionRequestPayload';
import { biteplanerQueryKeys } from '../../../features/demo/biteplanerQueryKeys';
import { getLicensedLab, listLicensedLabsByCep } from '../../../features/demo/labLocations';
import {
  FieldsGrid,
  PageStack,
} from '../admin/styles';
import { SHARED_INITIAL_EVALUATION_INTAKE } from '../components/sharedIntakeDefinition';
import { WorkflowFormsPanel } from '../components/WorkflowFormsPanel';
import { PendingFeedbackPrompt } from '../components/PendingFeedbackPrompt';
import { OrderInfoCard } from '../components/OrderStepHeader';
import { JourneyNoticeCard } from '../components/JourneyNoticeCard';
import { DentalAnamnesisRecord } from './DentalAnamnesisRecord';
import { ProductionRequestFields } from './ProductionRequestFields';
import * as S from './styles';

type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLTextAreaElement>;

type CepLocation = {
  lat: number;
  lng: number;
  label: string;
};

type ViaCepResponse = {
  cep?: string;
  logradouro?: string;
  bairro?: string;
  localidade?: string;
  uf?: string;
  erro?: boolean;
};

type NominatimResult = {
  lat: string;
  lon: string;
};

type AwesomeCepResponse = {
  cep?: string;
  district?: string;
  city?: string;
  state?: string;
  lat?: string;
  lng?: string;
};

const EARTH_RADIUS_KM = 6371;

































const markerIcon = divIcon({
  className: 'licensed-lab-map-pin',
  html: `
    <div style="
      width: 18px;
      height: 18px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: #171717;
      border: 2px solid #fafafa;
      box-shadow: 0 6px 16px rgba(23, 23, 23, 0.18);
    "></div>
  `,
  iconSize: [18, 18],
  iconAnchor: [9, 18],
  popupAnchor: [0, -16],
});

const cepMarkerIcon = divIcon({
  className: 'licensed-lab-map-pin licensed-lab-map-pin-home',
  html: `
    <div style="
      width: 34px;
      height: 34px;
      display: grid;
      place-items: center;
      border-radius: 999px;
      background: #ffffff;
      border: 2px solid #171717;
      box-shadow: 0 12px 28px rgba(23, 23, 23, 0.22);
      color: #171717;
    ">
      <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
        <path d="m3 11 9-8 9 8"></path>
        <path d="M5 10v10h14V10"></path>
        <path d="M9 20v-6h6v6"></path>
      </svg>
    </div>
  `,
  iconSize: [34, 34],
  iconAnchor: [17, 17],
  popupAnchor: [0, -18],
});

const STEP_DEFINITIONS = [
  {
    key: 'anamnesis',
    label: 'Avaliação inicial / anamnese',
    description: 'Revise e complemente a avaliação compartilhada antes da geração da anamnese final.',
    shortLabel: 'Revisão clínica',
  },
  {
    key: 'anamnesis-summary',
    label: 'Resumo anamnese',
    description: 'Revise todos os dados clínicos e registre o resumo antes de baixar a anamnese em PDF.',
    shortLabel: 'Resumo clínico',
  },
  {
    key: 'production-request',
    label: 'Solicitação de produção',
    description: 'Preencha a solicitação clínica, observações e anexos obrigatórios para o laboratório.',
    shortLabel: 'Formulário produtivo',
  },
  {
    key: 'lab-selection',
    label: 'Escolha do laboratório',
    description: 'Selecione um laboratório licenciado para encaminhar a ordem com todos os dados.',
    shortLabel: 'Destino licenciado',
  },
] as const;

const EMPTY_DRAFT: ProductionRequestDraft = {
  anamnesisSummary: '',
  anamnesisDownloaded: false,
  productionRequestSummary: '',
  labNotes: '',
  scan3dFileName: '',
  scan3dFileRef: null,
  prescriptionFileName: '',
  prescriptionFileRef: null,
  lgpdConfirmed: false,
  selectedLabId: null,
  purchaseConfiguration: null,
  purchaseDivergenceConfirmed: false,
};

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isUuidOrderId(value: string | undefined): value is string {
  return typeof value === 'string' && UUID_PATTERN.test(value);
}

function hasPurchaseConfigurationDivergence(
  purchased: ProductionRequestDraft['purchaseConfiguration'],
  recommended: DemoOrderSummary['dentistRecommendedPurchaseConfiguration']
) {
  if (!purchased || !recommended) {
    return false;
  }

  return (
    purchased.quantity !== recommended.quantity ||
    purchased.model.trim().toLowerCase() !== recommended.model.trim().toLowerCase() ||
    purchased.color.trim().toLowerCase() !== recommended.color.trim().toLowerCase()
  );
}
function getLabPayloadId(lab: DemoLicensedLabSelection) {
  return lab.profileId ?? lab.id;
}

function hasDentistComplement(form: DemoWorkflowForm | undefined) {
  if (!form) {
    return false;
  }

  if (form.dentistSubmittedAt || form.roleState?.dentist === 'submitted') {
    return true;
  }

  const payload =
    form.payload && typeof form.payload === 'object' && !Array.isArray(form.payload)
      ? form.payload
      : null;
  const dentistPayload = payload?.dentist;

  return Boolean(
    dentistPayload &&
    typeof dentistPayload === 'object' &&
    !Array.isArray(dentistPayload) &&
    Object.keys(dentistPayload).length > 0
  );
}

function getCurrentDentistId(backendUser: unknown, order: DemoOrderSummary | null | undefined) {
  const user: Record<string, unknown> = isRecord(backendUser) ? backendUser : {};
  const orderDentist: Record<string, unknown> = isRecord(order?.dentist) ? order.dentist : {};

  return getStringValue(user.dentistId) || getStringValue(orderDentist.id);
}

function isDentistComplementFromAnotherDentist(
  form: DemoWorkflowForm | undefined,
  currentDentistId: string,
  currentDentistEmail: string
) {
  if (!form || form.templateKey !== 'customer_pre_consultation_intake' || !hasDentistComplement(form)) {
    return false;
  }

  if (form.dentistId && form.dentistId !== currentDentistId) {
    return true;
  }

  const payload = isRecord(form.payload) ? form.payload : {};
  const dentistPayload = isRecord(payload.dentist) ? payload.dentist : {};
  const dentistContact = getStringValue(dentistPayload.dentistProfessionalContact).toLowerCase();

  return Boolean(!form.dentistId && currentDentistEmail && dentistContact && !dentistContact.includes(currentDentistEmail.toLowerCase()));
}

function getCurrentDentistIntakeForm(
  form: DemoWorkflowForm | undefined,
  currentDentistId: string,
  currentDentistEmail: string
): DemoWorkflowForm | undefined {
  if (!isDentistComplementFromAnotherDentist(form, currentDentistId, currentDentistEmail)) {
    return form;
  }

  if (!form) {
    return undefined;
  }

  const payload = isRecord(form.payload) ? form.payload : {};
  const customerPayload = isRecord(payload.customer) ? payload.customer : {};

  return {
    ...form,
    roleState: { customer: 'submitted' as const, dentist: 'pending' as const },
    dentistSubmittedAt: null,
    dentistId: currentDentistId || form.dentistId,
    payload: { customer: customerPayload },
  };
}

function hasWorkflowValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== null && value !== undefined && value !== '';
}

function hasFormPayload(form: DemoWorkflowForm | undefined) {
  return Boolean(
    form?.payload &&
    typeof form.payload === 'object' &&
    !Array.isArray(form.payload) &&
    Object.keys(form.payload).length > 0
  );
}

function getDentistPendingRequiredFields(form: DemoWorkflowForm | undefined) {
  const payload = isRecord(form?.payload) ? form.payload : {};
  const dentistPayload = isRecord(payload.dentist) ? payload.dentist : {};
  const dentistSections = SHARED_INITIAL_EVALUATION_INTAKE.sections.filter((section) =>
    section.fields.some((field) => field.ownerRole === 'dentist')
  );

  if (dentistSections.length === 0 || form?.dentistSubmittedAt || form?.roleState?.dentist === 'submitted') {
    return [];
  }

  return dentistSections
    .flatMap((section) => section.fields)
    .filter((field) => field.ownerRole === 'dentist' && field.required)
    .filter((field) => {
      if (['biteplanerModel', 'biteplanerColor', 'biteplanerQuantity'].includes(field.key)) {
        return dentistPayload.biteplannerEligible === 'yes';
      }

      return true;
    })
    .filter((field) => !hasWorkflowValue(dentistPayload[field.key]))
    .map((field) => field.label);
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getStringValue(value: unknown) {
  return typeof value === 'string' ? value.trim() : '';
}

function getDentistSystemValues(backendUser: unknown, sessionEmail?: string | null) {
  const user = isRecord(backendUser) ? backendUser : {};
  const productRoles = Array.isArray(user.productRoles) ? user.productRoles : [];
  const dentistRole = productRoles.find((role) => {
    if (!isRecord(role)) {
      return false;
    }

    return role.productKey === 'biteplaner' && role.role === 'dentist';
  });
  const metadata = isRecord(dentistRole) && isRecord(dentistRole.metadata) ? dentistRole.metadata : {};
  const email = getStringValue(user.email) || getStringValue(sessionEmail);
  const phone = getStringValue(user.phone);
  const contact = [email, phone].filter(Boolean).join(' / ');

  return {
    evaluationDate: new Date().toLocaleDateString('pt-BR'),
    dentistName: getStringValue(metadata.fullName) || getStringValue(user.fullName) || email,
    dentistCro: getStringValue(metadata.croNumber),
    dentistProfessionalContact: contact,
  };
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function normalizeCep(value: string) {
  return value.replace(/\D/g, '').slice(0, 8);
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(from: { lat: number; lng: number }, to: { lat: number; lng: number }) {
  const latDelta = toRadians(to.lat - from.lat);
  const lngDelta = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);
  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function withDistances(labs: DemoLicensedLabSelection[], cepLocation: CepLocation | null) {
  if (!cepLocation) {
    return labs;
  }

  return labs.map((lab) => ({
    ...lab,
    distanceKm: calculateDistanceKm(cepLocation, lab.coordinates),
  }));
}

function formatDistanceKm(value: number) {
  return value < 10 ? value.toFixed(1) : value.toFixed(0);
}

function LicensedLabMapController({ points }: { points: Array<[number, number]> }) {
  const map = useMap();
  const pointsKey = points.map(([lat, lng]) => `${lat.toFixed(6)},${lng.toFixed(6)}`).join('|');

  useEffect(() => {
    if (points.length === 0) {
      return;
    }

    if (points.length === 1) {
      map.setView(points[0], 14);
      return;
    }

    map.fitBounds(latLngBounds(points), {
      padding: [44, 44],
      maxZoom: 14,
    });
  }, [map, points, pointsKey]);

  return null;
}

async function geocodeAddress(query: string): Promise<{ lat: number; lng: number } | null> {
  if (!query.trim() || typeof fetch !== 'function') {
    return null;
  }

  const url = new URL('https://nominatim.openstreetmap.org/search');
  url.searchParams.set('format', 'json');
  url.searchParams.set('limit', '1');
  url.searchParams.set('countrycodes', 'br');
  url.searchParams.set('q', query);

  const response = await fetch(url.toString(), {
    headers: {
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as NominatimResult[];
  const first = data[0];

  if (!first) {
    return null;
  }

  const lat = Number(first.lat);
  const lng = Number(first.lon);

  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

async function resolveCepWithCoordinates(cep: string): Promise<CepLocation | null> {
  const normalizedCep = normalizeCep(cep);
  const response = await fetch(`https://cep.awesomeapi.com.br/json/${normalizedCep}`);

  if (!response.ok) {
    return null;
  }

  const data = (await response.json()) as AwesomeCepResponse;
  const lat = Number(data.lat);
  const lng = Number(data.lng);

  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    lat,
    lng,
    label: [
      `CEP ${formatCep(normalizedCep)}`,
      data.district,
      [data.city, data.state].filter(Boolean).join(' - '),
    ]
      .filter(Boolean)
      .join(' - '),
  };
}

async function resolveCepLocation(cep: string): Promise<CepLocation> {
  const normalizedCep = normalizeCep(cep);

  if (normalizedCep.length !== 8) {
    throw new Error('invalid_cep');
  }

  const cepWithCoordinates = await resolveCepWithCoordinates(normalizedCep);

  if (cepWithCoordinates) {
    return cepWithCoordinates;
  }

  const viaCepResponse = await fetch(`https://viacep.com.br/ws/${normalizedCep}/json/`);

  if (!viaCepResponse.ok) {
    throw new Error('cep_lookup_failed');
  }

  const viaCep = (await viaCepResponse.json()) as ViaCepResponse;

  if (viaCep.erro) {
    throw new Error('cep_not_found');
  }

  const locationLabel = [
    `CEP ${formatCep(normalizedCep)}`,
    viaCep.bairro,
    [viaCep.localidade, viaCep.uf].filter(Boolean).join(' - '),
  ]
    .filter(Boolean)
    .join(' - ');
  const geocodeQuery = [
    viaCep.logradouro,
    viaCep.bairro,
    viaCep.localidade,
    viaCep.uf,
    normalizedCep,
    'Brasil',
  ]
    .filter(Boolean)
    .join(', ');
  const coordinates = await geocodeAddress(geocodeQuery);

  if (!coordinates) {
    const fallbackCoordinates = await geocodeAddress(
      [viaCep.bairro, viaCep.localidade, viaCep.uf, 'Brasil'].filter(Boolean).join(', ')
    );

    if (!fallbackCoordinates) {
      throw new Error('cep_geocode_failed');
    }

    return {
      ...fallbackCoordinates,
      label: locationLabel,
    };
  }

  return {
    ...coordinates,
    label: locationLabel,
  };
}

function mapLicensedLabRecord(
  lab: LicensedLabSelectionApiRecord,
  index: number
): DemoLicensedLabSelection {
  const fallbackLat = -23.5618 + index * 0.0025;
  const fallbackLng = -46.6565 + index * 0.0025;

  return {
    id: lab.id,
    profileId: lab.profileId,
    name: lab.labName,
    cnpj: lab.cnpj,
    professionalSummary: lab.professionalSummary,
    address: lab.address,
    cep: lab.cep,
    phone: lab.phone || 'Telefone não informado',
    serviceHours: lab.serviceHours,
    city: lab.city,
    state: lab.state,
    reviewScore: 4,
    distanceKm: Number((1.2 + index * 0.7).toFixed(1)),
    coordinates: lab.coordinates ?? {
      lat: fallbackLat,
      lng: fallbackLng,
    },
  };
}

function RatingStars({ score, label }: { score: number; label: string }) {
  const roundedScore = Math.round(score);

  return (
    <S.RatingBadge aria-label={`${score.toFixed(1)} de 5 ${label}`}>
      {Array.from({ length: 5 }, (_, index) => (
        <Star
          key={index}
          size={14}
          fill={index < roundedScore ? 'currentColor' : 'none'}
          aria-hidden
        />
      ))}
    </S.RatingBadge>
  );
}

export function ProducaoDentista() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { session, backendUser } = useAuth();
  const queryClient = useQueryClient();
  const token = getAuthToken(session);
  const [completing, setCompleting] = useState(false);
  const [actionError, setActionError] = useState('');
  const [notice, setNotice] = useState('');
  const [pdfNotice, setPdfNotice] = useState('');
  const [pdfError, setPdfError] = useState('');
  const [draft, setDraft] = useState<ProductionRequestDraft>(EMPTY_DRAFT);
  const [currentStep, setCurrentStep] = useState(0);
  const [labCep, setLabCep] = useState('01310-100');
  const [labCepLocation, setLabCepLocation] = useState<CepLocation | null>(null);
  const [locatingLabCep, setLocatingLabCep] = useState(false);
  const [labLookupError, setLabLookupError] = useState('');
  const [visibleLabs, setVisibleLabs] = useState<DemoLicensedLabSelection[]>([]);
  const [activeLab, setActiveLab] = useState<DemoLicensedLabSelection | null>(null);
  const [selectedLab, setSelectedLab] = useState<DemoLicensedLabSelection | null>(null);
  const draftRef = useRef<ProductionRequestDraft>(EMPTY_DRAFT);
  const hydratedOrderIdRef = useRef<string | null>(null);
  const queryOwnerId = backendUser?.id ?? session?.user.id ?? 'anonymous';
  const isAnamnesisRecordDeepLink = location.hash.startsWith('#anamnese-');
  const isProductionRequestDeepLink = location.hash === '#production-request';

  const ordersQuery = useQuery({
    queryKey: biteplanerQueryKeys.orders('dentist', queryOwnerId),
    queryFn: () => fetchOrders('dentist', token),
    enabled: Boolean(token && orderId),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const orderDetailQuery = useQuery({
    queryKey: biteplanerQueryKeys.orderDetail(orderId ?? 'pending'),
    queryFn: () => fetchOrder(orderId!, token),
    enabled: Boolean(token && isUuidOrderId(orderId)),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const orders = useMemo(
    () => (Array.isArray(ordersQuery.data?.orders) ? ordersQuery.data.orders : []),
    [ordersQuery.data?.orders]
  );
  const order = useMemo(
    () => orderDetailQuery.data ?? orders.find((item) => item.id === orderId) ?? null,
    [orderDetailQuery.data, orderId, orders]
  );
  const workflowFormsQuery = useQuery({
    queryKey: biteplanerQueryKeys.workflowForms(order?.id ?? 'pending'),
    queryFn: () => fetchWorkflowForms(order!.id, token),
    enabled: Boolean(token && order?.id),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const workflowForms = workflowFormsQuery.data?.forms ?? [];
  const canShowFeedbackPrompt = Boolean(
    order &&
    ['product_received_by_clinic', 'awaiting_adaptation', 'follow_up', 'completed'].includes(order.status)
  );
  const productionFormsQuery = useQuery({
    queryKey: biteplanerQueryKeys.orderForms(order?.id ?? 'pending'),
    queryFn: () => fetchOrderForms(order!.id, token),
    enabled: Boolean(token && order?.id),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const latestProductionForm = useMemo(
    () =>
      (productionFormsQuery.data?.forms ?? [])
        .filter((form) => form.type === 'production_request')
        .sort((left, right) => right.version - left.version || Date.parse(right.created_at) - Date.parse(left.created_at))[0] ?? null,
    [productionFormsQuery.data?.forms]
  );
  const productionFormDetailQuery = useQuery({
    queryKey: biteplanerQueryKeys.orderForm(order?.id ?? 'pending', latestProductionForm?.id ?? 'pending'),
    queryFn: () => fetchOrderForm(order!.id, latestProductionForm!.id, token),
    enabled: Boolean(token && order?.id && latestProductionForm?.id),
    staleTime: 0,
    refetchOnWindowFocus: false,
  });
  const savedProductionDraft = useMemo(() => {
    const payload = productionFormDetailQuery.data?.payload;
    if (payload) {
      return mapProductionRequestPayload(payload);
    }

    return order?.productionRequestDraft ?? null;
  }, [order?.productionRequestDraft, productionFormDetailQuery.data?.payload]);
  const licensedLabsQuery = useQuery({
    queryKey: biteplanerQueryKeys.licensedLabs(queryOwnerId),
    queryFn: async () => {
      const response = await fetchLicensedLabs(token);
      return response.labs.map(mapLicensedLabRecord);
    },
    enabled: Boolean(token && currentStep === 3),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const licensedLabs = useMemo(() => {
    if (currentStep !== 3) {
      return [];
    }

    if (licensedLabsQuery.data) {
      return licensedLabsQuery.data.length > 0 ? licensedLabsQuery.data : listLicensedLabsByCep('');
    }

    return [];
  }, [currentStep, labCep, licensedLabsQuery.data]);
  const intakeFormFromList = workflowForms.find((form) => form.templateKey === 'customer_pre_consultation_intake');
  const onboardingFormFromList = workflowForms.find((form) => form.templateKey === 'customer_new_user_onboarding');
  const intakeFormDetailQuery = useQuery({
    queryKey: biteplanerQueryKeys.workflowForm(order?.id ?? 'pending', intakeFormFromList?.id ?? 'pending'),
    queryFn: () => fetchWorkflowForm(order!.id, intakeFormFromList!.id, token),
    enabled: Boolean(token && order?.id && intakeFormFromList?.id && intakeFormFromList.canViewPayload && !intakeFormFromList.payload),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const onboardingFormDetailQuery = useQuery({
    queryKey: biteplanerQueryKeys.workflowForm(order?.id ?? 'pending', onboardingFormFromList?.id ?? 'pending'),
    queryFn: () => fetchWorkflowForm(order!.id, onboardingFormFromList!.id, token),
    enabled: Boolean(token && order?.id && onboardingFormFromList?.id && onboardingFormFromList.canViewPayload && !onboardingFormFromList.payload),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const currentDentistId = getCurrentDentistId(backendUser, order);
  const currentDentistEmail = session?.user.email ?? backendUser?.email ?? '';
  const rawIntakeForm = intakeFormDetailQuery.data ?? intakeFormFromList;
  const intakeForm = getCurrentDentistIntakeForm(rawIntakeForm, currentDentistId, currentDentistEmail);
  const onboardingForm = onboardingFormDetailQuery.data ?? onboardingFormFromList;
  const workflowFormsForPanel = useMemo(() => {
    if (!intakeForm && !onboardingForm) {
      return workflowForms;
    }

    return workflowForms.map((form) => {
      if (intakeForm && form.id === intakeForm.id) {
        return intakeForm;
      }

      if (onboardingForm && form.id === onboardingForm.id) {
        return onboardingForm;
      }

      return form;
    });
  }, [intakeForm, onboardingForm, workflowForms]);
  const loading =
    ordersQuery.isLoading ||
    (isUuidOrderId(orderId) && orderDetailQuery.isLoading) ||
    (Boolean(order) && workflowFormsQuery.isLoading) ||
    (Boolean(order) && productionFormsQuery.isLoading) ||
    (Boolean(order) && Boolean(latestProductionForm) && productionFormDetailQuery.isLoading) ||
    (Boolean(intakeFormFromList) && intakeFormDetailQuery.isLoading) ||
    (Boolean(onboardingFormFromList) && onboardingFormDetailQuery.isLoading);
  const error = actionError ||
    (orderDetailQuery.isError
      ? 'Nao foi possivel carregar a ordem de producao do banco local.'
      : ordersQuery.isError
      ? 'Nao foi possivel carregar a solicitacao de producao da demo.'
      : ordersQuery.isSuccess && !order
        ? 'Nao foi possivel localizar essa ordem na fila do dentista.'
        : '');
  const formsError = workflowFormsQuery.isError
    ? 'Nao foi possivel carregar o intake compartilhado desta ordem.'
    : '';

  const labsError = licensedLabsQuery.isError
    ? 'Nao foi possivel carregar os laboratorios licenciados aprovados.'
    : '';
  const displayedLabs = useMemo(() => withDistances(visibleLabs, labCepLocation), [labCepLocation, visibleLabs]);

  useEffect(() => {
    if (!order) {
      hydratedOrderIdRef.current = null;
      draftRef.current = EMPTY_DRAFT;
      setDraft(EMPTY_DRAFT);
      setActiveLab(null);
      setSelectedLab(null);
      return;
    }

    if (!savedProductionDraft && !productionFormsQuery.isFetched) {
      return;
    }

    const nextDraft = {
      ...EMPTY_DRAFT,
      ...(savedProductionDraft ?? {}),
      purchaseConfiguration: savedProductionDraft?.purchaseConfiguration ?? order.purchaseConfiguration ?? null,
      purchaseDivergenceConfirmed: savedProductionDraft?.purchaseDivergenceConfirmed ?? false,
    };
    const hydrationSource = productionFormDetailQuery.data?.payload ? latestProductionForm?.id ?? 'form' : 'order';
    const hydrationKey = `${order.id}:${hydrationSource}:${latestProductionForm?.version ?? 0}`;

    if (hydratedOrderIdRef.current === hydrationKey) {
      return;
    }

    hydratedOrderIdRef.current = hydrationKey;
    draftRef.current = nextDraft;
    setDraft(nextDraft);
  }, [
    latestProductionForm?.id,
    latestProductionForm?.version,
    order,
    productionFormDetailQuery.data?.payload,
    productionFormsQuery.isFetched,
    savedProductionDraft,
  ]);

  useEffect(() => {
    const selectedLabId = draft.selectedLabId;

    if (!selectedLabId) {
      setActiveLab(null);
      setSelectedLab(null);
      return;
    }

    const lab =
      licensedLabs.find((item) => item.id === selectedLabId || item.profileId === selectedLabId) ??
      getLicensedLab(selectedLabId);
    if (!lab) {
      return;
    }

    setSelectedLab(lab);
    setActiveLab((current) => (current?.id === lab.id ? current : lab));
  }, [draft.selectedLabId, licensedLabs]);

  useEffect(() => {
    setVisibleLabs(licensedLabs);
  }, [licensedLabs]);

  useEffect(() => {
    if (displayedLabs.length === 0) {
      setActiveLab(null);
      return;
    }

    setActiveLab((current) => {
      if (current) {
        const currentDisplayed = displayedLabs.find((lab) => lab.id === current.id);
        if (currentDisplayed) {
          return currentDisplayed;
        }
      }

      if (selectedLab) {
        const selectedDisplayed = displayedLabs.find((lab) => lab.id === selectedLab.id);
        if (selectedDisplayed) {
          return selectedDisplayed;
        }
      }

      return displayedLabs[0] ?? null;
    });
  }, [displayedLabs, selectedLab]);

  useEffect(() => {
    if (!selectedLab) {
      return;
    }

    const selectedDisplayed = displayedLabs.find((lab) => lab.id === selectedLab.id);
    if (selectedDisplayed) {
      setSelectedLab(selectedDisplayed);
    }
  }, [displayedLabs, selectedLab]);

  useEffect(() => {
    if (!isAnamnesisRecordDeepLink) {
      return;
    }

    setCurrentStep(1);
  }, [isAnamnesisRecordDeepLink]);

  useEffect(() => {
    if (!isProductionRequestDeepLink) {
      return;
    }

    setCurrentStep(2);
  }, [isProductionRequestDeepLink]);

  useEffect(() => {
    if (!isAnamnesisRecordDeepLink || currentStep !== 1 || !location.hash) {
      return;
    }

    window.requestAnimationFrame(() => {
      document.getElementById(location.hash.slice(1))?.scrollIntoView({ block: 'start' });
    });
  }, [currentStep, isAnamnesisRecordDeepLink, location.hash]);

  const selectedLabId = draft.selectedLabId;
  const dentistPendingRequiredFields = getDentistPendingRequiredFields(intakeForm);
  const dentistReviewCompleted = hasDentistComplement(intakeForm) && dentistPendingRequiredFields.length === 0;
  const anamnesisCompleted = dentistReviewCompleted;
  const productionRequestCompleted = draft.productionRequestSummary.trim().length > 0;
  const attachmentsCompleted =
    draft.scan3dFileName.trim().length > 0 &&
    draft.prescriptionFileName.trim().length > 0 &&
    draft.lgpdConfirmed;
  const purchaseDivergenceRequiresConfirmation = hasPurchaseConfigurationDivergence(
    draft.purchaseConfiguration,
    order?.dentistRecommendedPurchaseConfiguration ?? null
  );
  const purchaseDivergenceCompleted = !purchaseDivergenceRequiresConfirmation || draft.purchaseDivergenceConfirmed === true;
  const labSelectionCompleted = Boolean(selectedLabId);
  const finalReviewCompleted = labSelectionCompleted && purchaseDivergenceCompleted;
  const canComplete =
    anamnesisCompleted &&
    productionRequestCompleted &&
    attachmentsCompleted &&
    labSelectionCompleted &&
    purchaseDivergenceCompleted;

  const stepCompletion = [
    dentistReviewCompleted,
    anamnesisCompleted,
    productionRequestCompleted && attachmentsCompleted && purchaseDivergenceCompleted,
    finalReviewCompleted,
  ];
  const currentStepData = STEP_DEFINITIONS[currentStep];
  const currentStepCompleted = stepCompletion[currentStep] ?? false;
  const isIneligibleReassessment = order?.status === 'ineligible_reassessment';
  const canProceedToProductionAfterPayment =
    order?.status === 'payment_confirmed' ||
    order?.status === 'awaiting_dentist_forms' ||
    order?.status === 'dentist_adjustment_required';
  const shouldHoldAtAnamnesisSummary =
    currentStep === 1 && dentistReviewCompleted && !canProceedToProductionAfterPayment;
  const anamnesisHoldNotice = isIneligibleReassessment
    ? {
      title: 'Cliente inapto para o Biteplaner',
      label: 'Cliente inapto para o Biteplaner',
      description:
        'O dentista registrou que o cliente não está apto para seguir com o Biteplaner agora. O cliente deverá selecionar outra clínica ou reagendar uma consulta com a mesma clínica para uma nova avaliação.',
      actionLabel: 'Aguardando reagendamento do cliente',
    }
    : {
      title: 'Pagamento do Biteplaner pendente',
      label: 'Pagamento do Biteplaner pendente',
      description:
        'O cliente precisa concluir o pagamento do Biteplaner antes do dentista prosseguir para a solicitação de produção ao laboratório.',
      actionLabel: 'Aguardando pagamento do cliente',
    };
  const anamnesisSourceDataReady = hasFormPayload(intakeForm);
  const dentistSystemValues = useMemo(
    () => getDentistSystemValues(backendUser, session?.user.email),
    [backendUser, session?.user.email]
  );

  useEffect(() => {
    if (isAnamnesisRecordDeepLink || isProductionRequestDeepLink) {
      return;
    }

    if (!dentistReviewCompleted || currentStep !== 0) {
      return;
    }

    setCurrentStep(1);
  }, [
    currentStep,
    dentistReviewCompleted,
    isAnamnesisRecordDeepLink,
    isProductionRequestDeepLink,
  ]);

  const mapCenter = useMemo<[number, number]>(() => {
    if (activeLab) {
      return [activeLab.coordinates.lat, activeLab.coordinates.lng];
    }

    if (labCepLocation) {
      return [labCepLocation.lat, labCepLocation.lng];
    }

    const fallback = displayedLabs[0];
    return fallback ? [fallback.coordinates.lat, fallback.coordinates.lng] : [-23.5618, -46.6565];
  }, [activeLab, displayedLabs, labCepLocation]);
  const mapPoints = useMemo<Array<[number, number]>>(() => {
    const points = displayedLabs.map((lab) => [lab.coordinates.lat, lab.coordinates.lng] as [number, number]);

    if (labCepLocation) {
      return [[labCepLocation.lat, labCepLocation.lng], ...points];
    }

    return points;
  }, [displayedLabs, labCepLocation]);
  const completionIssues = useMemo(() => {
    const issues: string[] = [];

    if (!anamnesisCompleted) {
      issues.push('completar a revisão clínica do dentista');
    }

    if (!productionRequestCompleted) {
      issues.push('preencher a solicitação de produção');
    }

    if (!draft.scan3dFileName.trim()) {
      issues.push('anexar o escaneamento 3D intraoral');
    }

    if (!draft.prescriptionFileName.trim()) {
      issues.push('anexar a prescrição médica assinada e carimbada');
    }

    if (!draft.lgpdConfirmed) {
      issues.push('confirmar o aceite de retenção e rastreabilidade');
    }

    if (!labSelectionCompleted) {
      issues.push('selecionar um laboratório licenciado');
    }

    if (!purchaseDivergenceCompleted) {
      issues.push('confirmar a divergência entre recomendação clínica e compra do cliente');
    }

    return issues;
  }, [
    anamnesisCompleted,
    draft.lgpdConfirmed,
    draft.prescriptionFileName,
    draft.scan3dFileName,
    labSelectionCompleted,
    productionRequestCompleted,
    purchaseDivergenceCompleted,
  ]);

  function updateDraft(patch: Partial<ProductionRequestDraft>) {
    setDraft((current) => {
      const nextDraft = { ...current, ...patch };
      draftRef.current = nextDraft;

      if (orderId) {
        queryClient.setQueryData<{ orders: DemoOrderSummary[] }>(
          biteplanerQueryKeys.orders('dentist', queryOwnerId),
          (currentOrders) => {
            if (!currentOrders) {
              return currentOrders;
            }

            return {
              orders: currentOrders.orders.map((item) =>
                item.id === orderId ? { ...item, productionRequestDraft: nextDraft } : item
              ),
            };
          }
        );
      }

      return nextDraft;
    });
  }

  function handleWorkflowFormsChange(nextForms: DemoWorkflowForm[]) {
    const nextIntakeForm = nextForms.find((form) => form.templateKey === 'customer_pre_consultation_intake');

    if (order) {
      queryClient.setQueryData<{ forms: DemoWorkflowForm[] }>(
        biteplanerQueryKeys.workflowForms(order.id),
        { forms: nextForms }
      );

      if (nextIntakeForm) {
        queryClient.setQueryData(biteplanerQueryKeys.workflowForm(order.id, nextIntakeForm.id), nextIntakeForm);
      }
    }

    const nextDentistReviewCompleted =
      hasDentistComplement(nextIntakeForm) && getDentistPendingRequiredFields(nextIntakeForm).length === 0;

    if (!nextDentistReviewCompleted) {
      return;
    }

    setCurrentStep((current) => (current === 0 ? 1 : current));
  }

  async function handleSearchLabs() {
    const normalizedCep = normalizeCep(labCep);

    if (normalizedCep.length !== 8) {
      setLabLookupError('Informe um CEP válido com 8 dígitos.');
      return;
    }

    setLabLookupError('');

    try {
      const nextCepLocation = await resolveCepLocation(normalizedCep);
      setLabCepLocation(nextCepLocation);
    } catch {
      setLabLookupError('Não foi possível localizar este CEP no mapa. Confira o número e tente novamente.');
    }
  }

  function handleUseCurrentLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setLabLookupError('Seu navegador não disponibilizou a localização atual.');
      return;
    }

    setLocatingLabCep(true);
    setLabLookupError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLabCepLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'Sua localização atual',
        });
        setLocatingLabCep(false);
      },
      () => {
        setLabLookupError('Não foi possível acessar sua localização atual. Verifique a permissão do navegador.');
        setLocatingLabCep(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  async function handleComplete() {
    if (!token || !orderId || !canComplete) {
      return;
    }

    setCompleting(true);
    setNotice('');
    setActionError('');
    setPdfError('');

    try {
      await registerClinicalDecision(orderId, 'eligible', token);
      await completeProductionRequest(orderId, draft, token);
      await queryClient.invalidateQueries({ queryKey: biteplanerQueryKeys.orderForms(orderId) });
      await queryClient.invalidateQueries({ queryKey: biteplanerQueryKeys.orders('dentist', queryOwnerId) });
      navigate('/painel/biteplaner?mode=dentist', {
        replace: true,
        state: {
          notice: `Solicitação de produção da ordem ${getOrderDisplayId(order)} concluída e enviada ao laboratório.`,
        },
      });
    } catch {
      setActionError('Não foi possível concluir o envio ao laboratório.');
    } finally {
      setCompleting(false);
    }
  }

  function downloadAnamnesisBlob(orderSnapshot: DemoOrderSummary, blob: Blob) {
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `ficha-anamnese-${getOrderDisplayId(orderSnapshot) || orderSnapshot.id}.pdf`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.setTimeout(() => URL.revokeObjectURL(url), 0);
    updateDraft({ anamnesisDownloaded: true });
    setPdfNotice('');
  }

  async function downloadAnamnesisPdfWithoutWorker(
    orderSnapshot: DemoOrderSummary,
    draftSnapshot: ProductionRequestDraft
  ) {
    try {
      const { createFinalAnamnesisPdfBlob } = await import('./finalAnamnesisPdf');
      const blob = await createFinalAnamnesisPdfBlob(orderSnapshot, intakeForm, onboardingForm, draftSnapshot);
      downloadAnamnesisBlob(orderSnapshot, blob);
    } catch {
      setPdfNotice('');
      setPdfError('Não foi possível gerar o PDF da anamnese.');
    }
  }

  function handleDownloadAnamnesisPdf() {
    if (!order) {
      return;
    }

    const orderSnapshot = order;
    const draftSnapshot = draftRef.current;
    setPdfNotice('Gerando ficha de anamnese para download.');
    setPdfError('');

    let worker: Worker;

    try {
      worker = new Worker(new URL('./finalAnamnesisPdf.worker.ts', import.meta.url), { type: 'module' });
    } catch {
      void downloadAnamnesisPdfWithoutWorker(orderSnapshot, draftSnapshot);
      return;
    }

    worker.onmessage = (event: MessageEvent<{ status: 'success'; arrayBuffer: ArrayBuffer } | { status: 'error'; message: string }>) => {
      worker.terminate();

      if (event.data.status === 'error') {
        void downloadAnamnesisPdfWithoutWorker(orderSnapshot, draftSnapshot);
        return;
      }

      const blob = new Blob([event.data.arrayBuffer], { type: 'application/pdf' });
      downloadAnamnesisBlob(orderSnapshot, blob);
    };

    worker.onerror = () => {
      worker.terminate();
      void downloadAnamnesisPdfWithoutWorker(orderSnapshot, draftSnapshot);
    };

    worker.postMessage({
      order: orderSnapshot,
      intakeForm,
      onboardingForm,
      draft: draftSnapshot,
    });
  }

  function handleNextStep() {
    if (currentStep === 1 && !canProceedToProductionAfterPayment) {
      return;
    }

    setCurrentStep((current) => Math.min(STEP_DEFINITIONS.length - 1, current + 1));
  }

  function handleAnamnesisDeepLinkNext() {
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
      },
      { replace: true }
    );
    handleNextStep();
  }

  function handleOpenDentistReview() {
    navigate(
      {
        pathname: location.pathname,
        search: location.search,
      },
      { replace: true }
    );
    setCurrentStep(0);
  }

  if (!orderId) {
    return (
      <PageStack>
        <S.Banner role="alert">Ordem não informada para a solicitação de produção.</S.Banner>
      </PageStack>
    );
  }

  return (
    <PageStack>
      {loading && !order ? (
        <S.LoadingStack aria-label="Carregando solicitação de produção">
          <SkeletonGrid cards={2} minCardWidth="260px" />
          <SkeletonCard lines={5} blockHeight="140px" />
        </S.LoadingStack>
      ) : null}
      {formsError ? <S.Banner role="alert">{formsError}</S.Banner> : null}
      {error || notice || pdfNotice || pdfError ? (
        <SnackbarStack>
          {pdfNotice ? (
            <Snackbar
              tone="info"
              title="PDF em geração"
              message={pdfNotice}
              onClose={() => {
                setPdfNotice('');
              }}
            />
          ) : null}
          {notice ? (
            <Snackbar
              tone="success"
              title="Ação concluída"
              message={notice}
              onClose={() => {
                setNotice('');
              }}
            />
          ) : null}
          {pdfError ? (
            <Snackbar
              tone="error"
              title="Falha ao gerar PDF"
              message={pdfError}
              onClose={() => {
                setPdfError('');
              }}
            />
          ) : null}
          {error ? (
            <Snackbar
              tone="error"
              title="Falha na requisicao"
              message={error}
              onClose={() => {
                setActionError('');
              }}
            />
          ) : null}
        </SnackbarStack>
      ) : null}

      {order ? (
        <S.ProductionCard>
          <S.ProductionHero>
            <S.ProductionHeroCopy>
              <S.HeroEyebrow>
                <ClipboardCheck size={18} aria-hidden="true" />
                Fluxo do dentista
              </S.HeroEyebrow>
              <S.ProductionTitle>Solicitação de produção</S.ProductionTitle>
              <S.ProductionLead>
                Complete a revisão clínica, gere a anamnese e envie somente os dados necessários ao laboratório licenciado.
              </S.ProductionLead>
            </S.ProductionHeroCopy>

            <OrderInfoCard
              order={order}
              orderHelpText="Complete a revisão clínica e envie os dados necessários ao laboratório licenciado."
              showMetadata={false}
            />
          </S.ProductionHero>
          {canShowFeedbackPrompt ? (
            <PendingFeedbackPrompt mode="dentist" orders={[order]} forms={workflowForms} />
          ) : null}
          <S.WizardShell>
            <S.WizardContent>
              <S.StepContentHeader>
                <S.StepKicker>Etapa {currentStep + 1} de {STEP_DEFINITIONS.length}</S.StepKicker>
                <S.StepStatusRow>
                  <S.StepContentTitle>{currentStepData.label}</S.StepContentTitle>
                </S.StepStatusRow>
                <S.StepContentDescription>{currentStepData.description}</S.StepContentDescription>
              </S.StepContentHeader>

              <S.FormPanel>
                {currentStep === 0 ? (
                  <>
                    <WorkflowFormsPanel
                      orderId={order.id}
                      token={token}
                      templateFilter={['customer_pre_consultation_intake']}
                      forms={workflowFormsForPanel}
                      onFormsChange={handleWorkflowFormsChange}
                      variant="embedded"
                      formPresentation="flat"
                      hideProceedActionIcons
                      actorRole="dentist"
                      defaultValues={dentistSystemValues}
                      showFormHeaderStatus={false}
                    />

                    {!dentistReviewCompleted ? (
                      <S.EmptyState>
                        Revise e complemente a avaliação inicial compartilhada antes de preencher a anamnese final.
                      </S.EmptyState>
                    ) : null}
                  </>
                ) : null}

                {currentStep === 1 ? (
                  <>
                    {anamnesisSourceDataReady ? (
                      <DentalAnamnesisRecord
                        order={order}
                        intakeForm={intakeForm}
                        onboardingForm={onboardingForm}
                        draft={draft}
                        onSummaryChange={(value) => updateDraft({ anamnesisSummary: value })}
                        onDownloadAnamnesisPdf={handleDownloadAnamnesisPdf}
                      />
                    ) : (
                      <S.Banner role="alert">
                        Dados da anamnese ainda não disponíveis. A ordem pode estar processando os dados no backend;
                        aguarde alguns instantes e atualize a página para carregar a ficha clínica completa.
                      </S.Banner>
                    )}

                    {isAnamnesisRecordDeepLink && !dentistReviewCompleted ? (
                      <S.Banner role="alert">
                        Antes de continuar para a solicitação de produção, complete a revisão clínica do dentista.
                        {dentistPendingRequiredFields.length > 0 ? (
                          <>
                            {' '}Campos pendentes: {dentistPendingRequiredFields.join('; ')}.
                          </>
                        ) : null}
                      </S.Banner>
                    ) : null}

                    {shouldHoldAtAnamnesisSummary ? (
                      <JourneyNoticeCard
                        tone="warning"
                        icon={<AlertTriangle size={18} />}
                        title={anamnesisHoldNotice.title}
                        ariaLabel={anamnesisHoldNotice.label}
                        description={anamnesisHoldNotice.description}
                        background="rgba(255, 251, 235, 0.72)"
                      />
                    ) : null}
                  </>
                ) : null}

                {currentStep === 2 ? (
                  <ProductionRequestFields
                    draft={draft}
                    dentistRecommendedPurchaseConfiguration={order?.dentistRecommendedPurchaseConfiguration ?? null}
                    onChange={updateDraft}
                  />
                ) : null}
                {currentStep === 3 ? (
                  <>
                    <FieldsGrid>
                      <Field
                        as="input"
                        label="CEP atual"
                        value={labCep}
                        onChange={(event: FieldChangeEvent) => setLabCep(formatCep(event.target.value))}
                      />
                      <S.SearchActionsGroup>
                        <S.SearchActionSlot>
                          <AdminFormButton
                            type="button"
                            onClick={() => void handleSearchLabs()}
                            trailingIcon={<Search size={16} aria-hidden="true" />}
                          >
                            Buscar laboratórios
                          </AdminFormButton>
                        </S.SearchActionSlot>
                        <S.SearchActionSlot>
                          <AdminFormButton type="button" variant="secondary" onClick={handleUseCurrentLocation}>
                            {locatingLabCep ? 'Localizando...' : 'Usar minha localização'}
                          </AdminFormButton>
                        </S.SearchActionSlot>
                      </S.SearchActionsGroup>
                    </FieldsGrid>

                    <S.LabLayout>
                      <S.MapCard>
                        <S.SectionTitle>Laboratórios próximos ao CEP</S.SectionTitle>
                        <S.Description>
                          Revise o parceiro licenciado e selecione o laboratório que vai receber esta ordem.
                        </S.Description>
                        <S.MapViewport>
                          <MapContainer center={mapCenter} zoom={13} scrollWheelZoom={false}>
                            <TileLayer
                              attribution="&copy; OpenStreetMap contributors"
                              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            />
                            <LicensedLabMapController points={mapPoints} />
                            {displayedLabs.map((lab) => (
                              <Marker
                                key={lab.id}
                                position={[lab.coordinates.lat, lab.coordinates.lng]}
                                icon={markerIcon}
                                eventHandlers={{
                                  click: () => {
                                    setActiveLab(lab);
                                    setSelectedLab(lab);
                                    updateDraft({ selectedLabId: getLabPayloadId(lab) });
                                  },
                                }}
                              >
                                <Popup>{lab.name}</Popup>
                              </Marker>
                            ))}
                            {labCepLocation ? (
                              <Marker position={[labCepLocation.lat, labCepLocation.lng]} icon={cepMarkerIcon} zIndexOffset={1500}>
                                <Popup>{labCepLocation.label}</Popup>
                              </Marker>
                            ) : null}
                          </MapContainer>
                        </S.MapViewport>

                        {licensedLabsQuery.isLoading ? (
                          <S.EmptyState>Carregando laboratórios licenciados...</S.EmptyState>
                        ) : null}
                        {labLookupError ? <S.Banner role="alert">{labLookupError}</S.Banner> : null}

                        <S.LabList>
                          {displayedLabs.map((lab) => (
                            <S.LabButton
                              key={lab.id}
                              type="button"
                              $active={activeLab?.id === lab.id}
                              onClick={() => {
                                setActiveLab(lab);
                                setSelectedLab(lab);
                                updateDraft({ selectedLabId: getLabPayloadId(lab) });
                              }}
                            >
                              <S.LabName>{lab.name}</S.LabName>
                              <S.LabMeta>{lab.address}</S.LabMeta>
                              <S.LabFooter>
                                <S.LabMeta>{lab.phone} - {formatDistanceKm(lab.distanceKm)} km</S.LabMeta>
                                <RatingStars score={lab.reviewScore} label="avaliações do laboratório" />
                              </S.LabFooter>
                            </S.LabButton>
                          ))}
                        </S.LabList>
                      </S.MapCard>

                      <S.SideCard>
                        <S.SectionTitle>Informações do laboratório</S.SectionTitle>
                        {activeLab ? (
                          <>
                            <S.GuidanceCard>
                              Use esta etapa como a seleção de clínicas: revise o cadastro aprovado e confirme o destino operacional da ordem.
                            </S.GuidanceCard>
                            <S.DetailList>
                              <S.DetailTerm>Laboratorio</S.DetailTerm>
                              <S.DetailValue>{activeLab.name}</S.DetailValue>

                              <S.DetailTerm>Endereço</S.DetailTerm>
                              <S.DetailValue>{activeLab.address}</S.DetailValue>

                              <S.DetailTerm>CEP</S.DetailTerm>
                              <S.DetailValue>{activeLab.cep || '-'}</S.DetailValue>

                              <S.DetailTerm>Telefone</S.DetailTerm>
                              <S.DetailValue>{activeLab.phone}</S.DetailValue>

                              <S.DetailTerm>CNPJ</S.DetailTerm>
                              <S.DetailValue>{activeLab.cnpj || '-'}</S.DetailValue>

                              <S.DetailTerm>Horário</S.DetailTerm>
                              <S.DetailValue>{activeLab.serviceHours || '-'}</S.DetailValue>

                              <S.DetailTerm>Distancia</S.DetailTerm>
                              <S.DetailValue>{formatDistanceKm(activeLab.distanceKm)} km</S.DetailValue>
                            </S.DetailList>

                            {activeLab.professionalSummary ? (
                              <S.GuidanceCard>{activeLab.professionalSummary}</S.GuidanceCard>
                            ) : null}
                          </>
                        ) : (
                          <S.Description>Selecione um laboratório da lista para ver os detalhes completos.</S.Description>
                        )}
                      </S.SideCard>
                    </S.LabLayout>

                    {labsError ? <S.Banner role="alert">{labsError}</S.Banner> : null}

                    {selectedLab ? (
                      <S.Banner>Laboratório selecionado: {selectedLab.name}</S.Banner>
                    ) : (
                      <S.EmptyState>Selecione um laboratório licenciado para concluir o envio da ordem.</S.EmptyState>
                    )}

                    {!canComplete ? (
                      <S.EmptyState>
                        Para finalizar ainda faltam: {completionIssues.join(', ')}.
                      </S.EmptyState>
                    ) : null}
                  </>
                ) : null}

                {isAnamnesisRecordDeepLink ? (
                  <S.DeepLinkStepActions>
                    <span />
                    <S.SecondaryActions>
                      {!dentistReviewCompleted ? (
                        <AdminFormButton
                          type="button"
                          onClick={handleOpenDentistReview}
                        >
                          Completar revisão clínica
                        </AdminFormButton>
                      ) : (
                        <AdminFormButton
                          type="button"
                          onClick={handleAnamnesisDeepLinkNext}
                        >
                          Continuar para solicitação de produção
                        </AdminFormButton>
                      )}
                    </S.SecondaryActions>
                  </S.DeepLinkStepActions>
                ) : currentStep === 0 && !dentistReviewCompleted ? null : (
                  <S.StepActions>
                    <S.SecondaryActions>
                      <AdminFormButton
                        type="button"
                        variant="secondary"
                        disabled={currentStep === 0}
                        onClick={() => setCurrentStep((current) => Math.max(0, current - 1))}
                        leadingIcon={<ArrowLeft size={16} aria-hidden="true" />}
                      >
                        Voltar
                      </AdminFormButton>
                    </S.SecondaryActions>

                    <S.SecondaryActions>
                      {shouldHoldAtAnamnesisSummary ? (
                        <AdminFormButton type="button" disabled>
                          {anamnesisHoldNotice.actionLabel}
                        </AdminFormButton>
                      ) : currentStep < STEP_DEFINITIONS.length - 1 ? (
                        <AdminFormButton
                          type="button"
                          disabled={!currentStepCompleted}
                          onClick={handleNextStep}
                        >
                          Próximo
                        </AdminFormButton>
                      ) : (
                        <AdminFormButton
                          type="button"
                          disabled={!canComplete || completing}
                          onClick={() => void handleComplete()}
                        >
                          {completing ? 'Finalizando...' : 'Finalizar'}
                        </AdminFormButton>
                      )}
                    </S.SecondaryActions>
                  </S.StepActions>
                )}
              </S.FormPanel>
            </S.WizardContent>
          </S.WizardShell>
        </S.ProductionCard>
      ) : null}
    </PageStack>
  );
}
