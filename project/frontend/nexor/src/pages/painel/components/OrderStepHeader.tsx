import type { ReactNode } from 'react';
import { CalendarDays, ClipboardList, Clock3, Flag, ListChecks } from 'lucide-react';
import * as S from './OrderStepHeader.styles';
import {
  getOrderStatusPresentation,
  getStageLabel,
  type DemoOrderSummary,
} from '../../../features/demo/biteplanerFlow';





















const STEP_ITEMS = [
  { key: 'prerequisite', label: 'Pre-requisito' },
  { key: 'consultation', label: 'Consulta inicial' },
  { key: 'clinical_decision', label: 'Decisão clínica' },
  { key: 'purchase', label: 'Compra' },
  { key: 'laboratory', label: 'Laboratório' },
  { key: 'follow_up', label: 'Acompanhamento' },
] as const;

export type OrderStepKey = (typeof STEP_ITEMS)[number]['key'];

export interface OrderStepHeaderProps {
  title: ReactNode;
  description: ReactNode;
  currentStep: OrderStepKey;
  order: DemoOrderSummary | null;
  orderHelpText: ReactNode;
  children?: ReactNode;
}

function formatOrderUpdate(value: string) {
  const date = new Date(value);

  return {
    date: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date),
    time: new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(date),
  };
}

export function OrderStepHeader({ title, description, currentStep, order, orderHelpText, children }: OrderStepHeaderProps) {
  const orderUpdate = order ? formatOrderUpdate(order.created_at) : null;
  const status = order ? getOrderStatusPresentation(order) : null;

  return (
    <S.Header>
      <S.Breadcrumb aria-label="Etapas da jornada Biteplaner">
        <S.OverviewLink to="/painel/biteplaner/jornada">
          <ListChecks size={15} strokeWidth={2.2} aria-hidden="true" />
          Visão geral dos steps
        </S.OverviewLink>
        <S.StepList>
          {STEP_ITEMS.map((step) => {
            const active = step.key === currentStep;

            return (
              <li key={step.key}>
                <S.StepCrumb
                  $active={active}
                  aria-current={active ? 'step' : undefined}
                  data-testid={active ? 'step-breadcrumb-current' : undefined}
                >
                  {step.label}
                </S.StepCrumb>
              </li>
            );
          })}
        </S.StepList>
      </S.Breadcrumb>

      <S.Copy>
        <S.Title>{title}</S.Title>
        <S.Description>{description}</S.Description>
      </S.Copy>

      {children}

      {order && orderUpdate && status ? (
        <S.OrderBanner data-testid="athlete-order-card">
          <S.OrderSummary>
            <S.OrderIcon aria-hidden="true">
              <ClipboardList size={38} strokeWidth={1.8} />
              <S.OrderIconBadge>
                <Clock3 size={13} strokeWidth={2.2} />
              </S.OrderIconBadge>
            </S.OrderIcon>
            <S.OrderSummaryText>
              <S.OrderEyebrow>Pedido</S.OrderEyebrow>
              <S.OrderId>{order.id}</S.OrderId>
              <S.OrderHelpText>{orderHelpText}</S.OrderHelpText>
            </S.OrderSummaryText>
          </S.OrderSummary>

          <S.OrderMeta>
            <S.OrderMetaLabel>Status atual</S.OrderMetaLabel>
            <S.StatusPill $color={status.color} data-testid="athlete-order-status">
              {status.label}
            </S.StatusPill>
          </S.OrderMeta>

          <S.OrderMeta>
            <S.OrderMetaLabel>Última atualização</S.OrderMetaLabel>
            <S.OrderMetaValue>
              <CalendarDays size={20} strokeWidth={1.8} aria-hidden="true" />
              <span>
                {orderUpdate.date}
                <br />
                as {orderUpdate.time}
              </span>
            </S.OrderMetaValue>
          </S.OrderMeta>

          <S.OrderMeta>
            <S.OrderMetaLabel>Etapa atual</S.OrderMetaLabel>
            <S.OrderMetaValue>
              <Flag size={20} strokeWidth={1.8} aria-hidden="true" />
              <span>{getStageLabel(order)}</span>
            </S.OrderMetaValue>
          </S.OrderMeta>
        </S.OrderBanner>
      ) : null}
    </S.Header>
  );
}
