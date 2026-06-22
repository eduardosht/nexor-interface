import styled from 'styled-components';

const noticeTone = {
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

export type JourneyNoticeTone = keyof typeof noticeTone;

export const Card = styled.section<{ $tone?: JourneyNoticeTone; $background?: string }>`
  display: grid;
  grid-template-columns: auto minmax(0, 1fr);
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  border-radius: 10px;
  border: 1px solid ${({ $tone = 'info' }) => noticeTone[$tone].border};
  background: ${({ $background, $tone = 'info' }) => $background ?? noticeTone[$tone].bg};
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.86);
  color: ${({ theme }) => theme.colors.textSecondary};

  @media (max-width: 560px) {
    align-items: start;
  }
`;

export const Icon = styled.span<{ $tone?: JourneyNoticeTone }>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  border-radius: 999px;
  background: ${({ $tone = 'info' }) => noticeTone[$tone].iconBg};
  color: ${({ $tone = 'info' }) => noticeTone[$tone].iconColor};

  svg {
    width: 18px;
    height: 18px;
  }
`;

export const Content = styled.div`
  display: grid;
  gap: 3px;
  min-width: 0;
`;

export const Title = styled.h2<{ $tone?: JourneyNoticeTone }>`
  margin: 0;
  color: ${({ $tone = 'info' }) => noticeTone[$tone].title};
  font-size: 14px;
  font-weight: 750;
  line-height: 1.25;
`;

export const Description = styled.p`
  margin: 0;
  font-size: 13px;
  line-height: 1.5;
  color: ${({ theme }) => theme.colors.textSecondary};
`;

export const Action = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 6px;
`;
