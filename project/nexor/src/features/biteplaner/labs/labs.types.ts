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
