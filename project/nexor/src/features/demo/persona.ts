export const ACTIVE_DEMO_PERSONA_STORAGE_KEY = 'nexor_demo_persona';

export type DemoPersona =
  | 'athlete'
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

export const DEMO_PERSONA_LABELS: Record<DemoPersona, string> = {
  athlete: 'Atleta',
  partner: 'Parceiro',
  dentist: 'Dentista',
  dentistApproved: 'Dentista não licenciado - aprovado',
  dentistProgress: 'Dentista não licenciado - progresso',
  dentistLicensed: 'Dentista licenciado',
  lab: 'Laboratório',
  labApproved: 'Laboratório não licenciado - aprovado',
  labProgress: 'Laboratório não licenciado - progresso',
  labLicensed: 'Laboratório licenciado',
  admin: 'Admin',
};

export function isMockModeEnabled() {
  return import.meta.env.VITE_MOCK === 'true';
}

export function isDemoPersona(value: string | null | undefined): value is DemoPersona {
  return (
    value === 'athlete' ||
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

export function readActiveDemoPersona() {
  if (typeof window === 'undefined') {
    return null;
  }

  const value = window.localStorage.getItem(ACTIVE_DEMO_PERSONA_STORAGE_KEY);
  return isDemoPersona(value) ? value : null;
}

export function writeActiveDemoPersona(persona: DemoPersona) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(ACTIVE_DEMO_PERSONA_STORAGE_KEY, persona);
}

export function clearActiveDemoPersona() {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.removeItem(ACTIVE_DEMO_PERSONA_STORAGE_KEY);
}
