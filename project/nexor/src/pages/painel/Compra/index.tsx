import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  CheckCircle2,
  Clock3,
  Hourglass,
  Info,
  LockKeyhole,
  PartyPopper,
  ShieldCheck,
} from 'lucide-react';
import * as S from './styles';
import { SkeletonCard, SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  createCheckoutSession,
  fetchOrders,
  getAuthToken,
  reconcileCheckoutSession,
  type DemoOrderSummary,
} from '../../../features/demo/biteplanerFlow';
import { OrderInfoCard, OrderStepHeader } from '../components/OrderStepHeader';

const NEXT_STEPS = [
  {
    title: 'Aguardando pagamento pelo cliente',
    status: 'Aguardando',
    Icon: Hourglass,
  },
  {
    title: 'Pedido será feito para a produção',
    status: 'Pendente',
    Icon: Clock3,
  },
  {
    title: 'Dentista licenciado receberá o pedido e agendará a consulta de retorno e adaptação.',
    status: 'Pendente',
    Icon: Clock3,
  },
];

function getPurchaseSteps(checkoutSuccess: boolean) {
  if (!checkoutSuccess) {
    return NEXT_STEPS.map((step, index) => ({
      ...step,
      state: index === 0 ? ('active' as const) : ('pending' as const),
    }));
  }

  return NEXT_STEPS.map((step, index) => {
    if (index === 0) {
      return {
        ...step,
        title: 'Pagamento confirmado',
        status: 'Confirmado',
        Icon: CheckCircle2,
        state: 'confirmed' as const,
      };
    }

    if (index === 1) {
      return {
        ...step,
        status: 'Aguardando',
        Icon: Hourglass,
        state: 'active' as const,
      };
    }

    return {
      ...step,
      state: 'pending' as const,
    };
  });
}

type CompraProps = {
  embedded?: boolean;
  initialOrder?: DemoOrderSummary | null;
  onOrderChange?: (order: DemoOrderSummary) => void;
};

export function Compra({ embedded = false, initialOrder = null }: CompraProps) {
  const { session } = useAuth();
  const [searchParams] = useSearchParams();
  const token = getAuthToken(session);
  const [order, setOrder] = useState<DemoOrderSummary | null>(initialOrder);
  const [loading, setLoading] = useState(!initialOrder);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const checkoutSuccess = searchParams.get('checkout') === 'success';
  const checkoutSessionId = searchParams.get('session_id');
  const purchaseSteps = getPurchaseSteps(checkoutSuccess);

  useEffect(() => {
    if (initialOrder) {
      setOrder(initialOrder);
      setLoading(false);
      return;
    }

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
  }, [initialOrder, token]);

  useEffect(() => {
    if (!checkoutSuccess || !checkoutSessionId || !token || !order || order.status !== 'awaiting_payment') {
      return;
    }

    let active = true;

    async function reconcilePayment() {
      try {
        const checkoutOrderId = order?.checkoutOrderId ?? order?.id;

        if (!checkoutOrderId) {
          return;
        }

        const response = await reconcileCheckoutSession(checkoutOrderId, checkoutSessionId as string, token);

        if (active) {
          setOrder(response.order);
          setNotice('Pagamento confirmado com sucesso.');
        }
      } catch {
        if (active) {
          setError('Pagamento recebido pela Stripe, mas ainda não foi possível sincronizar a ordem. Atualize a página em alguns instantes.');
        }
      }
    }

    void reconcilePayment();

    return () => {
      active = false;
    };
  }, [checkoutSessionId, checkoutSuccess, order, token]);

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
      const checkoutOrderId = order.checkoutOrderId ?? order.id;
      const response = await createCheckoutSession(checkoutOrderId, token);
      window.location.assign(response.url);
    } catch {
      setError('Não foi possível iniciar o checkout Stripe agora.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <S.Page>
      {!embedded && checkoutSuccess ? (
        <S.SuccessHeader>
          <S.SuccessHeroCopy>
            <S.SuccessTitle>Confirmação de compra da demo</S.SuccessTitle>
            <S.SuccessKicker>Caso liberado para produção</S.SuccessKicker>
            <S.SuccessDescription>
              O caso clinicamente aprovado está liberado para produção. A ordem será disponibilizada para o dentista em
              breve.
            </S.SuccessDescription>
          </S.SuccessHeroCopy>
        </S.SuccessHeader>
      ) : null}

      {!embedded && !checkoutSuccess ? (
        <OrderStepHeader
          title="Confirmação de compra da demo"
          description="Esta tela inicia o pagamento real quando um caso clinicamente aprovado avança para liberação operacional."
          currentStep="purchase"
          order={order}
          orderHelpText="Este pedido está na etapa financeira da demo antes da liberação operacional para produção."
        />
      ) : null}

      {loading ? (
        <S.Layout aria-label="Carregando etapa de compra">
          <SkeletonCard lines={5} blockHeight="42px" />
          <SkeletonGrid cards={1} minCardWidth="280px" />
        </S.Layout>
      ) : (
        <>
          {error ? <S.Banner role="alert">{error}</S.Banner> : null}
          {notice ? <S.Banner role="status">{notice}</S.Banner> : null}

          {!order ? (
            <S.Banner>Nenhum pedido aguardando pagamento apareceu neste momento. Use o caso já aprovado como referência visual.</S.Banner>
          ) : null}

          {checkoutSuccess ? (
            order ? (
              <OrderInfoCard
                order={order}
                orderHelpText="Este pedido está na etapa financeira da demo antes da liberação operacional para produção."
                testId="payment-success-order-card"
                showLastUpdate={false}
              />
            ) : null
          ) : null}

          <S.Layout>
            <S.Card>
              <S.CardTitle>Próximos passos</S.CardTitle>
              <S.StepList>
                {purchaseSteps.map((step) => (
                  <S.StepItem key={step.title}>
                    <S.StepNumber $state={step.state}>
                      <step.Icon size={16} strokeWidth={2.2} aria-hidden />
                    </S.StepNumber>
                    <S.StepCopy>
                      <span>{step.title}</span>
                      <S.StepStatus $state={step.state}>{step.status}</S.StepStatus>
                    </S.StepCopy>
                  </S.StepItem>
                ))}
              </S.StepList>

            </S.Card>

            <S.SummaryCard>
              <S.CardTitle>Resumo do pedido</S.CardTitle>
              <S.Divider />
              <S.SummaryRow>
                <span>Biteplaner</span>
                <strong>R$ 1.000,00</strong>
              </S.SummaryRow>
              <S.Divider />
              <S.SummaryRow>
                <span>Total</span>
                <S.Total>R$ 1.000,00</S.Total>
              </S.SummaryRow>

              {checkoutSuccess ? (
                <>
                  <S.PaymentApprovedBox>
                    <ShieldCheck size={24} aria-hidden />
                    <span>
                      <strong>Pagamento aprovado</strong>
                      Transação processada com sucesso via Stripe.
                    </span>
                  </S.PaymentApprovedBox>
                  <S.DetailsLink to="/painel/biteplaner/jornada">Ver detalhes do pedido</S.DetailsLink>
                </>
              ) : (
                <S.CheckoutButton onClick={handleConfirmPurchase} disabled={ctaDisabled} data-tone="success">
                  <LockKeyhole size={18} aria-hidden />
                  <span>{submitting ? 'Abrindo checkout...' : 'Concluir pagamento'}</span>
                </S.CheckoutButton>
              )}
            </S.SummaryCard>
          </S.Layout>

          {checkoutSuccess ? (
            <S.SuccessFooter>
              <S.SuccessFooterIcon aria-hidden>
                <PartyPopper size={38} strokeWidth={1.8} />
              </S.SuccessFooterIcon>
              <S.SuccessFooterCopy>
                <strong>Pagamento realizado com sucesso!</strong>
                <span>Sua compra foi confirmada e o processo continuará automaticamente.</span>
                <span>O comprovante e os informativos do pagamento serão enviados para o e-mail cadastrado.</span>
              </S.SuccessFooterCopy>
            </S.SuccessFooter>
          ) : (
            <S.InfoPanel>
              <S.InfoIcon aria-hidden>
                <Info size={22} />
              </S.InfoIcon>
              <S.InfoCopy>
                <strong>Importante</strong>
                <span>O pagamento será processado de forma segura via Stripe. Seus dados estão protegidos.</span>
              </S.InfoCopy>
            </S.InfoPanel>
          )}
        </>
      )}
    </S.Page>
  );
}
