import styled from 'styled-components';

export const Page = styled.main`
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Header = styled.header`
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  gap: 18px;
  align-items: end;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const TitleBlock = styled.div`
  min-width: 0;
`;

export const Eyebrow = styled.span`
  display: inline-flex;
  margin-bottom: 8px;
  color: #1f7a4c;
  font-size: 12px;
  font-weight: 800;
  text-transform: uppercase;
  letter-spacing: 0;
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  line-height: 1.12;
  letter-spacing: 0;
`;

export const Subtitle = styled.p`
  margin: 8px 0 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.55;
  max-width: 860px;
`;

export const Panel = styled.section`
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.surface};
  padding: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

export const FilterGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(180px, 260px) repeat(3, minmax(150px, 1fr));
  gap: 12px;
  align-items: end;

  @media (max-width: 920px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const FieldGroup = styled.label`
  display: flex;
  flex-direction: column;
  gap: 6px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  font-weight: 700;
`;

export const Input = styled.input`
  width: 100%;
  min-height: 42px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 0 12px;
  font: inherit;
`;

export const Select = styled.select`
  width: 100%;
  min-height: 42px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 6px;
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  padding: 0 12px;
  font: inherit;
`;

export const Notice = styled.div`
  border: 1px solid #bfd9ca;
  border-radius: 8px;
  background: #eef8f2;
  color: #1f5f3d;
  padding: 12px 14px;
  line-height: 1.45;
  font-size: 14px;
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryCard = styled.div`
  min-height: 88px;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
  padding: 14px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 8px;
`;

export const SummaryValue = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 1.6rem;
  line-height: 1;
`;

export const SummaryLabel = styled.span`
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
`;

export const TableWrap = styled.div`
  width: 100%;
  overflow-x: auto;
  border: 1px solid ${({ theme }) => theme.colors.border};
  border-radius: 8px;
`;

export const Table = styled.table`
  width: 100%;
  min-width: 760px;
  border-collapse: collapse;
`;

export const Th = styled.th`
  text-align: left;
  padding: 13px 14px;
  background: ${({ theme }) => theme.colors.bg2};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
`;

export const Td = styled.td`
  padding: 13px 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
  border-bottom: 1px solid ${({ theme }) => theme.colors.border};
  font-size: 14px;
  vertical-align: top;
`;

export const TableSkeleton = styled.span`
  display: block;
  width: 100%;
  max-width: 220px;
  height: 16px;
  border-radius: 6px;
  background: linear-gradient(90deg, #eef1f4 0%, #f7f8f9 45%, #eef1f4 100%);
  background-size: 220% 100%;
  animation: report-skeleton 1.1s ease-in-out infinite;

  @keyframes report-skeleton {
    0% {
      background-position: 120% 0;
    }

    100% {
      background-position: -120% 0;
    }
  }
`;

export const Classification = styled.span<{ $tone: string }>`
  display: inline-flex;
  border-radius: 999px;
  padding: 4px 8px;
  font-size: 12px;
  font-weight: 800;
  color: ${({ $tone }) => ($tone === 'sensitive' ? '#8d2f25' : $tone === 'financial' ? '#7a4f10' : $tone === 'personal' ? '#285f8f' : '#1f7a4c')};
  background: ${({ $tone }) => ($tone === 'sensitive' ? '#f8e8e5' : $tone === 'financial' ? '#f6edda' : $tone === 'personal' ? '#e8f1f8' : '#e6f3ec')};
`;

export const Actions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: end;
`;

export const Button = styled.button`
  min-height: 42px;
  border: 0;
  border-radius: 6px;
  background: #1f7a4c;
  color: #ffffff;
  padding: 0 16px;
  font-weight: 800;
  cursor: pointer;

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
  }
`;

export const Feedback = styled.p<{ $tone?: 'error' | 'muted' }>`
  margin: 0;
  color: ${({ $tone }) => ($tone === 'error' ? '#9c3328' : '#5f6c64')};
  line-height: 1.45;
`;
