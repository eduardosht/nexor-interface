import { Surface } from '@nexor/design-system';
import { Link } from 'react-router-dom';
import styled from 'styled-components';

export const PageStack = styled.div`
  width: 100%;
  max-width: none;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 24px;

  @media (max-width: 768px) {
    gap: 18px;
  }

  @media (max-width: 1280px) {
    gap: 16px;
  }
`;

export const PageHeader = styled.header`
  width: 100%;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const PageTitle = styled.h1`
  margin: 0;
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 768px) {
    font-size: clamp(1.5rem, 7vw, 1.75rem);
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.15;
  }
`;

export const PageSubtitle = styled.p`
  margin: 0;
  max-width: none;
  font-size: 14px;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 768px) {
    font-size: 13px;
    line-height: 1.5;
  }
`;

export const StatGrid = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 12px;

  @media (max-width: 1280px) {
    gap: 10px;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const StatCard = styled(Surface)`
  min-width: 0;
  min-height: 112px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 10px;
  box-shadow: none;

  @media (max-width: 1280px) {
    min-height: 88px;
    gap: 8px;
  }

  @media (max-width: 768px) {
    min-height: 88px;
    gap: 8px;
  }
`;

export const StatValue = styled.strong`
  font-size: 2rem;
  line-height: 1;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 768px) {
    font-size: 1.5rem;
    font-weight: 700;
  }
`;

export const StatLabel = styled.span`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 768px) {
    font-size: 12px;
    line-height: 1.35;
  }
`;

export const TableSection = styled(Surface)`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 18px;
  box-shadow: none;

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 768px) {
    gap: 14px;
  }
`;

export const FilterBar = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(min(100%, 220px), 1fr));
  gap: 12px;
`;

export const DashboardFilterBar = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(180px, 1fr));
  gap: 12px;
  align-items: end;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const FormSection = styled(Surface)`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: none;

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 768px) {
    gap: 14px;
  }
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 1.25rem;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 768px) {
    font-size: 1.0625rem;
    font-weight: 650;
    line-height: 1.25;
  }
`;

export const SectionDescription = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 768px) {
    font-size: 12px;
    line-height: 1.5;
  }
`;

export const FieldsGrid = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`;

export const CompactFieldsGrid = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 1080px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
    gap: 12px;
  }
`;

export const SplitSectionGrid = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(320px, 0.85fr);
  gap: 20px;

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }
`;

export const FormActionsRow = styled.div`
  width: 100%;
  min-width: 0;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  justify-content: flex-start;
`;

export const SectionCardGrid = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px;
  align-items: start;

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 980px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 768px) {
    gap: 14px;
  }
`;

export const ContractList = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const ContractCard = styled.div`
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgBase};

  @media (max-width: 1280px) {
    gap: 10px;
    padding: 12px;
    border-radius: 10px;
  }

  @media (max-width: 640px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
    padding: 12px;
  }
`;

export const ContractTitle = styled.h3`
  margin: 0 0 4px;
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 768px) {
    font-size: 13px;
    font-weight: 650;
  }
`;

export const ContractDescription = styled.p`
  margin: 0;
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const ProductGrid = styled.div`
  width: 100%;
  min-width: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const ProductCard = styled(Surface)<{ $selected?: boolean; $available?: boolean }>`
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: none;
  border-color: ${({ $selected, theme }) => ($selected ? theme.colors.textPrimary : theme.colors.borderDefault)};
  opacity: ${({ $available = true }) => ($available ? 1 : 0.72)};

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 768px) {
    gap: 12px;
  }
`;

export const ProductCardTitle = styled.h2`
  margin: 0;
  font-size: 1.375rem;
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 768px) {
    font-size: 1.0625rem;
    font-weight: 700;
    letter-spacing: 0;
  }
`;

export const ProductCardText = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.65;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 768px) {
    font-size: 12px;
    line-height: 1.5;
  }
`;

export const InlineActions = styled.div`
  width: 100%;
  min-width: 0;
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
`;

export const HighlightPanel = styled(Surface)`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 1.3fr 1fr;
  gap: 20px;
  box-shadow: none;

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const ChartPanel = styled(Surface)`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 20px;
  box-shadow: none;

  @media (max-width: 1280px) {
    gap: 12px;
  }

  @media (max-width: 768px) {
    gap: 14px;
  }
`;

export const ChartHeader = styled.div`
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const ChartWrap = styled.div`
  width: 100%;
  min-width: 0;
  min-height: 360px;
`;

export const HighlightList = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.6;

  @media (max-width: 768px) {
    font-size: 12px;
    line-height: 1.5;
  }
`;

export const EmptyStateWrap = styled(Surface)`
  width: 100%;
  min-width: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 14px;
  box-shadow: none;

  @media (max-width: 1280px) {
    gap: 10px;
  }
`;

export const EmptyStateLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 44px;
  padding: 12px 20px;
  border-radius: 4px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgBase};
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 14px;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: none;
  text-transform: uppercase;

  &:hover {
    opacity: 0.88;
  }

  @media (max-width: 768px) {
    font-size: 12px;
    font-weight: 600;
  }
`;
