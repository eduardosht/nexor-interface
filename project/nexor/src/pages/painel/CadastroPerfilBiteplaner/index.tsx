import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent } from 'react';
import { Building2, ChevronRight, ClipboardPlus, Info, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  AdminFormButton,
  CheckboxField,
  Field,
  RadioQuestionGroup,
  Select,
  Snackbar,
  SnackbarStack,
  TagAutocompleteField,
} from '@nexor/design-system';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import {
  FormValidations,
  type FormValidationItem,
} from '../components/FormValidations';
import * as S from './styles';

type RouteRole = 'parceiro' | 'dentista';
type ApiRole = 'partner' | 'dentist';
type PartnerType = 'coach_personal' | 'academy';
type Values = Record<string, string>;
type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
type BillingAddressValues = {
  postalCode: string;
  addressLine: string;
  addressNumber: string;
  complement: string;
  neighborhood: string;
  city: string;
  state: string;
  ibgeCityCode?: number;
  source: 'manual' | 'viacep';
};

type ClinicValues = {
  id: string;
  name: string;
  cep: string;
  address: string;
  complement: string;
  serviceHours: string;
  phone: string;
  isAdapted: '' | 'yes' | 'no';
  city: string;
  state: string;
};

type RoleConfig = {
  apiRole: ApiRole;
  title: string;
  description: string;
  successTitle: string;
  successMessage: string;
};

const ROLE_CONFIG: Record<RouteRole, RoleConfig> = {
  parceiro: {
    apiRole: 'partner',
    title: 'Cadastro de parceiro Biteplaner',
    description:
      'Envie os dados iniciais para análise da operação. Depois da aprovação, as funcionalidades de parceiros serão liberadas.',
    successTitle: 'Solicitação enviada',
    successMessage: 'Sua solicitação de parceiro foi enviada e ficará em análise pela equipe Nexor.',
  },
  dentista: {
    apiRole: 'dentist',
    title: 'Solicitar licenciamento do dentista',
    description:
      'Envie seu CRO para análise do licenciamento Biteplaner. Após a aprovação, sua Conta Nexor ficará pronta para adquirir o produto.',
    successTitle: 'Solicitação enviada',
    successMessage:
      'Sua solicitação de licenciamento foi enviada. A Nexor irá avaliar seu CRO e liberar a compra do Biteplaner após a aprovação.',
  },
};

const CONSENT_DEFAULTS = {
  operationalTerms: false,
  privacyPolicy: false,
  contact: false,
};

const BRAZILIAN_STATES = [
  'AC',
  'AL',
  'AP',
  'AM',
  'BA',
  'CE',
  'DF',
  'ES',
  'GO',
  'MA',
  'MT',
  'MS',
  'MG',
  'PA',
  'PB',
  'PR',
  'PE',
  'PI',
  'RJ',
  'RN',
  'RS',
  'RO',
  'RR',
  'SC',
  'SP',
  'SE',
  'TO',
];

const BRAZILIAN_STATE_OPTIONS = BRAZILIAN_STATES.map((state) => ({
  value: state,
  label: state,
}));

const PARTNER_TYPE_OPTIONS = [
  { value: 'coach_personal', label: 'Coach/Personal' },
  { value: 'academy', label: 'Academia' },
];

const PARTNER_SERVICE_LOCATION_OPTIONS = [
  { value: 'Academia', label: 'Academia' },
  { value: 'Box de Crossfit', label: 'Box de Crossfit' },
];


let clinicIdSequence = 0;

const createEmptyBillingAddress = (): BillingAddressValues => ({
  postalCode: '',
  addressLine: '',
  addressNumber: '',
  complement: '',
  neighborhood: '',
  city: '',
  state: '',
  source: 'manual',
});

const createEmptyClinic = (): ClinicValues => ({
  id: `clinic-${clinicIdSequence++}`,
  name: '',
  cep: '',
  address: '',
  complement: '',
  serviceHours: '',
  phone: '',
  isAdapted: '',
  city: '',
  state: '',
});

const emptyToUndefined = (value: string | undefined) => {
  const trimmed = value?.trim() ?? '';
  return trimmed.length > 0 ? trimmed : undefined;
};

const onlyDigits = (value: string | undefined) => (value ?? '').replace(/\D/g, '');

const formatCep = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

const formatCpf = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
};

const formatCnpj = (value: string) => {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const formatBrazilianPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 2) return digits.length > 0 ? `(${digits}` : '';
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCro = (value: string) => {
  const compact = value
    .toUpperCase()
    .replace(/^CRO/, '')
    .replace(/[^A-Z0-9]/g, '');
  const state = compact.replace(/[^A-Z]/g, '').slice(0, 2);
  const number = compact.replace(/\D/g, '').slice(0, 6);

  if (!state && !number) {
    return '';
  }

  return `CRO-${state}${number ? ` ${number}` : ''}`;
};

const isValidCro = (value: string) => {
  const match = value.trim().toUpperCase().match(/^CRO-([A-Z]{2})\s(\d{4,6})$/);

  return Boolean(match && BRAZILIAN_STATES.includes(match[1]));
};

function createValidationItem(key: string, label: string, message?: string): FormValidationItem {
  return {
    key,
    label,
    sectionIndex: -1,
    message,
  };
}

const isValidCpf = (value: string) => {
  const digits = onlyDigits(value);
  if (digits.length !== 11 || /^(\d)\1+$/.test(digits)) return false;

  const calculateDigit = (base: string, factor: number) => {
    const sum = base
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * (factor - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  const firstDigit = calculateDigit(digits.slice(0, 9), 10);
  const secondDigit = calculateDigit(`${digits.slice(0, 9)}${firstDigit}`, 11);
  return digits === `${digits.slice(0, 9)}${firstDigit}${secondDigit}`;
};

const isValidCnpj = (value: string) => {
  const digits = onlyDigits(value);
  if (digits.length !== 14 || /^(\d)\1+$/.test(digits)) return false;

  const calculateDigit = (base: string, weights: number[]) => {
    const sum = base
      .split('')
      .reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };

  const firstDigit = calculateDigit(digits.slice(0, 12), [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const secondDigit = calculateDigit(`${digits.slice(0, 12)}${firstDigit}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return digits === `${digits.slice(0, 12)}${firstDigit}${secondDigit}`;
};

const isValidBrazilianPhone = (value: string) => {
  const digits = onlyDigits(value);
  return [10, 11].includes(digits.length) && !/^(\d)\1+$/.test(digits);
};

function formatClinicAddress(data: {
  street?: string;
  neighborhood?: string;
  city?: string;
  state?: string;
}) {
  const street = data.street?.trim();
  const neighborhood = data.neighborhood?.trim();
  const cityState = [data.city, data.state].filter(Boolean).join(' - ');
  const streetLine = [street, neighborhood].filter(Boolean).join(' - ');

  return [streetLine, cityState].filter(Boolean).join(', ');
}

async function fetchCepCoordinates(cep: string) {
  const response = await fetch(`https://cep.awesomeapi.com.br/json/${cep}`);

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const lat = Number(String(data.lat ?? '').replace(',', '.'));
  const lng = Number(String(data.lng ?? '').replace(',', '.'));

  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

export function CadastroPerfilBiteplaner() {
  const { role } = useParams();
  const navigate = useNavigate();
  const { session, refreshBackendUser } = useAuth();
  const token = session?.access_token;
  const config = ROLE_CONFIG[role as RouteRole];
  const formRef = useRef<HTMLFormElement | null>(null);
  const [values, setValues] = useState<Values>({});
  const [clinics, setClinics] = useState<ClinicValues[]>(() => [createEmptyClinic()]);
  const [billingAddress, setBillingAddress] = useState<BillingAddressValues>(() => createEmptyBillingAddress());
  const [billingCepLookupError, setBillingCepLookupError] = useState('');
  const [billingCepLoading, setBillingCepLoading] = useState(false);
  const [consents, setConsents] = useState(CONSENT_DEFAULTS);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [cepLookupErrors, setCepLookupErrors] = useState<Record<string, string>>({});
  const partnerType = values.partnerType as PartnerType | undefined;
  const partnerServiceLocations = useMemo(
    () => (values.serviceLocations ?? '').split('|').map((item) => item.trim()).filter(Boolean),
    [values.serviceLocations]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [role]);

  async function lookupBillingCep() {
    const cep = onlyDigits(billingAddress.postalCode);
    if (cep.length !== 8) return;

    try {
      setBillingCepLoading(true);
      setBillingCepLookupError('');
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) throw new Error('CEP lookup failed');
      const data = await response.json();
      if (data.erro) throw new Error('CEP not found');

      setBillingAddress((current) => ({
        ...current,
        addressLine: data.logradouro ?? current.addressLine,
        neighborhood: data.bairro ?? current.neighborhood,
        city: data.localidade ?? current.city,
        state: data.uf ?? current.state,
        ibgeCityCode: data.ibge ? Number(data.ibge) : current.ibgeCityCode,
        source: 'viacep'
      }));
    } catch {
      setBillingCepLookupError('Não foi possível preencher o endereço automaticamente por este CEP.');
    } finally {
      setBillingCepLoading(false);
    }
  }

  function updateBillingAddress(field: keyof Omit<BillingAddressValues, 'source' | 'ibgeCityCode'>) {
    return (event: FieldChangeEvent) => {
      setBillingAddress((current) => ({
        ...current,
        [field]: event.target.value,
        ...(field === 'city' || field === 'state' ? { ibgeCityCode: undefined } : {}),
        source: 'manual'
      }));
    };
  }

  function updateBillingAddressMasked(field: 'postalCode', formatter: (value: string) => string) {
    return (event: FieldChangeEvent) => {
      setBillingAddress((current) => ({
        ...current,
        [field]: formatter(event.target.value),
        ibgeCityCode: undefined,
        source: 'manual'
      }));
    };
  }

  async function lookupClinicCep(clinicId: string) {
    if ((config?.apiRole !== 'dentist' && config?.apiRole !== 'partner') || typeof fetch !== 'function') {
      return;
    }

    const clinic = clinics.find((item) => item.id === clinicId);
    const cep = onlyDigits(clinic?.cep);
    if (cep.length !== 8) {
      return;
    }

    try {
      setCepLookupErrors((current) => ({ ...current, [clinicId]: '' }));
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) {
        throw new Error('CEP lookup failed');
      }

      const data = await response.json();
      if (data.erro) {
        throw new Error('CEP not found');
      }

      const coordinates = await fetchCepCoordinates(cep).catch(() => null);

      setClinics((current) =>
        current.map((item) => {
          if (item.id !== clinicId || onlyDigits(item.cep) !== cep) {
            return item;
          }

          return {
            ...item,
            city: data.localidade ?? item.city ?? '',
            state: data.uf ?? item.state ?? '',
            address:
              formatClinicAddress({
                street: data.logradouro,
                neighborhood: data.bairro,
                city: data.localidade,
                state: data.uf,
              }) || item.address || '',
          };
        })
      );
      setValues((current) => {
        if (!coordinates) {
          return current;
        }

        return {
          ...current,
          [`clinicLatitude:${clinicId}`]: String(coordinates.lat),
          [`clinicLongitude:${clinicId}`]: String(coordinates.lng),
        };
      });
    } catch {
      setCepLookupErrors((current) => ({
        ...current,
        [clinicId]: 'Não foi possível preencher o endereço automaticamente por este CEP.',
      }));
    }
  }

  const isValid = useMemo(() => {
    if (!config || !consents.operationalTerms || !consents.privacyPolicy) {
      return false;
    }

    if (config.apiRole === 'partner') {
      const academyLocation = clinics[0];
      const hasAcademyLocation = Boolean(
        academyLocation?.cep.trim() &&
        academyLocation.city.trim() &&
        academyLocation.state.trim() &&
        academyLocation.address.trim()
      );

      return Boolean(
        values.name?.trim() &&
        isValidCnpj(values.documentNumber ?? '') &&
        partnerType &&
        (partnerType === 'academy' ? hasAcademyLocation : partnerServiceLocations.length > 0)
      );
    }

    if (config.apiRole === 'dentist') {
      return Boolean(
        isValidCro(values.croNumber ?? '') &&
        isValidCpf(values.cpf ?? '') &&
        isValidCnpj(values.cnpj ?? '') &&
        isValidBrazilianPhone(values.phone ?? '') &&
        billingAddress.postalCode.trim() &&
        billingAddress.addressLine.trim() &&
        billingAddress.addressNumber.trim() &&
        billingAddress.neighborhood.trim() &&
        billingAddress.city.trim() &&
        billingAddress.state.trim()
      );
    }

    return false;
  }, [billingAddress, clinics, config, consents.operationalTerms, consents.privacyPolicy, partnerServiceLocations.length, partnerType, values]);

  const missingRequiredFields = getMissingRequiredFields();
  const invalidValidationFields = missingRequiredFields.length === 0 ? getInvalidValidationFields() : [];
  const blockingValidationFields =
    missingRequiredFields.length > 0 ? missingRequiredFields : invalidValidationFields;
  const blockingValidationFieldsAreInvalid =
    missingRequiredFields.length === 0 && invalidValidationFields.length > 0;

  if (!config) {
    return <Navigate to="/painel/home" replace />;
  }

  const heroIcon = config.apiRole === 'partner'
    ? <Building2 size={42} strokeWidth={1.9} />
    : <UserRoundCheck size={42} strokeWidth={1.9} />;

  function updateField(field: string) {
    return (event: FieldChangeEvent) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
    };
  }

  function updateMaskedField(field: string, formatter: (value: string) => string) {
    return (event: FieldChangeEvent) => {
      setValues((current) => ({ ...current, [field]: formatter(event.target.value) }));
    };
  }

  function updateClinicField(clinicId: string, field: keyof Omit<ClinicValues, 'id'>) {
    return (event: FieldChangeEvent) => {
      setClinics((current) =>
        current.map((clinic) =>
          clinic.id === clinicId ? { ...clinic, [field]: event.target.value } : clinic
        )
      );
    };
  }

  function updateClinicMaskedField(
    clinicId: string,
    field: keyof Omit<ClinicValues, 'id'>,
    formatter: (value: string) => string
  ) {
    return (event: FieldChangeEvent) => {
      const nextValue = formatter(event.target.value);
      setClinics((current) =>
        current.map((clinic) => (clinic.id === clinicId ? { ...clinic, [field]: nextValue } : clinic))
      );
    };
  }

  function buildPayload() {
    if (config.apiRole === 'partner') {
      const academyLocation = clinics[0];

      return {
        name: values.name.trim(),
        documentType: 'cnpj',
        documentNumber: values.documentNumber.trim(),
        partnerType,
        ...(partnerType === 'academy' && academyLocation
          ? {
            location: {
              cep: academyLocation.cep.trim(),
              address: academyLocation.address.trim(),
              city: academyLocation.city.trim(),
              state: academyLocation.state.trim(),
              ...(emptyToUndefined(academyLocation.complement)
                ? { complement: emptyToUndefined(academyLocation.complement) }
                : {}),
            },
          }
          : {
            serviceLocations: partnerServiceLocations,
          }),
      };
    }

    if (config.apiRole === 'dentist') {
      return {
        croNumber: values.croNumber.trim(),
        cpf: onlyDigits(values.cpf ?? ''),
        cnpj: onlyDigits(values.cnpj ?? ''),
        phone: onlyDigits(values.phone ?? ''),
        billingAddress: {
          postalCode: onlyDigits(billingAddress.postalCode),
          addressLine: billingAddress.addressLine.trim(),
          addressNumber: billingAddress.addressNumber.trim(),
          ...(billingAddress.complement.trim() ? { complement: billingAddress.complement.trim() } : {}),
          neighborhood: billingAddress.neighborhood.trim(),
          city: billingAddress.city.trim(),
          state: billingAddress.state,
          ...(billingAddress.ibgeCityCode ? { ibgeCityCode: billingAddress.ibgeCityCode } : {}),
          source: billingAddress.source,
        },
      };
    }

    return {};
  }

  function getMissingRequiredFields() {
    if (!config) {
      return [];
    }

    const items: FormValidationItem[] = [];
    const addIfMissing = (condition: boolean, key: string, label: string) => {
      if (condition) {
        items.push(createValidationItem(key, label));
      }
    };

    if (config.apiRole === 'partner') {
      const academyLocation = clinics[0];

      addIfMissing(!values.name?.trim(), 'name', 'Nome da empresa ou parceiro');
      addIfMissing(!values.documentNumber?.trim(), 'documentNumber', 'CNPJ');
      addIfMissing(!partnerType, 'partnerType', 'Tipo de parceiro');

      if (partnerType === 'academy') {
        addIfMissing(!academyLocation?.cep.trim(), 'academyCep', 'CEP');
        addIfMissing(!academyLocation?.city.trim(), 'academyCity', 'Cidade');
        addIfMissing(!academyLocation?.state.trim(), 'academyState', 'Estado');
        addIfMissing(!academyLocation?.address.trim(), 'academyAddress', 'Endereço');
      }

      if (partnerType === 'coach_personal') {
        addIfMissing(partnerServiceLocations.length === 0, 'serviceLocations', 'Locais de atuação');
      }
    }

    if (config.apiRole === 'dentist') {
      addIfMissing(!values.croNumber?.trim(), 'croNumber', 'CRO');
      addIfMissing(!values.cpf?.trim(), 'cpf', 'CPF');
      addIfMissing(!values.cnpj?.trim(), 'cnpj', 'CNPJ');
      addIfMissing(!values.phone?.trim(), 'phone', 'Telefone');
      addIfMissing(onlyDigits(billingAddress.postalCode).length !== 8, 'billingPostalCode', 'CEP de cobrança');
      addIfMissing(!billingAddress.addressLine.trim(), 'billingAddressLine', 'Endereço de cobrança');
      addIfMissing(!billingAddress.addressNumber.trim(), 'billingAddressNumber', 'Número do endereço');
      addIfMissing(!billingAddress.neighborhood.trim(), 'billingNeighborhood', 'Bairro');
      addIfMissing(!billingAddress.city.trim(), 'billingCity', 'Cidade');
      addIfMissing(!billingAddress.state.trim(), 'billingState', 'Estado');
    }

    addIfMissing(!consents.operationalTerms, 'operationalTerms', 'Aceite dos termos de cadastro operacional');
    addIfMissing(!consents.privacyPolicy, 'privacyPolicy', 'Aceite da política de privacidade');

    return items;
  }

  function getInvalidValidationFields() {
    if (!config) {
      return [];
    }

    const items: FormValidationItem[] = [];
    const addIfInvalid = (condition: boolean, key: string, label: string, message: string) => {
      if (condition) {
        items.push(createValidationItem(key, label, message));
      }
    };

    if (config.apiRole === 'partner') {
      addIfInvalid(
        Boolean(values.documentNumber?.trim()) && !isValidCnpj(values.documentNumber ?? ''),
        'documentNumber',
        'CNPJ',
        'Informe um CNPJ válido.'
      );
    }

    if (config.apiRole === 'dentist') {
      addIfInvalid(Boolean(values.croNumber?.trim()) && !isValidCro(values.croNumber ?? ''), 'croNumber', 'CRO', 'Informe um CRO válido no formato CRO-UF 00000.');
      addIfInvalid(Boolean(values.cpf?.trim()) && !isValidCpf(values.cpf ?? ''), 'cpf', 'CPF', 'Informe um CPF válido.');
      addIfInvalid(Boolean(values.cnpj?.trim()) && !isValidCnpj(values.cnpj ?? ''), 'cnpj', 'CNPJ', 'Informe um CNPJ válido.');
      addIfInvalid(Boolean(values.phone?.trim()) && !isValidBrazilianPhone(values.phone ?? ''), 'phone', 'Telefone', 'Informe um telefone válido com DDD.');
    }
    if (config.apiRole === 'partner') {
      clinics.forEach((clinic) => {
        const cepError = cepLookupErrors[clinic.id];
        if (cepError) {
          items.push(createValidationItem(`clinicCep:${clinic.id}`, 'CEP', cepError));
        }
      });
    }

    return items;
  }

  function handleFormValidationItemClick(item: FormValidationItem) {
    window.setTimeout(() => {
      const targets = formRef.current?.querySelectorAll<HTMLElement>('[data-form-validation-key]');
      const target = Array.from(targets ?? []).find(
        (element) => element.dataset.formValidationKey === item.key
      );

      if (!target) {
        return;
      }

      target.scrollIntoView({ behavior: 'smooth', block: 'center' });

      const focusTarget = target.matches(
        'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
        ? target
        : target.querySelector<HTMLElement>(
          'input:not([disabled]), textarea:not([disabled]), select:not([disabled]), button:not([disabled]), [tabindex]:not([tabindex="-1"])'
        );

      focusTarget?.focus({ preventScroll: true });
    }, 80);
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError('Sessão expirada. Entre novamente para enviar o cadastro.');
      return;
    }

    if (!isValid) {
      setError('Preencha os campos obrigatórios e aceite os termos para continuar.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSubmitted(false);

    try {
      const endpoint =
        config.apiRole === 'dentist'
          ? '/v1/account/products/biteplaner/dentist-license-requests'
          : `/v1/account/products/biteplaner/roles/${config.apiRole}`;
      await api.post(
        endpoint,
        buildPayload(),
        token
      );
      await refreshBackendUser();
      setSubmitted(true);
      navigate('/painel/home');
    } catch {
      setError('Não foi possível enviar a solicitação agora.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <S.Page>
      <S.ProfileShell>
        <S.ProfileHero>
          <S.HeroContent>
            <S.BackLink to="/painel/home">Voltar para produtos</S.BackLink>
            <S.HeroTitleRow>
              <S.HeroIcon aria-hidden="true">{heroIcon}</S.HeroIcon>
              <S.Title>{config.title}</S.Title>
            </S.HeroTitleRow>
            <S.Description>{config.description}</S.Description>
            <S.HeroInfoCallout>
              <Info size={22} strokeWidth={2.3} aria-hidden="true" />
              <span>
                {config.apiRole === 'dentist'
                  ? 'A Nexor avalia o CRO informado antes de liberar sua conta para adquirir o Biteplaner.'
                  : 'A solicitação passa por validação operacional da NEXOR antes da liberação de acesso e próximos passos do Biteplaner.'}
              </span>
            </S.HeroInfoCallout>
          </S.HeroContent>
          <S.HeroVisual aria-hidden="true">
            <S.HeroClipboard>
              <ClipboardPlus size={58} strokeWidth={1.8} />
              <span />
              <span />
              <span />
              <S.HeroShield>
                <ShieldCheck size={44} strokeWidth={2.2} />
              </S.HeroShield>
            </S.HeroClipboard>
          </S.HeroVisual>
        </S.ProfileHero>

        {error ? <S.Banner role="alert">{error}</S.Banner> : null}
        {submitted ? (
          <SnackbarStack>
            <Snackbar
              tone="success"
              title={config.successTitle}
              message={config.successMessage}
              onClose={() => setSubmitted(false)}
            />
          </SnackbarStack>
        ) : null}

        <S.Form ref={formRef} onSubmit={handleSubmit}>
          <S.Section>
            <S.SectionHeader>
              <S.StepBadge>1</S.StepBadge>
              <S.SectionTitle>Dados principais</S.SectionTitle>
            </S.SectionHeader>
            <S.SectionIntro>
              Campos marcados como obrigatórios precisam ser preenchidos antes do envio.
            </S.SectionIntro>
            {config.apiRole === 'dentist' ? (
              <S.SectionSubtitle>
                Informe o CRO que será avaliado pela Nexor para liberar seu licenciamento Biteplaner.
              </S.SectionSubtitle>
            ) : null}
            {config.apiRole === 'dentist' ? (
              <S.Banner>
                A Nexor irá avaliar seu licenciamento como dentista. Após a aprovação, sua Conta Nexor
                ficará licenciada e pronta para adquirir o produto Biteplaner.
              </S.Banner>
            ) : null}
            {config.apiRole === 'partner' ? (
              <S.Banner>
                A Nexor irá verificar o cadastro do parceiro após o envio da solicitação. Depois da aprovação,
                o acesso será liberado para gerar links individuais de indicação e acompanhar conversões.
              </S.Banner>
            ) : null}
            <S.FieldsGrid>
              {config.apiRole === 'partner' ? (
                <>
                  <Field
                    label="Nome da empresa ou parceiro"
                    value={values.name ?? ''}
                    required
                    data-form-validation-key="name"
                    onChange={updateField('name')}
                  />
                  <Field
                    label="CNPJ"
                    value={values.documentNumber ?? ''}
                    required
                    data-form-validation-key="documentNumber"
                    inputMode="numeric"
                    maxLength={18}
                    error={
                      values.documentNumber &&
                        !isValidCnpj(values.documentNumber)
                        ? 'Informe um CNPJ válido.'
                        : ''
                    }
                    onChange={updateMaskedField('documentNumber', formatCnpj)}
                  />
                  <S.FullField>
                    <S.ValidationTarget data-form-validation-key="partnerType">
                      <RadioQuestionGroup
                        name="partner-type"
                        label="Tipo de parceiro"
                        value={partnerType ?? ''}
                        required
                        inline
                        options={PARTNER_TYPE_OPTIONS}
                        onChange={(value) => {
                          const nextType: PartnerType = value === 'academy' ? 'academy' : 'coach_personal';
                          setValues((current) => ({ ...current, partnerType: nextType }));
                        }}
                      />
                    </S.ValidationTarget>
                  </S.FullField>
                  {partnerType === 'academy' ? (
                    <S.FullField>
                      <S.ClinicSection>
                        <S.ClinicSectionHeader>
                          <div>
                            <S.ClinicSectionTitle>Localização</S.ClinicSectionTitle>
                            <S.ClinicSectionIntro>
                              Informe o CEP da academia para preencher a localização automaticamente.
                            </S.ClinicSectionIntro>
                          </div>
                        </S.ClinicSectionHeader>
                        {clinics.slice(0, 1).map((clinic) => (
                          <S.ClinicCard key={clinic.id}>
                            <S.FieldsGrid>
                              <Field
                                label="CEP"
                                value={clinic.cep}
                                required
                                data-form-validation-key="academyCep"
                                inputMode="numeric"
                                maxLength={9}
                                error={cepLookupErrors[clinic.id]}
                                hint="Preenchemos cidade, estado e endereço automaticamente."
                                onChange={updateClinicMaskedField(clinic.id, 'cep', formatCep)}
                                onBlur={() => lookupClinicCep(clinic.id)}
                              />
                              <Field
                                label="Cidade"
                                value={clinic.city}
                                required
                                data-form-validation-key="academyCity"
                                onChange={updateClinicField(clinic.id, 'city')}
                              />
                              <S.ValidationTarget data-form-validation-key="academyState">
                                <Select
                                  label="Estado"
                                  value={clinic.state}
                                  required
                                  placeholder="Selecione um estado"
                                  onChange={(value) => {
                                    setClinics((current) =>
                                      current.map((item) =>
                                        item.id === clinic.id ? { ...item, state: value } : item
                                      )
                                    );
                                  }}
                                  options={BRAZILIAN_STATE_OPTIONS}
                                />
                              </S.ValidationTarget>
                              <S.FullField>
                                <Field
                                  label="Endereço"
                                  value={clinic.address}
                                  required
                                  data-form-validation-key="academyAddress"
                                  onChange={updateClinicField(clinic.id, 'address')}
                                />
                              </S.FullField>
                              <Field
                                label="Complemento"
                                value={clinic.complement}
                                hint="Opcional"
                                onChange={updateClinicField(clinic.id, 'complement')}
                              />
                            </S.FieldsGrid>
                          </S.ClinicCard>
                        ))}
                      </S.ClinicSection>
                    </S.FullField>
                  ) : null}
                  {partnerType === 'coach_personal' ? (
                    <S.FullField>
                      <S.ValidationTarget data-form-validation-key="serviceLocations">
                        <TagAutocompleteField
                          label="Locais de atuação"
                          value={partnerServiceLocations}
                          required
                          options={PARTNER_SERVICE_LOCATION_OPTIONS}
                          allowCustomValue
                          placeholder="Digite ou selecione um local"
                          hint="Use Enter para adicionar uma opção personalizada."
                          onChange={(nextValue) => {
                            setValues((current) => ({ ...current, serviceLocations: nextValue.join('|') }));
                          }}
                        />
                      </S.ValidationTarget>
                    </S.FullField>
                  ) : null}
                </>
              ) : null}

              {config.apiRole === 'dentist' ? (
                <>
                  <S.FullField>
                    <Field
                      label="CRO"
                      value={values.croNumber ?? ''}
                      required
                      data-form-validation-key="croNumber"
                      inputMode="text"
                      maxLength={13}
                      error={
                        values.croNumber && !isValidCro(values.croNumber)
                          ? 'Informe um CRO válido no formato CRO-UF 00000.'
                          : ''
                      }
                      hint={values.croNumber && !isValidCro(values.croNumber) ? undefined : 'Formato: CRO-SP 12345.'}
                      onChange={updateMaskedField('croNumber', formatCro)}
                    />
                  </S.FullField>
                  <S.FullField>
                    <Field
                      label="CPF"
                      value={values.cpf ?? ''}
                      required
                      data-form-validation-key="cpf"
                      inputMode="numeric"
                      maxLength={14}
                      error={values.cpf && !isValidCpf(values.cpf) ? 'Informe um CPF válido.' : ''}
                      hint="Usado para licença futura e contratos de pessoa física."
                      onChange={updateMaskedField('cpf', formatCpf)}
                    />
                  </S.FullField>
                  <S.FullField>
                    <Field
                      label="CNPJ"
                      value={values.cnpj ?? ''}
                      required
                      data-form-validation-key="cnpj"
                      inputMode="numeric"
                      maxLength={18}
                      error={values.cnpj && !isValidCnpj(values.cnpj) ? 'Informe um CNPJ válido.' : ''}
                      hint="Usado para pontos fiscais e criação da conta financeira."
                      onChange={updateMaskedField('cnpj', formatCnpj)}
                    />
                  </S.FullField>
                  <S.FullField>
                    <Field
                      label="Telefone"
                      value={values.phone ?? ''}
                      required
                      data-form-validation-key="phone"
                      inputMode="tel"
                      maxLength={15}
                      error={values.phone && !isValidBrazilianPhone(values.phone) ? 'Informe um telefone válido com DDD.' : ''}
                      hint="Usado para contato operacional e para preencher o checkout de pagamento."
                      onChange={updateMaskedField('phone', formatBrazilianPhone)}
                    />
                  </S.FullField>
                  <S.FullField>
                    <S.LgpdNotice>
                      <ShieldCheck size={18} strokeWidth={2.2} aria-hidden="true" />
                      <span>
                        <strong>Por que pedimos CPF e CNPJ?</strong> Usamos o CPF para licença futura e contratos de pessoa física,
                        e o CNPJ para pontos fiscais, obrigações operacionais e criação da conta financeira. Esses dados ficam no seu perfil Nexor
                        e são utilizados somente para essas finalidades.
                      </span>
                    </S.LgpdNotice>
                  </S.FullField>
                  <S.FullField>
                    <S.ClinicSection>
                      <S.ClinicSectionHeader>
                        <div>
                          <S.ClinicSectionTitle>Endereço para cadastro e cobrança</S.ClinicSectionTitle>
                          <S.ClinicSectionIntro>
                            Use seu endereço de cobrança. O CEP preenche os demais campos automaticamente, mas você pode corrigi-los.
                          </S.ClinicSectionIntro>
                        </div>
                      </S.ClinicSectionHeader>
                      <S.FieldsGrid>
                        <Field
                          label="CEP"
                          value={billingAddress.postalCode}
                          required
                          data-form-validation-key="billingPostalCode"
                          inputMode="numeric"
                          maxLength={9}
                          error={billingCepLookupError}
                          hint={billingCepLoading ? 'Consultando CEP...' : 'Usado para preencher o endereço automaticamente.'}
                          onChange={updateBillingAddressMasked('postalCode', formatCep)}
                          onBlur={() => void lookupBillingCep()}
                        />
                        <Field
                          label="Número"
                          value={billingAddress.addressNumber}
                          required
                          data-form-validation-key="billingAddressNumber"
                          maxLength={30}
                          hint="Aceita S/N e números com letras."
                          onChange={updateBillingAddress('addressNumber')}
                        />
                        <S.FullField>
                          <Field
                            label="Endereço"
                            value={billingAddress.addressLine}
                            required
                            data-form-validation-key="billingAddressLine"
                            onChange={updateBillingAddress('addressLine')}
                          />
                        </S.FullField>
                        <Field
                          label="Bairro"
                          value={billingAddress.neighborhood}
                          required
                          data-form-validation-key="billingNeighborhood"
                          onChange={updateBillingAddress('neighborhood')}
                        />
                        <Field
                          label="Cidade"
                          value={billingAddress.city}
                          required
                          data-form-validation-key="billingCity"
                          onChange={updateBillingAddress('city')}
                        />
                        <S.ValidationTarget data-form-validation-key="billingState">
                          <Select
                            label="Estado"
                            value={billingAddress.state}
                            required
                            placeholder="Selecione um estado"
                            onChange={(value) => setBillingAddress((current) => ({ ...current, state: value, source: 'manual' }))}
                            options={BRAZILIAN_STATE_OPTIONS}
                          />
                        </S.ValidationTarget>
                        <Field
                          label="Complemento"
                          value={billingAddress.complement}
                          hint="Opcional"
                          onChange={updateBillingAddress('complement')}
                        />
                      </S.FieldsGrid>
                    </S.ClinicSection>
                  </S.FullField>
                  <S.FullField>
                    <S.LgpdNotice>
                      <ShieldCheck size={18} strokeWidth={2.2} aria-hidden="true" />
                      <span>
                        <strong>Por que pedimos o endereço?</strong> Usamos estes dados para identificar o comprador, preencher o checkout Asaas e cumprir rotinas de pagamento, suporte e obrigações legais. Eles não representam o endereço da clínica e não são usados para marketing.
                      </span>
                    </S.LgpdNotice>
                  </S.FullField>
                </>
              ) : null}

            </S.FieldsGrid>
          </S.Section>

          <S.Section>
            <S.SectionHeader>
              <S.StepBadge>2</S.StepBadge>
              <S.SectionTitle>Termos e autorizações</S.SectionTitle>
            </S.SectionHeader>
            <S.TermsReadIntro>
              Leia antes de aceitar: consulte os{' '}
              <S.TermsReadLink to="/termos" target="_blank">
                termos de cadastro
              </S.TermsReadLink>
              {' '}e a{' '}
              <S.TermsReadLink to="/privacidade" target="_blank">
                política de privacidade
              </S.TermsReadLink>.
            </S.TermsReadIntro>
            <S.ValidationTarget data-form-validation-key="operationalTerms">
              <CheckboxField
                checked={consents.operationalTerms}
                onChange={(checked) => setConsents((current) => ({ ...current, operationalTerms: checked }))}
                label={
                  <S.TermsLabel>
                    Aceito os <strong>termos de cadastro operacional</strong> do Biteplaner.
                  </S.TermsLabel>
                }
                badge="Obrigatório"
                badgeTone="required"
              />
            </S.ValidationTarget>
            <S.ValidationTarget data-form-validation-key="privacyPolicy">
              <CheckboxField
                checked={consents.privacyPolicy}
                onChange={(checked) => setConsents((current) => ({ ...current, privacyPolicy: checked }))}
                label={
                  <S.TermsLabel>
                    Aceito a <strong>política de privacidade</strong> para análise cadastral e
                    contato operacional.
                  </S.TermsLabel>
                }
                badge="Obrigatório"
                badgeTone="required"
              />
            </S.ValidationTarget>
            <CheckboxField
              checked={consents.contact}
              onChange={(checked) => setConsents((current) => ({ ...current, contact: checked }))}
              label={
                <S.TermsLabel>
                  Autorizo <strong>contato comercial e institucional</strong> sobre próximos
                  passos do cadastro.
                </S.TermsLabel>
              }
              badge="Opcional"
              badgeTone="optional"
            />
          </S.Section>

          <S.Actions>
            <S.ActionPrivacyNote>
              <ShieldCheck size={18} strokeWidth={2.2} aria-hidden="true" />
              <span>
                Seus dados estão protegidos e serão utilizados conforme nossa <strong>Política de Privacidade</strong>.
              </span>
            </S.ActionPrivacyNote>
            <AdminFormButton type="button" variant="secondary" onClick={() => window.history.back()}>
              Cancelar
            </AdminFormButton>
            <AdminFormButton type="submit" disabled={!isValid || submitting} trailingIcon={<ChevronRight size={16} aria-hidden="true" />}>
              {submitting ? 'Enviando...' : 'Enviar solicitação'}
            </AdminFormButton>
          </S.Actions>
          <FormValidations
            items={blockingValidationFields}
            title={blockingValidationFieldsAreInvalid ? 'Campos com validação pendente' : undefined}
            description={
              blockingValidationFieldsAreInvalid
                ? 'Corrija os campos abaixo para continuar.'
                : undefined
            }
            footer={
              blockingValidationFieldsAreInvalid
                ? 'Essas validações são obrigatórias para liberar o envio.'
                : undefined
            }
            ariaLabel={
              blockingValidationFieldsAreInvalid
                ? 'Campos preenchidos incorretamente'
                : undefined
            }
            onItemClick={handleFormValidationItemClick}
          />
        </S.Form>
      </S.ProfileShell>
    </S.Page>
  );
}
