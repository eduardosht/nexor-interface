import styled from 'styled-components';
import { PortalPageDescription, PortalPageTitle } from '../styles/portalTypography';

export const Header = styled.header`
  display: grid;
  gap: 22px;

  @media (max-width: 1280px) {
    gap: 14px;
  }
`;

export const Copy = styled.div`
  display: grid;
  gap: 12px;
`;

export const Title = PortalPageTitle;

export const Description = PortalPageDescription;

export const OrderBanner = styled.section`
  display: grid;
  grid-template-columns: minmax(300px, 1.35fr) minmax(190px, 0.95fr) minmax(190px, 0.9fr) minmax(180px, 0.85fr);
  align-items: center;
  gap: 0;
  min-height: 148px;
  padding: 28px 34px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.6;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.03);

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    min-height: auto;
    padding: 24px;
  }

  @media (max-width: 1280px) {
    min-height: 120px;
    padding: 20px;
  }

  @media (max-width: 560px) {
    padding: 18px;
  }
`;

export const OrderSummary = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 22px;
  min-width: 0;
  padding-right: 36px;

  @media (max-width: 560px) {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 14px;
  }

  @media (max-width: 1280px) {
    gap: 16px;
    padding-right: 24px;
  }

  @media (max-width: 860px) {
    padding-right: 0;
  }
`;

export const OrderIcon = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  border-radius: 14px;
  color: #111827;
  background: #fff4e3;

  @media (max-width: 1280px) {
    width: 56px;
    height: 56px;

    svg {
      width: 28px;
      height: 28px;
    }
  }

  @media (max-width: 560px) {
    width: 32px;
    height: 32px;

    svg {
      width: 18px;
      height: 18px;
    }
  }
`;

export const OrderIconBadge = styled.span`
  position: absolute;
  right: 8px;
  bottom: 9px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 26px;
  height: 26px;
  border: 4px solid #fff4e3;
  border-radius: 999px;
  color: #f28c28;
  background: #ffffff;

  @media (max-width: 1280px) {
    right: 4px;
    bottom: 4px;
    width: 19px;
    height: 19px;
    border-width: 3px;

    svg {
      width: 11px;
      height: 11px;
    }
  }

  @media (max-width: 560px) {
    right: -2px;
    bottom: -2px;
    width: 14px;
    height: 14px;
    border-width: 1px;

    svg {
      width: 9px;
      height: 9px;
    }
  }
`;

export const OrderSummaryText = styled.div`
  display: grid;
  gap: 5px;
  min-width: 0;
`;

export const OrderEyebrow = styled.span`
  color: #4b5563;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
`;

export const OrderId = styled.strong`
  color: #0f172a;
  font-size: clamp(1.8rem, 2.8vw, 2.3rem);
  line-height: 1.1;
  font-weight: 900;
  letter-spacing: 0;
  overflow-wrap: anywhere;

  @media (max-width: 1280px) {
    font-size: clamp(1.4rem, 2.4vw, 1.8rem);
  }
`;

export const OrderHelpText = styled.p`
  max-width: 300px;
  margin: 0;
  color: #5f6b7a;
  font-size: 14px;
  line-height: 1.42;

  @media (max-width: 1280px) {
    font-size: 13px;
  }
`;

export const OrderMeta = styled.div`
  display: grid;
  align-content: center;
  gap: 20px;
  min-height: 96px;
  padding-right: 34px;
  padding-left: 34px;
  border-left: 1px solid ${({ theme }) => theme.colors.borderDefault};

  &:last-child {
    padding-right: 0;
  }

  @media (max-width: 860px) {
    min-height: auto;
    gap: 12px;
    padding: 16px 0 0;
    border-left: 0;
    border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
  }

  @media (max-width: 1280px) {
    gap: 10px;
    min-height: 76px;
    padding-right: 22px;
    padding-left: 22px;
  }

  @media (max-width: 860px) {
    padding-right: 0;
    padding-left: 0;
  }
`;

export const OrderMetaLabel = styled.span`
  color: #4b5563;
  font-size: 13px;
  font-weight: 800;
  line-height: 1.25;
`;

export const OrderMetaValue = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 14px;
  color: #0f172a;
  font-size: 14px;
  font-weight: 500;
  line-height: 1.35;

  svg {
    flex-shrink: 0;
    color: #0f172a;
  }

  @media (max-width: 1280px) {
    gap: 10px;
    font-size: 13px;
  }
`;

export const StatusPill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: flex-start;
  width: fit-content;
  max-width: 260px;
  gap: 12px;
  padding: 0;
  border: 0;
  background: transparent;
  color: ${({ $color }) => $color};
  font-size: 14px;
  font-weight: 800;
  line-height: 1.45;

  &::before {
    content: '';
    flex: 0 0 auto;
    width: 8px;
    height: 8px;
    margin-top: 8px;
    border-radius: 999px;
    background: ${({ $color }) => $color};
  }

  @media (max-width: 1280px) {
    gap: 9px;
    font-size: 13px;
  }
`;
