import { AdminFormButton } from '@nexor/design-system';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchBiteplanerDentistOrder } from '../../../features/commerce/biteplanerDentistOrders.api';
import type { BiteplanerDentistOrderDetail as OrderDetail } from '../../../features/commerce/biteplanerDentistOrders.types';
import { formatBiteplanerSportCategory } from '../../../features/commerce/biteplanerSportCategory.presenter';
import { getCommerceBackendOrderStatusLabel } from '../../../features/commerce/commerceOrderStatus.presenter';
import { useAuth } from '../../../hooks/useAuth';
import { ApiError } from '../../../lib/api';
import * as S from './styles';

const SHIPMENT_STATUS_LABELS: Record<OrderDetail['shipments'][number]['status'], string> = {
  pending: 'Pendente',
  preparing: 'Preparando',
  shipped: 'Enviado',
  delivered: 'Entregue',
  returned: 'Devolvido',
};

function formatDate(value: string | null) {
  if (!value) return 'Não informado';

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(date);
}

function formatCents(value: number | null | undefined, currency: string) {
  if (typeof value !== 'number' || !Number.isFinite(value)) return 'valor não informado';

  try {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency }).format(value / 100).replace(/\s/g, ' ');
  } catch {
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value / 100).replace(/\s/g, ' ');
  }
}

function statusLabel(status: string) {
  return getCommerceBackendOrderStatusLabel(status);
}

function getStatusTone(status: string) {
  if (['paid', 'ready_for_production', 'delivered', 'completed'].includes(status)) return 'success';
  if (['payment_failed', 'cancelled', 'refunded'].includes(status)) return 'danger';
  if (['awaiting_payment', 'awaiting_order_completion', 'technical_review', 'correction_requested', 'in_production', 'shipped'].includes(status)) return 'warning';
  return 'neutral';
}

function getPaymentStatusTone(status: string) {
  if (['paid', 'received', 'confirmed'].includes(status.toLowerCase())) return 'success';
  if (['failed', 'cancelled', 'refunded', 'expired'].includes(status.toLowerCase())) return 'danger';
  if (['pending', 'unpaid'].includes(status.toLowerCase())) return 'warning';
  return 'neutral';
}

function shipmentStatusLabel(status: OrderDetail['shipments'][number]['status']) {
  return SHIPMENT_STATUS_LABELS[status] ?? status;
}

function joinParts(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(' · ');
}

function formatChargeDescription(charge: OrderDetail['charges'][number], currency: string) {
  const parts = [
    statusLabel(charge.status),
    charge.method?.toUpperCase(),
    formatCents(charge.amountCents, currency),
  ];

  if (charge.paidAt) {
    parts.push(`pago em ${formatDate(charge.paidAt)}`);
  }

  return joinParts(parts);
}

function formatItemDescription(item: OrderDetail['items'][number], currency: string, sportCategory?: string | null) {
  return joinParts([
    `${item.quantity} unidade(s)`,
    sportCategory ? `esporte: ${formatBiteplanerSportCategory(sportCategory)}` : item.model || 'tipo não informado',
    item.color || 'cor não informada',
    item.productVersionId ? `versão: ${item.productVersionId}` : null,
    `valor unitário: ${formatCents(item.unitPriceCents, currency)}`,
  ]);
}

function formatShipmentDescription(shipment: OrderDetail['shipments'][number]) {
  const parts = [
    shipment.carrier,
    shipment.trackingCode,
    shipment.shippedAt ? `enviado em ${formatDate(shipment.shippedAt)}` : null,
    shipment.deliveredAt ? `entregue em ${formatDate(shipment.deliveredAt)}` : null,
  ];

  return joinParts(parts) || 'Dados de envio não informados';
}

export function BiteplanerOrderDetail() {
  const { orderId = '' } = useParams();
  const { session } = useAuth();
  const token = session?.access_token;
  const [order, setOrder] = useState<OrderDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const requestSequence = useRef(0);

  const loadOrder = useCallback(async () => {
    const requestId = ++requestSequence.current;

    if (!token || !orderId) {
      setOrder(null);
      setLoading(false);
      setError('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetchBiteplanerDentistOrder(orderId, token);
      if (requestSequence.current === requestId) {
        setOrder(response.order);
      }
    } catch (error) {
      if (requestSequence.current !== requestId) return;

      if (error instanceof ApiError && error.status === 404) {
        setError('');
        setOrder(null);
        return;
      }

      setError('Não foi possível carregar esta ordem Biteplaner.');
      setOrder(null);
    } finally {
      if (requestSequence.current === requestId) {
        setLoading(false);
      }
    }
  }, [orderId, token]);

  useEffect(() => {
    void loadOrder();
    return () => {
      requestSequence.current += 1;
    };
  }, [loadOrder]);

  if (loading) {
    return <S.EmptyState>Carregando detalhe da ordem...</S.EmptyState>;
  }

  if (error) {
    return (
      <S.EmptyState role="alert">
        <strong>{error}</strong>
        <AdminFormButton type="button" variant="secondary" onClick={() => void loadOrder()}>
          Tentar novamente
        </AdminFormButton>
      </S.EmptyState>
    );
  }

  if (!order) {
    return <S.EmptyState>Nenhuma ordem encontrada.</S.EmptyState>;
  }

  const primaryItem = order.items[0] ?? null;
  const canCompleteOrder = order.status === 'awaiting_order_completion';
  const canReviewCompletion = order.status === 'correction_requested';

  return (
    <S.DetailPage>
      <S.BackBar to="/painel/biteplaner/ordens">
        <ArrowLeft size={18} aria-hidden />
        Voltar para ordens
      </S.BackBar>

      <S.DetailHeader>
        <S.DetailTitle>Detalhe da ordem</S.DetailTitle>
        <S.DetailSubtitle>Pedido {order.id}</S.DetailSubtitle>
        <S.DetailHeaderActions>
          <AdminFormButton type="button" variant="secondary" onClick={() => void loadOrder()} disabled={loading}>
            <RefreshCw size={16} aria-hidden />
            Atualizar status
          </AdminFormButton>
          {canCompleteOrder || canReviewCompletion ? (
            <S.DetailActionLink as={Link} to={`/painel/biteplaner/ordens/${order.id}/complemento`}>
              {canReviewCompletion ? 'Revisar complemento' : 'Completar ordem'}
            </S.DetailActionLink>
          ) : null}
        </S.DetailHeaderActions>
      </S.DetailHeader>

      <S.DetailDashboardGrid>
        <S.DetailCard>
          <S.CardTitle>Resumo</S.CardTitle>
          <S.SummaryTopGrid>
            <S.SummaryMetric>
              <S.FieldLabel>Status</S.FieldLabel>
              <S.StatusInline $tone={getStatusTone(order.status)}>
                <span aria-hidden />
                {statusLabel(order.status)}
              </S.StatusInline>
            </S.SummaryMetric>
            <S.SummaryMetric>
              <S.FieldLabel>Status do pagamento</S.FieldLabel>
              <S.StatusInline $tone={getPaymentStatusTone(order.paymentStatus)}>
                <span aria-hidden />
                {statusLabel(order.paymentStatus)}
              </S.StatusInline>
            </S.SummaryMetric>
            <S.SummaryMetric>
              <S.FieldLabel>Total</S.FieldLabel>
              <S.TotalValue>{order.totalFormatted}</S.TotalValue>
            </S.SummaryMetric>
          </S.SummaryTopGrid>
          <S.MetaList>
            <div><dt>Data do pedido</dt><dd>{formatDate(order.createdAt)}</dd></div>
            <div><dt>Atualizado em</dt><dd>{formatDate(order.updatedAt)}</dd></div>
            <div><dt>Confirmado em</dt><dd>{formatDate(order.lockedAt)}</dd></div>
          </S.MetaList>
        </S.DetailCard>

        <S.DetailCard>
          <S.CardTitle>Produtos</S.CardTitle>
          {order.items.length === 0 ? (
            <S.EmptyDetailText>Nenhum item registrado.</S.EmptyDetailText>
          ) : (
            <S.ProductStack>
              {order.items.map((item) => (
                <S.ProductItem key={item.id}>
                  <S.ProductName>{item.name}</S.ProductName>
                  <S.ProductDescription>{formatItemDescription(item, order.currency, order.sportCategory)}</S.ProductDescription>
                </S.ProductItem>
              ))}
              <S.TotalBox>
                <span>Total</span>
                <strong>{formatCents(primaryItem?.totalCents ?? order.totalCents, order.currency)}</strong>
              </S.TotalBox>
            </S.ProductStack>
          )}
        </S.DetailCard>

        <S.DetailCard>
          <S.CardTitle>Pagamento</S.CardTitle>
          {order.charges.length === 0 ? (
            <S.EmptyDetailText>Nenhuma cobrança registrada.</S.EmptyDetailText>
          ) : (
            <S.DetailTextStack>
              {order.charges.map((charge) => (
                <div key={charge.id}>
                  <S.FieldLabel>{charge.provider}</S.FieldLabel>
                  <S.DetailParagraph>{formatChargeDescription(charge, order.currency)}</S.DetailParagraph>
                </div>
              ))}
            </S.DetailTextStack>
          )}
        </S.DetailCard>

        <S.DetailCard>
          <S.CardTitle>Produção e envio</S.CardTitle>
          {order.shipments.length === 0 ? (
            <S.EmptyDetailText>Nenhum envio registrado.</S.EmptyDetailText>
          ) : (
            <S.DetailTextStack>
              {order.shipments.map((shipment) => (
                <div key={shipment.id}>
                  <S.FieldLabel>{shipmentStatusLabel(shipment.status)}</S.FieldLabel>
                  <S.DetailParagraph>
                    {formatShipmentDescription(shipment)}
                    {shipment.trackingUrl ? (
                      <>
                        {' · '}
                        <S.InlineLink href={shipment.trackingUrl} target="_blank" rel="noreferrer">Acompanhar envio</S.InlineLink>
                      </>
                    ) : null}
                  </S.DetailParagraph>
                </div>
              ))}
            </S.DetailTextStack>
          )}
        </S.DetailCard>

        <S.DetailCard $wide>
          <S.CardTitle>Histórico de status</S.CardTitle>
          {order.statusEvents.length === 0 ? (
            <S.EmptyDetailText>Nenhum evento registrado.</S.EmptyDetailText>
          ) : (
            <S.Timeline>
              {order.statusEvents.map((event, index) => (
                <S.TimelineItem key={event.id} $active={index === order.statusEvents.length - 1}>
                  <S.TimelineDate>{formatDate(event.createdAt)}</S.TimelineDate>
                  <S.TimelineLabel>
                    {event.fromStatus ? `${statusLabel(event.fromStatus)} → ` : ''}{statusLabel(event.toStatus)}
                  </S.TimelineLabel>
                </S.TimelineItem>
              ))}
            </S.Timeline>
          )}
        </S.DetailCard>
      </S.DetailDashboardGrid>
    </S.DetailPage>
  );
}
