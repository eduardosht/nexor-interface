import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { getBrandTokens } from '@nexor/design-system';

const bp = getBrandTokens('nexor').biteplanerContext;

export const Page = styled.div`
  width: min(100%, 1360px);
  display: grid;
  gap: clamp(22px, 3vw, 34px);
`;

export const ComingSoonHero = styled.section`
  position: relative;
  min-height: clamp(460px, 42vw, 560px);
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
    width: min(62vw, 780px);
    aspect-ratio: 1;
    top: 50%;
    right: -14%;
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
    left: 28%;
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
    min-height: 720px;
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
    min-height: 650px;
    border-radius: 8px;
  }
`;

export const HeroCopy = styled.div`
  position: relative;
  z-index: 2;
  width: min(60%, 680px);
  min-height: inherit;
  padding: clamp(38px, 5vw, 60px) clamp(28px, 5.2vw, 64px);
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
  min-height: 46px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1px solid rgba(83, 202, 112, 0.46);
  color: #56c66e;
  background: rgba(5, 28, 20, 0.62);
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: clamp(0.78rem, 1vw, 1rem);
  font-weight: 900;
  letter-spacing: 0.18em;
  text-transform: uppercase;
`;

export const HeroTitle = styled.h1`
  margin: clamp(24px, 3vw, 32px) 0 0;
  color: #ffffff;
  font-size: clamp(3rem, 5.45vw, 5.2rem);
  line-height: 0.92;
  font-weight: 900;
  letter-spacing: 0;
  text-wrap: balance;

  span {
    color: #45b861;
  }

  @media (max-width: 560px) {
    font-size: clamp(2.65rem, 13vw, 3.8rem);
  }
`;

export const HeroDescription = styled.p`
  max-width: 520px;
  margin: clamp(18px, 2.4vw, 24px) 0 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: clamp(0.98rem, 1.35vw, 1.18rem);
  line-height: 1.45;
  font-weight: 520;
`;

export const HeroAccentLine = styled.span`
  width: 38px;
  height: 3px;
  margin-top: clamp(24px, 3vw, 32px);
  border-radius: 999px;
  background: #4fc169;
`;

export const HeroNotice = styled.div`
  width: min(100%, 330px);
  min-height: 86px;
  margin-top: clamp(26px, 3.4vw, 36px);
  padding: 16px 18px;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: linear-gradient(145deg, rgba(18, 34, 33, 0.82), rgba(12, 24, 25, 0.58));
  box-shadow: inset 0 0 34px rgba(80, 197, 111, 0.06), 0 22px 44px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(14px);
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 14px;
`;

export const HeroNoticeIcon = styled.span`
  color: #4fc169;
  display: inline-flex;
`;

export const HeroNoticeTitle = styled.strong`
  display: block;
  margin-bottom: 4px;
  color: #ffffff;
  font-size: 0.92rem;
  line-height: 1.25;
  font-weight: 900;
`;

export const HeroNoticeText = styled.p`
  margin: 0;
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.86rem;
  line-height: 1.42;
`;

export const HeroProductImage = styled.img`
  position: absolute;
  z-index: 1;
  right: clamp(-34px, -2vw, 8px);
  top: 52%;
  width: min(42vw, 600px);
  max-height: 68%;
  object-fit: contain;
  transform: translateY(-50%) rotate(-1deg);
  filter: drop-shadow(0 40px 42px rgba(0, 0, 0, 0.42));
  user-select: none;
  pointer-events: none;

  @media (max-width: 1080px) {
    right: -10%;
    width: 46vw;
  }

  @media (max-width: 860px) {
    top: auto;
    bottom: 68px;
    left: 50%;
    right: auto;
    width: min(86vw, 560px);
    max-height: 40%;
    transform: translateX(-50%);
  }

  @media (max-width: 560px) {
    bottom: 56px;
    width: 100vw;
    opacity: 0.96;
  }
`;

export const HeroSignature = styled.p`
  position: absolute;
  z-index: 3;
  left: 50%;
  bottom: 28px;
  transform: translateX(-50%);
  width: max-content;
  max-width: calc(100% - 40px);
  margin: 0;
  color: rgba(86, 198, 110, 0.82);
  font-size: clamp(0.56rem, 0.8vw, 0.7rem);
  font-weight: 600;
  letter-spacing: 0.34em;
  text-align: center;
  text-transform: uppercase;
`;

export const ProductHero = styled.section<{ $backgroundImage: string }>`
  position: relative;
  min-height: clamp(390px, 34vw, 470px);
  overflow: hidden;
  border-radius: 8px;
  background: url(${({ $backgroundImage }) => $backgroundImage}) center / cover no-repeat;
  color: #ffffff;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: center;

  @media (max-width: 640px) {
    min-height: auto;
    align-items: start;
  }
`;

export const ProductHeroContent = styled.div`
  position: relative;
  z-index: 1;
  max-width: 540px;
  padding: clamp(28px, 5vw, 50px);
  display: grid;
  gap: 22px;
  align-content: center;

  @media (max-width: 640px) {
    padding: 18px;
    gap: 14px;
  }
`;

export const ProductTitle = styled.h1`
  margin: 0;
  color: #ffffff;
  font-size: clamp(2.3rem, 4vw, 3.55rem);
  line-height: 1;
  font-weight: 800;
  letter-spacing: 0;

  @media (max-width: 640px) {
    font-size: 16px;
    line-height: 1.12;
  }
`;

export const ProductDescription = styled.p`
  max-width: 520px;
  margin: 0;
  color: rgba(255, 255, 255, 0.92);
  font-size: clamp(1rem, 1.45vw, 1.22rem);
  line-height: 1.55;
  font-weight: 520;

  @media (max-width: 640px) {
    font-size: 12px;
    line-height: 1.4;
  }
`;

export const ProductStats = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  max-width: 520px;

  @media (max-width: 640px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 8px;
  }
`;

export const ProductStat = styled.div`
  min-height: 74px;
  padding: 16px 18px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(12px);
  display: grid;
  gap: 7px;

  @media (max-width: 640px) {
    min-height: 0;
    padding: 9px 10px;
    gap: 4px;
  }
`;

export const BpRowLabel = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.72);
  font-weight: 800;
  letter-spacing: 0.1em;
  text-transform: uppercase;

  @media (max-width: 640px) {
    font-size: 12px;
    letter-spacing: 0.06em;
  }
`;

export const BpLabelWithTooltip = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  width: fit-content;
  max-width: 100%;
  min-width: 0;
`;

export const BpTooltipTrigger = styled.button`
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 20px;
  height: 20px;
  padding: 0;
  border: 1px solid rgba(255, 255, 255, 0.22);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.86);
  cursor: help;

  &:hover,
  &:focus-visible {
    border-color: rgba(255, 255, 255, 0.42);
    background: rgba(255, 255, 255, 0.18);
    outline: 0;
  }

  &:focus-visible {
    box-shadow: 0 0 0 3px rgba(34, 197, 94, 0.26);
  }

  @media (max-width: 640px) {
    width: 18px;
    height: 18px;

    svg {
      width: 11px;
      height: 11px;
    }
  }
`;

export const BpTooltipBubble = styled.span`
  position: absolute;
  right: 0;
  bottom: calc(100% + 8px);
  z-index: 12;
  width: min(260px, calc(100vw - 48px));
  padding: 10px 12px;
  border: 1px solid rgba(229, 231, 235, 0.9);
  border-radius: 8px;
  background: #f8fafc;
  color: #0f172a;
  box-shadow: 0 16px 38px rgba(15, 23, 42, 0.2);
  font-size: 12px;
  font-weight: 650;
  line-height: 1.35;
  text-align: left;
  text-transform: none;
  letter-spacing: 0;
  opacity: 0;
  pointer-events: none;
  transform: translateY(4px);
  transition:
    opacity 160ms ease,
    transform 160ms ease;

  ${BpTooltipTrigger}:hover &,
  ${BpTooltipTrigger}:focus-visible & {
    opacity: 1;
    transform: translateY(0);
  }

  @media (max-width: 640px) {
    right: -8px;
    width: min(250px, calc(100vw - 32px));
    padding: 9px 10px;
    font-size: 12px;
  }
`;

export const BpStatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #ffffff;
  font-size: 16px;
  font-weight: 800;

  &::before {
    content: '';
    width: 10px;
    height: 10px;
    border-radius: 999px;
    background: #22c55e;
  }

  @media (max-width: 640px) {
    gap: 5px;
    font-size: 12px;
    line-height: 1.2;

    &::before {
      width: 7px;
      height: 7px;
    }
  }
`;

export const BpPrice = styled.span`
  font-size: 22px;
  font-weight: 800;
  color: #ffffff;

  @media (max-width: 640px) {
    font-size: 12px;
    line-height: 1.2;
  }
`;

export const HeroButton = styled.button`
  width: min(100%, 520px);
  min-height: 62px;
  padding: 0 26px;
  border: 1px solid rgba(74, 222, 128, 0.38);
  border-radius: 8px;
  background: linear-gradient(135deg, ${bp.accentSupport}, #16a34a);
  color: #ffffff;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 14px;
  font-size: 18px;
  font-weight: 800;
  cursor: pointer;
  box-shadow: 0 18px 36px rgba(22, 163, 74, 0.28);

  &:hover:not(:disabled) {
    filter: brightness(1.05);
  }

  &:disabled {
    cursor: not-allowed;
    opacity: 0.55;
    filter: saturate(0.5);
  }

  @media (max-width: 640px) {
    min-height: 40px;
    padding: 0 12px;
    gap: 8px;
    font-size: 12px;
    box-shadow: 0 10px 22px rgba(22, 163, 74, 0.22);

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const HeroTrustLine = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  width: min(100%, 520px);
  color: rgba(255, 255, 255, 0.72);
  font-size: 14px;
  line-height: 1.3;

  svg {
    color: #4ade80;
    flex: 0 0 auto;
  }

  @media (max-width: 640px) {
    gap: 6px;
    font-size: 12px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const HeroTrustSeparator = styled.span`
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #4ade80;
  opacity: 0.9;
`;

export const BpSecondaryLinks = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 16px 34px;
  align-items: center;
`;

export const BpLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
  text-decoration: none;

  &:hover {
    color: #ffffff;
    text-decoration: underline;
  }

  @media (max-width: 640px) {
    gap: 6px;
    font-size: 12px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const QuickActionsSection = styled.section`
  display: grid;
  gap: 20px;
`;

export const QuickActionsHeader = styled.header`
  display: grid;
  gap: 6px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(1.45rem, 2.2vw, 1.9rem);
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 0;
`;

export const SectionSubtitle = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.98rem;
  line-height: 1.45;
`;

export const RoleActionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: clamp(14px, 1.6vw, 20px);

  @media (max-width: 1180px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
    gap: 10px;
  }
`;

export const RoleActionCard = styled.article<{ $disabled?: boolean }>`
  position: relative;
  min-height: 292px;
  padding: clamp(20px, 2.1vw, 26px);
  border: 1px solid rgba(17, 24, 39, 0.1);
  border-radius: 8px;
  background: ${({ $disabled, theme }) => ($disabled ? theme.colors.bgInset : '#ffffff')};
  box-shadow: ${({ $disabled }) => ($disabled ? 'none' : '0 20px 52px rgba(15, 23, 42, 0.08)')};
  display: grid;
  grid-template-rows: auto auto auto 1fr auto;
  align-items: start;
  gap: 14px;
  opacity: ${({ $disabled }) => ($disabled ? 0.58 : 1)};
  filter: ${({ $disabled }) => ($disabled ? 'saturate(0.55)' : 'none')};

  @media (max-width: 640px) {
    min-height: 0;
    grid-template-columns: 38px minmax(0, 1fr) auto;
    grid-template-rows: auto auto auto;
    align-items: center;
    gap: 6px 10px;
    padding: 12px;
    border-radius: 8px;
    box-shadow: ${({ $disabled }) => ($disabled ? 'none' : '0 10px 24px rgba(15, 23, 42, 0.07)')};
  }
`;

export const RoleCardIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 62px;
  height: 62px;
  border-radius: 999px;
  color: #116b37;
  background: radial-gradient(circle, rgba(17, 107, 55, 0.14), rgba(17, 107, 55, 0.07));

  @media (max-width: 640px) {
    grid-column: 1;
    grid-row: 1 / span 2;
    width: 32px;
    height: 32px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const RoleActionTitle = styled.strong`
  max-width: 240px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(1.08rem, 1.25vw, 1.28rem);
  line-height: 1.26;
  font-weight: 900;
  letter-spacing: 0;

  @media (max-width: 640px) {
    grid-column: 2;
    grid-row: 1;
    max-width: none;
    padding-right: 4px;
    font-size: 14px;
    line-height: 1.18;
  }
`;

export const RoleCardRule = styled.span`
  width: 38px;
  height: 3px;
  border-radius: 999px;
  background: #08733a;

  @media (max-width: 640px) {
    display: none;
  }
`;

export const RoleActionMeta = styled.span`
  max-width: 240px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 0.9rem;
  line-height: 1.42;

  @media (max-width: 640px) {
    grid-column: 2 / 4;
    grid-row: 2;
    max-width: none;
    font-size: 12px;
    line-height: 1.35;
  }
`;

export const RoleStatusPill = styled.span<{ $tone?: 'success' | 'warning' | 'neutral' }>`
  position: absolute;
  top: clamp(20px, 2.1vw, 26px);
  right: clamp(20px, 2.1vw, 26px);
  min-height: 26px;
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.75rem;
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

  @media (max-width: 640px) {
    position: static;
    grid-column: 3;
    grid-row: 1;
    justify-self: end;
    min-height: 22px;
    padding: 3px 8px;
    font-size: 12px;
    line-height: 1.1;
    box-shadow: none;
  }
`;

export const RoleActionButton = styled.button`
  width: 100%;
  min-height: 50px;
  margin-top: 4px;
  padding: 14px 0 0;
  border: 0;
  border-top: 1px solid rgba(17, 24, 39, 0.12);
  border-radius: 0;
  background: transparent;
  color: #08662f;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  font-size: 0.9rem;
  font-weight: 800;
  line-height: 1.2;
  text-align: left;
  white-space: nowrap;
  cursor: pointer;

  span {
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  svg {
    flex: 0 0 auto;
  }

  &:hover:not(:disabled) {
    color: ${bp.accentSupport};
  }

  &:disabled {
    cursor: default;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  @media (max-width: 640px) {
    grid-column: 1 / -1;
    grid-row: 3;
    justify-content: space-between;
    min-height: 34px;
    margin-top: 4px;
    padding-top: 8px;
    gap: 8px;
    font-size: 12px;
    text-align: left;

    span {
      overflow: visible;
      text-overflow: clip;
    }

    svg {
      width: 16px;
      height: 16px;
    }
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
