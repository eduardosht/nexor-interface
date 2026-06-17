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
  AdminModalDetailLabel,
  AdminModalDetailValue,
  AdminModalTextArea,
  AdminModalTextAreaGroup,
  AdminModalTextAreaLabel,
  AdminStatusPill,
  Button,
  ResponsiveDataList,
  type AdminDataTableColumn,
  type AdminMetric,
} from '@nexor/design-system';
import { Eye, ShieldAlert } from 'lucide-react';
import styled from 'styled-components';
import { SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
import { useAdminPortal } from '../../../features/admin/portal';
import { AdminProductGate } from './AdminProductGate';
import { PageHeader, PageStack, PageSubtitle, PageTitle, TableSection } from './styles';
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
} from './mobileCards';

type AccountDeletionStatus =
  | 'pending_confirmation'
  | 'pending_admin_review'
  | 'cancelled_by_user'
  | 'rejected'
  | 'approved_direct'
  | 'approved_processing_privacy'
  | 'completed';

type AccountDeletionRequest = {
  id: string;
  status: AccountDeletionStatus;
  reason: string | null;
  reason_details: string | null;
  active_order_ids: string[];
  requested_at: string;
  admin_decision_note: string | null;
  profile?: {
    email?: string | null;
    full_name?: string | null;
    status?: string | null;
  } | null;
};

type AccountDeletionListResponse = {
  requests: AccountDeletionRequest[];
};

const statusLabels: Record<AccountDeletionStatus, string> = {
  pending_confirmation: 'Aguardando confirmação',
  pending_admin_review: 'Análise Nexor',
  cancelled_by_user: 'Cliente cancelou',
  rejected: 'Rejeitada',
  approved_direct: 'Aprovada direta',
  approved_processing_privacy: 'Aprovada',
  completed: 'Concluída',
};

function getStatusColor(status: AccountDeletionStatus) {
  if (status === 'pending_admin_review') return '#d18a00';
  if (status === 'rejected') return '#b91c1c';
  if (status === 'cancelled_by_user') return '#525252';
  if (status === 'approved_direct' || status === 'approved_processing_privacy' || status === 'completed') return '#15803d';
  return '#2563eb';
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));
}

function getToken(session: unknown) {
  return typeof session === 'object' && session !== null && 'access_token' in session
    ? String((session as { access_token?: unknown }).access_token ?? '')
    : '';
}

export function AdminAccountDeletions() {
  const { selectedProduct } = useAdminPortal();
  const { session } = useAuth();
  const token = getToken(session);
  const [requests, setRequests] = useState<AccountDeletionRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<AccountDeletionRequest | null>(null);
  const [decisionNote, setDecisionNote] = useState('');
  const [activeAction, setActiveAction] = useState('');

  async function loadRequests() {
    if (!selectedProduct || !token) return;
    setLoading(true);
    try {
      const response = await api.get<AccountDeletionListResponse>('/v1/admin/account-deletion-requests', token);
      setRequests(response.requests);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, [selectedProduct, token]);

  const metrics = useMemo<AdminMetric[]>(
    () => [
      { label: 'Em análise', value: requests.filter((item) => item.status === 'pending_admin_review').length, tone: 'success' },
      { label: 'Cliente cancelou', value: requests.filter((item) => item.status === 'cancelled_by_user').length, tone: 'neutral' },
      { label: 'Aprovadas', value: requests.filter((item) => item.status === 'approved_processing_privacy' || item.status === 'approved_direct').length, tone: 'success' },
      { label: 'Rejeitadas', value: requests.filter((item) => item.status === 'rejected').length, tone: 'danger' },
    ],
    [requests]
  );

  async function decide(action: 'approve' | 'reject') {
    if (!selectedRequest || !token || !decisionNote.trim()) return;
    setActiveAction(action);
    try {
      await api.post(
        `/v1/admin/account-deletion-requests/${selectedRequest.id}/${action}`,
        { adminDecisionNote: decisionNote.trim() },
        token
      );
      setSelectedRequest(null);
      setDecisionNote('');
      await loadRequests();
    } finally {
      setActiveAction('');
    }
  }

  const columns = useMemo<AdminDataTableColumn<AccountDeletionRequest>[]>(
    () => [
      {
        key: 'profile',
        label: 'Conta',
        sortValue: (row) => row.profile?.full_name ?? row.profile?.email ?? '',
        render: (row) => (
          <AccountCell>
            <strong>{row.profile?.full_name ?? 'Conta sem nome'}</strong>
            <span>{row.profile?.email ?? 'E-mail não informado'}</span>
          </AccountCell>
        ),
      },
      {
        key: 'status',
        label: 'Status',
        sortValue: (row) => statusLabels[row.status],
        render: (row) => <AdminStatusPill color={getStatusColor(row.status)} label={statusLabels[row.status]} />,
      },
      {
        key: 'orders',
        label: 'Ordens afetadas',
        sortValue: (row) => row.active_order_ids.length,
        render: (row) => String(row.active_order_ids.length),
      },
      {
        key: 'requested',
        label: 'Solicitado em',
        sortValue: (row) => new Date(row.requested_at).getTime(),
        render: (row) => formatDate(row.requested_at),
      },
      {
        key: 'actions',
        label: 'Visualizar',
        align: 'center',
        render: (row) => (
          <ViewButton
            type="button"
            aria-label={`Visualizar remoção de ${row.profile?.full_name ?? row.id}`}
            onClick={() => {
              setSelectedRequest(row);
              setDecisionNote('');
            }}
          >
            <Eye size={18} aria-hidden />
          </ViewButton>
        ),
      },
    ],
    []
  );

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>Remoções de conta</PageTitle>
        <PageSubtitle>
          Avalie solicitações que podem interromper ordens, suspender perfis operacionais e bloquear novos fluxos.
        </PageSubtitle>
      </PageHeader>

      {!selectedProduct ? <AdminProductGate /> : null}
      {selectedProduct ? (
        <>
          <AdminMetricGrid metrics={metrics} />
          <TableSection>
            {loading ? (
              <SkeletonGrid cards={4} />
            ) : (
              <ResponsiveDataList
                desktop={
                  <AdminDataTable
                    data={requests}
                    columns={columns}
                    keyExtractor={(row) => row.id}
                    emptyMessage="Nenhuma solicitação de remoção encontrada."
                    testId="admin-account-deletions-table"
                  />
                }
                data={requests}
                keyExtractor={(row) => row.id}
                emptyMessage="Nenhuma solicitação de remoção encontrada."
                mobileTestId="admin-account-deletions-mobile-list"
                renderCard={(row) => (
                  <AdminMobileCard>
                    <AdminMobileCardHeader>
                      <div>
                        <AdminMobileCardTitle>{row.profile?.full_name ?? 'Conta sem nome'}</AdminMobileCardTitle>
                        <AdminMobileCardSubtitle>{row.profile?.email ?? 'E-mail não informado'}</AdminMobileCardSubtitle>
                      </div>
                      <AdminStatusPill color={getStatusColor(row.status)} label={statusLabels[row.status]} />
                    </AdminMobileCardHeader>
                    <AdminMobileMetaGrid>
                      <AdminMobileMetaItem>
                        <AdminMobileMetaLabel>Ordens afetadas</AdminMobileMetaLabel>
                        <AdminMobileMetaValue>{row.active_order_ids.length}</AdminMobileMetaValue>
                      </AdminMobileMetaItem>
                      <AdminMobileMetaItem>
                        <AdminMobileMetaLabel>Solicitado em</AdminMobileMetaLabel>
                        <AdminMobileMetaValue>{formatDate(row.requested_at)}</AdminMobileMetaValue>
                      </AdminMobileMetaItem>
                    </AdminMobileMetaGrid>
                    <AdminMobileActions>
                      <AdminMobileActionButton
                        type="button"
                        aria-label={`Abrir análise de remoção de ${row.profile?.full_name ?? row.id}`}
                        onClick={() => {
                          setSelectedRequest(row);
                          setDecisionNote('');
                        }}
                      >
                        Analisar remoção
                      </AdminMobileActionButton>
                    </AdminMobileActions>
                  </AdminMobileCard>
                )}
              />
            )}
          </TableSection>
        </>
      ) : null}

      <AdminModal
        open={Boolean(selectedRequest)}
        title="Análise de remoção"
        ariaLabel="Análise de remoção de conta"
        icon={<ShieldAlert size={32} />}
        subtitle="A aprovação bloqueia a conta e interrompe ordens ativas sem gerar ressarcimento automático."
        onClose={() => setSelectedRequest(null)}
        footer={
          selectedRequest?.status === 'pending_admin_review' ? (
            <AdminModalActions>
              <AdminModalAction
                type="button"
                actionTone="attention"
                disabled={activeAction === 'reject' || !decisionNote.trim()}
                onClick={() => void decide('reject')}
              >
                Rejeitar remoção
              </AdminModalAction>
              <AdminModalAction
                type="button"
                disabled={activeAction === 'approve' || !decisionNote.trim()}
                onClick={() => void decide('approve')}
              >
                Aprovar remoção
              </AdminModalAction>
            </AdminModalActions>
          ) : selectedRequest ? (
            <AdminModalActions>
              <Button type="button" variant="secondary" onClick={() => setSelectedRequest(null)}>
                Fechar
              </Button>
            </AdminModalActions>
          ) : null
        }
      >
        {selectedRequest ? (
          <>
            <AdminModalDetailGrid>
            <AdminModalDetailCard>
              <AdminModalDetailContent>
                <AdminModalDetailLabel>Conta</AdminModalDetailLabel>
                <AdminModalDetailValue>{selectedRequest.profile?.full_name ?? selectedRequest.profile?.email ?? selectedRequest.id}</AdminModalDetailValue>
              </AdminModalDetailContent>
            </AdminModalDetailCard>
            <AdminModalDetailCard>
              <AdminModalDetailContent>
                <AdminModalDetailLabel>Status</AdminModalDetailLabel>
                <AdminModalDetailValue>{statusLabels[selectedRequest.status]}</AdminModalDetailValue>
              </AdminModalDetailContent>
            </AdminModalDetailCard>
            <AdminModalDetailCard>
              <AdminModalDetailContent>
                <AdminModalDetailLabel>Ordens afetadas</AdminModalDetailLabel>
                <AdminModalDetailValue>{selectedRequest.active_order_ids.length}</AdminModalDetailValue>
              </AdminModalDetailContent>
            </AdminModalDetailCard>
            <AdminModalDetailCard>
              <AdminModalDetailContent>
                <AdminModalDetailLabel>Observação atual</AdminModalDetailLabel>
                <AdminModalDetailValue>{selectedRequest.admin_decision_note ?? 'Sem decisão registrada'}</AdminModalDetailValue>
              </AdminModalDetailContent>
            </AdminModalDetailCard>
            </AdminModalDetailGrid>
            {selectedRequest.status === 'pending_admin_review' ? (
              <AdminModalTextAreaGroup>
                <AdminModalTextAreaLabel htmlFor="account-deletion-decision-note">Nota administrativa</AdminModalTextAreaLabel>
                <AdminModalTextArea
                  id="account-deletion-decision-note"
                  value={decisionNote}
                  onChange={(event) => setDecisionNote(event.target.value)}
                  placeholder="Registre a justificativa da decisão."
                />
              </AdminModalTextAreaGroup>
            ) : null}
          </>
        ) : null}
      </AdminModal>
    </PageStack>
  );
}

const AccountCell = styled.div`
  display: grid;
  gap: 2px;

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
  }
`;

const ViewButton = styled.button`
  width: 32px;
  height: 32px;
  display: inline-grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
`;
