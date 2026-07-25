import { Link } from 'react-router-dom';
import styled, { css } from 'styled-components';

export const Page = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  max-width: 1120px;
  margin: 0 auto;
  padding: 8px 0 40px;
`;

export const Header = styled.header`
  display: grid;
  gap: 8px;
`;

export const Eyebrow = styled.span`
  color: ${({ theme }) => theme.colors.accent};
  font-size: 0.78rem;
  font-weight: 800;
  text-transform: uppercase;
`;

export const Title = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(2rem, 4vw, 3rem);
  line-height: 1;
`;

export const Description = styled.p`
  max-width: 760px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.65;
`;

const toneStyles = {
  success: css`
    border-color: rgba(0, 156, 74, 0.28);
    background: linear-gradient(135deg, rgba(0, 156, 74, 0.12), rgba(255, 255, 255, 0.92));
  `,
  warning: css`
    border-color: rgba(234, 179, 8, 0.32);
    background: linear-gradient(135deg, rgba(234, 179, 8, 0.14), rgba(255, 255, 255, 0.94));
  `,
  error: css`
    border-color: rgba(220, 38, 38, 0.28);
    background: linear-gradient(135deg, rgba(220, 38, 38, 0.12), rgba(255, 255, 255, 0.94));
  `
};

export const StatusPanel = styled.section<{ $tone: 'success' | 'warning' | 'error' }>`
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 16px;
  align-items: center;
  padding: 20px;
  border: 1px solid;
  border-radius: 8px;
  ${({ $tone }) => toneStyles[$tone]}

  @media (max-width: 720px) {
    grid-template-columns: auto 1fr;
  }
`;

export const StatusIcon = styled.span<{ $tone: 'success' | 'warning' | 'error' }>`
  display: inline-flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #ffffff;
  background: ${({ $tone }) => ($tone === 'success' ? '#009c4a' : $tone === 'error' ? '#dc2626' : '#b45309')};
`;

export const StatusContent = styled.div`
  display: grid;
  gap: 4px;

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 0.82rem;
    font-weight: 700;
    text-transform: uppercase;
  }

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 1.15rem;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.5;
  }
`;

export const StatusAction = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 8px;
  color: #ffffff;
  background: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 800;
  text-decoration: none;

  @media (max-width: 720px) {
    grid-column: 1 / -1;
  }
`;

export const ActionsGrid = styled.nav`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
  }
`;

export const ActionLink = styled(Link)`
  display: grid;
  grid-template-columns: auto 1fr;
  gap: 14px;
  align-items: center;
  min-height: 112px;
  padding: 18px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  text-decoration: none;
  transition: border-color 160ms ease, transform 160ms ease;

  &:hover {
    border-color: ${({ theme }) => theme.colors.accent};
    transform: translateY(-1px);
  }

  span {
    display: grid;
    gap: 6px;
  }

  strong {
    font-size: 1rem;
  }

  small {
    color: ${({ theme }) => theme.colors.textSecondary};
    line-height: 1.45;
  }
`;

export const ActionIcon = styled.span<{ $tone: 'purchase' | 'finance' | 'orders' }>`
  display: inline-flex;
  width: 42px;
  height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  color: #ffffff;
  background: ${({ $tone }) => ($tone === 'purchase' ? '#009c4a' : $tone === 'finance' ? '#2563eb' : '#111827')};
`;

export const HelperPanel = styled.aside`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgInset};
  color: ${({ theme }) => theme.colors.textSecondary};

  p {
    flex: 1;
    margin: 0;
    line-height: 1.5;
  }

  a {
    color: ${({ theme }) => theme.colors.accent};
    font-weight: 800;
    text-decoration: none;
  }

  @media (max-width: 720px) {
    align-items: flex-start;
    flex-direction: column;
  }
`;
