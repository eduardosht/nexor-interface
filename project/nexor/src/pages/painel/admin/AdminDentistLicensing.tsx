import { useEffect, useMemo, useState } from 'react';
import { Button, Select } from '@nexor/design-system';
import {
  ArrowUpDown,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  FileText,
  HeartPulse,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  UserRoundCheck,
  Clock3 as ClockIcon,
  X,
  XCircle,
} from 'lucide-react';
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
import { PageStack } from './styles';
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

const pageSizeOptions = [10, 20, 50];

const statusFilterOptions = [
  { value: 'all', label: 'Todos os filtros' },
  { value: 'pending', label: 'Aguardando análise' },
  { value: 'active', label: 'Aprovados' },
  { value: 'rejected', label: 'Recusados' },
  { value: 'licensed', label: 'Licenciados' },
];

type SortKey = 'dentist' | 'cro' | 'clinics' | 'status' | 'workflow' | 'submittedAt';
type SortDirection = 'asc' | 'desc';

function getStatusColor(status: string) {
  if (status === 'active' || status === 'licensed') return '#15803d';
  if (status === 'rejected' || status === 'admin_rejected') return '#b91c1c';
  return '#d18a00';
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'NI';
  return parts.slice(0, 2).map((part) => part[0]).join('').toUpperCase();
}

function getSortValue(request: DentistLicenseRequest, key: SortKey) {
  switch (key) {
    case 'dentist':
      return request.dentistName;
    case 'cro':
      return request.croNumber;
    case 'clinics':
      return request.practiceLocations.length;
    case 'status':
      return statusLabel[request.status] ?? request.status;
    case 'workflow':
      return workflowLabel[request.workflowStatus] ?? request.workflowStatus;
    case 'submittedAt':
      return new Date(request.submittedAt).getTime();
    default:
      return '';
  }
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
  const [statusFilter, setStatusFilter] = useState('all');
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [sortKey, setSortKey] = useState<SortKey>('submittedAt');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

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
    const visibleByStatus = requests.filter((request) => {
      if (statusFilter === 'all') return true;
      if (statusFilter === 'licensed') return request.workflowStatus === 'licensed';
      return request.status === statusFilter;
    });

    if (!query) return visibleByStatus;

    return visibleByStatus.filter((request) =>
      `${request.dentistName} ${request.croNumber} ${request.professionalSummary}`.toLowerCase().includes(query)
    );
  }, [requests, search, statusFilter]);

  const sortedRequests = useMemo(() => {
    return [...filteredRequests].sort((a, b) => {
      const aValue = getSortValue(a, sortKey);
      const bValue = getSortValue(b, sortKey);
      const direction = sortDirection === 'asc' ? 1 : -1;

      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction;
      }

      return String(aValue).localeCompare(String(bValue), 'pt-BR', { numeric: true }) * direction;
    });
  }, [filteredRequests, sortDirection, sortKey]);

  const totalPages = Math.max(1, Math.ceil(sortedRequests.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageStart = (safePage - 1) * pageSize;
  const paginatedRequests = sortedRequests.slice(pageStart, pageStart + pageSize);
  const rangeStart = sortedRequests.length === 0 ? 0 : pageStart + 1;
  const rangeEnd = Math.min(pageStart + pageSize, sortedRequests.length);

  const stats = useMemo(
    () => [
      {
        label: 'Aguardando análise',
        value: requests.filter((item) => item.status === 'pending').length,
        Icon: Clock3,
      },
      {
        label: 'Aprovados em onboarding',
        value: requests.filter((item) => item.status === 'active').length,
        Icon: CheckCircle2,
      },
      { label: 'Recusados', value: requests.filter((item) => item.status === 'rejected').length, Icon: XCircle },
      {
        label: 'Licenciados',
        value: requests.filter((item) => item.workflowStatus === 'licensed').length,
        Icon: ShieldCheck,
      },
    ],
    [requests]
  );

  function updateSearch(value: string) {
    setSearch(value);
    setPage(1);
  }

  function updateStatusFilter(value: string) {
    setStatusFilter(value);
    setPage(1);
  }

  function updatePageSize(value: number) {
    setPageSize(value);
    setPage(1);
  }

  function toggleSort(key: SortKey) {
    setPage(1);
    setSortKey((currentKey) => {
      if (currentKey !== key) {
        setSortDirection('asc');
        return key;
      }

      setSortDirection((currentDirection) => (currentDirection === 'asc' ? 'desc' : 'asc'));
      return currentKey;
    });
  }

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

  return (
    <PageStack>
      <AdminHero>
        <HeroIcon aria-hidden>
          <UserRoundCheck size={26} />
        </HeroIcon>
        <HeroCopy>
          <AdminTitle>Dentistas querendo se licenciar</AdminTitle>
          <AdminSubtitle>
            Solicitações enviadas pelo cadastro do dentista para análise da Nexor Admin antes do pagamento,
            contratos, curso, prova e liberação operacional.
          </AdminSubtitle>
        </HeroCopy>
      </AdminHero>

      <AdminProductGate />

      {selectedProduct ? (
        <>
          {loading ? (
            <SkeletonGrid cards={4} minCardWidth="180px" />
          ) : (
            <MetricsGrid>
              {stats.map((stat) => (
                <MetricCard key={stat.label}>
                  <MetricBody>
                    <MetricIcon aria-hidden>
                      <stat.Icon size={22} />
                    </MetricIcon>
                    <MetricText>
                      <MetricValue>{stat.value}</MetricValue>
                      <MetricLabel>{stat.label}</MetricLabel>
                    </MetricText>
                  </MetricBody>
                </MetricCard>
              ))}
            </MetricsGrid>
          )}

          <RequestsPanel>
            <SearchGroup>
              <SearchLabel>
                <Search size={18} aria-hidden />
                Buscar
              </SearchLabel>
              <ToolbarRow>
                <SearchInputWrap>
                  <SearchInput
                    aria-label="Buscar dentistas"
                    placeholder="Buscar por nome, CRO ou resumo..."
                    value={search}
                    onChange={(event) => updateSearch(event.target.value)}
                    autoComplete="off"
                    spellCheck={false}
                  />
                </SearchInputWrap>
                <FilterSelectWrap>
                  <CompactFilterSelect
                    id="admin-dentist-status-filter"
                    ariaLabel="Filtrar solicitações por status"
                    placeholder="Filtros"
                    leadingIcon={<Filter size={16} aria-hidden />}
                    value={statusFilter}
                    onChange={updateStatusFilter}
                    options={statusFilterOptions}
                  />
                </FilterSelectWrap>
              </ToolbarRow>
            </SearchGroup>

            {loading ? (
              <SkeletonTable rows={6} columns={6} />
            ) : (
              <TableWrap data-testid="admin-dentist-requests-table">
                <RequestsTable>
                  <thead>
                    <tr>
                      <SortableTh>
                        <SortButton type="button" onClick={() => toggleSort('dentist')}>
                          Dentista <ArrowUpDown size={13} aria-hidden />
                        </SortButton>
                      </SortableTh>
                      <SortableTh>
                        <SortButton type="button" onClick={() => toggleSort('cro')}>
                          CRO <ArrowUpDown size={13} aria-hidden />
                        </SortButton>
                      </SortableTh>
                      <SortableTh>
                        <SortButton type="button" onClick={() => toggleSort('clinics')}>
                          Clínicas <ArrowUpDown size={13} aria-hidden />
                        </SortButton>
                      </SortableTh>
                      <SortableTh>
                        <SortButton type="button" onClick={() => toggleSort('status')}>
                          Status <ArrowUpDown size={13} aria-hidden />
                        </SortButton>
                      </SortableTh>
                      <SortableTh>
                        <SortButton type="button" onClick={() => toggleSort('workflow')}>
                          Fluxo <ArrowUpDown size={13} aria-hidden />
                        </SortButton>
                      </SortableTh>
                      <SortableTh>
                        <SortButton type="button" onClick={() => toggleSort('submittedAt')}>
                          Enviado em <ArrowUpDown size={13} aria-hidden />
                        </SortButton>
                      </SortableTh>
                      <th>Visualizar</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedRequests.length === 0 ? (
                      <tr>
                        <EmptyCell colSpan={7}>Nenhuma solicitação encontrada.</EmptyCell>
                      </tr>
                    ) : (
                      paginatedRequests.map((request) => (
                        <tr key={request.id}>
                          <td>
                            <DentistCell>
                              <Avatar aria-hidden>{getInitials(request.dentistName)}</Avatar>
                              <DentistInfo>
                                <DentistName>{request.dentistName || 'Não informado'}</DentistName>
                                <DentistMeta>{request.professionalSummary || 'Resumo não informado'}</DentistMeta>
                              </DentistInfo>
                            </DentistCell>
                          </td>
                          <td>{request.croNumber || 'Não informado'}</td>
                          <ClinicCount>{request.practiceLocations.length}</ClinicCount>
                          <td>
                            <StatusPill $color={getStatusColor(request.status)}>
                              <StatusDot $color={getStatusColor(request.status)} />
                              {statusLabel[request.status] ?? request.status}
                            </StatusPill>
                          </td>
                          <td>{workflowLabel[request.workflowStatus] ?? request.workflowStatus}</td>
                          <td>{formatDate(request.submittedAt)}</td>
                          <ActionCell>
                            <ViewButton
                              type="button"
                              aria-label={`Visualizar solicitação de ${request.dentistName}`}
                              title="Visualizar"
                              onClick={() => {
                                setSelectedRequest(request);
                                setRejectReason('');
                              }}
                            >
                              <Eye size={16} aria-hidden />
                            </ViewButton>
                          </ActionCell>
                        </tr>
                      ))
                    )}
                  </tbody>
                </RequestsTable>
              </TableWrap>
            )}

            {!loading ? (
              <TableFooter>
                <ResultsText>
                  {sortedRequests.length === 0
                    ? 'Nenhum resultado'
                    : `Mostrando ${rangeStart} a ${rangeEnd} de ${sortedRequests.length} resultados`}
                </ResultsText>
                <PaginationGroup aria-label="Paginação de solicitações">
                  <PagerButton
                    type="button"
                    aria-label="Página anterior"
                    disabled={safePage === 1}
                    onClick={() => setPage((current) => Math.max(1, current - 1))}
                  >
                    <ChevronLeft size={16} aria-hidden />
                  </PagerButton>
                  <CurrentPage aria-current="page">{safePage}</CurrentPage>
                  <PagerButton
                    type="button"
                    aria-label="Próxima página"
                    disabled={safePage === totalPages}
                    onClick={() => setPage((current) => Math.min(totalPages, current + 1))}
                  >
                    <ChevronRight size={16} aria-hidden />
                  </PagerButton>
                </PaginationGroup>
                <PageSizeControl>
                  <PageSizeSelect
                    aria-label="Resultados por página"
                    value={pageSize}
                    onChange={(event) => updatePageSize(Number(event.target.value))}
                  >
                    {pageSizeOptions.map((option) => (
                      <option key={option} value={option}>
                        {option} por página
                      </option>
                    ))}
                  </PageSizeSelect>
                  <ChevronDown size={16} aria-hidden />
                </PageSizeControl>
              </TableFooter>
            ) : null}
          </RequestsPanel>
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
              <ModalTitleGroup>
                <ModalHeroIcon aria-hidden>
                  <UserRoundCheck size={32} />
                </ModalHeroIcon>
                <div>
                  <ModalTitle>Dados enviados pelo dentista</ModalTitle>
                  <ModalSubtitle>
                    {selectedRequest.dentistName}
                    <InlineDot aria-hidden />
                    {selectedRequest.croNumber}
                  </ModalSubtitle>
                </div>
              </ModalTitleGroup>
              <CloseButton type="button" aria-label="Fechar dados do dentista" onClick={() => setSelectedRequest(null)}>
                <X size={16} aria-hidden />
              </CloseButton>
            </ModalHeader>

            <DetailGrid>
              <DetailItem $layout="inline">
                <DetailIcon aria-hidden>
                  <FileText size={24} />
                </DetailIcon>
                <DetailContent>
                  <DetailLabel>Resumo profissional</DetailLabel>
                  <DetailValue>{selectedRequest.professionalSummary || 'Não informado'}</DetailValue>
                </DetailContent>
              </DetailItem>
              <DetailItem $layout="inline">
                <DetailIcon aria-hidden>
                  <HeartPulse size={24} />
                </DetailIcon>
                <DetailContent>
                  <DetailLabel>Status do fluxo</DetailLabel>
                  <StatusPill $color={getStatusColor(selectedRequest.status)}>
                    <StatusDot $color={getStatusColor(selectedRequest.status)} />
                    {workflowLabel[selectedRequest.workflowStatus] ?? selectedRequest.workflowStatus}
                  </StatusPill>
                </DetailContent>
              </DetailItem>
            </DetailGrid>

            <ClinicList>
              {selectedRequest.practiceLocations.map((clinic) => (
                <ClinicItem key={`${clinic.name}:${clinic.cep}`}>
                  <DetailIcon aria-hidden>
                    <MapPin size={26} />
                  </DetailIcon>
                  <DetailContent>
                    <DetailLabel>{clinic.name}</DetailLabel>
                    <ClinicText>{clinic.address}</ClinicText>
                    <ClinicText>{clinic.city} {clinic.state ? `- ${clinic.state}` : ''} - {clinic.cep}</ClinicText>
                    <ClinicMeta>
                      <ClinicMetaItem>
                        <Phone size={16} aria-hidden />
                        {clinic.phone ?? 'Telefone não informado'}
                      </ClinicMetaItem>
                      <InlineDot aria-hidden />
                      <ClinicMetaItem>
                        <ClockIcon size={16} aria-hidden />
                        {clinic.serviceHours}
                      </ClinicMetaItem>
                    </ClinicMeta>
                  </DetailContent>
                </ClinicItem>
              ))}
            </ClinicList>

            <RejectFieldGroup>
              <RejectLabel htmlFor="dentist-reject-reason">Motivo da recusa</RejectLabel>
              <RejectTextarea
                id="dentist-reject-reason"
                placeholder="Obrigatório apenas para recusar."
                value={rejectReason}
                onChange={(event) => setRejectReason(event.target.value)}
              />
            </RejectFieldGroup>

            <ModalActions>
              <DangerButton
                type="button"
                variant="secondary"
                disabled={activeAction === 'reject' || !rejectReason.trim() || selectedRequest.status !== 'pending'}
                onClick={handleReject}
                leadingIcon={<XCircle size={18} aria-hidden />}
              >
                {activeAction === 'reject' ? 'Recusando...' : 'Recusar cadastro'}
              </DangerButton>
              <ApproveButton
                type="button"
                disabled={activeAction === 'approve' || selectedRequest.status !== 'pending'}
                onClick={handleApprove}
                leadingIcon={<CheckCircle2 size={20} aria-hidden />}
              >
                {activeAction === 'approve' ? 'Aprovando...' : 'Aprovar cadastro'}
              </ApproveButton>
            </ModalActions>
          </ModalBox>
        </ModalOverlay>
      ) : null}
    </PageStack>
  );
}

const AdminHero = styled.header`
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 22px;
  position: relative;

  &::after {
    content: '';
    position: absolute;
    right: 0;
    top: -28px;
    width: 88px;
    height: 112px;
    opacity: 0.32;
    background-image: radial-gradient(circle, rgba(21, 128, 61, 0.35) 1.8px, transparent 2px);
    background-size: 24px 24px;
    pointer-events: none;
  }

  @media (max-width: 680px) {
    gap: 14px;
  }
`;

const HeroIcon = styled.div`
  width: 56px;
  height: 56px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.green};
  background:
    linear-gradient(135deg, rgba(21, 128, 61, 0.12), rgba(21, 128, 61, 0.04)),
    ${({ theme }) => theme.colors.bgElevated};
`;

const HeroCopy = styled.div`
  min-width: 0;
  max-width: 780px;
`;

const AdminTitle = styled.h1`
  margin: 0;
  font-size: 32px;
  line-height: 1.12;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 680px) {
    font-size: 26px;
  }
`;

const AdminSubtitle = styled.p`
  margin: 12px 0 0;
  font-size: 16px;
  line-height: 1.58;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 22px;

  @media (max-width: 1180px) {
    gap: 14px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const MetricCard = styled.article`
  min-width: 0;
  min-height: 140px;
  padding: 30px 22px 22px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 18px 42px rgba(23, 23, 23, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 22px;
`;

const MetricBody = styled.div`
  display: flex;
  align-items: center;
  gap: 18px;
`;

const MetricIcon = styled.div`
  width: 56px;
  height: 56px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.green};
  background: rgba(21, 128, 61, 0.1);
`;

const MetricText = styled.div`
  min-width: 0;
`;

const MetricValue = styled.strong`
  display: block;
  font-size: 34px;
  line-height: 1;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.green};
`;

const MetricLabel = styled.span`
  display: block;
  margin-top: 10px;
  font-size: 14px;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.textSecondary};
`;


const RequestsPanel = styled.section`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 24px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 18px 42px rgba(23, 23, 23, 0.05);

  @media (max-width: 680px) {
    padding: 16px;
  }
`;

const SearchGroup = styled.div`
  display: grid;
  gap: 14px;
  margin-bottom: 22px;
`;

const SearchLabel = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const ToolbarRow = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

const SearchInputWrap = styled.div`
  min-width: 0;
`;

const SearchInput = styled.input`
  width: 100%;
  min-height: 44px;
  box-sizing: border-box;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 7px;
  padding: 0 16px;
  font: inherit;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.bgElevated};

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSoft};
  }

  &:focus {
    outline: 2px solid rgba(21, 128, 61, 0.18);
    border-color: rgba(21, 128, 61, 0.42);
  }
`;

const FilterSelectWrap = styled.div`
  width: 190px;
  min-width: 190px;

  @media (max-width: 720px) {
    width: 100%;
    min-width: 0;
  }
`;

const CompactFilterSelect = styled(Select)`
  width: 100%;
`;

const TableWrap = styled.div`
  width: 100%;
  min-width: 0;
  overflow-x: auto;
`;

const RequestsTable = styled.table`
  width: 100%;
  min-width: 900px;
  border-collapse: separate;
  border-spacing: 0;
  table-layout: fixed;

  thead {
    background: ${({ theme }) => theme.colors.bgInset};
  }

  th,
  td {
    padding: 16px 18px;
    text-align: left;
    vertical-align: middle;
  }

  th {
    height: 48px;
    box-sizing: border-box;
    font-size: 12px;
    line-height: 1.2;
    font-weight: 700;
    text-transform: none;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  td {
    height: 64px;
    box-sizing: border-box;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
    font-size: 14px;
    color: ${({ theme }) => theme.colors.textPrimary};
  }

  th:first-child {
    border-radius: 10px 0 0 10px;
    width: 23%;
  }

  th:nth-child(2) {
    width: 13%;
  }

  th:nth-child(3) {
    width: 10%;
  }

  th:nth-child(4) {
    width: 18%;
  }

  th:nth-child(5) {
    width: 18%;
  }

  th:nth-child(6) {
    width: 15%;
  }

  th:last-child {
    border-radius: 0 10px 10px 0;
    width: 13%;
    text-align: center;
  }

  tbody tr {
    background: ${({ theme }) => theme.colors.bgElevated};
    transition: background 160ms ease;
  }

  tbody tr:hover {
    background: ${({ theme }) => theme.colors.bg};
  }
`;

const SortableTh = styled.th``;

const SortButton = styled.button`
  all: unset;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  cursor: pointer;

  &:focus-visible {
    outline: 2px solid rgba(21, 128, 61, 0.24);
    outline-offset: 3px;
    border-radius: 4px;
  }
`;

const DentistCell = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
`;

const Avatar = styled.span`
  width: 34px;
  height: 34px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 999px;
  background: rgba(21, 128, 61, 0.12);
  color: ${({ theme }) => theme.colors.green};
  font-size: 12px;
  font-weight: 800;
`;

const DentistInfo = styled.div`
  min-width: 0;
  display: grid;
  gap: 3px;
`;

const DentistName = styled.strong`
  min-width: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 800;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const DentistMeta = styled.span`
  min-width: 0;
  display: block;
  color: ${({ theme }) => theme.colors.textSoft};
  font-size: 12px;
  line-height: 1.25;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const ClinicCount = styled.td`
  color: ${({ theme }) => theme.colors.green} !important;
  font-weight: 800;
`;

const StatusPill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  max-width: 100%;
  padding: 6px 10px;
  border-radius: 7px;
  color: ${({ $color }) => $color};
  background: ${({ $color }) => `${$color}12`};
  font-size: 14px;
  line-height: 1.2;
`;

const StatusDot = styled.span<{ $color: string }>`
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: ${({ $color }) => $color};
`;

const ActionCell = styled.td`
  text-align: center !important;
`;

const IconButton = styled(Button).attrs({ variant: 'ghost' as const, size: 'sm' as const })`
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 700;
`;

const ViewButton = styled(IconButton)`
  width: 36px;
  min-width: 36px;
  height: 36px;
  min-height: 36px;
  padding: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  border-color: ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.bgInset};
    border-color: ${({ theme }) => theme.colors.borderStrong};
  }
`;

const EmptyCell = styled.td`
  height: 120px;
  text-align: center !important;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const TableFooter = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto auto;
  gap: 28px;
  align-items: center;
  padding-top: 22px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const ResultsText = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const PaginationGroup = styled.nav`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
`;

const PagerButton = styled.button`
  width: 36px;
  height: 36px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 7px;
  display: inline-grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  background: ${({ theme }) => theme.colors.bgElevated};
  cursor: pointer;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const CurrentPage = styled.span`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: inline-grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.bgElevated};
  background: ${({ theme }) => theme.colors.green};
  font-size: 14px;
  font-weight: 800;
  box-shadow: 0 10px 20px rgba(21, 128, 61, 0.22);
`;

const PageSizeControl = styled.label`
  width: 132px;
  min-height: 40px;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: space-between;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 7px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 760px) {
    width: 100%;
  }
`;

const PageSizeSelect = styled.select`
  width: 100%;
  height: 40px;
  padding: 0 36px 0 12px;
  border: 0;
  appearance: none;
  color: inherit;
  background: transparent;
  font: inherit;
  font-size: 13px;
  cursor: pointer;

  &:focus {
    outline: 2px solid rgba(21, 128, 61, 0.18);
    outline-offset: 2px;
  }

  + svg {
    position: absolute;
    right: 12px;
    pointer-events: none;
  }
`;

const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 50;
  padding: 24px;
  display: grid;
  place-items: center;
  background: rgba(23, 23, 23, 0.58);
  backdrop-filter: blur(3px);

  @media (max-width: 1280px) {
    padding: 16px;
  }
`;

const ModalBox = styled.div`
  width: min(900px, 100%);
  max-height: calc(100vh - 48px);
  overflow: auto;
  padding: 28px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 32px 90px rgba(23, 23, 23, 0.28);
  display: flex;
  flex-direction: column;
  gap: 20px;

  @media (max-width: 1280px) {
    max-height: calc(100vh - 32px);
    gap: 16px;
    padding: 20px;
  }

  @media (max-width: 680px) {
    padding: 16px;
    border-radius: 12px;
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  padding-bottom: 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};

  @media (max-width: 1280px) {
    gap: 12px;
    padding-bottom: 16px;
  }
`;

const ModalTitleGroup = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 18px;

  @media (max-width: 680px) {
    gap: 14px;
  }
`;

const ModalHeroIcon = styled.div`
  width: 58px;
  height: 58px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.green};
  background: rgba(21, 128, 61, 0.1);

  @media (max-width: 680px) {
    width: 48px;
    height: 48px;
  }
`;

const ModalTitle = styled.h2`
  margin: 0;
  font-size: 24px;
  line-height: 1.12;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 680px) {
    font-size: 20px;
  }
`;

const ModalSubtitle = styled.p`
  margin: 6px 0 0;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  font-size: 16px;
  line-height: 1.35;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 680px) {
    gap: 8px;
    font-size: 15px;
  }
`;

const InlineDot = styled.span`
  width: 6px;
  height: 6px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.green};
`;

const CloseButton = styled(IconButton)`
  width: 44px;
  height: 44px;
  min-height: 44px;
  padding: 0;
  border: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  background: ${({ theme }) => theme.colors.bgInset};

  &:hover:not(:disabled) {
    background: ${({ theme }) => theme.colors.borderSubtle};
  }
`;

const DetailGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const DetailItem = styled.div<{ $layout?: 'inline' }>`
  min-width: 0;
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 11px;
  background: ${({ theme }) => theme.colors.bgElevated};
  display: ${({ $layout }) => ($layout === 'inline' ? 'flex' : 'block')};
  align-items: center;
  gap: 16px;

  @media (max-width: 680px) {
    padding: 14px;
    gap: 12px;
  }
`;

const DetailIcon = styled.div`
  width: 46px;
  height: 46px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: ${({ theme }) => theme.colors.green};
  background: rgba(21, 128, 61, 0.1);
`;

const DetailContent = styled.div`
  min-width: 0;
  display: grid;
  gap: 6px;
`;

const DetailLabel = styled.strong`
  display: block;
  margin: 0;
  font-size: 16px;
  line-height: 1.25;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 680px) {
    font-size: 14px;
  }
`;

const DetailValue = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

const ClinicList = styled.div`
  display: grid;
  gap: 12px;
`;

const ClinicItem = styled(DetailItem)`
  display: flex;
  align-items: center;
  gap: 16px;

  @media (max-width: 680px) {
    align-items: flex-start;
    gap: 14px;
  }
`;

const ClinicText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 680px) {
    font-size: 14px;
  }
`;

const ClinicMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.35;

  @media (max-width: 680px) {
    gap: 10px;
    font-size: 13px;
  }
`;

const ClinicMetaItem = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;

  svg {
    color: ${({ theme }) => theme.colors.green};
  }
`;

const RejectFieldGroup = styled.div`
  display: grid;
  gap: 8px;
`;

const RejectLabel = styled.label`
  font-size: 14px;
  line-height: 1.3;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

const RejectTextarea = styled.textarea`
  width: 100%;
  min-height: 104px;
  box-sizing: border-box;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 10px;
  resize: vertical;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
  font-size: 14px;
  line-height: 1.5;

  &::placeholder {
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  &:focus {
    outline: 3px solid rgba(21, 128, 61, 0.16);
    border-color: rgba(21, 128, 61, 0.54);
  }
`;

const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  flex-wrap: wrap;

  @media (max-width: 680px) {
    gap: 10px;

    > button {
      width: 100%;
    }
  }
`;

const DangerButton = styled(Button)`
  flex: 0 0 auto;
  min-width: 218px;
  min-height: 48px;
  padding: 0 20px;
  border: 1px solid ${({ theme }) => theme.colors.borderStrong};
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;

  &:disabled {
    opacity: 0.5;
  }

  @media (max-width: 680px) {
    min-width: 0;
  }
`;

const ApproveButton = styled(Button)`
  flex: 0 0 auto;
  min-width: 236px;
  min-height: 48px;
  padding: 0 22px;
  border-radius: 9px;
  background: ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.bgElevated};
  font-size: 14px;
  font-weight: 800;
  text-transform: uppercase;
  box-shadow: 0 12px 24px rgba(21, 128, 61, 0.22);

  @media (max-width: 680px) {
    min-width: 0;
  }
`;
