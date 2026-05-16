import styled from 'styled-components';
import { Link } from 'react-router-dom';

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
  padding: 16px 18px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  font-size: 14px;
  line-height: 1.6;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StepFlow = styled.section`
  display: grid;
  gap: 26px;
`;

export const SectionHeader = styled.div`
  display: grid;
  gap: 6px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 22px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StepList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 28px;
  min-width: 1040px;
`;

export const StepScroll = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  padding: 16px 8px 10px;
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
    top: 24px;
    left: calc(50% + 52px);
    width: calc(100% - 76px);
    height: 1px;
    background: ${({ theme }) => theme.colors.borderDefault};
  }
`;

export const StepLink = styled(Link)<{ $tone: StepTone }>`
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 14px;
  min-height: 250px;
  color: inherit;
  text-decoration: none;

  &:hover {
    color: inherit;
  }
`;

export const StepPanel = styled.div<{ $tone: StepTone }>`
  display: grid;
  justify-items: center;
  align-content: start;
  gap: 14px;
  min-height: 250px;
  opacity: ${({ $tone }) => ($tone === 'upcoming' ? 0.48 : 1)};
`;

export const StepBadge = styled.span<{ $tone: StepTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: ${({ $tone, theme }) =>
    $tone === 'current' || $tone === 'complete' ? theme.colors.textPrimary : theme.colors.bgInset};
  color: ${({ $tone, theme }) =>
    $tone === 'complete' || $tone === 'current' ? theme.colors.bgBase : theme.colors.textPrimary};
  box-shadow: ${({ $tone }) => ($tone === 'current' ? '0 8px 18px rgba(0, 0, 0, 0.18)' : 'none')};
  font-size: 16px;
  font-weight: 800;
  letter-spacing: 0;
`;

export const StepName = styled.h3`
  margin: 0;
  font-size: 17px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StepCopy = styled.p`
  margin: 0;
  max-width: 190px;
  font-size: 14px;
  line-height: 1.55;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StepStatus = styled.span<{ $tone: StepTone }>`
  width: fit-content;
  justify-self: center;
  padding: 7px 12px;
  border-radius: 8px;
  border: ${({ $tone, theme }) => ($tone === 'current' ? `1px solid ${theme.colors.borderDefault}` : '0')};
  background: ${({ $tone, theme }) =>
    $tone === 'complete' ? theme.colors.bgInset : $tone === 'current' ? theme.colors.bgBase : theme.colors.bgInset};
  color: ${({ $tone, theme }) =>
    $tone === 'current' ? theme.colors.textPrimary : theme.colors.textSecondary};
  font-size: 12px;
  font-weight: 800;
`;

export const SummaryGrid = styled.div`
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(0, 1fr);
  gap: 18px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

export const SummaryCard = styled.section`
  display: grid;
  gap: 12px;
  padding-top: 18px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const SummaryList = styled.dl`
  margin: 0;
  display: grid;
  grid-template-columns: minmax(0, 140px) minmax(0, 1fr);
  gap: 10px 16px;
`;

export const SummaryTerm = styled.dt`
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  color: ${({ theme }) => theme.colors.textSecondary};
  text-transform: uppercase;
  letter-spacing: 0.04em;
`;

export const SummaryValue = styled.dd`
  margin: 0;
  font-size: 14px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const TimelineList = styled.ul`
  margin: 0;
  padding-left: 18px;
  display: grid;
  gap: 10px;
`;

export const TimelineItem = styled.li`
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
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

export const ActionLink = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  background: ${({ theme }) => theme.colors.textPrimary};
  color: ${({ theme }) => theme.colors.bgBase};
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
`;

export const SecondaryActionButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: fit-content;
  min-height: 38px;
  padding: 0 14px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  color: ${({ theme }) => theme.colors.textPrimary};
  font: inherit;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;

  &:hover {
    border-color: ${({ theme }) => theme.colors.textPrimary};
  }
`;
