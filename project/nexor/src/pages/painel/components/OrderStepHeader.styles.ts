import styled from 'styled-components';
import { Link } from 'react-router-dom';

export const Header = styled.header`
  display: grid;
  gap: 22px;
`;

export const Breadcrumb = styled.nav`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 10px 14px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 12px;
`;

export const OverviewLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 30px;
  padding: 0 10px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 6px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: 700;
  text-decoration: none;

  svg {
    flex-shrink: 0;
  }

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
    color: ${({ theme }) => theme.colors.textPrimary};
  }
`;

export const StepList = styled.ol`
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 6px;
  margin: 0;
  padding: 0;
  list-style: none;
`;

export const StepCrumb = styled.span<{ $active: boolean }>`
  display: inline-flex;
  align-items: center;
  min-height: 28px;
  padding: 0 4px;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-weight: ${({ $active }) => ($active ? 700 : 600)};
  opacity: ${({ $active }) => ($active ? 1 : 0.28)};
`;

export const Copy = styled.div`
  display: grid;
  gap: 12px;
`;

export const Title = styled.h1`
  margin: 0;
  max-width: 760px;
  font-size: clamp(2rem, 3.4vw, 2.75rem);
  line-height: 1.08;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const Description = styled.p`
  max-width: 760px;
  margin: 0;
  font-size: 16px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-weight: 700;
  }
`;

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
`;

export const OrderHelpText = styled.p`
  max-width: 270px;
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.45;
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
