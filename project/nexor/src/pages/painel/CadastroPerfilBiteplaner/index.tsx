import { useEffect, useMemo, useState, type ChangeEvent, type FormEvent } from 'react';
import { Building2, ChevronRight, ClipboardPlus, Info, ShieldCheck, UserRoundCheck } from 'lucide-react';
import { Navigate, useNavigate, useParams } from 'react-router-dom';
import {
  Button,
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
import * as S from './styles';

type RouteRole = 'parceiro' | 'dentista' | 'laboratório';
type ApiRole = 'partner' | 'dentist' | 'lab';
type PartnerDocumentType = 'cpf' | 'cnpj';
type PartnerType = 'coach_personal' | 'academy';
type Values = Record<string, string>;
type FieldChangeEvent = ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>;
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
    title: 'Solicitar cadastro de dentista',
    description:
      'Informe os dados profissionais iniciais. A liberação operacional depende da validação do cadastro, licença e local de atendimento.',
    successTitle: 'Solicitação enviada',
    successMessage:
      'Seu cadastro de dentista foi enviado. A Nexor irá verificar o cadastro para prosseguir com os próximos passos.',
  },
  laboratório: {
    apiRole: 'lab',
    title: 'Solicitar cadastro de laboratório',
    description:
      'Informe os dados iniciais do laboratório e da cobertura de produção. A operação valida a solicitação antes de liberar acesso.',
    successTitle: 'Solicitação enviada',
    successMessage: 'Seu cadastro de laboratório foi enviado e ficará em análise pela equipe Nexor.',
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

const PARTNER_DOCUMENT_OPTIONS = [
  { value: 'cnpj', label: 'CNPJ' },
  { value: 'cpf', label: 'CPF' },
];

const PARTNER_TYPE_OPTIONS = [
  { value: 'coach_personal', label: 'Coach/Personal' },
  { value: 'academy', label: 'Academia' },
];

const PARTNER_SERVICE_LOCATION_OPTIONS = [
  { value: 'Academia', label: 'Academia' },
  { value: 'Box de Crossfit', label: 'Box de Crossfit' },
];

const PROFESSIONAL_SUMMARY_MIN_LENGTH = 10;

let clinicIdSequence = 0;

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

const parseCoordinate = (value: string | undefined) => Number((value ?? '').replace(',', '.'));

const onlyDigits = (value: string | undefined) => (value ?? '').replace(/\D/g, '');

const formatCep = (value: string) => {
  const digits = onlyDigits(value).slice(0, 8);
  return digits.length > 5 ? `${digits.slice(0, 5)}-${digits.slice(5)}` : digits;
};

const formatPhone = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);

  if (digits.length <= 2) {
    return digits;
  }

  if (digits.length <= 6) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  }

  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }

  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
};

const formatCnpj = (value: string) => {
  const digits = onlyDigits(value).slice(0, 14);
  if (digits.length <= 2) return digits;
  if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
  if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
  if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
};

const formatCpf = (value: string) => {
  const digits = onlyDigits(value).slice(0, 11);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
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

const isValidProfessionalSummary = (value: string | undefined) =>
  (value ?? '').trim().length >= PROFESSIONAL_SUMMARY_MIN_LENGTH;

const hasShortProfessionalSummary = (value: string | undefined) => {
  const trimmedLength = (value ?? '').trim().length;

  return trimmedLength > 0 && trimmedLength < PROFESSIONAL_SUMMARY_MIN_LENGTH;
};

const getProfessionalSummaryError = (value: string | undefined, label: 'profissional' | 'operacional') => {
  const fieldLabel = label === 'operacional' ? 'resumo operacional' : 'resumo profissional';

  if (hasShortProfessionalSummary(value)) {
    return `O ${fieldLabel} deve ter pelo menos ${PROFESSIONAL_SUMMARY_MIN_LENGTH} caracteres.`;
  }

  return undefined;
};

const getProfessionalSummaryHint = (value: string | undefined) => {
  if (hasShortProfessionalSummary(value)) {
    return undefined;
  }

  return `Mínimo de ${PROFESSIONAL_SUMMARY_MIN_LENGTH} caracteres.`;
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

const isValidPartnerDocument = (type: PartnerDocumentType, value: string) =>
  type === 'cpf' ? isValidCpf(value) : isValidCnpj(value);

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
  const { session } = useAuth();
  const token = session?.access_token;
  const config = ROLE_CONFIG[role as RouteRole];
  const [values, setValues] = useState<Values>({});
  const [clinics, setClinics] = useState<ClinicValues[]>(() => [createEmptyClinic()]);
  const [consents, setConsents] = useState(CONSENT_DEFAULTS);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState('');
  const [cepLookupErrors, setCepLookupErrors] = useState<Record<string, string>>({});
  const partnerDocumentType: PartnerDocumentType = values.documentType === 'cpf' ? 'cpf' : 'cnpj';
  const partnerType = values.partnerType as PartnerType | undefined;
  const partnerServiceLocations = useMemo(
    () => (values.serviceLocations ?? '').split('|').map((item) => item.trim()).filter(Boolean),
    [values.serviceLocations]
  );

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
  }, [role]);

  async function lookupClinicCep(clinicId: string) {
    if ((config?.apiRole !== 'dentist' && config?.apiRole !== 'lab' && config?.apiRole !== 'partner') || typeof fetch !== 'function') {
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
        isValidPartnerDocument(partnerDocumentType, values.documentNumber ?? '') &&
        partnerType &&
        (partnerType === 'academy' ? hasAcademyLocation : partnerServiceLocations.length > 0)
      );
    }

    if (config.apiRole === 'dentist') {
      const hasValidClinics = clinics.every(
        (clinic) =>
          clinic.name.trim() &&
          clinic.city.trim() &&
          clinic.state.trim() &&
          clinic.address.trim() &&
          clinic.cep.trim() &&
          clinic.serviceHours.trim() &&
          clinic.phone.trim() &&
          (clinic.isAdapted === 'yes' || clinic.isAdapted === 'no')
      );

      return Boolean(
        values.fullName?.trim() &&
        isValidCro(values.croNumber ?? '') &&
        isValidProfessionalSummary(values.professionalSummary) &&
        clinics.length > 0 &&
        hasValidClinics
      );
    }

    if (config.apiRole === 'lab') {
      const hasValidLocations = clinics.every(
        (clinic) =>
          clinic.name.trim() &&
          clinic.city.trim() &&
          clinic.state.trim() &&
          clinic.address.trim() &&
          clinic.cep.trim() &&
          clinic.serviceHours.trim() &&
          clinic.phone.trim()
      );

      return Boolean(
        values.labName?.trim() &&
        isValidCnpj(values.cnpj ?? '') &&
        isValidProfessionalSummary(values.professionalSummary) &&
        clinics.length > 0 &&
        hasValidLocations
      );
    }

    return false;
  }, [clinics, config, consents.operationalTerms, consents.privacyPolicy, partnerDocumentType, partnerServiceLocations.length, partnerType, values]);

  if (!config) {
    return <Navigate to="/painel/home" replace />;
  }

  const heroIcon = config.apiRole === 'partner'
    ? <UserRoundCheck size={42} strokeWidth={1.9} />
    : <Building2 size={42} strokeWidth={1.9} />;

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
        documentType: partnerDocumentType,
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
      const practiceLocations = clinics.map((clinic) => {
        const latitude = emptyToUndefined(values[`clinicLatitude:${clinic.id}`]);
        const longitude = emptyToUndefined(values[`clinicLongitude:${clinic.id}`]);
        const coordinates =
          latitude && longitude
            ? {
              lat: parseCoordinate(latitude),
              lng: parseCoordinate(longitude),
            }
            : undefined;

        return {
          name: clinic.name.trim(),
          address: clinic.address.trim(),
          cep: clinic.cep.trim(),
          ...(emptyToUndefined(clinic.complement)
            ? { complement: emptyToUndefined(clinic.complement) }
            : {}),
          ...(emptyToUndefined(clinic.phone) ? { phone: emptyToUndefined(clinic.phone) } : {}),
          dentistName: values.fullName.trim(),
          isAdapted: clinic.isAdapted === 'yes',
          serviceHours: clinic.serviceHours.trim(),
          city: clinic.city.trim(),
          state: clinic.state.trim(),
          ...(coordinates ? { coordinates } : {}),
        };
      });
      const primaryLocation = practiceLocations[0];

      return {
        fullName: values.fullName.trim(),
        croNumber: values.croNumber.trim(),
        professionalSummary: values.professionalSummary.trim(),
        city: primaryLocation.city,
        state: primaryLocation.state,
        practiceLocation: primaryLocation,
        practiceLocations,
      };
    }

    const locations = clinics.map((clinic) => {
      const latitude = emptyToUndefined(values[`clinicLatitude:${clinic.id}`]);
      const longitude = emptyToUndefined(values[`clinicLongitude:${clinic.id}`]);
      const coordinates =
        latitude && longitude
          ? {
            lat: parseCoordinate(latitude),
            lng: parseCoordinate(longitude),
          }
          : undefined;

      return {
        name: clinic.name.trim(),
        address: clinic.address.trim(),
        cep: clinic.cep.trim(),
        ...(emptyToUndefined(clinic.complement)
          ? { complement: emptyToUndefined(clinic.complement) }
          : {}),
        phone: clinic.phone.trim(),
        serviceHours: clinic.serviceHours.trim(),
        city: clinic.city.trim(),
        state: clinic.state.trim(),
        ...(coordinates ? { coordinates } : {}),
      };
    });

    return {
      labName: values.labName.trim(),
      cnpj: values.cnpj.trim(),
      professionalSummary: values.professionalSummary.trim(),
      location: locations[0],
      locations,
    };
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token) {
      setError('Sessão expirada. Entre novamente para enviar o cadastro.');
      return;
    }

    if (
      (config.apiRole === 'dentist' || config.apiRole === 'lab') &&
      values.professionalSummary?.trim() &&
      !isValidProfessionalSummary(values.professionalSummary)
    ) {
      setError(
        config.apiRole === 'lab'
          ? 'O resumo operacional deve ter pelo menos 10 caracteres.'
          : 'O resumo profissional deve ter pelo menos 10 caracteres.'
      );
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
      await api.post(
        `/v1/account/products/biteplaner/roles/${config.apiRole}`,
        buildPayload(),
        token
      );
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
                A solicitação passa por validação operacional da NEXOR antes da liberação de acesso,
                contratos, licenciamento e próximos passos do Biteplaner.
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

        <S.Form onSubmit={handleSubmit}>
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
                Preencha os dados profissionais e cadastre a clínica de atendimento para análise operacional.
              </S.SectionSubtitle>
            ) : null}
            {config.apiRole === 'dentist' ? (
              <S.Banner>
                A Nexor irá verificar o cadastro do dentista após o envio da solicitação para prosseguir
                com pagamento, contratos, curso e licenciamento.
              </S.Banner>
            ) : null}
            {config.apiRole === 'lab' ? (
              <S.SectionSubtitle>
                Preencha os dados do laboratório e cadastre o local operacional para análise da Nexor.
              </S.SectionSubtitle>
            ) : null}
            {config.apiRole === 'lab' ? (
              <S.Banner>
                A Nexor ira verificar o cadastro do laboratório após o envio da solicitação para prosseguir
                com pagamento, contratos, curso e licenciamento.
              </S.Banner>
            ) : null}
            {config.apiRole === 'partner' ? (
              <S.Banner>
                A Nexor ira verificar o cadastro do parceiro apos o envio da solicitacao. Depois da aprovacao,
                o acesso sera liberado para gerar links individuais de indicacao e acompanhar conversoes.
              </S.Banner>
            ) : null}
            <S.FieldsGrid>
              {config.apiRole === 'partner' ? (
                <>
                  <Field
                    label="Nome da empresa ou parceiro"
                    value={values.name ?? ''}
                    required
                    onChange={updateField('name')}
                  />
                  <Select
                    label="Tipo de documento"
                    value={partnerDocumentType}
                    options={PARTNER_DOCUMENT_OPTIONS}
                    onChange={(value) => {
                      const nextType: PartnerDocumentType = value === 'cpf' ? 'cpf' : 'cnpj';
                      setValues((current) => ({
                        ...current,
                        documentType: nextType,
                        documentNumber: '',
                      }));
                    }}
                  />
                  <Field
                    label={`${partnerDocumentType === 'cpf' ? 'CPF' : 'CNPJ'}`}
                    value={values.documentNumber ?? ''}
                    required
                    inputMode="numeric"
                    maxLength={partnerDocumentType === 'cpf' ? 14 : 18}
                    hint={
                      values.documentNumber &&
                        !isValidPartnerDocument(partnerDocumentType, values.documentNumber)
                        ? `Informe um ${partnerDocumentType === 'cpf' ? 'CPF' : 'CNPJ'} valido.`
                        : undefined
                    }
                    onChange={updateMaskedField(
                      'documentNumber',
                      partnerDocumentType === 'cpf' ? formatCpf : formatCnpj
                    )}
                  />
                  <S.FullField>
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
                                inputMode="numeric"
                                maxLength={9}
                                hint={
                                  cepLookupErrors[clinic.id] ||
                                  'Preenchemos cidade, estado e endereço automaticamente.'
                                }
                                onChange={updateClinicMaskedField(clinic.id, 'cep', formatCep)}
                                onBlur={() => lookupClinicCep(clinic.id)}
                              />
                              <Field
                                label="Cidade"
                                value={clinic.city}
                                required
                                onChange={updateClinicField(clinic.id, 'city')}
                              />
                              <Select
                                label="Estado"
                                value={clinic.state}
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
                              <S.FullField>
                                <Field
                                  label="Endereço"
                                  value={clinic.address}
                                  required
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
                    </S.FullField>
                  ) : null}
                </>
              ) : null}

              {config.apiRole === 'dentist' ? (
                <>
                  <Field
                    label="Nome profissional"
                    value={values.fullName ?? ''}
                    required
                    onChange={updateField('fullName')}
                  />
                  <Field
                    label="CRO"
                    value={values.croNumber ?? ''}
                    required
                    inputMode="text"
                    maxLength={13}
                    hint={
                      values.croNumber && !isValidCro(values.croNumber)
                        ? 'Informe um CRO válido no formato CRO-UF 00000.'
                        : 'Formato: CRO-SP 12345.'
                    }
                    onChange={updateMaskedField('croNumber', formatCro)}
                  />
                  <S.FullField>
                    <Field
                      as="textarea"
                      label="Resumo profissional"
                      value={values.professionalSummary ?? ''}
                      required
                      error={getProfessionalSummaryError(values.professionalSummary, 'profissional')}
                      hint={getProfessionalSummaryHint(values.professionalSummary)}
                      onChange={updateField('professionalSummary')}
                    />
                  </S.FullField>
                  <S.FullField>
                    <S.ClinicSection>
                      <S.ClinicSectionHeader>
                        <div>
                          <S.ClinicSectionTitle>Dados da clínica</S.ClinicSectionTitle>
                          <S.ClinicSectionIntro>
                            Informe a clínica de atendimento que poderá aparecer na seleção de clínicas.
                          </S.ClinicSectionIntro>
                        </div>
                      </S.ClinicSectionHeader>
                      {clinics.map((clinic) => {
                        return (
                          <S.ClinicCard key={clinic.id}>
                            <S.ClinicCardHeader>
                              <S.ClinicTitle>Clínica</S.ClinicTitle>
                            </S.ClinicCardHeader>
                            <S.FieldsGrid>
                              <Field
                                label="Nome da clínica"
                                value={clinic.name}
                                required
                                onChange={updateClinicField(clinic.id, 'name')}
                              />
                              <Field
                                label="CEP da clínica"
                                value={clinic.cep}
                                required
                                inputMode="numeric"
                                maxLength={9}
                                hint={
                                  cepLookupErrors[clinic.id] ||
                                  'Preenchemos cidade, estado, endereço e mapa automaticamente.'
                                }
                                onChange={updateClinicMaskedField(clinic.id, 'cep', formatCep)}
                                onBlur={() => lookupClinicCep(clinic.id)}
                              />
                              <Field
                                label="Cidade da clínica"
                                value={clinic.city}
                                required
                                onChange={updateClinicField(clinic.id, 'city')}
                              />
                              <Select
                                label="Estado da clínica"
                                value={clinic.state}
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
                              <S.FullField>
                                <Field
                                  label="Endereço da clínica"
                                  value={clinic.address}
                                  required
                                  hint="Use o endereço completo que será usado para posicionar a clínica no mapa."
                                  onChange={updateClinicField(clinic.id, 'address')}
                                />
                              </S.FullField>
                              <Field
                                label="Complemento da clínica"
                                value={clinic.complement}
                                hint="Opcional"
                                onChange={updateClinicField(clinic.id, 'complement')}
                              />
                              <Field
                                label="Dia e horário de atendimento da clínica"
                                value={clinic.serviceHours}
                                required
                                hint="Ex: Segunda a Sexta - 9h as 18h"
                                onChange={updateClinicField(clinic.id, 'serviceHours')}
                              />
                              <Field
                                label="Telefone da clínica"
                                value={clinic.phone}
                                required
                                inputMode="tel"
                                maxLength={15}
                                onChange={updateClinicMaskedField(clinic.id, 'phone', formatPhone)}
                              />
                              <S.FullField>
                                <RadioQuestionGroup
                                  name={`clinic-adapted-${clinic.id}`}
                                  label="Clínica adaptada?"
                                  value={clinic.isAdapted}
                                  required
                                  inline
                                  hint="Essa informação ajuda a orientar clientes que precisam de atendimento em clínica adaptada."
                                  options={[
                                    { value: 'yes', label: 'Sim' },
                                    { value: 'no', label: 'Não' },
                                  ]}
                                  onChange={(value) => {
                                    setClinics((current) =>
                                      current.map((item) =>
                                        item.id === clinic.id
                                          ? { ...item, isAdapted: value === 'yes' ? 'yes' : 'no' }
                                          : item
                                      )
                                    );
                                  }}
                                />
                              </S.FullField>
                            </S.FieldsGrid>
                          </S.ClinicCard>
                        );
                      })}
                    </S.ClinicSection>
                  </S.FullField>
                </>
              ) : null}

              {config.apiRole === 'lab' ? (
                <>
                  <Field
                    label="Nome do laboratório"
                    value={values.labName ?? ''}
                    required
                    onChange={updateField('labName')}
                  />
                  <Field
                    label="CNPJ"
                    value={values.cnpj ?? ''}
                    required
                    inputMode="numeric"
                    maxLength={18}
                    hint={values.cnpj && !isValidCnpj(values.cnpj) ? 'Informe um CNPJ valido.' : undefined}
                    onChange={updateMaskedField('cnpj', formatCnpj)}
                  />
                  <S.FullField>
                    <Field
                      as="textarea"
                      label="Resumo operacional"
                      value={values.professionalSummary ?? ''}
                      required
                      error={getProfessionalSummaryError(values.professionalSummary, 'operacional')}
                      hint={getProfessionalSummaryHint(values.professionalSummary)}
                      onChange={updateField('professionalSummary')}
                    />
                  </S.FullField>
                  <S.FullField>
                    <S.ClinicSection>
                      <S.ClinicSectionHeader>
                        <div>
                          <S.ClinicSectionTitle>Dados do local</S.ClinicSectionTitle>
                          <S.ClinicSectionIntro>
                            Informe o local operacional do laboratório.
                          </S.ClinicSectionIntro>
                        </div>
                      </S.ClinicSectionHeader>
                      {clinics.slice(0, 1).map((clinic) => (
                        <S.ClinicCard key={clinic.id}>
                          <S.FieldsGrid>
                            <Field
                              label="Nome do local"
                              value={clinic.name}
                              required
                              onChange={updateClinicField(clinic.id, 'name')}
                            />
                            <Field
                              label="CEP do local"
                              value={clinic.cep}
                              required
                              inputMode="numeric"
                              maxLength={9}
                              hint={
                                cepLookupErrors[clinic.id] ||
                                'Preenchemos cidade, estado e endereço automaticamente.'
                              }
                              onChange={updateClinicMaskedField(clinic.id, 'cep', formatCep)}
                              onBlur={() => lookupClinicCep(clinic.id)}
                            />
                            <Field
                              label="Cidade do local"
                              value={clinic.city}
                              required
                              onChange={updateClinicField(clinic.id, 'city')}
                            />
                            <Select
                              label="Estado do local"
                              value={clinic.state}
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
                            <S.FullField>
                              <Field
                                label="Endereço do local"
                                value={clinic.address}
                                required
                                onChange={updateClinicField(clinic.id, 'address')}
                              />
                            </S.FullField>
                            <Field
                              label="Complemento do local"
                              value={clinic.complement}
                              onChange={updateClinicField(clinic.id, 'complement')}
                            />
                            <Field
                              label="Dia e horário de operação"
                              value={clinic.serviceHours}
                              required
                              onChange={updateClinicField(clinic.id, 'serviceHours')}
                            />
                            <Field
                              label="Telefone do local"
                              value={clinic.phone}
                              required
                              inputMode="tel"
                              maxLength={15}
                              onChange={updateClinicMaskedField(clinic.id, 'phone', formatPhone)}
                            />
                          </S.FieldsGrid>
                        </S.ClinicCard>
                      ))}
                    </S.ClinicSection>
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
            <Button type="button" variant="secondary" onClick={() => window.history.back()}>
              Cancelar
            </Button>
            <Button type="submit" disabled={!isValid || submitting} trailingIcon={<ChevronRight size={16} aria-hidden="true" />}>
              {submitting ? 'Enviando...' : 'Enviar solicitação'}
            </Button>
          </S.Actions>
        </S.Form>
      </S.ProfileShell>
    </S.Page>
  );
}
