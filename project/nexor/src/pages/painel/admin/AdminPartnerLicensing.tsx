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
  type AdminDataTableColumn,
  type AdminMetric,
} from '@nexor/design-system';
import { Eye, FileText, HeartPulse, MapPin, UserRoundCheck } from 'lucide-react';
import styled from 'styled-components';
import { SkeletonGrid } from '../../../components/Skeleton';
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
import { PageHeader, PageStack, PageSubtitle, PageTitle } from './styles';
import { AdminProductGate } from './AdminProductGate';

const statusLabel: Record<string, string> = {
  pending: 'Aguardando análise',
  active: 'Aprovado',
  rejected: 'Recusado',
  suspended: 'Suspenso',
};

function getStatusColor(status: string) {
  if (status === 'active') return '#15803d';
  if (status === 'rejected') return '#b91c1c';
  if (status === 'suspended') return '#525252';
  return '#d18a00';
}

function formatDocumentType(value: string) {
  return value.toLowerCase() === 'cpf' ? 'CPF' : 'CNPJ';
}

function formatPartnerType(value?: string) {
  if (value === 'academy') return 'Academia';
  if (value === 'coach_personal') return 'Coach/Personal';
  return 'Não informado';
}

function getPartnerEmail(request: PartnerRequest) {
  const fallbackEmail = (request as PartnerRequest & { email?: string }).email;
  return request.contactEmail || fallbackEmail || '';
}

function formatPartnerLocation(request: PartnerRequest) {
  const location = request.location;
  if (!location) return '';
  return [
    location.address,
    location.city && location.state ? `${location.city} - ${location.state}` : location.city,
    location.cep,
  ]
    .filter(Boolean)
    .join(' | ');
}

function getPartnerContextLabel(request: PartnerRequest) {
  return request.partnerType === 'academy' ? 'Localização' : 'Locais de atuação';
}

function getPartnerContextValue(request: PartnerRequest) {
  if (request.partnerType === 'academy') {
    return formatPartnerLocation(request) || 'Não informado';
  }
  return (request.serviceLocations ?? []).join(', ') || 'Não informado';
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
      `${request.partnerName} ${getPartnerEmail(request)} ${request.documentNumber} ${formatPartnerType(request.partnerType)} ${formatPartnerLocation(request)} ${(request.serviceLocations ?? []).join(' ')}`
        .toLowerCase()
        .includes(query)
    );
  }, [requests, search]);

  const metrics = useMemo<AdminMetric[]>(
    () => [
      { label: 'Aguardando análise', value: requests.filter((item) => item.status === 'pending').length, tone: 'success' },
      { label: 'Aprovados', value: requests.filter((item) => item.status === 'active').length, tone: 'success' },
      { label: 'Recusados', value: requests.filter((item) => item.status === 'rejected').length, tone: 'danger' },
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

  const columns = useMemo<AdminDataTableColumn<PartnerRequest>[]>(
    () => [
      {
        key: 'partner',
        label: 'Parceiro',
        width: '17%',
        sortValue: (row) => row.partnerName,
        render: (row) => (
          <PartnerCell>
            <PartnerName>{row.partnerName || 'Não informado'}</PartnerName>
            {getPartnerEmail(row) ? <PartnerEmail>{getPartnerEmail(row)}</PartnerEmail> : null}
          </PartnerCell>
        ),
      },
      {
        key: 'document',
        label: 'Documento',
        width: '18%',
        sortValue: (row) => `${formatDocumentType(row.documentType)} ${row.documentNumber}`,
        render: (row) => `${formatDocumentType(row.documentType)} ${row.documentNumber}`,
      },
      {
        key: 'type',
        label: 'Tipo',
        width: '14%',
        sortValue: (row) => formatPartnerType(row.partnerType),
        render: (row) => formatPartnerType(row.partnerType),
      },
      {
        key: 'status',
        label: 'Status',
        width: '19%',
        sortValue: (row) => statusLabel[row.status] ?? row.status,
        render: (row) => <AdminStatusPill color={getStatusColor(row.status)} label={statusLabel[row.status] ?? row.status} />,
      },
      {
        key: 'submittedAt',
        label: 'Enviado em',
        width: '18%',
        sortValue: (row) => new Date(row.submittedAt).getTime(),
        render: (row) => formatDate(row.submittedAt),
      },
      {
        key: 'actions',
        label: 'Visualizar',
        width: '14%',
        align: 'center',
        render: (row) => (
          <ViewButton
            type="button"
            aria-label={`Visualizar solicitação de ${row.partnerName}`}
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
        <PageTitle>Parceiros aguardando aprovação</PageTitle>
        <PageSubtitle>
          Solicitações enviadas pelo cadastro de parceiro para análise da Nexor Admin antes da liberação dos links de indicação.
        </PageSubtitle>
      </PageHeader>

      <AdminProductGate />

      {selectedProduct ? (
        <>
          {loading ? <SkeletonGrid cards={3} minCardWidth="180px" /> : <AdminMetricGrid metrics={metrics} />}
          <AdminDataTable
            data={filteredRequests}
            columns={columns}
            keyExtractor={(row) => row.id}
            searchLabel="Buscar"
            searchPlaceholder="Buscar por nome, e-mail, documento, tipo ou localização..."
            searchValue={search}
            onSearchChange={setSearch}
            emptyMessage="Nenhuma solicitação encontrada."
            testId="admin-partner-requests-table"
          />
        </>
      ) : null}

      <AdminModal
        open={Boolean(selectedRequest)}
        title="Dados enviados pelo parceiro"
        ariaLabel="Dados enviados pelo parceiro"
        icon={<UserRoundCheck size={32} />}
        subtitle={
          selectedRequest ? (
            <>
              {selectedRequest.partnerName}
              <InlineDot aria-hidden />
              {formatDocumentType(selectedRequest.documentType)} {selectedRequest.documentNumber}
            </>
          ) : null
        }
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
                  <FileText size={24} />
                </AdminModalDetailIcon>
                <AdminModalDetailContent>
                  <AdminModalDetailLabel>Tipo de parceiro</AdminModalDetailLabel>
                  <AdminModalDetailValue>{formatPartnerType(selectedRequest.partnerType)}</AdminModalDetailValue>
                </AdminModalDetailContent>
              </AdminModalDetailCard>
              <AdminModalDetailCard>
                <AdminModalDetailIcon aria-hidden>
                  <HeartPulse size={24} />
                </AdminModalDetailIcon>
                <AdminModalDetailContent>
                  <AdminModalDetailLabel>Status do fluxo</AdminModalDetailLabel>
                  <AdminStatusPill color={getStatusColor(selectedRequest.status)} label={statusLabel[selectedRequest.status] ?? selectedRequest.status} />
                </AdminModalDetailContent>
              </AdminModalDetailCard>
            </AdminModalDetailGrid>

            <AdminModalDetailCard>
              <AdminModalDetailIcon aria-hidden>
                <MapPin size={26} />
              </AdminModalDetailIcon>
              <AdminModalDetailContent>
                <AdminModalDetailLabel>{getPartnerContextLabel(selectedRequest)}</AdminModalDetailLabel>
                <AdminModalDetailValue>{getPartnerContextValue(selectedRequest)}</AdminModalDetailValue>
              </AdminModalDetailContent>
            </AdminModalDetailCard>

            <AdminModalTextAreaGroup>
              <AdminModalTextAreaLabel htmlFor="partner-reject-reason">Motivo da recusa</AdminModalTextAreaLabel>
              <AdminModalTextArea
                id="partner-reject-reason"
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

const PartnerCell = styled.div`
  display: grid;
  gap: 3px;
  min-width: 0;
`;

const PartnerName = styled.span`
  min-width: 0;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.2;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const PartnerEmail = styled.span`
  min-width: 0;
  overflow: hidden;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 10px;
  line-height: 1.2;
  text-transform: none;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

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

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.bgInset};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }
`;

const InlineDot = styled.span`
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.green};
`;
