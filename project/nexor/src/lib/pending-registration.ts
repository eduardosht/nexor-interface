import {
  readStorageJson,
  removeStorageValue,
  writeStorageJson,
} from './browser-storage';

export type PendingRegistrationConsent = {
  type: 'terms' | 'privacy' | 'marketing';
  accepted: boolean;
};

export type PendingRegistration = {
  email: string;
  fullName: string;
  role: 'customer' | 'partner' | 'dentist' | 'lab';
  companyName?: string;
  consents: PendingRegistrationConsent[];
};

export type LegacyPendingRegistration = PendingRegistration & {
  documentType: 'cpf' | 'cnpj';
  documentNumber: string;
};

const STORAGE_KEY = 'nexor_pending_registration';
const ROLES = new Set(['customer', 'partner', 'dentist', 'lab']);
const CONSENT_TYPES = new Set(['terms', 'privacy', 'marketing']);

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function isConsent(value: unknown): value is PendingRegistrationConsent {
  return (
    isRecord(value) &&
    typeof value.type === 'string' &&
    CONSENT_TYPES.has(value.type) &&
    typeof value.accepted === 'boolean'
  );
}

function sanitizePendingRegistration(value: unknown): PendingRegistration | null {
  if (!isRecord(value)) {
    return null;
  }

  if (
    typeof value.email !== 'string' ||
    typeof value.fullName !== 'string' ||
    typeof value.role !== 'string' ||
    !ROLES.has(value.role) ||
    !Array.isArray(value.consents) ||
    !value.consents.every(isConsent)
  ) {
    return null;
  }

  const payload: PendingRegistration = {
    email: value.email,
    fullName: value.fullName,
    role: value.role as PendingRegistration['role'],
    consents: value.consents,
  };

  if (typeof value.companyName === 'string' && value.companyName.trim()) {
    payload.companyName = value.companyName;
  }

  return payload;
}

function sanitizeLegacyPendingRegistration(value: unknown): LegacyPendingRegistration | null {
  const safePayload = sanitizePendingRegistration(value);

  if (!safePayload || !isRecord(value)) {
    return null;
  }

  if (
    (value.documentType !== 'cpf' && value.documentType !== 'cnpj') ||
    typeof value.documentNumber !== 'string' ||
    !value.documentNumber.trim()
  ) {
    return null;
  }

  return {
    ...safePayload,
    documentType: value.documentType,
    documentNumber: value.documentNumber,
  };
}

export function savePendingRegistration(payload: PendingRegistration) {
  const safePayload = sanitizePendingRegistration(payload);

  if (!safePayload) {
    clearPendingRegistration();
    return;
  }

  writeStorageJson(STORAGE_KEY, safePayload, 'session');
}

export function loadPendingRegistration(): PendingRegistration | null {
  const payload = readStorageJson<unknown>(STORAGE_KEY, 'session');
  const safePayload = sanitizePendingRegistration(payload);

  if (!safePayload && payload !== null) {
    clearPendingRegistration();
  }

  return safePayload;
}

export function loadLegacyPendingRegistrationForMigration(): LegacyPendingRegistration | null {
  const payload = readStorageJson<unknown>(STORAGE_KEY, 'session');

  if (payload === null) {
    return null;
  }

  const safePayload = sanitizePendingRegistration(payload);

  if (!safePayload || !isRecord(payload)) {
    clearPendingRegistration();
    return null;
  }

  const hasDocumentFields = 'documentType' in payload || 'documentNumber' in payload;

  if (!hasDocumentFields) {
    return null;
  }

  const legacyPayload = sanitizeLegacyPendingRegistration(payload);

  if (!legacyPayload) {
    clearPendingRegistration();
  }

  return legacyPayload;
}

export function clearPendingRegistration() {
  removeStorageValue(STORAGE_KEY, 'session');
}