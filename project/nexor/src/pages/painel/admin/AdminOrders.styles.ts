import styled from 'styled-components';

export const SelectField = styled.label`
  min-width: 220px;
  display: grid;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 700;

  select {
    min-height: 42px;
    border: 1px solid ${({ theme }) => theme.colors.borderDefault};
    border-radius: 6px;
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.textPrimary};
    padding: 0 12px;
    font: inherit;
  }
`;

export const TableScroller = styled.div`
  width: 100%;
  overflow-x: auto;
`;

export const OrdersTable = styled.table`
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;

  th,
  td {
    padding: 14px 12px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
    text-align: left;
    vertical-align: middle;
  }

  th {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0;
  }

  td {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 14px;
  }

  td strong,
  td span {
    display: block;
  }

  td span {
    margin-top: 4px;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
    line-height: 1.35;
  }

  th:last-child,
  td:last-child {
    text-align: center;
  }
`;

const toneColor = {
  success: '#15803d',
  warning: '#d18a00',
  danger: '#b91c1c',
  neutral: '#6b7280',
};

export const StatusInline = styled.span<{ $tone: keyof typeof toneColor }>`
  display: inline-flex !important;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 28px;
  max-width: 100%;
  margin: 0 !important;
  padding: 4px 8px;
  border-radius: 7px;
  color: ${({ $tone }) => toneColor[$tone]};
  background: ${({ $tone }) => `${toneColor[$tone]}12`};
`;

export const StatusDot = styled.span`
  width: 9px;
  height: 9px;
  flex: 0 0 auto;
  display: inline-block !important;
  margin: 0 !important;
  border-radius: 999px;
  background: currentColor;
`;

export const StatusText = styled.span`
  display: inline !important;
  margin: 0 !important;
  color: inherit !important;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.2;
`;

export const PaginationBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  gap: 12px;
  padding-top: 16px;

  @media (max-width: 560px) {
    justify-content: stretch;
    display: grid;
    grid-template-columns: 1fr;
  }
`;

export const PageIndicator = styled.span`
  min-width: 88px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 700;
`;

export const ReadinessCell = styled.div`
  min-width: 0;
  display: grid;
  gap: 6px;
`;

export const ReadinessText = styled.span`
  font-size: 12px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const MobileFilterTriggerRow = styled.div`
  display: none;

  @media (max-width: 768px) {
    display: grid;
    grid-template-columns: minmax(0, 1fr) auto;
    gap: 10px;
    align-items: end;
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const DesktopFilters = styled.div`
  @media (max-width: 768px) {
    display: none;
  }
`;

export const FilterSheetGrid = styled.div`
  display: grid;
  gap: 14px;
`;

export const FilterChipRow = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
`;

export const FilterChip = styled.span`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.bgInset};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 650;
`;

export const LoadMoreRow = styled.div`
  display: flex;
  justify-content: center;
  padding-top: 14px;
`;

export const OrderCard = styled.article`
  min-width: 0;
  display: grid;
  gap: 8px;
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const OrderCardHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 10px;
`;

export const OrderCardTitle = styled.strong`
  display: block;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 650;
  line-height: 1.35;
`;

export const OrderCardMeta = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  line-height: 1.4;
`;

export const IconActionButton = styled.button`
  width: 36px;
  height: 36px;
  min-width: 36px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 7px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: #15803d;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease;

  &:hover:not(:disabled) {
    border-color: #15803d;
    background: rgba(21, 128, 61, 0.08);
  }

  &:focus-visible {
    outline: 2px solid rgba(21, 128, 61, 0.32);
    outline-offset: 2px;
  }

  &:disabled {
    cursor: not-allowed;
    background: ${({ theme }) => theme.colors.bgInset};
    color: ${({ theme }) => theme.colors.textSecondary};
    opacity: 1;
  }
`;
