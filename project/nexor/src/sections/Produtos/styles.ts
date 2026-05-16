import { Link } from 'react-router-dom';
import styled from 'styled-components';
import { fullBleedSection } from '../../styles/layout';

export const SectionOuter = styled.div`
  ${fullBleedSection}
  background: ${({ theme }) => theme.colors.bgBase};
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
  border-bottom: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

export const Section = styled.section`
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  padding: 120px 48px;

  @media (max-width: 768px) {
    padding: 80px 24px;
  }
`;

export const Title = styled.h2`
  font-size: clamp(2rem, 3vw, 2.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 1.05;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0 0 48px;
`;

export const ProductGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  overflow: hidden;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const ImageCol = styled.picture`
  display: block;
  min-height: 420px;
  border-right: 1px solid ${({ theme }) => theme.colors.borderDefault};

  @media (max-width: 900px) {
    border-right: none;
    border-bottom: 1px solid ${({ theme }) => theme.colors.borderDefault};
    min-height: 280px;
  }
`;

export const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  min-height: 420px;
  object-fit: cover;
  display: block;

  @media (max-width: 900px) {
    min-height: 280px;
  }
`;

export const InfoCol = styled.div`
  padding: 48px 40px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  justify-content: center;

  @media (max-width: 768px) {
    padding: 36px 28px;
  }
`;

export const ProductLogo = styled.img`
  width: min(100%, 300px);
  height: auto;
  display: block;
  margin: 0 auto;
`;

export const ProductDesc = styled.p`
  font-size: 14px;
  line-height: 1.7;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin: 0;
`;

export const FeatureList = styled.ul`
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const FeatureItem = styled.li`
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 13px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const CheckIcon = styled.span`
  flex-shrink: 0;
  margin-top: 1px;
  color: #3c7c56;
  display: flex;
`;

export const ProtocolBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgInset};
`;

export const ProtocolIconWrap = styled.div`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.bgBase};
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.textSecondary};
  flex-shrink: 0;
`;

export const ProtocolText = styled.p`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textPrimary};
  margin: 0;
`;

export const CardFooter = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 12px;
  padding-top: 4px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderSubtle};
`;

export const Badges = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const Badge = styled.span`
  display: inline-block;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 10px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-weight: 600;
  padding: 4px 10px;
  border-radius: 4px;
`;

export const CtaLink = styled(Link)`
  font-size: 12px;
  font-weight: 700;
  color: #3c7c56;
  letter-spacing: 0.06em;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 6px;
  transition: gap 150ms ease;

  &:hover { gap: 10px; }
`;
