import { Link } from 'react-router-dom';
import styled from 'styled-components';
import journeyCardBackground from '../../../assets/backgrounds/background-card-jornada.png';
import {
  biteplanerButtonHoverStyles,
  biteplanerButtonSurfaceStyles,
} from '../styles/biteplanerFormButton';
import { PortalPageTitle } from '../styles/portalTypography';

export type StepTone = 'complete' | 'current' | 'upcoming';

export const Page = styled.div`
  display: grid;
  gap: 28px;
  justify-items: center;

  @media (max-width: 560px) {
    gap: 16px;
  }
`;

export const Description = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 560px) {
    font-size: 12px;
    line-height: 1.45;
  }
`;

export const Banner = styled.div`
  display: grid;
  justify-items: start;
  gap: 10px;
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const BannerActionLink = styled(Link)`
  ${biteplanerButtonSurfaceStyles}
  ${biteplanerButtonHoverStyles}
  min-height: 40px;
  padding: 0 16px;
  text-decoration: none;
`;

export const EmptyJourneyCard = styled.section`
  display: grid;
  justify-items: start;
  gap: 14px;
  width: min(100%, 720px);
  padding: 28px;
  border-radius: 12px;
  border: 1px dashed ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 560px) {
    padding: 20px;
  }
`;

export const EmptyJourneyTitle = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(1.25rem, 2vw, 1.75rem);
  font-weight: 850;
  line-height: 1.2;
`;

const disclaimerTone = {
  info: {
    border: 'rgba(37, 99, 235, 0.16)',
    bg: 'linear-gradient(135deg, rgba(239, 247, 255, 0.96), rgba(255, 255, 255, 0.98))',
    iconBg: 'rgba(59, 130, 246, 0.08)',
    iconColor: '#2563eb',
    title: '#091235',
  },
  warning: {
    border: 'rgba(217, 119, 6, 0.26)',
    bg: 'linear-gradient(135deg, rgba(255, 251, 235, 0.94), rgba(255, 255, 255, 0.98))',
    iconBg: 'rgba(217, 119, 6, 0.12)',
    iconColor: '#b45309',
    title: '#0f172a',
  },
  success: {
    border: 'rgba(21, 128, 61, 0.28)',
    bg: 'linear-gradient(135deg, rgba(240, 253, 244, 0.94), rgba(255, 255, 255, 0.98))',
    iconBg: 'rgba(21, 128, 61, 0.12)',
    iconColor: '#15803d',
    title: '#0f172a',
  },
  danger: {
    border: 'rgba(220, 38, 38, 0.24)',
    bg: 'linear-gradient(135deg, rgba(254, 242, 242, 0.94), rgba(255, 255, 255, 0.98))',
    iconBg: 'rgba(220, 38, 38, 0.1)',
    iconColor: '#dc2626',
    title: '#0f172a',
  },
} satisfies Record<string, { border: string; bg: string; iconBg: string; iconColor: string; title: string }>;

export const StepDisclaimer = styled.div<{ $tone?: keyof typeof disclaimerTone }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 28px;
  padding: 34px 36px;
  border-radius: 12px;
  border: 1px solid ${({ $tone = 'info' }) => disclaimerTone[$tone].border};
  background: ${({ $tone = 'info' }) => disclaimerTone[$tone].bg};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    padding: 16px;
  }
`;

export const StepDisclaimerIcon = styled.span<{ $tone?: keyof typeof disclaimerTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: ${({ $tone = 'info' }) => disclaimerTone[$tone].iconBg};
  color: ${({ $tone = 'info' }) => disclaimerTone[$tone].iconColor};

  svg {
    width: 34px;
    height: 34px;
  }
`;

export const StepDisclaimerContent = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

export const StepDisclaimerTitle = styled.strong<{ $tone?: keyof typeof disclaimerTone }>`
  color: ${({ $tone = 'info' }) => disclaimerTone[$tone].title};
  font-size: 20px;
  font-weight: 850;
  line-height: 1.35;
`;

export const StepDisclaimerText = styled.span`
  font-size: 14px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const SelectedClinicCard = styled.section`
  display: grid;
  grid-template-columns: 52px minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  padding: 20px 22px;
  border-radius: 12px;
  border: 1px solid rgba(21, 128, 61, 0.22);
  background: linear-gradient(135deg, rgba(240, 253, 244, 0.92), ${({ theme }) => theme.colors.bgElevated});
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);

  @media (max-width: 720px) {
    grid-template-columns: 44px minmax(0, 1fr);
    align-items: start;

    > button {
      grid-column: 2;
      justify-self: start;
    }
  }

  @media (max-width: 420px) {
    > button {
      grid-column: 1 / -1;
    }
  }
`;

export const SelectedClinicIcon = styled.span`
  display: inline-grid;
  place-items: center;
  width: 52px;
  height: 52px;
  border-radius: 999px;
  background: rgba(21, 128, 61, 0.12);
  color: ${({ theme }) => theme.colors.green};

  @media (max-width: 720px) {
    width: 44px;
    height: 44px;
  }
`;

export const SelectedClinicCopy = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

export const SelectedClinicKicker = styled.span`
  color: ${({ theme }) => theme.colors.green};
  font-size: 12px;
  font-weight: 850;
  letter-spacing: 0.04em;
  text-transform: uppercase;
`;

export const SelectedClinicTitle = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 18px;
  line-height: 1.25;
  font-weight: 850;
`;

export const PaymentConfirmationCard = styled.details`
  display: grid;
  gap: 0;
  padding: 0;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.34);
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.88);

  &[open] {
    padding-bottom: 24px;
  }

  @media (max-width: 560px) {
    &[open] {
      padding-bottom: 18px;
    }
  }
`;

export const PaymentConfirmationHeader = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  padding: 22px 24px;
  cursor: pointer;
  list-style: none;

  &::-webkit-details-marker {
    display: none;
  }

  @media (max-width: 560px) {
    grid-template-columns: auto minmax(0, 1fr);
    padding: 18px;
  }
`;

export const PaymentConfirmationIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 42px;
  height: 42px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const PaymentConfirmationCopy = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;

  strong {
    color: #0f172a;
    font-size: 17px;
    font-weight: 850;
    line-height: 1.35;
  }

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    line-height: 1.55;
  }
`;

export const PaymentCollapseIndicator = styled.span`
  width: 10px;
  height: 10px;
  border-right: 2px solid #667085;
  border-bottom: 2px solid #667085;
  transform: rotate(45deg);
  transition: transform 160ms ease;

  ${PaymentConfirmationCard}[open] & {
    transform: rotate(-135deg);
  }

  @media (max-width: 560px) {
    grid-column: 2;
    justify-self: end;
  }
`;

export const PaymentDetailsGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  margin: 0;
  padding: 0 24px;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    padding: 0 18px;
  }
`;

export const PaymentDetailItem = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 20px 22px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: rgba(255, 255, 255, 0.82);

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
    font-weight: 800;
    line-height: 1.3;
  }

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 16px;
    font-weight: 800;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
`;

export const NextStepCard = styled.section`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 18px;
  padding: 24px 28px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.88);

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    padding: 18px;
  }
`;

export const NextStepIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 16px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
`;

export const NextStepCopy = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

export const NextStepTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 18px;
  font-weight: 850;
  line-height: 1.3;
`;

export const PendingActionCard = styled.section`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  padding: 22px 24px;
  border-radius: 14px;
  border: 1px solid rgba(21, 128, 61, 0.28);
  background:
    radial-gradient(circle at 6% 0%, rgba(21, 128, 61, 0.12), transparent 34%),
    linear-gradient(135deg, rgba(240, 253, 244, 0.9), rgba(255, 255, 255, 0.96));

  @media (max-width: 720px) {
    align-items: stretch;
    flex-direction: column;
  }
`;

export const PendingActionCopy = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

export const PendingActionTitle = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 18px;
  font-weight: 850;
`;

export const PendingActionButton = styled.button`
  ${biteplanerButtonSurfaceStyles}
  ${biteplanerButtonHoverStyles}
  flex: 0 0 auto;
  min-height: 46px;
  padding: 0 18px;

  @media (max-width: 720px) {
    width: 100%;
  }
`;

export const StepFlow = styled.section`
  display: grid;
  gap: 22px;
  width: min(100%, 1120px);
  padding: 26px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 14px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 20px 44px rgba(15, 23, 42, 0.04);

  @media (max-width: 920px) {
    width: 100%;
    padding: 20px;
  }

  @media (max-width: 560px) {
    gap: 14px;
    padding: 12px;
  }
`;

export const SectionHeader = styled.div`
  display: grid;
  gap: 8px;
  max-width: 760px;
`;

export const SectionTitle = PortalPageTitle;

export const JourneyHeroCard = styled.section`
  display: grid;
  grid-template-columns: minmax(0, 1.05fr) minmax(320px, 0.95fr);
  align-items: center;
  gap: 32px;
  min-height: 360px;
  padding: 22px 28px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.3);
  background:
    radial-gradient(circle at 88% 18%, rgba(253, 224, 71, 0.11), transparent 26%),
    linear-gradient(135deg, #ffffff 0%, #fffdf8 100%);
  overflow: hidden;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
    min-height: 0;
  }

  @media (max-width: 560px) {
    padding: 12px;
    gap: 12px;
  }
`;

export const OrderSummaryGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  align-items: start;
  gap: 0;
  min-width: 0;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    gap: 0;
  }
`;

export const OrderSummaryContent = styled.div`
  display: grid;
  grid-template-columns: auto auto minmax(0, 1fr);
  align-items: center;
  gap: 8px 18px;
  min-width: 0;

  @media (max-width: 560px) {
    grid-template-columns: minmax(0, 1fr);
    gap: 6px;
  }
`;

export const OrderEyebrow = styled.span`
  grid-column: 1 / -1;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;

  @media (max-width: 560px) {
    font-size: 11px;
  }
`;

export const OrderSummaryText = styled.p`
  grid-column: 1 / -1;
  max-width: 430px;
  margin: 10px 0 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.48;

  @media (max-width: 560px) {
    margin: 4px 0 8px;
    font-size: 12px;
    line-height: 1.4;
  }
`;

export const StatusPill = styled.span<{ $tone: StepTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 7px;
  width: fit-content;
  min-height: 28px;
  padding: 0 14px;
  border-radius: 999px;
  border: 1px solid ${({ $tone }) => ($tone === 'current' ? 'rgba(217, 119, 6, 0.26)' : 'transparent')};
  background: ${({ $tone }) =>
    $tone === 'complete'
      ? 'rgba(21, 128, 61, 0.1)'
      : $tone === 'current'
        ? 'rgba(245, 158, 11, 0.12)'
        : 'rgba(248, 250, 252, 0.92)'};
  color: ${({ $tone }) =>
    $tone === 'complete' ? '#15803d' : $tone === 'current' ? '#a16207' : '#667085'};
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  white-space: nowrap;

  > span {
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: currentColor;
  }

  @media (max-width: 560px) {
    min-height: 22px;
    padding: 0 8px;
    gap: 5px;
    font-size: 10px;

    > span {
      width: 5px;
      height: 5px;
    }
  }
`;

export const NextStepPreview = styled.div`
  grid-column: 1 / -1;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 16px;
  max-width: 430px;
  padding-top: 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.28);

  @media (max-width: 560px) {
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 10px;
    padding-top: 10px;
  }
`;

export const NextStepPreviewIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 52px;
  height: 52px;
  border-radius: 12px;
  background: rgba(21, 128, 61, 0.1);
  color: #15803d;

  @media (max-width: 560px) {
    width: 30px;
    height: 30px;
    border-radius: 8px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const NextStepPreviewCopy = styled.div`
  display: grid;
  gap: 5px;
  min-width: 0;

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 13px;
    line-height: 1.2;
  }

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 20px;
    font-weight: 850;
    line-height: 1.2;
  }

  p {
    margin: 0;
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    line-height: 1.45;
  }

  @media (max-width: 560px) {
    gap: 2px;

    span,
    p {
      font-size: 12px;
      line-height: 1.35;
    }

    strong {
      font-size: 14px;
      line-height: 1.18;
    }
  }
`;

export const HeroActions = styled.div`
  grid-column: 1 / -1;
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 14px;
  margin-top: 4px;
`;

export const PrimaryActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 44px;
  min-width: 188px;
  padding: 0 22px;
  border-radius: 7px;
  border: 1px solid #15803d;
  background: linear-gradient(135deg, #15803d, #168b43);
  color: #ffffff;
  font-size: 14px;
  font-weight: 850;
  line-height: 1.1;
  text-decoration: none;
  box-shadow: 0 12px 22px rgba(21, 128, 61, 0.2);

  &:hover {
    border-color: #0f6b31;
    background: linear-gradient(135deg, #166534, #15803d);
  }

  &:focus-visible {
    outline: 2px solid #15803d;
    outline-offset: 3px;
  }

  @media (max-width: 560px) {
    width: 100%;
    min-height: 38px;
    min-width: 0;
    padding: 0 12px;
    gap: 8px;
    font-size: 12px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const SecondaryActionAnchor = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  min-height: 44px;
  min-width: 188px;
  padding: 0 22px;
  border-radius: 7px;
  border: 1px solid rgba(148, 163, 184, 0.48);
  background: rgba(255, 255, 255, 0.86);
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 800;
  line-height: 1.1;
  text-decoration: none;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.textPrimary};
    outline-offset: 3px;
  }

  @media (max-width: 560px) {
    width: 100%;
  }
`;

export const JourneyIllustration = styled.div`
  position: relative;
  min-height: 260px;
  border-radius: 16px;
  background: url(${journeyCardBackground}) center / contain no-repeat;

  @media (max-width: 900px) {
    display: none;
  }
`;

export const IllustrationCloud = styled.span`
  position: absolute;
  top: 52px;
  left: 34px;
  width: 112px;
  height: 36px;
  border-radius: 999px 999px 16px 16px;
  background: linear-gradient(180deg, rgba(226, 232, 240, 0.5), rgba(226, 232, 240, 0.18));

  &::before,
  &::after {
    content: '';
    position: absolute;
    bottom: 0;
    border-radius: 999px;
    background: inherit;
  }

  &::before {
    left: 18px;
    width: 54px;
    height: 54px;
  }

  &::after {
    right: 18px;
    width: 42px;
    height: 42px;
  }
`;

export const IllustrationRoute = styled.div`
  position: absolute;
  inset: 98px 36px 42px 0;
  border-radius: 72px;
  background:
    radial-gradient(circle at 14% 36%, rgba(21, 128, 61, 0.14) 0 16px, transparent 17px),
    linear-gradient(90deg, rgba(21, 128, 61, 0.08), rgba(21, 128, 61, 0.04));

  span {
    position: absolute;
    left: 44px;
    right: 52px;
    top: 42px;
    height: 46px;
    border-bottom: 3px dashed rgba(21, 128, 61, 0.48);
    border-right: 3px dashed rgba(21, 128, 61, 0.48);
    border-radius: 0 0 34px 0;
  }
`;

export const IllustrationPin = styled.span`
  position: absolute;
  top: 94px;
  left: 28px;
  width: 42px;
  height: 42px;
  border-radius: 50% 50% 50% 0;
  background: #15803d;
  transform: rotate(-45deg);
  box-shadow: 0 14px 22px rgba(21, 128, 61, 0.22);

  &::before {
    content: '';
    position: absolute;
    inset: 14px;
    border-radius: 999px;
    background: #ffffff;
  }
`;

export const IllustrationFlag = styled.span`
  position: absolute;
  right: 48px;
  bottom: 78px;
  width: 48px;
  height: 58px;
  border-left: 4px solid #15803d;

  &::before {
    content: '';
    position: absolute;
    top: 2px;
    left: 0;
    width: 38px;
    height: 24px;
    border-radius: 0 16px 16px 0;
    background: #15803d;
  }
`;

export const ProgressCard = styled.section`
  display: grid;
  gap: 22px;
  padding: 22px 24px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: ${({ theme }) => theme.colors.surface};

  @media (max-width: 560px) {
    padding: 18px;
  }
`;

export const ProgressHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  flex-wrap: wrap;
`;

export const CardTitle = styled.h2`
  display: flex;
  align-items: center;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 10px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 16px;
  font-weight: 850;
  line-height: 1.25;

  @media (max-width: 560px) {
    gap: 6px;
    font-size: 14px;
    line-height: 1.18;
  }
`;

export const ProgressPercent = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  padding: 0 14px;
  border-radius: 999px;
  background: rgba(21, 128, 61, 0.1);
  color: #15803d;
  font-size: 12px;
  font-weight: 850;
  white-space: nowrap;

  @media (max-width: 560px) {
    min-height: 22px;
    padding: 0 8px;
    font-size: 10px;
  }
`;

export const ProgressTrackList = styled.ol`
  list-style: none;
  display: grid;
  grid-template-columns: repeat(7, minmax(88px, 1fr));
  gap: 0;
  margin: 0;
  padding: 10px 4px 0;
  overflow-x: auto;
`;

export const ProgressStep = styled.li<{ $tone: StepTone }>`
  position: relative;
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 10px;
  min-width: 88px;
  color: ${({ $tone }) => ($tone === 'upcoming' ? '#667085' : '#15803d')};

  &:not(:first-child)::before {
    content: '';
    position: absolute;
    top: 18px;
    left: calc(-50% + 18px);
    right: calc(50% + 18px);
    height: 2px;
    background: ${({ $tone }) => ($tone === 'upcoming' ? '#d7dde7' : '#15803d')};
  }
`;

export const ProgressStepMarker = styled.span<{ $tone: StepTone }>`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 999px;
  border: ${({ $tone }) => ($tone === 'complete' ? '0' : '2px solid currentColor')};
  background: ${({ $tone }) => ($tone === 'complete' ? '#15803d' : '#ffffff')};
  color: ${({ $tone }) =>
    $tone === 'complete' ? '#ffffff' : $tone === 'current' ? '#15803d' : '#98a2b3'};
  box-shadow: ${({ $tone }) => ($tone === 'current' ? '0 0 0 5px rgba(21, 128, 61, 0.1)' : 'none')};
`;

export const ProgressStepLabel = styled.span`
  color: currentColor;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.3;
  text-align: center;
`;

export const JourneyDashboardGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 0.92fr) minmax(0, 1.08fr);
  gap: 22px;

  @media (max-width: 900px) {
    grid-template-columns: 1fr;
  }
`;

export const ActionCard = styled.section`
  display: grid;
  align-content: start;
  gap: 24px;
  padding: 26px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: ${({ theme }) => theme.colors.surface};

  ${PrimaryActionLink} {
    width: 100%;
  }

  @media (max-width: 560px) {
    gap: 12px;
    padding: 12px;
  }
`;

export const ActionHeader = styled.div`
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  gap: 18px;
  align-items: start;

  @media (max-width: 560px) {
    grid-template-columns: 32px minmax(0, 1fr);
    gap: 10px;
  }
`;

export const ActionIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 54px;
  height: 54px;
  border-radius: 999px;
  background: rgba(21, 128, 61, 0.1);
  color: #15803d;

  @media (max-width: 560px) {
    width: 30px;
    height: 30px;

    svg {
      width: 16px;
      height: 16px;
    }
  }
`;

export const ActionCopy = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;

  @media (max-width: 560px) {
    gap: 4px;
  }
`;

export const EstimateBox = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 4px 14px;
  padding: 20px;
  border-radius: 10px;
  background:
    radial-gradient(circle at 92% 0%, rgba(21, 128, 61, 0.12), transparent 34%),
    rgba(240, 253, 244, 0.62);
  color: ${({ theme }) => theme.colors.textSecondary};

  svg {
    grid-row: span 2;
    color: #15803d;
  }

  span {
    font-size: 13px;
    line-height: 1.2;
  }

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 15px;
    font-weight: 850;
    line-height: 1.2;
  }

  @media (max-width: 560px) {
    gap: 2px 8px;
    padding: 9px 10px;
    border-radius: 8px;

    svg {
      width: 16px;
      height: 16px;
    }

    span {
      font-size: 11px;
      line-height: 1.15;
    }

    strong {
      font-size: 12px;
      line-height: 1.15;
    }
  }
`;

export const OverviewCard = styled.section`
  display: grid;
  align-content: start;
  gap: 18px;
  padding: 26px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  background: ${({ theme }) => theme.colors.surface};
  scroll-margin-top: 90px;

  @media (max-width: 560px) {
    gap: 10px;
    padding: 12px;
  }
`;

export const OverviewList = styled.ol`
  list-style: none;
  display: grid;
  gap: 0;
  margin: 0;
  padding: 0;
`;

export const OverviewItem = styled.li<{ $tone: StepTone }>`
  position: relative;
  display: grid;
  grid-template-columns: 32px minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;
  min-height: 44px;
  padding: 0 8px;
  border-radius: 8px;
  background: ${({ $tone }) =>
    $tone === 'current' ? 'linear-gradient(90deg, rgba(21, 128, 61, 0.1), rgba(21, 128, 61, 0.02))' : 'transparent'};

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    top: calc(50% + 12px);
    left: 24px;
    bottom: calc(-50% + 12px);
    width: 1px;
    border-left: 1px dashed ${({ $tone }) => ($tone === 'upcoming' ? '#d7dde7' : 'rgba(21, 128, 61, 0.36)')};
  }

  @media (max-width: 560px) {
    grid-template-columns: 24px minmax(0, 1fr) auto;
    gap: 8px;
    min-height: 34px;
    padding: 4px 6px;

    ${StatusPill} {
      grid-column: 3;
      grid-row: 1;
      justify-self: end;
      margin-bottom: 0;
    }
  }
`;

export const OverviewMarker = styled.span<{ $tone: StepTone }>`
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  justify-self: center;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  border: 2px solid ${({ $tone }) => ($tone === 'upcoming' ? '#cfd4dc' : '#15803d')};
  background: ${({ $tone }) => ($tone === 'complete' ? '#15803d' : '#ffffff')};
  color: ${({ $tone }) => ($tone === 'complete' ? '#ffffff' : $tone === 'current' ? '#15803d' : '#98a2b3')};

  @media (max-width: 560px) {
    width: 20px;
    height: 20px;
    border-width: 1px;

    svg {
      width: 11px;
      height: 11px;
    }
  }
`;

export const OverviewStepName = styled.span`
  min-width: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 800;
  line-height: 1.35;

  @media (max-width: 560px) {
    font-size: 12px;
    line-height: 1.2;
  }
`;

export const InfoCallout = styled.aside`
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr) auto;
  align-items: center;
  gap: 18px;
  padding: 20px 24px;
  border-radius: 12px;
  border: 1px solid rgba(37, 99, 235, 0.24);
  background: linear-gradient(135deg, rgba(239, 247, 255, 0.96), rgba(255, 255, 255, 0.98));

  @media (max-width: 720px) {
    grid-template-columns: 42px minmax(0, 1fr);
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
    padding: 18px;
  }
`;

export const InfoCalloutIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: #2563eb;
  color: #ffffff;
`;

export const InfoCalloutCopy = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

export const InfoCalloutTitle = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  font-weight: 850;
  line-height: 1.25;
`;

export const InfoCalloutLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  min-height: 38px;
  color: #2563eb;
  font-size: 14px;
  font-weight: 850;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    color: #1d4ed8;
  }

  &:focus-visible {
    outline: 2px solid #2563eb;
    outline-offset: 3px;
  }

  @media (max-width: 720px) {
    grid-column: 2;
    justify-self: start;
  }

  @media (max-width: 560px) {
    grid-column: auto;
  }
`;

export const StepList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: 1fr;
  gap: 0;
  min-width: 0;
`;

export const StepScroll = styled.div`
  overflow: visible;
  padding: 0;
`;

export const StepFormsSection = styled.div`
  display: grid;
  gap: 14px;
`;

export const StepFormsHeader = styled.div`
  display: grid;
  gap: 4px;
  padding-top: 26px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const StepFormsGrid = styled.div`
  display: grid;
  gap: 14px;
`;

export const StepFormsGroup = styled.div`
  display: grid;
  gap: 12px;
`;

export const StepItem = styled.li<{ $tone: StepTone }>`
  position: relative;
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  align-items: start;
  gap: 18px;
  min-width: 0;
  min-height: 136px;

  &:not(:last-child)::before {
    content: '';
    position: absolute;
    top: 45px;
    bottom: -38px;
    left: 29px;
    width: 1px;
    background: ${({ $tone }) => ($tone === 'upcoming' ? '#d7dde7' : 'rgba(21, 128, 61, 0.4)')};
    z-index: 0;
  }

  @media (max-width: 640px) {
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 12px;
    min-height: 0;

    &:not(:last-child)::before {
      left: 22px;
      bottom: -26px;
    }
  }
`;

export const StepPanel = styled.div<{ $tone: StepTone }>`
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) auto;
  align-items: center;
  gap: 20px;
  min-height: 132px;
  padding: 24px 32px;
  border: 1px solid rgba(148, 163, 184, 0.28);
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.88);
  opacity: ${({ $tone }) => ($tone === 'upcoming' ? 0.7 : 1)};

  @media (max-width: 760px) {
    grid-template-columns: 70px minmax(0, 1fr);
    padding: 22px;
  }

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
    gap: 16px;
  }
`;

export const StepBadge = styled.span<{ $tone: StepTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  grid-column: 1;
  grid-row: 1;
  margin-top: 24px;
  width: 38px;
  height: 38px;
  justify-self: center;
  border-radius: 999px;
  border: 3px solid ${({ $tone }) => ($tone === 'upcoming' ? '#cfd4dc' : '#15803d')};
  background: #ffffff;
  color: ${({ $tone }) => ($tone === 'upcoming' ? '#647083' : '#101828')};
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0;

  @media (max-width: 640px) {
    width: 38px;
    height: 38px;
    margin-top: 22px;
    font-size: 14px;
  }
`;

export const StepConnectorCheck = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 76px;
  left: 19px;
  z-index: 1;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #15803d;
  color: #ffffff;

  @media (max-width: 640px) {
    top: 70px;
    left: 12px;
    width: 20px;
    height: 20px;

    svg {
      width: 12px;
      height: 12px;
    }
  }
`;

export const StepIconBox = styled.span<{ $tone: StepTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 14px;
  background: ${({ $tone }) =>
    $tone === 'upcoming'
      ? 'linear-gradient(180deg, #f4f4f5, #ededee)'
      : 'linear-gradient(180deg, rgba(205, 252, 221, 0.58), rgba(234, 247, 239, 0.78))'};
  color: ${({ $tone }) => ($tone === 'upcoming' ? '#5f6672' : '#2f8650')};

  svg {
    width: 26px;
    height: 26px;
  }

  @media (max-width: 760px) {
    width: 62px;
    height: 62px;
  }
`;

export const StepText = styled.div`
  display: grid;
  justify-items: start;
  gap: 8px;
  min-width: 0;
`;

export const StepName = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.18;
  color: #101828;

  @media (max-width: 760px) {
    font-size: 16px;
  }
`;

export const StepCopy = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.58;
  color: #586174;
`;

export const StepStatus = styled.span<{ $tone: StepTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: fit-content;
  justify-self: end;
  min-height: 32px;
  padding: 0 13px;
  border-radius: 7px;
  border: 0;
  background: ${({ $tone }) => ($tone === 'complete' ? 'rgba(21, 128, 61, 0.1)' : '#f0f0f1')};
  color: ${({ $tone }) => ($tone === 'complete' ? '#2f6f45' : '#666d7a')};
  font-size: 12px;
  font-weight: 800;
  white-space: nowrap;

  @media (max-width: 760px) {
    grid-column: 2;
    justify-self: start;
  }

  @media (max-width: 480px) {
    grid-column: auto;
  }
`;

export const StepStatusLink = styled(Link)<{ $tone: StepTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: fit-content;
  justify-self: end;
  min-height: 32px;
  padding: 0 13px;
  border-radius: 7px;
  border: 1px solid rgba(21, 128, 61, 0.24);
  background: rgba(21, 128, 61, 0.1);
  color: #2f6f45;
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;
  white-space: nowrap;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.textPrimary};
    outline-offset: 2px;
  }

  @media (max-width: 760px) {
    grid-column: 2;
    justify-self: start;
  }

  @media (max-width: 480px) {
    grid-column: auto;
  }
`;

export const OrderGrid = styled.div`
  display: grid;
  gap: 14px;
`;

export const OrderCard = styled.article<{ $active: boolean }>`
  display: grid;
  gap: 10px;
  padding: 18px;
  border-radius: 14px;
  border: 1px solid ${({ $active, theme }) => ($active ? theme.colors.textPrimary : theme.colors.borderDefault)};
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const OrderTitle = styled.h2`
  margin: 0;
  font-size: 40px;
  font-weight: 900;
  color: ${({ theme }) => theme.colors.textPrimary};
  line-height: 0.95;

  @media (max-width: 560px) {
    font-size: 34px;
  }
`;

export const SecondaryActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  max-width: 100%;
  min-width: 130px;
  min-height: 44px;
  padding: 0 18px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  text-align: center;
  white-space: normal;
  overflow-wrap: anywhere;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media (max-width: 640px) {
    width: auto;
    padding: 10px 12px;
  }
`;

export const OrderProblemSection = styled.section`
  display: grid;
  gap: 28px;
  padding: 32px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.05);

  @media (max-width: 720px) {
    padding: 22px;
  }
`;

export const OrderProblemHeader = styled.div`
  display: flex;
  align-items: flex-start;
  gap: 24px;

  @media (max-width: 640px) {
    flex-direction: column;
    gap: 16px;
  }
`;

export const OrderProblemIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 70px;
  height: 70px;
  flex: 0 0 70px;
  border-radius: 18px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
`;

export const OrderProblemStage = styled.strong`
  color: #dc2626;
  font-weight: 900;
`;

export const OrderProblemReason = styled.p`
  position: relative;
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 24px;
  margin: 0;
  padding: 28px 30px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-left: 6px solid #dc2626;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 17px;
  line-height: 1.55;

  strong {
    color: #dc2626;
  }

  > svg {
    color: #dc2626;
  }

  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

export const ContactPanel = styled.div`
  display: grid;
  gap: 24px;
  padding: 32px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};

  @media (max-width: 720px) {
    padding: 22px;
  }
`;

export const ContactHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 28px;

  @media (max-width: 640px) {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
  }
`;

export const ContactHeaderIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  flex: 0 0 64px;
  border-radius: 16px;
  border: 1px solid #fecaca;
  background: #fef2f2;
  color: #dc2626;
`;

export const ContactEmail = styled.strong`
  color: #dc2626;
  font-weight: 800;
`;

export const ContactForm = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 22px 28px;

  @media (max-width: 760px) {
    grid-template-columns: 1fr;
  }
`;

export const ContactField = styled.label<{ $full?: boolean }>`
  display: grid;
  grid-column: ${({ $full }) => ($full ? '1 / -1' : 'auto')};
  gap: 7px;
  min-width: 0;

  span {
    font-size: 12px;
    font-weight: 900;
    letter-spacing: 0.08em;
    text-transform: uppercase;
    color: ${({ theme }) => theme.colors.textSecondary};
  }

  label {
    display: grid;
    grid-template-columns: auto minmax(0, 1fr);
    align-items: center;
    gap: 14px;
    border: 1px solid ${({ theme }) => theme.colors.borderDefault};
    border-radius: 8px;
    background: ${({ theme }) => theme.colors.bgElevated};
    color: ${({ theme }) => theme.colors.textPrimary};
    padding: 0 16px;
    transition:
      border-color 160ms ease,
      box-shadow 160ms ease;

    &:focus-within {
      border-color: ${({ theme }) => theme.colors.textPrimary};
      box-shadow: 0 0 0 3px rgba(23, 23, 23, 0.08);
    }

    > svg {
      color: ${({ theme }) => theme.colors.textPrimary};
    }
  }

  input {
    width: 100%;
    min-width: 0;
    min-height: 46px;
    border: 0;
    outline: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.textPrimary};
    font: inherit;
    font-size: 15px;
  }

  textarea {
    width: 100%;
    min-width: 0;
    resize: vertical;
    min-height: 170px;
    border: 0;
    outline: 0;
    background: transparent;
    color: ${({ theme }) => theme.colors.textPrimary};
    font: inherit;
    font-size: 15px;
    line-height: 1.65;
    padding: 16px 0;
  }

  &:has(textarea) label {
    align-items: center;
  }
`;

export const ContactActions = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  grid-column: 1 / -1;
  gap: 28px;
`;

export const ContactSubmitLink = styled.a`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  width: fit-content;
  min-height: 52px;
  padding: 0 28px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.textPrimary};
  background: linear-gradient(135deg, #111111, #242424);
  color: #ffffff;
  text-decoration: none;
  font-size: 15px;
  font-weight: 800;
  box-shadow: 0 12px 24px rgba(23, 23, 23, 0.18);
`;

export const ContactPrivacyNote = styled.span`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
`;
