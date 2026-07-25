import { api } from '../../lib/api';

export type FinancialAccountRole = 'dentist' | 'partner';
export type FinancialDocumentType = 'cpf' | 'cnpj';
export type FinancialCompanyType = 'MEI' | 'LIMITED' | 'INDIVIDUAL' | 'ASSOCIATION';
export type FinancialAccountStatus =
  | 'not_started'
  | 'pending_onboarding'
  | 'creating'
  | 'awaiting_approval'
  | 'active'
  | 'creation_failed'
  | 'disabled'
  | 'deletion_requested'
  | 'archived';

export interface FinancialAccountStatusRecord {
  id: string;
  role: FinancialAccountRole;
  documentType: 'cpf' | 'cnpj';
  documentNumber: string;
  legalName: string;
  status: FinancialAccountStatus;
  asaasAccountId: string | null;
  asaasWalletId: string | null;
  providerStatus: string | null;
  commercialInfoStatus: string | null;
  bankAccountInfoStatus: string | null;
  documentationStatus: string | null;
  generalStatus: string | null;
  onboardingUrl: string | null;
  providerErrorCode: string | null;
  providerErrorMessage: string | null;
  termsVersion: string | null;
  updatedAt: string;
}

export interface FinancialOnboardingStatusResponse {
  accounts: FinancialAccountStatusRecord[];
}

export interface FinancialOnboardingSubmitPayload {
  role: FinancialAccountRole;
  email?: string | undefined;
  phoneNumber?: string | undefined;
  documentType?: FinancialDocumentType | undefined;
  documentNumber?: string | undefined;
  legalName?: string | undefined;
  birthDate?: string | undefined;
  incomeValue?: number | undefined;
  companyType?: FinancialCompanyType | undefined;
  address?: {
    postalCode: string;
    address: string;
    addressNumber: string;
    province: string;
  } | undefined;
  termsVersion: string;
}

export interface FinancialOnboardingSubmitResponse {
  account: FinancialAccountStatusRecord;
}

export interface FinancialOnboardingSyncPayload {
  role: FinancialAccountRole;
}

const basePath = '/v1/account/products/biteplaner/financial-onboarding';

export const getFinancialOnboarding = (token?: string) =>
  api.get<FinancialOnboardingStatusResponse>(basePath, token);

export const submitFinancialOnboarding = (
  payload: FinancialOnboardingSubmitPayload,
  token?: string
) => api.post<FinancialOnboardingSubmitResponse>(`${basePath}/asaas-account`, payload, token);

export const syncFinancialOnboarding = (
  payload: FinancialOnboardingSyncPayload,
  token?: string
) => api.post<FinancialOnboardingSubmitResponse>(`${basePath}/asaas-account/sync`, payload, token);
