import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { fullBleedSection, pageContainer } from '../../styles/layout';

export const SectionOuter = styled.div`
  ${fullBleedSection}
  background: ${({ theme }) => theme.colors.bgElevated};
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

export const Section = styled.section`
  ${pageContainer}
  padding: 80px 0;

  @media (max-width: 768px) {
    padding-top: 64px;
    padding-bottom: 64px;
  }
`;

export const SectionLabel = styled.p`
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 16px;
  text-align: center;
`;

export const Title = styled.h2`
  font-size: clamp(1.75rem, 2.5vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textPrimary};
  text-align: center;
  margin: 0 0 48px;
`;

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.div`
  padding: 32px 24px;
  background: ${({ theme }) => theme.colors.bgInset};
  border: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  border-radius: 12px;
`;

export const CardTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 8px;
`;

export const CardBody = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0;
`;

export const CtaRow = styled.div`
  display: flex;
  justify-content: center;
`;

export const CtaLink = styled(Link)`
  font-size: 13px;
  font-weight: 600;
  color: ${({ theme }) => theme.colors.textPrimary};
  display: flex;
  align-items: center;
  gap: 6px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
  padding-bottom: 2px;
  transition: gap 150ms ease;

  &:hover { gap: 10px; }
`;

