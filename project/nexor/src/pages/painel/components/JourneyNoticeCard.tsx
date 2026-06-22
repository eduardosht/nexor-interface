import type { ReactNode } from 'react';
import * as S from './JourneyNoticeCard.styles';
import type { JourneyNoticeTone } from './JourneyNoticeCard.styles';

type JourneyNoticeCardProps = {
  icon: ReactNode;
  title: string;
  description: ReactNode;
  action?: ReactNode;
  tone?: JourneyNoticeTone;
  background?: string;
  testId?: string;
  ariaLabel?: string;
};

export function JourneyNoticeCard({
  icon,
  title,
  description,
  action,
  tone = 'info',
  background,
  testId,
  ariaLabel,
}: JourneyNoticeCardProps) {
  return (
    <S.Card
      role="status"
      aria-label={ariaLabel}
      data-testid={testId}
      $tone={tone}
      $background={background}
    >
      <S.Icon $tone={tone} aria-hidden>
        {icon}
      </S.Icon>
      <S.Content>
        <S.Title $tone={tone}>{title}</S.Title>
        <S.Description>{description}</S.Description>
        {action ? <S.Action>{action}</S.Action> : null}
      </S.Content>
    </S.Card>
  );
}
