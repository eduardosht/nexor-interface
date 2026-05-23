import styled from 'styled-components';
import { motion } from 'framer-motion';

export const SectionWrapper = styled.section`
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const VideoBackground = styled.video`
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  z-index: 0;

  @media (prefers-reduced-motion: reduce) {
    display: none;
  }
`;

export const VideoOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: rgb(255 255 255 / 62%);
  z-index: 1;
`;

export const Section = styled.div`
  min-height: 100vh;
  padding: 140px 48px 80px;
  max-width: ${({ theme }) => theme.maxWidth};
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  position: relative;
  z-index: 2;

  @media (max-width: 768px) {
    padding: 120px 24px 60px;
  }
`;

export const Label = styled(motion.div)`
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
  margin-bottom: 32px;
`;

export const LabelLine = styled.span`
  display: inline-block;
  width: 28px;
  height: 1px;
  background: ${({ theme }) => theme.colors.textSecondary};
`;

export const Headline = styled(motion.h1)`
  font-size: clamp(3rem, 5.5vw, 5rem);
  font-weight: 800;
  letter-spacing: -0.04em;
  line-height: 1.05;
  margin: 0 0 16px;
`;

export const HeadlinePrimary = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const HeadlineDim = styled.span`
  display: block;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Tagline = styled(motion.p)`
  font-size: 15px;
  color: ${({ theme }) => theme.colors.textSecondary};
  line-height: 1.6;
  max-width: 480px;
  margin: 24px 0 0;
`;

export const Ctas = styled(motion.div)`
  display: flex;
  gap: 24px;
  align-items: center;
  margin-top: 40px;
`;

export const CtaPrimary = styled.a`
  display: inline-flex;
`;

export const CtaSecondary = styled.a`
  font-size: 13px;
  color: ${({ theme }) => theme.colors.textSecondary};
  display: flex;
  align-items: center;
  gap: 6px;
  transition: color 100ms cubic-bezier(0.16, 1, 0.3, 1);

  span {
    display: inline-block;
    transition: transform 100ms cubic-bezier(0.16, 1, 0.3, 1);
  }

  &:hover {
    color: ${({ theme }) => theme.colors.textPrimary};
    span { transform: translateX(4px); }
  }
`;

export const ScrollIndicator = styled.div`
  position: absolute;
  bottom: 40px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 18px;
  color: ${({ theme }) => theme.colors.borderDefault};
  user-select: none;
`;
