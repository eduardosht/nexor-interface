import type { ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export type AdminMetricTone = 'success' | 'danger' | 'neutral';

export type AdminMetric = {
  label: string;
  value: ReactNode;
  tone?: AdminMetricTone;
};

export type AdminMetricGridProps = {
  metrics: AdminMetric[];
  columns?: 3 | 4;
};

export function AdminMetricGrid({ metrics, columns = 3 }: AdminMetricGridProps) {
  const { tokens } = useDesignSystem();

  return (
    <Grid $tokens={tokens} $columns={columns}>
      {metrics.map((metric, index) => (
        <Card $tokens={tokens} $tone={metric.tone ?? 'success'} $highlight={index === 0} key={metric.label}>
          <Value $tokens={tokens} $tone={metric.tone ?? 'success'}>{metric.value}</Value>
          <Label $tokens={tokens}>{metric.label}</Label>
        </Card>
      ))}
    </Grid>
  );
}

const Grid = styled.div<{ $tokens: BrandTokens; $columns: 3 | 4 }>`
  display: grid;
  grid-template-columns: repeat(${({ $columns }) => $columns}, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 980px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

const Card = styled.div<{ $tokens: BrandTokens; $tone: AdminMetricTone; $highlight: boolean }>`
  min-height: 96px;
  padding: 22px 28px;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: 14px;
  background: ${({ $tokens }) => $tokens.colors.surface};
  box-shadow: 0 18px 42px rgba(23, 23, 23, 0.05);
  position: relative;
  overflow: hidden;

  &::before {
    content: ${({ $highlight }) => ($highlight ? "''" : 'none')};
    position: absolute;
    left: 0;
    top: 12px;
    bottom: 12px;
    width: 3px;
    border-radius: 999px;
    background: ${({ $tokens, $tone }) => ($tone === 'danger' ? $tokens.colors.danger : '#15803d')};
  }

  @media (max-width: 680px) {
    min-height: 84px;
    padding: 18px;
  }
`;

const Value = styled.strong<{ $tokens: BrandTokens; $tone: AdminMetricTone }>`
  display: block;
  font-size: 32px;
  line-height: 1;
  font-weight: 800;
  color: ${({ $tokens, $tone }) => {
    if ($tone === 'danger') return $tokens.colors.danger;
    if ($tone === 'neutral') return $tokens.colors.text;
    return '#15803d';
  }};
`;

const Label = styled.span<{ $tokens: BrandTokens }>`
  display: block;
  margin-top: 12px;
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  font-size: 14px;
  line-height: 1.35;
`;
