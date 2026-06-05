import {
  readStorageJson,
  removeStorageValue,
  writeStorageJson,
} from './browser-storage';

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
  writeStorageJson(STORAGE_KEY, payload, 'session');
}

export function loadPendingRegistration(): PendingRegistration | null {
  return readStorageJson<PendingRegistration>(STORAGE_KEY, 'session');
}

export function clearPendingRegistration() {
  removeStorageValue(STORAGE_KEY, 'session');
}
