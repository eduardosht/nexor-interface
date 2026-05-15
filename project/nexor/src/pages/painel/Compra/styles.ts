import styled from 'styled-components';

export const Page = styled.div`
  max-width: 900px;
  display: grid;
  gap: 24px;
`;

export const Description = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Banner = styled.div`
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.6;
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(280px, 360px);
  gap: 24px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.section`
  display: grid;
  gap: 16px;
  padding: 22px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const CardTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const List = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 8px;
`;

export const ListItem = styled.li`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Total = styled.strong`
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;
