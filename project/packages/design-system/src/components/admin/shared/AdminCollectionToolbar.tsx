import type { ReactNode } from 'react';
import styled from 'styled-components';
import { adminColor } from '../adminTheme';

export interface AdminCollectionToolbarProps {
  searchValue?: string;
  searchPlaceholder?: string;
  searchLabel?: string;
  onSearchChange?: (value: string) => void;
  filterButton?: ReactNode;
  sortButton?: ReactNode;
  utilityActions?: ReactNode;
  activeFilterCount?: number;
}

export function AdminCollectionToolbar({
  searchValue = '',
  searchPlaceholder = 'Buscar...',
  searchLabel = 'Buscar',
  onSearchChange,
  filterButton,
  sortButton,
  utilityActions,
  activeFilterCount = 0,
}: AdminCollectionToolbarProps) {
  return (
    <Toolbar>
      {onSearchChange ? (
        <SearchGroup>
          <Label htmlFor="admin-collection-search">{searchLabel}</Label>
          <Input
            id="admin-collection-search"
            aria-label={searchLabel}
            placeholder={searchPlaceholder}
            value={searchValue}
            onChange={(event) => onSearchChange(event.target.value)}
          />
        </SearchGroup>
      ) : null}
      <Actions>
        {filterButton ? (
          <ActionWrap data-active-filter-count={activeFilterCount}>
            {filterButton}
            {activeFilterCount > 0 ? <CountBadge>{activeFilterCount}</CountBadge> : null}
          </ActionWrap>
        ) : null}
        {sortButton}
        {utilityActions}
      </Actions>
    </Toolbar>
  );
}

const Toolbar = styled.div`
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 12px;
  align-items: end;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    gap: 8px;
  }
`;

const SearchGroup = styled.div`
  min-width: 0;
  display: grid;
  gap: 6px;
`;

const Label = styled.label`
  color: ${({ theme }) => adminColor(theme, 'textSecondary', 'textMuted', '#525252')};
  font-size: 12px;
  font-weight: 800;
`;

const Input = styled.input`
  width: 100%;
  min-height: 40px;
  box-sizing: border-box;
  border: 1px solid ${({ theme }) => adminColor(theme, 'borderDefault', 'border', '#E0E0E0')};
  border-radius: 8px;
  padding: 0 12px;
  color: ${({ theme }) => adminColor(theme, 'textPrimary', 'text', '#171717')};
  background: ${({ theme }) => adminColor(theme, 'bgElevated', 'surface', '#FFFFFF')};
  font: inherit;
  font-size: 13px;
`;

const Actions = styled.div`
  min-width: 0;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  @media (max-width: 768px) {
    > * {
      flex: 1 1 130px;
      min-width: 130px;
    }
  }
`;

const ActionWrap = styled.div`
  position: relative;
  min-width: 0;
`;

const CountBadge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 5px;
  border-radius: 999px;
  display: inline-grid;
  place-items: center;
  background: #15803d;
  color: #ffffff;
  font-size: 11px;
  font-weight: 800;
`;
