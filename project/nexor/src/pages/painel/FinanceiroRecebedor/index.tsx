import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { useSearchParams } from 'react-router-dom';
import { CheckCircle2, RotateCcw, Send } from 'lucide-react';
import { ApiError } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import { brazilianBanks } from '../../../data/brazilianBanks';
import {
  getFinancialOnboarding,
  retryFinancialOnboarding,
  submitFinancialOnboarding,
  type FinancialOnboardingSubmitPayload,
  type FinancialRecipientStatusRecord
} from '../../../features/financialOnboarding/pagarmeRecipient.api';
import * as S from './styles';

type FormState = {
  role: 'dentist' | 'lab';
  documentType: 'cpf' | 'cnpj';
  documentNumber: string;
  legalName: string;
  email: string;
  phoneNumber: string;
  siteUrl: string;
  motherName: string;
  birthdate: string;
  monthlyIncome: string;
  professionalOccupation: string;
  addressStreet: string;
  addressComplementary: string;
  addressStreetNumber: string;
  addressNeighborhood: string;
  addressCity: string;
  addressState: string;
  addressZipCode: string;
  addressReferencePoint: string;
  bankCode: string;
  branchNumber: string;
  branchDigit: string;
  accountNumber: string;
  accountDigit: string;
  accountType: 'checking' | 'savings';
  holderName: string;
  holderDocument: string;
  holderType: 'individual' | 'company';
  transferInterval: 'daily' | 'weekly' | 'monthly';
  transferDay: string;
  termsAccepted: boolean;
};

type CepAddressResponse = {
  cep?: string;
  address?: string;
  district?: string;
  city?: string;
  state?: string;
};

const initialForm: FormState = {
  role: 'dentist',
  documentType: 'cpf',
  documentNumber: '',
  legalName: '',
  email: '',
  phoneNumber: '',
  siteUrl: 'https://nexoradvance.com.br',
  motherName: '',
  birthdate: '',
  monthlyIncome: '',
  professionalOccupation: '',
  addressStreet: '',
  addressComplementary: '',
  addressStreetNumber: '',
  addressNeighborhood: '',
  addressCity: '',
  addressState: '',
  addressZipCode: '',
  addressReferencePoint: '',
  bankCode: '',
  branchNumber: '',
  branchDigit: '',
  accountNumber: '',
  accountDigit: '',
  accountType: 'checking',
  holderName: '',
  holderDocument: '',
  holderType: 'individual',
  transferInterval: 'daily',
  transferDay: '0',
  termsAccepted: false
};

const financialTermsVersion = 'financial-v1';
const brlFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL'
});

function getTodayDateInputValue() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function onlyDigits(value: string, maxLength?: number) {
  const digits = value.replace(/\D/g, '');
  return typeof maxLength === 'number' ? digits.slice(0, maxLength) : digits;
}

function onlyAlphaNumeric(value: string, maxLength: number) {
  return value.replace(/[^a-z0-9]/gi, '').slice(0, maxLength).toUpperCase();
}

function formatBrazilianPhone(value: string) {
  const digits = onlyDigits(value, 11);

  if (digits.length <= 2) {
    return digits;
  }

  const areaCode = digits.slice(0, 2);

  if (digits.length <= 10) {
    const firstPart = digits.slice(2, 6);
    const secondPart = digits.slice(6, 10);
    return secondPart ? `(${areaCode}) ${firstPart}-${secondPart}` : `(${areaCode}) ${firstPart}`;
  }

  const firstPart = digits.slice(2, 7);
  const secondPart = digits.slice(7, 11);
  return secondPart ? `(${areaCode}) ${firstPart}-${secondPart}` : `(${areaCode}) ${firstPart}`;
}

function parseMoneyToCents(value: string) {
  const cents = Number(onlyDigits(value));

  return Number.isFinite(cents) ? cents : 0;
}

function formatBrazilianCurrency(value: string) {
  const cents = parseMoneyToCents(value);
  return cents > 0 ? brlFormatter.format(cents / 100).replace(/\u00a0/g, ' ') : '';
}

function isPastDate(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  return value < getTodayDateInputValue();
}

function formatCep(value: string) {
  const digits = onlyDigits(value, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
}

function formatCpf(value: string) {
  const digits = onlyDigits(value, 11);

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

function formatCnpj(value: string) {
  const digits = onlyDigits(value, 14);

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
}

function formatDocument(value: string) {
  return onlyDigits(value).length > 11 ? formatCnpj(value) : formatCpf(value);
}

function statusLabel(status: FinancialRecipientStatusRecord['status']) {
  const labels: Record<FinancialRecipientStatusRecord['status'], string> = {
    not_started: 'Não iniciado',
    pending_data: 'Dados pendentes',
    creating: 'Criando recebedor',
    active: 'Recebedor ativo',
    creation_failed: 'Correção necessária',
    disabled: 'Desativado',
    deletion_requested: 'Remoção solicitada',
    archived: 'Arquivado'
  };

  return labels[status];
}

function buildPayload(form: FormState): FinancialOnboardingSubmitPayload {
  const transferDay = form.transferInterval === 'daily' ? 0 : Number(form.transferDay);
  const phoneNumber = onlyDigits(form.phoneNumber);

  return {
    role: form.role,
    documentType: form.documentType,
    documentNumber: onlyDigits(form.documentNumber),
    legalName: form.legalName,
    email: form.email || undefined,
    phoneNumber: phoneNumber || undefined,
    recipientProfile: {
      siteUrl: form.siteUrl,
      motherName: form.motherName,
      birthdate: form.birthdate,
      monthlyIncome: parseMoneyToCents(form.monthlyIncome),
      professionalOccupation: form.professionalOccupation,
      address: {
        street: form.addressStreet,
        complementary: form.addressComplementary,
        streetNumber: form.addressStreetNumber,
        neighborhood: form.addressNeighborhood,
        city: form.addressCity,
        state: form.addressState,
        zipCode: onlyDigits(form.addressZipCode, 8),
        referencePoint: form.addressReferencePoint
      }
    },
    bankAccount: {
      bankCode: form.bankCode,
      branchNumber: form.branchNumber,
      branchDigit: form.branchDigit || undefined,
      accountNumber: form.accountNumber,
      accountDigit: form.accountDigit,
      accountType: form.accountType,
      holderName: form.holderName,
      holderDocument: onlyDigits(form.holderDocument),
      holderType: form.holderType
    },
    transferSettings: {
      transferEnabled: true,
      transferInterval: form.transferInterval,
      transferDay: Number.isFinite(transferDay) ? transferDay : undefined
    },
    termsVersion: financialTermsVersion
  };
}

function clearBankFields(form: FormState): FormState {
  return {
    ...form,
    bankCode: '',
    branchNumber: '',
    branchDigit: '',
    accountNumber: '',
    accountDigit: '',
    holderName: '',
    holderDocument: '',
    termsAccepted: false
  };
}

function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) {
    return error.message;
  }

  return 'Não foi possível enviar os dados financeiros agora.';
}

function getProfilePhone(user: { phone?: string | null } | null | undefined) {
  return typeof user?.phone === 'string' ? formatBrazilianPhone(user.phone) : '';
}

function normalizeTransferDay(interval: FormState['transferInterval'], transferDay: string) {
  return interval === 'daily' ? '0' : transferDay;
}

async function fetchCepAddress(cep: string): Promise<CepAddressResponse | null> {
  const digits = onlyDigits(cep, 8);

  if (digits.length !== 8 || typeof fetch !== 'function') {
    return null;
  }

  const response = await fetch(`https://cep.awesomeapi.com.br/json/${digits}`);

  if (!response.ok) {
    return null;
  }

  return response.json() as Promise<CepAddressResponse>;
}

function formatFieldValue<Key extends Exclude<keyof FormState, 'termsAccepted'>>(
  field: Key,
  value: string
): FormState[Key] {
  const formattedValue = (() => {
    switch (field) {
      case 'phoneNumber':
        return formatBrazilianPhone(value);
      case 'monthlyIncome':
        return formatBrazilianCurrency(value);
      case 'addressZipCode':
        return formatCep(value);
      case 'addressState':
        return value.replace(/[^a-z]/gi, '').slice(0, 2).toUpperCase();
      case 'branchNumber':
        return onlyDigits(value, 4);
      case 'branchDigit':
        return onlyAlphaNumeric(value, 1);
      case 'accountNumber':
        return onlyDigits(value, 13);
      case 'accountDigit':
        return onlyAlphaNumeric(value, 2);
      case 'holderDocument':
        return formatDocument(value);
      default:
        return value;
    }
  })();

  return formattedValue as FormState[Key];
}

export function FinanceiroRecebedor() {
  const { session, backendUser } = useAuth();
  const [searchParams] = useSearchParams();
  const requestedRole = searchParams.get('role') === 'lab' ? 'lab' : 'dentist';
  const token = session?.access_token;
  const [form, setForm] = useState<FormState>(() => ({
    ...initialForm,
    role: requestedRole,
    email: backendUser?.email ?? session?.user.email ?? '',
    phoneNumber: getProfilePhone(backendUser)
  }));
  const [recipients, setRecipients] = useState<FinancialRecipientStatusRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [cepLookupError, setCepLookupError] = useState('');

  const selectedRecipient = useMemo(
    () => recipients.find((recipient) => recipient.role === form.role) ?? null,
    [form.role, recipients]
  );
  const maxBirthdate = getTodayDateInputValue();
  const hasFailedRecipient = selectedRecipient?.status === 'creation_failed';
  const isSubmitDisabled =
    submitting ||
    !form.documentNumber ||
    !form.legalName ||
    !form.siteUrl ||
    !form.motherName ||
    !isPastDate(form.birthdate) ||
    parseMoneyToCents(form.monthlyIncome) <= 0 ||
    !form.professionalOccupation ||
    !form.addressStreet ||
    !form.addressComplementary ||
    !form.addressStreetNumber ||
    !form.addressNeighborhood ||
    !form.addressCity ||
    !form.addressState ||
    onlyDigits(form.addressZipCode, 8).length !== 8 ||
    !form.addressReferencePoint ||
    !form.bankCode ||
    !form.branchNumber ||
    !form.accountNumber ||
    !form.accountDigit ||
    !form.holderName ||
    !form.holderDocument ||
    !form.termsAccepted;

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
          setRecipients(response.recipients);
          const recipient = response.recipients.find((item) => item.role === requestedRole);

          if (recipient) {
            setForm((current) => ({
              ...current,
              documentType: recipient.documentType,
              documentNumber: recipient.documentNumber,
              legalName: current.legalName || recipient.legalName,
              phoneNumber: current.phoneNumber || getProfilePhone(backendUser)
            }));
          }
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
  }, [backendUser, requestedRole, token]);

  function updateField<Key extends keyof FormState>(field: Key, value: FormState[Key]) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function handleTextChange<Key extends Exclude<keyof FormState, 'termsAccepted'>>(field: Key) {
    return (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      const value = formatFieldValue(field, event.target.value);

      if (field === 'transferInterval') {
        setForm((current) => ({
          ...current,
          transferInterval: value as FormState['transferInterval'],
          transferDay: normalizeTransferDay(value as FormState['transferInterval'], current.transferDay)
        }));
        return;
      }

      if (field === 'transferDay') {
        updateField(field, normalizeTransferDay(form.transferInterval, value) as FormState[Key]);
        return;
      }

      updateField(field, value);
    };
  }

  async function handleCepBlur() {
    const zipCode = onlyDigits(form.addressZipCode, 8);

    if (zipCode.length !== 8) {
      return;
    }

    setCepLookupError('');

    try {
      const address = await fetchCepAddress(zipCode);

      if (!address) {
        setCepLookupError('Não foi possível buscar o CEP informado.');
        return;
      }

      setForm((current) => ({
        ...current,
        addressZipCode: formatCep(address.cep ?? zipCode),
        addressStreet: address.address ?? current.addressStreet,
        addressNeighborhood: address.district ?? current.addressNeighborhood,
        addressCity: address.city ?? current.addressCity,
        addressState: address.state ? formatFieldValue('addressState', address.state) : current.addressState
      }));
    } catch {
      setCepLookupError('Não foi possível buscar o CEP informado.');
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || isSubmitDisabled) {
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const payload = buildPayload(form);
      const response = hasFailedRecipient
        ? await retryFinancialOnboarding(payload, token)
        : await submitFinancialOnboarding(payload, token);

      setRecipients((current) => [
        response.recipient,
        ...current.filter((recipient) => recipient.role !== response.recipient.role)
      ]);
      setForm((current) => clearBankFields(current));
      setMessage('Recebedor criado no Pagar.me.');
    } catch (requestError) {
      setError(getErrorMessage(requestError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <S.Page>
      <S.Header>
        <S.Eyebrow>Biteplaner financeiro</S.Eyebrow>
        <S.Title>Onboarding financeiro</S.Title>
        <S.Description>
          Complete o cadastro de recebedor para habilitar split Pagar.me do perfil aprovado.
        </S.Description>
      </S.Header>

      {loading ? (
        <S.Notice>
          <S.NoticeTitle>Carregando status financeiro</S.NoticeTitle>
        </S.Notice>
      ) : null}

      {selectedRecipient ? (
        <S.Notice $tone={selectedRecipient.status === 'active' ? 'success' : hasFailedRecipient ? 'error' : 'warning'}>
          <S.NoticeTitle>{statusLabel(selectedRecipient.status)}</S.NoticeTitle>
          {selectedRecipient.providerErrorMessage ? (
            <S.NoticeText>{selectedRecipient.providerErrorMessage}</S.NoticeText>
          ) : null}
        </S.Notice>
      ) : null}

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

      <S.Form onSubmit={handleSubmit}>
        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>Dados do recebedor</S.SectionTitle>
            <S.SectionDescription>Documento, titularidade e contato usados no cadastro Pagar.me.</S.SectionDescription>
          </S.SectionHeader>
          <S.Grid>
            <S.Field>
              Perfil financeiro
              <S.Select value={form.role} onChange={handleTextChange('role')}>
                <option value="dentist">Dentista</option>
                <option value="lab">Laboratório</option>
              </S.Select>
            </S.Field>
            <S.Field $span="two">
              Nome legal
              <S.Input value={form.legalName} onChange={handleTextChange('legalName')} />
            </S.Field>
            <S.Field>
              E-mail financeiro
              <S.Input type="email" value={form.email} onChange={handleTextChange('email')} />
            </S.Field>
            <S.Field>
              Telefone financeiro
              <S.Input
                value={form.phoneNumber}
                inputMode="tel"
                autoComplete="tel"
                onChange={handleTextChange('phoneNumber')}
              />
            </S.Field>
          </S.Grid>
        </S.Section>

        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>Dados cadastrais Pagar.me</S.SectionTitle>
            <S.SectionDescription>Informações exigidas pelo contrato atual de recebedores pessoa física.</S.SectionDescription>
          </S.SectionHeader>
          <S.Grid>
            <S.Field $span="two">
              Site do recebedor
              <S.Input type="url" value={form.siteUrl} onChange={handleTextChange('siteUrl')} />
            </S.Field>
            <S.Field>
              Nome da mãe
              <S.Input value={form.motherName} onChange={handleTextChange('motherName')} />
            </S.Field>
            <S.Field>
              Data de nascimento
              <S.Input type="date" max={maxBirthdate} value={form.birthdate} onChange={handleTextChange('birthdate')} />
            </S.Field>
            <S.Field>
              Renda mensal
              <S.Input inputMode="decimal" value={form.monthlyIncome} onChange={handleTextChange('monthlyIncome')} />
            </S.Field>
            <S.Field>
              Ocupação profissional
              <S.Input value={form.professionalOccupation} onChange={handleTextChange('professionalOccupation')} />
            </S.Field>
            <S.Field>
              CEP
              <S.Input
                inputMode="numeric"
                value={form.addressZipCode}
                onChange={handleTextChange('addressZipCode')}
                onBlur={handleCepBlur}
              />
            </S.Field>
            <S.Field $span="two">
              Logradouro
              <S.Input value={form.addressStreet} onChange={handleTextChange('addressStreet')} />
            </S.Field>
            <S.Field>
              Número
              <S.Input value={form.addressStreetNumber} onChange={handleTextChange('addressStreetNumber')} />
            </S.Field>
            <S.Field>
              Complemento
              <S.Input value={form.addressComplementary} onChange={handleTextChange('addressComplementary')} />
            </S.Field>
            <S.Field>
              Bairro
              <S.Input value={form.addressNeighborhood} onChange={handleTextChange('addressNeighborhood')} />
            </S.Field>
            <S.Field>
              Cidade
              <S.Input value={form.addressCity} onChange={handleTextChange('addressCity')} />
            </S.Field>
            <S.Field>
              UF
              <S.Input value={form.addressState} maxLength={2} onChange={handleTextChange('addressState')} />
            </S.Field>
            <S.Field $span="two">
              Ponto de referência
              <S.Input value={form.addressReferencePoint} onChange={handleTextChange('addressReferencePoint')} />
            </S.Field>
          </S.Grid>
        </S.Section>

        <S.Section>
          <S.SectionHeader>
            <S.SectionTitle>Dados bancários</S.SectionTitle>
            <S.SectionDescription>Envio transiente para criação do recebedor.</S.SectionDescription>
          </S.SectionHeader>
          <S.Grid>
            <S.Field>
              Código do banco
              <S.Select value={form.bankCode} onChange={handleTextChange('bankCode')}>
                <option value="">Selecione o banco</option>
                {brazilianBanks.map((bank) => (
                  <option key={bank.code} value={bank.code}>
                    {bank.code} - {bank.name}
                  </option>
                ))}
              </S.Select>
            </S.Field>
            <S.Field>
              Agência
              <S.Input
                value={form.branchNumber}
                inputMode="numeric"
                maxLength={4}
                onChange={handleTextChange('branchNumber')}
              />
            </S.Field>
            <S.Field>
              Dígito da agência
              <S.Input
                value={form.branchDigit}
                maxLength={1}
                onChange={handleTextChange('branchDigit')}
              />
            </S.Field>
            <S.Field>
              Conta
              <S.Input
                value={form.accountNumber}
                inputMode="numeric"
                maxLength={13}
                onChange={handleTextChange('accountNumber')}
              />
            </S.Field>
            <S.Field>
              Dígito da conta
              <S.Input
                value={form.accountDigit}
                maxLength={2}
                onChange={handleTextChange('accountDigit')}
              />
            </S.Field>
            <S.Field>
              Tipo de conta
              <S.Select value={form.accountType} onChange={handleTextChange('accountType')}>
                <option value="checking">Conta corrente</option>
                <option value="savings">Conta poupança</option>
              </S.Select>
            </S.Field>
            <S.Field $span="two">
              Titular da conta
              <S.Input value={form.holderName} onChange={handleTextChange('holderName')} />
            </S.Field>
            <S.Field>
              Documento do titular
              <S.Input
                value={form.holderDocument}
                inputMode="numeric"
                onChange={handleTextChange('holderDocument')}
              />
            </S.Field>
            <S.Field>
              Tipo de titular
              <S.Select value={form.holderType} onChange={handleTextChange('holderType')}>
                <option value="individual">Pessoa física</option>
                <option value="company">Pessoa jurídica</option>
              </S.Select>
            </S.Field>
            <S.Field>
              Periodicidade de repasse
              <S.Select value={form.transferInterval} onChange={handleTextChange('transferInterval')}>
                <option value="daily">Diária</option>
                <option value="weekly">Semanal</option>
                <option value="monthly">Mensal</option>
              </S.Select>
            </S.Field>
            <S.Field>
              Dia do repasse
              <S.Input
                type="number"
                min="0"
                max="31"
                value={form.transferInterval === 'daily' ? '0' : form.transferDay}
                disabled={form.transferInterval === 'daily'}
                onChange={handleTextChange('transferDay')}
              />
            </S.Field>
          </S.Grid>
        </S.Section>

        <S.CheckboxLabel>
          <S.Checkbox
            type="checkbox"
            checked={form.termsAccepted}
            onChange={(event) => updateField('termsAccepted', event.target.checked)}
          />
          Aceito os termos financeiros do Biteplaner para criação do recebedor Pagar.me.
        </S.CheckboxLabel>

        <S.Actions>
          <S.BackLink to="/painel/biteplaner">Voltar ao Biteplaner</S.BackLink>
          <S.SubmitButton type="submit" disabled={isSubmitDisabled}>
            {hasFailedRecipient ? <RotateCcw size={16} aria-hidden /> : submitting ? <CheckCircle2 size={16} aria-hidden /> : <Send size={16} aria-hidden />}
            {submitting
              ? 'Enviando...'
              : hasFailedRecipient
                ? 'Reenviar para o Pagar.me'
                : 'Enviar para o Pagar.me'}
          </S.SubmitButton>
        </S.Actions>
      </S.Form>
    </S.Page>
  );
}
