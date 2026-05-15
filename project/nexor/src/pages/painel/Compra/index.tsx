import { useEffect, useMemo, useState } from 'react';
import * as S from './styles';
import { Button, StatusIndicator } from '@nexor/design-system';
import { useAuth } from '../../../hooks/useAuth';
import {
  confirmPayment,
  fetchOrders,
  getAuthToken,
  getOrderStatusPresentation,
  type DemoOrderSummary,
} from '../../../features/demo/biteplanerFlow';
import { OrderStepHeader } from '../components/OrderStepHeader';

const NEXT_STEPS = [
  'Confirmação do pagamento mock',
  'Liberação para o dentista preencher a ordem de produção',
  'Encaminhamento controlado ao laboratório',
  'Retorno de adaptação e acompanhamento',
];

export function Compra() {
  const { session } = useAuth();
  const token = getAuthToken(session);
  const [order, setOrder] = useState<DemoOrderSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function loadOrder() {
      try {
        const response = await fetchOrders('user', token);
        const nextOrder =
          response.orders.find((item) => item.status === 'awaiting_payment') ??
          response.orders.find((item) => item.status === 'payment_confirmed') ??
          null;

        if (active) {
          setOrder(nextOrder);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar o pedido de compra da demo.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadOrder();

    return () => {
      active = false;
    };
  }, [token]);

  const ctaDisabled = useMemo(
    () => submitting || !order || order.status !== 'awaiting_payment',
    [order, submitting]
  );

  async function handleConfirmPurchase() {
    if (!order || !token || order.status !== 'awaiting_payment') {
      return;
    }

    setSubmitting(true);
    setNotice('');
    setError('');

    try {
      const response = await confirmPayment(order.id, token);
      setOrder(response.order);
      setNotice(`${response.order.id} agora está com pagamento confirmado e pronto para o laboratório.`);
    } catch {
      setError('Não foi possível confirmar a compra mock agora.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <S.Page>
      <OrderStepHeader
        title="Confirmação de compra da demo"
        description="Está tela simula o momento em que um caso clinicamente aprovado avança para pagamento e liberação operacional."
        currentStep="purchase"
        order={order}
        orderHelpText="Este pedido está na etapa financeira da demo antes da liberação operacional para produção."
      />

      {loading ? <S.Banner>Carregando etapa de compra...</S.Banner> : null}
      {error ? <S.Banner role="alert">{error}</S.Banner> : null}
      {notice ? <S.Banner role="status">{notice}</S.Banner> : null}

      {!order ? (
        <S.Banner>Nenhum pedido aguardando pagamento apareceu neste momento. Use o caso já aprovado como referência visual.</S.Banner>
      ) : null}

      <S.Layout>
        <S.Card>
          <S.CardTitle>Biteplaner personalizado</S.CardTitle>
          <S.Description>
            O pedido inclui avaliação odontológica, moldagem individual, etapa laboratorial e acompanhamento posterior.
          </S.Description>
          <S.List>
            <S.ListItem>Consulta inicial e decisão clínica do dentista parceiro.</S.ListItem>
            <S.ListItem>Preenchimento da ordem de produção com dados mockados.</S.ListItem>
            <S.ListItem>Envio controlado ao laboratório e retorno por ajuste quando necessário.</S.ListItem>
          </S.List>

          <S.CardTitle>Proximos passos observaveis</S.CardTitle>
          <S.List>
            {NEXT_STEPS.map((step) => (
              <S.ListItem key={step}>{step}</S.ListItem>
            ))}
          </S.List>
        </S.Card>

        <S.Card>
          <S.CardTitle>Resumo do pedido</S.CardTitle>
          <S.SummaryRow>
            <span>Biteplaner</span>
            <strong>R$ 400,00</strong>
          </S.SummaryRow>
          <S.SummaryRow>
            <span>Situação da demo</span>
            {order ? (
              <StatusIndicator
                color={getOrderStatusPresentation(order).color}
                label={getOrderStatusPresentation(order).label}
              />
            ) : (
              <span>Aguardando caso elegível</span>
            )}
          </S.SummaryRow>
          <S.SummaryRow>
            <span>Total</span>
            <S.Total>R$ 400,00</S.Total>
          </S.SummaryRow>

          <Button onClick={handleConfirmPurchase} disabled={ctaDisabled}>
            {submitting ? 'Confirmando...' : 'Confirmar compra mock'}
          </Button>
        </S.Card>
      </S.Layout>
    </S.Page>
  );
}
