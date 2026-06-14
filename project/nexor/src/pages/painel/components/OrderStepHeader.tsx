import type { ReactNode } from 'react';
import { CalendarDays, ClipboardList, Clock3, Flag } from 'lucide-react';
import * as S from './OrderStepHeader.styles';
import {
  getOrderStatusPresentation,
  getOrderDisplayId,
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

export interface OrderInfoCardProps {
  order: DemoOrderSummary;
  orderHelpText: ReactNode;
  testId?: string;
  showLastUpdate?: boolean;
}

function formatOrderUpdate(value?: string) {
  const date = value ? new Date(value) : new Date();
  const safeDate = Number.isNaN(date.getTime()) ? new Date() : date;

  return {
    date: new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short' }).format(safeDate),
    time: new Intl.DateTimeFormat('pt-BR', { timeStyle: 'short' }).format(safeDate),
  };
}

export function OrderInfoCard({
  order,
  orderHelpText,
  testId = 'athlete-order-card',
  showLastUpdate = true,
}: OrderInfoCardProps) {
  const orderUpdate = formatOrderUpdate(order.created_at);
  const status = getOrderStatusPresentation(order);
  const orderLabel = getOrderDisplayId(order);

  return (
    <S.OrderBanner data-testid={testId} $hideLastUpdate={!showLastUpdate}>
      <S.OrderSummary aria-label="Informações do pedido">
        <S.OrderIcon aria-hidden="true">
          <ClipboardList size={38} strokeWidth={1.8} />
          <S.OrderIconBadge>
            <Clock3 size={15} strokeWidth={2.2} />
          </S.OrderIconBadge>
        </S.OrderIcon>
        <S.OrderSummaryText>
          <S.OrderEyebrow>PEDIDO</S.OrderEyebrow>
          <S.OrderId>{orderLabel}</S.OrderId>
          <S.OrderHelpText>{orderHelpText}</S.OrderHelpText>
        </S.OrderSummaryText>
      </S.OrderSummary>

      <S.OrderMeta aria-label="Status atual do pedido">
        <S.OrderMetaLabel>STATUS ATUAL</S.OrderMetaLabel>
        <S.StatusPill $color={status.color} data-testid="athlete-order-status">
          {status.label}
        </S.StatusPill>
      </S.OrderMeta>

      {showLastUpdate ? (
        <S.OrderMeta aria-label="Última atualização do pedido">
          <S.OrderMetaLabel>ÚLTIMA ATUALIZAÇÃO</S.OrderMetaLabel>
          <S.OrderMetaValue>
            <CalendarDays size={25} strokeWidth={1.9} aria-hidden="true" />
            <span>
              {orderUpdate.date}
              <br />
              às {orderUpdate.time}
            </span>
          </S.OrderMetaValue>
        </S.OrderMeta>
      ) : null}

      <S.OrderMeta aria-label="Etapa atual do pedido">
        <S.OrderMetaLabel>ETAPA ATUAL</S.OrderMetaLabel>
        <S.OrderMetaValue>
          <Flag size={25} strokeWidth={1.9} aria-hidden="true" />
          <span>{getStageLabel(order)}</span>
        </S.OrderMetaValue>
      </S.OrderMeta>
    </S.OrderBanner>
  );
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
  return (
    <S.Header>
      <S.Copy>
        <S.Title>{title}</S.Title>
        <S.Description>{description}</S.Description>
      </S.Copy>

      {children}

      {showOrderSummary && order ? <OrderInfoCard order={order} orderHelpText={orderHelpText} /> : null}
    </S.Header>
  );
}
