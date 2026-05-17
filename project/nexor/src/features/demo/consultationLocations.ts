import type { DemoPracticeLocationSelection } from './biteplanerFlow';

export const DEMO_CONSULTATION_LOCATIONS: DemoPracticeLocationSelection[] = [
  {
    id: 'practice-demo-001',
    name: 'Clínica Esportiva Nexor',
    address: 'Rua das Palmeiras, 245 - Jardim Paulista, São Paulo - SP',
    cep: '04567-000',
    phone: '(11) 4000-1001',
    dentistName: 'Dr. Rafael Demo',
    distanceKm: 1.2,
    coordinates: {
      lat: -23.5923,
      lng: -46.6843,
    },
  },
  {
    id: 'practice-demo-003',
    name: 'Instituto Paulistano de Odontologia Esportiva',
    address: 'Alameda dos Atletas, 88 - Itaim Bibi, São Paulo - SP',
    cep: '04567-120',
    phone: '(11) 4000-1003',
    dentistName: 'Dra. Camila Moura',
    distanceKm: 2.1,
    coordinates: {
      lat: -23.5904,
      lng: -46.6762,
    },
  },
  {
    id: 'practice-demo-004',
    name: 'Centro Integrado de Performance Bucal',
    address: 'Avenida Horizonte, 510 - Vila Olimpia, São Paulo - SP',
    cep: '04567-210',
    phone: '(11) 4000-1004',
    dentistName: 'Dr. Felipe Andrade',
    distanceKm: 3.4,
    coordinates: {
      lat: -23.5967,
      lng: -46.6831,
    },
  },
];

const DEMO_CEP_COORDINATES: Record<string, { lat: number; lng: number; label: string }> = {
  '04567000': {
    lat: -23.5932,
    lng: -46.6812,
    label: 'CEP 04567-000 - Itaim Bibi, São Paulo - SP',
  },
  '01001000': {
    lat: -23.5505,
    lng: -46.6333,
    label: 'CEP 01001-000 - Sé, São Paulo - SP',
  },
};

function normalizeCep(value: string) {
  return value.replace(/\D/g, '').slice(0, 5);
}

function normalizeFullCep(value: string) {
  return value.replace(/\D/g, '').slice(0, 8);
}

export function listConsultationLocationsByCep(cep: string) {
  const normalized = normalizeCep(cep);

  if (!normalized) {
    return DEMO_CONSULTATION_LOCATIONS;
  }

  const matches = DEMO_CONSULTATION_LOCATIONS.filter((location) =>
    normalizeCep(location.cep).startsWith(normalized)
  );

  return matches.length > 0 ? matches : DEMO_CONSULTATION_LOCATIONS;
}

export function getConsultationLocation(locationId: string) {
  return DEMO_CONSULTATION_LOCATIONS.find((location) => location.id === locationId) ?? null;
}

export function getConsultationCepLocation(
  cep: string,
  nearbyLocations: DemoPracticeLocationSelection[] = DEMO_CONSULTATION_LOCATIONS
) {
  const fullCep = normalizeFullCep(cep);
  const mappedCep = DEMO_CEP_COORDINATES[fullCep];

  if (mappedCep) {
    return mappedCep;
  }

  const normalizedPrefix = normalizeCep(cep);
  const prefixMatch = DEMO_CONSULTATION_LOCATIONS.find((location) =>
    normalizeCep(location.cep).startsWith(normalizedPrefix)
  );

  if (prefixMatch) {
    return {
      lat: prefixMatch.coordinates.lat,
      lng: prefixMatch.coordinates.lng,
      label: `CEP ${cep}`,
    };
  }

  if (nearbyLocations.length === 0) {
    return null;
  }

  return {
    lat: nearbyLocations.reduce((sum, location) => sum + location.coordinates.lat, 0) / nearbyLocations.length,
    lng: nearbyLocations.reduce((sum, location) => sum + location.coordinates.lng, 0) / nearbyLocations.length,
    label: `CEP ${cep}`,
  };
}
