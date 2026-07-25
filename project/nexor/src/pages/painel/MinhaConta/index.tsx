import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Download, ExternalLink, Mail, Pencil } from 'lucide-react';
import {
  Snackbar,
  SnackbarStack,
  sanitizePersonName,
  type SnackbarTone,
} from '@nexor/design-system';
import { SkeletonCard } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import * as S from './styles';


interface MockProduct {
  key: 'biteplaner';
  name: string;
  status: string;
  description: string;
  href: string;
}

type ProductRole = {
  id?: string;
  productKey: string;
  role: 'customer' | 'partner' | 'dentist' | 'lab';
  status: string;
  stage?: string | null;
  metadata: Record<string, unknown>;
};

type AccountConsentsResponse = {
  latestAccountConsents?: {
    terms?: boolean;
    privacy?: boolean;
    marketing?: boolean;
  };
  latestCookieConsent?: {
    version: number;
    necessary: boolean;
    preferences: boolean;
    analytics: boolean;
    acceptedAt: string | null;
  } | null;
};

type PracticeLocationMetadata = {
  name: string;
  address: string;
  cep: string;
  complement?: string;
  phone: string;
  dentistName: string;
  isAdapted: boolean;
  serviceHours: string;
  city: string;
  state: string;
  coordinates?: { lat: number; lng: number };
};

type CepAddressLookup = {
  cep: string;
  address: string;
  city: string;
  state: string;
  coordinates: { lat: number; lng: number };
};

type AccountSnackbar = {
  message: string;
  title: string;
  tone: SnackbarTone;
};

const fadeSection = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.2 } },
};

function getMockAcquiredProducts(email: string): MockProduct[] {
  if (email === 'sem-produto@nexor.dev' || email === '—') {
    return [];
  }

  return [
    {
      key: 'biteplaner',
      name: 'Biteplaner',
      status: 'Ativo',
      description: 'Produto ativo na sua conta Nexor.',
      href: '/painel/biteplaner',
    },
  ];
}

function getString(value: unknown) {
  return typeof value === 'string' ? value : '';
}

function onlyDigits(value: string) {
  return value.replace(/\D/g, '');
}

function formatCpf(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 11) {
    return value;
  }

  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatCnpj(value: string) {
  const digits = onlyDigits(value);
  if (digits.length !== 14) {
    return value;
  }

  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function getPracticeLocations(metadata: Record<string, unknown>): PracticeLocationMetadata[] {
  const source = Array.isArray(metadata.practiceLocations) ? metadata.practiceLocations : [];

  return source
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && !Array.isArray(item))
    .map((item) => ({
      name: getString(item.name),
      address: getString(item.address),
      cep: getString(item.cep),
      complement: getString(item.complement) || undefined,
      phone: getString(item.phone),
      dentistName: getString(item.dentistName),
      isAdapted: item.isAdapted === true,
      serviceHours: getString(item.serviceHours),
      city: getString(item.city),
      state: getString(item.state),
      coordinates:
        typeof item.coordinates === 'object' && item.coordinates !== null && !Array.isArray(item.coordinates)
          ? {
            lat: Number((item.coordinates as Record<string, unknown>).lat),
            lng: Number((item.coordinates as Record<string, unknown>).lng),
          }
          : undefined,
    }));
}

function getPrimaryPracticeLocation(metadata: Record<string, unknown>): PracticeLocationMetadata {
  return (
    getPracticeLocations(metadata)[0] ?? {
      name: '',
      address: '',
      cep: '',
      phone: '',
      dentistName: getString(metadata.fullName),
      isAdapted: false,
      serviceHours: '',
      city: '',
      state: '',
    }
  );
}

function getMetadataLocations(metadata: Record<string, unknown>, listField: string, singleField: string): PracticeLocationMetadata[] {
  const source = Array.isArray(metadata[listField])
    ? metadata[listField]
    : typeof metadata[singleField] === 'object' && metadata[singleField] !== null && !Array.isArray(metadata[singleField])
      ? [metadata[singleField]]
      : [];

  return source
    .filter((item): item is Record<string, unknown> => typeof item === 'object' && item !== null && !Array.isArray(item))
    .map((item) => ({
      name: getString(item.name),
      address: getString(item.address),
      cep: getString(item.cep),
      complement: getString(item.complement) || undefined,
      phone: getString(item.phone),
      dentistName: getString(item.dentistName),
      isAdapted: item.isAdapted === true,
      serviceHours: getString(item.serviceHours),
      city: getString(item.city),
      state: getString(item.state),
      coordinates:
        typeof item.coordinates === 'object' && item.coordinates !== null && !Array.isArray(item.coordinates)
          ? {
            lat: Number((item.coordinates as Record<string, unknown>).lat),
            lng: Number((item.coordinates as Record<string, unknown>).lng),
          }
          : undefined,
    }));
}

function getPrimaryMetadataLocation(
  metadata: Record<string, unknown>,
  listField: string,
  singleField: string
): PracticeLocationMetadata {
  return (
    getMetadataLocations(metadata, listField, singleField)[0] ?? {
      name: '',
      address: '',
      cep: '',
      phone: '',
      dentistName: '',
      isAdapted: false,
      serviceHours: '',
      city: '',
      state: '',
    }
  );
}

function getRoleLabel(role: ProductRole['role']) {
  const labels: Record<ProductRole['role'], string> = {
    customer: 'Cliente Biteplaner',
    partner: 'Parceiro Biteplaner',
    dentist: 'Dentista Biteplaner',
    lab: 'Laboratório Biteplaner',
  };

  return labels[role];
}

function getProductStatusLabel(status: string) {
  if (status === 'active') {
    return 'Ativo';
  }

  if (status === 'rejected') {
    return 'Rejeitado';
  }

  return status;
}

function getProductStatusTone(status: string): 'success' | 'error' {
  return status === 'rejected' ? 'error' : 'success';
}

function getProductRoleKey(role: ProductRole) {
  return role.id ?? `${role.productKey}:${role.role}`;
}

function hasCompletedCustomerOnboarding(role: ProductRole) {
  if (role.role !== 'customer') {
    return true;
  }

  const metadata = role.metadata ?? {};

  return (
    metadata.onboardingCompleted === true ||
    Boolean(metadata.onboardingSubmittedAt) ||
    Boolean(metadata.customerNewUserOnboardingSubmittedAt) ||
    Boolean(metadata.fullName && (metadata.cpf || metadata.birthDate || metadata.currentSports)) ||
    Boolean(role.stage && role.stage !== 'new_user_onboarding')
  );
}

function formatStringList(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0).join(', ');
  }

  return getString(value);
}

async function fetchCepAddress(cep: string): Promise<CepAddressLookup | null> {
  const digits = cep.replace(/\D/g, '');
  if (digits.length !== 8 || typeof fetch !== 'function') {
    return null;
  }

  const response = await fetch(`https://cep.awesomeapi.com.br/json/${digits}`);
  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const lat = Number(String(data.lat ?? '').replace(',', '.'));
  const lng = Number(String(data.lng ?? '').replace(',', '.'));
  const address = [getString(data.address), getString(data.district)].filter(Boolean).join(' - ');
  const city = getString(data.city);
  const state = getString(data.state).toUpperCase();

  if (!address || !city || !state || !Number.isFinite(lat) || !Number.isFinite(lng)) {
    return null;
  }

  return {
    cep,
    address,
    city,
    state,
    coordinates: { lat, lng },
  };
}

export function MinhaConta() {
  const { session, backendUser, sendPasswordReset, hasConfiguredAuth, isMockMode } = useAuth();
  const [fullName, setFullName] = useState('');
  const [passwordSending, setPasswordSending] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingProductRoles, setLoadingProductRoles] = useState(false);
  const [productRolesError, setProductRolesError] = useState('');
  const [loadedRoles, setLoadedRoles] = useState<string[]>([]);
  const [productRoles, setProductRoles] = useState<ProductRole[]>([]);
  const [editingOnboardingFields, setEditingOnboardingFields] = useState<Set<string>>(() => new Set());
  const [privacyExportSubmitting, setPrivacyExportSubmitting] = useState(false);
  const [privacyConsents, setPrivacyConsents] = useState<AccountConsentsResponse | null>(null);
  const [marketingRevocationSubmitting, setMarketingRevocationSubmitting] = useState(false);
  const [expandedOnboardingCards, setExpandedOnboardingCards] = useState<Set<string>>(() => new Set());
  const [snackbar, setSnackbar] = useState<AccountSnackbar | null>(null);
  const loadedAccountTokenRef = useRef<string | null>(null);
  const accountLoadRequestIdRef = useRef(0);

  const email = backendUser?.email ?? session?.user.email ?? '—';
  const roles = loadedRoles.length > 0 ? loadedRoles : (backendUser?.roles ?? []);
  const isAdmin = roles.includes('admin');
  const acquiredProducts = useMemo(() => getMockAcquiredProducts(email), [email]);
  const marketingConsentActive = privacyConsents?.latestAccountConsents?.marketing === true;
  const visibleProductRoles = useMemo(
    () => productRoles.filter((role) => role.role !== 'customer' || hasCompletedCustomerOnboarding(role)),
    [productRoles]
  );

  function getOnboardingEditKey(role: ProductRole, field: string) {
    return `${role.id ?? `${role.productKey}:${role.role}`}:${field}`;
  }

  function startEditingOnboardingField(role: ProductRole, field: string) {
    const key = getOnboardingEditKey(role, field);
    setEditingOnboardingFields((current) => new Set(current).add(key));
  }

  function isEditingOnboardingField(role: ProductRole, field: string) {
    return editingOnboardingFields.has(getOnboardingEditKey(role, field));
  }

  function getDisplayValue(value: string | boolean | undefined) {
    if (typeof value === 'boolean') {
      return value ? 'Sim' : 'Não';
    }

    const trimmed = value?.trim() ?? '';
    return trimmed || 'Não informado';
  }

  function renderOnboardingField(
    role: ProductRole,
    field: string,
    label: string,
    value: string | boolean | undefined,
    editor: ReactNode,
    span?: 'two' | 'full'
  ) {
    const isEditing = isEditingOnboardingField(role, field);

    return (
      <S.Field $span={span}>
        <S.FieldLabel>{label}</S.FieldLabel>
        {isEditing ? (
          editor
        ) : (
          <S.EditableValueRow>
            <S.FieldValue>{getDisplayValue(value)}</S.FieldValue>
            <S.EditIconButton
              type="button"
              aria-label={`Editar ${label}`}
              title={`Editar ${label}`}
              onClick={() => startEditingOnboardingField(role, field)}
            >
              <Pencil size={14} aria-hidden />
            </S.EditIconButton>
          </S.EditableValueRow>
        )}
      </S.Field>
    );
  }

  function renderLockedOnboardingField(label: string, value: string | boolean | undefined, span?: 'two' | 'full') {
    return (
      <S.Field $span={span}>
        <S.FieldLabel>{label}</S.FieldLabel>
        <S.FieldValue>{getDisplayValue(value)}</S.FieldValue>
      </S.Field>
    );
  }

  function renderOnboardingActions(role: ProductRole, isSavingRole: boolean) {
    return (
      <S.FormActions>
        <S.SaveBtn type="button" disabled={true || isSavingRole} title={`Dados de ${getRoleLabel(role.role)} são atualizados pelo cadastro principal Nexor.`}>
          Dados vinculados ao cadastro principal
        </S.SaveBtn>
      </S.FormActions>
    );
  }

  function toggleOnboardingCard(role: ProductRole) {
    const key = getProductRoleKey(role);
    setExpandedOnboardingCards((current) => {
      const next = new Set(current);
      if (next.has(key)) {
        next.delete(key);
      } else {
        next.add(key);
      }
      return next;
    });
  }

  function updateRoleMetadata(productRoleId: string | undefined, field: string, value: string | string[]) {
    updateProductRoleMetadata(productRoleId, (metadata) => ({
      ...metadata,
      [field]: value,
    }));
  }

  function updateMetadataLocation(
    productRoleId: string | undefined,
    listField: string,
    singleField: string,
    field: keyof PracticeLocationMetadata,
    value: string | boolean
  ) {
    updateProductRoleMetadata(productRoleId, (metadata) => {
      const primaryLocation = getPrimaryMetadataLocation(metadata, listField, singleField);
      const nextLocation = {
        ...primaryLocation,
        [field]: value,
      };

      return {
        ...metadata,
        [listField]: [nextLocation],
        [singleField]: nextLocation,
      };
    });
  }

  function splitCsv(value: string) {
    return value.split(',').map((item) => item.trim()).filter(Boolean);
  }

  function renderPartnerOnboardingFields(
    role: ProductRole,
    metadata: Record<string, unknown>,
    isSavingRole: boolean
  ) {
    const location = getPrimaryMetadataLocation(metadata, 'locations', 'location');
    const serviceLocations = Array.isArray(metadata.serviceLocations)
      ? metadata.serviceLocations.filter((item): item is string => typeof item === 'string')
      : [];
    const partnerType = getString(metadata.partnerType);
    const isAcademy = partnerType === 'academy';

    return (
      <>
        <S.CardRow>
          {renderOnboardingField(
            role,
            'name',
            'Nome do parceiro',
            getString(metadata.name),
            <S.FieldInput
              type="text"
              value={getString(metadata.name)}
              onChange={(event) => updateRoleMetadata(role.id, 'name', event.target.value)}
            />
          )}
          {renderLockedOnboardingField('E-mail', getString(metadata.contactEmail))}
        </S.CardRow>
        <S.CardRow>
          {renderLockedOnboardingField('Tipo de documento', getString(metadata.documentType).toUpperCase())}
          {renderLockedOnboardingField(
            'Documento',
            getString(metadata.documentType) === 'cpf'
              ? formatCpf(getString(metadata.documentNumber))
              : formatCnpj(getString(metadata.documentNumber))
          )}
          {renderOnboardingField(
            role,
            'partnerType',
            'Tipo de parceiro',
            isAcademy ? 'Academia' : 'Coach/Personal',
            <S.FieldSelect
              value={partnerType || 'coach_personal'}
              onChange={(event) => updateRoleMetadata(role.id, 'partnerType', event.target.value)}
            >
              <option value="coach_personal">Coach/Personal</option>
              <option value="academy">Academia</option>
            </S.FieldSelect>
          )}
        </S.CardRow>
        {isAcademy ? (
          <>
            <S.CardRow>
              {renderOnboardingField(
                role,
                'locationName',
                'Nome do local',
                location.name,
                <S.FieldInput
                  type="text"
                  value={location.name}
                  onChange={(event) => updateMetadataLocation(role.id, 'locations', 'location', 'name', event.target.value)}
                />
              )}
              {renderOnboardingField(
                role,
                'locationCep',
                'CEP',
                location.cep,
                <S.FieldInput
                  type="text"
                  value={location.cep}
                  onChange={(event) => updateMetadataLocation(role.id, 'locations', 'location', 'cep', event.target.value)}
                />
              )}
            </S.CardRow>
            {renderOnboardingField(
              role,
              'locationAddress',
              'Endereço',
              location.address,
              <S.FieldInput
                type="text"
                value={location.address}
                onChange={(event) => updateMetadataLocation(role.id, 'locations', 'location', 'address', event.target.value)}
              />
            )}
          </>
        ) : (
          renderOnboardingField(
            role,
            'serviceLocations',
            'Locais de atuação',
            serviceLocations.join(', '),
            <S.FieldInput
              type="text"
              value={serviceLocations.join(', ')}
              onChange={(event) => updateRoleMetadata(role.id, 'serviceLocations', splitCsv(event.target.value))}
            />
          )
        )}
        {renderOnboardingActions(role, isSavingRole)}
      </>
    );
  }

  function renderLabOnboardingFields(
    role: ProductRole,
    metadata: Record<string, unknown>,
    isSavingRole: boolean
  ) {
    const location = getPrimaryMetadataLocation(metadata, 'locations', 'location');

    return (
      <>
        <S.CardRow>
          {renderOnboardingField(
            role,
            'labName',
            'Nome do laboratório',
            getString(metadata.labName),
            <S.FieldInput
              type="text"
              value={getString(metadata.labName)}
              onChange={(event) => updateRoleMetadata(role.id, 'labName', event.target.value)}
            />
          )}
          {renderLockedOnboardingField('CNPJ', formatCnpj(getString(metadata.cnpj)))}
          {renderLockedOnboardingField('CPF', formatCpf(getString(metadata.cpf)))}
        </S.CardRow>
        {renderOnboardingField(
          role,
          'professionalSummary',
          'Resumo operacional',
          getString(metadata.professionalSummary),
          <S.TextArea
            value={getString(metadata.professionalSummary)}
            onChange={(event) => updateRoleMetadata(role.id, 'professionalSummary', event.target.value)}
          />
        )}
        <S.CardRow>
          {renderOnboardingField(
            role,
            'locationName',
            'Nome da unidade',
            location.name,
            <S.FieldInput
              type="text"
              value={location.name}
              onChange={(event) => updateMetadataLocation(role.id, 'locations', 'location', 'name', event.target.value)}
            />
          )}
          {renderOnboardingField(
            role,
            'locationPhone',
            'Telefone',
            location.phone,
            <S.FieldInput
              type="text"
              value={location.phone}
              onChange={(event) => updateMetadataLocation(role.id, 'locations', 'location', 'phone', event.target.value)}
            />
          )}
          {renderOnboardingField(
            role,
            'locationCep',
            'CEP',
            location.cep,
            <S.FieldInput
              type="text"
              value={location.cep}
              onChange={(event) => updateMetadataLocation(role.id, 'locations', 'location', 'cep', event.target.value)}
            />
          )}
        </S.CardRow>
        {renderOnboardingField(
          role,
          'locationAddress',
          'Endereço',
          location.address,
          <S.FieldInput
            type="text"
            value={location.address}
            onChange={(event) => updateMetadataLocation(role.id, 'locations', 'location', 'address', event.target.value)}
          />
        )}
        <S.CardRow>
          {renderOnboardingField(
            role,
            'locationCity',
            'Cidade',
            location.city,
            <S.FieldInput
              type="text"
              value={location.city}
              onChange={(event) => updateMetadataLocation(role.id, 'locations', 'location', 'city', event.target.value)}
            />
          )}
          {renderOnboardingField(
            role,
            'locationState',
            'Estado',
            location.state,
            <S.FieldInput
              type="text"
              value={location.state}
              onChange={(event) => updateMetadataLocation(role.id, 'locations', 'location', 'state', event.target.value.toUpperCase().slice(0, 2))}
            />
          )}
        </S.CardRow>
        {renderOnboardingField(
          role,
          'locationServiceHours',
          'Horário de atendimento',
          location.serviceHours,
          <S.FieldInput
            type="text"
            value={location.serviceHours}
            onChange={(event) => updateMetadataLocation(role.id, 'locations', 'location', 'serviceHours', event.target.value)}
          />
        )}
        {renderOnboardingActions(role, isSavingRole)}
      </>
    );
  }

  function renderCustomerOnboardingFields(metadata: Record<string, unknown>) {
    return (
      <>
        <S.OnboardingFieldGroup>
          <S.OnboardingGroupTitle>Dados pessoais</S.OnboardingGroupTitle>
          <S.CardRow>
            {renderLockedOnboardingField('Nome completo', getString(metadata.fullName))}
            {renderLockedOnboardingField('E-mail', getString(metadata.email))}
            {renderLockedOnboardingField('Telefone', getString(metadata.phone))}
            {renderLockedOnboardingField('CPF', formatCpf(getString(metadata.cpf)))}
            {renderLockedOnboardingField('Data de nascimento', getString(metadata.birthDate))}
            {renderLockedOnboardingField('Profissão', getString(metadata.profession))}
            {renderLockedOnboardingField('Cidade/bairro de residência', getString(metadata.residenceCityOrNeighborhood), 'full')}
          </S.CardRow>
        </S.OnboardingFieldGroup>
        <S.OnboardingFieldGroup>
          <S.OnboardingGroupTitle>Dados esportivos</S.OnboardingGroupTitle>
          <S.CardRow>
            {renderLockedOnboardingField('Sexo biológico', getString(metadata.biologicalSex))}
            {renderLockedOnboardingField('Lateralidade dominante', getString(metadata.dominantLaterality))}
            {renderLockedOnboardingField('Peso corporal', getString(metadata.bodyMassKg))}
            {renderLockedOnboardingField('Altura', getString(metadata.heightMeters))}
            {renderLockedOnboardingField('Esportes atuais', formatStringList(metadata.currentSports), 'two')}
            {renderLockedOnboardingField('Experiência de treino', getString(metadata.trainingExperience))}
            {renderLockedOnboardingField('Cidade/bairro de treino', getString(metadata.trainingCityOrNeighborhood), 'two')}
          </S.CardRow>
        </S.OnboardingFieldGroup>
      </>
    );
  }

  function renderDentistOnboardingFields(
    role: ProductRole,
    metadata: Record<string, unknown>,
    primaryLocation: PracticeLocationMetadata,
    isSavingRole: boolean
  ) {
    return (
      <>
        <S.OnboardingFieldGroup>
          <S.OnboardingGroupTitle>Dados profissionais</S.OnboardingGroupTitle>
          <S.CardRow>
            {renderOnboardingField(
              role,
              'fullName',
              'Nome profissional',
              getString(metadata.fullName),
              <S.FieldInput
                type="text"
                value={getString(metadata.fullName)}
                onChange={(event) => updateDentistMetadata(role.id, 'fullName', event.target.value)}
              />
            )}
            {renderOnboardingField(
              role,
              'croNumber',
              'CRO',
              getString(metadata.croNumber),
              <S.FieldInput
                type="text"
                value={getString(metadata.croNumber)}
                onChange={(event) => updateDentistMetadata(role.id, 'croNumber', event.target.value)}
              />
            )}
            {renderLockedOnboardingField('CPF', formatCpf(getString(metadata.cpf)))}
            {renderLockedOnboardingField('CNPJ', formatCnpj(getString(metadata.cnpj)))}
            {renderOnboardingField(
              role,
              'professionalSummary',
              'Resumo profissional',
              getString(metadata.professionalSummary),
              <S.TextArea
                value={getString(metadata.professionalSummary)}
                onChange={(event) => updateDentistMetadata(role.id, 'professionalSummary', event.target.value)}
              />,
              'two'
            )}
          </S.CardRow>
        </S.OnboardingFieldGroup>
        <S.OnboardingFieldGroup>
          <S.OnboardingGroupTitle>Dados da clínica</S.OnboardingGroupTitle>
          <S.CardRow>
            {renderOnboardingField(
              role,
              'clinicName',
              'Nome da clínica',
              primaryLocation.name,
              <S.FieldInput
                type="text"
                value={primaryLocation.name}
                onChange={(event) => updateDentistLocation(role.id, 'name', event.target.value)}
              />
            )}
            {renderOnboardingField(
              role,
              'clinicPhone',
              'Telefone da clínica',
              primaryLocation.phone,
              <S.FieldInput
                type="text"
                value={primaryLocation.phone}
                onChange={(event) => updateDentistLocation(role.id, 'phone', event.target.value)}
              />
            )}
            {renderOnboardingField(
              role,
              'clinicIsAdapted',
              'Clínica adaptada',
              primaryLocation.isAdapted,
              <S.FieldSelect
                value={primaryLocation.isAdapted ? 'yes' : 'no'}
                onChange={(event) => updateDentistLocation(role.id, 'isAdapted', event.target.value === 'yes')}
              >
                <option value="yes">Sim</option>
                <option value="no">Não</option>
              </S.FieldSelect>
            )}
            {renderOnboardingField(
              role,
              'clinicServiceHours',
              'Dia e horário de atendimento',
              primaryLocation.serviceHours,
              <S.FieldInput
                type="text"
                value={primaryLocation.serviceHours}
                onChange={(event) => updateDentistLocation(role.id, 'serviceHours', event.target.value)}
              />,
              'full'
            )}
          </S.CardRow>
        </S.OnboardingFieldGroup>
        <S.OnboardingFieldGroup>
          <S.OnboardingGroupTitle>Endereço da clínica</S.OnboardingGroupTitle>
          <S.CardRow>
            {renderOnboardingField(
              role,
              'clinicCep',
              'CEP',
              primaryLocation.cep,
              <S.FieldInput
                type="text"
                value={primaryLocation.cep}
                onChange={(event) => updateDentistLocation(role.id, 'cep', event.target.value)}
                onBlur={(event) => void handleDentistCepBlur(role.id, event.target.value)}
              />
            )}
            {renderOnboardingField(
              role,
              'clinicAddress',
              'Endereço da clínica',
              primaryLocation.address,
              <S.FieldInput
                type="text"
                value={primaryLocation.address}
                onChange={(event) => updateDentistLocation(role.id, 'address', event.target.value)}
              />,
              'two'
            )}
            {renderLockedOnboardingField('Cidade', primaryLocation.city)}
            {renderLockedOnboardingField('Estado', primaryLocation.state, 'two')}
          </S.CardRow>
        </S.OnboardingFieldGroup>
        {renderOnboardingActions(role, isSavingRole)}
      </>
    );
  }

  useEffect(() => {
    if (!session) return;
    const token = session.access_token;
    const accountSnapshotKey = JSON.stringify({
      token,
      fullName: backendUser?.fullName,
      roles: backendUser?.roles,
      productRoles: backendUser?.productRoles,
    });
    if (loadedAccountTokenRef.current === accountSnapshotKey) return;
    const requestId = accountLoadRequestIdRef.current + 1;
    accountLoadRequestIdRef.current = requestId;
    let active = true;
    const shouldApplyState = () => active && accountLoadRequestIdRef.current === requestId;

    async function load() {
      setLoadingProfile(true);
      setLoadingProductRoles(true);
      setProductRolesError('');

      if (shouldApplyState()) {
        setFullName(sanitizePersonName(backendUser?.fullName ?? '').trim());
        setLoadedRoles(backendUser?.roles ?? []);
        setProductRoles(
          (backendUser?.productRoles ?? []).map((role) => ({
            id: getString(role.orderId) || `${role.productKey}:${role.role}`,
            productKey: role.productKey,
            role: role.role as ProductRole['role'],
            status: role.status,
            stage: role.stage,
            metadata: role.metadata ?? {},
          }))
        );
        setProductRolesError('');
        setLoadingProfile(false);
        setLoadingProductRoles(false);
        loadedAccountTokenRef.current = accountSnapshotKey;
      }

      const [accountConsentsResult] = await Promise.allSettled([
        api.get<AccountConsentsResponse>('/v1/account/consents', token),
      ]);

      if (!shouldApplyState()) {
        return;
      }

      setPrivacyConsents(accountConsentsResult.status === 'fulfilled' ? accountConsentsResult.value ?? null : null);
    }

    void load();
    return () => { active = false; };
  }, [backendUser, session]);

  function updateProductRoleMetadata(
    productRoleId: string | undefined,
    updater: (metadata: Record<string, unknown>) => Record<string, unknown>
  ) {
    if (!productRoleId) {
      return;
    }

    setProductRoles((current) =>
      current.map((role) =>
        role.id === productRoleId
          ? {
            ...role,
            metadata: updater(role.metadata),
          }
          : role
      )
    );
  }

  function updateDentistMetadata(productRoleId: string | undefined, field: string, value: string) {
    updateProductRoleMetadata(productRoleId, (metadata) => ({
      ...metadata,
      [field]: value,
    }));
  }

  function updateDentistLocation(
    productRoleId: string | undefined,
    field: keyof PracticeLocationMetadata,
    value: string | boolean
  ) {
    updateProductRoleMetadata(productRoleId, (metadata) => {
      const primaryLocation = getPrimaryPracticeLocation(metadata);
      const nextLocation = {
        ...primaryLocation,
        [field]: value,
      };

      return {
        ...metadata,
        practiceLocations: [nextLocation],
        practiceLocation: nextLocation,
      };
    });
  }

  async function handleDentistCepBlur(productRoleId: string | undefined, cep: string) {
    if (!productRoleId) {
      return;
    }

    const cepAddress = await fetchCepAddress(cep).catch(() => null);
    if (!cepAddress) {
      return;
    }

    updateProductRoleMetadata(productRoleId, (metadata) => {
      const primaryLocation = getPrimaryPracticeLocation(metadata);
      const nextLocation = {
        ...primaryLocation,
        cep: cepAddress.cep,
        address: cepAddress.address,
        city: cepAddress.city,
        state: cepAddress.state,
        coordinates: cepAddress.coordinates,
      };

      return {
        ...metadata,
        practiceLocations: [nextLocation],
        practiceLocation: nextLocation,
      };
    });
  }

  async function handleMarketingConsentChange(enabled: boolean) {
    if (!session?.access_token || marketingRevocationSubmitting || enabled === marketingConsentActive) {
      return;
    }

    setMarketingRevocationSubmitting(true);
    setSnackbar(null);

    try {
      if (enabled) {
        await api.post(
          '/v1/account/consents',
          { consents: [{ type: 'marketing', accepted: true }] },
          session.access_token
        );
      } else {
        await api.post('/v1/account/consents/revoke', { types: ['marketing'] }, session.access_token);
      }

      setPrivacyConsents((current) => ({
        ...current,
        latestAccountConsents: {
          ...(current?.latestAccountConsents ?? {}),
          marketing: enabled,
        },
      }));
      setSnackbar({
        tone: 'success',
        title: enabled ? 'Marketing ativado' : 'Marketing revogado',
        message: enabled
          ? 'Seu consentimento para comunicações de marketing foi ativado.'
          : 'Seu consentimento para comunicações de marketing foi revogado.',
      });
    } catch {
      setSnackbar({
        tone: 'error',
        title: 'Falha ao salvar marketing',
        message: 'Não foi possível atualizar o consentimento agora. Tente novamente ou acione o canal LGPD.',
      });
    } finally {
      setMarketingRevocationSubmitting(false);
    }
  }

  async function handlePrivacyExport() {
    if (!session?.access_token) {
      return;
    }

    setPrivacyExportSubmitting(true);
    setSnackbar(null);

    try {
      const payload = await api.get<unknown>('/v1/account/privacy-export', session.access_token);
      const exportedAt = new Date().toISOString().replace(/[:.]/g, '-');
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');

      link.href = url;
      link.download = `nexor-privacy-export-${exportedAt}.json`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      URL.revokeObjectURL(url);

      setSnackbar({
        tone: 'success',
        title: 'Exportação gerada',
        message: 'O arquivo JSON estruturado com os dados da sua conta foi preparado neste navegador.',
      });
    } catch {
      setSnackbar({
        tone: 'error',
        title: 'Falha ao exportar dados',
        message: 'Não foi possível gerar a exportação agora. Tente novamente ou envie uma solicitação pelo canal LGPD.',
      });
    } finally {
      setPrivacyExportSubmitting(false);
    }
  }

  async function handleSave(e: FormEvent) {
    e.preventDefault();
    setSnackbar(null);
    setFullName(sanitizePersonName(fullName).trim());
    setSnackbar({
      tone: 'info',
      title: 'Cadastro centralizado',
      message: 'Os dados cadastrais agora são atualizados pelo cadastro principal Nexor/OrthoTech. Nenhuma rota legada foi acionada.',
    });
  }

  async function handlePasswordReset() {
    if (!email || email === '—') {
      return;
    }

    setSnackbar(null);

    if (isMockMode) {
      setSnackbar({
        tone: 'info',
        title: 'Ambiente de demonstração',
        message: 'Ambiente de demonstração: o envio real pelo Supabase não é executado.',
      });
      return;
    }

    if (!hasConfiguredAuth) {
      setSnackbar({
        tone: 'error',
        title: 'Autenticação indisponível',
        message: 'A autenticação Supabase não está configurada neste ambiente.',
      });
      return;
    }

    setPasswordSending(true);

    try {
      await sendPasswordReset(email);
      setSnackbar({
        tone: 'success',
        title: 'Link enviado',
        message: 'Enviamos um link para troca de senha no e-mail da conta.',
      });
    } catch {
      setSnackbar({
        tone: 'error',
        title: 'Falha ao enviar',
        message: 'Não foi possível enviar o link de troca de senha.',
      });
    } finally {
      setPasswordSending(false);
    }
  }

  return (
    <S.Page>
      <S.PageTitle>Minha Conta</S.PageTitle>
      <S.PageSubtitle>Gerencie os dados cadastrais e a segurança da sua conta Nexor.</S.PageSubtitle>

      <S.TopGrid>
        <S.Section
          id="dados-da-conta"
          variants={fadeSection}
          initial="hidden"
          animate="visible"
        >
          <S.SectionTitle>Dados da conta</S.SectionTitle>
          {loadingProfile ? (
            <SkeletonCard lines={4} blockHeight="44px" />
          ) : (
            <S.Card as="form" onSubmit={handleSave}>
              <S.CardRow>
                <S.Field as="label">
                  <S.FieldLabel>Nome completo</S.FieldLabel>
                  <S.FieldInput
                    type="text"
                    aria-label="Nome completo"
                    value={fullName}
                    onChange={(e) => { setFullName(sanitizePersonName(e.target.value)); }}
                    placeholder="Seu nome"
                  />
                </S.Field>
                <S.Field>
                  <S.FieldLabel>E-mail <S.FieldLocked>(não editável)</S.FieldLocked></S.FieldLabel>
                  <S.FieldValue>{email}</S.FieldValue>
                </S.Field>
                <S.Field>
                  <S.FieldLabel>Status</S.FieldLabel>
                  <S.FieldValue>Ativo</S.FieldValue>
                </S.Field>
              </S.CardRow>
              <S.FormActions>
                <S.SaveBtn type="submit">Atualizar localmente</S.SaveBtn>
              </S.FormActions>
            </S.Card>
          )}
        </S.Section>

        <S.Section
          variants={fadeSection}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.04 } as never}
        >
          <S.SectionTitle>Produtos adquiridos</S.SectionTitle>
          <S.Card>
            {acquiredProducts.length > 0 ? (
              acquiredProducts.map((product) => (
                <S.ProductContent key={product.key}>
                  <S.ProductHeader>
                    <S.ProductTitle>{product.name}</S.ProductTitle>
                    <S.ProductBadge $tone={getProductStatusTone(product.status)}>
                      {getProductStatusLabel(product.status)}
                    </S.ProductBadge>
                  </S.ProductHeader>
                  <S.ProductText>{product.description}</S.ProductText>
                  <S.ProductLink as={Link} to={product.href}>Abrir Biteplaner</S.ProductLink>
                </S.ProductContent>
              ))
            ) : (
              <S.ProductContent>
                <S.ProductTitle>Biteplaner</S.ProductTitle>
                <S.ProductText>Você ainda não possui produtos ativos na plataforma Nexor.</S.ProductText>
                <S.ProductLink as={Link} to="/painel/biteplaner">Pedir Biteplaner</S.ProductLink>
              </S.ProductContent>
            )}
          </S.Card>
        </S.Section>
      </S.TopGrid>

      {!isAdmin ? (
        <S.Section
          id="privacidade-lgpd"
          variants={fadeSection}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.05 } as never}
        >
          <S.SectionTitle>Privacidade e LGPD</S.SectionTitle>
          <S.PrivacyPanel>
            <S.PrivacyHeader>
              <div>
                <S.SecurityTitle>Seus dados e direitos em um só lugar</S.SecurityTitle>
                <S.SecurityText>
                  Exporte seus dados, revise preferências, consulte políticas ou solicite correção, revogação e análise de exclusão pelo canal LGPD.
                </S.SecurityText>
              </div>
            </S.PrivacyHeader>

            <S.PrivacyConsentSummary aria-label="Resumo de consentimentos LGPD">
              <S.PrivacyConsentItem>
                <S.PreferenceContent>
                  <S.PrivacyConsentStatus>{marketingConsentActive ? 'Marketing ativo' : 'Marketing revogado'}</S.PrivacyConsentStatus>
                  <S.PrivacyConsentHint>Preferências de marketing para receber novidades e informativos sobre o produto.</S.PrivacyConsentHint>
                  <S.PreferenceSwitchLabel>
                    <S.PreferenceSwitchInput
                      type="checkbox"
                      checked={marketingConsentActive}
                      disabled={marketingRevocationSubmitting}
                      onChange={(event) => void handleMarketingConsentChange(event.target.checked)}
                    />
                    <S.PreferenceSwitchText>Receber novidades e informativos sobre o produto</S.PreferenceSwitchText>
                  </S.PreferenceSwitchLabel>
                </S.PreferenceContent>
              </S.PrivacyConsentItem>

              <S.PrivacyConsentItem>
                <S.PreferenceContent>
                  <S.PrivacyConsentStatus>Comunicações operacionais</S.PrivacyConsentStatus>
                  <S.PrivacyConsentHint>
                    Preferências operacionais serão reativadas quando o novo fluxo commerce/licenciamento estiver conectado.
                    E-mails de segurança e autenticação continuam ativos.
                  </S.PrivacyConsentHint>
                </S.PreferenceContent>
              </S.PrivacyConsentItem>
            </S.PrivacyConsentSummary>

            <S.PrivacyActionGrid>
              <S.PrivacyActionButton
                type="button"
                disabled={privacyExportSubmitting}
                onClick={() => void handlePrivacyExport()}
              >
                <Download size={16} aria-hidden />
                {privacyExportSubmitting ? 'Gerando exportação...' : 'Exportar meus dados'}
              </S.PrivacyActionButton>
              <S.PrivacyActionLink to="/privacidade" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} aria-hidden />
                Política de Privacidade
              </S.PrivacyActionLink>
              <S.PrivacyActionLink to="/cookies" target="_blank" rel="noopener noreferrer">
                <ExternalLink size={16} aria-hidden />
                Política de Cookies
              </S.PrivacyActionLink>
              <S.PrivacyActionLink to="/?assunto=lgpd#contato" target="_blank" rel="noopener noreferrer">
                <Mail size={16} aria-hidden />
                Falar com o canal LGPD
              </S.PrivacyActionLink>
            </S.PrivacyActionGrid>
          </S.PrivacyPanel>
        </S.Section>
      ) : null}

      <S.Section
        id="dados-onboarding"
        variants={fadeSection}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.06 } as never}
      >
        <S.SectionTitle>Dados de onboarding</S.SectionTitle>
        {loadingProductRoles ? (
          <SkeletonCard lines={5} blockHeight="44px" />
        ) : productRolesError ? (
          <S.Card>
            <S.ProductContent>
              <S.ProductText>{productRolesError}</S.ProductText>
            </S.ProductContent>
          </S.Card>
        ) : visibleProductRoles.length > 0 ? (
          <S.OnboardingStack>
            {visibleProductRoles.map((role) => {
              const metadata = role.metadata ?? {};
              const primaryLocation = getPrimaryPracticeLocation(metadata);
              const isCollapsibleRole = role.role === 'dentist' || role.role === 'customer';
              const roleKey = getProductRoleKey(role);
              const isExpanded = !isCollapsibleRole || expandedOnboardingCards.has(roleKey);

              return (
                <S.Card key={roleKey}>
                  <S.OnboardingCardContent>
                    {isCollapsibleRole ? (
                      <S.OnboardingCollapseButton
                        type="button"
                        aria-expanded={isExpanded}
                        onClick={() => toggleOnboardingCard(role)}
                      >
                        <S.ProductHeader>
                          <S.ProductTitle>{getRoleLabel(role.role)}</S.ProductTitle>
                          <S.ProductBadge $tone={getProductStatusTone(role.status)}>
                            {getProductStatusLabel(role.status)}
                          </S.ProductBadge>
                        </S.ProductHeader>
                        <S.CollapseIcon $expanded={isExpanded}>
                          <ChevronDown size={16} aria-hidden />
                        </S.CollapseIcon>
                      </S.OnboardingCollapseButton>
                    ) : (
                      <S.OnboardingStaticHeader>
                        <S.ProductTitle>{getRoleLabel(role.role)}</S.ProductTitle>
                        <S.ProductBadge $tone={getProductStatusTone(role.status)}>
                          {getProductStatusLabel(role.status)}
                        </S.ProductBadge>
                      </S.OnboardingStaticHeader>
                    )}
                    {isExpanded ? (
                      <S.OnboardingBody>
                        {role.role === 'dentist'
                          ? renderDentistOnboardingFields(role, metadata, primaryLocation, false)
                          : role.role === 'customer'
                            ? renderCustomerOnboardingFields(metadata)
                            : role.role === 'partner'
                              ? renderPartnerOnboardingFields(role, metadata, false)
                              : renderLabOnboardingFields(role, metadata, false)}
                      </S.OnboardingBody>
                    ) : null}
                  </S.OnboardingCardContent>
                </S.Card>
              );
            })}
          </S.OnboardingStack>
        ) : (
          <S.Card>
            <S.ProductContent>
              <S.ProductText style={{ margin: 0 }}>Nenhum onboarding de produto foi encontrado para esta conta.</S.ProductText>
            </S.ProductContent>
          </S.Card>
        )}
      </S.Section>

      <S.Section
        id="seguranca"
        variants={fadeSection}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.08 } as never}
      >
        <S.SectionTitle>Segurança</S.SectionTitle>
        <S.Card>
          <S.SecurityContent>
            <S.SecurityTitle>Trocar senha</S.SecurityTitle>
            <S.SecurityText>
              Envie um link seguro para o e-mail cadastrado e defina uma nova senha.
            </S.SecurityText>
          </S.SecurityContent>
          <S.FormActions>
            <S.SaveBtn type="button" disabled={passwordSending} onClick={handlePasswordReset}>
              {passwordSending ? 'Enviando…' : 'Enviar link para trocar senha'}
            </S.SaveBtn>
          </S.FormActions>
        </S.Card>
      </S.Section>

      {!isAdmin ? (
        <S.Section
          id="solicitacoes-lgpd"
          variants={fadeSection}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.12 } as never}
        >
          <S.SectionTitle>Solicitações LGPD</S.SectionTitle>
          <S.Card>
            <S.SecurityContent>
              <S.SecurityTitle>Correção, revogação ou exclusão de dados</S.SecurityTitle>
              <S.SecurityText>
                Durante o reset da plataforma, solicitações sensíveis da conta devem ser feitas pelo canal LGPD para análise manual da Nexor.
              </S.SecurityText>
            </S.SecurityContent>
            <S.FormActions>
              <S.CancelButton as="a" href="/?assunto=lgpd#contato" target="_blank" rel="noopener noreferrer">
                Falar com o canal LGPD
              </S.CancelButton>
            </S.FormActions>
          </S.Card>
        </S.Section>
      ) : null}
      {snackbar ? (
        <SnackbarStack>
          <Snackbar
            tone={snackbar.tone}
            title={snackbar.title}
            message={snackbar.message}
            onClose={() => {
              setSnackbar(null);
            }}
          />
        </SnackbarStack>
      ) : null}
    </S.Page>
  );
}
