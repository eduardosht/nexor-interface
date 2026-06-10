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
  grid-template-columns: minmax(280px, 1.4fr) repeat(3, minmax(150px, 0.8fr));
  align-items: center;
  gap: 0;
  min-height: 178px;
  padding: 32px 26px;
  border: 1px solid #fed7aa;
  border-radius: 12px;
  background: linear-gradient(135deg, #fffbeb 0%, ${({ theme }) => theme.colors.bgElevated} 52%);
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.6;

  @media (max-width: 860px) {
    grid-template-columns: 1fr;
    min-height: auto;
    gap: 18px;
  }

  @media (max-width: 1280px) {
    min-height: 128px;
    padding: 16px;
  }
`;

export const OrderSummary = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 22px;
  min-width: 0;

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }

  @media (max-width: 1280px) {
    gap: 12px;
  }
`;

export const OrderIcon = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 84px;
  height: 84px;
  border-radius: 999px;
  color: #111827;
  background: #fef3c7;

  @media (max-width: 1280px) {
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
  right: 13px;
  bottom: 13px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 2px solid #fef3c7;
  border-radius: 999px;
  color: #f59e0b;
  background: #fffbeb;

  @media (max-width: 1280px) {
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
  gap: 7px;
`;

export const OrderEyebrow = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 600;
`;

export const OrderId = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: clamp(1.6rem, 2.4vw, 1.9rem);
  line-height: 1.1;
  font-weight: 800;

  @media (max-width: 1280px) {
    font-size: clamp(1.2rem, 1.8vw, 1.45rem);
  }
`;

export const OrderHelpText = styled.p`
  max-width: 270px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.45;

  @media (max-width: 1280px) {
    font-size: 12px;
  }
`;

export const OrderMeta = styled.div`
  display: grid;
  gap: 12px;
  min-height: 92px;
  padding-left: 28px;
  border-left: 1px solid ${({ theme }) => theme.colors.borderDefault};

  @media (max-width: 860px) {
    min-height: auto;
    padding: 18px 0 0;
    border-left: 0;
    border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
  }

  @media (max-width: 1280px) {
    gap: 8px;
    min-height: 68px;
    padding-left: 16px;
  }
`;

export const OrderMetaLabel = styled.span`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 13px;
  font-weight: 700;
`;

export const OrderMetaValue = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.35;

  svg {
    flex-shrink: 0;
    color: #111827;
  }
`;

export const StatusPill = styled.span<{ $color: string }>`
  display: inline-flex;
  align-items: center;
  width: fit-content;
  gap: 7px;
  min-height: 34px;
  padding: 0 14px;
  border: 1px solid ${({ $color }) => $color};
  border-radius: 999px;
  background: #fffbeb;
  color: ${({ $color }) => $color};
  font-size: 13px;
  font-weight: 700;

  &::before {
    content: '';
    width: 7px;
    height: 7px;
    border-radius: 999px;
    background: ${({ $color }) => $color};
  }
`;
