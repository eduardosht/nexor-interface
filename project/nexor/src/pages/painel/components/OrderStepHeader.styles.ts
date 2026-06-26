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

export const OrderBanner = styled.section<{ $hideLastUpdate?: boolean; $summaryOnly?: boolean }>`
  display: grid;
  grid-template-columns: ${({ $summaryOnly }) => ($summaryOnly ? '1fr' : 'minmax(0, 1.2fr) minmax(260px, 0.8fr)')};
  gap: 18px;
  align-items: center;
  min-height: ${({ $summaryOnly }) => ($summaryOnly ? '112px' : '148px')};
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 14px;
  line-height: 1.6;
  box-shadow: 0 10px 28px rgba(15, 23, 42, 0.03);
  container-type: inline-size;

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

  @container (max-width: 720px) {
    grid-template-columns: minmax(0, 1.35fr) minmax(118px, 0.65fr);
    ${({ $summaryOnly }) => ($summaryOnly ? 'grid-template-columns: 1fr;' : '')}
    align-items: start;
    row-gap: 18px;
    min-height: auto;
    padding: 20px;
  }

  @container (max-width: 420px) {
    grid-template-columns: 1fr;
  }
`;

export const OrderSummary = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 22px;
  min-width: 0;

  @media (max-width: 560px) {
    grid-template-columns: auto minmax(0, 1fr);
    gap: 14px;
  }

  @media (max-width: 1280px) {
    gap: 16px;
  }
`;

export const OrderIcon = styled.span`
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  border-radius: 14px;
  color: #111827;
  background: #fff4e3;

  svg {
    width: 30px;
    height: 30px;
  }

  @media (max-width: 1280px) {
    width: 40px;
    height: 40px;

    svg {
      width: 22px;
      height: 22px;
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
  right: 3px;
  bottom: 3px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  border: 3px solid #fff4e3;
  border-radius: 999px;
  color: #f28c28;
  background: #ffffff;

  svg {
    width: 10px;
    height: 10px;
  }

  @media (max-width: 1280px) {
    right: -1px;
    bottom: -1px;
    width: 14px;
    height: 14px;
    border-width: 2px;

    svg {
      width: 8px;
      height: 8px;
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
  font-weight: 700;
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

export const OrderStatusSummary = styled.span`
  display: inline-flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  color: #5f6b7a;
  font-size: 12px;
  line-height: 1.35;

  span {
    font-weight: 700;
  }

  strong {
    color: #0f172a;
    font-weight: 700;
  }
`;

export const OrderMetadata = styled.div`
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;

  @media (max-width: 720px) {
    grid-template-columns: 1fr;
  }
`;

export const OrderMetadataItem = styled.span`
  display: grid;
  gap: 2px;
  min-width: 0;
  padding: 10px 12px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgBase};

  span {
    color: #5f6b7a;
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0;
    line-height: 1.35;
  }

  strong {
    color: #0f172a;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.3;
  }

  small {
    color: #5f6b7a;
    font-size: 12px;
    line-height: 1.3;
  }
`;

export const OrderHelpText = styled.p`
  max-width: min(520px, 100%);
  margin: 0;
  color: #5f6b7a;
  font-size: 14px;
  line-height: 1.42;

  @media (max-width: 1280px) {
    font-size: 13px;
  }
`;
