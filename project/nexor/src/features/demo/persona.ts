import {
  readStorageValue,
  removeStorageValue,
  writeStorageValue,
} from '../../lib/browser-storage';

export const ACTIVE_DEMO_PERSONA_STORAGE_KEY = 'nexor_demo_persona';

export type DemoPersona =
  | 'athleteRegistered'
  | 'athlete'
  | 'athletePrerequisite'
  | 'athleteScheduling'
  | 'athletePreConsultation'
  | 'athleteClinicalDecision'
  | 'athleteDentistForms'
  | 'athletePayment'
  | 'athleteTreatmentRequired'
  | 'athleteLabProduction'
  | 'athleteAdaptation'
  | 'athleteFollowUp'
  | 'athleteIneligible'
  | 'athleteCancelled'
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
  athleteRegistered: 'Cliente - Apenas cadastrado',
  athlete: 'Atleta',
  athletePrerequisite: 'Cliente - Pre-requisito',
  athleteScheduling: 'Cliente - Selecionar clinica',
  athletePreConsultation: 'Cliente - Pre-consulta clinica',
  athleteClinicalDecision: 'Cliente - Decisao clinica',
  athleteDentistForms: 'Cliente - Formularios do dentista',
  athletePayment: 'Cliente - Pagamento',
  athleteTreatmentRequired: 'Cliente - Tratamento previo',
  athleteLabProduction: 'Cliente - Laboratorio',
  athleteAdaptation: 'Cliente - Adaptacao',
  athleteFollowUp: 'Cliente - Acompanhamento',
  athleteIneligible: 'Cliente - Encerrado inapto',
  athleteCancelled: 'Cliente - Cancelado',
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
    value === 'athleteRegistered' ||
    value === 'athletePrerequisite' ||
    value === 'athleteScheduling' ||
    value === 'athletePreConsultation' ||
    value === 'athleteClinicalDecision' ||
    value === 'athleteDentistForms' ||
    value === 'athletePayment' ||
    value === 'athleteTreatmentRequired' ||
    value === 'athleteLabProduction' ||
    value === 'athleteAdaptation' ||
    value === 'athleteFollowUp' ||
    value === 'athleteIneligible' ||
    value === 'athleteCancelled' ||
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
  const value = readStorageValue(ACTIVE_DEMO_PERSONA_STORAGE_KEY);
  return isDemoPersona(value) ? value : null;
}

export function writeActiveDemoPersona(persona: DemoPersona) {
  writeStorageValue(ACTIVE_DEMO_PERSONA_STORAGE_KEY, persona);
}

export function clearActiveDemoPersona() {
  removeStorageValue(ACTIVE_DEMO_PERSONA_STORAGE_KEY);
}
