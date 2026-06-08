import { Link } from 'react-router-dom';
import styled from 'styled-components';
import {
  biteplanerButtonHoverStyles,
  biteplanerButtonSurfaceStyles,
} from '../styles/biteplanerFormButton';

export type StepTone = 'complete' | 'current' | 'upcoming';

export const Page = styled.div`
  display: grid;
  gap: 28px;
`;

export const Description = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
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
  gap: 18px;
  padding: 22px 28px;
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
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: ${({ $tone = 'info' }) => disclaimerTone[$tone].iconBg};
  color: ${({ $tone = 'info' }) => disclaimerTone[$tone].iconColor};
`;

export const StepDisclaimerContent = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

export const StepDisclaimerTitle = styled.strong<{ $tone?: keyof typeof disclaimerTone }>`
  color: ${({ $tone = 'info' }) => disclaimerTone[$tone].title};
  font-size: 16px;
  font-weight: 850;
  line-height: 1.35;
`;

export const StepDisclaimerText = styled.span`
  font-size: 14px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const PaymentConfirmationCard = styled.section`
  display: grid;
  gap: 20px;
  padding: 24px 28px;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.34);
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.88);

  @media (max-width: 560px) {
    padding: 18px;
  }
`;

export const PaymentConfirmationHeader = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 16px;

  @media (max-width: 560px) {
    align-items: start;
  }
`;

export const PaymentConfirmationIcon = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 46px;
  height: 46px;
  border-radius: 999px;
  background: rgba(37, 99, 235, 0.1);
  color: #2563eb;
`;

export const PaymentConfirmationCopy = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;

  strong {
    color: #0f172a;
    font-size: 16px;
    font-weight: 850;
    line-height: 1.35;
  }

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 14px;
    line-height: 1.55;
  }
`;

export const PaymentDetailsGrid = styled.dl`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin: 0;

  @media (max-width: 860px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const PaymentDetailItem = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
  padding: 13px 14px;
  border-radius: 8px;
  border: 1px solid rgba(21, 128, 61, 0.14);
  background: rgba(255, 255, 255, 0.72);

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
    font-size: 12px;
    font-weight: 800;
    line-height: 1.3;
  }

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 14px;
    font-weight: 800;
    line-height: 1.35;
    overflow-wrap: anywhere;
  }
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
  gap: 34px;
  padding: 48px 58px 46px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 16px;
  background:
    radial-gradient(circle at 0% 0%, rgba(205, 252, 221, 0.5), rgba(255, 255, 255, 0) 15%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(252, 253, 255, 0.98)),
    ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 22px 62px rgba(15, 23, 42, 0.07);

  @media (max-width: 920px) {
    padding: 24px;
  }

  @media (max-width: 560px) {
    padding: 18px;
  }
`;

export const SectionHeader = styled.div`
  display: grid;
  gap: 18px;
  max-width: 760px;

  &::after {
    content: '';
    width: 56px;
    height: 2px;
    background: #15803d;
    order: 1;
  }

  ${Description} {
    order: 2;
  }
`;

export const SectionTitle = styled.h2`
  margin: 0;
  color: #091235;
  font-size: 32px;
  font-weight: 850;
  line-height: 1.15;
`;

export const StepList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 0;
  min-width: 1120px;
`;

export const StepScroll = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  padding: 8px 0 0;
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
  min-width: 0;
  text-align: center;

  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 26px;
    left: calc(50% + 22px);
    width: calc(100% - 44px);
    height: 1px;
    background: ${({ $tone }) => ($tone === 'upcoming' ? 'repeating-linear-gradient(90deg, #d6dbe3 0 5px, transparent 5px 9px)' : '#15803d')};
  }
`;

export const StepPanel = styled.div<{ $tone: StepTone }>`
  display: grid;
  justify-items: center;
  align-content: start;
  grid-template-rows: 54px 82px minmax(132px, auto) 38px;
  gap: 12px;
  min-height: 304px;
  padding: 0 16px;
  opacity: ${({ $tone }) => ($tone === 'upcoming' ? 0.7 : 1)};
`;

export const StepBadge = styled.span<{ $tone: StepTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1.5px solid ${({ $tone }) => ($tone === 'upcoming' ? '#cfd4dc' : '#15803d')};
  background: #ffffff;
  color: ${({ $tone }) => ($tone === 'upcoming' ? '#343b49' : '#101828')};
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0;
`;

export const StepIconBox = styled.span<{ $tone: StepTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  align-self: end;
  border-radius: 10px;
  background: ${({ $tone }) =>
    $tone === 'upcoming'
      ? 'linear-gradient(180deg, #f4f4f5, #ededee)'
      : 'linear-gradient(180deg, rgba(205, 252, 221, 0.58), rgba(234, 247, 239, 0.78))'};
  color: ${({ $tone }) => ($tone === 'upcoming' ? '#5f6672' : '#2f8650')};
`;

export const StepText = styled.div`
  display: grid;
  justify-items: center;
  gap: 14px;
  min-width: 0;
`;

export const StepName = styled.h3`
  margin: 0;
  max-width: 210px;
  font-size: 18px;
  font-weight: 800;
  line-height: 1.18;
  color: #101828;
`;

export const StepCopy = styled.p`
  margin: 0;
  max-width: 182px;
  font-size: 14px;
  line-height: 1.65;
  color: #586174;
`;

export const StepStatus = styled.span<{ $tone: StepTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: fit-content;
  justify-self: center;
  min-height: 32px;
  padding: 0 13px;
  border-radius: 7px;
  border: 0;
  background: ${({ $tone }) => ($tone === 'complete' ? 'rgba(21, 128, 61, 0.1)' : '#f0f0f1')};
  color: ${({ $tone }) => ($tone === 'complete' ? '#2f6f45' : '#666d7a')};
  font-size: 12px;
  font-weight: 800;
`;

export const StepStatusLink = styled(Link)<{ $tone: StepTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: fit-content;
  justify-self: center;
  min-height: 32px;
  padding: 0 13px;
  border-radius: 7px;
  border: 1px solid rgba(21, 128, 61, 0.24);
  background: rgba(21, 128, 61, 0.1);
  color: #2f6f45;
  font-size: 12px;
  font-weight: 800;
  text-decoration: none;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }

  &:focus-visible {
    outline: 2px solid ${({ theme }) => theme.colors.textPrimary};
    outline-offset: 2px;
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
  font-size: 16px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const SecondaryActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  max-width: 100%;
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
  white-space: nowrap;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }

  @media (max-width: 640px) {
    width: 100%;
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

  ${SectionTitle} {
    font-size: clamp(1.65rem, 2.4vw, 2.35rem);
    line-height: 1.1;
  }

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
