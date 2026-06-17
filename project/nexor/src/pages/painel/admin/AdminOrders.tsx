import {
  Button,
  AdminDataTable,
  AdminMetricGrid,
  AdminMobileActionButton,
  AdminMobilePagination,
  AdminMobileRecordCard,
  AdminResponsiveCollection,
  AdminStatusPill,
  Field,
  FilterSheet,
  MultiSelect,
  StatusIndicator,
  type AdminDataTableColumn,
  type AdminMetric,
} from '@nexor/design-system';
import { useEffect, useMemo, useState } from 'react';
import { SkeletonTable } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { AdminProductGate } from './AdminProductGate';
import {
   fetchOrders,
  formatDate,
  getAuthToken,
  getOrderDisplayId,
  getOrderStatusPresentation,
  getStageLabel,
  type DemoOrderSummary,
} from '../../../features/demo/biteplanerFlow';
import { useAdminPortal } from '../../../features/admin/portal';
import * as S from './AdminOrders.styles';
import {
  FilterBar,
  PageHeader,
  PageStack,
  PageSubtitle,
  PageTitle,
  TableSection,
} from './styles';



const STATUS_OPTIONS = [
  { value: 'registration_started', label: 'Pré-requisito pendente' },
  { value: 'awaiting_scheduling', label: 'Aguardando consulta inicial' },
  { value: 'in_progress', label: 'Aguardando confirmação de consulta' },
  { value: 'appointment_confirmed', label: 'Aguardando decisão clínica' },
  { value: 'awaiting_payment', label: 'Aguardando pagamento' },
  { value: 'awaiting_dentist_forms', label: 'Aguardando envio ao laboratório' },
  { value: 'payment_confirmed', label: 'Pagamento confirmado' },
  { value: 'treatment_required', label: 'Tratamento prévio pendente' },
  { value: 'lab_processing', label: 'Em processo - Laboratório' },
  { value: 'awaiting_adaptation', label: 'Aguardando adaptação' },
  { value: 'follow_up', label: 'Em acompanhamento' },
  { value: 'ineligible_reassessment', label: 'Inaptidão' },
  { value: 'cancelled', label: 'Cancelado' },
];

const MOBILE_PAGE_SIZE = 6;
const ADMIN_ORDER_PAGE_SIZE = 30;

export function AdminOrders() {
  const { selectedProduct } = useAdminPortal();
  const { session } = useAuth();
  const token = getAuthToken(session);
  const [orders, setOrders] = useState<DemoOrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [stageFilter, setStageFilter] = useState<string[]>([]);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [mobilePage, setMobilePage] = useState(1);
  const [draftStatusFilter, setDraftStatusFilter] = useState<string[]>([]);
  const [draftStageFilter, setDraftStageFilter] = useState<string[]>([]);
  const [hasMoreOrders, setHasMoreOrders] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const serverStatusFilter = statusFilter.length === 1 ? statusFilter[0] : undefined;

  useEffect(() => {
    if (!selectedProduct || !token) {
      return;
    }

    let active = true;

    async function loadOrders() {
      setLoading(true);

      try {
        const response = await fetchOrders('admin', token, {
          status: serverStatusFilter,
          limit: ADMIN_ORDER_PAGE_SIZE,
        });

        if (active && response !== undefined) {
          setOrders(response.orders);
          setHasMoreOrders(response.orders.length === ADMIN_ORDER_PAGE_SIZE);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrders();

    return () => {
      active = false;
    };
  }, [selectedProduct, serverStatusFilter, token]);

  async function loadMoreOrders() {
    if (!selectedProduct || !token || orders.length === 0 || loadingMore) {
      return;
    }

    const cursor = orders[orders.length - 1]?.created_at;

    if (!cursor) {
      return;
    }

    setLoadingMore(true);

    try {
      const response = await fetchOrders('admin', token, {
        status: serverStatusFilter,
        limit: ADMIN_ORDER_PAGE_SIZE,
        createdBefore: cursor,
      });

      setOrders((current) => {
        const existingIds = new Set(current.map((order) => order.id));
        const nextOrders = response.orders.filter((order) => !existingIds.has(order.id));
        return [...current, ...nextOrders];
      });
      setHasMoreOrders(response.orders.length === ADMIN_ORDER_PAGE_SIZE);
    } finally {
      setLoadingMore(false);
    }
  }

  const stageOptions = useMemo(
    () =>
      Array.from(new Set(orders.map((order) => order.stage))).map((stage) => {
        const sample = orders.find((order) => order.stage === stage);

        return {
          value: stage,
          label: sample ? getStageLabel(sample) : stage,
        };
      }),
    [orders]
  );

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const matchesSearch = search.trim()
        ? `${getOrderDisplayId(order)} ${order.id} ${order.customer?.full_name ?? ''} ${order.customer?.email ?? ''}`
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        : true;
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(order.status);
      const matchesStage = stageFilter.length === 0 || stageFilter.includes(order.stage);
      return matchesSearch && matchesStatus && matchesStage;
    });
  }, [orders, search, stageFilter, statusFilter]);

  const activeFilterLabels = useMemo(() => {
    const statusLabels = statusFilter
      .map((value) => STATUS_OPTIONS.find((option) => option.value === value)?.label)
      .filter((label): label is string => Boolean(label))
      .map((label) => `Status: ${label}`);
    const stageLabels = stageFilter
      .map((value) => stageOptions.find((option) => option.value === value)?.label)
      .filter((label): label is string => Boolean(label))
      .map((label) => `Etapa: ${label}`);

    return [...statusLabels, ...stageLabels];
  }, [stageFilter, stageOptions, statusFilter]);

  useEffect(() => {
    setMobilePage(1);
  }, [search, stageFilter, statusFilter]);

  const mobileTotalPages = Math.max(1, Math.ceil(filteredOrders.length / MOBILE_PAGE_SIZE));
  const safeMobilePage = Math.min(mobilePage, mobileTotalPages);
  const visibleMobileOrders = useMemo(() => {
    const start = (safeMobilePage - 1) * MOBILE_PAGE_SIZE;
    return filteredOrders.slice(start, start + MOBILE_PAGE_SIZE);
  }, [filteredOrders, safeMobilePage]);

  const stats = useMemo<AdminMetric[]>(
    () => [
      { label: 'Casos totais', value: String(orders.length), tone: 'success' },
      {
        label: 'Aguardando liberação ao lab',
        value: String(
          orders.filter(
            (order) => order.status === 'awaiting_dentist_forms' && !order.operationalReadiness?.preLabReady
          ).length
        ),
        tone: 'success',
      },
      { label: 'Em laboratório', value: String(orders.filter((order) => order.status === 'lab_processing').length), tone: 'success' },
      { label: 'Em acompanhamento', value: String(orders.filter((order) => order.status === 'follow_up').length), tone: 'success' },
    ],
    [orders]
  );

  const columns: AdminDataTableColumn<DemoOrderSummary>[] = [
    {
      key: 'id',
      label: 'Pedido',
      width: '9%',
      sortValue: (row) => getOrderDisplayId(row),
      render: (row) => getOrderDisplayId(row)
    },
    { key: 'customer', label: 'Cliente', sortValue: (row) => row.customer?.full_name ?? '', render: (row) => row.customer?.full_name ?? 'Não identificado' },
    {
      key: 'status',
      label: 'Status',
      sortValue: (row) => getOrderStatusPresentation(row).label,
      render: (row) => {
        const presentation = getOrderStatusPresentation(row);
        return <AdminStatusPill color={presentation.color} label={presentation.label} />;
      }
    },
    { key: 'stage', label: 'Etapa', sortValue: (row) => getStageLabel(row), render: (row) => getStageLabel(row) },
    {
      key: 'readiness',
      label: 'Prontidao operacional',
      render: (row) => {
        const isAwaitingLabRelease = row.status === 'awaiting_dentist_forms';
        const readiness = row.operationalReadiness;

        if (!isAwaitingLabRelease) {
          return (
            <S.ReadinessCell>
              <StatusIndicator color="#737373" label="Não se aplica nesta etapa" />
            </S.ReadinessCell>
          );
        }

        if (readiness?.preLabReady) {
          return (
            <S.ReadinessCell>
              <StatusIndicator color="#15803D" label="Liberado para envio ao laboratório" />
              <S.ReadinessText>{readiness.summary}</S.ReadinessText>
            </S.ReadinessCell>
          );
        }

        return (
          <S.ReadinessCell>
            <StatusIndicator color="#D18A00" label="Aguardando envio ao laboratório" />
            <S.ReadinessText>{readiness?.summary ?? 'Pendências operacionais antes do laboratório.'}</S.ReadinessText>
          </S.ReadinessCell>
        );
      }
    },
    { key: 'date', label: 'Atualizado em', sortValue: (row) => new Date(row.created_at).getTime(), render: (row) => formatDate(row.created_at) },
  ];

  function openMobileFilters() {
    setDraftStatusFilter(statusFilter);
    setDraftStageFilter(stageFilter);
    setMobileFiltersOpen(true);
  }

  function closeMobileFilters() {
    setDraftStatusFilter(statusFilter);
    setDraftStageFilter(stageFilter);
    setMobileFiltersOpen(false);
  }

  function clearDraftMobileFilters() {
    setDraftStatusFilter([]);
    setDraftStageFilter([]);
  }

  function applyMobileFilters() {
    setStatusFilter(draftStatusFilter);
    setStageFilter(draftStageFilter);
    setMobileFiltersOpen(false);
  }

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>Ordens compartilhadas do Biteplaner</PageTitle>
        <PageSubtitle>
          O admin visualiza o mesmo fluxo compartilhado da demo, com filtros por status e etapa para validar propagação entre perfis e enxergar quando uma ordem ainda depende do preenchimento clínico e documental do dentista antes do laboratório.
        </PageSubtitle>
      </PageHeader>

      <AdminProductGate />

      {selectedProduct ? (
        <>
          <AdminMetricGrid metrics={stats} columns={4} />

          <TableSection padding="lg">
            <S.DesktopFilters>
              <FilterBar>
                <Field
                  as="input"
                  label="Buscar"
                  placeholder="Buscar por pedido, cliente ou e-mail..."
                  value={search}
                  onChange={(event) => {
                    setSearch(event.target.value);
                  }}
                />

                <div data-testid="admin-orders-filter-status">
                  <MultiSelect
                    options={STATUS_OPTIONS}
                    value={statusFilter}
                    onChange={setStatusFilter}
                    placeholder="Todos os status"
                    label="Status"
                  />
                </div>

                <div data-testid="admin-orders-filter-stage">
                  <MultiSelect
                    options={stageOptions}
                    value={stageFilter}
                    onChange={setStageFilter}
                    placeholder="Todas as etapas"
                    label="Etapa"
                  />
                </div>
              </FilterBar>
            </S.DesktopFilters>

            <S.MobileFilterTriggerRow>
              <Field
                as="input"
                label="Buscar"
                placeholder="Pedido, cliente ou e-mail"
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                }}
              />
              <Button type="button" variant="secondary" onClick={openMobileFilters}>
                Abrir filtros de ordens
              </Button>
            </S.MobileFilterTriggerRow>

            {activeFilterLabels.length > 0 ? (
              <S.FilterChipRow aria-label="Filtros ativos">
                {activeFilterLabels.map((label) => (
                  <S.FilterChip key={label}>{label}</S.FilterChip>
                ))}
              </S.FilterChipRow>
            ) : null}

            {loading && orders.length === 0 ? (
              <SkeletonTable rows={6} columns={5} />
            ) : (
              <AdminResponsiveCollection
                renderTable={() => (
                  <AdminDataTable
                    data={filteredOrders}
                    columns={columns}
                    keyExtractor={(row) => row.id}
                    pageSize={6}
                    emptyMessage="Nenhuma ordem encontrada para os filtros aplicados."
                    testId="admin-orders-table"
                  />
                )}
                items={visibleMobileOrders}
                getItemKey={(row) => row.id}
                emptyState="Nenhuma ordem encontrada para os filtros aplicados."
                renderCard={(row) => {
                  const presentation = getOrderStatusPresentation(row);

                return (
                  <AdminMobileRecordCard
                    testId={`admin-order-card-${row.id}`}
                    title={getOrderDisplayId(row)}
                    subtitle={row.customer?.full_name ?? 'Não identificado'}
                    status={<StatusIndicator color={presentation.color} label={presentation.label} />}
                    metadata={[
                      { label: 'Etapa', value: getStageLabel(row) },
                      { label: 'Atualizado', value: formatDate(row.created_at) },
                    ]}
                    primaryAction={
                      <AdminMobileActionButton type="button" aria-label={`Ver pedido ${getOrderDisplayId(row)}`}>
                        Ver pedido
                      </AdminMobileActionButton>
                    }
                  >
                    <S.ReadinessText>
                      {row.operationalReadiness?.summary ?? 'Sem pendência operacional registrada.'}
                    </S.ReadinessText>
                  </AdminMobileRecordCard>
                );
                }}
                mobileTestId="admin-orders-mobile-list"
                desktopTestId="admin-orders-desktop-list"
                pagination={
                  <AdminMobilePagination
                    page={safeMobilePage}
                    pageSize={MOBILE_PAGE_SIZE}
                    totalItems={filteredOrders.length}
                    onPrevious={() => setMobilePage((current) => Math.max(1, current - 1))}
                    onNext={() => setMobilePage((current) => Math.min(mobileTotalPages, current + 1))}
                  />
                }
              />
            )}

            {hasMoreOrders ? (
              <S.LoadMoreRow>
                <Button type="button" variant="secondary" onClick={loadMoreOrders} disabled={loadingMore}>
                  {loadingMore ? 'Carregando ordens...' : 'Carregar mais ordens'}
                </Button>
              </S.LoadMoreRow>
            ) : null}

            <FilterSheet
              open={mobileFiltersOpen}
              title="Filtros de ordens"
              onClose={closeMobileFilters}
              onClear={clearDraftMobileFilters}
              onApply={applyMobileFilters}
            >
              <S.FilterSheetGrid>
                <div data-testid="admin-orders-mobile-filter-status">
                  <MultiSelect
                    options={STATUS_OPTIONS}
                    value={draftStatusFilter}
                    onChange={setDraftStatusFilter}
                    placeholder="Todos os status"
                    label="Status"
                  />
                </div>

                <div data-testid="admin-orders-mobile-filter-stage">
                  <MultiSelect
                    options={stageOptions}
                    value={draftStageFilter}
                    onChange={setDraftStageFilter}
                    placeholder="Todas as etapas"
                    label="Etapa"
                  />
                </div>
              </S.FilterSheetGrid>
            </FilterSheet>
          </TableSection>
        </>
      ) : null}
    </PageStack>
  );
}
