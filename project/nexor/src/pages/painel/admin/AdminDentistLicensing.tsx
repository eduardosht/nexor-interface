import { useEffect, useMemo, useState } from "react";
import {
  AdminDataTable,
  AdminModal,
  AdminModalDetailCard,
  AdminModalDetailIcon,
  AdminModalDetailLabel,
  AdminModalDetailValue,
  AdminModalTextArea,
  AdminModalTextAreaGroup,
  AdminModalTextAreaLabel,
  Button,
  Select,
  type AdminDataTableColumn,
} from "@nexor/design-system";
import {
  CheckCircle2,
  Clock3,
  Eye,
  Filter,
  FileText,
  Search,
  ShieldCheck,
  UserRoundCheck,
  XCircle,
} from "lucide-react";
import styled from "styled-components";
import { SkeletonGrid, SkeletonTable } from "../../../components/Skeleton";
import { useAuth } from "../../../hooks/useAuth";
import { useDebouncedValue } from "../../../hooks/useDebouncedValue";
import { useAdminPortal } from "../../../features/admin/portal";
import {
  PortalPageDescription,
  PortalPageTitle,
} from "../styles/portalTypography";
import {
  approveDentistLicenseRequest,
  fetchDentistLicenseRequests,
  formatDate,
  getAuthToken,
  rejectDentistLicenseRequest,
  type DentistLicenseRequest,
} from "../../../features/demo/biteplanerFlow";
import { PageStack } from "./styles";
import { AdminProductGate } from "./AdminProductGate";
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
} from "./mobileCards";

const statusLabel: Record<string, string> = {
  pending: "Aguardando análise",
  active: "Aprovado",
  rejected: "Recusado",
  suspended: "Suspenso",
};

const workflowLabel: Record<string, string> = {
  admin_review_pending: "Aguardando análise",
  approved_pending_payment: "Licenciado",
  payment_confirmed_pending_intention_contract: "Pagamento confirmado",
  course_in_progress: "Curso em andamento",
  licensing_contract_pending: "Contrato final pendente",
  licensed: "Licenciado",
  admin_rejected: "Recusado",
  distrato_pending: "Distrato pendente",
  distrato_signed: "Distrato assinado",
};

const statusFilterOptions = [
  { value: "all", label: "Todos os filtros" },
  { value: "pending", label: "Aguardando análise" },
  { value: "active", label: "Aprovados" },
  { value: "rejected", label: "Recusados" },
  { value: "licensed", label: "Licenciados" },
];

function getStatusColor(status: string) {
  if (
    status === "active" ||
    status === "licensed" ||
    status === "approved_pending_payment"
  )
    return "#15803d";
  if (status === "rejected" || status === "admin_rejected") return "#b91c1c";
  return "#d18a00";
}

function getInitials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "NI";
  return parts
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

function canReviewRequest(request: DentistLicenseRequest) {
  return request.status === "pending";
}

export function AdminDentistLicensing() {
  const { selectedProduct } = useAdminPortal();
  const { session } = useAuth();
  const token = getAuthToken(session);
  const [requests, setRequests] = useState<DentistLicenseRequest[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedRequest, setSelectedRequest] =
    useState<DentistLicenseRequest | null>(null);
  const [rejectReason, setRejectReason] = useState("");
  const [activeAction, setActiveAction] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const debouncedSearch = useDebouncedValue(search, 300);

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
    const query = debouncedSearch.trim().toLowerCase();
    const visibleByStatus = requests.filter((request) => {
      if (statusFilter === "all") return true;
      if (statusFilter === "licensed") {
        return (
          request.workflowStatus === "licensed" ||
          request.workflowStatus === "approved_pending_payment"
        );
      }
      return request.status === statusFilter;
    });

    if (!query) return visibleByStatus;

    return visibleByStatus.filter((request) => `${request.dentistName} ${request.croNumber}`.toLowerCase().includes(query));
  }, [debouncedSearch, requests, statusFilter]);

  const stats = useMemo(
    () => [
      {
        label: "Aguardando análise",
        value: requests.filter((item) => item.status === "pending").length,
        Icon: Clock3,
        tone: "success" as const,
      },
      {
        label: "Aprovados em onboarding",
        value: requests.filter((item) => item.status === "active").length,
        Icon: CheckCircle2,
        tone: "success" as const,
      },
      {
        label: "Recusados",
        value: requests.filter((item) => item.status === "rejected").length,
        Icon: XCircle,
        tone: "danger" as const,
      },
      {
        label: "Licenciados",
        value: requests.filter(
          (item) =>
            item.workflowStatus === "licensed" ||
            item.workflowStatus === "approved_pending_payment",
        ).length,
        Icon: ShieldCheck,
        tone: "success" as const,
      },
    ],
    [requests],
  );

  function updateSearch(value: string) {
    setSearch(value);
  }

  function updateStatusFilter(value: string) {
    setStatusFilter(value);
  }

  async function handleApprove() {
    if (!selectedRequest || !token) return;
    setActiveAction("approve");
    try {
      await approveDentistLicenseRequest(selectedRequest.id, token);
      setSelectedRequest(null);
      setRejectReason("");
      await loadRequests();
    } finally {
      setActiveAction("");
    }
  }

  async function handleReject() {
    if (!selectedRequest || !token || !rejectReason.trim()) return;
    setActiveAction("reject");
    try {
      await rejectDentistLicenseRequest(
        selectedRequest.id,
        rejectReason.trim(),
        token,
      );
      setSelectedRequest(null);
      setRejectReason("");
      await loadRequests();
    } finally {
      setActiveAction("");
    }
  }

  const columns = useMemo<AdminDataTableColumn<DentistLicenseRequest>[]>(
    () => [
      {
        key: "dentist",
        label: "Dentista",
        width: "23%",
        sortValue: (request) => request.dentistName,
        render: (request) => (
          <DentistCell>
            <Avatar aria-hidden>{getInitials(request.dentistName)}</Avatar>
            <DentistInfo>
              <DentistName>
                {request.dentistName || "Não informado"}
              </DentistName>
              <DentistMeta>{request.croNumber || "CRO não informado"}</DentistMeta>
            </DentistInfo>
          </DentistCell>
        ),
      },
      {
        key: "cro",
        label: "CRO",
        width: "13%",
        sortValue: (request) => request.croNumber,
        render: (request) => request.croNumber || "Não informado",
      },
      {
        key: "status",
        label: "Status",
        width: "18%",
        sortValue: (request) => statusLabel[request.status] ?? request.status,
        render: (request) => (
          <StatusPill $color={getStatusColor(request.status)}>
            <StatusDot $color={getStatusColor(request.status)} />
            {statusLabel[request.status] ?? request.status}
          </StatusPill>
        ),
      },
      {
        key: "workflow",
        label: "Fluxo",
        width: "18%",
        sortValue: (request) =>
          workflowLabel[request.workflowStatus] ?? request.workflowStatus,
        render: (request) =>
          workflowLabel[request.workflowStatus] ?? request.workflowStatus,
      },
      {
        key: "submittedAt",
        label: "Enviado em",
        width: "15%",
        sortValue: (request) => new Date(request.submittedAt).getTime(),
        render: (request) => formatDate(request.submittedAt),
      },
      {
        key: "view",
        label: "Visualizar",
        width: "13%",
        align: "center",
        render: (request) =>
          canReviewRequest(request) ? (
            <ViewButton
              type="button"
              aria-label={`Visualizar solicitação de ${request.dentistName}`}
              title="Visualizar"
              onClick={() => {
                setSelectedRequest(request);
                setRejectReason("");
              }}
            >
              <Eye size={16} aria-hidden />
            </ViewButton>
          ) : null,
      },
    ],
    [],
  );

  return (
    <PageStack>
      <AdminHero>
        <HeroIcon aria-hidden>
          <UserRoundCheck size={26} />
        </HeroIcon>
        <HeroCopy>
          <AdminTitle>Dentistas querendo se licenciar</AdminTitle>
          <AdminSubtitle>
            Solicitações enviadas por dentistas para análise da Nexor Admin. A aprovação libera a licença necessária para compra do Biteplaner.
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
                <MetricCard key={stat.label} $tone={stat.tone}>
                  <MetricBody>
                    <MetricIcon $tone={stat.tone} aria-hidden>
                      <stat.Icon size={22} />
                    </MetricIcon>
                    <MetricText>
                      <MetricValue $tone={stat.tone}>{stat.value}</MetricValue>
                      <MetricLabel $tone={stat.tone}>{stat.label}</MetricLabel>
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
                    placeholder="Buscar por nome ou CRO..."
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
              <AdminDataTable
                data={filteredRequests}
                columns={columns}
                keyExtractor={(request) => request.id}
                emptyMessage="Nenhuma solicitação encontrada."
                pageSize={10}
                initialSortKey="submittedAt"
                initialSortDirection="desc"
                testId="admin-dentist-requests-table"
                mobileTestId="admin-dentist-requests-mobile-list"
                renderMobileCard={(request) => (
                  <AdminMobileCard>
                    <AdminMobileCardHeader>
                      <div>
                        <AdminMobileCardTitle>
                          {request.dentistName || "Não informado"}
                        </AdminMobileCardTitle>
                        <AdminMobileCardSubtitle>
                          {request.croNumber || "CRO não informado"}
                        </AdminMobileCardSubtitle>
                      </div>
                      <StatusPill $color={getStatusColor(request.status)}>
                        <StatusDot $color={getStatusColor(request.status)} />
                        {statusLabel[request.status] ?? request.status}
                      </StatusPill>
                    </AdminMobileCardHeader>
                    <AdminMobileMetaGrid>
                      <AdminMobileMetaItem>
                        <AdminMobileMetaLabel>CRO</AdminMobileMetaLabel>
                      <AdminMobileMetaValue>
                          {request.croNumber || "Não informado"}
                        </AdminMobileMetaValue>
                      </AdminMobileMetaItem>
                      <AdminMobileMetaItem>
                        <AdminMobileMetaLabel>Fluxo</AdminMobileMetaLabel>
                        <AdminMobileMetaValue>
                          {workflowLabel[request.workflowStatus] ??
                            request.workflowStatus}
                        </AdminMobileMetaValue>
                      </AdminMobileMetaItem>
                      <AdminMobileMetaItem>
                        <AdminMobileMetaLabel>Enviado em</AdminMobileMetaLabel>
                        <AdminMobileMetaValue>
                          {formatDate(request.submittedAt)}
                        </AdminMobileMetaValue>
                      </AdminMobileMetaItem>
                    </AdminMobileMetaGrid>
                    {canReviewRequest(request) ? (
                      <AdminMobileActions>
                        <AdminMobileActionButton
                          type="button"
                          aria-label={`Abrir dados do dentista ${request.dentistName}`}
                          onClick={() => {
                            setSelectedRequest(request);
                            setRejectReason("");
                          }}
                        >
                          Revisar solicitação
                        </AdminMobileActionButton>
                      </AdminMobileActions>
                    ) : null}
                  </AdminMobileCard>
                )}
              />
            )}
          </RequestsPanel>
        </>
      ) : null}

      <AdminModal
        open={Boolean(selectedRequest)}
        title="Revisar licenciamento do dentista"
        ariaLabel="Revisar licenciamento do dentista"
        mobilePlacement="center"
        icon={<UserRoundCheck size={32} />}
        subtitle={
          selectedRequest ? (
            <ModalSubtitleInline>
              <span>{selectedRequest.dentistName}</span>
              <InlineDot aria-hidden />
              <span>{selectedRequest.croNumber}</span>
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
                disabled={
                  activeAction === "reject" ||
                  !rejectReason.trim() ||
                  selectedRequest.status !== "pending"
                }
                onClick={handleReject}
              >
                {activeAction === "reject"
                  ? "Recusando..."
                  : "Recusar cadastro"}
              </CompactModalButton>
              <CompactModalButton
                type="button"
                disabled={
                  activeAction === "approve" ||
                  selectedRequest.status !== "pending"
                }
                $tone="success"
                onClick={handleApprove}
              >
                {activeAction === "approve"
                  ? "Aprovando..."
                  : "Aprovar cadastro"}
              </CompactModalButton>
            </CompactModalActions>
          ) : null
        }
      >
        {selectedRequest ? (
          <>
            <ModalDecisionText>
              Deseja aprovar ou recusar o licenciamento deste dentista?
            </ModalDecisionText>

            <CompactModalPairGrid>
              <CompactModalDetailCard>
                <CompactModalCardHeader>
                  <CompactModalDetailIcon aria-hidden>
                    <FileText size={18} />
                  </CompactModalDetailIcon>
                  <CompactModalDetailLabel>CRO</CompactModalDetailLabel>
                </CompactModalCardHeader>
                <CompactModalCardBody>
                  <CompactModalDetailValue>
                    {selectedRequest.croNumber || "Não informado"}
                  </CompactModalDetailValue>
                </CompactModalCardBody>
              </CompactModalDetailCard>
              <CompactModalDetailCard>
                <CompactModalCardHeader>
                  <CompactModalDetailIcon aria-hidden>
                    <FileText size={18} />
                  </CompactModalDetailIcon>
                  <CompactModalDetailLabel>
                    Enviado em
                  </CompactModalDetailLabel>
                </CompactModalCardHeader>
                <CompactModalCardBody>
                  <CompactModalDetailValue>
                    {formatDate(selectedRequest.submittedAt)}
                  </CompactModalDetailValue>
                </CompactModalCardBody>
              </CompactModalDetailCard>
            </CompactModalPairGrid>

            <CompactModalTextAreaGroup>
              <CompactModalTextAreaLabel htmlFor="dentist-reject-reason">
                Motivo da recusa
              </CompactModalTextAreaLabel>
              <CompactModalTextArea
                id="dentist-reject-reason"
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

const AdminHero = styled.header`
  width: 100%;
  min-width: 0;
  display: flex;
  align-items: flex-start;
  gap: 22px;
  position: relative;

  &::after {
    content: "";
    position: absolute;
    right: 0;
    top: -28px;
    width: 88px;
    height: 112px;
    opacity: 0.32;
    background-image: radial-gradient(
      circle,
      rgba(21, 128, 61, 0.35) 1.8px,
      transparent 2px
    );
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

const AdminTitle = PortalPageTitle;

const AdminSubtitle = styled(PortalPageDescription)`
  margin: 12px 0 0;
`;

type MetricTone = "success" | "danger";

const MetricsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1180px) {
    gap: 14px;
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 10px;
  }
`;

const MetricCard = styled.article<{ $tone: MetricTone }>`
  min-width: 0;
  min-height: 96px;
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 18px 42px rgba(23, 23, 23, 0.06);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 14px;

  @media (max-width: 640px) {
    min-height: 86px;
    padding: 12px;
    gap: 10px;
  }
`;

const MetricBody = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const MetricIcon = styled.div<{ $tone: MetricTone }>`
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  display: grid;
  place-items: center;
  border-radius: 999px;
  color: ${({ theme, $tone }) =>
    $tone === "danger" ? theme.colors.error : theme.colors.green};
  background: ${({ theme, $tone }) =>
    `${$tone === "danger" ? theme.colors.error : theme.colors.green}1A`};

  @media (max-width: 640px) {
    width: 36px;
    height: 36px;
  }
`;

const MetricText = styled.div`
  min-width: 0;
`;

const MetricValue = styled.strong<{ $tone: MetricTone }>`
  display: block;
  font-size: 28px;
  line-height: 1;
  font-weight: 700;
  color: ${({ theme, $tone }) =>
    $tone === "danger" ? theme.colors.error : theme.colors.green};

  @media (max-width: 640px) {
    font-size: 22px;
  }
`;

const MetricLabel = styled.span<{ $tone: MetricTone }>`
  display: block;
  margin-top: 6px;
  font-size: 13px;
  line-height: 1.35;
  color: ${({ theme, $tone }) =>
    $tone === "danger" ? theme.colors.error : theme.colors.textSecondary};

  @media (max-width: 640px) {
    font-size: 12px;
  }
`;

const RequestsPanel = styled.section`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  padding: 18px;
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
  gap: 10px;
  margin-bottom: 16px;
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

const ModalDecisionText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.45;
  font-weight: 650;
`;

const CompactModalPairGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 6px;

  @media (max-width: 360px) {
    gap: 5px;
  }
`;

const CompactModalDetailCard = styled(AdminModalDetailCard) <{
  $fullWidth?: boolean;
}>`
  grid-column: ${({ $fullWidth }) => ($fullWidth ? "1 / -1" : "auto")};
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

const CompactModalButton = styled(Button) <{ $tone?: "success" }>`
  flex: 0 1 calc(50% - 5px);
  min-width: 0;
  min-height: 38px;
  padding-inline: 10px;
  white-space: normal;
  background: ${({ theme, $tone }) =>
    $tone === "success" ? theme.colors.green : undefined};
  border-color: ${({ theme, $tone }) =>
    $tone === "success" ? theme.colors.green : undefined};
  color: ${({ theme, $tone }) =>
    $tone === "success" ? theme.colors.bgElevated : undefined};

  [data-button-content],
  [data-button-label] {
    min-width: 0;
    white-space: normal;
    text-wrap: balance;
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
  font-weight: 700;
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
  font-weight: 700;
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

const IconButton = styled(Button).attrs({
  variant: "ghost" as const,
  size: "sm" as const,
})`
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
