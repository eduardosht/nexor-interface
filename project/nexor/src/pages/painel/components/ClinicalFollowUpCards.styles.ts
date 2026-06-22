import styled from 'styled-components';
import type { ClinicalFollowUpStatus } from '../../../features/demo/biteplanerFlow';
import {
  biteplanerButtonHoverStyles,
  biteplanerButtonSurfaceStyles,
} from '../styles/biteplanerFormButton';

const statusTone: Record<ClinicalFollowUpStatus, { bg: string; color: string; dot: string }> = {
  available: { bg: 'rgba(21, 128, 61, 0.12)', color: '#047857', dot: '#22c55e' },
  overdue: { bg: 'rgba(245, 158, 11, 0.14)', color: '#92400e', dot: '#f59e0b' },
  scheduled: { bg: 'rgba(37, 99, 235, 0.1)', color: '#2563eb', dot: '#3b82f6' },
  completed: { bg: 'rgba(21, 128, 61, 0.14)', color: '#047857', dot: '#15803d' },
  locked: { bg: 'rgba(107, 114, 128, 0.1)', color: '#4b5563', dot: '#6b7280' },
};

export const Section = styled.section`
  display: grid;
  gap: 18px;
  width: 100%;
  padding: 26px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.colors.borderDefault};
  background: ${({ theme }) => theme.colors.surface};
  box-shadow: 0 16px 34px rgba(15, 23, 42, 0.08);

  @media (max-width: 560px) {
    gap: 14px;
    padding: 18px 14px;
  }
`;

export const Header = styled.header`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 18px;
  align-items: center;

  @media (max-width: 560px) {
    grid-template-columns: 44px minmax(0, 1fr);
    gap: 12px;
  }
`;

export const HeaderIcon = styled.span`
  display: inline-grid;
  place-items: center;
  width: 72px;
  height: 72px;
  border-radius: 999px;
  background: rgba(21, 128, 61, 0.08);
  color: ${({ theme }) => theme.colors.green};

  @media (max-width: 560px) {
    width: 44px;
    height: 44px;

    svg {
      width: 24px;
      height: 24px;
    }
  }
`;

export const HeaderCopy = styled.div`
  display: grid;
  gap: 4px;
  min-width: 0;
`;

export const Title = styled.h2`
  margin: 0;
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 24px;
  font-weight: 850;
  line-height: 1.2;

  @media (max-width: 560px) {
    font-size: 18px;
  }
`;

export const Description = styled.p`
  margin: 0;
  max-width: 620px;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.55;

  @media (max-width: 560px) {
    font-size: 12px;
    line-height: 1.45;
  }
`;

export const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;

  @media (max-width: 780px) {
    grid-template-columns: 1fr;
  }
`;

export const FollowUpCard = styled.article<{ $inactive?: boolean }>`
  display: grid;
  gap: 16px;
  min-width: 0;
  padding: 22px;
  border-radius: 8px;
  border: 1px solid ${({ $inactive }) => ($inactive ? 'rgba(148, 163, 184, 0.34)' : 'rgba(21, 128, 61, 0.18)')};
  background: ${({ $inactive, theme }) => ($inactive ? theme.colors.bgElevated : theme.colors.surface)};
  box-shadow: ${({ $inactive }) => ($inactive ? 'none' : '0 10px 22px rgba(15, 23, 42, 0.08)')};
  opacity: ${({ $inactive }) => ($inactive ? 0.68 : 1)};

  @media (max-width: 560px) {
    padding: 16px;
  }
`;

export const CardTopline = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr) auto;
  align-items: center;
  gap: 16px;

  @media (max-width: 560px) {
    grid-template-columns: 44px minmax(0, 1fr);

    > span:last-child {
      grid-column: 2;
      justify-self: start;
    }
  }
`;

export const CardIcon = styled.span<{ $inactive?: boolean }>`
  display: inline-grid;
  place-items: center;
  width: 58px;
  height: 58px;
  border-radius: 999px;
  background: ${({ $inactive }) => ($inactive ? 'rgba(107, 114, 128, 0.1)' : 'rgba(21, 128, 61, 0.1)')};
  color: ${({ $inactive, theme }) => ($inactive ? theme.colors.textSecondary : theme.colors.green)};

  @media (max-width: 560px) {
    width: 44px;
    height: 44px;
  }
`;

export const CardMeta = styled.div`
  display: grid;
  gap: 6px;
  min-width: 0;
`;

export const CardKicker = styled.span`
  color: ${({ theme }) => theme.colors.green};
  font-size: 12px;
  font-weight: 850;
  line-height: 1.2;
  text-transform: uppercase;
`;

export const CardTitle = styled.strong`
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 20px;
  font-weight: 850;
  line-height: 1.25;

  @media (max-width: 560px) {
    font-size: 17px;
  }
`;

export const StatusBadge = styled.span<{ $status: ClinicalFollowUpStatus }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 34px;
  padding: 0 14px;
  border-radius: 999px;
  background: ${({ $status }) => statusTone[$status].bg};
  color: ${({ $status }) => statusTone[$status].color};
  font-size: 12px;
  font-weight: 850;
  line-height: 1;
  text-transform: uppercase;
  white-space: nowrap;

  span {
    width: 8px;
    height: 8px;
    border-radius: 999px;
    background: ${({ $status }) => statusTone[$status].dot};
  }
`;

export const Divider = styled.hr`
  width: 100%;
  height: 1px;
  margin: 0;
  border: 0;
  background: ${({ theme }) => theme.colors.borderDefault};
`;

export const CardText = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.55;
`;

export const AvailableBox = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 2px 12px;
  align-items: center;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid rgba(21, 128, 61, 0.16);
  background: rgba(240, 253, 244, 0.62);
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;

  svg {
    grid-row: span 2;
    color: ${({ theme }) => theme.colors.green};
  }

  strong {
    color: ${({ theme }) => theme.colors.textPrimary};
    font-size: 15px;
  }
`;

export const LockedBox = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  gap: 12px;
  align-items: center;
  padding: 14px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.34);
  background: rgba(248, 250, 252, 0.9);
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 13px;
  line-height: 1.45;
`;

export const ScheduleButton = styled.button`
  ${biteplanerButtonSurfaceStyles}
  ${biteplanerButtonHoverStyles}
  width: 100%;
  min-height: 46px;
  border: 0;
  cursor: pointer;

  &:disabled {
    cursor: progress;
    opacity: 0.72;
  }
`;

export const Timeline = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  align-items: center;
  padding: 14px 16px;
  border-radius: 8px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: ${({ theme }) => theme.colors.bgElevated};

  @media (max-width: 560px) {
    grid-template-columns: 1fr;
  }
`;

export const TimelineStep = styled.div<{ $active?: boolean }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  min-width: 0;
  color: ${({ $active, theme }) => ($active ? theme.colors.textPrimary : theme.colors.textSecondary)};
`;

export const TimelineMarker = styled.span`
  display: inline-grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.38);
  background: ${({ theme }) => theme.colors.surface};
  color: ${({ theme }) => theme.colors.textPrimary};
  font-size: 15px;
  font-weight: 850;
`;

export const TimelineCopy = styled.span`
  display: grid;
  gap: 2px;
  min-width: 0;
  font-size: 13px;
  line-height: 1.35;

  strong,
  span {
    overflow-wrap: anywhere;
  }

  span {
    color: ${({ theme }) => theme.colors.textSecondary};
  }
`;

export const Callout = styled.div`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 10px;
  padding: 14px 16px;
  border-radius: 8px;
  background: rgba(240, 253, 244, 0.72);
  color: ${({ theme }) => theme.colors.textSecondary};
  font-size: 14px;
  line-height: 1.45;

  svg,
  strong {
    color: ${({ theme }) => theme.colors.green};
  }
`;
