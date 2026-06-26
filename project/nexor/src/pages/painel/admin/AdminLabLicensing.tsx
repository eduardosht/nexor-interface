import { useEffect, useMemo, useState } from 'react';
import {
  AdminDataTable,
  AdminMetricGrid,
  AdminModal,
  AdminModalDetailCard,
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
import { Clock3, ClipboardList, Eye, FileText, FlaskConical, MapPin, Phone, RefreshCw } from 'lucide-react';
import styled from 'styled-components';
import { SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
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

function onlyDigits(value: string | undefined) {
  return (value ?? '').replace(/\D/g, '');
}

function formatCpf(value: string | undefined) {
  const digits = onlyDigits(value);
  if (digits.length !== 11) return value?.trim() || 'Não informado';
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
}

function formatCnpj(value: string | undefined) {
  const digits = onlyDigits(value);
  if (digits.length !== 14) return value?.trim() || 'Não informado';
  return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
}

function canReviewRequest(request: LabLicenseRequest) {
  return request.status === 'pending';
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
  const debouncedSearch = useDebouncedValue(search, 300);

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
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return requests;
    return requests.filter((request) =>
      `${request.labName} ${request.cnpj} ${request.professionalSummary}`.toLowerCase().includes(query)
    );
  }, [debouncedSearch, requests]);

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
        render: (row) =>
          canReviewRequest(row) ? (
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
          ) : null,
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
                {canReviewRequest(row) ? (
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
                ) : null}
              </AdminMobileCard>
            )}
          />
        </>
      ) : null}

      <AdminModal
        open={Boolean(selectedRequest)}
        title="Dados enviados pelo laboratório"
        ariaLabel="Dados enviados pelo laboratório"
        mobilePlacement="center"
        icon={<FlaskConical size={32} />}
        subtitle={
          selectedRequest ? (
            <ModalSubtitleInline>
              <span>{selectedRequest.labName}</span>
              <InlineDot aria-hidden />
              <span>{formatCnpj(selectedRequest.cnpj)}</span>
            </ModalSubtitleInline>
          ) : null
        }
        onClose={() => setSelectedRequest(null)}
        footer={
          selectedRequest ? (
            <CompactModalActions>
              <CompactModalButton
                type="button"
                variant="secondary"
                disabled={activeAction === 'reject' || !rejectReason.trim() || selectedRequest.status !== 'pending'}
                onClick={handleReject}
              >
                {activeAction === 'reject' ? 'Recusando...' : 'Recusar cadastro'}
              </CompactModalButton>
              <CompactModalButton
                type="button"
                disabled={activeAction === 'approve' || selectedRequest.status !== 'pending'}
                $tone="success"
                onClick={handleApprove}
              >
                {activeAction === 'approve' ? 'Aprovando...' : 'Aprovar cadastro'}
              </CompactModalButton>
            </CompactModalActions>
          ) : null
        }
      >
        {selectedRequest ? (
          <>
            <CompactModalPairGrid>
              <CompactModalDetailCard>
                <CompactModalCardHeader>
                  <CompactModalDetailIcon aria-hidden>
                    <FileText size={18} />
                  </CompactModalDetailIcon>
                  <CompactModalDetailLabel>CPF</CompactModalDetailLabel>
                </CompactModalCardHeader>
                <CompactModalCardBody>
                  <CompactModalDetailValue>{formatCpf(selectedRequest.cpf)}</CompactModalDetailValue>
                </CompactModalCardBody>
              </CompactModalDetailCard>
              <CompactModalDetailCard>
                <CompactModalCardHeader>
                  <CompactModalDetailIcon aria-hidden>
                    <FileText size={18} />
                  </CompactModalDetailIcon>
                  <CompactModalDetailLabel>CNPJ</CompactModalDetailLabel>
                </CompactModalCardHeader>
                <CompactModalCardBody>
                  <CompactModalDetailValue>{formatCnpj(selectedRequest.cnpj)}</CompactModalDetailValue>
                </CompactModalCardBody>
              </CompactModalDetailCard>
              <CompactModalDetailCard>
                <CompactModalCardHeader>
                  <CompactModalDetailIcon aria-hidden>
                    <ClipboardList size={18} />
                  </CompactModalDetailIcon>
                  <CompactModalDetailLabel>Resumo operacional</CompactModalDetailLabel>
                </CompactModalCardHeader>
                <CompactModalCardBody>
                  <CompactModalDetailValue>
                    {selectedRequest.professionalSummary || 'Não informado'}
                  </CompactModalDetailValue>
                </CompactModalCardBody>
              </CompactModalDetailCard>
              <CompactModalDetailCard>
                <CompactModalCardHeader>
                  <CompactModalDetailIcon aria-hidden>
                    <RefreshCw size={18} />
                  </CompactModalDetailIcon>
                  <CompactModalDetailLabel>Status do fluxo</CompactModalDetailLabel>
                </CompactModalCardHeader>
                <CompactModalCardBody>
                  <StatusPill $color={getStatusColor(selectedRequest.status)}>
                    <StatusDot $color={getStatusColor(selectedRequest.status)} />
                    {workflowLabel[selectedRequest.workflowStatus] ?? selectedRequest.workflowStatus}
                  </StatusPill>
                </CompactModalCardBody>
              </CompactModalDetailCard>
            </CompactModalPairGrid>

            {selectedRequest.locations.map((location) => (
              <LocationDisclosure key={`${location.name}:${location.cep}`}>
                <LocationSummary>
                  <CompactModalCardHeader>
                    <CompactModalDetailIcon aria-hidden>
                      <MapPin size={18} />
                    </CompactModalDetailIcon>
                    <CompactModalDetailLabel>{location.name}</CompactModalDetailLabel>
                  </CompactModalCardHeader>
                  <LocationSummaryHint>Ver detalhes</LocationSummaryHint>
                </LocationSummary>
                <CompactModalCardBody>
                  <CompactModalDetailValue>{location.address}</CompactModalDetailValue>
                  <CompactModalDetailValue>
                    {location.city} {location.state ? `- ${location.state}` : ''} - {location.cep}
                  </CompactModalDetailValue>
                  <LocationMeta>
                    <LocationMetaItem>
                      <Phone size={16} aria-hidden />
                      {location.phone ?? 'Telefone não informado'}
                    </LocationMetaItem>
                    <InlineDot aria-hidden />
                    <LocationMetaItem>
                      <Clock3 size={16} aria-hidden />
                      {location.serviceHours}
                    </LocationMetaItem>
                  </LocationMeta>
                </CompactModalCardBody>
              </LocationDisclosure>
            ))}

            <CompactModalTextAreaGroup>
              <CompactModalTextAreaLabel htmlFor="lab-reject-reason">Motivo da recusa</CompactModalTextAreaLabel>
              <CompactModalTextArea
                id="lab-reject-reason"
                placeholder="Obrigatório apenas para recusar."
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
              />
            </CompactModalTextAreaGroup>
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

const CompactModalPairGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;

  @media (max-width: 360px) {
    gap: 5px;
  }
`;

const CompactModalDetailCard = styled(AdminModalDetailCard)`
  min-height: 0;
  display: grid;
  padding: 7px;
  gap: 5px;
  border-radius: 8px;

  @media (max-width: 420px) {
    padding: 6px;
    gap: 5px;
  }
`;

const CompactModalCardHeader = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CompactModalCardBody = styled.div`
  grid-column: 1 / -1;
  min-width: 0;
  display: grid;
  gap: 3px;
`;

const CompactModalDetailIcon = styled(AdminModalDetailIcon)`
  width: 24px;
  height: 24px;

  @media (max-width: 420px) {
    width: 20px;
    height: 20px;
  }

  @media (max-width: 340px) {
    width: 18px;
    height: 18px;
  }
`;

const CompactModalDetailLabel = styled(AdminModalDetailLabel)`
  font-size: 12px;
  line-height: 1.2;

  @media (min-width: 421px) {
    font-size: 13px;
  }
`;

const CompactModalDetailValue = styled(AdminModalDetailValue)`
  font-size: 10px;
  line-height: 1.25;
  overflow-wrap: anywhere;

  @media (min-width: 421px) {
    font-size: 11px;
  }
`;

const CompactModalTextAreaGroup = styled(AdminModalTextAreaGroup)`
  gap: 6px;
`;

const CompactModalTextAreaLabel = styled(AdminModalTextAreaLabel)`
  font-size: 14px;
`;

const CompactModalTextArea = styled(AdminModalTextArea)`
  min-height: 58px;
  padding: 8px;
  font-size: 12px;
  line-height: 1.3;
  resize: none;
`;

const CompactModalActions = styled.div`
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
`;

const CompactModalButton = styled(Button) <{ $tone?: 'success' }>`
  flex: 0 1 calc(50% - 5px);
  min-width: 0;
  min-height: 38px;
  padding-inline: 10px;
  white-space: normal;
  background: ${({ theme, $tone }) => ($tone === 'success' ? theme.colors.green : undefined)};
  border-color: ${({ theme, $tone }) => ($tone === 'success' ? theme.colors.green : undefined)};
  color: ${({ theme, $tone }) => ($tone === 'success' ? theme.colors.bgElevated : undefined)};

  [data-button-content],
  [data-button-label] {
    min-width: 0;
    white-space: normal;
    text-wrap: balance;
  }
`;

const LocationDisclosure = styled.details`
  grid-column: 1 / -1;
  min-width: 0;
  padding: 7px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};

  &[open] {
    display: grid;
    gap: 5px;
  }

  @media (max-width: 420px) {
    padding: 6px;
  }
`;

const LocationSummary = styled.summary`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  cursor: pointer;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }
`;

const LocationSummaryHint = styled.span`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.green};
  font-size: 10px;
  font-weight: 700;
`;

const ModalSubtitleInline = styled.span`
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  white-space: nowrap;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }
`;

const InlineDot = styled.span`
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.green};
`;

const LocationMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  flex-wrap: wrap;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 11px;
  line-height: 1.25;
`;

const LocationMetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  svg {
    color: ${({ theme }) => theme.colors.green};
  }
`;

const StatusPill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  max-width: 100%;
  padding: 4px 7px;
  border-radius: 7px;
  color: ${({ $color }) => $color};
  background: ${({ $color }) => `${$color}12`};
  font-size: 12px;
  line-height: 1.2;
`;

const StatusDot = styled.span<{ $color: string }>`
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: ${({ $color }) => $color};
`;
