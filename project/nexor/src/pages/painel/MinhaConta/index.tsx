import { useEffect, useMemo, useRef, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, Download, ExternalLink, Mail, Pencil } from 'lucide-react';
import {
  Field as DesignSystemField,
  Snackbar,
  SnackbarStack,
  sanitizePersonName,
  type SnackbarTone,
} from '@nexor/design-system';
import { SkeletonCard } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import { fetchCommunicationPreferences, updateCommunicationPreferences } from '../../../features/platformEmails/platformEmails.api';
import type { CommunicationPreferences } from '../../../features/platformEmails/platformEmails.types';
import * as S from './styles';


interface MeResponse {
  user?: {
    profileId?: string;
    email?: string;
    roles?: string[];
    fullName?: string | null;
    phone?: string | null;
  };
  profile?: {
    full_name: string;
    role: string;
  };
}

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

type ProductRolesResponse = {
  productRoles: ProductRole[];
};

type AccountDeletionStatus =
  | 'pending_confirmation'
  | 'pending_admin_review'
  | 'cancelled_by_user'
  | 'rejected'
  | 'approved_direct'
  | 'approved_processing_privacy'
  | 'completed';

type AccountDeletionResponse = {
  request: {
    id: string;
    status: AccountDeletionStatus;
    active_order_ids?: string[];
    admin_decision_note?: string | null;
  };
  requiresAdminReview: boolean;
  message: string;
};

type CurrentAccountDeletionResponse = {
  deletionRequest: AccountDeletionResponse | null;
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

const deletionReasonOptions = [
  { value: '', label: 'Prefiro não informar' },
  { value: 'privacy', label: 'Privacidade e LGPD' },
  { value: 'no_longer_uses', label: 'Não uso mais a Nexor' },
  { value: 'duplicate_account', label: 'Tenho outra conta' },
  { value: 'service_issue', label: 'Tive problema com o serviço' },
  { value: 'other', label: 'Outros' },
] as const;

const PRODUCT_ROLES_LOAD_TIMEOUT_MS = 10000;

type DeletionReason = (typeof deletionReasonOptions)[number]['value'];
type AccountSnackbar = {
  message: string;
  title: string;
  tone: SnackbarTone;
};

function getFirstName(name: string, fallbackEmail: string) {
  const fromName = name.trim().split(/\s+/).filter(Boolean)[0];

  if (fromName) {
    return fromName;
  }

  return fallbackEmail.split('@')[0] || 'confirmar';
}











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
      href: '/painel/biteplaner?mode=user',
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

function withTimeout<T>(promise: Promise<T> | T, timeoutMs: number, message: string): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeoutId = window.setTimeout(() => {
      reject(new Error(message));
    }, timeoutMs);

    Promise.resolve(promise).then(
      (value) => {
        window.clearTimeout(timeoutId);
        resolve(value);
      },
      (error: unknown) => {
        window.clearTimeout(timeoutId);
        reject(error);
      }
    );
  });
}

export function MinhaConta() {
  const { session, backendUser, sendPasswordReset, hasConfiguredAuth, isMockMode } = useAuth();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [passwordSending, setPasswordSending] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
  const [loadingProductRoles, setLoadingProductRoles] = useState(false);
  const [productRolesError, setProductRolesError] = useState('');
  const [loadedRoles, setLoadedRoles] = useState<string[]>([]);
  const [productRoles, setProductRoles] = useState<ProductRole[]>([]);
  const [savingProductRoleId, setSavingProductRoleId] = useState('');
  const [editingOnboardingFields, setEditingOnboardingFields] = useState<Set<string>>(() => new Set());
  const [deletionModalOpen, setDeletionModalOpen] = useState(false);
  const [deletionReason, setDeletionReason] = useState<DeletionReason>('');
  const [deletionReasonDetails, setDeletionReasonDetails] = useState('');
  const [deletionConfirmation, setDeletionConfirmation] = useState('');
  const [deletionSubmitting, setDeletionSubmitting] = useState(false);
  const [deletionRequest, setDeletionRequest] = useState<AccountDeletionResponse | null>(null);
  const [deletionActionSubmitting, setDeletionActionSubmitting] = useState(false);
  const [privacyExportSubmitting, setPrivacyExportSubmitting] = useState(false);
  const [privacyConsents, setPrivacyConsents] = useState<AccountConsentsResponse | null>(null);
  const [marketingRevocationSubmitting, setMarketingRevocationSubmitting] = useState(false);
  const [communicationPreferences, setCommunicationPreferences] = useState<CommunicationPreferences | null>(null);
  const [communicationPreferencesSaving, setCommunicationPreferencesSaving] = useState(false);
  const [disableCommunicationModalOpen, setDisableCommunicationModalOpen] = useState(false);
  const [expandedOnboardingCards, setExpandedOnboardingCards] = useState<Set<string>>(() => new Set());
  const [snackbar, setSnackbar] = useState<AccountSnackbar | null>(null);
  const loadedAccountTokenRef = useRef<string | null>(null);
  const accountLoadRequestIdRef = useRef(0);

  const email = backendUser?.email ?? session?.user.email ?? '—';
  const roles = loadedRoles.length > 0 ? loadedRoles : (backendUser?.roles ?? []);
  const isAdmin = roles.includes('admin');
  const firstName = getFirstName(fullName, email);
  const canConfirmDeletion = deletionConfirmation.trim() === firstName;
  const acquiredProducts = useMemo(() => getMockAcquiredProducts(email), [email]);
  const deletionStatus = deletionRequest?.request?.status;
  const systemFlowEmailEnabled = communicationPreferences?.systemFlowEmailEnabled ?? true;
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
        <S.SaveBtn type="button" disabled={isSavingRole} onClick={() => void handleSaveProductRole(role)}>
          Salvar
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
    if (loadedAccountTokenRef.current === token) return;
    const requestId = accountLoadRequestIdRef.current + 1;
    accountLoadRequestIdRef.current = requestId;
    let active = true;
    const shouldApplyState = () => active && accountLoadRequestIdRef.current === requestId;

    async function load() {
      setLoadingProfile(true);
      setLoadingProductRoles(true);
      setProductRolesError('');

      try {
        const resp = await api.get<MeResponse>('/v1/auth/me', token);
        if (!shouldApplyState()) {
          return;
        }

        const nextName = resp.user?.fullName ?? resp.profile?.full_name ?? '';
        const nextRoles = resp.user?.roles ?? [];

        if (nextName) {
          setFullName(nextName);
        }

        setLoadedRoles(nextRoles);
      } catch {
        /* silently skip — name stays empty */
      } finally {
        if (shouldApplyState()) {
          setLoadingProfile(false);
        }
      }

      try {
        const productRolesResp = await withTimeout(
          api.get<ProductRolesResponse>('/v1/account/product-roles', token),
          PRODUCT_ROLES_LOAD_TIMEOUT_MS,
          'Product roles request timed out.'
        );
        if (!shouldApplyState()) {
          return;
        }

        setProductRoles(productRolesResp?.productRoles ?? []);
        setProductRolesError('');
      } catch {
        if (shouldApplyState()) {
          setProductRoles([]);
          setProductRolesError('Não foi possível carregar os dados de onboarding. Tente atualizar a página em instantes.');
        }
      } finally {
        if (shouldApplyState()) {
          setLoadingProductRoles(false);
          loadedAccountTokenRef.current = token;
        }
      }

      const [deletionResult, communicationPreferencesResult, accountConsentsResult] = await Promise.allSettled([
        api.get<CurrentAccountDeletionResponse>('/v1/account/deletion-request/current', token),
        fetchCommunicationPreferences(token),
        api.get<AccountConsentsResponse>('/v1/account/consents', token),
      ]);

      if (!shouldApplyState()) {
        return;
      }

      setDeletionRequest(deletionResult.status === 'fulfilled' ? deletionResult.value?.deletionRequest ?? null : null);
      setCommunicationPreferences(
        communicationPreferencesResult.status === 'fulfilled'
          ? communicationPreferencesResult.value?.preferences ?? null
          : null
      );
      setPrivacyConsents(accountConsentsResult.status === 'fulfilled' ? accountConsentsResult.value ?? null : null);
    }

    void load();
    return () => { active = false; };
  }, [session]);

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

  async function handleSaveProductRole(role: ProductRole) {
    if (!session || !role.id) {
      return;
    }

    setSavingProductRoleId(role.id);
    setSnackbar(null);

    try {
      let metadata = role.metadata;

      if (role.role === 'dentist') {
        const primaryLocation = getPrimaryPracticeLocation(metadata);
        const nextLocation = {
          ...primaryLocation,
          dentistName: getString(metadata.fullName) || primaryLocation.dentistName,
        };

        metadata = {
          ...metadata,
          practiceLocations: [nextLocation],
          practiceLocation: nextLocation,
        };
      }

      const response = await api.patch<{ productRole: ProductRole }>(
        `/v1/account/product-roles/${role.id}`,
        { metadata },
        session.access_token
      );

      setProductRoles((current) =>
        current.map((item) => (item.id === role.id ? response.productRole : item))
      );
      setEditingOnboardingFields((current) => {
        const rolePrefix = `${role.id}:`;
        return new Set([...current].filter((key) => !key.startsWith(rolePrefix)));
      });
      setSnackbar({
        tone: 'success',
        title: 'Onboarding atualizado',
        message: 'Os dados do produto foram salvos e refletirão nos fluxos operacionais.',
      });
    } catch {
      setSnackbar({
        tone: 'error',
        title: 'Falha ao salvar onboarding',
        message: 'Não foi possível salvar os dados do produto. Tente novamente.',
      });
    } finally {
      setSavingProductRoleId('');
    }
  }

  async function persistCommunicationPreferences(systemFlowEmailEnabled: boolean) {
    if (!session) {
      return;
    }

    setCommunicationPreferencesSaving(true);
    setSnackbar(null);

    try {
      const response = await updateCommunicationPreferences(session.access_token, { systemFlowEmailEnabled });
      setCommunicationPreferences(response.preferences);
      setDisableCommunicationModalOpen(false);
      setSnackbar({
        tone: 'success',
        title: 'Preferências atualizadas',
        message: 'Sua preferência de comunicação foi salva.',
      });
    } catch {
      setSnackbar({
        tone: 'error',
        title: 'Falha ao salvar preferências',
        message: 'Não foi possível atualizar sua preferência de comunicação. Tente novamente.',
      });
    } finally {
      setCommunicationPreferencesSaving(false);
    }
  }

  function handleCommunicationPreferenceChange(enabled: boolean) {
    if (enabled) {
      void persistCommunicationPreferences(true);
      return;
    }

    setDisableCommunicationModalOpen(true);
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
    if (!session) return;
    setSaving(true);
    setSnackbar(null);
    try {
      await api.patch(
        '/v1/auth/profile',
        {
          fullName: sanitizePersonName(fullName).trim(),
        },
        session.access_token
      );
      setSnackbar({
        tone: 'success',
        title: 'Alterações salvas',
        message: 'Os dados da sua conta foram atualizados.',
      });
    } catch {
      setSnackbar({
        tone: 'error',
        title: 'Falha ao salvar',
        message: 'Não foi possível salvar. Tente novamente.',
      });
    } finally {
      setSaving(false);
    }
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

  function closeDeletionModal() {
    if (deletionSubmitting) {
      return;
    }

    setDeletionModalOpen(false);
    setDeletionReason('');
    setDeletionReasonDetails('');
    setDeletionConfirmation('');
  }

  async function handleDeletionRequest() {
    if (!session || !canConfirmDeletion) {
      return;
    }

    setDeletionSubmitting(true);
    setSnackbar(null);

    try {
      const response = await api.post<AccountDeletionResponse>(
        '/v1/account/deletion-request',
        {
          confirmationFirstName: deletionConfirmation.trim(),
          ...(deletionReason ? { reason: deletionReason } : {}),
          reasonDetails: deletionReasonDetails.trim(),
        },
        session.access_token
      );
      setDeletionRequest(response);

      setSnackbar({
        tone: 'success',
        title: 'Solicitação registrada',
        message: response.message ?? 'Solicitação de exclusão registrada.',
      });
    } catch {
      setSnackbar({
        tone: 'error',
        title: 'Falha ao solicitar exclusão',
        message: 'Não foi possível registrar a solicitação de exclusão.',
      });
    } finally {
      setDeletionModalOpen(false);
      setDeletionReason('');
      setDeletionReasonDetails('');
      setDeletionConfirmation('');
      setDeletionSubmitting(false);
    }
  }

  async function handleForceAdminReview() {
    if (!session || deletionActionSubmitting) {
      return;
    }

    setDeletionActionSubmitting(true);
    setSnackbar(null);

    try {
      const response = await api.post<AccountDeletionResponse>(
        '/v1/account/deletion-request',
        {
          confirmationFirstName: firstName,
          forceAdminReview: true,
        },
        session.access_token
      );
      setDeletionRequest(response);
      setSnackbar({
        tone: 'success',
        title: 'Enviado para análise',
        message: response.message,
      });
    } catch {
      setSnackbar({
        tone: 'error',
        title: 'Falha ao enviar',
        message: 'Não foi possível enviar a solicitação para análise.',
      });
    } finally {
      setDeletionActionSubmitting(false);
    }
  }

  async function handleCancelDeletionRequest() {
    if (!session || !deletionRequest || deletionActionSubmitting) {
      return;
    }

    setDeletionActionSubmitting(true);
    setSnackbar(null);

    try {
      const response = await api.post<AccountDeletionResponse>(
        `/v1/account/deletion-request/${deletionRequest.request.id}/cancel`,
        {},
        session.access_token
      );
      setDeletionRequest(response);
      setSnackbar({
        tone: 'success',
        title: 'Remoção cancelada',
        message: response.message,
      });
    } catch {
      setSnackbar({
        tone: 'error',
        title: 'Falha ao cancelar',
        message: 'Não foi possível cancelar a solicitação de remoção.',
      });
    } finally {
      setDeletionActionSubmitting(false);
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
                <S.SaveBtn type="submit" disabled={saving}>Salvar</S.SaveBtn>
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
                  <S.PrivacyConsentStatus>Fluxos do sistema por e-mail</S.PrivacyConsentStatus>
                  <S.PrivacyConsentHint>Inclui lembretes de check-up, andamento de pedidos e comunicações operacionais da sua jornada. E-mails de segurança e autenticação continuam ativos.</S.PrivacyConsentHint>
                  <S.PreferenceSwitchLabel>
                    <S.PreferenceSwitchInput
                      type="checkbox"
                      checked={systemFlowEmailEnabled}
                      disabled={communicationPreferencesSaving}
                      onChange={(event) => handleCommunicationPreferenceChange(event.target.checked)}
                    />
                    <S.PreferenceSwitchText>Receber comunicações de fluxos do sistema por e-mail</S.PreferenceSwitchText>

                  </S.PreferenceSwitchLabel>
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
              const isSavingRole = Boolean(role.id && savingProductRoleId === role.id);
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
                          ? renderDentistOnboardingFields(role, metadata, primaryLocation, isSavingRole)
                          : role.role === 'customer'
                            ? renderCustomerOnboardingFields(metadata)
                            : role.role === 'partner'
                              ? renderPartnerOnboardingFields(role, metadata, isSavingRole)
                              : renderLabOnboardingFields(role, metadata, isSavingRole)}
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
          id="excluir-conta"
          variants={fadeSection}
          initial="hidden"
          animate="visible"
          transition={{ delay: 0.12 } as never}
        >
          <S.SectionTitle>Excluir conta</S.SectionTitle>
          <S.DangerCard>
            <S.SecurityContent>
              <S.SecurityTitle>
                {deletionStatus === 'rejected'
                  ? 'Remoção de conta rejeitada'
                  : deletionStatus === 'pending_admin_review'
                    ? 'Remoção em análise'
                    : deletionStatus === 'pending_confirmation'
                      ? 'Fluxos ativos encontrados'
                      : deletionStatus === 'cancelled_by_user'
                        ? 'Remoção cancelada'
                        : deletionStatus === 'approved_direct' ||
                          deletionStatus === 'approved_processing_privacy'
                          ? 'Remoção aprovada'
                          : 'Solicitar exclusão da conta'}
              </S.SecurityTitle>
              <S.SecurityText>
                {deletionRequest?.message ??
                  'Por segurança, a exclusão pode ficar pendente quando houver ordens em andamento vinculadas à conta.'}
              </S.SecurityText>
              {deletionStatus === 'pending_confirmation' ? (
                <S.DeletionStatusNotice role="status" aria-label="Status da remoção">
                  <S.DeletionStatusTitle>Status alterado</S.DeletionStatusTitle>
                  <S.DeletionStatusMessage>
                    {deletionRequest?.message ??
                      'Encontramos fluxos ativos vinculados à sua conta. Para continuar, envie a solicitação para análise da Nexor.'}
                  </S.DeletionStatusMessage>
                </S.DeletionStatusNotice>
              ) : null}
            </S.SecurityContent>
            <S.FormActions>
              {deletionStatus === 'pending_confirmation' ? (
                <>
                  <S.DangerButton
                    type="button"
                    disabled={deletionActionSubmitting}
                    onClick={handleForceAdminReview}
                  >
                    Enviar para análise da Nexor
                  </S.DangerButton>
                  <S.CancelButton
                    type="button"
                    disabled={deletionActionSubmitting}
                    onClick={handleCancelDeletionRequest}
                  >
                    Cancelar remoção
                  </S.CancelButton>
                </>
              ) : deletionStatus === 'pending_admin_review' ? (
                <S.CancelButton
                  type="button"
                  disabled={deletionActionSubmitting}
                  onClick={handleCancelDeletionRequest}
                >
                  Cancelar remoção
                </S.CancelButton>
              ) : deletionStatus === 'rejected' && deletionRequest?.request ? (
                <S.CancelButton as="a" href={`mailto:suporte@nexor.com.br?subject=Remoção de conta ${deletionRequest.request.id}`}>
                  Entrar em contato
                </S.CancelButton>
              ) : deletionStatus === 'approved_direct' ||
                deletionStatus === 'approved_processing_privacy' ||
                deletionStatus === 'completed' ? null : (
                <S.DangerButton type="button" onClick={() => setDeletionModalOpen(true)}>
                  Excluir conta
                </S.DangerButton>
              )}
            </S.FormActions>
          </S.DangerCard>
        </S.Section>
      ) : null}

      {deletionModalOpen ? (
        <S.ModalOverlay role="presentation">
          <S.Modal role="dialog" aria-modal="true" aria-labelledby="delete-account-title">
            <S.ModalHeader>
              <div>
                <S.ModalTitle id="delete-account-title">Confirmar exclusão da conta</S.ModalTitle>
                <S.SecurityText>
                  Para continuar, digite <strong>{firstName}</strong>. O motivo é opcional.
                </S.SecurityText>
              </div>
            </S.ModalHeader>
            <S.ModalBody>
              <S.Field>
                <S.FieldLabel id="account-deletion-reason-label">Motivo da exclusão</S.FieldLabel>
                <S.ReasonChips role="group" aria-labelledby="account-deletion-reason-label">
                  {deletionReasonOptions.map((option) => (
                    <S.ReasonChip
                      key={option.value || 'empty'}
                      type="button"
                      $active={deletionReason === option.value}
                      aria-pressed={deletionReason === option.value}
                      onClick={() => setDeletionReason(option.value)}
                    >
                      {option.label}
                    </S.ReasonChip>
                  ))}
                </S.ReasonChips>
              </S.Field>
              {deletionReason === 'other' ? (
                <S.Field as="label">
                  <S.FieldLabel>Descreva o motivo</S.FieldLabel>
                  <S.TextArea
                    aria-label="Descreva o motivo"
                    value={deletionReasonDetails}
                    maxLength={500}
                    onChange={(event) => setDeletionReasonDetails(event.target.value)}
                  />
                </S.Field>
              ) : null}
              <DesignSystemField
                type="text"
                label={<>Digite <strong>{firstName}</strong> para confirmar</>}
                aria-label={`Digite ${firstName} para confirmar`}
                value={deletionConfirmation}
                onChange={(event) => setDeletionConfirmation(event.target.value)}
              />
            </S.ModalBody>
            <S.ModalActions>
              <S.CancelButton type="button" onClick={closeDeletionModal}>
                Cancelar
              </S.CancelButton>
              <S.DangerButton type="button" disabled={!canConfirmDeletion || deletionSubmitting} onClick={handleDeletionRequest}>
                {deletionSubmitting ? 'Enviando...' : 'Confirmar exclusão'}
              </S.DangerButton>
            </S.ModalActions>
          </S.Modal>
        </S.ModalOverlay>
      ) : null}

      {disableCommunicationModalOpen ? (
        <S.ModalOverlay role="presentation">
          <S.Modal role="dialog" aria-modal="true" aria-labelledby="disable-communication-title">
            <S.ModalHeader>
              <div>
                <S.ModalTitle id="disable-communication-title">Desativar e-mails de fluxo?</S.ModalTitle>
                <S.SecurityText>
                  Você deixará de receber lembretes operacionais, como os avisos de check-up. E-mails de segurança e autenticação continuam ativos.
                </S.SecurityText>
              </div>
            </S.ModalHeader>
            <S.ModalActions>
              <S.CancelButton type="button" disabled={communicationPreferencesSaving} onClick={() => setDisableCommunicationModalOpen(false)}>
                Cancelar
              </S.CancelButton>
              <S.DangerButton
                type="button"
                disabled={communicationPreferencesSaving}
                onClick={() => void persistCommunicationPreferences(false)}
              >
                {communicationPreferencesSaving ? 'Salvando...' : 'Desativar e-mails'}
              </S.DangerButton>
            </S.ModalActions>
          </S.Modal>
        </S.ModalOverlay>
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
