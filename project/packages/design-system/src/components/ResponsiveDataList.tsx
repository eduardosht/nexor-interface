import type { ReactNode } from 'react';
import styled from 'styled-components';
import { useDesignSystem } from '../provider';
import type { BrandTokens } from '../tokens';

export interface ResponsiveDataListProps<T> {
  desktop: ReactNode;
  data: T[];
  keyExtractor: (row: T) => string;
  renderCard: (row: T) => ReactNode;
  emptyMessage: ReactNode;
}

const DesktopOnly = styled.div`
  min-width: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

const MobileOnly = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    gap: 10px;
  }
`;

const Empty = styled.div<{ $tokens: BrandTokens }>`
  padding: 18px 14px;
  border: 1px solid ${({ $tokens }) => $tokens.colors.border};
  border-radius: ${({ $tokens }) => $tokens.radius.lg};
  color: ${({ $tokens }) => $tokens.colors.textMuted};
  background: ${({ $tokens }) => $tokens.colors.surfaceSubtle};
  font-size: 14px;
`;

export function ResponsiveDataList<T>({
  desktop,
  data,
  keyExtractor,
  renderCard,
  emptyMessage,
}: ResponsiveDataListProps<T>) {
  const { tokens } = useDesignSystem();

  return (
    <>
      <DesktopOnly data-testid="responsive-data-list-desktop">{desktop}</DesktopOnly>
      <MobileOnly data-testid="responsive-data-list-mobile">
        {data.length === 0 ? (
          <Empty $tokens={tokens}>{emptyMessage}</Empty>
        ) : (
          data.map((row) => <div key={keyExtractor(row)}>{renderCard(row)}</div>)
        )}
      </MobileOnly>
    </>
  );
}
