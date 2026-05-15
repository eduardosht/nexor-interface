import { Select } from '@nexor/design-system';
import { useEffect, useMemo, useState } from 'react';
import { AdminProductGate } from './AdminProductGate';
import {
   CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useAuth } from '../../../hooks/useAuth';
import { fetchOrders, getAuthToken, type DemoOrderSummary } from '../../../features/demo/biteplanerFlow';
import { useAdminPortal } from '../../../features/admin/portal';
import {
  ChartHeader,
  ChartPanel,
  ChartWrap,
  DashboardFilterBar,
  PageHeader,
  PageStack,
  PageSubtitle,
  PageTitle,
  SectionDescription,
  SectionTitle,
  StatCard,
  StatGrid,
  StatLabel,
  StatValue,
} from './styles';

const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

function getWeekOfMonth(date: Date) {
  const firstDay = new Date(date.getFullYear(), date.getMonth(), 1);
  const offset = firstDay.getDay();
  return Math.ceil((date.getDate() + offset) / 7);
}

function formatWeekLabel(week: number) {
  return `${week}ª semana`;
}

function countByStatus(orders: DemoOrderSummary[], statuses: string[]) {
  return orders.filter((order) => statuses.includes(order.status)).length;
}

export function AdminHome() {
  const { session } = useAuth();
  const token = getAuthToken(session);
  const { products, selectedProductId, selectedProduct, setSelectedProductId } = useAdminPortal();
  const [orders, setOrders] = useState<DemoOrderSummary[]>([]);
  const [loading, setLoading] = useState(false);
  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(String(now.getMonth() + 1));
  const [selectedYear, setSelectedYear] = useState(String(now.getFullYear()));

  useEffect(() => {
    if (!selectedProductId && products[0]) {
      setSelectedProductId(products[0].id);
    }
  }, [products, selectedProductId, setSelectedProductId]);

  useEffect(() => {
    if (!token || !selectedProduct) {
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

  const availableYears = useMemo(() => {
    const years = Array.from(
      new Set([
        ...orders.map((order) => String(new Date(order.created_at).getFullYear())),
        selectedYear,
      ])
    ).sort((left, right) => Number(right) - Number(left));

    return years;
  }, [orders, selectedYear]);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const date = new Date(order.created_at);
      return date.getMonth() + 1 === Number(selectedMonth) && date.getFullYear() === Number(selectedYear);
    });
  }, [orders, selectedMonth, selectedYear]);

  const weeklySeries = useMemo(() => {
    const weekMap = new Map<number, number>();

    filteredOrders.forEach((order) => {
      const week = getWeekOfMonth(new Date(order.created_at));
      weekMap.set(week, (weekMap.get(week) ?? 0) + 1);
    });

    const maxWeek = Math.max(4, ...weekMap.keys(), 0);
    return Array.from({ length: maxWeek }, (_, index) => {
      const week = index + 1;
      return {
        label: formatWeekLabel(week),
        total: weekMap.get(week) ?? 0,
      };
    });
  }, [filteredOrders]);

  const stats = useMemo(
    () => [
      { label: 'Ordens no período', value: loading ? '...' : String(filteredOrders.length) },
      {
        label: 'Fila do laboratório',
        value: loading ? '...' : String(countByStatus(filteredOrders, ['awaiting_lab_start', 'lab_processing'])),
      },
      {
        label: 'Aguardando dentista',
        value: loading ? '...' : String(countByStatus(filteredOrders, ['awaiting_dentist_forms'])),
      },
      {
        label: 'Em adaptação',
        value: loading ? '...' : String(countByStatus(filteredOrders, ['awaiting_adaptation'])),
      },
    ],
    [filteredOrders, loading]
  );

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>Dashboard administrativo</PageTitle>
        <PageSubtitle>
          {selectedProduct
            ? `Acompanhe a evolução operacional semanal das ordens do ${selectedProduct.label}.`
            : 'Acompanhe a evolução operacional semanal das ordens do Biteplaner.'}
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

          <ChartPanel padding="lg">
            <ChartHeader>
              <div>
                <SectionTitle>Ordens por semana</SectionTitle>
                <SectionDescription>
                  Leitura temporal das ordens criadas no período selecionado, organizada por semana do mês.
                </SectionDescription>
              </div>
              <DashboardFilterBar>
                <Select
                  label="Mês"
                  value={selectedMonth}
                  onChange={(value) => {
                    setSelectedMonth(value);
                  }}
                  options={MONTH_LABELS.map((label, index) => ({
                    label,
                    value: String(index + 1),
                  }))}
                />
                <Select
                  label="Ano"
                  value={selectedYear}
                  onChange={(value) => {
                    setSelectedYear(value);
                  }}
                  options={availableYears.map((year) => ({
                    label: year,
                    value: year,
                  }))}
                />
              </DashboardFilterBar>
            </ChartHeader>

            <ChartWrap>
              <ResponsiveContainer width="100%" height={360}>
                <LineChart data={weeklySeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                  <CartesianGrid stroke="#E7E7E7" strokeDasharray="4 4" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} />
                  <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: '1px solid #E0E0E0',
                      boxShadow: '0 10px 32px rgba(0, 0, 0, 0.12)',
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="total"
                    stroke="#171717"
                    strokeWidth={3}
                    dot={{ r: 4, strokeWidth: 0, fill: '#171717' }}
                    activeDot={{ r: 6, strokeWidth: 0, fill: '#171717' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartWrap>
          </ChartPanel>
        </>
      ) : null}
    </PageStack>
  );
}
