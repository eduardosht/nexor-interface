import { useEffect, useMemo, useState } from 'react';
import { CalendarCheck, Mail, MessageCircle, Star } from 'lucide-react';
import * as S from './styles';
import { MapContainer, Marker, Popup, TileLayer, useMap } from 'react-leaflet';
import { divIcon, latLngBounds } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { AdminModalAction, AdminModalActions } from '@nexor/design-system';
import { SkeletonBlock, SkeletonCard, SkeletonLine } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchPracticeLocations,
  fetchOrders,
  fetchWorkflowForms,
  getAuthToken,
  scheduleInitialConsultation,
  type DemoOrderSummary,
  type DemoPracticeLocationSelection,
  type DemoWorkflowForm,
  type PracticeLocationApiRecord,
} from '../../../features/demo/biteplanerFlow';
import {
  getConsultationCepLocation,
  getConsultationLocation,
  listConsultationLocationsByCep,
} from '../../../features/demo/consultationLocations';
import { OrderStepHeader } from '../components/OrderStepHeader';

const markerIcon = divIcon({
  className: 'consultation-map-pin',
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

const activeMarkerIcon = divIcon({
  className: 'consultation-map-pin consultation-map-pin-active',
  html: `
    <div style="
      width: 28px;
      height: 28px;
      border-radius: 50% 50% 50% 0;
      transform: rotate(-45deg);
      background: #f59e0b;
      border: 3px solid #ffffff;
      box-shadow: 0 0 0 8px rgba(245, 158, 11, 0.2), 0 14px 30px rgba(23, 23, 23, 0.26);
    ">
      <div style="
        position: absolute;
        inset: 7px;
        border-radius: 999px;
        background: #171717;
      "></div>
    </div>
  `,
  iconSize: [28, 28],
  iconAnchor: [14, 28],
  popupAnchor: [0, -26],
});

const cepMarkerIcon = divIcon({
  className: 'consultation-map-pin consultation-map-pin-home',
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

const DENTIST_PARTNER_PATH = '/parceiros#dentistas';
const FALLBACK_COORDINATES = { lat: -23.5923, lng: -46.6843 };
const CLINIC_WHATSAPP_MESSAGE = 'Olá! Quero agendar uma consulta para uso do Biteplaner e saber valores.';
const DEFAULT_CEP = '';
const EARTH_RADIUS_KM = 6371;
const CLINIC_CARDS_PAGE_SIZE = 4;
const INTAKE_TEMPLATE_KEY = 'customer_pre_consultation_intake';

type ConsultaInicialProps = {
  embedded?: boolean;
  initialOrder?: DemoOrderSummary | null;
  onOrderChange?: (order: DemoOrderSummary) => void;
};

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
  address?: string;
  district?: string;
  city?: string;
  state?: string;
  lat?: string;
  lng?: string;
};

function getDentistPartnerUrl() {
  if (typeof window === 'undefined') {
    return DENTIST_PARTNER_PATH;
  }

  return `${window.location.origin}${DENTIST_PARTNER_PATH}`;
}

function formatCep(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length <= 5) {
    return digits;
  }

  return `${digits.slice(0, 5)}-${digits.slice(5)}`;
}

function getDefaultDentistReferralMessage(dentistPartnerUrl: string) {
  return [
    'Olá! Estou usando o Biteplaner, uma solução da Nexor para protetor bucal personalizado para atletas.',
    'A Nexor licencia dentistas para avaliação, acompanhamento e atendimento do processo.',
    `Caso tenha interesse, veja como funciona para dentistas em: ${dentistPartnerUrl}`,
  ].join('\n\n');
}

function normalizeCep(value: string) {
  return value.replace(/\D/g, '').slice(0, 8);
}

function formatDistanceKm(value: number) {
  return value < 10 ? value.toFixed(1) : value.toFixed(0);
}

function toRadians(value: number) {
  return (value * Math.PI) / 180;
}

function calculateDistanceKm(
  from: { lat: number; lng: number },
  to: { lat: number; lng: number }
) {
  const latDelta = toRadians(to.lat - from.lat);
  const lngDelta = toRadians(to.lng - from.lng);
  const fromLat = toRadians(from.lat);
  const toLat = toRadians(to.lat);
  const haversine =
    Math.sin(latDelta / 2) ** 2 +
    Math.cos(fromLat) * Math.cos(toLat) * Math.sin(lngDelta / 2) ** 2;

  return EARTH_RADIUS_KM * 2 * Math.atan2(Math.sqrt(haversine), Math.sqrt(1 - haversine));
}

function withDistances(
  locations: DemoPracticeLocationSelection[],
  cepLocation: CepLocation | null
) {
  if (!cepLocation) {
    return locations;
  }

  return locations.map((location) => ({
      ...location,
      distanceKm: calculateDistanceKm(cepLocation, location.coordinates),
    }));
}

function getCustomerPayload(form: DemoWorkflowForm) {
  const customerPayload = form.payload?.customer;

  if (customerPayload && typeof customerPayload === 'object' && !Array.isArray(customerPayload)) {
    return customerPayload as Record<string, unknown>;
  }

  return {};
}

function isPositiveValue(value: unknown) {
  return value === true || value === 'true' || value === 'yes' || value === 'sim';
}

function getRequiresAdaptedClinic(forms: DemoWorkflowForm[]) {
  const intakeForm = forms.find((form) => form.templateKey === INTAKE_TEMPLATE_KEY);

  if (!intakeForm) {
    return false;
  }

  return isPositiveValue(getCustomerPayload(intakeForm).requiresAdaptedClinic);
}

function ConsultationMapController({ points }: { points: Array<[number, number]> }) {
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

function getBrazilWhatsappPhone(phone: string) {
  const digits = phone.replace(/\D/g, '');

  if (digits.length < 10) {
    return '';
  }

  return digits.startsWith('55') ? digits : `55${digits}`;
}

function getClinicSchedulingWhatsappHref(phone: string) {
  const whatsappPhone = getBrazilWhatsappPhone(phone);

  if (!whatsappPhone) {
    return '';
  }

  return `https://wa.me/${whatsappPhone}?text=${encodeURIComponent(CLINIC_WHATSAPP_MESSAGE)}`;
}

function formatPracticeLocationAddress(location: PracticeLocationApiRecord) {
  const address = location.address;

  if (!address) {
    return 'Endereço não informado';
  }

  const streetLine = [address.street, address.number].filter(Boolean).join(', ');
  const districtLine = address.district ? ` - ${address.district}` : '';
  const cityLine = [address.city, address.state].filter(Boolean).join(' - ');

  return [streetLine ? `${streetLine}${districtLine}` : '', cityLine].filter(Boolean).join(', ') || 'Endereço não informado';
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

function mapPracticeLocation(location: PracticeLocationApiRecord, index: number): DemoPracticeLocationSelection {
  return {
    id: location.id,
    name: location.name,
    address: formatPracticeLocationAddress(location),
    cep: location.address?.zip_code ?? '',
    phone: location.phone ?? '',
    isAdapted: Boolean(location.is_adapted ?? location.isAdapted),
    dentistName: location.dentist?.full_name ?? 'Dentista não informado',
    dentistReviewScore: 0,
    distanceKm: 0,
    coordinates: {
      lat: location.address?.latitude ?? FALLBACK_COORDINATES.lat + index * 0.002,
      lng: location.address?.longitude ?? FALLBACK_COORDINATES.lng + index * 0.002,
    },
  };
}

async function mapPracticeLocationWithGeocoding(
  location: PracticeLocationApiRecord,
  index: number
): Promise<DemoPracticeLocationSelection> {
  const mappedLocation = mapPracticeLocation(location, index);

  if (location.address?.latitude !== undefined && location.address.longitude !== undefined) {
    return mappedLocation;
  }

  if (mappedLocation.cep) {
    try {
      const cepCoordinates = await resolveCepLocation(mappedLocation.cep);

      return {
        ...mappedLocation,
        coordinates: {
          lat: cepCoordinates.lat,
          lng: cepCoordinates.lng,
        },
      };
    } catch {
      // Keep trying with the full address below before falling back to default coordinates.
    }
  }

  const coordinates = await geocodeAddress(
    [
      mappedLocation.address,
      mappedLocation.cep,
      'Brasil',
    ]
      .filter(Boolean)
      .join(', ')
  );

  return coordinates
    ? {
        ...mappedLocation,
        coordinates,
      }
    : mappedLocation;
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

export function ConsultaInicial({ embedded = false, initialOrder = null, onOrderChange }: ConsultaInicialProps) {
  const { session, isMockMode } = useAuth();
  const token = getAuthToken(session);
  const dentistPartnerUrl = getDentistPartnerUrl();
  const [cep, setCep] = useState(DEFAULT_CEP);
  const [cepLocation, setCepLocation] = useState<CepLocation | null>(null);
  const [order, setOrder] = useState<DemoOrderSummary | null>(initialOrder);
  const [dentistReferralMessage, setDentistReferralMessage] = useState(() =>
    getDefaultDentistReferralMessage(dentistPartnerUrl)
  );
  const [visibleLocations, setVisibleLocations] = useState<DemoPracticeLocationSelection[]>(
    () => (isMockMode ? listConsultationLocationsByCep('') : [])
  );
  const [activeLocation, setActiveLocation] = useState<DemoPracticeLocationSelection | null>(
    () => (isMockMode ? listConsultationLocationsByCep('')[0] ?? null : null)
  );
  const [loading, setLoading] = useState(!initialOrder);
  const [error, setError] = useState('');
  const [schedulingConsultation, setSchedulingConsultation] = useState(false);
  const [locatingUser, setLocatingUser] = useState(false);
  const [scheduleNotice, setScheduleNotice] = useState('');
  const [showScheduleConfirmation, setShowScheduleConfirmation] = useState(false);
  const [requiresAdaptedClinic, setRequiresAdaptedClinic] = useState(false);
  const [showOnlyAdaptedClinics, setShowOnlyAdaptedClinics] = useState(false);
  const [clinicPage, setClinicPage] = useState(1);

  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
      setLoading(false);

      if (initialOrder.practice_location?.id) {
        const selectedLocation = getConsultationLocation(initialOrder.practice_location.id);
        if (selectedLocation) {
          setActiveLocation(selectedLocation);
        }
      }

      return;
    }

    if (!token) {
      return;
    }

    let active = true;

    async function loadOrder() {
      try {
        const response = await fetchOrders('user', token);
        const nextOrder =
          response.orders.find((item) => item.status === 'awaiting_scheduling') ??
          response.orders.find((item) => item.stage === 'awaiting_initial_consultation') ??
          response.orders[0] ??
          null;

        if (!active) {
          return;
        }

        setOrder(nextOrder);

        if (nextOrder?.practice_location?.id) {
          const selectedLocation = getConsultationLocation(nextOrder.practice_location.id);
          if (selectedLocation) {
            setActiveLocation(selectedLocation);
          }
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar a etapa de consulta inicial da demo.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [initialOrder, token]);

  useEffect(() => {
    if (!order?.id || !token) {
      setRequiresAdaptedClinic(false);
      return;
    }

    let active = true;

    async function loadCustomerIntake() {
      try {
        const response = await fetchWorkflowForms(order!.id, token);

        if (active) {
          setRequiresAdaptedClinic(getRequiresAdaptedClinic(response.forms));
        }
      } catch {
        if (active) {
          setRequiresAdaptedClinic(false);
        }
      }
    }

    void loadCustomerIntake();

    return () => {
      active = false;
    };
  }, [order?.id, token]);

  useEffect(() => {
    if (requiresAdaptedClinic) {
      setShowOnlyAdaptedClinics(true);
    }
  }, [requiresAdaptedClinic]);

  useEffect(() => {
    if (isMockMode) {
      if (normalizeCep(cep).length !== 8) {
        const demoLocations = listConsultationLocationsByCep('');
        setCepLocation(null);
        setVisibleLocations(demoLocations);
        setActiveLocation((current) =>
          current && demoLocations.some((location) => location.id === current.id)
            ? current
            : demoLocations[0] ?? null
        );
        return;
      }

      const demoLocations = listConsultationLocationsByCep(cep);
      setVisibleLocations(demoLocations);
      setActiveLocation((current) => current ?? demoLocations[0] ?? null);
      return;
    }

    if (!token) {
      return;
    }

    let active = true;

    async function loadPracticeLocations() {
      try {
        const response = await fetchPracticeLocations(token);

        if (!active) {
          return;
        }

        const mappedLocations = await Promise.all(response.practiceLocations.map(mapPracticeLocationWithGeocoding));
        const mappedLocationsWithDistances = withDistances(mappedLocations, cepLocation);
        setVisibleLocations(mappedLocations);
        setActiveLocation((current) => {
          if (current && mappedLocations.some((location) => location.id === current.id)) {
            return current;
          }

          const selectedByOrder = order?.practice_location?.id
            ? mappedLocations.find((location) => location.id === order.practice_location?.id)
            : null;

          return selectedByOrder ?? mappedLocationsWithDistances[0] ?? null;
        });
      } catch {
        if (active) {
          setError('Não foi possível carregar os locais de atendimento aprovados.');
          setVisibleLocations([]);
          setActiveLocation(null);
        }
      }
    }

    void loadPracticeLocations();

    return () => {
      active = false;
    };
  }, [cepLocation, isMockMode, order?.practice_location?.id, token]);

  const dentistReferralSubject = 'Convite para conhecer o licenciamento Biteplaner para dentistas';
  const dentistReferralEmailHref = `mailto:?subject=${encodeURIComponent(dentistReferralSubject)}&body=${encodeURIComponent(dentistReferralMessage)}`;
  const dentistReferralWhatsappHref = `https://wa.me/?text=${encodeURIComponent(dentistReferralMessage)}`;
  const displayedLocations = useMemo(
    () => withDistances(visibleLocations, cepLocation),
    [cepLocation, visibleLocations]
  );
  const shouldFilterAdaptedClinics = requiresAdaptedClinic || showOnlyAdaptedClinics;
  const filteredDisplayedLocations = useMemo(
    () =>
      shouldFilterAdaptedClinics
        ? displayedLocations.filter((location) => location.isAdapted)
        : displayedLocations,
    [displayedLocations, shouldFilterAdaptedClinics]
  );
  const totalClinicPages = Math.max(1, Math.ceil(filteredDisplayedLocations.length / CLINIC_CARDS_PAGE_SIZE));
  const currentClinicPage = Math.min(clinicPage, totalClinicPages);
  const clinicPageStart = (currentClinicPage - 1) * CLINIC_CARDS_PAGE_SIZE;
  const paginatedClinicLocations = filteredDisplayedLocations.slice(
    clinicPageStart,
    clinicPageStart + CLINIC_CARDS_PAGE_SIZE
  );
  const clinicPageEnd = clinicPageStart + paginatedClinicLocations.length;
  const activeDisplayedLocation = useMemo(
    () =>
      filteredDisplayedLocations.find((location) => location.id === activeLocation?.id) ??
      filteredDisplayedLocations[0] ??
      null,
    [activeLocation?.id, filteredDisplayedLocations]
  );
  const clinicSchedulingWhatsappHref = activeDisplayedLocation
    ? getClinicSchedulingWhatsappHref(activeDisplayedLocation.phone)
    : '';
  const canConfirmScheduledConsultation = order?.status === 'awaiting_scheduling' || order?.status === 'ineligible_reassessment';
  const hasInformedScheduledConsultation = order?.status === 'awaiting_dentist_acceptance';
  const scheduledConsultationNotice =
    scheduleNotice ||
    (hasInformedScheduledConsultation
      ? 'Consulta informada com sucesso. Agora estamos aguardando o dentista aceitar a ordem via sistema.'
      : '');

  const mapCenter = useMemo<[number, number]>(() => {
    if (cepLocation) {
      return [cepLocation.lat, cepLocation.lng];
    }

    if (activeDisplayedLocation) {
      return [activeDisplayedLocation.coordinates.lat, activeDisplayedLocation.coordinates.lng];
    }

    const fallback = filteredDisplayedLocations[0];
    return fallback ? [fallback.coordinates.lat, fallback.coordinates.lng] : [-23.5923, -46.6843];
  }, [activeDisplayedLocation, cepLocation, filteredDisplayedLocations]);
  const mapPoints = useMemo<Array<[number, number]>>(() => {
    const points = filteredDisplayedLocations.map((location) => [
      location.coordinates.lat,
      location.coordinates.lng,
    ] as [number, number]);

    if (cepLocation) {
      return [[cepLocation.lat, cepLocation.lng], ...points];
    }

    return points;
  }, [cepLocation, filteredDisplayedLocations]);

  useEffect(() => {
    setClinicPage(1);
  }, [cep, shouldFilterAdaptedClinics]);

  useEffect(() => {
    if (clinicPage > totalClinicPages) {
      setClinicPage(totalClinicPages);
    }
  }, [clinicPage, totalClinicPages]);

  useEffect(() => {
    if (!activeDisplayedLocation) {
      setActiveLocation(null);
      return;
    }

    if (activeLocation?.id !== activeDisplayedLocation.id) {
      setActiveLocation(activeDisplayedLocation);
    }
  }, [activeDisplayedLocation, activeLocation?.id]);

  async function handleSearch() {
    const normalizedCep = normalizeCep(cep);

    if (normalizedCep.length !== 8) {
      setError('Informe um CEP válido com 8 dígitos.');
      return;
    }

    setError('');

    if (isMockMode) {
      const nextLocations = listConsultationLocationsByCep(cep);
      const nextCepLocation = getConsultationCepLocation(cep, nextLocations);
      const nextLocationsWithDistances = withDistances(nextLocations, nextCepLocation);

      setCepLocation(nextCepLocation);
      setVisibleLocations(nextLocations);
      setActiveLocation(nextLocationsWithDistances[0] ?? null);
      return;
    }

    try {
      const nextCepLocation = await resolveCepLocation(cep);
      const nextLocationsWithDistances = withDistances(visibleLocations, nextCepLocation);

      setCepLocation(nextCepLocation);
      setActiveLocation(nextLocationsWithDistances[0] ?? null);
    } catch {
      setError('Não foi possível localizar este CEP no mapa. Confira o número e tente novamente.');
    }
  }

  function handleCepChange(value: string) {
    const nextCep = formatCep(value);
    setCep(nextCep);

    if (!isMockMode || normalizeCep(nextCep).length !== 8) {
      return;
    }

    const nextLocations = listConsultationLocationsByCep(nextCep);
    const nextCepLocation = getConsultationCepLocation(nextCep, nextLocations);

    setCepLocation(nextCepLocation);
    setVisibleLocations(nextLocations);
    setActiveLocation((current) =>
      current && nextLocations.some((location) => location.id === current.id)
        ? current
        : nextLocations[0] ?? null
    );
  }

  function handleUseCurrentLocation() {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      setError('Seu navegador não disponibilizou a localização atual.');
      return;
    }

    setLocatingUser(true);
    setError('');

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextCepLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          label: 'Sua localização atual',
        };
        const locationSource =
          visibleLocations.length > 0 || !isMockMode
            ? visibleLocations
            : listConsultationLocationsByCep('');
        const nextLocationsWithDistances = withDistances(locationSource, nextCepLocation);

        setCepLocation(nextCepLocation);
        setVisibleLocations(locationSource);
        setActiveLocation(nextLocationsWithDistances[0] ?? null);
        setLocatingUser(false);
      },
      () => {
        setError('Não foi possível acessar sua localização atual. Verifique a permissão do navegador.');
        setLocatingUser(false);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000,
      }
    );
  }

  async function handleScheduleConsultation() {
    if (!token || !order?.id || !activeDisplayedLocation) {
      return;
    }

    setShowScheduleConfirmation(false);
    setSchedulingConsultation(true);
    setScheduleNotice('');
    setError('');

    try {
      const response = await scheduleInitialConsultation(order.id, activeDisplayedLocation.id, token);
      setOrder(response.order);
      onOrderChange?.(response.order);
      setScheduleNotice('Consulta informada com sucesso. Agora estamos aguardando o dentista aceitar a ordem via sistema.');
    } catch {
      setError('Não foi possível vincular a consulta agendada agora.');
    } finally {
      setSchedulingConsultation(false);
    }
  }

  return (
    <S.Page>
      {!embedded ? (
        <OrderStepHeader
          title="Consulta inicial"
          description="Escolha um consultório licenciado para visualizar a clínica, o dentista responsável e o contexto da primeira consulta."
          currentStep="consultation"
          order={order}
          orderHelpText="Este pedido já passou pela triagem e agora precisa da escolha do consultório licenciado para a consulta inicial."
        />
      ) : null}

      {loading ? (
        <S.LoadingStack aria-label="Carregando etapa de consulta inicial">
          <S.SearchBar>
            <SkeletonLine width="320px" height="44px" />
            <SkeletonLine width="130px" height="44px" />
          </S.SearchBar>
          <S.Layout>
            <S.MapCard>
              <SkeletonLine width="38%" />
              <SkeletonLine width="72%" />
              <SkeletonBlock height="460px" />
              <S.SkeletonGridList>
                <SkeletonCard lines={2} />
                <SkeletonCard lines={2} />
              </S.SkeletonGridList>
            </S.MapCard>
            <SkeletonCard lines={6} blockHeight="52px" />
          </S.Layout>
        </S.LoadingStack>
      ) : (
        <>
          {error ? <S.Banner role="alert">{error}</S.Banner> : null}
          <S.SearchBar>
            <S.CepField
              value={cep}
              onChange={(event) => handleCepChange(event.target.value)}
              aria-label="CEP"
              inputMode="numeric"
              maxLength={9}
              placeholder="00000-000"
            />
            <S.SearchButton type="button" onClick={handleSearch}>
              Buscar clínicas
            </S.SearchButton>
            <S.SecondaryButton type="button" onClick={handleUseCurrentLocation} disabled={locatingUser}>
              {locatingUser ? 'Localizando...' : 'Usar minha localização'}
            </S.SecondaryButton>
          </S.SearchBar>

          <S.ClinicFilterBar>
            <S.ClinicRequirementBadge>
              Necessidade informada: {requiresAdaptedClinic ? 'clínica adaptada' : 'sem exigência de clínica adaptada'}
            </S.ClinicRequirementBadge>
            <S.FilterCheckbox>
              <input
                type="checkbox"
                checked={shouldFilterAdaptedClinics}
                disabled={requiresAdaptedClinic}
                onChange={(event) => setShowOnlyAdaptedClinics(event.target.checked)}
              />
              <span>Somente clínicas adaptadas</span>
            </S.FilterCheckbox>
          </S.ClinicFilterBar>

          <S.Layout>
            <S.MapCard>
              <S.SectionTitle>Clínicas próximas ao CEP</S.SectionTitle>
              <S.Description>
                O pin de casa representa o CEP informado, e os demais pins mostram as clínicas disponíveis com distância estimada.
              </S.Description>
              <S.MapViewport>
                <MapContainer
                  key={`${mapCenter[0].toFixed(5)}:${mapCenter[1].toFixed(5)}:${filteredDisplayedLocations.length}`}
                  center={mapCenter}
                  zoom={14}
                  scrollWheelZoom={false}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <ConsultationMapController points={mapPoints} />
                  {filteredDisplayedLocations.map((location) => {
                    const selected = activeDisplayedLocation?.id === location.id;

                    return (
                      <Marker
                        key={location.id}
                        position={[location.coordinates.lat, location.coordinates.lng]}
                        icon={selected ? activeMarkerIcon : markerIcon}
                        zIndexOffset={selected ? 1000 : 0}
                        eventHandlers={{
                          click: () => {
                            setActiveLocation(location);
                          },
                        }}
                      >
                        <Popup>{location.name}</Popup>
                      </Marker>
                    );
                  })}
                  {cepLocation ? (
                    <Marker
                      position={[cepLocation.lat, cepLocation.lng]}
                      icon={cepMarkerIcon}
                      zIndexOffset={1500}
                    >
                      <Popup>{cepLocation.label}</Popup>
                    </Marker>
                  ) : null}
                </MapContainer>
              </S.MapViewport>
              <S.ClinicList>
                {paginatedClinicLocations.map((location) => (
                  <S.ClinicButton
                    key={location.id}
                    type="button"
                    aria-label={`Clínica: ${location.name}`}
                    $active={activeDisplayedLocation?.id === location.id}
                    onClick={() => setActiveLocation(location)}
                  >
                    <S.ClinicHeader>
                      <S.ClinicName>{location.name}</S.ClinicName>
                      <S.AdaptedBadge $adapted={location.isAdapted}>
                        {location.isAdapted ? 'Adaptada' : 'Não adaptada'}
                      </S.AdaptedBadge>
                    </S.ClinicHeader>
                    <S.ClinicMeta>{location.address}</S.ClinicMeta>
                    <S.ClinicFooter>
                      <S.ClinicMeta>
                        {cepLocation
                          ? `${formatDistanceKm(location.distanceKm)} km do CEP informado`
                          : 'Informe um CEP ou use sua localização para calcular distância'}
                      </S.ClinicMeta>
                      <RatingStars score={location.dentistReviewScore} label="avaliações do dentista" />
                    </S.ClinicFooter>
                  </S.ClinicButton>
                ))}
              </S.ClinicList>
              {filteredDisplayedLocations.length === 0 ? (
                <S.Description>
                  Nenhuma clínica adaptada foi encontrada para este CEP. Tente outro CEP ou fale com a Nexor para
                  localizar um consultório licenciado compatível.
                </S.Description>
              ) : null}
              {filteredDisplayedLocations.length > CLINIC_CARDS_PAGE_SIZE ? (
                <S.ClinicPagination aria-label="Paginação de clínicas">
                  <S.ClinicPageSummary>
                    Mostrando {clinicPageStart + 1} a {clinicPageEnd} de {filteredDisplayedLocations.length} clínicas
                  </S.ClinicPageSummary>
                  <S.ClinicPageActions>
                    <S.SecondaryButton
                      type="button"
                      onClick={() => setClinicPage((current) => Math.max(1, current - 1))}
                      disabled={currentClinicPage === 1}
                      aria-label="Página anterior de clínicas"
                    >
                      Anterior
                    </S.SecondaryButton>
                    <S.ClinicPageIndicator>{currentClinicPage}</S.ClinicPageIndicator>
                    <S.SecondaryButton
                      type="button"
                      onClick={() => setClinicPage((current) => Math.min(totalClinicPages, current + 1))}
                      disabled={currentClinicPage === totalClinicPages}
                      aria-label="Próxima página de clínicas"
                    >
                      Próxima
                    </S.SecondaryButton>
                  </S.ClinicPageActions>
                </S.ClinicPagination>
              ) : null}
            </S.MapCard>

            <S.SideCard>
              <S.SectionTitle>Informações da clínica</S.SectionTitle>
              {activeDisplayedLocation ? (
                <>
                  <S.GuidanceCard>
                    Use os dados abaixo para entrar em contato com o consultório fora da plataforma. Quando a consulta
                    estiver agendada, confirme nesta tela para vincular esta ordem ao dentista aprovado.
                  </S.GuidanceCard>
                  <S.DetailList>
                    <S.DetailTerm>Clínica</S.DetailTerm>
                    <S.DetailValue>{activeDisplayedLocation.name}</S.DetailValue>

                    <S.DetailTerm>Dentista</S.DetailTerm>
                    <S.DetailValue>
                      <S.DetailValueStack>
                        <span>{activeDisplayedLocation.dentistName}</span>
                        <RatingStars
                          score={activeDisplayedLocation.dentistReviewScore}
                          label="avaliações do dentista selecionado"
                        />
                      </S.DetailValueStack>
                    </S.DetailValue>

                    <S.DetailTerm>Endereço</S.DetailTerm>
                    <S.DetailValue>{activeDisplayedLocation.address}</S.DetailValue>

                    <S.DetailTerm>CEP</S.DetailTerm>
                    <S.DetailValue>{activeDisplayedLocation.cep}</S.DetailValue>

                    <S.DetailTerm>Clínica adaptada</S.DetailTerm>
                    <S.DetailValue>{activeDisplayedLocation.isAdapted ? 'Sim' : 'Não'}</S.DetailValue>

                    <S.DetailTerm>Telefone</S.DetailTerm>
                    <S.DetailValue>{activeDisplayedLocation.phone}</S.DetailValue>

                    <S.DetailTerm>Distância</S.DetailTerm>
                    <S.DetailValue>{formatDistanceKm(activeDisplayedLocation.distanceKm)} km</S.DetailValue>
                  </S.DetailList>
                  {clinicSchedulingWhatsappHref ? (
                    <S.WhatsappActionHref href={clinicSchedulingWhatsappHref} target="_blank" rel="noreferrer">
                      <MessageCircle size={16} aria-hidden data-testid="clinic-whatsapp-icon" />
                      Agendar pelo WhatsApp
                    </S.WhatsappActionHref>
                  ) : null}
                  <S.GuidanceCard>
                    Confirme quando a consulta estiver agendada. A consulta só será considerada realizada depois do
                    match de confirmação entre paciente e dentista.
                  </S.GuidanceCard>
                  {canConfirmScheduledConsultation ? (
                    <S.ScheduleButton
                    type="button"
                    onClick={() => setShowScheduleConfirmation(true)}
                    disabled={schedulingConsultation || !canConfirmScheduledConsultation}
                  >
                    <CalendarCheck size={18} aria-hidden />
                    {canConfirmScheduledConsultation
                      ? schedulingConsultation
                        ? 'Vinculando...'
                        : order?.status === 'ineligible_reassessment'
                          ? 'Marcar nova consulta'
                          : 'Consulta agendada'
                      : order?.status === 'awaiting_dentist_acceptance'
                        ? 'Aguardando aceite'
                        : order?.status === 'registration_started'
                          ? 'Aguardando pré-requisito'
                        : 'Consulta vinculada'}
                    </S.ScheduleButton>
                  ) : null}
                  {scheduledConsultationNotice ? (
                    <S.PositiveFeedback role="status">{scheduledConsultationNotice}</S.PositiveFeedback>
                  ) : null}
                </>
              ) : (
                <S.Description>Selecione um pin ou uma clínica da lista para ver os detalhes.</S.Description>
              )}
            </S.SideCard>
          </S.Layout>

          <S.ReferralCard aria-labelledby="dentist-referral-title">
            <S.ReferralContent>
              <S.SectionTitle id="dentist-referral-title">Indique seu dentista de preferência</S.SectionTitle>
              <S.Description>
                Caso deseje, você pode enviar uma mensagem pronta ao seu dentista para apresentar o processo de
                licenciamento Biteplaner.
              </S.Description>
              <S.MessageTextarea
                aria-label="Mensagem para o dentista"
                value={dentistReferralMessage}
                onChange={(event) => setDentistReferralMessage(event.target.value)}
              />
              <S.ReferralActions>
                <S.WhatsappActionHref href={dentistReferralWhatsappHref} target="_blank" rel="noreferrer">
                  <MessageCircle size={16} aria-hidden data-testid="referral-whatsapp-icon" />
                  Enviar por WhatsApp
                </S.WhatsappActionHref>
                <S.EmailActionHref href={dentistReferralEmailHref}>
                  <Mail size={16} aria-hidden data-testid="referral-email-icon" />
                  Enviar por e-mail
                </S.EmailActionHref>
              </S.ReferralActions>
              <S.ReferralNotice>
                Essa indicação pode iniciar o contato com o dentista, mas para prosseguir com a ordem atual você
                precisa selecionar uma clínica já licenciada. O processo de licenciamento pode demorar.
              </S.ReferralNotice>
            </S.ReferralContent>
          </S.ReferralCard>
        </>
      )}

      {showScheduleConfirmation && activeLocation ? (
        <S.ModalOverlay role="presentation">
          <S.ConfirmationDialog
            role="dialog"
            aria-modal="true"
            aria-labelledby="schedule-confirmation-title"
            aria-describedby="schedule-confirmation-description"
          >
            <S.SectionTitle id="schedule-confirmation-title">Confirmar consulta agendada</S.SectionTitle>
            <S.Description id="schedule-confirmation-description">
              Você já entrou em contato com o dentista para combinar a data da consulta e confirmar os valores do
              atendimento?
            </S.Description>
            <S.GuidanceCard>
              Dentista: {activeDisplayedLocation?.dentistName ?? activeLocation.dentistName}
              <br />
              Clínica: {activeDisplayedLocation?.name ?? activeLocation.name}
            </S.GuidanceCard>
            <AdminModalActions>
              <S.CancelModalAction type="button" onClick={() => setShowScheduleConfirmation(false)}>
                Cancelar
              </S.CancelModalAction>
              <AdminModalAction
                type="button"
                onClick={() => void handleScheduleConsultation()}
                disabled={schedulingConsultation}
              >
                {schedulingConsultation ? 'Confirmando...' : 'Sim, já combinei'}
              </AdminModalAction>
            </AdminModalActions>
          </S.ConfirmationDialog>
        </S.ModalOverlay>
      ) : null}
    </S.Page>
  );
}
