import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { fullBleedSection } from '../../styles/layout';

export const Page = styled.div``;

export const HeroSection = styled.section`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 120px 48px 80px;

  @media (max-width: 768px) { padding: 80px 24px 64px; }
`;

export const HeroLabel = styled.p`
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 16px;
`;

export const HeroTitle = styled.h1`
  font-size: clamp(2.5rem, 5vw, 4rem);
  font-weight: 800;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 20px;
`;

export const HeroSubtitle = styled.p`
  font-size: 17px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.65;
  max-width: 560px;
  margin: 0;
`;

export const TrackOuter = styled.div<{ $alt?: boolean }>`
  ${fullBleedSection}
  background: ${({ theme, $alt }) => $alt ? theme.colors.bgInset : theme.colors.bgElevated};
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

export const TrackSection = styled.section`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 100px 48px;
  display: grid;
  grid-template-columns: 2fr 3fr;
  gap: 64px;
  align-items: start;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
    padding: 80px 24px;
    gap: 32px;
  }
`;

export const TrackLabel = styled.p`
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 12px;
`;

export const TrackTitle = styled.h2`
  font-size: clamp(1.75rem, 2.5vw, 2.25rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 16px;
`;

export const TrackDesc = styled.p`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.7;
  margin: 0 0 32px;
`;

export const TrackCta = styled(Link)`
  display: inline-flex;
`;

export const StepsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 32px;
`;

export const StepRow = styled.div`
  display: flex;
  gap: 16px;
  align-items: flex-start;
`;

export const StepNum = styled.div`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: 1.5px solid ${({ theme }) => theme.colors.borderDefault};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  background-color: #FFFFFF;
  flex-shrink: 0;
`;

export const StepContent = styled.div``;

export const StepTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 4px;
`;

export const StepBody = styled.p`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  margin: 0;
`;

export const BenefitsList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const BenefitItem = styled.li`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 8px;

  &::before {
    content: '';
    display: inline-block;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${({ theme }) => theme.colors.textPrimary};
    flex-shrink: 0;
  }
`;
