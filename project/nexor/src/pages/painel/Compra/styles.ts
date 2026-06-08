import styled from 'styled-components';
import { Button } from '@nexor/design-system';
import { Link } from 'react-router-dom';

export const Page = styled.div`
  width: 100%;
  display: grid;
  gap: 28px;
`;

export const SuccessHeader = styled.header`
  display: grid;
  align-items: start;
  gap: 18px;

  @media (max-width: 640px) {
    gap: 14px;
  }
`;

export const SuccessHeroCopy = styled.div`
  display: grid;
  gap: 8px;
`;

export const SuccessTitle = styled.h1`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(2rem, 3.4vw, 2.75rem);
  line-height: 1.08;
  font-weight: 800;

  @media (max-width: 1280px) {
    font-size: clamp(1.5rem, 2.4vw, 2.1rem);
  }
`;

export const SuccessKicker = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  line-height: 1.4;

  &::after {
    content: '';
  }

  @media (max-width: 640px) {
    font-size: 14px;
  }
`;

export const SuccessDescription = styled.p`
  max-width: 860px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.6;
`;

export const Description = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Banner = styled.div`
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.6;
`;

export const Layout = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(280px, 360px);
  gap: 28px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const Card = styled.section`
  display: grid;
  gap: 18px;
  padding: 28px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  box-shadow: 0 16px 40px rgba(23, 23, 23, 0.04);
`;

export const SuccessOrderBanner = styled.section`
  display: grid;
  grid-template-columns: minmax(280px, 1.2fr) repeat(4, minmax(132px, 0.72fr));
  align-items: center;
  gap: 0;
  min-height: 204px;
  padding: 34px 28px;
  border: 1px solid rgba(21, 128, 61, 0.22);
  border-radius: 10px;
  background: linear-gradient(135deg, rgba(240, 253, 244, 0.96) 0%, ${({ theme }) => theme.colors.bgElevated} 58%);
  color: ${({ theme }) => theme.colors.textPrimary};
  box-shadow: 0 16px 40px rgba(21, 128, 61, 0.06);

  @media (max-width: 1060px) {
    grid-template-columns: repeat(2, minmax(0, 1fr));
    gap: 20px 0;
  }

  @media (max-width: 680px) {
    grid-template-columns: 1fr;
    min-height: auto;
    padding: 20px;
  }
`;

export const SuccessOrderSummary = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 26px;
  min-width: 0;

  @media (max-width: 680px) {
    gap: 16px;
  }
`;

export const SuccessOrderIcon = styled.span`
  position: relative;
  display: inline-grid;
  place-items: center;
  width: 108px;
  height: 108px;
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.greenGhost};
  color: ${({ theme }) => theme.colors.green};

  @media (max-width: 680px) {
    width: 64px;
    height: 64px;

    svg {
      width: 30px;
      height: 30px;
    }
  }
`;

export const SuccessOrderIconBadge = styled.span`
  position: absolute;
  right: 18px;
  bottom: 18px;
  display: inline-grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border: 3px solid ${({ theme }) => theme.colors.greenGhost};
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.bgElevated};

  @media (max-width: 680px) {
    right: 6px;
    bottom: 6px;
    width: 22px;
    height: 22px;
  }
`;

export const SuccessOrderText = styled.div`
  display: grid;
  gap: 10px;
  min-width: 0;
`;

export const OrderEyebrow = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 700;
`;

export const SuccessOrderId = styled.strong`
  color: ${({ theme }) => theme.colors.green};
  font-size: clamp(2.1rem, 4vw, 2.75rem);
  line-height: 1;
  font-weight: 900;
`;

export const SuccessOrderHelp = styled.p`
  max-width: 250px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.55;
`;

export const SuccessOrderMeta = styled.div`
  display: grid;
  gap: 14px;
  min-height: 112px;
  padding-left: 24px;
  border-left: 1px solid ${({ theme }) => theme.colors.borderDefault};

  @media (max-width: 1060px) {
    padding: 18px 0 0;
    border-left: 0;
    border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
  }
`;

export const SuccessMetaLabel = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 800;
`;

export const SuccessMetaValue = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.35;

  svg {
    flex: 0 0 auto;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const SuccessStatusPill = styled.span`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  min-height: 54px;
  gap: 9px;
  padding: 0 18px;
  border: 1px solid rgba(21, 128, 61, 0.3);
  border-radius: 999px;
  background: ${({ theme }) => theme.colors.greenGhost};
  color: ${({ theme }) => theme.colors.green};
  font-size: 14px;
  font-weight: 800;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: ${({ theme }) => theme.colors.green};
  }
`;

export const SummaryCard = styled(Card)`
  align-self: start;
  gap: 24px;
`;

export const CardTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Divider = styled.hr`
  width: 100%;
  height: 1px;
  margin: 2px 0;
  border: 0;
  background: ${({ theme }) => theme.colors.borderDefault};
`;

export const StepList = styled.ol`
  margin: 0;
  padding: 0;
  display: grid;
  gap: 12px;
  list-style: none;
  counter-reset: purchase-step;
  position: relative;
`;

export const StepItem = styled.li`
  position: relative;
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: start;
  gap: 12px;
  min-height: 54px;
  font-size: 14px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textSecondary};

  &::before {
    content: '';
    position: absolute;
    top: 36px;
    bottom: -14px;
    left: 17px;
    width: 1px;
    background: ${({ theme }) => theme.colors.borderDefault};
  }

  &:last-child::before {
    display: none;
  }

  @media (max-width: 560px) {
    grid-template-columns: 38px minmax(0, 1fr);
  }
`;

type StepState = 'confirmed' | 'active' | 'pending';

export const StepNumber = styled.span<{ $state: StepState }>`
  display: inline-grid;
  width: 36px;
  height: 36px;
  place-items: center;
  border-radius: 999px;
  border: 1px solid
    ${({ $state, theme }) =>
      $state === 'confirmed'
        ? 'rgba(21, 128, 61, 0.34)'
        : $state === 'active'
          ? 'rgba(209, 138, 0, 0.42)'
          : theme.colors.borderDefault};
  background: ${({ $state, theme }) =>
    $state === 'confirmed' ? theme.colors.greenGhost : $state === 'active' ? 'rgba(209, 138, 0, 0.1)' : theme.colors.bgInset};
  color: ${({ $state, theme }) =>
    $state === 'confirmed' ? theme.colors.green : $state === 'active' ? '#9a6500' : theme.colors.textSecondary};
`;

export const StepCopy = styled.span`
  display: grid;
  gap: 6px;
  min-width: 0;

  > span:first-child {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 14px;
    font-weight: 700;
    line-height: 1.45;
  }
`;

export const StepStatus = styled.span<{ $state: StepState }>`
  display: inline-flex;
  width: fit-content;
  min-height: 24px;
  align-items: center;
  padding: 0 10px;
  border-radius: 999px;
  background: ${({ $state, theme }) =>
    $state === 'confirmed' ? theme.colors.greenGhost : $state === 'active' ? 'rgba(209, 138, 0, 0.1)' : '#f3f4f6'};
  color: ${({ $state, theme }) =>
    $state === 'confirmed' ? theme.colors.green : $state === 'active' ? '#9a6500' : '#4b5563'};
  font-size: 12px;
  font-weight: 800;
`;

export const SummaryRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  font-size: 16px;
  color: ${({ theme }) => theme.colors.textPrimary};

  > span:first-child {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const Total = styled.strong`
  font-size: 28px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.green};
`;

export const CheckoutButton = styled(Button)`
  width: max-content;
  min-width: max-content;
  min-height: 52px;
  padding: 0 22px 0 30px;
  justify-content: center;
  justify-self: end;
  gap: 22px;
  border-radius: 8px;
  border-color: ${({ theme }) => theme.colors.green};
  background: ${({ theme }) => theme.colors.green};
  color: ${({ theme }) => theme.colors.bgElevated};
  font-size: 15px;
  font-weight: 700;
  text-transform: none;
  letter-spacing: 0;
  box-shadow: 0 14px 30px rgba(21, 128, 61, 0.24);

  > span {
    display: inline-flex;
    align-items: center;
    gap: 22px;
    white-space: nowrap;
  }

  svg {
    flex: 0 0 auto;
  }

  &:not(:disabled):hover {
    border-color: #116b37;
    background: #116b37;
    transform: translateY(-1px);
  }

  &:not(:disabled):active {
    transform: translateY(0);
  }

  &:disabled {
    border-color: ${({ theme }) => theme.colors.borderDefault};
    background: ${({ theme }) => theme.colors.bgInset};
    color: ${({ theme }) => theme.colors.textSecondary};
    box-shadow: none;
  }

  @media (max-width: 520px) {
    width: 100%;
    min-width: 0;
    padding: 0 18px;

    > span {
      gap: 12px;
    }
  }
`;

export const PaymentApprovedBox = styled.div`
  display: grid;
  grid-template-columns: 34px minmax(0, 1fr);
  gap: 16px;
  align-items: center;
  padding: 18px 20px;
  border: 1px solid rgba(21, 128, 61, 0.2);
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.greenGhost};
  color: ${({ theme }) => theme.colors.green};
  font-size: 13px;
  line-height: 1.5;

  > span {
    display: grid;
    gap: 4px;
  }

  strong {
    color: ${({ theme }) => theme.colors.green};
    font-size: 14px;
  }
`;

export const DetailsLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 64px;
  padding: 0 24px;
  border: 1px solid ${({ theme }) => theme.colors.textPrimary};
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgElevated};
  font-size: 14px;
  font-weight: 800;
  line-height: 1.2;
  text-align: center;
  text-decoration: none;
  text-transform: uppercase;
  transition:
    transform 180ms ease,
    background 180ms ease;

  &:hover {
    transform: translateY(-1px);
    background: #111827;
  }
`;

export const InfoPanel = styled.aside`
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  align-items: center;
  gap: 18px;
  padding: 18px 20px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const InfoIcon = styled.span`
  display: inline-grid;
  width: 44px;
  height: 44px;
  place-items: center;
  border-radius: 50%;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const InfoCopy = styled.p`
  display: grid;
  gap: 4px;
  margin: 0;
  font-size: 14px;
  line-height: 1.45;
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
    font-size: 15px;
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const SuccessFooter = styled.aside`
  display: grid;
  grid-template-columns: 58px minmax(0, 1fr);
  align-items: center;
  gap: 22px;
  padding: 28px 30px;
  border-radius: 10px;
  border: 1px solid rgba(21, 128, 61, 0.18);
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.greenGhost} 0%, ${({ theme }) => theme.colors.bgElevated} 60%);
  color: ${({ theme }) => theme.colors.textPrimary};

  @media (max-width: 760px) {
    grid-template-columns: 48px minmax(0, 1fr);

  }
`;

export const SuccessFooterIcon = styled.span`
  display: inline-grid;
  place-items: center;
  color: ${({ theme }) => theme.colors.green};
`;

export const SuccessFooterCopy = styled.p`
  display: grid;
  gap: 6px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.5;

  strong {
    color: ${({ theme }) => theme.colors.green};
    font-size: 18px;
    line-height: 1.25;
  }
`;
