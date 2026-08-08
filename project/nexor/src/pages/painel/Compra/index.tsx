import { useEffect, useMemo, useState } from 'react';
import { Select, Snackbar, SnackbarStack, UploadField, type UploadFieldFile } from '@nexor/design-system';
import { CheckCircle2, Clock3, CreditCard, Hourglass, PartyPopper, ShieldCheck } from 'lucide-react';
import * as S from './styles';
import { SkeletonCard, SkeletonGrid } from '../../../components/Skeleton';
import type { DemoOrderSummary } from '../../../features/demo/biteplanerFlow';
import { JourneyNoticeCard } from '../components/JourneyNoticeCard';
import { OrderInfoCard, OrderStepHeader } from '../components/OrderStepHeader';
import { useAuth } from '../../../hooks/useAuth';
import { env } from '../../../config/env';
import { createBiteplanerDraft, startBiteplanerCheckout } from '../../../features/commerce/biteplanerPurchase.api';
import type { BiteplanerBiologicalSex, BiteplanerSportCategory } from '../../../features/commerce/biteplanerPurchase.types';
import { uploadCompletionSlotFile } from '../../../features/commerce/biteplanerOrderCompletion.api';
import type { BiteplanerCompletionSlotKey } from '../../../features/commerce/biteplanerOrderCompletion.types';

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

const BITEPLANER_UNIT_PRICE_CENTS = 140000;

const BITEPLANER_SPORT_OPTIONS = [
  { value: 'combat_sports', label: 'Esportes de combate' },
  { value: 'team_sports', label: 'Esportes coletivos' },
  { value: 'racket_sports', label: 'Esportes de raquete' },
  { value: 'running_athletics', label: 'Corrida e atletismo' },
  { value: 'strength_training', label: 'Força e musculação' },
  { value: 'cycling', label: 'Ciclismo' },
  { value: 'water_sports', label: 'Esportes aquáticos' },
  { value: 'other_sports', label: 'Outros esportes' },
];

const BITEPLANER_BIOLOGICAL_SEX_OPTIONS = [
  { value: 'female', label: 'Feminino' },
  { value: 'male', label: 'Masculino' },
  { value: 'intersex', label: 'Intersexo' },
  { value: 'not_informed', label: 'Prefiro não informar' },
];

const BITEPLANER_TECHNICAL_UPLOADS: Array<{
  slotKey: BiteplanerCompletionSlotKey;
  label: string;
  hint: string;
}> = [
  {
    slotKey: 'two_arches_scan',
    label: 'Escaneamento 3D das duas arcadas',
    hint: 'Anexe o arquivo com as duas arcadas. A validação do formato será definida posteriormente.',
  },
  {
    slotKey: 'lateral_jig_scan',
    label: 'Escaneamento 3D lateral com JIG',
    hint: 'Anexe o escaneamento lateral com JIG. A validação do formato será definida posteriormente.',
  },
  {
    slotKey: 'prescription_image',
    label: 'Imagem da prescrição',
    hint: 'Envie uma imagem legível da prescrição. A validação do formato será definida posteriormente.',
  },
];

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
  const [selectedColor, setSelectedColor] = useState(BITEPLANER_COLOR_OPTIONS[0].value);
  const [quantity, setQuantity] = useState(1);
  const [sportCategory, setSportCategory] = useState<BiteplanerSportCategory | ''>('');
  const [athleteAge, setAthleteAge] = useState('');
  const [biologicalSex, setBiologicalSex] = useState<BiteplanerBiologicalSex | ''>('');
  const [selectedFiles, setSelectedFiles] = useState<Partial<Record<BiteplanerCompletionSlotKey, File>>>({});
  const paymentCompleted = isPaymentCompletedStatus(order?.status);
  const purchaseConfirmed = Boolean(order?.purchaseConfiguration || order?.paymentRequest?.status);
  const paymentMessageSent = order?.paymentRequest?.status === 'message_sent';
  const purchaseSteps = getPurchaseSteps(purchaseConfirmed, paymentMessageSent, paymentCompleted);
  const orderConfiguration = order?.purchaseConfiguration ?? order?.dentistRecommendedPurchaseConfiguration ?? null;
  const totalCents = BITEPLANER_UNIT_PRICE_CENTS * quantity;
  const technicalFormComplete = Boolean(
    sportCategory &&
    biologicalSex &&
    athleteAge.trim() &&
    Number.isInteger(Number(athleteAge)) &&
    Number(athleteAge) >= 0 &&
    Number(athleteAge) <= 120 &&
    BITEPLANER_TECHNICAL_UPLOADS.every(({ slotKey }) => selectedFiles[slotKey] !== undefined)
  );

  useEffect(() => {
    setOrder(initialOrder);
    setLoading(false);
  }, [initialOrder]);

  useEffect(() => {
    if (!orderConfiguration) {
      return;
    }

    setSelectedColor(orderConfiguration.color);
    setQuantity(Math.max(1, Math.min(10, orderConfiguration.quantity)));
  }, [orderConfiguration]);

  const ctaDisabled = useMemo(
    () => submitting || quantity < 1 || !technicalFormComplete,
    [quantity, submitting, technicalFormComplete]
  );

  function getUploadFieldFiles(slotKey: BiteplanerCompletionSlotKey): UploadFieldFile[] {
    const file = selectedFiles[slotKey];
    return file
      ? [{
        id: `selected-${slotKey}`,
        name: file.name,
        status: 'uploaded',
        sizeLabel: 'Arquivo selecionado para envio seguro.',
      }]
      : [];
  }

  async function handleConfirmPurchase() {
    if (submitting) {
      return;
    }

    setSubmitting(true);
    setNotice('');
    setError('');

    try {
      if (!session?.access_token || !technicalFormComplete || sportCategory === '' || biologicalSex === '') {
        throw new Error('Preencha os dados de produção e selecione os três arquivos obrigatórios.');
      }

      const origin = env.appUrl ?? window.location.origin;
      const draft = await createBiteplanerDraft({
        color: selectedColor,
        quantity,
        sportCategory,
        athleteAge: Number(athleteAge),
        biologicalSex,
      }, session.access_token);

      for (const { slotKey } of BITEPLANER_TECHNICAL_UPLOADS) {
        const file = selectedFiles[slotKey];
        if (file === undefined) {
          throw new Error('Selecione os três arquivos obrigatórios antes de continuar.');
        }
        await uploadCompletionSlotFile({ orderId: draft.orderId, slotKey, file, token: session.access_token });
      }

      const response = await startBiteplanerCheckout({
        draftOrderId: draft.orderId,
        successUrl: `${origin}/painel/biteplaner/ordens?checkout=success`,
        cancelUrl: `${origin}/painel/biteplaner/ordens?checkout=cancel`,
      }, session.access_token);

      window.location.assign(response.checkoutUrl);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Não foi possível iniciar o checkout Asaas.';
      const requestId = typeof error === 'object' && error !== null && 'requestId' in error
        ? (error as { requestId?: unknown }).requestId
        : undefined;
      setError(typeof requestId === 'string' && requestId.length > 0
        ? `${message} Referência: ${requestId}`
        : message);
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
          description="Confira categoria do esporte, cor e quantidade para sua compra profissional. Ao continuar, você será direcionado ao checkout seguro do Asaas."
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
                <S.Card>
                  <S.CardTitle>Dados para produção</S.CardTitle>
                  <S.Description>Essas informações e documentos são obrigatórios para o laboratório produzir seu Biteplaner.</S.Description>
                  <S.ConfigurationGrid>
                    <Select
                      label="Categoria do esporte"
                      value={sportCategory}
                      options={BITEPLANER_SPORT_OPTIONS}
                      onChange={(value) => setSportCategory(value as BiteplanerSportCategory)}
                      placeholder="Selecione a categoria"
                      required
                    />
                    <S.ConfigurationField>
                      <span>Idade</span>
                      <input
                        aria-label="Idade"
                        type="number"
                        min={0}
                        max={120}
                        value={athleteAge}
                        onChange={(event) => setAthleteAge(event.target.value)}
                        required
                      />
                    </S.ConfigurationField>
                    <Select
                      label="Sexo biológico"
                      value={biologicalSex}
                      options={BITEPLANER_BIOLOGICAL_SEX_OPTIONS}
                      onChange={(value) => setBiologicalSex(value as BiteplanerBiologicalSex)}
                      placeholder="Selecione uma opção"
                      required
                    />
                  </S.ConfigurationGrid>
                  <S.UploadGrid>
                    {BITEPLANER_TECHNICAL_UPLOADS.map(({ slotKey, label, hint }) => (
                      <UploadField
                        key={slotKey}
                        label={label}
                        hint={hint}
                        files={getUploadFieldFiles(slotKey)}
                        onFilesChange={(files) => {
                          const file = files[0];
                          if (file) setSelectedFiles((current) => ({ ...current, [slotKey]: file }));
                        }}
                        onRemoveFile={() => {
                          setSelectedFiles((current) => {
                            const next = { ...current };
                            delete next[slotKey];
                            return next;
                          });
                        }}
                      />
                    ))}
                  </S.UploadGrid>
                </S.Card>
              ) : null}

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
