import { Surface } from '@nexor/design-system';
import styled from 'styled-components';

export const Grid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.22fr) minmax(360px, 0.78fr);
  gap: 24px;
  align-items: stretch;

  @media (max-width: 1100px) { grid-template-columns: minmax(0, 1fr); }
  @media (max-width: 768px) { gap: 16px; }
`;

export const Panel = styled(Surface)`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: none;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const PanelHeader = styled.header`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const PanelTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 20px;
  line-height: 1.2;
  letter-spacing: 0;
`;

export const PanelDescription = styled.p`
  max-width: 520px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.55;
`;

export const Toolbar = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
`;

export const WeightSummary = styled.div`
  padding: 14px 0 18px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.55;

  strong { color: ${({ theme }) => theme.colors.textPrimary}; }
`;

export const TableScroller = styled.div`
  overflow-x: auto;
  min-height: 320px;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;

  th, td {
    padding: 14px 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
    text-align: left;
    vertical-align: middle;
  }

  th {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 11px;
    font-weight: 800;
    letter-spacing: .02em;
    text-transform: uppercase;
  }

  td { color: ${({ theme }) => theme.colors.textPrimary}; font-size: 13px; }
  td span { display: block; margin-top: 4px; color: ${({ theme }) => theme.colors.textSecondary}; font-size: 12px; }
`;

export const EmptyState = styled.div`
  min-height: 270px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 24px;
  text-align: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const EmptyIcon = styled.div`
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  border: 2px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const EmptyTitle = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 17px;
`;

export const EmptyText = styled.span`
  font-size: 13px;
`;

export const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 620px) { grid-template-columns: 1fr; }
`;

export const FieldWrap = styled.label`
  display: grid;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 800;

  input, select {
    width: 100%;
    min-height: 44px;
    box-sizing: border-box;
    border: 1px solid ${({ theme }) => theme.colors.borderDefault};
    border-radius: 7px;
    padding: 0 12px;
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.textPrimary};
    font: inherit;
    font-weight: 500;
  }

  input:focus, select:focus { outline: 2px solid rgba(17, 24, 39, .16); outline-offset: 1px; }
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
`;

export const IconButton = styled.button`
  width: 36px;
  height: 36px;
  display: inline-grid;
  place-items: center;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 7px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  cursor: pointer;

  &:hover { border-color: ${({ theme }) => theme.colors.textPrimary}; }
  &:focus-visible { outline: 2px solid rgba(17, 24, 39, .22); outline-offset: 2px; }
`;

export const Badge = styled.span<{ $ok?: boolean }>`
  display: inline-flex !important;
  width: fit-content;
  margin: 0 !important;
  padding: 4px 8px;
  border-radius: 999px;
  background: ${({ $ok }) => ($ok ? 'rgba(21,128,61,.12)' : 'rgba(209,138,0,.14)')};
  color: ${({ $ok }) => ($ok ? '#15803d' : '#a16207')} !important;
  font-size: 11px !important;
  font-weight: 800;
`;

export const Alert = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 14px;
  padding: 20px 24px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};

  svg { flex: 0 0 auto; margin-top: 2px; color: ${({ theme }) => theme.colors.textSecondary}; }
  strong, span { display: block; }
  strong { color: ${({ theme }) => theme.colors.textPrimary}; font-size: 14px; }
  span { margin-top: 8px; color: ${({ theme }) => theme.colors.textSecondary}; font-size: 13px; }
`;

export const ErrorText = styled.p`
  margin: 0;
  color: #b91c1c;
  font-size: 13px;
`;

export const SuccessText = styled.p`
  margin: 0;
  color: #15803d;
  font-size: 13px;
`;