import { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Navigate } from 'react-router-dom';
import { AlertTriangle, Check, Clock3, Info } from 'lucide-react';
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
  getStageLabel,
  type DemoOrderSummary,
  type DemoAppointment,
} from '../../../features/demo/biteplanerFlow';
import { biteplanerQueryKeys } from '../../../features/demo/biteplanerQueryKeys';
import type { StepTone } from './styles';
import * as S from './styles';

type JourneyStepKey = 'prerequisite' | 'consultation' | 'clinical_decision' | 'purchase' | 'laboratory' | 'follow_up';

type JourneyStep = {
  key: JourneyStepKey;
  title: string;
  description: string;
};

const JOURNEY_STEPS: JourneyStep[] = [
  {
    key: 'prerequisite',
    title: 'Pre-requisito',
    description: 'Completar a triagem inicial e liberar a continuidade da jornada.'
  },
  {
    key: 'consultation',
    title: 'Consulta inicial',
    description: 'Escolha o consultório para ser atendido e aguarde a confirmação.'
  },
  {
    key: 'clinical_decision',
    title: 'Decisão clínica',
    description: 'O dentista define se o atleta está apto, inapto ou precisa de tratamento prévio.'
  },
  {
    key: 'purchase',
    title: 'Compra',
    description: 'Pagamento mock confirmado apenas quando o caso está apto clínicamente.'
  },
  {
    key: 'laboratory',
    title: 'Laboratório',
    description: 'Ordem liberada para produção, retorno por ajuste ou conclusão laboratorial.'
  },
  {
    key: 'follow_up',
    title: 'Adaptação e acompanhamento',
    description: 'Entrega, encaixe e retornos periodicos após a produção.'
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

  if (order.status === 'awaiting_scheduling') {
    return 1;
  }

  if (
    order.status === 'in_progress' ||
    order.status === 'appointment_confirmed' ||
    order.status === 'ineligible_refund'
  ) {
    return 2;
  }

  if (order.status === 'awaiting_payment' || order.status === 'payment_confirmed') {
    return 3;
  }

  if (order.status === 'lab_processing') {
    return 4;
  }

  if (order.status === 'awaiting_adaptation' || order.status === 'follow_up' || order.status === 'completed') {
    return 5;
  }

  return 0;
}

function getOrderProblemContext(order: DemoOrderSummary) {
  if (order.status === 'ineligible_refund') {
    return {
      title: 'Ordem encerrada: atleta inapto para uso do produto',
      stageTitle: 'Decisão clínica',
      reason:
        'O dentista responsável registrou que o atleta está inapto para seguir com o Biteplaner neste momento. A jornada foi encerrada antes da etapa de compra.'
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
      return 'Consulta realizada confirmada pelo usuario. Agora a acao esta com o dentista para validar a realizacao da consulta.';
    }

    return 'Ha uma acao pendente para o usuario: confirme que a consulta agendada foi realizada para liberar a proxima etapa da jornada.';
  }

  if (!currentStep) {
    return null;
  }

  if (order.status === 'awaiting_dentist_acceptance') {
    return `A consulta inicial foi solicitada. Agora Ã© preciso aguardar o aceite do dentista para seguir na etapa ${currentStep.title}.`;
  }

  if (order.status === 'in_progress') {
    return `A consulta inicial estÃ¡ em andamento. Aguarde as confirmaÃ§Ãµes necessÃ¡rias para liberar a prÃ³xima etapa.`;
  }

  if (order.status === 'appointment_confirmed') {
    return `Consulta confirmada. A jornada aguarda a decisÃ£o clÃ­nica do dentista para liberar a prÃ³xima aÃ§Ã£o.`;
  }

  if (order.status === 'payment_confirmed' || order.status === 'awaiting_dentist_forms') {
    return `Pagamento confirmado. A jornada aguarda os registros operacionais do dentista para seguir.`;
  }

  if (order.status === 'lab_processing') {
    return `O Biteplaner estÃ¡ em etapa laboratorial. Acompanhe o progresso por aqui enquanto o laboratÃ³rio conclui a produÃ§Ã£o.`;
  }

  if (order.status === 'awaiting_adaptation') {
    return `Produto recebido pela clÃ­nica. Aguarde as orientaÃ§Ãµes para adaptaÃ§Ã£o e acompanhamento.`;
  }

  return null;
}

function getCurrentStepDisclaimer(order: DemoOrderSummary, initialAppointment: DemoAppointment | null) {
  if (order.status === 'in_progress' && initialAppointment?.user_confirmed_at) {
    return {
      tone: 'info' as const,
      title: 'Acao com o dentista',
      icon: <Clock3 size={18} aria-hidden />,
    };
  }

  if (order.status === 'in_progress') {
    return {
      tone: 'warning' as const,
      title: 'Acao pendente do usuario',
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
      title: 'Aguardando decisao clinica',
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

  if (order.status === 'lab_processing') {
    return {
      tone: 'info' as const,
      title: 'Etapa laboratorial',
      icon: <Clock3 size={18} aria-hidden />,
    };
  }

  if (order.status === 'awaiting_adaptation') {
    return {
      tone: 'info' as const,
      title: 'Aguardando adaptacao',
      icon: <Info size={18} aria-hidden />,
    };
  }

  return {
    tone: 'info' as const,
    title: 'Atualizacao da etapa',
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
    (appointmentsQuery.isError ? 'Nao foi possivel carregar a consulta agendada desta ordem.' : '');
  const selectedFormsOrder = useMemo(
    () => getEffectiveAthleteOrder(primaryOrder, workflowForms),
    [primaryOrder, workflowForms]
  );
  const shouldRedirectToOnboarding = selectedFormsOrder?.stage === 'new_user_onboarding';
  const currentStepIndex = selectedFormsOrder ? getCurrentStepIndex(selectedFormsOrder) : -1;
  const currentStep = currentStepIndex >= 0 ? JOURNEY_STEPS[currentStepIndex] : null;
  const currentStepActionPath = getAthleteNextPath(selectedFormsOrder);
  const orderProblem = useMemo(
    () => (selectedFormsOrder ? getOrderProblemContext(selectedFormsOrder) : null),
    [selectedFormsOrder]
  );
  const initialAppointment = appointments.find((appointment) => appointment.type === 'initial') ?? appointments[0] ?? null;
  const currentStepNotice = selectedFormsOrder
    ? getCurrentStepNotice(selectedFormsOrder, currentStep, initialAppointment)
    : null;
  const currentStepDisclaimer = selectedFormsOrder
    ? getCurrentStepDisclaimer(selectedFormsOrder, initialAppointment)
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
      setAppointmentNotice('Sua confirmacao de consulta realizada foi registrada.');
    } catch {
      setAppointmentError('Nao foi possivel confirmar a consulta realizada agora.');
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
              Os passos abaixo mostram em que ponto a jornada {selectedFormsOrder.id} está. As etapas são apenas informativas e a visualização permanece na etapa atual.
            </S.Description>
          </S.SectionHeader>
          <S.StepScroll>
            <S.StepList>
              {JOURNEY_STEPS.map((step, index) => {
                const tone =
                  index < currentStepIndex ? 'complete' : index === currentStepIndex ? 'current' : 'upcoming';
                const content = (
                  <>
                    <S.StepBadge $tone={tone}>{index + 1}</S.StepBadge>
                    <div>
                      <S.StepName>{step.title}</S.StepName>
                      <S.StepCopy>{step.description}</S.StepCopy>
                    </div>
                    {tone === 'current' ? (
                      <S.StepStatusLink $tone={tone} to={currentStepActionPath}>
                        {getStepStatusLabel(tone)}
                      </S.StepStatusLink>
                    ) : (
                      <S.StepStatus $tone={tone}>{getStepStatusLabel(tone)}</S.StepStatus>
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
          {!orderProblem && selectedFormsOrder && initialAppointment && hasPendingUserAppointmentConfirmation ? (
            <S.PendingActionCard data-testid="journey-pending-user-action">
              <S.PendingActionCopy>
                <S.PendingActionTitle>Acao pendente do usuario</S.PendingActionTitle>
                <S.Description>
                  Confirme que a consulta agendada foi realizada para que a jornada possa seguir para a validacao do dentista.
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
