import type { DemoLicensedLabSelection } from './biteplanerFlow';

export const DEMO_LAB_LOCATIONS: DemoLicensedLabSelection[] = [
  {
    id: 'lab-demo-001',
    name: 'Lab Demo Sul',
    address: 'Av. Paulista, 1200 - Bela Vista, São Paulo - SP',
    cep: '01310-100',
    phone: '(11) 4000-1000',
    distanceKm: 1.8,
    coordinates: {
      lat: -23.5618,
      lng: -46.6565,
    },
  },
  {
    id: 'lab-demo-002',
    name: 'Lab Demo Centro',
    address: 'Rua Augusta, 450 - Consolacao, São Paulo - SP',
    cep: '01305-000',
    phone: '(11) 4000-2000',
    distanceKm: 2.6,
    coordinates: {
      lat: -23.5505,
      lng: -46.6333,
    },
  },
  {
    id: 'lab-demo-003',
    name: 'Lab Demo Performance',
    address: 'Av. Brigadeiro Faria Lima, 2100 - Itaim Bibi, São Paulo - SP',
    cep: '01452-000',
    phone: '(11) 4000-3000',
    distanceKm: 4.1,
    coordinates: {
      lat: -23.5857,
      lng: -46.6777,
    },
  },
  {
    id: 'lab-demo-004',
    name: 'Lab Demo Zona Oeste',
    address: 'Rua Funchal, 375 - Vila Olimpia, São Paulo - SP',
    cep: '04551-060',
    phone: '(11) 4000-4000',
    distanceKm: 4.8,
    coordinates: {
      lat: -23.5954,
      lng: -46.6892,
    },
  },
  {
    id: 'lab-demo-005',
    name: 'Lab Demo Paulista Norte',
    address: 'Rua Haddock Lobo, 980 - Cerqueira Cesar, São Paulo - SP',
    cep: '01414-002',
    phone: '(11) 4000-5000',
    distanceKm: 2.9,
    coordinates: {
      lat: -23.5627,
      lng: -46.6648,
    },
  },
  {
    id: 'lab-demo-006',
    name: 'Lab Demo Clínico',
    address: 'Av. Reboucas, 1450 - Pinheiros, São Paulo - SP',
    cep: '05402-100',
    phone: '(11) 4000-6000',
    distanceKm: 5.4,
    coordinates: {
      lat: -23.5679,
      lng: -46.6826,
    },
  },
  {
    id: 'lab-demo-007',
    name: 'Lab Demo Centro Expandido',
    address: 'Rua da Consolacao, 2100 - Consolacao, São Paulo - SP',
    cep: '01302-001',
    phone: '(11) 4000-7000',
    distanceKm: 3.1,
    coordinates: {
      lat: -23.5526,
      lng: -46.6601,
    },
  },
  {
    id: 'lab-demo-008',
    name: 'Lab Demo Premium',
    address: 'Av. Cidade Jardim, 350 - Itaim Bibi, São Paulo - SP',
    cep: '01453-000',
    phone: '(11) 4000-8000',
    distanceKm: 3.7,
    coordinates: {
      lat: -23.5842,
      lng: -46.6753,
    },
  },
];

function normalizeCep(value: string) {
  return value.replace(/\D/g, '').slice(0, 5);
}

export function listLicensedLabsByCep(cep: string) {
  const normalized = normalizeCep(cep);

  if (!normalized) {
    return DEMO_LAB_LOCATIONS;
  }

  const matches = DEMO_LAB_LOCATIONS.filter((location) => normalizeCep(location.cep).startsWith(normalized));
  return matches.length > 0 ? matches : DEMO_LAB_LOCATIONS;
}

export function getLicensedLab(labId: string) {
  return DEMO_LAB_LOCATIONS.find((lab) => lab.id === labId) ?? null;
}
