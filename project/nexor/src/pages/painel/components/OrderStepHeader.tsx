import type { ReactNode } from 'react';
import { ClipboardList, Clock3 } from 'lucide-react';
import * as S from './OrderStepHeader.styles';
import {
  getOrderDisplayId,
  type DemoOrderSummary,
} from '../../../features/demo/biteplanerFlow';
import { getOrderStatusPresentation } from '../../../features/biteplaner/orders/orderPresenter';

export type OrderStepKey = 'prerequisite' | 'consultation' | 'clinical_decision' | 'purchase' | 'laboratory' | 'follow_up';

export interface OrderStepHeaderProps {
  title: ReactNode;
  description: ReactNode;
  currentStep: OrderStepKey;
  order: DemoOrderSummary | null;
  orderHelpText: ReactNode;
  showOrderSummary?: boolean;
  showOrderMetadata?: boolean;
  children?: ReactNode;
}

export interface OrderInfoCardProps {
  order: DemoOrderSummary;
  orderHelpText: ReactNode;
  testId?: string;
  showLastUpdate?: boolean;
  showMetadata?: boolean;
}

export function OrderInfoCard({
  order,
  orderHelpText,
  testId = 'athlete-order-card',
  showLastUpdate = true,
  showMetadata = true,
}: OrderInfoCardProps) {
  const orderLabel = getOrderDisplayId(order);
  const status = getOrderStatusPresentation(order);
  const updatedAt = order.created_at;
  const updatedAtDate = updatedAt
    ? new Intl.DateTimeFormat('pt-BR', { timeZone: 'America/Sao_Paulo' }).format(new Date(updatedAt))
    : null;
  const updatedAtTime = updatedAt
    ? new Intl.DateTimeFormat('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
      timeZone: 'America/Sao_Paulo'
    }).format(new Date(updatedAt))
    : null;
  const stageLabel = order.stage === 'awaiting_initial_consultation'
    ? 'Consulta inicial'
    : status.label;

  return (
    <S.OrderBanner data-testid={testId} $hideLastUpdate={!showLastUpdate} $summaryOnly={!showMetadata}>
      <S.OrderSummary aria-label="Informações do pedido">
        <S.OrderIcon aria-hidden="true">
          <ClipboardList size={30} strokeWidth={1.8} />
          <S.OrderIconBadge>
            <Clock3 size={10} strokeWidth={2.2} />
          </S.OrderIconBadge>
        </S.OrderIcon>
        <S.OrderSummaryText>
          <S.OrderEyebrow>PEDIDO</S.OrderEyebrow>
          <S.OrderId>{orderLabel}</S.OrderId>
          <S.OrderHelpText>{orderHelpText}</S.OrderHelpText>
        </S.OrderSummaryText>
      </S.OrderSummary>
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
  showOrderMetadata = true,
  children
}: OrderStepHeaderProps) {
  return (
    <S.Header>
      <S.Copy>
        <S.Title>{title}</S.Title>
        <S.Description>{description}</S.Description>
      </S.Copy>

      {children}

      {showOrderSummary && order ? (
        <OrderInfoCard order={order} orderHelpText={orderHelpText} showMetadata={showOrderMetadata} />
      ) : null}
    </S.Header>
  );
}
