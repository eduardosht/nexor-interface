import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { Pencil } from 'lucide-react';
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

const deletionReasonOptions = [
  { value: '', label: 'Prefiro não informar' },
  { value: 'privacy', label: 'Privacidade e LGPD' },
  { value: 'no_longer_uses', label: 'Não uso mais a Nexor' },
  { value: 'duplicate_account', label: 'Tenho outra conta' },
  { value: 'service_issue', label: 'Tive problema com o serviço' },
  { value: 'other', label: 'Outros' },
] as const;

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

async function fetchCepCoordinates(cep: string) {
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

  return Number.isFinite(lat) && Number.isFinite(lng) ? { lat, lng } : null;
}

export function MinhaConta() {
  const { session, backendUser, sendPasswordReset, hasConfiguredAuth, isMockMode } = useAuth();
  const [fullName, setFullName] = useState('');
  const [saving, setSaving] = useState(false);
  const [passwordSending, setPasswordSending] = useState(false);
  const [loadingProfile, setLoadingProfile] = useState(false);
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
  const [snackbar, setSnackbar] = useState<AccountSnackbar | null>(null);

  const email = backendUser?.email ?? session?.user.email ?? '—';
  const roles = loadedRoles.length > 0 ? loadedRoles : (backendUser?.roles ?? []);
  const isAdmin = roles.includes('admin');
  const firstName = getFirstName(fullName, email);
  const canConfirmDeletion = deletionConfirmation.trim() === firstName;
  const acquiredProducts = useMemo(() => getMockAcquiredProducts(email), [email]);
  const deletionStatus = deletionRequest?.request?.status;

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
    editor: ReactNode
  ) {
    const isEditing = isEditingOnboardingField(role, field);

    return (
      <S.Field>
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

  function renderLockedOnboardingField(label: string, value: string | boolean | undefined) {
    return (
      <S.Field>
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
          {renderOnboardingField(
            role,
            'documentType',
            'Tipo de documento',
            getString(metadata.documentType).toUpperCase(),
            <S.FieldSelect
              value={getString(metadata.documentType) || 'cnpj'}
              onChange={(event) => updateRoleMetadata(role.id, 'documentType', event.target.value)}
            >
              <option value="cpf">CPF</option>
              <option value="cnpj">CNPJ</option>
            </S.FieldSelect>
          )}
          {renderOnboardingField(
            role,
            'documentNumber',
            'Documento',
            getString(metadata.documentNumber),
            <S.FieldInput
              type="text"
              value={getString(metadata.documentNumber)}
              onChange={(event) => updateRoleMetadata(role.id, 'documentNumber', event.target.value)}
            />
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
          {renderOnboardingField(
            role,
            'cnpj',
            'CNPJ',
            getString(metadata.cnpj),
            <S.FieldInput
              type="text"
              value={getString(metadata.cnpj)}
              onChange={(event) => updateRoleMetadata(role.id, 'cnpj', event.target.value)}
            />
          )}
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

  function renderDentistOnboardingFields(
    role: ProductRole,
    metadata: Record<string, unknown>,
    primaryLocation: PracticeLocationMetadata,
    isSavingRole: boolean
  ) {
    return (
      <>
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
        </S.CardRow>
        {renderOnboardingField(
          role,
          'professionalSummary',
          'Resumo profissional',
          getString(metadata.professionalSummary),
          <S.TextArea
            value={getString(metadata.professionalSummary)}
            onChange={(event) => updateDentistMetadata(role.id, 'professionalSummary', event.target.value)}
          />
        )}
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
            'clinicCep',
            'CEP',
            primaryLocation.cep,
            <S.FieldInput
              type="text"
              value={primaryLocation.cep}
              onChange={(event) => updateDentistLocation(role.id, 'cep', event.target.value)}
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
        </S.CardRow>
        {renderOnboardingField(
          role,
          'clinicAddress',
          'Endereço da clínica',
          primaryLocation.address,
          <S.FieldInput
            type="text"
            value={primaryLocation.address}
            onChange={(event) => updateDentistLocation(role.id, 'address', event.target.value)}
          />
        )}
        <S.CardRow>
          {renderOnboardingField(
            role,
            'clinicCity',
            'Cidade',
            primaryLocation.city,
            <S.FieldInput
              type="text"
              value={primaryLocation.city}
              onChange={(event) => updateDentistLocation(role.id, 'city', event.target.value)}
            />
          )}
          {renderOnboardingField(
            role,
            'clinicState',
            'Estado',
            primaryLocation.state,
            <S.FieldInput
              type="text"
              value={primaryLocation.state}
              onChange={(event) => updateDentistLocation(role.id, 'state', event.target.value.toUpperCase().slice(0, 2))}
            />
          )}
        </S.CardRow>
        {renderOnboardingField(
          role,
          'clinicServiceHours',
          'Dia e horário de atendimento',
          primaryLocation.serviceHours,
          <S.FieldInput
            type="text"
            value={primaryLocation.serviceHours}
            onChange={(event) => updateDentistLocation(role.id, 'serviceHours', event.target.value)}
          />
        )}
        {renderOnboardingActions(role, isSavingRole)}
      </>
    );
  }

  useEffect(() => {
    if (!session) return;
    let active = true;

    async function load() {
      setLoadingProfile(true);
      try {
        const [resp, productRolesResp, deletionResp] = await Promise.all([
          api.get<MeResponse>('/v1/auth/me', session!.access_token),
          api.get<ProductRolesResponse>('/v1/account/product-roles', session!.access_token),
          api.get<CurrentAccountDeletionResponse>('/v1/account/deletion-request/current', session!.access_token),
        ]);
        if (!active) {
          return;
        }

        const nextName = resp.user?.fullName ?? resp.profile?.full_name ?? '';
        const nextRoles = resp.user?.roles ?? [];

        if (nextName) {
          setFullName(nextName);
        }

        setLoadedRoles(nextRoles);
        setProductRoles(productRolesResp?.productRoles ?? []);
        setDeletionRequest(deletionResp?.deletionRequest ?? null);
      } catch {
        /* silently skip — name stays empty */
      } finally {
        if (active) {
          setLoadingProfile(false);
        }
      }
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
        const coordinates = await fetchCepCoordinates(primaryLocation.cep).catch(() => null);
        const nextLocation = {
          ...primaryLocation,
          dentistName: getString(metadata.fullName) || primaryLocation.dentistName,
          ...(coordinates ? { coordinates } : {}),
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
                    <S.ProductBadge>{product.status}</S.ProductBadge>
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

      <S.Section
        variants={fadeSection}
        initial="hidden"
        animate="visible"
        transition={{ delay: 0.06 } as never}
      >
        <S.SectionTitle>Dados de onboarding</S.SectionTitle>
        {loadingProfile ? (
          <SkeletonCard lines={5} blockHeight="44px" />
        ) : productRoles.length > 0 ? (
          <S.OnboardingStack>
            {productRoles.map((role) => {
              const metadata = role.metadata ?? {};
              const primaryLocation = getPrimaryPracticeLocation(metadata);
              const isSavingRole = Boolean(role.id && savingProductRoleId === role.id);

              return (
                <S.Card key={role.id ?? `${role.productKey}:${role.role}`}>
                  <S.ProductContent>
                    <S.ProductHeader>
                      <S.ProductTitle>{getRoleLabel(role.role)}</S.ProductTitle>
                      <S.ProductBadge>{role.status}</S.ProductBadge>
                    </S.ProductHeader>
                    {role.role === 'dentist'
                      ? renderDentistOnboardingFields(role, metadata, primaryLocation, isSavingRole)
                      : role.role === 'partner'
                        ? renderPartnerOnboardingFields(role, metadata, isSavingRole)
                        : role.role === 'lab'
                          ? renderLabOnboardingFields(role, metadata, isSavingRole)
                          : (
                            <S.ProductText>
                              Dados de {getRoleLabel(role.role).toLowerCase()} cadastrados para o produto Biteplaner.
                            </S.ProductText>
                          )}
                  </S.ProductContent>
                </S.Card>
              );
            })}
          </S.OnboardingStack>
        ) : (
          <S.Card>
            <S.ProductContent>
              <S.ProductText>Nenhum onboarding de produto foi encontrado para esta conta.</S.ProductText>
            </S.ProductContent>
          </S.Card>
        )}
      </S.Section>

      <S.Section
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
