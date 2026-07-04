import { api } from '../../lib/api';

export type FinancialRecipientRole = 'dentist' | 'lab';
export type FinancialRecipientStatus =
  | 'not_started'
  | 'pending_data'
  | 'creating'
  | 'active'
  | 'creation_failed'
  | 'disabled'
  | 'deletion_requested'
  | 'archived';

export interface FinancialRecipientStatusRecord {
  id: string;
  role: FinancialRecipientRole;
  documentType: 'cpf' | 'cnpj';
  documentNumber: string;
  legalName: string;
  status: FinancialRecipientStatus;
  providerStatus: string | null;
  providerErrorCode: string | null;
  providerErrorMessage: string | null;
  termsVersion: string | null;
  updatedAt: string;
}

export interface FinancialOnboardingStatusResponse {
  recipients: FinancialRecipientStatusRecord[];
}

export interface FinancialOnboardingSubmitPayload {
  role: FinancialRecipientRole;
  documentType: 'cpf' | 'cnpj';
  documentNumber: string;
  legalName: string;
  email?: string | undefined;
  phoneNumber?: string | undefined;
  recipientProfile: {
    siteUrl: string;
    motherName: string;
    birthdate: string;
    monthlyIncome: number;
    professionalOccupation: string;
    address: {
      street: string;
      complementary: string;
      streetNumber: string;
      neighborhood: string;
      city: string;
      state: string;
      zipCode: string;
      referencePoint: string;
    };
  };
  bankAccount: {
    bankCode: string;
    branchNumber: string;
    branchDigit?: string | undefined;
    accountNumber: string;
    accountDigit: string;
    accountType: 'checking' | 'savings';
    holderName: string;
    holderDocument: string;
    holderType: 'individual' | 'company';
  };
  transferSettings: {
    transferEnabled: boolean;
    transferInterval: 'daily' | 'weekly' | 'monthly';
    transferDay?: number | undefined;
  };
  termsVersion: string;
}

export interface FinancialOnboardingSubmitResponse {
  recipient: FinancialRecipientStatusRecord;
}

const basePath = '/v1/account/products/biteplaner/financial-onboarding';

export const getFinancialOnboarding = (token?: string) =>
  api.get<FinancialOnboardingStatusResponse>(basePath, token);

export const submitFinancialOnboarding = (
  payload: FinancialOnboardingSubmitPayload,
  token?: string
) => api.post<FinancialOnboardingSubmitResponse>(`${basePath}/pagarme-recipient`, payload, token);

export const retryFinancialOnboarding = (
  payload: FinancialOnboardingSubmitPayload,
  token?: string
) => api.post<FinancialOnboardingSubmitResponse>(`${basePath}/pagarme-recipient/retry`, payload, token);
