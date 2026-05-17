import { useEffect, useMemo, useState } from 'react';
import { Button, DataTable, Field, StatusIndicator, type DataTableColumn } from '@nexor/design-system';
import { Eye, X } from 'lucide-react';
import styled from 'styled-components';
import { SkeletonGrid, SkeletonTable } from '../../../components/Skeleton';
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
import {
  FilterBar,
  PageHeader,
  PageStack,
  PageSubtitle,
  PageTitle,
  StatCard,
  StatGrid,
  StatLabel,
  StatValue,
  TableSection,
} from './styles';
import { AdminProductGate } from './AdminProductGate';

const statusLabel: Record<string, string> = {
  pending: 'Aguardando análise',
  active: 'Aprovado',
  rejected: 'Recusado',
  suspended: 'Suspenso',
};

const workflowLabel: Record<string, string> = {
  admin_review_pending: 'Aguardando análise',
  approved_pending_payment: 'Aguardando pagamento',
  payment_confirmed_pending_intention_contract: 'Pagamento confirmado',
  course_in_progress: 'Curso em andamento',
  licensing_contract_pending: 'Contrato final pendente',
  licensed: 'Licenciado',
  admin_rejected: 'Recusado',
  distrato_pending: 'Distrato pendente',
  distrato_signed: 'Distrato assinado',
};

function getStatusColor(status: string) {
  if (status === 'active' || status === 'licensed') return '#15803D';
  if (status === 'rejected' || status === 'admin_rejected') return '#B91C1C';
  return '#D18A00';
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

  const stats = useMemo(
    () => [
      { label: 'Aguardando análise', value: String(requests.filter((item) => item.status === 'pending').length) },
      { label: 'Aprovados em onboarding', value: String(requests.filter((item) => item.status === 'active').length) },
      { label: 'Recusados', value: String(requests.filter((item) => item.status === 'rejected').length) },
      { label: 'Licenciados', value: String(requests.filter((item) => item.workflowStatus === 'licensed').length) },
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

  const columns: DataTableColumn<LabLicenseRequest>[] = [
    { key: 'name', label: 'Laboratório', render: (row) => row.labName || 'Não informado' },
    { key: 'cnpj', label: 'CNPJ', render: (row) => row.cnpj || 'Não informado' },
    { key: 'locations', label: 'Locais', render: (row) => String(row.locations.length) },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusIndicator color={getStatusColor(row.status)} label={statusLabel[row.status] ?? row.status} />,
    },
    { key: 'workflow', label: 'Fluxo', render: (row) => workflowLabel[row.workflowStatus] ?? row.workflowStatus },
    { key: 'date', label: 'Enviado em', render: (row) => formatDate(row.submittedAt) },
    {
      key: 'actions',
      label: 'Visualizar',
      render: (row) => (
        <IconButton
          type="button"
          aria-label={`Visualizar solicitação de ${row.labName}`}
          onClick={() => {
            setSelectedRequest(row);
            setRejectReason('');
          }}
        >
          <Eye size={16} aria-hidden />
        </IconButton>
      ),
    },
  ];

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>Laboratórios querendo se licenciar</PageTitle>
        <PageSubtitle>
          Solicitações enviadas pelo cadastro do laboratório para análise da Nexor Admin antes do pagamento,
          contratos, curso, prova e liberação operacional.
        </PageSubtitle>
      </PageHeader>

      <AdminProductGate />

      {selectedProduct ? (
        <>
          {loading ? (
            <SkeletonGrid cards={4} minCardWidth="180px" />
          ) : (
            <StatGrid>
              {stats.map((stat) => (
                <StatCard key={stat.label} padding="lg">
                  <StatValue>{stat.value}</StatValue>
                  <StatLabel>{stat.label}</StatLabel>
                </StatCard>
              ))}
            </StatGrid>
          )}

          <TableSection padding="lg">
            <FilterBar>
              <Field
                as="input"
                label="Buscar"
                placeholder="Buscar por laboratório, CNPJ ou resumo..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </FilterBar>
            {loading ? (
              <SkeletonTable rows={6} columns={6} />
            ) : (
              <div data-testid="admin-lab-requests-table">
                <DataTable
                  data={filteredRequests}
                  columns={columns}
                  keyExtractor={(row) => row.id}
                  pageSize={6}
                  emptyMessage="Nenhuma solicitação encontrada."
                />
              </div>
            )}
          </TableSection>
        </>
      ) : null}

      {selectedRequest ? (
        <ModalOverlay role="dialog" aria-modal="true" aria-label="Dados enviados pelo laboratório">
          <ModalBox>
            <ModalHeader>
              <div>
                <ModalTitle>Dados enviados pelo laboratório</ModalTitle>
                <ModalSubtitle>{selectedRequest.labName} - {selectedRequest.cnpj}</ModalSubtitle>
              </div>
              <IconButton type="button" aria-label="Fechar dados do laboratório" onClick={() => setSelectedRequest(null)}>
                <X size={16} aria-hidden />
              </IconButton>
            </ModalHeader>

            <DetailGrid>
              <DetailItem>
                <DetailLabel>Resumo operacional</DetailLabel>
                <DetailValue>{selectedRequest.professionalSummary || 'Não informado'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Status do fluxo</DetailLabel>
                <DetailValue>{workflowLabel[selectedRequest.workflowStatus] ?? selectedRequest.workflowStatus}</DetailValue>
              </DetailItem>
            </DetailGrid>

            <LocationList>
              {selectedRequest.locations.map((location) => (
                <LocationItem key={`${location.name}:${location.cep}`}>
                  <DetailLabel>{location.name}</DetailLabel>
                  <DetailValue>{location.address}</DetailValue>
                  <DetailValue>{location.city} {location.state ? `- ${location.state}` : ''} - {location.cep}</DetailValue>
                  <DetailValue>{location.phone ?? 'Telefone não informado'} - {location.serviceHours}</DetailValue>
                </LocationItem>
              ))}
            </LocationList>

            <Field
              as="textarea"
              label="Motivo da recusa"
              placeholder="Obrigatório apenas para recusar."
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
            />

            <ModalActions>
              <Button type="button" variant="secondary" disabled={activeAction === 'approve' || selectedRequest.status !== 'pending'} onClick={handleApprove}>
                {activeAction === 'approve' ? 'Aprovando...' : 'Aprovar cadastro'}
              </Button>
              <DangerButton type="button" disabled={activeAction === 'reject' || !rejectReason.trim() || selectedRequest.status !== 'pending'} onClick={handleReject}>
                {activeAction === 'reject' ? 'Recusando...' : 'Recusar cadastro'}
              </DangerButton>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      ) : null}
    </PageStack>
  );
}

const IconButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 6px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  padding: 24px;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.42);
`;

const ModalBox = styled.div`
  width: min(760px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  padding: 24px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgBase};
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 18px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
`;

const ModalSubtitle = styled.p`
  margin: 6px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 12px;
  margin-bottom: 16px;
`;

const DetailItem = styled.div`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
`;

const DetailLabel = styled.span`
  display: block;
  margin-bottom: 6px;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DetailValue = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const LocationList = styled.div`
  display: grid;
  gap: 10px;
  margin-bottom: 16px;
`;

const LocationItem = styled.div`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
`;

const ModalActions = styled.div`
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  margin-top: 18px;
`;

const DangerButton = styled(Button)`
  background: #B91C1C;
  border-color: #B91C1C;
  color: #FFFFFF;
`;
