import styled from 'styled-components';

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
  font-weight: 700;
`;

export const OrderCard = styled.article`
  min-width: 0;
  display: grid;
  gap: 10px;
  padding: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 10px;
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
  font-size: 14px;
  line-height: 1.35;
`;

export const OrderCardMeta = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  line-height: 1.45;
`;
