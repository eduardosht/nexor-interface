import styled, { keyframes } from 'styled-components';
import { Link } from 'react-router-dom';
import { motion } from 'motion/react';
import { getBrandTokens } from '@nexor/design-system';
import { fullBleedSection, pageContainer } from '../../styles/layout';
import {
  MarketingBodyText,
  MarketingCardTitle,
  MarketingEyebrow,
  MarketingSectionLead,
  MarketingSectionTitle,
  MarketingTitleAccent,
} from '../../styles/marketingTypography';
import esportesColetivosBackground from '../../assets/backgrounds/esportes-coletivos.jpg';
import esportesCombateBackground from '../../assets/backgrounds/esportes-combate.jpg';
import forcaAltaIntensidadeBackground from '../../assets/backgrounds/forca-alta-intensidade.jpg';
import finalCtaBackground from '../../assets/backgrounds/banner-horizontal.jpg';
import { imageSet, publicOptimizedImages } from '../../assets/publicOptimizedImages';

const bp = getBrandTokens('nexor').biteplanerContext;
const MotionLink = motion.create(Link);
const typeScale = {
  eyebrow: '11px',
  action: '12px',
  heroTitle: 'clamp(48px, 5vw, 72px)',
  heroTitleMobile: 'clamp(36px, 10vw, 48px)',
  sectionTitle: 'clamp(3rem, 3.5vw, 5rem)',
  sectionTitleMobile: 'clamp(2.25rem, 10vw, 3rem)',
  sectionLead: '15px',
  contentTitle: '17px',
  contentBody: '14px',
  meta: '12px',
} as const;

const sportContextBackgrounds = {
  left: esportesCombateBackground,
  center: forcaAltaIntensidadeBackground,
  right: esportesColetivosBackground,
} as const;

export {
  MarketingBodyText,
  MarketingCardTitle,
  MarketingEyebrow,
  MarketingSectionLead,
  MarketingSectionTitle,
  MarketingTitleAccent,
};

const commentsMarquee = keyframes`
  from {
    transform: translateX(0);
  }

  to {
    transform: translateX(-50%);
  }
`;

const comparisonLogoRipple = keyframes`
  0% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(0.72);
  }

  18% {
    opacity: 0.34;
  }

  72% {
    opacity: 0.12;
  }

  100% {
    opacity: 0;
    transform: translate(-50%, -50%) scale(2.16);
  }
`;

export const Page = styled.main`
  background: #ffffff;
  color: #172033;
`;

export const HeroSection = styled.section`
  min-height: 100vh;
  min-height: 100svh;
  position: relative;
  overflow: hidden;
  display: grid;
  align-items: center;
  background: ${imageSet(publicOptimizedImages.biteplaner.hero.desktop)} center right / cover no-repeat;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: 0;
    background: linear-gradient(
      90deg,
      rgba(0, 0, 0, 0.78) 0%,
      rgba(0, 0, 0, 0.62) 34%,
      rgba(0, 0, 0, 0.32) 68%,
      rgba(0, 0, 0, 0.14) 100%
    );
    pointer-events: none;
  }
`;

export const HeroCopy = styled.div`
  ${pageContainer}
  position: relative;
  z-index: 2;
  color: #eee;
`;

export const HeroForegroundItem = styled.img`
  position: absolute;
  right: -90px;
  bottom: -200px;
  z-index: 1;
  width: min(80vw, 1020px);
  pointer-events: none;
  user-select: none;

  @media (max-width: 980px) {
    width: min(56vw, 430px);
    opacity: 0.82;
  }

  @media (max-width: 720px) {
    right: -28px;
    bottom: -14px;
    width: min(72vw, 360px);
    opacity: 0.5;
  }
`;

export const HeroTitle = styled.h1`
  max-width: 620px;
  margin: 0;
  color: #eee;
  font-size: ${typeScale.heroTitle};
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;

  @media (max-width: 640px) {
    font-size: ${typeScale.heroTitleMobile};
    line-height: 1;
  }
`;

export const HeroSubtitle = styled.p`
  max-width: 520px;
  margin: 30px 0 0;
  font-size: 16px;
  line-height: 1.72;
`;

export const HeroActions = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 34px;
`;

export const PrimaryCta = styled(MotionLink)`
  min-height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 0 22px;
  border-radius: 4px;
  background: linear-gradient(135deg, #05865a 0%, #129c65 100%);
  color: #ffffff;
  text-decoration: none;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${typeScale.action};
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
  box-shadow: 0 10px 24px rgba(9, 132, 88, 0.22);
  transition: transform 180ms ease, box-shadow 180ms ease;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 14px 30px rgba(9, 132, 88, 0.28);
  }
`;

export const SecondaryCta = styled.a`
  min-height: 48px;
  min-width: 178px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0 22px;
  border-radius: 4px;
  border: 1px solid #8d96a6;
  background: rgba(255, 255, 255, 0.74);
  color: #172033;
  text-decoration: none;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${typeScale.action};
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
`;

export const SplitSection = styled.section`
  ${pageContainer}
  position: relative;
  z-index: 2;
  padding: clamp(86px, 8vw, 130px) 0 clamp(70px, 6vw, 96px);
  display: grid;
  grid-template-columns: 1fr;
  gap: clamp(58px, 8vw, 104px);
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding-top: 82px;
    padding-bottom: 76px;
    gap: 38px;
  }
`;

export const SectionIntro = styled.div`
  min-width: 0;
  max-width: 980px;
`;

export const RealRoutineSection = styled.section`
  ${fullBleedSection}
  position: relative;
  overflow: hidden;
  padding: clamp(72px, 8vw, 108px) 0 clamp(72px, 8vw, 104px);
  background:
    radial-gradient(circle, rgba(22, 122, 72, 0.14) 0 1px, transparent 1.2px) calc(100% - 300px) 24px / 12px 12px,
    #fbfcfb;

  &::before,
  &::after {
    content: '';
    position: absolute;
    right: -190px;
    top: 120px;
    width: 470px;
    height: 470px;
    border: 1px solid rgba(22, 122, 72, 0.14);
    border-radius: 50%;
    pointer-events: none;
  }

  &::after {
    right: -132px;
    top: 178px;
    width: 350px;
    height: 350px;
  }
`;

export const RealRoutineContent = styled.div`
  ${pageContainer}
  position: relative;
  z-index: 1;
  display: block;

  ${MarketingEyebrow} {
    margin: 0;
  }

  @media (max-width: 900px) {
    max-width: 760px;
  }
`;

export const RealRoutineKicker = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 18px;
`;

export const RealRoutineKickerIcon = styled.span`
  width: 42px;
  height: 42px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  background: #eaf5ee;
  color: #167a48;
`;

export const RealRoutineVisual = styled.div`
  ${pageContainer}
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;
  margin-top: 42px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 14px;
  }
`;

export const RealRoutineCard = styled.article<{ $imagePosition: 'left' | 'center' | 'right' }>`
  min-height: clamp(330px, 32vw, 430px);
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 0 clamp(20px, 2vw, 32px) clamp(22px, 2vw, 30px);
  border: 1px solid rgba(238, 244, 241, 0.5);
  border-radius: 8px;
  isolation: isolate;
  color: #f5faf8;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &::before {
    z-index: -2;
    background-image: url(${({ $imagePosition }) => sportContextBackgrounds[$imagePosition]});
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }

  &::after {
    z-index: -1;
    background:
      linear-gradient(180deg, rgba(4, 17, 24, 0.04) 0%, rgba(3, 17, 25, 0.16) 38%, rgba(2, 18, 26, 0.86) 100%),
      linear-gradient(90deg, rgba(4, 20, 27, 0.28), rgba(4, 20, 27, 0.1));
  }

  @media (max-width: 900px) {
    min-height: 320px;
  }
`;

export const RealRoutineCardIcon = styled.span`
  width: 48px;
  height: 48px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: #177642;
  color: #f5faf8;
  box-shadow: 0 14px 28px rgba(6, 51, 33, 0.2);
`;

export const RealRoutineCardAccent = styled.span`
  width: 28px;
  height: 2px;
  margin: 12px 0 14px;
  border-radius: 999px;
  background: #2ecf76;
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 24px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const FeatureCard = styled(motion.article)`
  min-height: 245px;
  padding: 34px 28px;
  border: 1px solid #dce4e8;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 22px 54px rgba(29, 48, 65, 0.08);
  @media (prefers-reduced-motion: reduce) {
    transform: none;
  }
`;

export const CardIcon = styled.div`
  color: ${bp.accentStrong};
  margin-bottom: 32px;
`;

export const CardTitle = MarketingCardTitle;
export const CardBody = MarketingBodyText;

export const ProcessOuter = styled.div`
  ${fullBleedSection}
  min-height: 920px;
  position: relative;
  overflow: hidden;
  display: grid;
  align-items: stretch;
  isolation: isolate;
  background: #031912;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &::before {
    z-index: 0;
    background: ${imageSet(publicOptimizedImages.biteplaner.process.desktop)} center / cover no-repeat;
  }

  &::after {
    z-index: 1;
    background:
      linear-gradient(90deg, rgba(0, 26, 18, 0.96) 0%, rgba(0, 32, 23, 0.8) 22%, rgba(1, 18, 16, 0.36) 56%, rgba(0, 0, 0, 0.5) 100%),
      linear-gradient(180deg, rgba(3, 14, 18, 0.1) 0%, rgba(2, 18, 14, 0.14) 38%, rgba(0, 24, 17, 0.94) 100%),
      radial-gradient(ellipse at 12% 86%, rgba(48, 204, 110, 0.2), transparent 42%);
  }

  @media (max-width: 768px) {
    min-height: auto;

    &::before {
      background-image: ${imageSet(publicOptimizedImages.biteplaner.process.mobile)};
      background-position: 56% top;
    }

    &::after {
      background:
        linear-gradient(90deg, rgba(0, 27, 19, 0.96) 0%, rgba(0, 29, 20, 0.78) 46%, rgba(0, 0, 0, 0.34) 100%),
        linear-gradient(180deg, rgba(3, 14, 18, 0.04) 0%, rgba(1, 19, 15, 0.12) 32%, rgba(0, 24, 17, 0.98) 58%, rgba(0, 24, 17, 1) 100%);
    }
  }

  ${MarketingEyebrow} {
    position: relative;
    margin-bottom: 28px;
    color: #57d36d;
    font-size: clamp(12px, 1.2vw, 16px);
  }

  ${MarketingSectionTitle} {
    max-width: 660px;
    color: #ffffff;
    line-height: 1.04;
    text-shadow: 0 6px 24px rgba(0, 0, 0, 0.58);
  }

  ${MarketingSectionLead} {
    max-width: 680px;
    margin-top: 66px;
    color: rgba(255, 255, 255, 0.86);
    font-size: clamp(17px, 1.25vw, 20px);
    line-height: 1.7;
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.35);
  }

  @media (max-width: 900px) {
    ${MarketingSectionTitle} {
      max-width: 620px;
    }

    ${MarketingSectionLead} {
      max-width: 600px;
      margin-top: 54px;
      font-size: clamp(18px, 3.1vw, 23px);
      line-height: 1.75;
    }
  }

  @media (max-width: 560px) {
    ${MarketingEyebrow} {
      margin-bottom: 24px;

      &::after {
        bottom: -84px;
      }
    }

    ${MarketingSectionTitle} {
      max-width: 350px;
      line-height: 1.1;
    }

    ${MarketingSectionLead} {
      margin-top: 48px;
      font-size: 17px;
    }
  }
`;

export const JourneyGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0;
  position: relative;
  padding-top: 76px;

  &::before {
    content: '';
    position: absolute;
    left: 3.2%;
    right: 3.2%;
    top: 33px;
    height: 2px;
    background: linear-gradient(90deg, transparent 0%, rgba(82, 214, 104, 0.2) 4%, #57d36d 16%, #57d36d 84%, rgba(82, 214, 104, 0.2) 96%, transparent 100%);
    box-shadow: 0 0 18px rgba(82, 214, 104, 0.38);
  }

  &::after {
    content: '';
    position: absolute;
    left: 3.2%;
    right: 3.2%;
    top: 94px;
    bottom: 0;
    opacity: 0.68;
    pointer-events: none;
  }

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
    gap: 12px;
    padding-top: 0;

    &::before {
      display: none;
    }

    &::after {
      display: none;
    }
  }
`;

export const StepCard = styled(motion.article)`
  min-height: 176px;
  position: relative;
  padding: 0 22px 0 28px;
  border-right: 1px solid rgba(255, 255, 255, 0.12);
  color: #ffffff;

  &:last-child {
    border-right: 0;
  }

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    pointer-events: none;
  }

  &::before {
    top: -76px;
    left: 50%;
    width: 58px;
    height: 58px;
    border: 2px solid #57d36d;
    background: rgba(0, 25, 18, 0.82);
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.1),
      0 0 18px rgba(87, 211, 109, 0.34);
    transform: translateX(-50%);
    z-index: 2;
  }

  &::after {
    top: -55px;
    left: 50%;
    content: attr(data-step-number);
    width: 20px;
    height: 20px;
    display: grid;
    place-items: center;
    color: #ffffff;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 20px;
    font-weight: 900;
    line-height: 1;
    transform: translateX(-50%);
    z-index: 3;
  }

  @media (max-width: 760px) {
    min-height: 0;
    padding: 22px;
    border: 1px solid rgba(167, 238, 178, 0.18);
    border-radius: 8px;
    background: rgba(9, 42, 31, 0.74);
    box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.03);

    &::before,
    &::after {
      display: none;
    }
  }

  @media (max-width: 520px) {
    padding: 20px;
  }
`;

export const StepHeader = styled.div`
  display: block;

  @media (max-width: 760px) {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    gap: 18px;
    align-items: center;
  }
`;

export const StepNumber = styled.div`
  display: none;

  @media (max-width: 760px) {
    width: 50px;
    height: 50px;
    display: inline-grid;
    place-items: center;
    border: 2px solid #57d36d;
    border-radius: 50%;
    background: rgba(0, 25, 18, 0.82);
    color: #ffffff;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: 17px;
    font-weight: 900;
    line-height: 1;
    box-shadow:
      inset 0 0 0 1px rgba(255, 255, 255, 0.1),
      0 0 18px rgba(87, 211, 109, 0.3);
  }

  @media (max-width: 520px) {
    width: 46px;
    height: 46px;
    font-size: 16px;
  }
`;

export const StepLabel = styled.p`
  margin: 0 0 8px;
  font-family: ${({ theme }) => theme.fonts.display};
  color: #57d36d;
  font-size: 13px;
  line-height: 1;
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
`;

export const StepTitle = styled.h3`
  margin: 0;
  color: #ffffff;
  font-size: clamp(17px, 1.28vw, 22px);
  line-height: 1.12;
  font-weight: 900;

  @media (max-width: 760px) {
    font-size: ${typeScale.contentTitle};
    line-height: 1.18;
  }
`;

export const StepBody = styled.p`
  margin: 18px 0 0;
  color: rgba(255, 255, 255, 0.78);
  font-size: clamp(13px, 0.95vw, 16px);
  line-height: 1.68;

  @media (max-width: 760px) {
    margin-top: 16px;
    font-size: ${typeScale.contentBody};
    line-height: 1.62;
  }
`;

export const StepIcon = styled.div`
  display: none;
`;

export const WarningSection = styled.section`
  ${pageContainer}
  padding: 42px 0 38px;

  @media (max-width: 768px) {
    padding-top: 40px;
    padding-bottom: 40px;
  }
`;

export const WarningCard = styled.div`
  min-height: 132px;
  display: grid;
  grid-template-columns: 180px 0.55fr 1fr;
  gap: 34px;
  align-items: center;
  padding: 24px 48px;
  border-radius: 12px;
  background: linear-gradient(100deg, #07845a 0%, #1c5e3a 42%, #333333 100%);
  color: #ffffff;
  box-shadow: 0 22px 44px rgba(32, 142, 130, 0.16);

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 28px;
    gap: 20px;
  }
`;

export const WarningMark = styled.div`
  display: flex;
  justify-content: center;
`;

export const WarningProduct = styled.img`
  width: min(160px, 100%);
  display: block;
  filter: drop-shadow(0 18px 24px rgba(0, 0, 0, 0.18));
`;

export const WarningTitle = styled.h2`
  margin: 0;
  color: #ffffff;
  font-size: ${typeScale.sectionTitle};
  line-height: 1.12;
  font-weight: 900;
`;

export const WarningBody = styled.p`
  margin: 0;
  padding-left: 32px;
  border-left: 1px solid rgba(255, 255, 255, 0.28);
  color: rgba(255, 255, 255, 0.9);
  font-size: ${typeScale.contentBody};
  line-height: 1.72;

  @media (max-width: 900px) {
    padding-left: 0;
    border-left: 0;
  }
`;

export const ComparisonSection = styled.section`
  ${pageContainer}
  padding: 80px 0 86px;
  display: grid;
  grid-template-columns: 1fr;
  gap: 34px;
  align-items: start;
  background:
    radial-gradient(circle at 73% 18%, rgba(28, 94, 58, 0.08), transparent 20%),
    linear-gradient(180deg, #ffffff 0%, #fbfcfb 100%);

  @media (max-width: 900px) {
    padding-top: 62px;
    padding-bottom: 62px;
    gap: 26px;
  }
`;

export const ComparisonHeader = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(320px, 500px);
  gap: 42px;
  align-items: center;

  ${SectionIntro} {
    max-width: 720px;
  }

  ${MarketingEyebrow} {
    position: relative;
    margin-bottom: 34px;

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -22px;
      width: 40px;
      height: 2px;
      background: ${bp.accentStrong};
    }
  }

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 20px;
  }
`;

export const ComparisonProductVisual = styled.div`
  min-height: 220px;
  position: relative;
  display: grid;
  place-items: center;
  isolation: isolate;
  padding: 24px;

  &::before {
    content: '';
    position: absolute;
    width: min(78%, 390px);
    aspect-ratio: 1;
    border-radius: 50%;
    z-index: -1;
  }

  &::after {
    content: '';
    position: absolute;
    left: 50%;
    top: 50%;
    width: min(66%, 320px);
    aspect-ratio: 1;
    border-radius: 50%;
    border: 1px solid rgba(10, 132, 82, 0.18);
    box-shadow:
      0 0 0 1px rgba(255, 255, 255, 0.34),
      inset 0 0 28px rgba(16, 185, 129, 0.05);
    transform: translate(-50%, -50%) scale(0.72);
    opacity: 0;
    animation: ${comparisonLogoRipple} 5.4s ease-out infinite;
    z-index: -1;
    pointer-events: none;
  }

  picture,
  img {
    display: block;
    width: min(92%, 440px);
  }

  picture {
    position: relative;
    border-radius: 22px;
    padding: 14px 18px;
  }

  img {
    height: auto;
    filter: drop-shadow(0 18px 24px rgba(53, 60, 57, 0.18));
  }

  @media (max-width: 900px) {
    min-height: 170px;
    justify-items: start;

    picture,
    img {
      width: min(76vw, 360px);
    }
  }

  @media (prefers-reduced-motion: reduce) {
    &::after {
      animation: none;
      opacity: 0.18;
      transform: translate(-50%, -50%) scale(1.08);
    }
  }
`;

export const ComparisonTableViewport = styled.div`
  width: 100%;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  border: 1px solid #d9e4df;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 26px 70px rgba(7, 16, 29, 0.08);
  -webkit-overflow-scrolling: touch;
  scrollbar-color: rgba(7, 132, 90, 0.5) rgba(215, 226, 227, 0.65);
  scrollbar-width: thin;

  &:focus-visible {
    outline: 3px solid rgba(7, 132, 90, 0.35);
    outline-offset: 4px;
  }
`;

export const ComparisonTable = styled.table`
  width: 100%;
  min-width: 1040px;
  border-collapse: separate;
  border-spacing: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.96);

  th,
  td {
    padding: 22px 28px;
    border-bottom: 1px solid #dfe7e3;
    border-right: 1px solid #dfe7e3;
    font-size: ${typeScale.contentBody};
    line-height: 1.45;
    text-align: center;
    vertical-align: middle;

    &:last-child {
      border-right: 0;
    }
  }

  th {
    font-family: ${({ theme }) => theme.fonts.display};
    height: 92px;
    background: rgba(255, 255, 255, 0.88);
    color: #07101d;
    font-size: ${typeScale.eyebrow};
    font-weight: 900;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  th:nth-child(4) {
    background: linear-gradient(135deg, #176d38 0%, #238549 100%);
    color: #ffffff;
  }

  td:first-child {
    width: 31%;
    color: #07101d;
    font-weight: 900;
    text-align: left;
  }

  td:nth-child(2),
  td:nth-child(3) {
    color: #344155;
  }

  td:nth-child(4) {
    background: linear-gradient(180deg, rgba(28, 94, 58, 0.08), rgba(28, 94, 58, 0.045));
    color: ${bp.accentStrong};
    font-weight: 900;
  }

  tr:last-child td {
    border-bottom: 0;
  }

  @media (max-width: 900px) {
    min-width: 920px;

    th,
    td {
      padding: 18px 20px;
    }
  }

  @media (max-width: 520px) {
    min-width: 860px;

    th,
    td {
      padding: 14px 16px;
      font-size: 12px;
    }

    th {
      font-size: 9px;
    }
  }
`;

export const ColumnHeaderContent = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 14px;

  svg {
    flex: 0 0 auto;
    color: currentColor;
    opacity: 0.7;
  }
`;

export const CriterionContent = styled.div`
  display: grid;
  grid-template-columns: 44px 1fr;
  gap: 18px;
  align-items: center;
`;

export const CriterionIcon = styled.span`
  width: 44px;
  height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: ${bp.accentStrong};
`;

export const ComparisonValue = styled.span`
  display: inline-block;
  max-width: 270px;
`;

export const ComparisonToggleButton = styled.button`
  justify-self: center;
  min-height: 50px;
  padding: 0 30px;
  border-radius: 999px;
  border: 1px solid ${bp.accentStrong};
  background: linear-gradient(135deg, #1f884c 0%, ${bp.accentStrong} 100%);
  color: #ffffff;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${typeScale.action};
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 18px 38px rgba(28, 94, 58, 0.25);
  transition: transform 180ms ease, box-shadow 180ms ease;

  &::after {
    content: '→';
    margin-left: 18px;
    font-size: 20px;
    line-height: 1;
  }

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 22px 44px rgba(28, 94, 58, 0.3);
  }
`;

export const Cross = styled.span`
  display: inline-flex;
  width: 24px;
  color: #172033;
  font-weight: 900;
`;

export const Check = styled.span`
  display: inline-flex;
  width: 24px;
  color: ${bp.accentStrong};
  font-weight: 900;
`;

export const TrustOuter = styled.div`
  ${fullBleedSection}
  position: relative;
  padding: 90px 0 80px;
  overflow: hidden;
  background: linear-gradient(180deg, #ffffff 0%, #fbfcfb 100%);

  &::before {
    content: '';
    position: absolute;
    top: -150px;
    right: clamp(-280px, -8vw, -80px);
    width: min(58vw, 660px);
    aspect-ratio: 1;
    border-radius: 50%;
    background:
      radial-gradient(circle, rgba(28, 94, 58, 0.05) 0 19%, transparent 19.3%),
      repeating-radial-gradient(
        circle,
        rgba(28, 94, 58, 0.085) 0 1px,
        transparent 1px 58px
      );
    opacity: 0.42;
    pointer-events: none;
  }

  @media (max-width: 900px) {
    padding-top: 64px;
    padding-bottom: 60px;

    &::before {
      top: -96px;
      right: -220px;
      width: 520px;
    }
  }
`;

export const TrustHero = styled.div`
  ${pageContainer}
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(300px, 1.08fr);
  gap: 48px;
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    gap: 26px;
  }
`;

export const TrustIntro = styled.div`
  max-width: 680px;

  ${MarketingEyebrow} {
    position: relative;
    margin-bottom: 36px;
    color: ${bp.accentStrong};

    &::after {
      content: '';
      position: absolute;
      left: 0;
      bottom: -22px;
      width: 38px;
      height: 2px;
      background: ${bp.accentStrong};
    }
  }
`;

export const TrustProductVisual = styled.div`
  min-height: 350px;
  position: relative;
  display: grid;
  place-items: center;
  isolation: isolate;

  &::before,
  &::after {
    content: '';
    position: absolute;
    border-radius: 50%;
    border: 1px solid rgba(28, 94, 58, 0.13);
    z-index: -1;
  }

  &::before {
    width: min(78%, 540px);
    aspect-ratio: 1;
  }

  &::after {
    width: min(58%, 390px);
    aspect-ratio: 1;
  }

  picture,
  img {
    display: block;
    width: min(100%, 620px);
  }

  img {
    height: auto;
    filter: drop-shadow(0 30px 36px rgba(7, 16, 29, 0.2));
  }

  @media (max-width: 900px) {
    min-height: 220px;
    justify-items: start;

    picture,
    img {
      width: min(86vw, 460px);
    }
  }
`;

export const EducationRail = styled.div`
  ${pageContainer}
  position: relative;
  z-index: 1;
  margin: 54px auto 0;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    margin-top: 34px;
  }
`;

export const EducationItem = styled(motion.article)`
  min-height: 278px;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-content: start;
  padding: 0 54px 0 0;
  border-right: 1px solid #d9e2dd;

  &:not(:first-child) {
    padding-left: 54px;
  }

  &:last-child {
    border-right: 0;
  }

  @media (max-width: 1100px) {
    padding-right: 30px;

    &:not(:first-child) {
      padding-left: 30px;
    }
  }

  @media (max-width: 900px) {
    min-height: auto;
    padding: 26px 0 30px;
    border-right: 0;
    border-bottom: 1px solid #d9e2dd;

    &:not(:first-child) {
      padding-left: 0;
    }

    &:last-child {
      border-bottom: 0;
    }
  }
`;

export const EducationIcon = styled.div`
  width: 72px;
  height: 72px;
  display: grid;
  place-items: center;
  margin-bottom: 32px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 35% 24%, rgba(255, 255, 255, 0.88), transparent 45%),
    #edf4ef;
  color: ${bp.accentStrong};

  svg {
    width: 34px;
    height: 34px;
  }

  @media (max-width: 900px) {
    margin-bottom: 24px;
  }
`;

export const EducationCopy = styled.div`
  min-width: 0;
`;

export const EducationTitle = styled.h3`
  margin: 0;
  color: #07101d;
  font-size: ${typeScale.contentTitle};
  line-height: 1.25;
  font-weight: 900;

  &::before {
    content: '';
    display: block;
    width: 30px;
    height: 2px;
    margin: 0 0 26px;
    background: ${bp.accentStrong};
  }
`;

export const EducationBody = styled.p`
  margin: 0;
  color: #4b5563;
  font-size: ${typeScale.contentBody};
  line-height: 1.72;

  ${EducationTitle} + & {
    margin-top: 18px;
  }
`;

export const TrustRail = styled.div`
  ${pageContainer}
  position: relative;
  z-index: 1;
  min-height: 116px;
  margin: 64px auto 0;
  padding: 24px 34px;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  align-items: center;
  border: 1px solid rgba(28, 94, 58, 0.1);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.86);
  box-shadow: 0 24px 60px rgba(7, 16, 29, 0.06);

  @media (max-width: 900px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    padding: 20px;
    gap: 10px 0;
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
  }
`;

export const TrustPoint = styled.div`
  display: grid;
  grid-template-columns: 58px 1fr;
  align-items: center;
  gap: 18px;
  min-height: 64px;
  padding: 0 30px;
  color: ${bp.accentStrong};
  border-right: 1px solid #d5ded9;

  &:last-child {
    border-right: 0;
  }

  span {
    color: #1f2937;
    font-size: ${typeScale.contentBody};
    line-height: 1.5;
    font-weight: 500;
  }

  svg {
    width: 42px;
    height: 42px;
  }

  @media (max-width: 900px) {
    padding: 14px 18px;

    &:nth-child(2n) {
      border-right: 0;
    }
  }

  @media (max-width: 520px) {
    border-right: 0;
    border-bottom: 1px solid #d5ded9;

    &:last-child {
      border-bottom: 0;
    }
  }
`;

export const CommentsSection = styled.section`
  ${fullBleedSection}
  padding: 84px 0 74px;
  display: grid;
  gap: 38px;
  overflow: hidden;
  background: #EEF7F2;
  background: linear-gradient(0deg, rgba(238, 247, 242, 1) 0%, rgba(255, 255, 255, 1) 100%);
  > ${SectionIntro},
  > [data-comments-viewport] {
    ${pageContainer}
  }

  @media (max-width: 900px) {
    padding-top: 68px;
    padding-bottom: 62px;
  }
`;

export const CommentsViewport = styled.div`
  width: 100%;
  overflow: hidden;
  mask-image: linear-gradient(90deg, transparent 0%, #000 8%, #000 92%, transparent 100%);

  &:hover [data-comments-track],
  &:focus-within [data-comments-track] {
    animation-play-state: paused;
  }
`;

export const CommentsTrack = styled.div`
  display: flex;
  width: max-content;
  gap: 18px;
  animation: ${commentsMarquee} 34s linear infinite;

  @media (prefers-reduced-motion: reduce) {
    animation: none;
    flex-wrap: wrap;
    width: 100%;
  }
`;

export const CommentCard = styled.article`
  width: clamp(280px, 28vw, 360px);
  min-height: 230px;
  display: grid;
  align-content: space-between;
  gap: 22px;
  padding: 26px;
  border: 1px solid #dce4e8;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 20px 48px rgba(29, 48, 65, 0.07);
`;

export const CommentTopLine = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 14px;
`;

export const CommentQuoteIcon = styled.span`
  width: 34px;
  height: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background: rgba(28, 94, 58, 0.08);
  color: ${bp.accentStrong};
`;

export const CommentStars = styled.span`
  display: inline-flex;
  gap: 3px;
  color: #eab308;
`;

export const CommentText = styled.p`
  margin: 0;
  color: #293449;
  font-size: ${typeScale.contentBody};
  line-height: 1.65;
`;

export const CommentAuthor = styled.footer`
  display: grid;
  gap: 4px;

  strong {
    color: #172033;
    font-size: ${typeScale.contentBody};
    line-height: 1.2;
  }

  span {
    color: #657184;
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: ${typeScale.eyebrow};
    font-weight: 900;
    letter-spacing: 0;
    text-transform: uppercase;
  }
`;

export const FaqSection = styled.section`
  ${fullBleedSection}
  padding: 68px 0 74px;
  position: relative;
  isolation: isolate;
  display: grid;
  grid-template-columns: 1fr;
  gap: 38px;
  align-items: start;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    padding: 64px 0;
  }
`;

export const FaqMedia = styled.div`
  position: relative;
  z-index: 2;
  ${pageContainer}
`;

export const FaqContent = styled.div`
  position: relative;
  z-index: 2;
  display: block;
  ${pageContainer}

  @media (max-width: 900px) {
    display: block;
  }
`;

export const FaqList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 6px;
  width: 100%;
`;

export const FinalCtaOuter = styled.section`
  ${fullBleedSection}
  min-height: 180px;
  position: relative;
  overflow: hidden;
  display: grid;
  align-items: center;
  background: url(${finalCtaBackground});
  background-size: cover;
  color: #ffffff;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background:
      radial-gradient(ellipse at 52% 50%, rgba(0, 0, 0, 0.72) 0%, rgba(0, 0, 0, 0.46) 36%, rgba(0, 0, 0, 0) 64%),
      linear-gradient(90deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.34) 52%, rgba(0, 0, 0, 0.74) 100%);
    pointer-events: none;
  }

  @media (max-width: 900px) {
    background:
      linear-gradient(90deg, rgba(2, 12, 16, 0.3) 0%, rgba(3, 29, 26, 0.78) 42%, rgba(0, 0, 0, 0.92) 100%),
      url(${finalCtaBackground}) 24% center / cover no-repeat;
  }
`;

export const FinalCtaInner = styled.div`
  ${pageContainer}
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(220px, 0.55fr) minmax(0, 1fr) minmax(240px, 0.55fr);
  align-items: center;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const FinalCtaMedia = styled.div`
  min-height: 180px;
`;

export const FinalCtaContent = styled.div`
  position: relative;
  z-index: 1;
  padding: 34px 28px;

  @media (max-width: 900px) {
    padding: 32px 24px 10px;
  }
`;

export const FinalCtaAction = styled.div`
  position: relative;
  z-index: 1;
  padding: 34px 28px;
  display: flex;
  justify-content: center;

  @media (max-width: 900px) {
    justify-content: flex-start;
    padding: 12px 24px 34px;
  }
`;

export const FinalButton = styled(MotionLink)`
  min-height: 60px;
  min-width: 290px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  padding: 0 34px;
  border-radius: 6px;
  background: #ffffff;
  color: #0c6f4d;
  text-decoration: none;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: ${typeScale.action};
  font-weight: 900;
  letter-spacing: 0;
  text-transform: uppercase;
`;
