import { useEffect, useMemo, useState } from 'react';
import { Button, DataTable, Field, StatusIndicator, type DataTableColumn } from '@nexor/design-system';
import { Eye, X } from 'lucide-react';
import styled from 'styled-components';
import { SkeletonGrid, SkeletonTable } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { useAdminPortal } from '../../../features/admin/portal';
import {
  approveDentistLicenseRequest,
  fetchDentistLicenseRequests,
  formatDate,
  getAuthToken,
  rejectDentistLicenseRequest,
  type DentistLicenseRequest,
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

export function AdminDentistLicensing() {
  const { selectedProduct } = useAdminPortal();
  const { session } = useAuth();
  const token = getAuthToken(session);
  const [requests, setRequests] = useState<DentistLicenseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<DentistLicenseRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeAction, setActiveAction] = useState('');

  async function loadRequests() {
    if (!selectedProduct || !token) return;
    setLoading(true);
    try {
      const response = await fetchDentistLicenseRequests(token);
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
      `${request.dentistName} ${request.croNumber} ${request.professionalSummary}`
        .toLowerCase()
        .includes(query)
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
      await approveDentistLicenseRequest(selectedRequest.id, token);
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
      await rejectDentistLicenseRequest(selectedRequest.id, rejectReason.trim(), token);
      setSelectedRequest(null);
      setRejectReason('');
      await loadRequests();
    } finally {
      setActiveAction('');
    }
  }

  const columns: DataTableColumn<DentistLicenseRequest>[] = [
    { key: 'name', label: 'Dentista', render: (row) => row.dentistName || 'Não informado' },
    { key: 'cro', label: 'CRO', render: (row) => row.croNumber || 'Não informado' },
    {
      key: 'clinics',
      label: 'Clínicas',
      render: (row) => String(row.practiceLocations.length),
    },
    {
      key: 'status',
      label: 'Status',
      render: (row) => (
        <StatusIndicator
          color={getStatusColor(row.status)}
          label={statusLabel[row.status] ?? row.status}
        />
      ),
    },
    {
      key: 'workflow',
      label: 'Fluxo',
      render: (row) => workflowLabel[row.workflowStatus] ?? row.workflowStatus,
    },
    { key: 'date', label: 'Enviado em', render: (row) => formatDate(row.submittedAt) },
    {
      key: 'actions',
      label: 'Visualizar',
      render: (row) => (
        <IconButton
          type="button"
          aria-label={`Visualizar solicitação de ${row.dentistName}`}
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
        <PageTitle>Dentistas querendo se licenciar</PageTitle>
        <PageSubtitle>
          Solicitações enviadas pelo cadastro do dentista para análise da Nexor Admin antes do pagamento,
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
                placeholder="Buscar por nome, CRO ou resumo..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </FilterBar>
            {loading ? (
              <SkeletonTable rows={6} columns={6} />
            ) : (
              <div data-testid="admin-dentist-requests-table">
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
        <ModalOverlay
          role="dialog"
          aria-modal="true"
          aria-label="Dados enviados pelo dentista"
          onClick={(event) => {
            if (event.target === event.currentTarget) {
              setSelectedRequest(null);
            }
          }}
        >
          <ModalBox>
            <ModalHeader>
              <div>
                <ModalTitle>Dados enviados pelo dentista</ModalTitle>
                <ModalSubtitle>{selectedRequest.dentistName} - {selectedRequest.croNumber}</ModalSubtitle>
              </div>
              <IconButton type="button" aria-label="Fechar dados do dentista" onClick={() => setSelectedRequest(null)}>
                <X size={16} aria-hidden />
              </IconButton>
            </ModalHeader>

            <DetailGrid>
              <DetailItem>
                <DetailLabel>Resumo profissional</DetailLabel>
                <DetailValue>{selectedRequest.professionalSummary || 'Não informado'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Status do fluxo</DetailLabel>
                <DetailValue>{workflowLabel[selectedRequest.workflowStatus] ?? selectedRequest.workflowStatus}</DetailValue>
              </DetailItem>
            </DetailGrid>

            <ClinicList>
              {selectedRequest.practiceLocations.map((clinic) => (
                <ClinicItem key={`${clinic.name}:${clinic.cep}`}>
                  <DetailLabel>{clinic.name}</DetailLabel>
                  <DetailValue>{clinic.address}</DetailValue>
                  <DetailValue>{clinic.city} {clinic.state ? `- ${clinic.state}` : ''} - {clinic.cep}</DetailValue>
                  <DetailValue>{clinic.phone ?? 'Telefone não informado'} - {clinic.serviceHours}</DetailValue>
                </ClinicItem>
              ))}
            </ClinicList>

            <Field
              as="textarea"
              label="Motivo da recusa"
              placeholder="Obrigatório apenas para recusar."
              value={rejectReason}
              onChange={(event) => setRejectReason(event.target.value)}
            />

            <ModalActions>
              <Button
                type="button"
                variant="secondary"
                disabled={activeAction === 'approve' || selectedRequest.status !== 'pending'}
                onClick={handleApprove}
              >
                {activeAction === 'approve' ? 'Aprovando...' : 'Aprovar cadastro'}
              </Button>
              <DangerButton
                type="button"
                disabled={activeAction === 'reject' || !rejectReason.trim() || selectedRequest.status !== 'pending'}
                onClick={handleReject}
              >
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

  @media (max-width: 1280px) {
    padding: 16px;
  }
`;

const ModalBox = styled.div`
  width: min(760px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  padding: 24px;
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgBase};
  display: flex;
  flex-direction: column;
  gap: 18px;

  @media (max-width: 1280px) {
    max-height: calc(100vh - 32px);
    gap: 12px;
    padding: 16px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;

  @media (max-width: 1280px) {
    gap: 10px;
  }
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ModalSubtitle = styled.p`
  margin: 4px 0 0;
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
`;

const DetailLabel = styled.strong`
  display: block;
  margin-bottom: 4px;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const DetailValue = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ClinicList = styled.div`
  display: grid;
  gap: 10px;
`;

const ClinicItem = styled(DetailItem)``;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;
`;

const DangerButton = styled.button`
  min-height: 44px;
  padding: 0 18px;
  border: 1px solid #b91c1c;
  border-radius: 4px;
  background: #b91c1c;
  color: #ffffff;
  font-weight: 700;
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;
