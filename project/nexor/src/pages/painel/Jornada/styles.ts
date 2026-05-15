import styled from 'styled-components';
import { Link } from 'react-router-dom';

export type StepTone = 'complete' | 'current' | 'upcoming';

const stepCardStyles = `
  display: grid;
  gap: 10px;
  height: 100%;
  padding: 16px;
  border-radius: 14px;
  border-width: 1px;
  border-style: solid;
  text-decoration: none;
`;

export const Page = styled.div`
  display: grid;
  gap: 24px;
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
  gap: 18px;
  padding: 22px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
`;

export const SectionHeader = styled.div`
  display: grid;
  gap: 6px;
`;

export const SectionTitle = styled.h2`
  margin: 0;
  font-size: 18px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StepList = styled.ol`
  list-style: none;
  margin: 0;
  padding: 0;
  display: grid;
  grid-template-columns: repeat(6, minmax(0, 1fr));
  gap: 12px;
  min-width: 1040px;
`;

export const StepScroll = styled.div`
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 6px;
`;

export const StepFormsSection = styled.div`
  display: grid;
  gap: 14px;
`;

export const StepFormsHeader = styled.div`
  display: grid;
  gap: 4px;
  padding-top: 4px;
  border-top: 1px solid ${({ theme }) => theme.colors.borderDefault};
`;

export const StepFormsGrid = styled.div`
  display: grid;
  gap: 14px;
`;

export const StepFormsGroup = styled.div`
  display: grid;
  gap: 12px;
  padding: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  border-radius: 12px;
  background: ${({ theme }) => theme.colors.bgBase};
`;

export const StepItem = styled.li<{ $tone: StepTone }>`
  position: relative;
  &:not(:last-child)::after {
    content: '';
    position: absolute;
    top: 28px;
    left: calc(100% + 6px);
    width: 12px;
    height: 2px;
    background: ${({ $tone, theme }) =>
      $tone === 'upcoming' ? theme.colors.borderDefault : theme.colors.textPrimary};
  }
`;

export const StepLink = styled(Link)<{ $tone: StepTone }>`
  ${stepCardStyles}
  border-color: ${({ $tone, theme }) =>
    $tone === 'complete'
      ? '#bbf7d0'
      : $tone === 'current'
        ? theme.colors.textPrimary
        : theme.colors.borderDefault};
  background: ${({ $tone, theme }) =>
    $tone === 'complete' ? '#f0fdf4' : $tone === 'current' ? theme.colors.bgBase : theme.colors.bgElevated};
  color: inherit;

  &:hover {
    border-color: ${({ $tone, theme }) => ($tone === 'complete' ? '#86efac' : theme.colors.textPrimary)};
  }
`;

export const StepPanel = styled.div<{ $tone: StepTone }>`
  ${stepCardStyles}
  border-color: ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
  opacity: ${({ $tone }) => ($tone === 'upcoming' ? 0.48 : 1)};
`;

export const StepBadge = styled.span<{ $tone: StepTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 38px;
  height: 38px;
  border-radius: 12px;
  background: ${({ $tone, theme }) =>
    $tone === 'complete' ? '#15803d' : $tone === 'current' ? theme.colors.textPrimary : theme.colors.bgElevated};
  color: ${({ $tone, theme }) =>
    $tone === 'complete' || $tone === 'current' ? theme.colors.bgBase : theme.colors.textPrimary};
  font-size: 14px;
  font-weight: 800;
  letter-spacing: 0;
`;

export const StepName = styled.h3`
  margin: 0;
  font-size: 15px;
  font-weight: 800;
  color: ${({ theme }) => theme.colors.textPrimary};
`;

export const StepCopy = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const StepStatus = styled.span<{ $tone: StepTone }>`
  width: fit-content;
  padding: 4px 8px;
  border-radius: 6px;
  background: ${({ $tone, theme }) =>
    $tone === 'complete' ? '#dcfce7' : $tone === 'current' ? theme.colors.bgElevated : theme.colors.bgInset};
  color: ${({ $tone, theme }) =>
    $tone === 'complete' ? '#166534' : $tone === 'current' ? theme.colors.textPrimary : theme.colors.textSecondary};
  font-size: 11px;
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
  padding: 22px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.bgElevated};
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
