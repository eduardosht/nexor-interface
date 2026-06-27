import type { ReactNode } from 'react';
import styled from 'styled-components';
import { adminColor } from './adminTheme';

export interface AdminResponsiveCollectionProps<TItem> {
  items: TItem[];
  getItemKey: (item: TItem) => string;
  renderTable: (items: TItem[]) => ReactNode;
  renderCard: (item: TItem) => ReactNode;
  loading?: boolean;
  loadingState?: ReactNode;
  emptyState?: ReactNode;
  pagination?: ReactNode;
  mobileTestId?: string;
  desktopTestId?: string;
}

export function AdminResponsiveCollection<TItem>({
  items,
  getItemKey,
  renderTable,
  renderCard,
  loading = false,
  loadingState = 'Carregando...',
  emptyState = 'Nenhum registro encontrado.',
  pagination,
  mobileTestId = 'admin-responsive-collection-mobile',
  desktopTestId = 'admin-responsive-collection-desktop',
}: AdminResponsiveCollectionProps<TItem>) {
  const content = loading ? (
    <State>{loadingState}</State>
  ) : items.length === 0 ? (
    <State>{emptyState}</State>
  ) : null;

  return (
    <Collection>
      <DesktopOnly data-testid={desktopTestId}>
        {content ?? renderTable(items)}
      </DesktopOnly>
      <MobileOnly data-testid={mobileTestId}>
        {content ?? items.map((item) => <CardWrap key={getItemKey(item)}>{renderCard(item)}</CardWrap>)}
        {pagination ? <PaginationSlot>{pagination}</PaginationSlot> : null}
      </MobileOnly>
    </Collection>
  );
}

const Collection = styled.div`
  min-width: 0;
`;

export const AdminDesktopOnly = styled.div`
  min-width: 0;

  @media (max-width: 768px) {
    display: none;
  }
`;

export const AdminMobileOnly = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    gap: 10px;
  }
`;

const DesktopOnly = styled(AdminDesktopOnly)``;
const MobileOnly = styled(AdminMobileOnly)``;

const CardWrap = styled.div`
  min-width: 0;
`;

const State = styled.div`
  padding: 14px 12px;
  border: 1px solid ${({ theme }) => adminColor(theme, 'borderDefault', 'border', '#E0E0E0')};
  border-radius: 8px;
  color: ${({ theme }) => adminColor(theme, 'textSecondary', 'textMuted', '#525252')};
  font-size: 13px;
  line-height: 1.4;
`;

const PaginationSlot = styled.div`
  margin-top: 2px;
`;
