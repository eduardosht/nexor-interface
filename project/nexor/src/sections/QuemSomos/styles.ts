import styled from 'styled-components';
import labImage from '../../assets/backgrounds/banner-2.png';
import { fullBleedSection } from '../../styles/layout';

export const Section = styled.section`
  position: relative;
  ${fullBleedSection}
  min-height: 100svh;
  padding: 120px 0;
  overflow: hidden;
  color: #fafafa;

  @media (max-width: 768px) {
    min-height: auto;
    padding: 88px 0 72px;
  }
`;

export const BackgroundImage = styled.div`
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(10, 10, 10, 0.86) 0%, rgba(10, 10, 10, 0.92) 52%, rgba(10, 10, 10, 0.4) 100%),
    url(${labImage}) center center / cover no-repeat;
  transform: scale(1.02);
`;

export const BackgroundMesh = styled.div`
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top right, rgba(255, 255, 255, 0.12), transparent 28%),
    linear-gradient(120deg, rgba(255, 255, 255, 0.06), transparent 42%);
  pointer-events: none;
`;

export const Content = styled.div`
  position: relative;
  z-index: 1;
  max-width: ${({ theme }) => theme.maxWidth};
  min-height: calc(100svh - 240px);
  margin: 0 auto;
  padding: 0 48px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 72px;

  @media (max-width: 768px) {
    min-height: auto;
    padding: 0 24px;
    gap: 48px;
  }
`;

export const HeroCopy = styled.div`
  width: min(100%, 720px);
  display: flex;
  flex-direction: column;
  gap: 32px;
`;

export const Headline = styled.h2`
  font-size: clamp(3rem, 7vw, 5.5rem);
  font-weight: 900;
  letter-spacing: -0.03em;
  line-height: 0.96;
  color: #fafafa;
  margin: 0;

  em {
    font-style: normal;
    color: #fafafa;
  }
`;

export const Dot = styled.span`
  color: rgba(250, 250, 250, 0.6);
`;

export const BodyText = styled.p`
  font-size: 17px;
  line-height: 1.75;
  color: rgba(250, 250, 250, 0.82);
  margin: 0;
  max-width: 620px;
`;

export const EmphasisText = styled.strong`
  color: #fafafa;
  font-weight: 700;
`;

export const PillarsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;

  @media (max-width: 960px) {
    grid-template-columns: repeat(2, 1fr);
  }

  @media (max-width: 768px) {
    gap: 12px;
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const PillarItem = styled.div`
  min-height: 100%;
  padding: 28px 24px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
`;

export const PillarIcon = styled.div`
  width: 36px;
  height: 36px;
  margin-bottom: 16px;
  color: rgba(250, 250, 250, 0.7);
`;

export const PillarTitle = styled.p`
  font-size: 11px;
  font-weight: 700;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: #fafafa;
  margin: 0 0 8px;
`;

export const PillarDesc = styled.p`
  font-size: 13px;
  line-height: 1.6;
  color: rgba(250, 250, 250, 0.78);
  margin: 0;
`;

