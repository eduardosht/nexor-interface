import type { ReactNode } from 'react';
import styled from 'styled-components';
import { adminColor } from '../adminTheme';

export interface AdminBulkActionBarProps {
  selectedCount: number;
  onClearSelection: () => void;
  children: ReactNode;
}

export function AdminBulkActionBar({ selectedCount, onClearSelection, children }: AdminBulkActionBarProps) {
  if (selectedCount <= 0) return null;

  return (
    <Bar role="region" aria-label="Ações em lote">
      <Text>{selectedCount} selecionado{selectedCount === 1 ? '' : 's'}</Text>
      <Actions>{children}</Actions>
      <ClearButton type="button" onClick={onClearSelection}>
        Limpar
      </ClearButton>
    </Bar>
  );
}

const Bar = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  padding: 8px 10px;
  border: 1px solid ${({ theme }) => adminColor(theme, 'borderDefault', 'border', '#E0E0E0')};
  border-radius: 8px;
  background: ${({ theme }) => adminColor(theme, 'bgSubtle', 'surfaceSubtle', '#F7F7F7')};
`;

const Text = styled.strong`
  color: ${({ theme }) => adminColor(theme, 'textPrimary', 'text', '#171717')};
  font-size: 12px;
`;

const Actions = styled.div`
  min-width: 0;
  display: flex;
  flex: 1 1 180px;
  flex-wrap: wrap;
  gap: 8px;
`;

const ClearButton = styled.button`
  min-height: 32px;
  border: 0;
  background: transparent;
  color: ${({ theme }) => adminColor(theme, 'textSecondary', 'textMuted', '#525252')};
  font: inherit;
  font-size: 12px;
  cursor: pointer;
`;
