import { useEffect, useMemo, useState } from 'react';
import { Button, DataTable, Field, StatusIndicator, type DataTableColumn } from '@nexor/design-system';
import { Eye, X } from 'lucide-react';
import styled from 'styled-components';
import { SkeletonGrid, SkeletonTable } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { useAdminPortal } from '../../../features/admin/portal';
import {
  approvePartnerRequest,
  fetchPartnerRequests,
  formatDate,
  getAuthToken,
  rejectPartnerRequest,
  type PartnerRequest,
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

function getStatusColor(status: string) {
  if (status === 'active') return '#15803D';
  if (status === 'rejected') return '#B91C1C';
  if (status === 'suspended') return '#525252';
  return '#D18A00';
}

function formatDocumentType(value: string) {
  return value.toLowerCase() === 'cpf' ? 'CPF' : 'CNPJ';
}

export function AdminPartnerLicensing() {
  const { selectedProduct } = useAdminPortal();
  const { session } = useAuth();
  const token = getAuthToken(session);
  const [requests, setRequests] = useState<PartnerRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedRequest, setSelectedRequest] = useState<PartnerRequest | null>(null);
  const [rejectReason, setRejectReason] = useState('');
  const [activeAction, setActiveAction] = useState('');

  async function loadRequests() {
    if (!selectedProduct || !token) return;
    setLoading(true);
    try {
      const response = await fetchPartnerRequests(token);
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
      `${request.partnerName} ${request.documentNumber} ${request.contactEmail} ${request.cityState}`
        .toLowerCase()
        .includes(query)
    );
  }, [requests, search]);

  const stats = useMemo(
    () => [
      { label: 'Aguardando análise', value: String(requests.filter((item) => item.status === 'pending').length) },
      { label: 'Aprovados', value: String(requests.filter((item) => item.status === 'active').length) },
      { label: 'Recusados', value: String(requests.filter((item) => item.status === 'rejected').length) },
    ],
    [requests]
  );

  async function handleApprove() {
    if (!selectedRequest || !token) return;
    setActiveAction('approve');
    try {
      await approvePartnerRequest(selectedRequest.id, token);
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
      await rejectPartnerRequest(selectedRequest.id, rejectReason.trim(), token);
      setSelectedRequest(null);
      setRejectReason('');
      await loadRequests();
    } finally {
      setActiveAction('');
    }
  }

  const columns: DataTableColumn<PartnerRequest>[] = [
    { key: 'name', label: 'Parceiro', render: (row) => row.partnerName || 'Não informado' },
    { key: 'document', label: 'Documento', render: (row) => `${formatDocumentType(row.documentType)} ${row.documentNumber}` },
    { key: 'email', label: 'Contato', render: (row) => row.contactEmail || 'Não informado' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => <StatusIndicator color={getStatusColor(row.status)} label={statusLabel[row.status] ?? row.status} />,
    },
    { key: 'date', label: 'Enviado em', render: (row) => formatDate(row.submittedAt) },
    {
      key: 'actions',
      label: 'Visualizar',
      render: (row) => (
        <IconButton
          type="button"
          aria-label={`Visualizar solicitação de ${row.partnerName}`}
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
        <PageTitle>Parceiros aguardando aprovação</PageTitle>
        <PageSubtitle>
          Solicitações enviadas pelo cadastro de parceiro para análise da Nexor Admin antes da liberação dos links de indicação.
        </PageSubtitle>
      </PageHeader>

      <AdminProductGate />

      {selectedProduct ? (
        <>
          {loading ? (
            <SkeletonGrid cards={3} minCardWidth="180px" />
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
                placeholder="Buscar por nome, documento, e-mail ou cidade..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </FilterBar>
            {loading ? (
              <SkeletonTable rows={6} columns={5} />
            ) : (
              <div data-testid="admin-partner-requests-table">
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
        <ModalOverlay role="dialog" aria-modal="true" aria-label="Dados enviados pelo parceiro">
          <ModalBox>
            <ModalHeader>
              <div>
                <ModalTitle>Dados enviados pelo parceiro</ModalTitle>
                <ModalSubtitle>
                  {selectedRequest.partnerName} - {formatDocumentType(selectedRequest.documentType)} {selectedRequest.documentNumber}
                </ModalSubtitle>
              </div>
              <IconButton type="button" aria-label="Fechar dados do parceiro" onClick={() => setSelectedRequest(null)}>
                <X size={16} aria-hidden />
              </IconButton>
            </ModalHeader>

            <DetailGrid>
              <DetailItem>
                <DetailLabel>E-mail de contato</DetailLabel>
                <DetailValue>{selectedRequest.contactEmail || 'Não informado'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Cidade e estado</DetailLabel>
                <DetailValue>{selectedRequest.cityState || 'Não informado'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Canais de atuação</DetailLabel>
                <DetailValue>{selectedRequest.channels || 'Não informado'}</DetailValue>
              </DetailItem>
              <DetailItem>
                <DetailLabel>Status</DetailLabel>
                <DetailValue>{statusLabel[selectedRequest.status] ?? selectedRequest.status}</DetailValue>
              </DetailItem>
            </DetailGrid>

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
  border: 1px solid #E0E0E0;
  border-radius: 6px;
  background: #FFFFFF;
  color: #171717;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.36);
  z-index: 50;
  display: grid;
  place-items: center;
  padding: 24px;
`;

const ModalBox = styled.div`
  width: min(760px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  background: #FFFFFF;
  border-radius: 12px;
  padding: 24px;
  display: grid;
  gap: 18px;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 16px;
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  line-height: 1.2;
`;

const ModalSubtitle = styled.p`
  margin: 6px 0 0;
  color: #525252;
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const DetailItem = styled.div`
  border: 1px solid #E5E5E5;
  border-radius: 8px;
  padding: 12px;
  background: #FAFAFA;
`;

const DetailLabel = styled.span`
  display: block;
  font-size: 12px;
  font-weight: 700;
  color: #737373;
  margin-bottom: 6px;
`;

const DetailValue = styled.p`
  margin: 0;
  color: #171717;
`;

const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`;

const DangerButton = styled(Button)`
  background: #B91C1C;
  border-color: #B91C1C;
  color: #FFFFFF;

  &:disabled {
    background: #E5E5E5;
    border-color: #E5E5E5;
    color: #737373;
  }
`;
