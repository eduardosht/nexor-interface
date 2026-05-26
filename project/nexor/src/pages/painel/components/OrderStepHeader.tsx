import type { ReactNode } from 'react';
import { CalendarDays, ClipboardList, Clock3, Flag } from 'lucide-react';
import * as S from './OrderStepHeader.styles';
import {
  getOrderStatusPresentation,
  getStageLabel,
  type DemoOrderSummary,
} from '../../../features/demo/biteplanerFlow';





















export type OrderStepKey = 'prerequisite' | 'consultation' | 'clinical_decision' | 'purchase' | 'laboratory' | 'follow_up';

export interface OrderStepHeaderProps {
  title: ReactNode;
  description: ReactNode;
  currentStep: OrderStepKey;
  order: DemoOrderSummary | null;
  orderHelpText: ReactNode;
  showOrderSummary?: boolean;
  children?: ReactNode;
}

function formatOrderUpdate(value: string) {
  const date = new Date(value);

  return {
    date: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(date),
    time: new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(date),
  };
}

export function OrderStepHeader({
  title,
  description,
  currentStep: _currentStep,
  order,
  orderHelpText,
  showOrderSummary = true,
  children
}: OrderStepHeaderProps) {
  const orderUpdate = order ? formatOrderUpdate(order.created_at) : null;
  const status = order ? getOrderStatusPresentation(order) : null;

  return (
    <S.Header>
      <S.Copy>
        <S.Title>{title}</S.Title>
        <S.Description>{description}</S.Description>
      </S.Copy>

      {children}

      {showOrderSummary && order && orderUpdate && status ? (
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
