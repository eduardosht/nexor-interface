import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertTriangle, FileText, Lock, Mail, MessageCircleQuestion, Send, UserRound } from 'lucide-react';
import { SkeletonCard, SkeletonGrid } from '../../../components/Skeleton';
import { useAuth } from '../../../hooks/useAuth';
import {
  fetchOrders,
  fetchWorkflowForms,
  getAthletePrimaryOrder,
  getAuthToken,
  getStageLabel,
  type DemoOrderSummary,
  type DemoWorkflowForm,
} from '../../../features/demo/biteplanerFlow';
import { WorkflowFormsPanel } from '../components/WorkflowFormsPanel';
import { ConsultaInicial } from '../ConsultaInicial';
import { Compra } from '../Compra';
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

function getWorkflowStepKey(form: DemoWorkflowForm): JourneyStepKey {
  if (form.templateKey === 'customer_pre_consultation_intake') {
    return 'prerequisite';
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

function advancePrerequisiteOrder(order: DemoOrderSummary): DemoOrderSummary {
  return {
    ...order,
    status: 'awaiting_scheduling',
    statusLabel: 'Aguardando consulta inicial',
    stage: 'awaiting_initial_consultation',
  };
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

export function Jornada() {
  const { session, backendUser } = useAuth();
  const token = getAuthToken(session);
  const stepFlowRef = useRef<HTMLElement | null>(null);
  const [orders, setOrders] = useState<DemoOrderSummary[]>([]);
  const [workflowForms, setWorkflowForms] = useState<DemoWorkflowForm[]>([]);
  const [workflowFormsLoading, setWorkflowFormsLoading] = useState(false);
  const [workflowFormsError, setWorkflowFormsError] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  useEffect(() => {
    if (!token) {
      return;
    }

    let active = true;

    async function loadJourney() {
      try {
        const response = await fetchOrders('user', token);

        if (!active) {
          return;
        }

        setOrders(response.orders);
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
  const selectedFormsOrder = primaryOrder;
  const currentStepIndex = selectedFormsOrder ? getCurrentStepIndex(selectedFormsOrder) : -1;
  const currentStep = currentStepIndex >= 0 ? JOURNEY_STEPS[currentStepIndex] : null;
  const orderProblem = useMemo(
    () => (selectedFormsOrder ? getOrderProblemContext(selectedFormsOrder) : null),
    [selectedFormsOrder]
  );
  const hasOrderProblem = orderProblem !== null;
  const workflowFormsByStep = useMemo(() => {
    const grouped = new Map<JourneyStepKey, DemoWorkflowForm[]>();

    for (const form of workflowForms) {
      const stepKey = getWorkflowStepKey(form);
      grouped.set(stepKey, [...(grouped.get(stepKey) ?? []), form]);
    }

    return grouped;
  }, [workflowForms]);
  const currentStepForms = currentStep ? workflowFormsByStep.get(currentStep.key) ?? [] : [];
  const isPrerequisiteStep = currentStep?.key === 'prerequisite';
  const isConsultationStep = currentStep?.key === 'consultation';
  const isPurchaseStep = currentStep?.key === 'purchase';
  const contactMailto = useMemo(() => {
    const body = [
      `Nome: ${contactName}`,
      `E-mail: ${contactEmail}`,
      selectedFormsOrder ? `Ordem: ${selectedFormsOrder.id}` : '',
      orderProblem ? `Etapa do problema: ${orderProblem.stageTitle}` : '',
      '',
      contactMessage,
    ].filter(Boolean).join('\n');

    return `mailto:contato@necoradvance.com.br?subject=${encodeURIComponent(contactSubject)}&body=${encodeURIComponent(body)}`;
  }, [contactEmail, contactMessage, contactName, contactSubject, orderProblem, selectedFormsOrder]);

  useEffect(() => {
    if (!selectedFormsOrder || !orderProblem) {
      return;
    }

    const name = selectedFormsOrder.customer?.full_name ?? '';
    const email = selectedFormsOrder.customer?.email ?? backendUser?.email ?? session?.user.email ?? '';

    setContactName(name);
    setContactEmail(email);
    setContactSubject(`Erro ordem ${selectedFormsOrder.id} - `);
    setContactMessage(
      `Olá, equipe Nexor.\n\nMinha jornada apresentou um problema na etapa "${orderProblem.stageTitle}".\nMotivo exibido: ${orderProblem.reason}\n\nGostaria de entender o que aconteceu e quais são os próximos passos.`
    );
  }, [backendUser?.email, orderProblem, selectedFormsOrder, session?.user.email]);

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
                    <S.StepStatus $tone={tone}>{getStepStatusLabel(tone)}</S.StepStatus>
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
          {workflowFormsLoading ? <SkeletonCard lines={3} blockHeight="90px" /> : null}
          {workflowFormsError ? <S.Banner role="alert">{workflowFormsError}</S.Banner> : null}
          {orderProblem ? (
            <S.OrderProblemSection role="alert" data-testid="journey-order-problem">
              <S.OrderProblemHeader>
                <S.OrderProblemIcon>
                  <AlertTriangle size={34} aria-hidden />
                </S.OrderProblemIcon>
                <div>
                  <S.SectionTitle>{orderProblem.title}</S.SectionTitle>
                  <S.Description>
                    O problema ocorreu na etapa <S.OrderProblemStage>{orderProblem.stageTitle}</S.OrderProblemStage> da jornada {selectedFormsOrder.id}.
                  </S.Description>
                </div>
              </S.OrderProblemHeader>
              <S.OrderProblemReason>
                <MessageCircleQuestion size={34} aria-hidden />
                <span>
                  <strong>Motivo:</strong> {orderProblem.reason}
                </span>
              </S.OrderProblemReason>

              <S.ContactPanel>
                <S.ContactHeader>
                  <S.ContactHeaderIcon>
                    <Mail size={30} aria-hidden />
                  </S.ContactHeaderIcon>
                  <div>
                    <S.SectionTitle>Falar com a Nexor</S.SectionTitle>
                    <S.Description>
                      Revise as informações abaixo e complete o assunto antes de enviar o e-mail para <S.ContactEmail>contato@necoradvance.com.br</S.ContactEmail>.
                    </S.Description>
                  </div>
                </S.ContactHeader>
                <S.ContactForm>
                  <S.ContactField>
                    <span>Nome</span>
                    <label>
                      <UserRound size={20} aria-hidden />
                      <input
                        aria-label="Nome"
                        value={contactName}
                        onChange={(event) => setContactName(event.target.value)}
                      />
                    </label>
                  </S.ContactField>
                  <S.ContactField>
                    <span>E-mail</span>
                    <label>
                      <Mail size={20} aria-hidden />
                      <input
                        aria-label="E-mail"
                        type="email"
                        value={contactEmail}
                        onChange={(event) => setContactEmail(event.target.value)}
                      />
                    </label>
                  </S.ContactField>
                  <S.ContactField $full>
                    <span>Assunto</span>
                    <label>
                      <FileText size={20} aria-hidden />
                      <input
                        aria-label="Assunto"
                        value={contactSubject}
                        onChange={(event) => setContactSubject(event.target.value)}
                      />
                    </label>
                  </S.ContactField>
                  <S.ContactField $full>
                    <span>Mensagem</span>
                    <label>
                      <MessageCircleQuestion size={22} aria-hidden />
                      <textarea
                        aria-label="Mensagem"
                        rows={7}
                        value={contactMessage}
                        onChange={(event) => setContactMessage(event.target.value)}
                      />
                    </label>
                  </S.ContactField>
                  <S.ContactActions>
                    <S.ContactSubmitLink href={contactMailto}>
                      <Send size={18} aria-hidden />
                      Enviar e-mail para a Nexor
                    </S.ContactSubmitLink>
                    <S.ContactPrivacyNote>
                      <Lock size={14} aria-hidden />
                      Seus dados estão protegidos
                    </S.ContactPrivacyNote>
                  </S.ContactActions>
                </S.ContactForm>
              </S.ContactPanel>
            </S.OrderProblemSection>
          ) : null}
          {!hasOrderProblem && currentStep && currentStepForms.length > 0 ? (
            <S.StepFormsSection>
              <S.StepFormsHeader>
                <S.SectionTitle>
                  {isPrerequisiteStep ? 'Pré-requisito: avaliação inicial compartilhada Biteplaner' : currentStep.title}
                </S.SectionTitle>
                <S.Description>
                  {isPrerequisiteStep
                    ? 'Preencha o intake pré-consulta do Biteplaner. Após o envio do cadastro e consentimentos, a jornada avança para a escolha da clínica na consulta inicial.'
                    : currentStep.description}
                </S.Description>
              </S.StepFormsHeader>
              <S.StepFormsGrid>
                <S.StepFormsGroup data-testid={`journey-step-forms-${currentStep.key}`}>
                  <WorkflowFormsPanel
                    orderId={selectedFormsOrder.id}
                    token={token}
                    forms={currentStepForms}
                    defaultValues={{
                      fullName: selectedFormsOrder.customer?.full_name ?? '',
                    }}
                    onFormsChange={(nextStepForms) => {
                      setWorkflowForms((current) =>
                        current.map((form) => nextStepForms.find((nextForm) => nextForm.id === form.id) ?? form)
                      );

                      if (
                        currentStep.key === 'prerequisite' &&
                        selectedFormsOrder.status === 'registration_started' &&
                        nextStepForms.length > 0 &&
                        nextStepForms.every((form) => form.status === 'submitted')
                      ) {
                        setOrders((currentOrders) =>
                          currentOrders.map((order) =>
                            order.id === selectedFormsOrder.id ? advancePrerequisiteOrder(order) : order
                          )
                        );
                      }
                    }}
                    variant="embedded"
                    formPresentation={isPrerequisiteStep ? 'flat' : 'card'}
                    showFormHeader={!isPrerequisiteStep}
                  />
                </S.StepFormsGroup>
              </S.StepFormsGrid>
            </S.StepFormsSection>
          ) : null}
          {!hasOrderProblem && isConsultationStep ? (
            <S.StepFormsSection data-testid="journey-consultation-content">
              <S.StepFormsHeader>
                <S.SectionTitle>Consulta inicial</S.SectionTitle>
                <S.Description>
                  Escolha uma clínica licenciada para seguir com a primeira consulta da jornada Biteplaner.
                </S.Description>
              </S.StepFormsHeader>
              <ConsultaInicial
                embedded
                initialOrder={selectedFormsOrder}
                onOrderChange={(nextOrder) =>
                  setOrders((currentOrders) =>
                    currentOrders.map((order) => (order.id === nextOrder.id ? nextOrder : order))
                  )
                }
              />
            </S.StepFormsSection>
          ) : null}
          {!hasOrderProblem && isPurchaseStep ? (
            <S.StepFormsSection data-testid="journey-purchase-content">
              <S.StepFormsHeader>
                <S.SectionTitle>Compra</S.SectionTitle>
                <S.Description>
                  Confirme a compra mock diretamente na jornada para liberar a continuidade operacional.
                </S.Description>
              </S.StepFormsHeader>
              <Compra
                embedded
                initialOrder={selectedFormsOrder}
                onOrderChange={(nextOrder) =>
                  setOrders((currentOrders) =>
                    currentOrders.map((order) => (order.id === nextOrder.id ? nextOrder : order))
                  )
                }
              />
            </S.StepFormsSection>
          ) : null}
        </S.StepFlow>
      ) : null}

    </S.Page>
  );
}
