import { BarChart3 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, Cell, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import * as S from '../../../pages/painel/BiteplanerHub/styles';

export type PartnerDashboardPeriod = 'week' | 'month' | 'year' | 'all';

export const PARTNER_DASHBOARD_PERIODS: Array<{ key: PartnerDashboardPeriod; label: string }> = [
  { key: 'week', label: 'Semana' },
  { key: 'month', label: 'Mês' },
  { key: 'year', label: 'Ano' },
  { key: 'all', label: 'Tudo' },
];

export type PartnerDashboardRow = {
  key: string;
  shortLabel: string;
  label: string;
  value: number;
  hint: string;
  color: string;
};

type PartnerDashboardChartProps = {
  rows: PartnerDashboardRow[];
  activePeriod: PartnerDashboardPeriod;
  periodLabel: string;
  onPeriodChange: (period: PartnerDashboardPeriod) => void;
};

export function PartnerDashboardChart({
  rows,
  activePeriod,
  periodLabel,
  onPeriodChange,
}: PartnerDashboardChartProps) {
  return (
    <S.PartnerChartPanel>
      <S.PartnerChartHeader>
        <S.PartnerPanelTitleGroup>
          <S.PartnerPanelIcon $tone="blue">
            <BarChart3 size={22} aria-hidden />
          </S.PartnerPanelIcon>
          <span>
            <S.PanelTitle>Resumo das indicações</S.PanelTitle>
            <S.PanelText>
              Visão comercial do parceiro, separando links gerados, clientes que se cadastraram e indicações convertidas em compra.
            </S.PanelText>
          </span>
        </S.PartnerPanelTitleGroup>
        <S.PartnerPeriodControl aria-label="Filtrar resumo das indicações">
          {PARTNER_DASHBOARD_PERIODS.map((period) => (
            <S.PartnerPeriodButton
              key={period.key}
              type="button"
              $active={activePeriod === period.key}
              aria-pressed={activePeriod === period.key}
              onClick={() => onPeriodChange(period.key)}
            >
              {period.label}
            </S.PartnerPeriodButton>
          ))}
        </S.PartnerPeriodControl>
      </S.PartnerChartHeader>
      <S.PartnerBarChart aria-label="Gráfico de barras do resumo das indicações">
        <S.PartnerBarCanvas>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 24, right: 8, left: -18, bottom: 6 }}>
              <CartesianGrid stroke="#E5E7EB" strokeDasharray="4 6" vertical={false} />
              <XAxis
                dataKey="shortLabel"
                axisLine={false}
                tickLine={false}
                tick={{ fill: '#525252', fontSize: 12, fontWeight: 700 }}
              />
              <YAxis allowDecimals={false} axisLine={false} tickLine={false} tick={{ fill: '#737373', fontSize: 11 }} />
              <Tooltip
                cursor={{ fill: 'rgba(23, 23, 23, 0.04)' }}
                formatter={(value, _name, item) => [
                  Number(value).toLocaleString('pt-BR'),
                  item.payload?.label ?? 'Total',
                ]}
                labelFormatter={() => `Período: ${periodLabel}`}
                contentStyle={{
                  border: '1px solid #E0E0E0',
                  borderRadius: 8,
                  boxShadow: '0 18px 42px rgba(23, 23, 23, 0.08)',
                  color: '#171717',
                  fontSize: 12,
                }}
              />
              <Bar dataKey="value" radius={[8, 8, 4, 4]} barSize={58} isAnimationActive>
                <LabelList dataKey="value" position="top" fill="#171717" fontSize={13} fontWeight={800} />
                {rows.map((row) => (
                  <Cell key={row.key} fill={row.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </S.PartnerBarCanvas>
        <S.PartnerChartLegend>
          {rows.map((row) => (
            <S.PartnerChartLegendItem key={row.key}>
              <S.PartnerChartLegendDot $color={row.color} />
              <span>{row.label}</span>
              <strong data-testid={`partner-chart-value-${row.key}`}>{row.value}</strong>
            </S.PartnerChartLegendItem>
          ))}
        </S.PartnerChartLegend>
      </S.PartnerBarChart>
    </S.PartnerChartPanel>
  );
}
