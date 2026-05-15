import { DataTable, Field, MultiSelect, StatusIndicator, type DataTableColumn } from '@nexor/design-system';
import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../../hooks/useAuth';
import { AdminProductGate } from './AdminProductGate';
import {
   fetchOrders,
  formatDate,
  getAuthToken,
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
  StatCard,
  StatGrid,
  StatLabel,
  StatValue,
  TableSection,
} from './styles';



const STATUS_OPTIONS = [
  { value: 'registration_started', label: 'Pre-requisito pendente' },
  { value: 'awaiting_scheduling', label: 'Aguardando consulta inicial' },
  { value: 'in_progress', label: 'Aguardando decisão clínica' },
  { value: 'awaiting_payment', label: 'Aguardando pagamento' },
  { value: 'awaiting_dentist_forms', label: 'Aguardando preenchimento dentista' },
  { value: 'payment_confirmed', label: 'Pagamento confirmado' },
  { value: 'treatment_required', label: 'Tratamento prévio pendente' },
  { value: 'lab_processing', label: 'Em processo - Laboratório' },
  { value: 'awaiting_adaptation', label: 'Aguardando adaptação' },
  { value: 'follow_up', label: 'Em acompanhamento' },
  { value: 'ineligible_refund', label: 'Inapto - Encerrado' },
  { value: 'cancelled', label: 'Cancelado' },
];

export function AdminOrders() {
  const { selectedProduct } = useAdminPortal();
  const { session } = useAuth();
  const token = getAuthToken(session);
  const [orders, setOrders] = useState<DemoOrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string[]>([]);
  const [stageFilter, setStageFilter] = useState<string[]>([]);

  useEffect(() => {
    if (!selectedProduct || !token) {
      return;
    }

    let active = true;

    async function loadOrders() {
      setLoading(true);

      try {
        const response = await fetchOrders('admin', token);

        if (active) {
          setOrders(response.orders);
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
  }, [selectedProduct, token]);

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
        ? `${order.id} ${order.customer?.full_name ?? ''} ${order.customer?.email ?? ''}`
            .toLowerCase()
            .includes(search.trim().toLowerCase())
        : true;
      const matchesStatus = statusFilter.length === 0 || statusFilter.includes(order.status);
      const matchesStage = stageFilter.length === 0 || stageFilter.includes(order.stage);
      return matchesSearch && matchesStatus && matchesStage;
    });
  }, [orders, search, stageFilter, statusFilter]);

  const stats = useMemo(
    () => [
      { label: 'Casos totais', value: String(orders.length) },
      {
        label: 'Aguardando liberação ao lab',
        value: String(
          orders.filter(
            (order) => order.status === 'awaiting_dentist_forms' && !order.operationalReadiness?.preLabReady
          ).length
        )
      },
      { label: 'Em laboratório', value: String(orders.filter((order) => order.status === 'lab_processing').length) },
      { label: 'Em acompanhamento', value: String(orders.filter((order) => order.status === 'follow_up').length) },
    ],
    [orders]
  );

  const columns: DataTableColumn<DemoOrderSummary>[] = [
    { key: 'id', label: 'Pedido', render: (row) => row.id },
    { key: 'customer', label: 'Cliente', render: (row) => row.customer?.full_name ?? 'Não identificado' },
    {
      key: 'status',
      label: 'Status',
      render: (row) => {
        const presentation = getOrderStatusPresentation(row);
        return <StatusIndicator color={presentation.color} label={presentation.label} />;
      }
    },
    { key: 'stage', label: 'Etapa', render: (row) => getStageLabel(row) },
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
            <StatusIndicator color="#D18A00" label="Aguardando preenchimento dentista" />
            <S.ReadinessText>{readiness?.summary ?? 'Pendencias operacionais antes do laboratório.'}</S.ReadinessText>
          </S.ReadinessCell>
        );
      }
    },
    { key: 'date', label: 'Atualizado em', render: (row) => formatDate(row.created_at) },
  ];

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>Ordens compartilhadas do Biteplaner</PageTitle>
        <PageSubtitle>
          O admin visualiza o mesmo fluxo compartilhado da demo, com filtros por status e etapa para validar propagacao entre perfis e enxergar quando uma ordem ainda depende do preenchimento clínico e documental do dentista antes do laboratório.
        </PageSubtitle>
      </PageHeader>

      <AdminProductGate />

      {selectedProduct ? (
        <>
          <StatGrid>
            {stats.map((stat) => (
              <StatCard key={stat.label} padding="lg">
                <StatValue>{stat.value}</StatValue>
                <StatLabel>{stat.label}</StatLabel>
              </StatCard>
            ))}
          </StatGrid>

          <TableSection padding="lg">
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

            <div data-testid="admin-orders-table">
              <DataTable
                data={filteredOrders}
                columns={columns}
                keyExtractor={(row) => row.id}
                pageSize={6}
                emptyMessage={loading ? 'Carregando ordens...' : 'Nenhuma ordem encontrada para os filtros aplicados.'}
              />
            </div>
          </TableSection>
        </>
      ) : null}
    </PageStack>
  );
}
