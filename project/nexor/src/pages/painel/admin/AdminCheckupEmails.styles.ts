import styled from 'styled-components';
import { Surface } from '@nexor/design-system';

export const Toolbar = styled.div`
  display: grid;
  grid-template-columns: minmax(180px, 260px) auto auto;
  gap: 12px;
  align-items: end;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const Notice = styled.div`
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.green}33;
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.green}14;
  color: ${({ theme }) => theme.colors.green};
  font-weight: 700;
`;

export const Error = styled.div`
  padding: 12px 14px;
  border: 1px solid ${({ theme }) => theme.colors.errorBorder};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.errorBg};
  color: ${({ theme }) => theme.colors.error};
  font-weight: 700;
`;

export const MetricGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const MetricCard = styled(Surface)`
  display: grid;
  gap: 6px;
  box-shadow: none;
`;

export const MetricValue = styled.strong`
  font-size: 28px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const MetricLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
`;

export const Panel = styled(Surface)`
  display: grid;
  gap: 14px;
  box-shadow: none;
`;

export const PanelHeader = styled.header`
  display: flex;
  justify-content: space-between;
  gap: 12px;
  align-items: center;
`;

export const PanelTitle = styled.h2`
  margin: 0;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const PanelMeta = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

export const TableWrap = styled.div`
  overflow-x: auto;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;

  th,
  td {
    padding: 12px 10px;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
    text-align: left;
    vertical-align: top;
    font-size: 13px;
  }

  th {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 11px;
    text-transform: uppercase;
    letter-spacing: 0.06em;
  }

  td span {
    display: block;
    margin-top: 2px;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const StatusPill = styled.span<{ $tone: 'neutral' | 'success' | 'warning' | 'danger' }>`
  display: inline-flex;
  align-items: center;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 999px;
  font-weight: 800;
  color: ${({ $tone }) => ($tone === 'success' ? '#15803d' : $tone === 'danger' ? '#b91c1c' : $tone === 'warning' ? '#b45309' : '#475569')};
  background: ${({ $tone }) => ($tone === 'success' ? '#dcfce7' : $tone === 'danger' ? '#fee2e2' : $tone === 'warning' ? '#fef3c7' : '#f1f5f9')};
`;

export const ActionGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;

  button {
    border: 1px solid ${({ theme }) => theme.colors.borderDefault};
    border-radius: 4px;
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.textPrimary};
    min-height: 30px;
    padding: 0 10px;
    font-weight: 700;
    cursor: pointer;
  }

  button:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const RunList = styled.div`
  display: grid;
  gap: 10px;
`;

export const RunItem = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 70;
  display: grid;
  place-items: center;
  padding: 20px;
  background: rgba(15, 23, 42, 0.42);
`;

export const Modal = styled.section`
  width: min(620px, 100%);
  display: grid;
  gap: 14px;
  padding: 20px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};

  textarea {
    width: 100%;
    min-height: 96px;
    margin-top: 6px;
    border: 1px solid ${({ theme }) => theme.colors.borderDefault};
    border-radius: 6px;
    padding: 10px;
    font: inherit;
  }
`;

export const ModalTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const ModalActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  flex-wrap: wrap;
`;

export const PreviewMeta = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
`;

export const PreviewSubject = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const PreviewText = styled.p`
  margin: 0;
  white-space: pre-wrap;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.5;
`;