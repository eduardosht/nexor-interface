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

  ${MarketingSectionTitle} {
    font-size: clamp(46px, 4.45vw, 64px);
    line-height: 1.06;
  }

  @media (max-width: 900px) {
    ${MarketingSectionTitle} {
      font-size: clamp(40px, 7.2vw, 56px);
      line-height: 1.08;
    }
  }

  @media (max-width: 560px) {
    ${MarketingSectionTitle} {
      font-size: clamp(28px, 7.4vw, 34px);
      line-height: 1.12;
    }
  }
`;

export const ProductImageHero = styled.section`
  padding-top: 60px;
`;

export const ProductHeroPicture = styled.picture`
  display: block;
  width: 100%;
`;

export const ProductHeroImage = styled.img`
  width: 100%;
  display: block;
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
    bottom: -100px;
  }

  @media (max-width: 720px) {
    display: none
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
    padding: 40px 0;
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

  @media (max-width: 720px) {
    padding: 40px 0;
  }
  
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

      @media (max-width: 720px) {
        display: none
      }
  }

  &::after {
    right: -132px;
    top: 178px;
    width: 350px;
    height: 350px;

    @media (max-width: 720px) {
      display: none
    }
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
  min-height: 1000px;
  position: relative;
  overflow: hidden;
  display: grid;
  align-items: stretch;
  isolation: isolate;
  background: #001918;

  &::before,
  &::after {
    content: '';
    position: absolute;
    inset: 0;
    pointer-events: none;
  }

  &::before {
    z-index: 0;
    background: ${imageSet(publicOptimizedImages.biteplaner.process.desktop)} center top / cover no-repeat;
  }

  &::after {
    z-index: 1;
    background:
      linear-gradient(90deg, rgba(0, 28, 27, 0.98) 0%, rgba(0, 35, 32, 0.82) 38%, rgba(0, 0, 0, 0.26) 68%, rgba(5, 5, 5, 0.42) 100%),
      linear-gradient(180deg, rgba(0, 12, 12, 0.06) 0%, rgba(0, 21, 20, 0.24) 38%, rgba(0, 23, 22, 0.96) 76%, #001918 100%);
  }

  @media (max-width: 768px) {
    min-height: auto;

    &::before {
      background-image: ${imageSet(publicOptimizedImages.biteplaner.process.mobile)};
      background-position: 60% top;
    }

    &::after {
      background:
        linear-gradient(90deg, rgba(0, 27, 25, 0.98) 0%, rgba(0, 29, 27, 0.82) 48%, rgba(0, 0, 0, 0.34) 100%),
        linear-gradient(180deg, rgba(3, 14, 18, 0.04) 0%, rgba(1, 19, 18, 0.2) 30%, rgba(0, 24, 23, 0.98) 56%, #001918 100%);
    }
  }

  ${MarketingEyebrow} {
    position: relative;
    margin-bottom: 28px;
    color: #57d36d;
    font-size: clamp(12px, 1.2vw, 16px);
  }

  ${SplitSection} {
    gap: 0;
  }

  ${MarketingSectionTitle} {
    max-width: 920px;
    color: #ffffff;
    font-size: clamp(46px, 4.45vw, 64px);
    line-height: 1.06;
    text-transform: uppercase;
    text-shadow: 0 6px 24px rgba(0, 0, 0, 0.58);
  }

  ${MarketingSectionLead} {
    max-width: 520px;
    margin-top: 66px;
    color: rgba(255, 255, 255, 0.86);
    font-size: clamp(17px, 1.25vw, 20px);
    line-height: 1.7;
    text-shadow: 0 2px 14px rgba(0, 0, 0, 0.35);
  }

  @media (max-width: 900px) {
    ${MarketingSectionTitle} {
      max-width: 680px;
      font-size: clamp(40px, 7.2vw, 56px);
      line-height: 1.08;
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
      margin-bottom: 18px;

      &::after {
        bottom: -84px;
      }
    }

    ${MarketingSectionTitle} {
      max-width: 350px;
      font-size: clamp(28px, 7.4vw, 34px);
      line-height: 1.12;
    }

    ${MarketingSectionLead} {
      margin-top: 30px;
      font-size: 15px;
      line-height: 1.6;
    }
  }
`;

export const JourneyGrid = styled.div`
  display: grid;
  grid-template-columns: 84px 96px minmax(220px, 0.78fr) minmax(320px, 1fr);
  gap: 0;
  position: relative;
  margin-top: 72px;

  @media (max-width: 980px) {
    grid-template-columns: 72px 88px minmax(190px, 0.82fr) minmax(260px, 1fr);
  }

  @media (max-width: 760px) {
    grid-template-columns: 0 76px minmax(0, 1fr);
    margin-top: 42px;
  }
`;

export const StepCard = styled(motion.article)`
  display: grid;
  grid-column: 1 / -1;
  grid-template-columns: subgrid;
  min-height: 150px;
  position: relative;
  padding-top: 8px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.14);
  color: #ffffff;

  &:last-child {
    border-bottom: 0;
  }

  @supports not (grid-template-columns: subgrid) {
    grid-template-columns: auto minmax(0, 1fr);
  }

  @media (max-width: 760px) {
    grid-template-columns: subgrid;
    min-height: 122px;
  }

  @media (max-width: 520px) {
    min-height: 0;
    padding: 15px 0;
  }
`;

export const StepHeader = styled.div`
  grid-column: 1;
  position: relative;
  display: grid;
  place-items: center;
  padding-right: 8px;

  &::before {
    content: '';
    position: absolute;
    top: 0;
    bottom: 0;
    left: 50%;
    width: 1px;
    background: rgba(255, 255, 255, 0.68);
    transform: translateX(-50%);
  }

  ${StepCard}:first-child &::before {
    top: 28px;
  }

  ${StepCard}:last-child &::before {
    bottom: calc(100% - 28px);
  }

  @media (max-width: 760px) {
    display: none;
  }
`;

export const StepNumber = styled.div`
  position: relative;
  z-index: 1;
  width: 56px;
  height: 56px;
  display: inline-grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.82);
  border-radius: 50%;
  background: rgba(0, 22, 21, 0.84);
  color: #ffffff;
  font-family: ${({ theme }) => theme.fonts.display};
  font-size: 20px;
  font-weight: 900;
  line-height: 1;
  box-shadow: 0 0 24px rgba(0, 0, 0, 0.32);

  @media (max-width: 520px) {
    width: 42px;
    height: 42px;
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
  font-size: clamp(20px, 1.45vw, 25px);
  line-height: 1.12;
  font-weight: 900;

  @media (max-width: 760px) {
    font-size: ${typeScale.contentTitle};
    line-height: 1.18;
  }
`;

export const StepBody = styled.p`
  grid-column: 4;
  align-self: center;
  margin: 0;
  padding: 0 0 0 34px;
  color: rgba(255, 255, 255, 0.84);
  font-size: clamp(16px, 1.08vw, 18px);
  line-height: 1.7;

  @media (max-width: 760px) {
    grid-column: 3;
    margin-top: 9px;
    padding: 0 0 18px;
    font-size: ${typeScale.contentBody};
    line-height: 1.55;
  }
`;

export const StepIcon = styled.div`
  grid-column: 2;
  align-self: center;
  width: 80px;
  height: 80px;
  display: grid;
  place-items: center;
  border-radius: 12px;
  background: rgba(87, 211, 109, 0.12);
  color: #57d36d;
  box-shadow:
    inset 0 0 0 1px rgba(87, 211, 109, 0.06),
    0 18px 40px rgba(0, 0, 0, 0.18);

  @media (max-width: 760px) {
    width: 56px;
    height: 56px;

    svg {
      width: 27px;
      height: 27px;
    }
  }
`;

export const StepCopy = styled.div`
  grid-column: 3;
  align-self: center;
  min-width: 0;
  padding-right: 28px;

  @media (max-width: 760px) {
    padding-right: 0;
  }
`;

export const ProcessAssurance = styled.div`
  display: grid;
  grid-template-columns: 72px minmax(0, 1fr);
  align-items: center;
  gap: 26px;
  margin-top: 48px;
  padding: 34px 42px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  border-radius: 8px;
  background: rgba(12, 33, 34, 0.44);
  color: #ffffff;
  backdrop-filter: blur(2px);

  strong {
    display: block;
    margin-bottom: 8px;
    font-size: clamp(20px, 1.5vw, 24px);
    line-height: 1.2;
    font-weight: 900;
  }

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.86);
    font-size: clamp(15px, 1.1vw, 18px);
    line-height: 1.5;
  }

  @media (max-width: 560px) {
    grid-template-columns: 40px minmax(0, 1fr);
    gap: 14px;
    margin-top: 30px;
    padding: 18px 16px;

    strong {
      margin-bottom: 4px;
      font-size: 16px;
      line-height: 1.2;
    }

    p {
      font-size: 13px;
      line-height: 1.42;
    }
  }
`;

export const ProcessAssuranceIcon = styled.div`
  color: rgba(255, 255, 255, 0.7);

  @media (max-width: 560px) {
    svg {
      width: 34px;
      height: 34px;
    }
  }
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
    padding: 40px 0;
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
    display: none;
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

  @media (max-width: 900px) {
    display: none;
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

export const MobileComparisonLayout = styled.div`
  display: none;

  @media (max-width: 900px) {
    display: grid;
    gap: 14px;
  }
`;

export const MobileComparisonLegend = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  overflow: hidden;
  border: 1px solid #dfe7e3;
  border-radius: 14px 14px 0 0;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: 0 16px 40px rgba(7, 16, 29, 0.06);

  @media (max-width: 560px) {
    border-radius: 10px 10px 0 0;
  }
`;

export const MobileComparisonLegendItem = styled.div<{ $highlighted?: boolean }>`
  min-height: 96px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 8px;
  padding: 14px 10px;
  border-right: 1px solid #dfe7e3;
  color: ${({ $highlighted = false }) => ($highlighted ? bp.accentStrong : '#465164')};
  text-align: center;

  &:last-child {
    border-right: 0;
  }

  span {
    color: ${({ $highlighted = false }) => ($highlighted ? bp.accentStrong : '#1f2937')};
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: clamp(11px, 2vw, 13px);
    line-height: 1.18;
    font-weight: 700;
    letter-spacing: 0;
    text-transform: uppercase;
  }

  @media (max-width: 560px) {
    min-height: 82px;
    padding: 11px 6px;
    gap: 6px;

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

export const MobileComparisonCards = styled.div`
  display: grid;
  gap: 14px;

  @media (max-width: 560px) {
    gap: 10px;
  }
`;

export const MobileComparisonCard = styled.article`
  padding: 18px 20px 14px;
  border: 1px solid #dfe7e3;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 14px 34px rgba(7, 16, 29, 0.07);

  @media (max-width: 560px) {
    padding: 14px 14px 12px;
    border-radius: 12px;
  }
`;

export const MobileComparisonCriterion = styled.div`
  display: grid;
  grid-template-columns: 62px minmax(0, 1fr);
  gap: 14px;
  align-items: center;
  padding: 0 4px 16px;
  border-bottom: 1px solid #dfe7e3;

  h3 {
    margin: 0;
    color: #07101d;
    font-size: clamp(17px, 2.7vw, 20px);
    line-height: 1.2;
    font-weight: 700;
    letter-spacing: 0;
  }

  h3::before {
    content: attr(data-label);
  }

  @media (max-width: 560px) {
    grid-template-columns: 46px minmax(0, 1fr);
    gap: 10px;
    padding: 0 0 12px;

    h3 {
      font-size: clamp(14px, 3.75vw, 17px);
      line-height: 1.18;
    }
  }
`;

export const MobileComparisonCriterionIcon = styled.span`
  width: 58px;
  height: 58px;
  display: inline-grid;
  place-items: center;
  border-radius: 12px;
  background: #eef7f1;
  color: ${bp.accentStrong};

  @media (max-width: 560px) {
    width: 44px;
    height: 44px;

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

export const MobileComparisonValueRow = styled.div<{ $highlighted?: boolean }>`
  display: grid;
  grid-template-columns: 28px minmax(132px, 0.85fr) minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  min-height: 48px;
  padding: 9px 0;
  border-bottom: 1px solid #dfe7e3;
  color: ${({ $highlighted = false }) => ($highlighted ? bp.accentStrong : '#07101d')};

  &:last-child {
    margin-top: 0;
    padding-inline: 10px;
    border: 1px solid rgba(28, 94, 58, 0.16);
    border-radius: 8px;
    background: linear-gradient(90deg, rgba(28, 94, 58, 0.08), rgba(28, 94, 58, 0.025));
    font-weight: 900;
  }

  strong {
    color: ${({ $highlighted = false }) => ($highlighted ? bp.accentStrong : '#6b7280')};
    font-family: ${({ theme }) => theme.fonts.display};
    font-size: clamp(12px, 2.1vw, 14px);
    line-height: 1.2;
    font-weight: ${({ $highlighted = false }) => ($highlighted ? 850 : 750)};
    letter-spacing: 0;
    text-transform: uppercase;
  }

  strong::before {
    content: attr(data-label);
  }

  span {
    min-width: 0;
    color: currentColor;
    font-size: clamp(14px, 2.25vw, 16px);
    line-height: 1.32;
    overflow-wrap: anywhere;
  }

  span::before {
    content: attr(data-value);
  }

  @media (max-width: 560px) {
    grid-template-columns: 22px minmax(96px, 0.85fr) minmax(0, 1fr);
    gap: 8px;
    min-height: 42px;
    padding: 8px 0;

    &:last-child {
      padding-inline: 7px;
    }

    svg {
      width: 18px;
      height: 18px;
    }

    strong {
      font-size: 10px;
    }

    span {
      font-size: 13px;
    }
  }
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
    line-height: 0;
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
    padding: 40px 0;

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
    grid-template-columns: 56px minmax(0, 1fr);
    gap: 16px;
    align-items: start;
    align-content: start;
    padding: 18px 0;
    border-right: 0;
    border-bottom: 1px solid #d9e2dd;

    &:not(:first-child) {
      padding-left: 0;
    }

    &:last-child {
      border-bottom: 0;
    }
  }

  @media (max-width: 520px) {
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 12px;
    padding: 14px 0;
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
    width: 48px;
    height: 48px;
    margin-bottom: 0;

    svg {
      width: 24px;
      height: 24px;
    }
  }

  @media (max-width: 520px) {
    width: 40px;
    height: 40px;

    svg {
      width: 21px;
      height: 21px;
    }
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

  @media (max-width: 900px) {
    font-size: 16px;
    line-height: 1.22;

    &::before {
      display: none;
    }
  }

  @media (max-width: 520px) {
    font-size: 15px;
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

  @media (max-width: 900px) {
    font-size: 13px;
    line-height: 1.52;

    ${EducationTitle} + & {
      margin-top: 6px;
    }
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
    min-height: auto;
    margin-top: 34px;
    padding: 14px 16px;
    gap: 4px 0;
  }

  @media (max-width: 520px) {
    grid-template-columns: 1fr;
    padding: 10px 12px;
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
    grid-template-columns: 36px 1fr;
    gap: 10px;
    min-height: 0;
    padding: 10px 8px;

    &:nth-child(2n) {
      border-right: 0;
    }

    span {
      font-size: 13px;
      line-height: 1.35;
    }

    svg {
      width: 28px;
      height: 28px;
    }
  }

  @media (max-width: 520px) {
    border-right: 0;
    border-bottom: 1px solid #d5ded9;

    &:last-child {
      border-bottom: 0;
    }

    svg {
      width: 24px;
      height: 24px;
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
    padding: 40px 0;
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
    align-items: start;
  }
`;

export const FinalCtaInner = styled.div`
  ${pageContainer}
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 34px;

  @media (max-width: 900px) {
    flex-direction: column;
    align-items: flex-start;
    justify-content: center;
    gap: 12px;
    padding-top: 32px;
    padding-bottom: 32px;
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
    padding: 0;
    max-width: 620px;
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
    width: 100%;
    padding: 0;
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

  @media (max-width: 900px) {
    min-height: 52px;
    min-width: 0;
    width: min(100%, 320px);
    padding: 0 22px;
  }

  @media (max-width: 520px) {
    min-height: 48px;
    width: 100%;
    gap: 12px;
    padding: 0 18px;
  }
`;
