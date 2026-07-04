import { afterEach, describe, expect, it } from 'vitest';
import {
  clearPendingRegistration,
  loadLegacyPendingRegistrationForMigration,
  loadPendingRegistration,
  savePendingRegistration,
} from './pending-registration';

const storageKey = 'nexor_pending_registration';

const safePayload = {
  email: 'joao@example.com',
  fullName: 'Joao Silva',
  role: 'customer' as const,
  consents: [
    { type: 'terms' as const, accepted: true },
    { type: 'privacy' as const, accepted: true },
    { type: 'marketing' as const, accepted: false },
  ],
};

describe('pending registration storage', () => {
  afterEach(() => {
    sessionStorage.clear();
  });

  it('does not persist document fields when saving pending registration', () => {
    const unsafePayload = {
      ...safePayload,
      documentType: 'cpf',
      documentNumber: '52998224725',
    };

    savePendingRegistration(unsafePayload);

    const raw = sessionStorage.getItem(storageKey);
    expect(raw).toBeTruthy();
    expect(raw).not.toContain('documentNumber');
    expect(raw).not.toContain('documentType');
    expect(loadPendingRegistration()).toEqual(safePayload);
  });

  it('round-trips safe pending registration data', () => {
    savePendingRegistration({
      ...safePayload,
      role: 'partner',
      companyName: 'Nexor Partner',
    });

    expect(loadPendingRegistration()).toEqual({
      ...safePayload,
      role: 'partner',
      companyName: 'Nexor Partner',
    });
  });

  it('hides legacy document data from the safe loader and exposes it only for migration', () => {
    const legacyPayload = {
      ...safePayload,
      documentType: 'cpf',
      documentNumber: '52998224725',
    };

    sessionStorage.setItem(storageKey, JSON.stringify(legacyPayload));

    expect(loadPendingRegistration()).toEqual(safePayload);
    expect(loadLegacyPendingRegistrationForMigration()).toEqual(legacyPayload);
  });

  it('clears invalid pending registration objects', () => {
    sessionStorage.setItem(storageKey, JSON.stringify({ email: 'joao@example.com' }));

    expect(loadPendingRegistration()).toBeNull();
    expect(sessionStorage.getItem(storageKey)).toBeNull();
  });

  it('clears pending registration storage explicitly', () => {
    savePendingRegistration(safePayload);

    clearPendingRegistration();

    expect(sessionStorage.getItem(storageKey)).toBeNull();
  });
});