import { CalendarCheck2, LockKeyhole, ShieldCheck } from 'lucide-react';
import type {
  ClinicalFollowUpCard,
  ClinicalFollowUpKind,
} from '../../../features/demo/biteplanerFlow';
import * as S from './ClinicalFollowUpCards.styles';

type ClinicalFollowUpCardsProps = {
  followUps: ClinicalFollowUpCard[];
  onSchedule: (kind: ClinicalFollowUpKind) => void;
  schedulingKind?: ClinicalFollowUpKind | null;
};

function formatDate(value: string | null) {
  if (!value) {
    return '';
  }

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(new Date(value));
}

function getCardStatusLabel(followUp: ClinicalFollowUpCard) {
  if (followUp.status === 'locked') {
    return 'Bloqueado';
  }

  if (followUp.status === 'scheduled') {
    return 'Agendado';
  }

  if (followUp.status === 'completed') {
    return 'Concluído';
  }

  if (followUp.status === 'overdue') {
    return 'Pendente';
  }

  return 'Disponível';
}

export function ClinicalFollowUpCards({
  followUps,
  onSchedule,
  schedulingKind = null,
}: ClinicalFollowUpCardsProps) {
  if (followUps.length === 0) {
    return null;
  }

  return (
    <S.Section data-testid="clinical-follow-up-cards" aria-labelledby="clinical-follow-up-title">
      <S.Header>
        <S.HeaderIcon aria-hidden>
          <ShieldCheck size={34} />
        </S.HeaderIcon>
        <S.HeaderCopy>
          <S.Title id="clinical-follow-up-title">Acompanhamento Clínico</S.Title>
          <S.Description>
            Seus retornos são liberados automaticamente para que o dentista acompanhe a adaptação e evolução do
            tratamento.
          </S.Description>
        </S.HeaderCopy>
      </S.Header>

      <S.CardGrid>
        {followUps.map((followUp) => {
          const isLocked = followUp.status === 'locked';
          const isCompleted = followUp.status === 'completed';
          const isInactive = isLocked || isCompleted;
          const canSchedule = followUp.status === 'available' || followUp.status === 'overdue';
          const isScheduling = schedulingKind === followUp.kind;

          return (
            <S.FollowUpCard
              key={followUp.kind}
              $inactive={isInactive}
              aria-disabled={isInactive}
              data-testid={`clinical-follow-up-${followUp.kind}`}
            >
              <S.CardTopline>
                <S.CardIcon $inactive={isInactive} aria-hidden>
                  {isLocked ? <LockKeyhole size={28} /> : <CalendarCheck2 size={28} />}
                </S.CardIcon>
                <S.CardMeta>
                  <S.CardKicker>Retorno {String(followUp.sequence).padStart(2, '0')}</S.CardKicker>
                  <S.CardTitle>{followUp.title}</S.CardTitle>
                </S.CardMeta>
                <S.StatusBadge $status={followUp.status} data-testid={`clinical-follow-up-status-${followUp.kind}`}>
                  <span aria-hidden />
                  {getCardStatusLabel(followUp)}
                </S.StatusBadge>
              </S.CardTopline>

              <S.Divider />
              <S.CardText>{followUp.description}</S.CardText>

              {isLocked ? (
                <S.LockedBox>
                  <LockKeyhole size={22} aria-hidden />
                  <span>{followUp.lockedReason ?? 'Aguarde a liberação deste retorno.'}</span>
                </S.LockedBox>
              ) : (
                <S.AvailableBox>
                  <CalendarCheck2 size={22} aria-hidden />
                  <span>{followUp.scheduledAt ? 'Agendado para:' : 'Disponível em:'}</span>
                  <strong>{formatDate(followUp.scheduledAt ?? followUp.availableAt)}</strong>
                </S.AvailableBox>
              )}

              {canSchedule ? (
                <S.ScheduleButton
                  type="button"
                  disabled={isScheduling}
                  onClick={() => {
                    onSchedule(followUp.kind);
                  }}
                >
                  <span>{isScheduling ? 'Agendando...' : 'Agendar retorno'}</span>
                </S.ScheduleButton>
              ) : null}
            </S.FollowUpCard>
          );
        })}
      </S.CardGrid>

      <S.Timeline aria-label="Etapas do acompanhamento clínico">
        {followUps.map((followUp) => (
          <S.TimelineStep key={followUp.kind} $active={followUp.status !== 'locked'}>
            <S.TimelineMarker>{followUp.sequence}</S.TimelineMarker>
            <S.TimelineCopy>
              <strong>Retorno {String(followUp.sequence).padStart(2, '0')}</strong>
              <span>{followUp.sequence === 1 ? '15 dias após a entrega' : '30 dias após o primeiro retorno'}</span>
            </S.TimelineCopy>
          </S.TimelineStep>
        ))}
      </S.Timeline>

      <S.Callout>
        <ShieldCheck size={20} aria-hidden />
        <span>Os retornos são importantes para garantir o sucesso do seu tratamento. <strong>Não deixe de agendar!</strong></span>
      </S.Callout>
    </S.Section>
  );
}
