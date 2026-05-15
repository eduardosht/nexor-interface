import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { fullBleedSection } from '../../styles/layout';

export const SectionOuter = styled.div`
  ${fullBleedSection}
  background: ${({ theme }) => theme.colors.bgBase};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

export const Section = styled.section`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 80px 48px;

  @media (max-width: 768px) {
    padding: 64px 24px;
  }
`;

export const SectionLabel = styled.p`
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 16px;
`;

export const Title = styled.h2`
  font-size: clamp(1.5rem, 2.5vw, 2rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.15;
  margin: 0 0 12px;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Subtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0 0 48px;
  max-width: 480px;
`;

export const Cards = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled(Link)`
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 28px 24px;
  border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgInset};
  transition: border-color 150ms ease, background 150ms ease;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.borderDefault};
    background: ${({ theme }) => theme.colors.bgElevated ?? theme.colors.bgInset};
  }
`;

export const CardIcon = styled.div`
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CardTitle = styled.p`
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

export const CardDesc = styled.p`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.55;
  margin: 0;
`;

export const CardArrow = styled.span`
  font-size: 12px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-top: auto;
`;

