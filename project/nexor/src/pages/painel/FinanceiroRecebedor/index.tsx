import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ArrowLeft, CheckCircle2, ExternalLink, RefreshCw, Send } from 'lucide-react';
import { AdminFormButton, CheckboxField, Field } from '@nexor/design-system';
import { ApiError } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import {
  getFinancialOnboarding,
  submitFinancialOnboarding,
  syncFinancialOnboarding,
  type FinancialAccountRole,
  type FinancialAccountStatusRecord,
  type FinancialDocumentType,
  type FinancialCompanyType
} from '../../../features/financialOnboarding/asaasFinancialAccount.api';
import * as S from './styles';

const financialTermsVersion = 'financial-v1';

type CepAddressResponse = {
  address?: string;
  district?: string;
};

type AsaasRegistrationForm = {
  phoneNumber: string;
  documentType: FinancialDocumentType;
  documentNumber: string;
  legalName: string;
  birthDate: string;
  incomeValue: string;
  companyType: FinancialCompanyType | '';
  postalCode: string;
  address: string;
  addressNumber: string;
  province: string;
};

const onlyDigits = (value: string): string => value.replace(/\D/g, '');


const formatDocumentNumber = (documentType: FinancialDocumentType, value: string): string => {
  const digits = onlyDigits(value).slice(0, documentType === 'cpf' ? 11 : 14);

  if (documentType === 'cpf') {
    if (digits.length <= 3) {
      return digits;
    }

    if (digits.length <= 6) {
      return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    }

    if (digits.length <= 9) {
      return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    }

    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  }

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 5) {
    return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  }

  if (digits.length <= 8) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  }

  if (digits.length <= 12) {
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const isDocumentComplete = (documentType: FinancialDocumentType, value: string): boolean =>
  onlyDigits(value).length === (documentType === 'cpf' ? 11 : 14);
const formatPostalCode = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

const normalizePhone = (value: string): string => onlyDigits(value).slice(0, 11);

const formatMobilePhone = (value: string): string => {
  const digits = normalizePhone(value);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 7) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatBrlCurrency = (value: string): string => {
  const digits = onlyDigits(value).slice(0, 12);

  if (digits === '') {
    return '';
  }

  const cents = Number(digits) / 100;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(cents).replace(/\u00A0/g, ' ');
};

const parsePositiveNumber = (value: string): number | undefined => {
  const compact = value.trim().replace(/[R$\s]/g, '');
  const normalized = compact.includes(',')
    ? compact.replace(/\./g, '').replace(',', '.')
    : compact;
  const parsed = Number(normalized);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : undefined;
};

async function fetchCepAddress(postalCode: string): Promise<CepAddressResponse | null> {
  const digits = onlyDigits(postalCode);

  if (digits.length !== 8 || typeof fetch !== 'function') {
    return null;
  }

  const response = await fetch(`https://cep.awesomeapi.com.br/json/${digits}`);

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<CepAddressResponse>;
}

function statusLabel(status: FinancialAccountStatusRecord['status']) {
  const labels: Record<FinancialAccountStatusRecord['status'], string> = {
    not_started: 'Não iniciado',
    pending_onboarding: 'Cadastro financeiro pendente',
    creating: 'Criando conta Asaas',
    awaiting_approval: 'Aguardando aprovação Asaas',
    active: 'Conta Asaas ativa',
    creation_failed: 'Correção necessária',
    disabled: 'Desativado',
    deletion_requested: 'Remoção solicitada',
    archived: 'Arquivado'
  };

  return labels[status];
}

function statusDescription(account: FinancialAccountStatusRecord | null) {
  if (account === null) {
    return 'Ainda não encontramos uma pendência financeira para este perfil. Ela é criada quando o admin aprova seu cadastro operacional.';
  }

  if (account.status === 'active') {
    return 'Seu cadastro financeiro está aprovado. Este perfil já pode participar do split do Biteplaner.';
  }

  if (account.status === 'awaiting_approval') {
    return 'O Asaas está validando os dados enviados. Você pode sincronizar o status para verificar se a aprovação já foi concluída.';
  }

  if (account.status === 'creation_failed') {
    return account.providerErrorMessage ?? 'Não foi possível criar ou atualizar sua conta Asaas. Revise o cadastro operacional e tente novamente.';
  }

  return 'Continue o cadastro no ambiente do Asaas. Dados bancários, documentos complementares e validações são preenchidos fora da Nexor.';
}

const errorFieldLabels: Record<string, string> = {
  phoneNumber: 'Celular',
  incomeValue: 'Renda mensal aproximada',
  companyType: 'Tipo de empresa',
  birthDate: 'Data de nascimento',
  email: 'E-mail',
  documentNumber: 'Documento',
  legalName: 'Nome legal',
  'address.postalCode': 'CEP',
  'address.address': 'Logradouro',
  'address.addressNumber': 'Número',
  'address.province': 'Bairro'
};

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    const field = typeof (error.details as { field?: unknown } | undefined)?.field === 'string'
      ? (error.details as { field: string }).field
      : null;
    const fieldLabel = field ? errorFieldLabels[field] : undefined;

    return fieldLabel ? `${fieldLabel}: ${error.message}` : error.message;
  }

  return 'Não foi possível atualizar o cadastro financeiro agora.';
}

function getRequestedRole(searchParams: URLSearchParams): FinancialAccountRole {
  const role = searchParams.get('role');

  if (role === 'partner') {
    return role;
  }

  return 'dentist';
}

export function FinanceiroRecebedor() {
  const { session, backendUser } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedRole = getRequestedRole(searchParams);
  const token = session?.access_token;
  const [accounts, setAccounts] = useState<FinancialAccountStatusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [acceptedFinancialTerms, setAcceptedFinancialTerms] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cepLookupError, setCepLookupError] = useState('');
  const email = backendUser?.email ?? session?.user.email ?? undefined;
  const [registrationForm, setRegistrationForm] = useState<AsaasRegistrationForm>(() => ({
    phoneNumber: formatMobilePhone(backendUser?.phone ?? ''),
    documentType: 'cpf',
    documentNumber: '',
    legalName: '',
    birthDate: '',
    incomeValue: '',
    companyType: '',
    postalCode: '',
    address: '',
    addressNumber: '',
    province: ''
  }));

  const selectedAccount = useMemo(
    () => accounts.find((account) => account.role === requestedRole) ?? null,
    [accounts, requestedRole]
  );

  const roleLabel =
    requestedRole === 'dentist' ? 'dentista' : 'parceiro';
  const isCpfAccount = registrationForm.documentType === 'cpf';
  const isCnpjAccount = registrationForm.documentType === 'cnpj';
  const incomeValue = parsePositiveNumber(registrationForm.incomeValue);
  const requiredAsaasDataReady =
    registrationForm.legalName.trim() !== '' &&
    isDocumentComplete(registrationForm.documentType, registrationForm.documentNumber) &&
    normalizePhone(registrationForm.phoneNumber).length >= 10 &&
    (!isCpfAccount || registrationForm.birthDate !== '') &&
    incomeValue !== undefined &&
    (!isCnpjAccount || registrationForm.companyType !== '') &&
    onlyDigits(registrationForm.postalCode).length === 8 &&
    registrationForm.address.trim() !== '' &&
    registrationForm.addressNumber.trim() !== '' &&
    registrationForm.province.trim() !== '';

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    let active = true;

    async function loadStatus() {
      setLoading(true);
      setError('');

      try {
        const response = await getFinancialOnboarding(token);

        if (active) {
          setAccounts(response.accounts);
        }
      } catch (requestError) {
        if (active) {
          setError(getErrorMessage(requestError));
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadStatus();

    return () => {
      active = false;
    };
  }, [token]);


  useEffect(() => {
    if (selectedAccount === null) {
      return;
    }

    setRegistrationForm((current) => ({
      ...current,
      documentType: selectedAccount.documentType,
      documentNumber: current.documentNumber || formatDocumentNumber(selectedAccount.documentType, selectedAccount.documentNumber),
      legalName: current.legalName || selectedAccount.legalName
    }));
  }, [selectedAccount]);
  function upsertAccount(account: FinancialAccountStatusRecord) {
    setAccounts((current) => [
      account,
      ...current.filter((item) => item.role !== account.role)
    ]);
  }

  function updateRegistrationField(field: keyof AsaasRegistrationForm, value: string) {
    setRegistrationForm((current) => ({ ...current, [field]: value }));
  }

  async function handleCepBlur() {
    const postalCode = onlyDigits(registrationForm.postalCode);

    if (postalCode.length !== 8) {
      return;
    }

    setCepLookupError('');

    try {
      const address = await fetchCepAddress(postalCode);

      if (address === null) {
        setCepLookupError('Não foi possível buscar o CEP informado.');
        return;
      }

      setRegistrationForm((current) => ({
        ...current,
        postalCode: formatPostalCode(postalCode),
        address: address.address ?? current.address,
        province: address.district ?? current.province
      }));
    } catch {
      setCepLookupError('Não foi possível buscar o CEP informado.');
    }
  }

  async function handleStart(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !acceptedFinancialTerms || selectedAccount === null || selectedAccount.status === 'active') {
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const response = await submitFinancialOnboarding({
        role: requestedRole,
        email,
        phoneNumber: normalizePhone(registrationForm.phoneNumber),
        documentType: registrationForm.documentType,
        documentNumber: onlyDigits(registrationForm.documentNumber),
        legalName: registrationForm.legalName.trim(),
        birthDate: isCpfAccount ? registrationForm.birthDate : undefined,
        incomeValue,
        companyType: isCnpjAccount ? registrationForm.companyType || undefined : undefined,
        address: {
          postalCode: registrationForm.postalCode,
          address: registrationForm.address.trim(),
          addressNumber: registrationForm.addressNumber.trim(),
          province: registrationForm.province.trim()
        },
        termsVersion: financialTermsVersion
      }, token);

      upsertAccount(response.account);
      setMessage('Conta Asaas criada. Continue o cadastro no ambiente seguro do Asaas.');

    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSync() {
    if (!token || selectedAccount === null) {
      return;
    }

    setSyncing(true);
    setError('');
    setMessage('');

    try {
      const response = await syncFinancialOnboarding({ role: selectedAccount.role }, token);

      upsertAccount(response.account);
      setMessage(response.account.status === 'active'
        ? 'Cadastro financeiro aprovado.'
        : 'Status financeiro atualizado.');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSyncing(false);
    }
  }

  return (
    <S.Page>
      <S.Header>
        <S.Eyebrow>Biteplaner financeiro</S.Eyebrow>
        <S.Title>Parte 2 do cadastro</S.Title>
        <S.Description>
          Complete o cadastro financeiro do perfil de {roleLabel} no Asaas para participar do split de pagamentos do Biteplaner.
        </S.Description>
      </S.Header>

      {loading ? (
        <S.Notice>
          <S.NoticeTitle>Carregando status financeiro</S.NoticeTitle>
        </S.Notice>
      ) : null}

      <S.Notice $tone={selectedAccount?.status === 'active' ? 'success' : selectedAccount?.status === 'creation_failed' ? 'error' : 'warning'}>
        <S.NoticeTitle>{selectedAccount ? statusLabel(selectedAccount.status) : 'Cadastro financeiro indisponível'}</S.NoticeTitle>
        <S.NoticeText>{statusDescription(selectedAccount)}</S.NoticeText>
      </S.Notice>

      {message ? (
        <S.Notice $tone="success" role="status">
          <S.NoticeTitle>{message}</S.NoticeTitle>
        </S.Notice>
      ) : null}

      {error ? (
        <S.Notice $tone="error" role="alert">
          <S.NoticeTitle>{error}</S.NoticeTitle>
        </S.Notice>
      ) : null}

      {cepLookupError ? (
        <S.Notice $tone="error" role="alert">
          <S.NoticeTitle>{cepLookupError}</S.NoticeTitle>
        </S.Notice>
      ) : null}

      <S.Form onSubmit={handleStart}>
        <S.Section>
          <S.SectionHeader>
            <S.SectionHeaderText>
              <S.SectionTitle>Conta Asaas</S.SectionTitle>
              <S.SectionDescription>
                A Nexor não salva dados bancários. O Asaas coleta e valida informações financeiras, documentos complementares e dados de repasse.
              </S.SectionDescription>
            </S.SectionHeaderText>
            <S.AsaasLogoLink
              href="https://www.asaas.com/"
              target="_blank"
              rel="noreferrer"
              aria-label="Conhecer o site oficial do Asaas"
            >
              <img src="/assets/asaas-logo.png" alt="" aria-hidden />
              <ExternalLink size={14} aria-hidden />
            </S.AsaasLogoLink>
          </S.SectionHeader>

          <S.AccountSummary aria-label="Resumo da conta financeira">
            <S.AccountSummaryItem>
              <span>Nome legal</span>
              <strong>{selectedAccount?.legalName ?? '-'}</strong>
            </S.AccountSummaryItem>
            <S.AccountSummaryItem>
              <span>Documento</span>
              <strong>{selectedAccount?.documentNumber ?? '-'}</strong>
            </S.AccountSummaryItem>
          </S.AccountSummary>

          <S.Grid>
            <S.GridItem $span="two">
              <Field
                label="Nome legal"
                value={registrationForm.legalName}
                onChange={(event) => updateRegistrationField('legalName', event.target.value)}
              />
            </S.GridItem>
            <S.GridItem>
              <S.Field>
                Tipo de documento
                <S.Select
                  value={registrationForm.documentType}
                  onChange={(event) => {
                    const documentType = event.target.value as FinancialDocumentType;
                    setRegistrationForm((current) => ({
                      ...current,
                      documentType,
                      documentNumber: formatDocumentNumber(documentType, current.documentNumber),
                      companyType: documentType === 'cnpj' ? current.companyType : ''
                    }));
                  }}
                >
                  <option value="cpf">CPF</option>
                  <option value="cnpj">CNPJ</option>
                </S.Select>
              </S.Field>
            </S.GridItem>
            <S.GridItem>
              <Field
                label="Documento"
                value={registrationForm.documentNumber}
                inputMode="numeric"
                onChange={(event) => updateRegistrationField(
                  'documentNumber',
                  formatDocumentNumber(registrationForm.documentType, event.target.value)
                )}
              />
            </S.GridItem>            <S.GridItem>
              <Field
                label="Celular"
                value={registrationForm.phoneNumber}
                inputMode="tel"
                autoComplete="tel"
                onChange={(event) => updateRegistrationField('phoneNumber', formatMobilePhone(event.target.value))}
              />
            </S.GridItem>
            {isCpfAccount ? (
              <S.GridItem>
                <Field
                  label="Data de nascimento"
                  type="date"
                  value={registrationForm.birthDate}
                  onChange={(event) => updateRegistrationField('birthDate', event.target.value)}
                />
              </S.GridItem>
            ) : null}
            <S.GridItem>
              <Field
                label="Renda mensal aproximada"
                hint="Informe um valor em reais. O Asaas exige um número, não uma faixa."
                value={registrationForm.incomeValue}
                inputMode="decimal"
                placeholder="R$ 1.200,00"
                onChange={(event) => updateRegistrationField('incomeValue', formatBrlCurrency(event.target.value))}
              />
            </S.GridItem>
            {isCnpjAccount ? (
              <S.GridItem>
                <S.Field>
                  Tipo de empresa
                  <S.Select
                    value={registrationForm.companyType}
                    onChange={(event) => updateRegistrationField('companyType', event.target.value as FinancialCompanyType | '')}
                  >
                    <option value="">Selecione</option>
                    <option value="MEI">MEI</option>
                    <option value="LIMITED">Limitada</option>
                    <option value="INDIVIDUAL">Individual</option>
                    <option value="ASSOCIATION">Associação</option>
                  </S.Select>
                </S.Field>
              </S.GridItem>
            ) : null}
            <S.GridItem>
              <Field
                label="CEP"
                value={registrationForm.postalCode}
                inputMode="numeric"
                onBlur={handleCepBlur}
                onChange={(event) => updateRegistrationField('postalCode', formatPostalCode(event.target.value))}
              />
            </S.GridItem>
            <S.GridItem $span="two">
              <Field
                label="Logradouro"
                value={registrationForm.address}
                onChange={(event) => updateRegistrationField('address', event.target.value)}
              />
            </S.GridItem>
            <S.GridItem>
              <Field
                label="Número"
                value={registrationForm.addressNumber}
                onChange={(event) => updateRegistrationField('addressNumber', event.target.value)}
              />
            </S.GridItem>
            <S.GridItem>
              <Field
                label="Bairro"
                value={registrationForm.province}
                onChange={(event) => updateRegistrationField('province', event.target.value)}
              />
            </S.GridItem>
          </S.Grid>
        </S.Section>

        <CheckboxField
          checked={acceptedFinancialTerms}
          onChange={setAcceptedFinancialTerms}
          label="Autorizo a criação da conta Asaas"
          description="Entendo que os dados bancários serão preenchidos no Asaas e não serão armazenados na plataforma Nexor."
          badge="Obrigatório"
          badgeTone="required"
        />

        <S.Actions>
          <S.BackLink to="/painel/biteplaner">
            <ArrowLeft size={16} aria-hidden />
            Voltar ao Biteplaner
          </S.BackLink>
          <AdminFormButton
            type="button"
            variant="secondary"
            onClick={handleSync}
            disabled={syncing || selectedAccount === null}
            leadingIcon={syncing ? <CheckCircle2 size={16} aria-hidden /> : <RefreshCw size={16} aria-hidden />}
          >
            {syncing ? 'Sincronizando...' : 'Sincronizar status'}
          </AdminFormButton>
          {selectedAccount?.onboardingUrl ? (
            <S.BackLink to={selectedAccount.onboardingUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={16} aria-hidden />
              Continuar cadastro
            </S.BackLink>
          ) : (
            <AdminFormButton
              type="submit"
              disabled={
                submitting ||
                !acceptedFinancialTerms ||
                !requiredAsaasDataReady ||
                selectedAccount === null ||
                selectedAccount.status === 'active'
              }
              leadingIcon={submitting ? <CheckCircle2 size={16} aria-hidden /> : <Send size={16} aria-hidden />}
            >
              {submitting ? 'Criando...' : 'Criar conta Asaas'}
            </AdminFormButton>
          )}
        </S.Actions>
      </S.Form>
    </S.Page>
  );
}
