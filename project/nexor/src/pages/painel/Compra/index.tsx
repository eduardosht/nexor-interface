import { useEffect, useMemo, useState } from 'react';
import { Select, Snackbar, SnackbarStack } from '@nexor/design-system';
import { CheckCircle2, Clock3, CreditCard, Hourglass, PartyPopper, ShieldCheck } from 'lucide-react';
import * as S from './styles';
import { SkeletonCard, SkeletonGrid } from '../../../components/Skeleton';
import type { DemoOrderSummary } from '../../../features/demo/biteplanerFlow';
import { JourneyNoticeCard } from '../components/JourneyNoticeCard';
import { OrderInfoCard, OrderStepHeader } from '../components/OrderStepHeader';
import { api } from '../../../lib/api';
import { useAuth } from '../../../hooks/useAuth';
import { env } from '../../../config/env';

const NEXT_STEPS = [
  {
    title: 'Dentista revisa o pedido',
    status: 'Atual',
    Icon: Hourglass,
  },
  {
    title: 'Pagamento seguro no checkout Asaas',
    status: 'Pendente',
    Icon: Clock3,
  },
  {
    title: 'Dentista conclui o pagamento para liberar a produção',
    status: 'Pendente',
    Icon: Clock3,
  },
];

const BITEPLANER_COLOR_OPTIONS = [
  { value: 'preto', label: 'Preto' },
  { value: 'branco', label: 'Branco' },
];

const BITEPLANER_MODEL_OPTIONS = [
  { value: 'impacto', label: 'Linha Impact' },
  { value: 'esportes', label: 'Linha Strength' },
];

const BITEPLANER_UNIT_PRICE_CENTS = 137000;

const PAYMENT_COMPLETED_STATUSES = new Set([
  'payment_confirmed',
  'awaiting_dentist_forms',
  'awaiting_external_production',
  'external_production_processing',
  'dentist_adjustment_required',
  'product_received_by_clinic',
  'awaiting_adaptation',
  'follow_up',
  'completed',
]);

function formatCurrencyBRL(cents: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(cents / 100);
}

function isPaymentCompletedStatus(status?: string) {
  return Boolean(status && PAYMENT_COMPLETED_STATUSES.has(status));
}

function getPurchaseSteps(purchaseConfirmed: boolean, messageSent: boolean, paymentCompleted: boolean) {
  if (paymentCompleted) {
    return NEXT_STEPS.map((step) => ({
      ...step,
      status: 'Confirmado',
      Icon: CheckCircle2,
      state: 'confirmed' as const,
    }));
  }

  if (!purchaseConfirmed) {
    return NEXT_STEPS.map((step, index) => ({
      ...step,
      state: index === 0 ? ('active' as const) : ('pending' as const),
    }));
  }

  return NEXT_STEPS.map((step, index) => {
    if (index === 0) {
      return {
        ...step,
        title: 'Compra confirmada',
        status: 'Confirmado',
        Icon: CheckCircle2,
        state: 'confirmed' as const,
      };
    }

    if (index === 1) {
      return {
        ...step,
        status: messageSent ? 'Enviada' : 'Aguardando',
        Icon: messageSent ? CheckCircle2 : Hourglass,
        state: messageSent ? ('confirmed' as const) : ('active' as const),
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
};

export function Compra({ embedded = false, initialOrder = null }: CompraProps) {
  const { session } = useAuth();
  const [order, setOrder] = useState<DemoOrderSummary | null>(initialOrder);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');
  const [selectedModel, setSelectedModel] = useState(BITEPLANER_MODEL_OPTIONS[0].value);
  const [selectedColor, setSelectedColor] = useState(BITEPLANER_COLOR_OPTIONS[0].value);
  const [quantity, setQuantity] = useState(1);
  const paymentCompleted = isPaymentCompletedStatus(order?.status);
  const purchaseConfirmed = Boolean(order?.purchaseConfiguration || order?.paymentRequest?.status);
  const paymentMessageSent = order?.paymentRequest?.status === 'message_sent';
  const purchaseSteps = getPurchaseSteps(purchaseConfirmed, paymentMessageSent, paymentCompleted);
  const orderConfiguration = order?.purchaseConfiguration ?? order?.dentistRecommendedPurchaseConfiguration ?? null;
  const totalCents = BITEPLANER_UNIT_PRICE_CENTS * quantity;

  useEffect(() => {
    setOrder(initialOrder);
    setLoading(false);
  }, [initialOrder]);

  useEffect(() => {
    if (!orderConfiguration) {
      return;
    }

    setSelectedModel(orderConfiguration.model);
    setSelectedColor(orderConfiguration.color);
    setQuantity(Math.max(1, Math.min(10, orderConfiguration.quantity)));
  }, [orderConfiguration]);

  const ctaDisabled = useMemo(
    () => submitting || quantity < 1,
    [order, quantity, submitting]
  );

  async function handleConfirmPurchase() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setNotice('');
    setError('');

    try {
      const origin = env.appUrl ?? window.location.origin;
      const response = await api.post<{ checkoutUrl: string }>(
        '/v1/commerce/biteplaner/checkout',
        {
          model: selectedModel,
          color: selectedColor,
          quantity,
          successUrl: `${origin}/painel/biteplaner/ordens?checkout=success`,
          cancelUrl: `${origin}/painel/biteplaner/ordens?checkout=cancel`,
        },
        session?.access_token
      );

      window.location.assign(response.checkoutUrl);
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Não foi possível iniciar o checkout Asaas.');
      setSubmitting(false);
    }
  }

  return (
    <S.Page>
      {!embedded && paymentCompleted ? (
        <S.SuccessHeader>
          <S.SuccessHeroCopy>
            <S.SuccessTitle>Confirmação de compra</S.SuccessTitle>
            <S.SuccessKicker>Caso liberado para produção</S.SuccessKicker>
            <S.SuccessDescription>
              O pagamento foi registrado e o caso clinicamente aprovado está liberado para a próxima etapa operacional.
            </S.SuccessDescription>
          </S.SuccessHeroCopy>
        </S.SuccessHeader>
      ) : null}

      {!embedded && !paymentCompleted ? (
        <OrderStepHeader
          title="Confirmação de compra"
          description="Confira modelo, cor e quantidade para sua compra profissional. Ao continuar, você será direcionado ao checkout seguro do Asaas."
          currentStep="purchase"
          order={order}
          orderHelpText="Este pedido está na etapa financeira antes da liberação operacional para produção."
          showOrderMetadata={false}
        />
      ) : null}

      {loading ? (
        <S.Layout aria-label="Carregando confirmação de compra">
          <SkeletonCard lines={5} blockHeight="42px" />
          <SkeletonGrid cards={1} minCardWidth="280px" />
        </S.Layout>
      ) : (
        <>
          {error ? <S.Banner role="alert">{error}</S.Banner> : null}
          {notice ? <S.Banner role="status">{notice}</S.Banner> : null}

          {!order ? (
            <S.Banner>Confira a configuração do Biteplaner. A finalização financeira será feita pelo novo checkout commerce da Nexor.</S.Banner>
          ) : null}

          {paymentCompleted && order ? (
            <OrderInfoCard
              order={order}
              orderHelpText="Este pedido está na etapa financeira antes da liberação operacional para produção."
              testId="payment-success-order-card"
              showMetadata={false}
            />
          ) : null}

          <S.Layout>
            <S.MainColumn>
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

              {!paymentCompleted ? (
                <JourneyNoticeCard
                  tone="success"
                  icon={<ShieldCheck size={18} strokeWidth={2.1} />}
                  title="Checkout seguro Asaas"
                  description="O pagamento acontece no ambiente hospedado do Asaas. A Nexor recebe a confirmação automaticamente para liberar a produção."
                  testId="asaas-checkout-card"
                />
              ) : (
                <S.SuccessFooter>
                  <S.SuccessFooterIcon aria-hidden>
                    <PartyPopper size={38} strokeWidth={1.8} />
                  </S.SuccessFooterIcon>
                  <S.SuccessFooterCopy>
                    <strong>Pagamento realizado com sucesso!</strong>
                    <span>Sua compra foi confirmada e o processo continuará automaticamente.</span>
                    <span>Os informativos do pagamento serão enviados para o e-mail cadastrado.</span>
                  </S.SuccessFooterCopy>
                </S.SuccessFooter>
              )}
            </S.MainColumn>

            <S.AsideColumn>
              <S.SummaryCard>
                <S.CardTitle>Resumo do pedido</S.CardTitle>
                <S.Divider />
                <S.SummaryRow>
                  <span>Biteplaner</span>
                  <strong>
                    {formatCurrencyBRL(BITEPLANER_UNIT_PRICE_CENTS)}
                    <S.UnitSuffix>/unidade</S.UnitSuffix>
                  </strong>
                </S.SummaryRow>
                <S.PriceNotice>
                  Este valor representa a compra do produto Biteplaner pelo dentista. A relação comercial com o paciente
                  acontece fora da plataforma Nexor.
                </S.PriceNotice>
                {!paymentCompleted ? (
                  <S.ConfigurationGrid>
                    <Select
                      label="Modelo do Biteplaner"
                      value={selectedModel}
                      options={BITEPLANER_MODEL_OPTIONS}
                      onChange={setSelectedModel}
                    />
                    <Select
                      label="Cor do Biteplaner"
                      value={selectedColor}
                      options={BITEPLANER_COLOR_OPTIONS}
                      onChange={setSelectedColor}
                    />
                    <S.ConfigurationField>
                      <span>Quantidade</span>
                      <input
                        aria-label="Quantidade"
                        type="number"
                        min={1}
                        max={10}
                        value={quantity}
                        onChange={(event) => {
                          const nextQuantity = Number(event.target.value);
                          setQuantity(Number.isFinite(nextQuantity) ? Math.max(1, Math.min(10, nextQuantity)) : 1);
                        }}
                      />
                    </S.ConfigurationField>
                  </S.ConfigurationGrid>
                ) : null}
                <S.Divider />
                <S.SummaryRow>
                  <span>Total</span>
                  <S.Total>{formatCurrencyBRL(totalCents)}</S.Total>
                </S.SummaryRow>

                {paymentCompleted ? (
                  <>
                    <S.PaymentApprovedBox>
                      <ShieldCheck size={24} aria-hidden />
                      <span>
                        <strong>Pagamento aprovado</strong>
                        Pagamento registrado com sucesso.
                      </span>
                    </S.PaymentApprovedBox>
                    <S.DetailsLink to="/painel/biteplaner/jornada">Acompanhar jornada</S.DetailsLink>
                  </>
                ) : (
                  <S.CheckoutButton onClick={handleConfirmPurchase} disabled={ctaDisabled} data-tone="success">
                    <CreditCard size={18} aria-hidden />
                    <span>
                      {submitting
                        ? 'Abrindo checkout...'
                        : purchaseConfirmed
                          ? 'Reabrir pagamento Asaas'
                          : 'Ir para pagamento Asaas'}
                    </span>
                  </S.CheckoutButton>
                )}
              </S.SummaryCard>
            </S.AsideColumn>
          </S.Layout>
        </>
      )}
      {notice ? (
        <SnackbarStack>
          <Snackbar
            tone="success"
            title="Checkout Asaas criado"
            message="Você será redirecionado para concluir o pagamento no ambiente seguro do Asaas."
            onClose={() => {
              setNotice('');
            }}
          />
        </SnackbarStack>
      ) : null}
    </S.Page>
  );
}
