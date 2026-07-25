import { Select } from '@nexor/design-system';
import { useEffect, useMemo, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { SkeletonBlock, SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import { api } from '../../../lib/api';
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

type DashboardRange = '1y' | '5y' | 'all';

type DashboardResponse = {
  metrics: {
    licensedDentists: number;
    pendingDentistLicenses: number;
    biteplanerOrders: number;
    ordersWaitingForLab: number;
  };
  licensedSeries: Array<{ label: string; total: number }>;
};

const RANGE_OPTIONS = [
  { value: '1y', label: '1 ano' },
  { value: '5y', label: '5 anos' },
  { value: 'all', label: 'Tudo' },
];

const EMPTY_DASHBOARD: DashboardResponse = {
  metrics: {
    licensedDentists: 0,
    pendingDentistLicenses: 0,
    biteplanerOrders: 0,
    ordersWaitingForLab: 0,
  },
  licensedSeries: [],
};

export function AdminHome() {
  const { session } = useAuth();
  const token = session?.access_token;
  const [range, setRange] = useState<DashboardRange>('1y');
  const [dashboard, setDashboard] = useState<DashboardResponse>(EMPTY_DASHBOARD);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function loadDashboard() {
      setLoading(true);
      setError('');

      try {
        const response = await api.get<DashboardResponse>(`/v1/admin/commerce/dashboard?range=${range}`, token);

        if (active) {
          setDashboard(response);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar o dashboard commerce.');
          setDashboard(EMPTY_DASHBOARD);
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadDashboard();

    return () => {
      active = false;
    };
  }, [range, token]);

  const stats = useMemo(
    () => [
      { label: 'Dentistas licenciados', value: dashboard.metrics.licensedDentists },
      { label: 'Solicitações pendentes', value: dashboard.metrics.pendingDentistLicenses },
      { label: 'Pedidos Biteplaner', value: dashboard.metrics.biteplanerOrders },
      { label: 'Aguardando envio ao laboratório', value: dashboard.metrics.ordersWaitingForLab },
    ],
    [dashboard.metrics]
  );

  return (
    <PageStack>
      <PageHeader>
        <PageTitle>Dashboard administrativo</PageTitle>
        <PageSubtitle>
          Visão commerce da operação Biteplaner: licenciamento de dentistas, pedidos e fila de envio ao laboratório.
        </PageSubtitle>
      </PageHeader>

      {error ? <p role="alert">{error}</p> : null}

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

      <ChartPanel padding="lg">
        <ChartHeader>
          <div>
            <SectionTitle>Licenciados por período</SectionTitle>
            <SectionDescription>
              O filtro de 1 ano exibe a evolução mensal. Os filtros de 5 anos e Tudo exibem a evolução anual.
            </SectionDescription>
          </div>
          <DashboardFilterBar>
            <Select
              label="Período"
              value={range}
              onChange={(value) => setRange(value as DashboardRange)}
              options={RANGE_OPTIONS}
            />
          </DashboardFilterBar>
        </ChartHeader>

        <ChartWrap>
          {loading ? (
            <SkeletonBlock height="360px" />
          ) : (
            <ResponsiveContainer width="100%" height={360}>
              <BarChart data={dashboard.licensedSeries} margin={{ top: 8, right: 12, left: -12, bottom: 0 }}>
                <CartesianGrid stroke="#E7E7E7" strokeDasharray="4 4" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} />
                <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={36} />
                <Tooltip
                  contentStyle={{
                    borderRadius: 8,
                    border: '1px solid #E0E0E0',
                    boxShadow: '0 10px 32px rgba(0, 0, 0, 0.12)',
                  }}
                />
                <Bar dataKey="total" fill="#171717" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </ChartWrap>
      </ChartPanel>
    </PageStack>
  );
}
