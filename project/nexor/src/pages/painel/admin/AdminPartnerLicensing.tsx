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
import { Eye, FileText, HeartPulse, Mail, MapPin, UserRoundCheck } from 'lucide-react';
import styled from 'styled-components';
import { SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
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
  const debouncedSearch = useDebouncedValue(search, 300);

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
    const query = debouncedSearch.trim().toLowerCase();
    if (!query) return requests;
    return requests.filter((request) =>
      `${request.partnerName} ${getPartnerEmail(request)} ${request.documentNumber} ${formatPartnerType(request.partnerType)} ${formatPartnerLocation(request)} ${(request.serviceLocations ?? []).join(' ')}`
        .toLowerCase()
        .includes(query)
    );
  }, [debouncedSearch, requests]);

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
          <AdminMobileOnly>
            <Field
              as="input"
              label="Buscar"
              placeholder="Nome, e-mail, documento ou local"
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
                searchPlaceholder="Buscar por nome, e-mail, documento, tipo ou localização..."
                searchValue={search}
                onSearchChange={setSearch}
                emptyMessage="Nenhuma solicitação encontrada."
                testId="admin-partner-requests-table"
              />
            }
            data={filteredRequests}
            keyExtractor={(row) => row.id}
            emptyMessage="Nenhuma solicitação encontrada."
            mobileTestId="admin-partner-requests-mobile-list"
            renderCard={(row) => (
              <AdminMobileCard>
                <AdminMobileCardHeader>
                  <div>
                    <AdminMobileCardTitle>{row.partnerName || 'Não informado'}</AdminMobileCardTitle>
                    <AdminMobileCardSubtitle>{getPartnerEmail(row) || 'E-mail não informado'}</AdminMobileCardSubtitle>
                  </div>
                  <AdminStatusPill color={getStatusColor(row.status)} label={statusLabel[row.status] ?? row.status} />
                </AdminMobileCardHeader>
                <AdminMobileMetaGrid>
                  <AdminMobileMetaItem>
                    <AdminMobileMetaLabel>Documento</AdminMobileMetaLabel>
                    <AdminMobileMetaValue>{formatDocumentType(row.documentType)} {row.documentNumber}</AdminMobileMetaValue>
                  </AdminMobileMetaItem>
                  <AdminMobileMetaItem>
                    <AdminMobileMetaLabel>Tipo</AdminMobileMetaLabel>
                    <AdminMobileMetaValue>{formatPartnerType(row.partnerType)}</AdminMobileMetaValue>
                  </AdminMobileMetaItem>
                  <AdminMobileMetaItem>
                    <AdminMobileMetaLabel>Enviado em</AdminMobileMetaLabel>
                    <AdminMobileMetaValue>{formatDate(row.submittedAt)}</AdminMobileMetaValue>
                  </AdminMobileMetaItem>
                  <AdminMobileMetaItem>
                    <AdminMobileMetaLabel>{getPartnerContextLabel(row)}</AdminMobileMetaLabel>
                    <AdminMobileMetaValue>{getPartnerContextValue(row)}</AdminMobileMetaValue>
                  </AdminMobileMetaItem>
                </AdminMobileMetaGrid>
                <AdminMobileActions>
                  <AdminMobileActionButton
                    type="button"
                    aria-label={`Abrir dados do parceiro ${row.partnerName}`}
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
        title="Dados enviados pelo parceiro"
        ariaLabel="Dados enviados pelo parceiro"
        mobilePlacement="center"
        icon={<UserRoundCheck size={32} />}
        subtitle={
          selectedRequest ? (
            <ModalSubtitleInline>
              <span>{selectedRequest.partnerName}</span>
              <InlineDot aria-hidden />
              <span>{formatDocumentType(selectedRequest.documentType)} {selectedRequest.documentNumber}</span>
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
                  <CompactModalDetailLabel>Tipo de parceiro</CompactModalDetailLabel>
                </CompactModalCardHeader>
                <CompactModalCardBody>
                  <CompactModalDetailValue>{formatPartnerType(selectedRequest.partnerType)}</CompactModalDetailValue>
                </CompactModalCardBody>
              </CompactModalDetailCard>
              <CompactModalDetailCard>
                <CompactModalCardHeader>
                  <CompactModalDetailIcon aria-hidden>
                    <FileText size={18} />
                  </CompactModalDetailIcon>
                  <CompactModalDetailLabel>Documento</CompactModalDetailLabel>
                </CompactModalCardHeader>
                <CompactModalCardBody>
                  <CompactModalDetailValue>
                    {formatDocumentType(selectedRequest.documentType)} {selectedRequest.documentNumber}
                  </CompactModalDetailValue>
                </CompactModalCardBody>
              </CompactModalDetailCard>
              <CompactModalDetailCard>
                <CompactModalCardHeader>
                  <CompactModalDetailIcon aria-hidden>
                    <Mail size={18} />
                  </CompactModalDetailIcon>
                  <CompactModalDetailLabel>E-mail</CompactModalDetailLabel>
                </CompactModalCardHeader>
                <CompactModalCardBody>
                  <CompactModalDetailValue>{getPartnerEmail(selectedRequest) || 'Não informado'}</CompactModalDetailValue>
                </CompactModalCardBody>
              </CompactModalDetailCard>
              <CompactModalDetailCard>
                <CompactModalCardHeader>
                  <CompactModalDetailIcon aria-hidden>
                    <HeartPulse size={18} />
                  </CompactModalDetailIcon>
                  <CompactModalDetailLabel>Status do fluxo</CompactModalDetailLabel>
                </CompactModalCardHeader>
                <CompactModalCardBody>
                  <StatusPill $color={getStatusColor(selectedRequest.status)}>
                    <StatusDot $color={getStatusColor(selectedRequest.status)} />
                    {statusLabel[selectedRequest.status] ?? selectedRequest.status}
                  </StatusPill>
                </CompactModalCardBody>
              </CompactModalDetailCard>
            </CompactModalPairGrid>

            <PartnerContextDisclosure>
              <PartnerContextSummary>
                <CompactModalCardHeader>
                  <CompactModalDetailIcon aria-hidden>
                    <MapPin size={18} />
                  </CompactModalDetailIcon>
                  <CompactModalDetailLabel>{getPartnerContextLabel(selectedRequest)}</CompactModalDetailLabel>
                </CompactModalCardHeader>
                <PartnerContextSummaryHint>Ver detalhes</PartnerContextSummaryHint>
              </PartnerContextSummary>
              <CompactModalCardBody>
                <CompactModalDetailValue>{getPartnerContextValue(selectedRequest)}</CompactModalDetailValue>
              </CompactModalCardBody>
            </PartnerContextDisclosure>

            <CompactModalTextAreaGroup>
              <CompactModalTextAreaLabel htmlFor="partner-reject-reason">Motivo da recusa</CompactModalTextAreaLabel>
              <CompactModalTextArea
                id="partner-reject-reason"
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

  @media (min-width: 721px) {
    font-size: 14px;
  }
`;

const CompactModalDetailValue = styled(AdminModalDetailValue)`
  font-size: 10px;
  line-height: 1.25;
  overflow-wrap: anywhere;

  @media (min-width: 421px) {
    font-size: 11px;
  }

  @media (min-width: 721px) {
    font-size: 14px;
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

  @media (min-width: 721px) {
    font-size: 14px;
  }
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

const PartnerContextDisclosure = styled.details`
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

const PartnerContextSummary = styled.summary`
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

const PartnerContextSummaryHint = styled.span`
  flex: 0 0 auto;
  color: ${({ theme }) => theme.colors.green};
  font-size: 10px;
  font-weight: 700;

  @media (min-width: 721px) {
    font-size: 14px;
  }
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
