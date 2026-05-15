import styled from 'styled-components';
import { fullBleedSection } from '../../styles/layout';

export const Page = styled.div``;

export const MissionOuter = styled.section`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 120px 48px;
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

export const SectionLabel = styled.p`
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 16px;
`;

export const Title = styled.h2`
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

export const Paragraph = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.7;
  margin: 0;
`;

export const PillarsOuter = styled.div`
  ${fullBleedSection}
  background: ${({ theme }) => theme.colors.bgInset};
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

export const PillarsSection = styled.section`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 100px 48px;

  @media (max-width: 768px) { padding: 80px 24px; }
`;

export const PillarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-top: 48px;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

export const PillarIcon = styled.div`
  width: 44px;
  height: 44px;
  background: ${({ theme }) => theme.colors.textPrimary};
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.bgBase};
  font-size: 18px;
  font-weight: 800;
  margin-bottom: 20px;
`;

export const PillarTitle = styled.h3`
  font-size: 17px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 10px;
`;

export const PillarBody = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.65;
  margin: 0;
`;

export const ApproachOuter = styled.div`
  ${fullBleedSection}
  background: #111113;
`;

export const ApproachSection = styled.section`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 100px 48px;

  @media (max-width: 768px) { padding: 80px 24px; }
`;

export const ApproachLabel = styled.p`
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: rgba(250, 250, 250, 0.35);
  margin: 0 0 16px;
`;

export const ApproachTitle = styled.h2`
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 800;
  letter-spacing: -0.02em;
  color: #fafafa;
  margin: 0 0 48px;
`;

export const ApproachGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
`;

export const ApproachItem = styled.div`
  border-top: 1px solid rgba(250, 250, 250, 0.08);
  padding-top: 24px;
`;

export const ApproachItemTitle = styled.h3`
  font-size: 15px;
  font-weight: 700;
  color: #fafafa;
  margin: 0 0 10px;
`;

export const ApproachItemBody = styled.p`
  font-size: 14px;
  color: rgba(250, 250, 250, 0.55);
  line-height: 1.65;
  margin: 0;
`;

export const CtaSection = styled.section`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 100px 48px;
  text-align: center;

  @media (max-width: 768px) { padding: 80px 24px; }
`;

export const CtaTitle = styled.h2`
  font-size: clamp(1.75rem, 2.5vw, 2.25rem);
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 16px;
`;

export const CtaBody = styled.p`
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0 0 32px;
`;

export const CtaButtons = styled.div`
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
`;
