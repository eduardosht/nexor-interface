import styled from 'styled-components';
import { getBrandTokens } from '@nexor/design-system';

const bp = getBrandTokens('nexor').biteplanerContext;

export const Page = styled.div`
  width: min(100%, 1360px);
  display: grid;
  gap: clamp(28px, 4vw, 44px);
`;

export const ComingSoonHero = styled.section`
  position: relative;
  min-height: clamp(520px, 48vw, 640px);
  overflow: hidden;
  border-radius: 8px;
  border: 1px solid rgba(74, 222, 128, 0.2);
  background:
    radial-gradient(circle at 72% 48%, rgba(44, 206, 94, 0.56) 0%, rgba(20, 106, 58, 0.28) 24%, rgba(3, 23, 19, 0) 52%),
    linear-gradient(116deg, #030806 0%, #06130f 32%, #062316 63%, #010604 100%);
  color: #ffffff;
  isolation: isolate;
  box-shadow: 0 28px 70px rgba(0, 0, 0, 0.22);

  &::before {
    content: '';
    position: absolute;
    width: min(72vw, 900px);
    aspect-ratio: 1;
    top: 50%;
    right: -8%;
    transform: translateY(-50%);
    border-radius: 999px;
    background:
      repeating-radial-gradient(
        circle,
        rgba(91, 220, 125, 0.13) 0 1px,
        transparent 1px 58px
      );
    opacity: 0.48;
    z-index: -1;
  }

  &::after {
    content: 'V1';
    position: absolute;
    left: 32%;
    bottom: 16%;
    font-size: clamp(10rem, 22vw, 24rem);
    line-height: 0.72;
    font-weight: 900;
    color: transparent;
    -webkit-text-stroke: 1px rgba(87, 197, 118, 0.08);
    opacity: 0.9;
    z-index: -1;
  }

  @media (max-width: 860px) {
    min-height: 780px;
    display: grid;
    align-content: start;

    &::before {
      top: auto;
      right: 50%;
      bottom: 2%;
      width: 720px;
      transform: translateX(50%);
    }

    &::after {
      left: 8%;
      bottom: 20%;
      font-size: 11rem;
    }
  }

  @media (max-width: 560px) {
    min-height: 700px;
    border-radius: 8px;
  }
`;

export const HeroCopy = styled.div`
  position: relative;
  z-index: 2;
  width: min(46%, 560px);
  min-height: inherit;
  padding: clamp(44px, 6vw, 72px) clamp(28px, 6vw, 72px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: flex-start;

  @media (max-width: 860px) {
    width: 100%;
    min-height: auto;
    padding: 36px 28px 0;
  }

  @media (max-width: 560px) {
    padding: 28px 22px 0;
  }
`;

export const HeroBadge = styled.span`
  min-height: 54px;
  padding: 0 20px;
  border-radius: 8px;
  border: 1px solid rgba(83, 202, 112, 0.46);
  color: #56c66e;
  background: rgba(5, 28, 20, 0.62);
  display: inline-flex;
  align-items: center;
  gap: 12px;
  font-size: clamp(0.88rem, 1.3vw, 1.22rem);
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

export const HeroTitle = styled.h1`
  margin: clamp(28px, 4vw, 38px) 0 0;
  color: #ffffff;
  font-size: clamp(3.25rem, 6.4vw, 6.25rem);
  line-height: 0.9;
  font-weight: 900;
  letter-spacing: 0;
  text-wrap: balance;

  span {
    color: #45b861;
  }

  @media (max-width: 560px) {
    font-size: clamp(3rem, 16vw, 4.5rem);
  }
`;

export const HeroDescription = styled.p`
  max-width: 460px;
  margin: clamp(24px, 3vw, 30px) 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: clamp(1.05rem, 1.7vw, 1.42rem);
  line-height: 1.35;
  font-weight: 520;
`;

export const HeroAccentLine = styled.span`
  width: 42px;
  height: 3px;
  margin-top: clamp(34px, 4vw, 42px);
  border-radius: 999px;
  background: #4fc169;
`;

export const HeroNotice = styled.div`
  width: min(100%, 348px);
  min-height: 98px;
  margin-top: clamp(34px, 4vw, 46px);
  padding: 20px 22px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(145deg, rgba(18, 34, 33, 0.82), rgba(12, 24, 25, 0.58));
  box-shadow: inset 0 0 34px rgba(80, 197, 111, 0.06), 0 22px 44px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(14px);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 18px;
`;

export const HeroNoticeIcon = styled.span`
  color: #4fc169;
  display: inline-flex;
`;

export const HeroNoticeTitle = styled.strong`
  display: block;
  margin-bottom: 4px;
  color: #ffffff;
  font-size: 1rem;
  line-height: 1.25;
  font-weight: 900;
`;

export const HeroNoticeText = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.96rem;
  line-height: 1.4;
`;

export const HeroProductImage = styled.img`
  position: absolute;
  z-index: 1;
  right: clamp(28px, 5vw, 74px);
  top: 52%;
  width: min(56vw, 780px);
  max-height: 76%;
  object-fit: contain;
  transform: translateY(-50%) rotate(-1deg);
  filter: drop-shadow(0 40px 42px rgba(0, 0, 0, 0.42));
  user-select: none;
  pointer-events: none;

  @media (max-width: 1080px) {
    right: -5%;
    width: 58vw;
  }

  @media (max-width: 860px) {
    top: auto;
    bottom: 68px;
    left: 50%;
    right: auto;
    width: min(92vw, 620px);
    max-height: 44%;
    transform: translateX(-50%);
  }

  @media (max-width: 560px) {
    bottom: 56px;
    width: 112vw;
    opacity: 0.96;
  }
`;

export const HeroSignature = styled.p`
  position: absolute;
  z-index: 3;
  left: 50%;
  bottom: 34px;
  transform: translateX(-50%);
  width: max-content;
  max-width: calc(100% - 40px);
  margin: 0;
  color: rgba(86, 198, 110, 0.82);
  font-size: clamp(0.62rem, 1vw, 0.82rem);
  font-weight: 600;
  letter-spacing: 0.44em;
  text-align: center;
  text-transform: uppercase;
`;

export const QuickActionsSection = styled.section`
  display: grid;
  gap: 28px;
`;

export const QuickActionsHeader = styled.header`
  display: grid;
  gap: 10px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(1.75rem, 3vw, 2.45rem);
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: 0;
`;

export const SectionSubtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(1rem, 1.4vw, 1.18rem);
  line-height: 1.45;
`;

export const RoleActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: clamp(16px, 2vw, 24px);

  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const RoleActionCard = styled.article<{ $disabled?: boolean }>`
  position: relative;
  min-height: 360px;
  padding: clamp(28px, 3vw, 38px);
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 8px;
  background: ${({ $disabled, theme }) => ($disabled ? theme.colors.bgInset : '#ffffff')};
  box-shadow: ${({ $disabled }) => ($disabled ? 'none' : '0 20px 52px rgba(15, 23, 42, 0.08)')};
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  align-items: start;
  gap: 24px;
  opacity: ${({ $disabled }) => ($disabled ? 0.58 : 1)};
  filter: ${({ $disabled }) => ($disabled ? 'saturate(0.55)' : 'none')};
`;

export const RoleCardIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 78px;
  height: 78px;
  border-radius: 999px;
  color: #116b37;
  background: radial-gradient(circle, rgba(17, 107, 55, 0.14), rgba(17, 107, 55, 0.07));
`;

export const RoleActionTitle = styled.strong`
  max-width: 280px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(1.36rem, 1.8vw, 1.78rem);
  line-height: 1.22;
  font-weight: 900;
  letter-spacing: 0;
`;

export const RoleCardRule = styled.span`
  width: 46px;
  height: 3px;
  border-radius: 999px;
  background: #08733a;
`;

export const RoleActionMeta = styled.span`
  max-width: 280px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: clamp(0.98rem, 1.15vw, 1.08rem);
  line-height: 1.5;
`;

export const RoleStatusPill = styled.span<{ $tone?: 'success' | 'warning' | 'neutral' }>`
  position: absolute;
  top: clamp(28px, 3vw, 38px);
  right: clamp(28px, 3vw, 38px);
  min-height: 30px;
  display: inline-flex;
  align-items: center;
  padding: 5px 12px;
  border-radius: 4px;
  font-size: 0.78rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: ${({ $tone }) => ($tone === 'success' ? '#116b37' : $tone === 'warning' ? '#8a5b00' : '#666b75')};
  background: ${({ $tone }) =>
    $tone === 'success'
      ? 'rgba(17, 107, 55, 0.1)'
      : $tone === 'warning'
        ? 'rgba(245, 158, 11, 0.12)'
        : 'linear-gradient(180deg, #f0f1f3, #e3e5e8)'};
  box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
`;

export const RoleActionButton = styled.button`
  width: 100%;
  min-height: 56px;
  margin-top: 8px;
  padding: 20px 0 0;
  border: 0;
  border-top: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 0;
  background: transparent;
  color: #08662f;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 1rem;
  font-weight: 800;
  text-align: left;
  cursor: pointer;

  &:hover:not(:disabled) {
    color: ${bp.accentSupport};
  }

  &:disabled {
    cursor: default;
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const DemoBanner = styled.div`
  padding: 16px 18px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  display: grid;
  gap: 6px;
`;

export const DemoBannerTitle = styled.strong`
  font-size: 13px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const DemoBannerText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.5;
`;
