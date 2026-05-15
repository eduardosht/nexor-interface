export type PendingRegistration = {
  email: string;
  fullName: string;
  role: 'customer' | 'partner' | 'dentist' | 'lab';
  documentType: 'cpf' | 'cnpj';
  documentNumber: string;
  companyName?: string;
  consents: Array<{ type: 'terms' | 'privacy' | 'marketing'; accepted: boolean }>;
};

const STORAGE_KEY = 'nexor_pending_registration';

export function savePendingRegistration(payload: PendingRegistration) {
  sessionStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function loadPendingRegistration(): PendingRegistration | null {
  const raw = sessionStorage.getItem(STORAGE_KEY);
  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as PendingRegistration;
  } catch {
    sessionStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function clearPendingRegistration() {
  sessionStorage.removeItem(STORAGE_KEY);
}
