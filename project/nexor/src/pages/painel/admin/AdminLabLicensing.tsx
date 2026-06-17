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
  ResponsiveDataList,
  type AdminDataTableColumn,
  type AdminMetric,
} from '@nexor/design-system';
import { ClipboardList, Eye, FlaskConical, MapPin, RefreshCw } from 'lucide-react';
import styled from 'styled-components';
import { SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { useAdminPortal } from '../../../features/admin/portal';
import {
  approveLabLicenseRequest,
  fetchLabLicenseRequests,
  formatDate,
  getAuthToken,
  rejectLabLicenseRequest,
  type LabLicenseRequest,
} from '../../../features/demo/biteplanerFlow';
import { PageHeader, PageStack, PageSubtitle, PageTitle } from './styles';
import { AdminProductGate } from './AdminProductGate';
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

const statusLabel: Record<string, string> = {
  pending: 'Aguardando análise',
  active: 'Aprovado',
  rejected: 'Recusado',
  suspended: 'Suspenso',
};

const workflowLabel: Record<string, string> = {
  admin_review_pending: 'Aguardando análise',
  approved_pending_payment: 'Licenciado',
  payment_confirmed_pending_intention_contract: 'Pagamento confirmado',
  course_in_progress: 'Curso em andamento',
  licensing_contract_pending: 'Contrato final pendente',
  licensed: 'Licenciado',
  admin_rejected: 'Recusado',
  distrato_pending: 'Distrato pendente',
  distrato_signed: 'Distrato assinado',
};

function getStatusColor(status: string) {
  if (status === 'active' || status === 'licensed' || status === 'approved_pending_payment') return '#15803d';
  if (status === 'rejected' || status === 'admin_rejected') return '#b91c1c';
  return '#d18a00';
}

export function AdminLabLicensing() {
  const { selectedProduct } = useAdminPortal();
  const { session } = useAuth();
  const token = getAuthToken(session);
  const [requests, setRequests] = useState<LabLicenseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<LabLicenseRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeAction, setActiveAction] = useState('');

  async function loadRequests() {
    if (!selectedProduct || !token) return;
    setLoading(true);
    try {
      const response = await fetchLabLicenseRequests(token);
      setRequests(response.requests);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void loadRequests();
  }, [selectedProduct, token]);

  const filteredRequests = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return requests;
    return requests.filter((request) =>
      `${request.labName} ${request.cnpj} ${request.professionalSummary}`.toLowerCase().includes(query)
    );
  }, [requests, search]);

  const metrics = useMemo<AdminMetric[]>(
    () => [
      { label: 'Aguardando análise', value: requests.filter((item) => item.status === 'pending').length, tone: 'success' },
      { label: 'Aprovados', value: requests.filter((item) => item.status === 'active').length, tone: 'success' },
      { label: 'Recusados', value: requests.filter((item) => item.status === 'rejected').length, tone: 'danger' },
      {
        label: 'Licenciados',
        value: requests.filter(
          (item) => item.workflowStatus === 'licensed' || item.workflowStatus === 'approved_pending_payment'
        ).length,
        tone: 'success',
      },
    ],
    [requests]
  );

  async function handleApprove() {
    if (!selectedRequest || !token) return;
    setActiveAction('approve');
    try {
      await approveLabLicenseRequest(selectedRequest.id, token);
      setSelectedRequest(null);
      setRejectReason('');
      await loadRequests();
    } finally {
      setActiveAction('');
    }
  }

  async function handleReject() {
    if (!selectedRequest || !token || !rejectReason.trim()) return;
    setActiveAction('reject');
    try {
      await rejectLabLicenseRequest(selectedRequest.id, rejectReason.trim(), token);
      setSelectedRequest(null);
      setRejectReason('');
      await loadRequests();
    } finally {
      setActiveAction('');
    }
  }

  const columns = useMemo<AdminDataTableColumn<LabLicenseRequest>[]>(
    () => [
      { key: 'lab', label: 'Laboratório', width: '18%', sortValue: (row) => row.labName, render: (row) => row.labName || 'Não informado' },
      { key: 'cnpj', label: 'CNPJ', width: '16%', sortValue: (row) => row.cnpj, render: (row) => row.cnpj || 'Não informado' },
      { key: 'locations', label: 'Locais', width: '10%', sortValue: (row) => row.locations.length, render: (row) => String(row.locations.length) },
      {
        key: 'status',
        label: 'Status',
        width: '17%',
        sortValue: (row) => statusLabel[row.status] ?? row.status,
        render: (row) => <AdminStatusPill color={getStatusColor(row.status)} label={statusLabel[row.status] ?? row.status} />,
      },
      {
        key: 'workflow',
        label: 'Fluxo',
        width: '17%',
        sortValue: (row) => workflowLabel[row.workflowStatus] ?? row.workflowStatus,
        render: (row) => workflowLabel[row.workflowStatus] ?? row.workflowStatus,
      },
      { key: 'date', label: 'Enviado em', width: '14%', sortValue: (row) => new Date(row.submittedAt).getTime(), render: (row) => formatDate(row.submittedAt) },
      {
        key: 'actions',
        label: 'Visualizar',
        width: '10%',
        align: 'center',
        render: (row) => (
          <ViewButton
            type="button"
            aria-label={`Visualizar solicitação de ${row.labName}`}
            onClick={() => {
              setSelectedRequest(row);
              setRejectReason('');
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
        <PageTitle>Laboratórios querendo se licenciar</PageTitle>
        <PageSubtitle>
          Solicitações enviadas pelo cadastro do laboratório para análise da Nexor Admin antes da liberação operacional.
        </PageSubtitle>
      </PageHeader>

      <AdminProductGate />

      {selectedProduct ? (
        <>
          {loading ? <SkeletonGrid cards={4} minCardWidth="180px" /> : <AdminMetricGrid metrics={metrics} columns={4} />}
          <AdminMobileOnly>
            <Field
              as="input"
              label="Buscar"
              placeholder="Laboratório, CNPJ ou resumo"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </AdminMobileOnly>
          <ResponsiveDataList
            desktop={
              <AdminDataTable
                data={filteredRequests}
                columns={columns}
                keyExtractor={(row) => row.id}
                searchLabel="Buscar"
                searchPlaceholder="Buscar por laboratório, CNPJ ou resumo..."
                searchValue={search}
                onSearchChange={setSearch}
                emptyMessage="Nenhuma solicitação encontrada."
                testId="admin-lab-requests-table"
              />
            }
            data={filteredRequests}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma solicitação encontrada."
            mobileTestId="admin-lab-requests-mobile-list"
            renderCard={(row) => (
              <AdminMobileCard>
                <AdminMobileCardHeader>
                  <div>
                    <AdminMobileCardTitle>{row.labName || 'Não informado'}</AdminMobileCardTitle>
                    <AdminMobileCardSubtitle>{row.cnpj || 'CNPJ não informado'}</AdminMobileCardSubtitle>
                  </div>
                  <AdminStatusPill color={getStatusColor(row.status)} label={statusLabel[row.status] ?? row.status} />
                </AdminMobileCardHeader>
                <AdminMobileMetaGrid>
                  <AdminMobileMetaItem>
                    <AdminMobileMetaLabel>Locais</AdminMobileMetaLabel>
                    <AdminMobileMetaValue>{row.locations.length}</AdminMobileMetaValue>
                  </AdminMobileMetaItem>
                  <AdminMobileMetaItem>
                    <AdminMobileMetaLabel>Fluxo</AdminMobileMetaLabel>
                    <AdminMobileMetaValue>{workflowLabel[row.workflowStatus] ?? row.workflowStatus}</AdminMobileMetaValue>
                  </AdminMobileMetaItem>
                  <AdminMobileMetaItem>
                    <AdminMobileMetaLabel>Enviado em</AdminMobileMetaLabel>
                    <AdminMobileMetaValue>{formatDate(row.submittedAt)}</AdminMobileMetaValue>
                  </AdminMobileMetaItem>
                  <AdminMobileMetaItem>
                    <AdminMobileMetaLabel>Resumo</AdminMobileMetaLabel>
                    <AdminMobileMetaValue>{row.professionalSummary || 'Não informado'}</AdminMobileMetaValue>
                  </AdminMobileMetaItem>
                </AdminMobileMetaGrid>
                <AdminMobileActions>
                  <AdminMobileActionButton
                    type="button"
                    aria-label={`Abrir dados do laboratório ${row.labName}`}
                    onClick={() => {
                      setSelectedRequest(row);
                      setRejectReason('');
                    }}
                  >
                    Revisar solicitação
                  </AdminMobileActionButton>
                </AdminMobileActions>
              </AdminMobileCard>
            )}
          />
        </>
      ) : null}

      <AdminModal
        open={Boolean(selectedRequest)}
        title="Dados enviados pelo laboratório"
        ariaLabel="Dados enviados pelo laboratório"
        icon={<FlaskConical size={32} />}
        subtitle={selectedRequest ? `${selectedRequest.labName} • ${selectedRequest.cnpj}` : null}
        onClose={() => setSelectedRequest(null)}
        footer={
          selectedRequest ? (
            <AdminModalActions>
              <AdminModalAction
                type="button"
                actionTone="attention"
                disabled={activeAction === 'reject' || !rejectReason.trim() || selectedRequest.status !== 'pending'}
                onClick={handleReject}
              >
                {activeAction === 'reject' ? 'Recusando...' : 'Recusar cadastro'}
              </AdminModalAction>
              <AdminModalAction
                type="button"
                disabled={activeAction === 'approve' || selectedRequest.status !== 'pending'}
                onClick={handleApprove}
              >
                {activeAction === 'approve' ? 'Aprovando...' : 'Aprovar cadastro'}
              </AdminModalAction>
            </AdminModalActions>
          ) : null
        }
      >
        {selectedRequest ? (
          <>
            <AdminModalDetailGrid>
              <AdminModalDetailCard>
                <AdminModalDetailIcon aria-hidden>
                  <ClipboardList size={22} />
                </AdminModalDetailIcon>
                <AdminModalDetailContent>
                  <AdminModalDetailLabel>Resumo operacional</AdminModalDetailLabel>
                  <AdminModalDetailValue>{selectedRequest.professionalSummary || 'Não informado'}</AdminModalDetailValue>
                </AdminModalDetailContent>
              </AdminModalDetailCard>
              <AdminModalDetailCard>
                <AdminModalDetailIcon aria-hidden>
                  <RefreshCw size={22} />
                </AdminModalDetailIcon>
                <AdminModalDetailContent>
                  <AdminModalDetailLabel>Status do fluxo</AdminModalDetailLabel>
                  <AdminModalDetailValue>{workflowLabel[selectedRequest.workflowStatus] ?? selectedRequest.workflowStatus}</AdminModalDetailValue>
                  <AdminStatusPill color={getStatusColor(selectedRequest.status)} label={statusLabel[selectedRequest.status] ?? selectedRequest.status} />
                </AdminModalDetailContent>
              </AdminModalDetailCard>
            </AdminModalDetailGrid>

            {selectedRequest.locations.map((location) => (
              <AdminModalDetailCard key={`${location.name}:${location.cep}`}>
                <AdminModalDetailIcon aria-hidden>
                  <MapPin size={26} />
                </AdminModalDetailIcon>
                <AdminModalDetailContent>
                  <AdminModalDetailLabel>{location.name}</AdminModalDetailLabel>
                  <AdminModalDetailValue>{location.address}</AdminModalDetailValue>
                  <AdminModalDetailValue>
                    {location.city} {location.state ? `- ${location.state}` : ''} - {location.cep}
                  </AdminModalDetailValue>
                </AdminModalDetailContent>
              </AdminModalDetailCard>
            ))}

            <AdminModalTextAreaGroup>
              <AdminModalTextAreaLabel htmlFor="lab-reject-reason">Motivo da recusa</AdminModalTextAreaLabel>
              <AdminModalTextArea
                id="lab-reject-reason"
                placeholder="Obrigatório apenas para recusar."
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
              />
            </AdminModalTextAreaGroup>
          </>
        ) : null}
      </AdminModal>
    </PageStack>
  );
}

const ViewButton = styled(Button).attrs({ variant: 'ghost' as const, size: 'sm' as const })`
  width: 44px;
  min-width: 44px;
  height: 44px;
  min-height: 44px;
  padding: 0;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  display: inline-grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.bgElevated};
`;
