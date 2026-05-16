import { useEffect, useMemo, useRef, useState } from 'react';
import { Chip, StatusIndicator } from '@nexor/design-system';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchOrders,
  fetchTimeline,
  fetchWorkflowForms,
  formatDate,
  getAthletePrimaryOrder,
  getAuthToken,
  getOrderStatusPresentation,
  getStageLabel,
  type DemoOrderSummary,
  type DemoTimelineEvent,
  type DemoWorkflowForm,
} from '../../../features/demo/biteplanerFlow';
import { WorkflowFormsPanel } from '../components/WorkflowFormsPanel';
import type { StepTone } from './styles';
import * as S from './styles';

type JourneyStepKey = 'prerequisite' | 'consultation' | 'clinical_decision' | 'purchase' | 'laboratory' | 'follow_up';

type JourneyStep = {
  key: JourneyStepKey;
  title: string;
  description: string;
  href: string;
};

const JOURNEY_STEPS: JourneyStep[] = [
  {
    key: 'prerequisite',
    title: 'Pre-requisito',
    description: 'Completar a triagem inicial e liberar a continuidade da jornada.',
    href: '/painel/pre-requisito'
  },
  {
    key: 'consultation',
    title: 'Consulta inicial',
    description: 'Escolha o consultório para ser atendido e aguarde a confirmação.',
    href: '/painel/consulta-inicial'
  },
  {
    key: 'clinical_decision',
    title: 'Decisão clínica',
    description: 'O dentista define se o atleta está apto, inapto ou precisa de tratamento prévio.',
    href: '/painel/biteplaner/jornada'
  },
  {
    key: 'purchase',
    title: 'Compra',
    description: 'Pagamento mock confirmado apenas quando o caso está apto clínicamente.',
    href: '/painel/compra'
  },
  {
    key: 'laboratory',
    title: 'Laboratório',
    description: 'Ordem liberada para produção, retorno por ajuste ou conclusão laboratorial.',
    href: '/painel/biteplaner/jornada'
  },
  {
    key: 'follow_up',
    title: 'Adaptação e acompanhamento',
    description: 'Entrega, encaixe e retornos periodicos após a produção.',
    href: '/painel/biteplaner/jornada'
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

function getJourneyAction(order: DemoOrderSummary | null) {
  if (!order) {
    return { href: '/painel/biteplaner/jornada', label: 'Ver jornada compartilhada' };
  }

  if (order.status === 'registration_started') {
    return { href: '/painel/pre-requisito', label: 'Abrir pre-requisito' };
  }

  if (order.status === 'awaiting_payment') {
    return { href: '/painel/compra', label: 'Abrir compra mock' };
  }

  if (order.status === 'awaiting_scheduling') {
    return { href: '/painel/consulta-inicial', label: 'Abrir consulta inicial' };
  }

  if (order.status === 'awaiting_adaptation' || order.status === 'follow_up') {
    return { href: '/painel/biteplaner/jornada', label: 'Ver acompanhamento' };
  }

  return { href: '/painel/biteplaner/jornada', label: 'Ver resumo da jornada' };
}

function getWorkflowStepKey(form: DemoWorkflowForm): JourneyStepKey {
  if (form.templateKey === 'customer_pre_consultation_intake') {
    return 'consultation';
  }

  if (form.templateKey === 'lab_review_by_dentist' || form.templateKey === 'dentist_review_by_lab') {
    return 'laboratory';
  }

  if (form.templateKey === 'dentist_review_by_customer') {
    return 'follow_up';
  }

  if (form.templateKey === 'partner_review_by_customer' || form.templateKey === 'influencer_review_by_customer') {
    return 'follow_up';
  }

  if (form.stepKey.includes('lab')) {
    return 'laboratory';
  }

  if (form.stepKey.includes('adaptation') || form.stepKey.includes('feedback')) {
    return 'follow_up';
  }

  return 'clinical_decision';
}

export function Jornada() {
  const { session } = useAuth();
  const token = getAuthToken(session);
  const stepFlowRef = useRef<HTMLElement | null>(null);
  const [orders, setOrders] = useState<DemoOrderSummary[]>([]);
  const [timeline, setTimeline] = useState<Record<string, DemoTimelineEvent[]>>({});
  const [selectedFormsOrderId, setSelectedFormsOrderId] = useState<string | null>(null);
  const [workflowForms, setWorkflowForms] = useState<DemoWorkflowForm[]>([]);
  const [workflowFormsLoading, setWorkflowFormsLoading] = useState(false);
  const [workflowFormsError, setWorkflowFormsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function loadJourney() {
      try {
        const response = await fetchOrders('user', token);
        const timelineEntries = await Promise.all(
          response.orders.map(async (order) => [
            order.id,
            (await fetchTimeline(order.id, token)).events
          ] as const)
        );

        if (!active) {
          return;
        }

        setOrders(response.orders);
        setTimeline(Object.fromEntries(timelineEntries));
      } catch {
        if (active) {
          setError('Não foi possível carregar a jornada compartilhada agora.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadJourney();

    return () => {
      active = false;
    };
  }, [token]);

  const primaryOrder = useMemo(() => getAthletePrimaryOrder(orders), [orders]);
  const selectedFormsOrder = useMemo(
    () => orders.find((order) => order.id === selectedFormsOrderId) ?? primaryOrder,
    [orders, primaryOrder, selectedFormsOrderId]
  );
  const currentStepIndex = selectedFormsOrder ? getCurrentStepIndex(selectedFormsOrder) : -1;
  const journeyAction = getJourneyAction(selectedFormsOrder);
  const workflowFormsByStep = useMemo(() => {
    const grouped = new Map<JourneyStepKey, DemoWorkflowForm[]>();

    for (const form of workflowForms) {
      const stepKey = getWorkflowStepKey(form);
      grouped.set(stepKey, [...(grouped.get(stepKey) ?? []), form]);
    }

    return grouped;
  }, [workflowForms]);

  useEffect(() => {
    if (!selectedFormsOrder?.id || !token) {
      setWorkflowForms([]);
      return;
    }

    let active = true;
    setWorkflowFormsLoading(true);
    setWorkflowFormsError('');

    async function loadWorkflowForms() {
      try {
        const response = await fetchWorkflowForms(selectedFormsOrder.id, token);

        if (active) {
          setWorkflowForms(response.forms);
        }
      } catch {
        if (active) {
          setWorkflowFormsError('Não foi possível carregar os formulários desta ordem.');
        }
      } finally {
        if (active) {
          setWorkflowFormsLoading(false);
        }
      }
    }

    void loadWorkflowForms();

    return () => {
      active = false;
    };
  }, [selectedFormsOrder?.id, token]);

  return (
    <S.Page>
      {loading ? <S.Banner>Carregando jornada...</S.Banner> : null}
      {error ? <S.Banner role="alert">{error}</S.Banner> : null}

      {selectedFormsOrder ? (
        <S.StepFlow ref={stepFlowRef} data-testid="athlete-journey-steps">
          <S.SectionHeader>
            <S.SectionTitle as="h1">Fluxo visual da jornada</S.SectionTitle>
            <S.Description>
              Os passos abaixo mostram em que ponto o pedido {selectedFormsOrder.id} está e quais formulários ou feedbacks fazem parte de cada etapa.
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
                    <S.StepStatus $tone={tone}>{getStepStatusLabel(tone)}</S.StepStatus>
                  </>
                );

                return (
                  <S.StepItem key={step.key} $tone={tone}>
                    {index <= currentStepIndex ? (
                      <S.StepLink
                        to={step.href}
                        $tone={tone}
                        data-testid={`journey-step-${step.key}`}
                      >
                        {content}
                      </S.StepLink>
                    ) : (
                      <S.StepPanel $tone={tone} data-testid={`journey-step-${step.key}`}>
                        {content}
                      </S.StepPanel>
                    )}
                  </S.StepItem>
                );
              })}
            </S.StepList>
          </S.StepScroll>
          {workflowFormsLoading ? <S.Description>Carregando formulários da jornada...</S.Description> : null}
          {workflowFormsError ? <S.Banner role="alert">{workflowFormsError}</S.Banner> : null}
          {workflowForms.length > 0 ? (
            <S.StepFormsSection>
              <S.StepFormsHeader>
                <S.SectionTitle>Formulários e feedbacks da jornada</S.SectionTitle>
                <S.Description>
                  Estes itens pertencem aos steps do pedido selecionado e podem bloquear ou complementar a continuidade operacional.
                </S.Description>
              </S.StepFormsHeader>
              <S.StepFormsGrid>
                {JOURNEY_STEPS.map((step) => {
                  const stepForms = workflowFormsByStep.get(step.key) ?? [];

                  if (stepForms.length === 0) {
                    return null;
                  }

                  return (
                    <S.StepFormsGroup key={step.key} data-testid={`journey-step-forms-${step.key}`}>
                      <S.SectionHeader>
                        <S.SectionTitle>{step.title}</S.SectionTitle>
                        <S.Description>{step.description}</S.Description>
                      </S.SectionHeader>
                      <WorkflowFormsPanel
                        orderId={selectedFormsOrder.id}
                        token={token}
                        forms={stepForms}
                        defaultValues={{
                          fullName: selectedFormsOrder.customer?.full_name ?? '',
                        }}
                        onFormsChange={(nextStepForms) =>
                          setWorkflowForms((current) =>
                            current.map((form) => nextStepForms.find((nextForm) => nextForm.id === form.id) ?? form)
                          )
                        }
                        variant="embedded"
                      />
                    </S.StepFormsGroup>
                  );
                })}
              </S.StepFormsGrid>
            </S.StepFormsSection>
          ) : null}
          <S.ActionLink to={journeyAction.href}>{journeyAction.label}</S.ActionLink>
        </S.StepFlow>
      ) : null}

      {selectedFormsOrder ? (
        <S.SummaryGrid>
          <S.SummaryCard>
            <S.SectionTitle>Resumo do caso</S.SectionTitle>
            <S.SummaryList>
              <S.SummaryTerm>Pedido</S.SummaryTerm>
              <S.SummaryValue>{selectedFormsOrder.id}</S.SummaryValue>

              <S.SummaryTerm>Etapa atual</S.SummaryTerm>
              <S.SummaryValue>{getStageLabel(selectedFormsOrder)}</S.SummaryValue>

              <S.SummaryTerm>Dentista selecionado</S.SummaryTerm>
              <S.SummaryValue>{selectedFormsOrder.practice_location?.name ?? 'Aguardando definicao operacional'}</S.SummaryValue>

              <S.SummaryTerm>Próximo passo</S.SummaryTerm>
              <S.SummaryValue>{journeyAction.label}</S.SummaryValue>
            </S.SummaryList>
          </S.SummaryCard>

          <S.SummaryCard>
            <S.SectionTitle>Histórico resumido</S.SectionTitle>
            <S.TimelineList>
              {(timeline[selectedFormsOrder.id] ?? []).slice(0, 5).map((event) => (
                <S.TimelineItem key={event.id}>
                  {formatDate(event.createdAt)} - {event.reason ?? event.toStatus}
                </S.TimelineItem>
              ))}
            </S.TimelineList>
          </S.SummaryCard>
        </S.SummaryGrid>
      ) : null}

      <S.OrderGrid>
        {orders.map((order) => (
          <S.OrderCard key={order.id} $active={selectedFormsOrder?.id === order.id}>
            <S.OrderTitle>{order.id}</S.OrderTitle>
            <S.Description>
              Etapa atual: {getStageLabel(order)}.
            </S.Description>
            <Chip tone="neutral">
              <StatusIndicator
                color={getOrderStatusPresentation(order).color}
                label={getOrderStatusPresentation(order).label}
              />
            </Chip>
            <S.SecondaryActionButton
              type="button"
              onClick={() => {
                setSelectedFormsOrderId(order.id);
                window.requestAnimationFrame(() => {
                  stepFlowRef.current?.scrollIntoView?.({ behavior: 'smooth', block: 'start' });
                  stepFlowRef.current?.focus({ preventScroll: true });
                });
              }}
            >
              Ver formulários
            </S.SecondaryActionButton>
          </S.OrderCard>
        ))}
      </S.OrderGrid>
    </S.Page>
  );
}
