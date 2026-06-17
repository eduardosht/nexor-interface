import { useEffect, useMemo, useState } from 'react';
import {
  AdminDataTable,
  AdminMetricGrid,
  AdminModal,
  AdminModalAction,
  AdminModalActions,
  AdminModalDetailCard,
  AdminModalDetailContent,
  AdminModalDetailGrid,
  AdminModalDetailIcon,
  AdminModalDetailLabel,
  AdminModalDetailValue,
  AdminModalTextArea,
  AdminModalTextAreaGroup,
  AdminModalTextAreaLabel,
  AdminStatusPill,
  Button,
  Field,
  FilterSheet,
  ResponsiveDataList,
  Select,
  type AdminDataTableColumn,
  type AdminMetric,
} from '@nexor/design-system';
import { PencilLine, UserRound } from 'lucide-react';
import styled from 'styled-components';
import { SkeletonGrid } from '../../../components/Skeleton';
import { useAdminPortal } from '../../../features/admin/portal';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import { AdminProductGate } from './AdminProductGate';
import { PageHeader, PageStack, PageSubtitle, PageTitle } from './styles';
import {
  AdminMobileActionButton,
  AdminMobileActions,
  AdminMobileCard,
  AdminMobileCardHeader,
  AdminMobileCardSubtitle,
  AdminMobileCardTitle,
  AdminMobileMetaGrid,
  AdminMobileMetaItem,
  AdminMobileMetaLabel,
  AdminMobileMetaValue,
  AdminMobileOnly,
} from './mobileCards';

type AdminProfileStatus = 'pending' | 'active' | 'inactive' | 'suspended' | 'blocked';

type AdminProfile = {
  id: string;
  email: string | null;
  fullName: string | null;
  phone: string | null;
  status: AdminProfileStatus;
  roles: string[];
  createdAt: string | null;
  updatedAt: string | null;
};

type ProfilesResponse = {
  profiles: AdminProfile[];
};

const profileOptions = [
  { value: '', label: 'Todos os perfis' },
  { value: 'customer', label: 'Cliente' },
  { value: 'dentist', label: 'Dentista' },
  { value: 'partner', label: 'Parceiro' },
  { value: 'lab', label: 'Laboratório' },
  { value: 'admin', label: 'Admin' },
  { value: 'user', label: 'Usuário' },
];

const statusOptions: Array<{ value: AdminProfileStatus; label: string }> = [
  { value: 'active', label: 'Ativo' },
  { value: 'pending', label: 'Pendente' },
  { value: 'inactive', label: 'Inativo' },
  { value: 'suspended', label: 'Suspenso' },
  { value: 'blocked', label: 'Bloqueado' },
];

const statusLabel: Record<AdminProfileStatus, string> = {
  active: 'Ativo',
  pending: 'Pendente',
  inactive: 'Inativo',
  suspended: 'Suspenso',
  blocked: 'Bloqueado',
};

const statusColor: Record<AdminProfileStatus, string> = {
  active: '#15803d',
  pending: '#d18a00',
  inactive: '#64748b',
  suspended: '#b45309',
  blocked: '#b91c1c',
};

const roleLabel: Record<string, string> = {
  customer: 'Cliente',
  dentist: 'Dentista',
  partner: 'Parceiro',
  lab: 'Laboratório',
  admin: 'Admin',
  user: 'Usuário',
};

const roleColor: Record<string, string> = {
  customer: '#2563eb',
  dentist: '#15803d',
  partner: '#ea580c',
  lab: '#7c3aed',
  admin: '#0f172a',
  user: '#64748b',
};

function formatDateTime(value: string | null | undefined) {
  if (!value) return 'Não informado';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function getPrimaryRole(profile: AdminProfile) {
  return profile.roles[0] ?? 'user';
}

function getProfileName(profile: AdminProfile) {
  return profile.fullName?.trim() || profile.email || 'Usuário sem nome';
}

export function AdminUsers() {
  const { selectedProduct } = useAdminPortal();
  const { session } = useAuth();
  const token = session?.access_token;
  const [profiles, setProfiles] = useState<AdminProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [profile, setProfile] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<AdminProfile | null>(null);
  const [nextStatus, setNextStatus] = useState<AdminProfileStatus>('active');
  const [statusReason, setStatusReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [draftProfile, setDraftProfile] = useState('');

  async function loadProfiles() {
    if (!selectedProduct || !token) return;

    setLoading(true);
    setError('');

    try {
      const params = new URLSearchParams({ limit: '200' });
      if (profile) params.set('role', profile);
      if (search.trim()) params.set('search', search.trim());
      const response = await api.get<ProfilesResponse>(`/v1/admin/profiles?${params.toString()}`, token);
      setProfiles(response.profiles);
    } catch {
      setError('Não foi possível carregar os usuários pelo backend.');
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadProfiles();
  }, [selectedProduct, token, profile, search]);

  const metrics = useMemo<AdminMetric[]>(
    () => [
      { label: 'Total de usuários', value: profiles.length, tone: 'success' },
      { label: 'Clientes', value: profiles.filter((item) => item.roles.includes('customer')).length, tone: 'success' },
      { label: 'Dentistas', value: profiles.filter((item) => item.roles.includes('dentist')).length, tone: 'success' },
      { label: 'Laboratórios', value: profiles.filter((item) => item.roles.includes('lab')).length, tone: 'success' },
    ],
    [profiles]
  );

  const columns = useMemo<AdminDataTableColumn<AdminProfile>[]>(
    () => [
      { key: 'id', label: 'ID', width: '120px', render: (row) => row.id.slice(0, 8), sortValue: (row) => row.id },
      { key: 'name', label: 'Nome', render: (row) => getProfileName(row), sortValue: (row) => getProfileName(row) },
      { key: 'email', label: 'E-mail', render: (row) => row.email || 'Não informado', sortValue: (row) => row.email ?? '' },
      {
        key: 'profile',
        label: 'Perfil',
        render: (row) => {
          const role = getPrimaryRole(row);
          return <AdminStatusPill color={roleColor[role] ?? roleColor.user} label={roleLabel[role] ?? role} />;
        },
        sortValue: (row) => roleLabel[getPrimaryRole(row)] ?? getPrimaryRole(row),
      },
      {
        key: 'status',
        label: 'Status',
        render: (row) => <AdminStatusPill color={statusColor[row.status]} label={statusLabel[row.status]} />,
        sortValue: (row) => statusLabel[row.status],
      },
      { key: 'createdAt', label: 'Cadastro', render: (row) => formatDateTime(row.createdAt), sortValue: (row) => row.createdAt ?? '' },
      { key: 'updatedAt', label: 'Atualizado em', render: (row) => formatDateTime(row.updatedAt), sortValue: (row) => row.updatedAt ?? '' },
      {
        key: 'actions',
        label: 'Ações',
        width: '120px',
        align: 'center',
        render: (row) => (
          <ViewButton
            type="button"
            aria-label={`Editar usuário ${getProfileName(row)}`}
            onClick={() => {
              setSelectedProfile(row);
              setNextStatus(row.status);
              setStatusReason('');
            }}
          >
            <PencilLine size={15} aria-hidden />
          </ViewButton>
        ),
      },
    ],
    []
  );

  async function handleSaveStatus() {
    if (!selectedProfile || !token || !statusReason.trim()) return;

    setSaving(true);
    setError('');

    try {
      await api.patch(`/v1/admin/profiles/${selectedProfile.id}/status`, {
        status: nextStatus,
        reason: statusReason.trim(),
      }, token);
      setSelectedProfile(null);
      setStatusReason('');
      await loadProfiles();
    } catch {
      setError('Não foi possível atualizar o status do usuário.');
    } finally {
      setSaving(false);
    }
  }

  function openMobileFilters() {
    setDraftProfile(profile);
    setMobileFiltersOpen(true);
  }

  function closeMobileFilters() {
    setDraftProfile(profile);
    setMobileFiltersOpen(false);
  }

  function clearMobileFilters() {
    setDraftProfile('');
  }

  function applyMobileFilters() {
    setProfile(draftProfile);
    setMobileFiltersOpen(false);
  }

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>Usuários do sistema</PageTitle>
        <PageSubtitle>
          {selectedProduct
            ? `Gerencie usuários, papéis e status operacionais do ${selectedProduct.label}.`
            : 'Selecione um produto para visualizar a base de usuários.'}
        </PageSubtitle>
      </PageHeader>

      <AdminProductGate />

      {selectedProduct ? (
        <>
          {loading ? <SkeletonGrid cards={4} minCardWidth="180px" /> : <AdminMetricGrid metrics={metrics} columns={4} />}

          {error ? <Feedback role="alert">{error}</Feedback> : null}

          <AdminMobileOnly>
            <Field
              as="input"
              label="Buscar"
              placeholder="Nome, e-mail ou ID"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <Button type="button" variant="secondary" onClick={openMobileFilters}>
              Abrir filtros de usuários
            </Button>
          </AdminMobileOnly>
          <ResponsiveDataList
            desktop={
              <AdminDataTable
                data={profiles}
                columns={columns}
                keyExtractor={(row) => row.id}
                searchLabel="Buscar"
                searchPlaceholder="Buscar por nome, e-mail ou ID..."
                searchValue={search}
                onSearchChange={setSearch}
                pageSize={6}
                emptyMessage="Nenhum usuário encontrado para os filtros aplicados."
                actions={
                  <FilterWrap>
                    <Select
                      label="Perfil"
                      value={profile}
                      placeholder="Todos os perfis"
                      onChange={setProfile}
                      options={profileOptions}
                    />
                  </FilterWrap>
                }
                testId="admin-users-table"
              />
            }
            data={profiles}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhum usuário encontrado para os filtros aplicados."
            mobileTestId="admin-users-mobile-list"
            renderCard={(row) => {
              const role = getPrimaryRole(row);
              return (
                <AdminMobileCard>
                  <AdminMobileCardHeader>
                    <div>
                      <AdminMobileCardTitle>{getProfileName(row)}</AdminMobileCardTitle>
                      <AdminMobileCardSubtitle>{row.email || 'E-mail não informado'}</AdminMobileCardSubtitle>
                    </div>
                    <AdminStatusPill color={statusColor[row.status]} label={statusLabel[row.status]} />
                  </AdminMobileCardHeader>
                  <AdminMobileMetaGrid>
                    <AdminMobileMetaItem>
                      <AdminMobileMetaLabel>Perfil</AdminMobileMetaLabel>
                      <AdminMobileMetaValue>{roleLabel[role] ?? role}</AdminMobileMetaValue>
                    </AdminMobileMetaItem>
                    <AdminMobileMetaItem>
                      <AdminMobileMetaLabel>Cadastro</AdminMobileMetaLabel>
                      <AdminMobileMetaValue>{formatDateTime(row.createdAt)}</AdminMobileMetaValue>
                    </AdminMobileMetaItem>
                    <AdminMobileMetaItem>
                      <AdminMobileMetaLabel>Telefone</AdminMobileMetaLabel>
                      <AdminMobileMetaValue>{row.phone || 'Não informado'}</AdminMobileMetaValue>
                    </AdminMobileMetaItem>
                    <AdminMobileMetaItem>
                      <AdminMobileMetaLabel>Atualizado</AdminMobileMetaLabel>
                      <AdminMobileMetaValue>{formatDateTime(row.updatedAt)}</AdminMobileMetaValue>
                    </AdminMobileMetaItem>
                  </AdminMobileMetaGrid>
                  <AdminMobileActions>
                    <AdminMobileActionButton
                      type="button"
                      aria-label={`Editar usuário ${getProfileName(row)}`}
                      onClick={() => {
                        setSelectedProfile(row);
                        setNextStatus(row.status);
                        setStatusReason('');
                      }}
                    >
                      Editar usuário
                    </AdminMobileActionButton>
                  </AdminMobileActions>
                </AdminMobileCard>
              );
            }}
          />

          <FilterSheet
            open={mobileFiltersOpen}
            title="Filtros de usuários"
            onClose={closeMobileFilters}
            onClear={clearMobileFilters}
            onApply={applyMobileFilters}
          >
            <FilterWrap>
              <Select
                label="Perfil"
                value={draftProfile}
                placeholder="Todos os perfis"
                onChange={setDraftProfile}
                options={profileOptions}
              />
            </FilterWrap>
          </FilterSheet>
        </>
      ) : null}

      <AdminModal
        open={Boolean(selectedProfile)}
        title="Editar usuário"
        ariaLabel="Editar usuário"
        icon={<UserRound size={32} />}
        subtitle={selectedProfile ? getProfileName(selectedProfile) : null}
        onClose={() => setSelectedProfile(null)}
        footer={
          selectedProfile ? (
            <AdminModalActions>
              <AdminModalAction type="button" onClick={() => setSelectedProfile(null)}>
                Cancelar
              </AdminModalAction>
              <AdminModalAction type="button" disabled={saving || !statusReason.trim()} onClick={handleSaveStatus}>
                {saving ? 'Salvando...' : 'Salvar alterações'}
              </AdminModalAction>
            </AdminModalActions>
          ) : null
        }
      >
        {selectedProfile ? (
          <>
            <AdminModalDetailGrid>
              <AdminModalDetailCard>
                <AdminModalDetailIcon aria-hidden>
                  <UserRound size={24} />
                </AdminModalDetailIcon>
                <AdminModalDetailContent>
                  <AdminModalDetailLabel>Contato</AdminModalDetailLabel>
                  <AdminModalDetailValue>{selectedProfile.email || 'Não informado'}</AdminModalDetailValue>
                  <AdminModalDetailValue>{selectedProfile.phone || 'Telefone não informado'}</AdminModalDetailValue>
                </AdminModalDetailContent>
              </AdminModalDetailCard>
              <AdminModalDetailCard>
                <AdminModalDetailIcon aria-hidden>
                  <UserRound size={24} />
                </AdminModalDetailIcon>
                <AdminModalDetailContent>
                  <AdminModalDetailLabel>Status atual</AdminModalDetailLabel>
                  <AdminStatusPill color={statusColor[selectedProfile.status]} label={statusLabel[selectedProfile.status]} />
                </AdminModalDetailContent>
              </AdminModalDetailCard>
            </AdminModalDetailGrid>

            <FilterWrap>
              <Select
                label="Novo status"
                value={nextStatus}
                onChange={(value) => setNextStatus(value as AdminProfileStatus)}
                options={statusOptions}
              />
            </FilterWrap>

            <AdminModalTextAreaGroup>
              <AdminModalTextAreaLabel htmlFor="admin-user-status-reason">Motivo da alteração</AdminModalTextAreaLabel>
              <AdminModalTextArea
                id="admin-user-status-reason"
                placeholder="Informe o motivo administrativo para auditoria."
                value={statusReason}
                onChange={(event) => setStatusReason(event.target.value)}
              />
            </AdminModalTextAreaGroup>
          </>
        ) : null}
      </AdminModal>
    </PageStack>
  );
}

const FilterWrap = styled.div`
  width: 220px;
  max-width: 100%;
`;

const Feedback = styled.p`
  margin: 0;
  padding: 14px 16px;
  border: 1px solid rgba(185, 28, 28, 0.18);
  border-radius: 8px;
  color: #b91c1c;
  background: rgba(185, 28, 28, 0.06);
  font-size: 14px;
`;

const ViewButton = styled(Button).attrs({ variant: 'ghost' as const, size: 'sm' as const })`
  width: 38px;
  min-width: 38px;
  height: 38px;
  min-height: 38px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.bgElevated};
`;
