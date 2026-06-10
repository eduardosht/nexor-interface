import { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import {
  AlertTriangle,
  Box,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CreditCard,
  FlaskConical,
  HandHelping,
  Info,
  Stethoscope,
  UserRound,
  type LucideIcon,
} from 'lucide-react';
import { SkeletonCard, SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchOrders,
  fetchAppointments,
  fetchWorkflowForms,
  confirmAppointmentByUser,
  getAthletePrimaryOrder,
  getAuthToken,
  getEffectiveAthleteOrder,
  getAthleteNextPath,
  getOrderDisplayId,
  getStageLabel,
  type DemoOrderSummary,
  type DemoAppointment,
  type DemoWorkflowForm,
} from '../../../features/demo/biteplanerFlow';
import { biteplanerQueryKeys } from '../../../features/demo/biteplanerQueryKeys';
import type { StepTone } from './styles';
import * as S from './styles';

type JourneyStepKey = 'prerequisite' | 'consultation' | 'clinical_decision' | 'purchase' | 'laboratory' | 'follow_up';

type JourneyStep = {
  key: JourneyStepKey;
  title: string;
  description: string;
  icon: LucideIcon;
};

const JOURNEY_STEPS: JourneyStep[] = [
  {
    key: 'prerequisite',
    title: 'Pre-requisito',
    description: 'Completar a triagem inicial e liberar a continuidade da jornada.',
    icon: ClipboardCheck,
  },
  {
    key: 'consultation',
    title: 'Consulta inicial',
    description: 'Escolha o consultório para ser atendido e aguarde a confirmação.',
    icon: UserRound,
  },
  {
    key: 'clinical_decision',
    title: 'Decisão clínica',
    description: 'O dentista define se o atleta está apto, inapto ou precisa de tratamento prévio.',
    icon: Stethoscope,
  },
  {
    key: 'purchase',
    title: 'Compra',
    description: 'Pagamento mock confirmado apenas quando o caso está apto clinicamente.',
    icon: CreditCard,
  },
  {
    key: 'laboratory',
    title: 'Laboratório',
    description: 'Ordem liberada para produção, retorno por ajuste ou conclusão laboratorial.',
    icon: FlaskConical,
  },
  {
    key: 'follow_up',
    title: 'Adaptação e acompanhamento',
    description: 'Entrega, encaixe e retornos periódicos após a produção.',
    icon: Box,
  }
];

function getStepStatusLabel(tone: StepTone) {
  if (tone === 'complete') {
    return 'Concluído com sucesso';
  }

  if (tone === 'current') {
    return 'Etapa atual';
  }

  return 'Pendente';
}

function getCurrentStepIndex(order: DemoOrderSummary) {
  if (order.status === 'registration_started') {
    return 0;
  }

  if (
    order.status === 'awaiting_scheduling' ||
    order.status === 'awaiting_dentist_acceptance' ||
    order.status === 'ineligible_reassessment'
  ) {
    return 1;
  }

  if (
    order.status === 'in_progress' ||
    order.status === 'appointment_confirmed'
  ) {
    return 2;
  }

  if (
    order.status === 'awaiting_payment' ||
    order.status === 'payment_confirmed' ||
    order.status === 'awaiting_dentist_forms'
  ) {
    return 3;
  }

  if (order.status === 'awaiting_lab_start' || order.status === 'lab_processing') {
    return 4;
  }

  if (order.status === 'awaiting_adaptation' || order.status === 'follow_up' || order.status === 'completed') {
    return 5;
  }

  return 0;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function formatCurrencyFromCents(value: number) {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value / 100);
}

function getStringPaymentField(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'string' && value.trim()) {
      return value.trim();
    }
  }

  return '';
}

function getNumberPaymentField(source: Record<string, unknown>, keys: string[]) {
  for (const key of keys) {
    const value = source[key];

    if (typeof value === 'number' && Number.isFinite(value)) {
      return value;
    }
  }

  return null;
}

function getPaymentMethodLabel(value: string) {
  const normalized = value.toLowerCase();

  if (normalized === 'card' || normalized === 'credit_card' || normalized === 'debit_card') {
    return 'Cartão';
  }

  if (normalized === 'pix') {
    return 'Pix';
  }

  if (normalized === 'boleto') {
    return 'Boleto';
  }

  return value || 'Aguardando dados da Stripe';
}

function getOrderPaymentDetails(order: DemoOrderSummary) {
  const record = order as unknown as Record<string, unknown>;
  const payment = isRecord(record.payment)
    ? record.payment
    : isRecord(record.paymentDetails)
      ? record.paymentDetails
      : {};
  const amountCents = getNumberPaymentField(payment, ['amountCents', 'amount_cents']) ?? 100000;
  const discountCents = getNumberPaymentField(payment, ['discountCents', 'discount_cents']) ?? 0;
  const method = getStringPaymentField(payment, ['method', 'paymentMethod', 'payment_method']);
  const couponCode = getStringPaymentField(payment, ['couponCode', 'coupon_code', 'coupon']);
  const paidAt = getStringPaymentField(payment, ['paidAt', 'paid_at']);
  const receiptEmail =
    getStringPaymentField(payment, ['receiptEmail', 'receipt_email']) ||
    order.customer?.email ||
    'e-mail cadastrado';

  return {
    amount: formatCurrencyFromCents(amountCents),
    method: getPaymentMethodLabel(method),
    coupon: couponCode || 'Nenhum cupom aplicado',
    discount: discountCents > 0 ? formatCurrencyFromCents(discountCents) : 'Sem desconto aplicado',
    paidAt: paidAt
      ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(paidAt))
      : 'Confirmado pela Stripe',
    receiptEmail,
  };
}

function getCustomerFacingInaptitudeReason(workflowForms: DemoWorkflowForm[]) {
  const intakeForm = workflowForms.find((form) => form.templateKey === 'customer_pre_consultation_intake');
  const payload = isRecord(intakeForm?.payload) ? intakeForm.payload : {};
  const dentistPayload = isRecord(payload.dentist) ? payload.dentist : {};
  const reason = dentistPayload.ineligibilityDescriptionForCustomer ?? payload.ineligibilityDescriptionForCustomer;

  return typeof reason === 'string' ? reason.trim() : '';
}

function getOrderProblemContext(order: DemoOrderSummary, workflowForms: DemoWorkflowForm[]) {
  if (order.status === 'ineligible_reassessment') {
    const reason = getCustomerFacingInaptitudeReason(workflowForms);

    return {
      title: 'Cliente inapto neste momento',
      stageTitle: 'Consulta inicial',
      reason:
        `O dentista responsável registrou que o cliente não está apto para seguir com o Biteplaner agora.${reason ? ` ${reason}` : ''} É possível solicitar uma nova reavaliação com uma clínica licenciada.`
    };
  }

  if (order.status === 'cancelled') {
    return {
      title: 'Ordem cancelada',
      stageTitle: getStageLabel(order),
      reason:
        'A ordem foi cancelada antes da continuidade operacional. Entre em contato com a Nexor para entender o motivo e avaliar os próximos passos.'
    };
  }

  return null;
}

function getCurrentStepNotice(
  order: DemoOrderSummary,
  currentStep: JourneyStep | null,
  initialAppointment: DemoAppointment | null
) {
  if (order.status === 'in_progress') {
    if (!initialAppointment) {
      return null;
    }

    if (initialAppointment.user_confirmed_at) {
      return 'Consulta realizada confirmada pelo usuário. Agora a ação está com o dentista para validar a realização da consulta.';
    }

    return 'Há uma ação pendente para o usuário: confirme que a consulta agendada foi realizada para liberar a próxima etapa da jornada.';
  }

  if (!currentStep) {
    return null;
  }

  if (order.status === 'awaiting_dentist_acceptance') {
    return `A consulta inicial foi solicitada. Agora é preciso aguardar o aceite do dentista para seguir na etapa ${currentStep.title}.`;
  }

  if (order.status === 'in_progress') {
    return `A consulta inicial está em andamento. Aguarde as confirmações necessárias para liberar a próxima etapa.`;
  }

  if (order.status === 'appointment_confirmed') {
    return `Consulta confirmada. A jornada aguarda a decisão clínica do dentista para liberar a próxima ação.`;
  }

  if (order.status === 'payment_confirmed' || order.status === 'awaiting_dentist_forms') {
    return `Pagamento confirmado. A jornada aguarda os registros operacionais do dentista para seguir.`;
  }

  if (order.status === 'awaiting_lab_start') {
    return `A solicitação foi enviada ao laboratório. Acompanhe por aqui enquanto a produção é aceita e iniciada.`;
  }

  if (order.status === 'lab_processing') {
    return `O Biteplaner está em etapa laboratorial. Acompanhe o progresso por aqui enquanto o laboratório conclui a produção.`;
  }

  if (order.status === 'awaiting_adaptation') {
    return `Produto recebido pela clínica. Aguarde as orientações para adaptação e acompanhamento.`;
  }

  return null;
}

function getCurrentStepDisclaimer(order: DemoOrderSummary, initialAppointment: DemoAppointment | null) {
  if (order.status === 'in_progress' && initialAppointment?.user_confirmed_at) {
    return {
      tone: 'info' as const,
      title: 'Ação com o dentista',
      icon: <Clock3 size={18} aria-hidden />,
    };
  }

  if (order.status === 'in_progress') {
    return {
      tone: 'warning' as const,
      title: 'Ação pendente do usuário',
      icon: <AlertTriangle size={18} aria-hidden />,
    };
  }

  if (order.status === 'awaiting_dentist_acceptance') {
    return {
      tone: 'warning' as const,
      title: 'Aguardando aceite do dentista',
      icon: <Clock3 size={18} aria-hidden />,
    };
  }

  if (order.status === 'appointment_confirmed') {
    return {
      tone: 'info' as const,
      title: 'Aguardando decisão clínica',
      icon: <Info size={18} aria-hidden />,
    };
  }

  if (order.status === 'payment_confirmed' || order.status === 'awaiting_dentist_forms') {
    return {
      tone: 'success' as const,
      title: 'Pagamento confirmado',
      icon: <Check size={18} aria-hidden />,
    };
  }

  if (order.status === 'awaiting_lab_start' || order.status === 'lab_processing') {
    return {
      tone: 'info' as const,
      title: 'Etapa laboratorial',
      icon: <Clock3 size={18} aria-hidden />,
    };
  }

  if (order.status === 'awaiting_adaptation') {
    return {
      tone: 'info' as const,
      title: 'Aguardando adaptação',
      icon: <Info size={18} aria-hidden />,
    };
  }

  return {
    tone: 'info' as const,
    title: 'Atualização da etapa',
    icon: <Info size={18} aria-hidden />,
  };
}

export function Jornada() {
  const { session } = useAuth();
  const queryClient = useQueryClient();
  const token = getAuthToken(session);
  const queryOwnerId = session?.user.id ?? 'anonymous';
  const stepFlowRef = useRef<HTMLElement | null>(null);
  const [appointmentAction, setAppointmentAction] = useState('');
  const [appointmentNotice, setAppointmentNotice] = useState('');
  const [appointmentError, setAppointmentError] = useState('');
  const ordersQuery = useQuery({
    queryKey: biteplanerQueryKeys.orders('user', queryOwnerId),
    queryFn: () => fetchOrders('user', token),
    enabled: Boolean(token),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const orders = ordersQuery.data?.orders ?? [];

  const primaryOrder = useMemo(() => getAthletePrimaryOrder(orders), [orders]);
  const workflowFormsQuery = useQuery({
    queryKey: biteplanerQueryKeys.workflowForms(primaryOrder?.id ?? 'pending'),
    queryFn: () => fetchWorkflowForms(primaryOrder!.id, token),
    enabled: Boolean(primaryOrder?.id && token),
    staleTime: 5 * 60_000,
    refetchOnWindowFocus: false,
  });
  const appointmentsQuery = useQuery({
    queryKey: biteplanerQueryKeys.appointments(primaryOrder?.id ?? 'pending'),
    queryFn: () => fetchAppointments(primaryOrder!.id, token),
    enabled: Boolean(primaryOrder?.id && token),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const workflowForms = workflowFormsQuery.data?.forms ?? [];
  const appointments = appointmentsQuery.data?.appointments ?? [];
  const loading = ordersQuery.isLoading;
  const error = ordersQuery.isError ? 'Não foi possível carregar a jornada compartilhada agora.' : '';
  const workflowFormsError = workflowFormsQuery.isError ? 'Não foi possível carregar os formulários desta ordem.' : '';
  const visibleAppointmentError = appointmentError ||
    (appointmentsQuery.isError ? 'Não foi possível carregar a consulta agendada desta ordem.' : '');
  const selectedFormsOrder = useMemo(
    () => getEffectiveAthleteOrder(primaryOrder, workflowForms),
    [primaryOrder, workflowForms]
  );
  const shouldRedirectToOnboarding = selectedFormsOrder?.stage === 'new_user_onboarding';
  const currentStepIndex = selectedFormsOrder ? getCurrentStepIndex(selectedFormsOrder) : -1;
  const currentStep = currentStepIndex >= 0 ? JOURNEY_STEPS[currentStepIndex] : null;
  const currentStepActionPath = getAthleteNextPath(selectedFormsOrder);
  const orderProblem = useMemo(
    () => (selectedFormsOrder ? getOrderProblemContext(selectedFormsOrder, workflowForms) : null),
    [selectedFormsOrder, workflowForms]
  );
  const initialAppointment = appointments.find((appointment) => appointment.type === 'initial') ?? appointments[0] ?? null;
  const currentStepNotice = selectedFormsOrder
    ? getCurrentStepNotice(selectedFormsOrder, currentStep, initialAppointment)
    : null;
  const currentStepDisclaimer = selectedFormsOrder
    ? getCurrentStepDisclaimer(selectedFormsOrder, initialAppointment)
    : null;
  const paymentDetails =
    selectedFormsOrder &&
    (selectedFormsOrder.status === 'payment_confirmed' || selectedFormsOrder.status === 'awaiting_dentist_forms')
      ? getOrderPaymentDetails(selectedFormsOrder)
      : null;
  const hasPendingUserAppointmentConfirmation = Boolean(
    selectedFormsOrder?.status === 'in_progress' &&
    initialAppointment &&
    !initialAppointment.user_confirmed_at
  );

  async function handleUserAppointmentConfirmation() {
    if (!selectedFormsOrder || !initialAppointment) {
      return;
    }

    const actionKey = `${selectedFormsOrder.id}:user-confirmation`;
    setAppointmentAction(actionKey);
    setAppointmentError('');
    setAppointmentNotice('');

    try {
      const response = await confirmAppointmentByUser(selectedFormsOrder.id, initialAppointment.id, token);
      queryClient.setQueryData<{ appointments: DemoAppointment[] }>(
        biteplanerQueryKeys.appointments(selectedFormsOrder.id),
        (current) => ({
          appointments: (current?.appointments ?? appointments).map((appointment) =>
            appointment.id === initialAppointment.id ? response.appointment : appointment
          ),
        })
      );
      setAppointmentNotice('Sua confirmação de consulta realizada foi registrada.');
    } catch {
      setAppointmentError('Não foi possível confirmar a consulta realizada agora.');
    } finally {
      setAppointmentAction('');
    }
  }

  if (!loading && shouldRedirectToOnboarding) {
    return <Navigate to="/painel/biteplaner/onboarding" replace />;
  }

  return (
    <S.Page>
      {loading ? (
        <S.StepFlow aria-label="Carregando jornada">
          <SkeletonCard lines={2} />
          <SkeletonGrid cards={6} minCardWidth="160px" />
          <SkeletonCard lines={4} blockHeight="90px" />
        </S.StepFlow>
      ) : null}
      {error ? <S.Banner role="alert">{error}</S.Banner> : null}

      {selectedFormsOrder ? (
        <S.StepFlow ref={stepFlowRef} data-testid="athlete-journey-steps">
          <S.SectionHeader>
            <S.SectionTitle as="h1">Fluxo visual da jornada</S.SectionTitle>
            <S.Description>
              Os passos abaixo mostram em que ponto a jornada {getOrderDisplayId(selectedFormsOrder)} está. As etapas são apenas informativas e a visualização permanece na etapa atual.
            </S.Description>
          </S.SectionHeader>
          <S.StepScroll>
            <S.StepList>
              {JOURNEY_STEPS.map((step, index) => {
                const tone =
                  index < currentStepIndex ? 'complete' : index === currentStepIndex ? 'current' : 'upcoming';
                const StepIcon = step.icon;
                const content = (
                  <>
                    <S.StepBadge $tone={tone}>{index + 1}</S.StepBadge>
                    <S.StepIconBox $tone={tone}>
                      <StepIcon size={24} aria-hidden />
                    </S.StepIconBox>
                    <S.StepText>
                      <S.StepName>{step.title}</S.StepName>
                      <S.StepCopy>{step.description}</S.StepCopy>
                    </S.StepText>
                    {tone === 'current' ? (
                      <S.StepStatusLink $tone={tone} to={currentStepActionPath}>
                        <HandHelping size={14} aria-hidden />
                        {getStepStatusLabel(tone)}
                      </S.StepStatusLink>
                    ) : (
                      <S.StepStatus $tone={tone}>
                        {tone === 'complete' ? <CheckCircle2 size={14} aria-hidden /> : null}
                        {getStepStatusLabel(tone)}
                      </S.StepStatus>
                    )}
                  </>
                );

                return (
                  <S.StepItem key={step.key} $tone={tone}>
                    <S.StepPanel $tone={tone} data-testid={`journey-step-${step.key}`}>
                      {content}
                    </S.StepPanel>
                  </S.StepItem>
                );
              })}
            </S.StepList>
          </S.StepScroll>
          {workflowFormsError ? <S.Banner role="alert">{workflowFormsError}</S.Banner> : null}
          {visibleAppointmentError ? <S.Banner role="alert">{visibleAppointmentError}</S.Banner> : null}
          {appointmentNotice ? <S.Banner role="status">{appointmentNotice}</S.Banner> : null}
          {orderProblem ? (
            <S.Banner role="alert" data-testid="journey-order-problem">
              <strong>{orderProblem.title}</strong>
              <span> {orderProblem.reason}</span>
              {selectedFormsOrder.status === 'ineligible_reassessment' ? (
                <S.BannerActionLink to="/painel/consulta-inicial">
                  <UserRound size={16} aria-hidden />
                  <span>Marcar uma nova consulta</span>
                </S.BannerActionLink>
              ) : null}
            </S.Banner>
          ) : null}
          {!orderProblem && currentStepNotice && currentStepDisclaimer ? (
            <S.StepDisclaimer
              role="status"
              data-testid="journey-step-notice"
              $tone={currentStepDisclaimer.tone}
            >
              <S.StepDisclaimerIcon $tone={currentStepDisclaimer.tone}>
                {currentStepDisclaimer.icon}
              </S.StepDisclaimerIcon>
              <S.StepDisclaimerContent>
                <S.StepDisclaimerTitle $tone={currentStepDisclaimer.tone}>
                  {currentStepDisclaimer.title}
                </S.StepDisclaimerTitle>
                <S.StepDisclaimerText>{currentStepNotice}</S.StepDisclaimerText>
              </S.StepDisclaimerContent>
            </S.StepDisclaimer>
          ) : null}
          {!orderProblem && paymentDetails ? (
            <S.PaymentConfirmationCard data-testid="journey-payment-confirmation">
              <S.PaymentConfirmationHeader>
                <S.PaymentConfirmationIcon aria-hidden>
                  <CreditCard size={22} />
                </S.PaymentConfirmationIcon>
                <S.PaymentConfirmationCopy>
                  <strong>Detalhes do pagamento</strong>
                  <span>
                    Seu pagamento foi aprovado. O próximo passo é o dentista dar o OK e enviar a produção para o
                    laboratório licenciado.
                  </span>
                </S.PaymentConfirmationCopy>
              </S.PaymentConfirmationHeader>
              <S.PaymentDetailsGrid>
                <S.PaymentDetailItem>
                  <span>Valor pago</span>
                  <strong>{paymentDetails.amount}</strong>
                </S.PaymentDetailItem>
                <S.PaymentDetailItem>
                  <span>Forma de pagamento</span>
                  <strong>{paymentDetails.method}</strong>
                </S.PaymentDetailItem>
                <S.PaymentDetailItem>
                  <span>Cupom</span>
                  <strong>{paymentDetails.coupon}</strong>
                </S.PaymentDetailItem>
                <S.PaymentDetailItem>
                  <span>Desconto</span>
                  <strong>{paymentDetails.discount}</strong>
                </S.PaymentDetailItem>
                <S.PaymentDetailItem>
                  <span>Data do pagamento</span>
                  <strong>{paymentDetails.paidAt}</strong>
                </S.PaymentDetailItem>
                <S.PaymentDetailItem>
                  <span>Recibo</span>
                  <strong>{paymentDetails.receiptEmail}</strong>
                </S.PaymentDetailItem>
              </S.PaymentDetailsGrid>
            </S.PaymentConfirmationCard>
          ) : null}
          {!orderProblem && selectedFormsOrder && initialAppointment && hasPendingUserAppointmentConfirmation ? (
            <S.PendingActionCard data-testid="journey-pending-user-action">
              <S.PendingActionCopy>
                <S.PendingActionTitle>Ação pendente do usuário</S.PendingActionTitle>
                <S.Description>
                  Confirme que a consulta agendada foi realizada para que a jornada possa seguir para a validação do dentista.
                </S.Description>
              </S.PendingActionCopy>
              <S.PendingActionButton
                type="button"
                disabled={appointmentAction === `${selectedFormsOrder.id}:user-confirmation`}
                onClick={() => {
                  void handleUserAppointmentConfirmation();
                }}
              >
                <Check size={18} aria-hidden />
                <span>Confirmar consulta realizada</span>
              </S.PendingActionButton>
            </S.PendingActionCard>
          ) : null}
        </S.StepFlow>
      ) : null}

    </S.Page>
  );
}
