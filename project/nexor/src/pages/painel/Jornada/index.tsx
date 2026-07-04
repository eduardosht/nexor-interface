import { useMemo, useRef, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { Snackbar, SnackbarStack } from '@nexor/design-system';
import {
  AlertTriangle,
  Box,
  ChevronRight,
  Check,
  CheckCircle2,
  ClipboardCheck,
  Clock3,
  CreditCard,
  FlaskConical,
  HeartPulse,
  CircleHelp,
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
  fetchClinicalFollowUps,
  fetchWorkflowForms,
  cancelPracticeLocationSelection,
  confirmAppointmentByUser,
  getAthletePrimaryOrder,
  getAuthToken,
  getEffectiveAthleteOrder,
  getAthleteNextPath,
  getOrderDisplayId,
  getOrderClinicalDentistName,
  getOrderClinicalPracticeLocation,
  getStageLabel,
  scheduleClinicalFollowUp,
  type DemoOrderSummary,
  type DemoAppointment,
  type DemoWorkflowForm,
  type ClinicalFollowUpKind,
} from '../../../features/demo/biteplanerFlow';
import { biteplanerQueryKeys } from '../../../features/demo/biteplanerQueryKeys';
import type { StepTone } from './styles';
import { PendingFeedbackPrompt } from '../components/PendingFeedbackPrompt';
import { ClinicalFollowUpCards } from '../components/ClinicalFollowUpCards';
import { JourneyNoticeCard } from '../components/JourneyNoticeCard';
import * as S from './styles';

type JourneyStepKey = 'prerequisite' | 'consultation' | 'clinical_decision' | 'purchase' | 'laboratory' | 'follow_up' | 'checkups';
type VisualJourneyStepKey = 'registration' | JourneyStepKey;

type JourneyStep = {
  key: JourneyStepKey;
  title: string;
  description: string;
  icon: LucideIcon;
};

type VisualJourneyStep = Omit<JourneyStep, 'key'> & {
  key: VisualJourneyStepKey;
};

const ACCOUNT_DELETION_APPROVED_REASON = 'account_deletion_approved';

const JOURNEY_STEPS: JourneyStep[] = [
  {
    key: 'prerequisite',
    title: 'Pré-consulta',
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
    description: 'Pagamento confirmado apenas quando o caso está apto clinicamente.',
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
  },
  {
    key: 'checkups',
    title: 'Check-ups',
    description: 'Retornos clínicos de 15 e 30 dias para acompanhar a adaptação.',
    icon: HeartPulse,
  }
];

const VISUAL_JOURNEY_STEPS: VisualJourneyStep[] = [
  {
    key: 'registration',
    title: 'Cadastro',
    description: 'Cadastro criado para iniciar a jornada Biteplaner.',
    icon: CheckCircle2,
  },
  ...JOURNEY_STEPS,
];

function getStepStatusLabel(tone: StepTone) {
  if (tone === 'complete') {
    return 'Concluído';
  }

  if (tone === 'current') {
    return 'Atual';
  }

  return 'Pendente';
}

function getHeroStatusLabel(order: DemoOrderSummary) {
  return order.statusLabel || getStageLabel(order);
}

function getVisualStepTone(index: number, currentVisualStepIndex: number): StepTone {
  if (index < currentVisualStepIndex) {
    return 'complete';
  }

  if (index === currentVisualStepIndex) {
    return 'current';
  }

  return 'upcoming';
}

function getJourneySummary(order: DemoOrderSummary, currentStep: VisualJourneyStep | null) {
  if (order.stage === 'new_user_onboarding') {
    return {
      text: 'Sua jornada Biteplaner foi criada. Comece pelo cadastro inicial para liberar as próximas etapas.',
      actionTitle: 'O que fazer agora?',
      actionText: 'Esta etapa depende de você. Preencha o cadastro inicial para avançar para a pré-consulta.',
      estimate: '3 minutos',
      buttonLabel: 'Iniciar cadastro',
      whyTitle: 'Por que preciso preencher o cadastro?',
      whyText: 'O cadastro inicial reúne as informações básicas necessárias para preparar sua jornada Biteplaner.',
    };
  }

  if (order.status === 'registration_started') {
    return {
      text: 'Você criou sua jornada com sucesso. Continue preenchendo as informações iniciais para avançar para a próxima etapa.',
      actionTitle: 'O que fazer agora?',
      actionText: 'Esta etapa depende de você. Preencha a pré-consulta para liberar a escolha da clínica e avançar na jornada.',
      estimate: '3 minutos',
      buttonLabel: 'Iniciar pré-consulta',
      whyTitle: 'Por que preciso preencher a pré-consulta?',
      whyText: 'Essas informações são essenciais para que possamos indicar a clínica mais adequada para o seu caso.',
    };
  }

  if (order.status === 'awaiting_scheduling' || order.status === 'awaiting_dentist_acceptance') {
    const isWaitingForDentist = order.status === 'awaiting_dentist_acceptance';

    return {
      text: isWaitingForDentist
        ? 'Sua consulta inicial foi solicitada. Agora a jornada aguarda o aceite do dentista para continuar.'
        : 'Sua triagem inicial foi concluída. Agora escolha o local da consulta inicial para continuar.',
      actionTitle: 'O que fazer agora?',
      actionText: isWaitingForDentist
        ? 'Aguarde o aceite do dentista. Nenhuma ação do usuário é necessária neste momento; assim que o dentista aceitar, a próxima etapa será liberada.'
        : 'Esta etapa depende de você. Escolha o consultório da consulta inicial para que o atendimento possa ser confirmado.',
      estimate: isWaitingForDentist ? 'Aguardando dentista' : '5 minutos',
      buttonLabel: isWaitingForDentist ? null : 'Abrir consulta inicial',
      whyTitle: 'Por que essa etapa importa?',
      whyText: 'A consulta inicial conecta seu caso a uma clínica licenciada e ao dentista responsável pela avaliação.',
    };
  }

  if (order.status === 'awaiting_payment') {
    const purchaseAlreadySent =
      Boolean(order.purchaseConfiguration) ||
      order.paymentRequest?.status === 'pending_admin_message' ||
      order.paymentRequest?.status === 'message_sent';

    if (purchaseAlreadySent) {
      return {
        text: 'Em breve você receberá o link de pagamento por e-mail e celular.',
        actionTitle: 'Ordem de compra enviada',
        actionText: 'Em breve você receberá o link de pagamento por e-mail e celular.',
        estimate: order.paymentRequest?.status === 'message_sent' ? 'Link enviado' : 'Aguardando link',
        buttonLabel: null,
        whyTitle: 'Por que preciso aguardar?',
        whyText: 'O link é enviado manualmente pela equipe Nexor para garantir que os dados de contato, valor e configuração do pedido estejam corretos.',
      };
    }

    return {
      text: 'Seu caso foi aprovado clinicamente. Conclua a compra para liberar a próxima fase da jornada.',
      actionTitle: 'O que fazer agora?',
      actionText: 'Esta etapa depende de você. Finalize o pagamento para liberar os registros operacionais e a produção.',
      estimate: '3 minutos',
      buttonLabel: 'Confirmar compra',
      whyTitle: 'Por que o pagamento libera a jornada?',
      whyText: 'A confirmação do pagamento autoriza a continuidade operacional com dentista e laboratório licenciados.',
    };
  }

  return {
    text: currentStep
      ? `Sua jornada está na etapa ${currentStep.title}. Acompanhe as atualizações e siga a ação indicada quando estiver disponível.`
      : 'Acompanhe as atualizações da sua jornada Biteplaner em tempo real.',
    actionTitle: 'O que fazer agora?',
    actionText: getPassiveStepActionText(order, currentStep),
    estimate: getPassiveStepEstimate(order),
    buttonLabel: null,
    whyTitle: 'Por que acompanhar a jornada?',
    whyText: 'Cada etapa libera a próxima ação somente quando as informações necessárias forem confirmadas.',
  };
}

function getPassiveStepActionText(order: DemoOrderSummary, currentStep: VisualJourneyStep | null) {
  const stepName = currentStep?.title ?? 'jornada';

  if (order.status === 'in_progress') {
    return 'A consulta inicial está em andamento. Se houver confirmação pendente, ela aparecerá neste card; depois disso, a continuidade depende da validação do dentista.';
  }

  if (order.status === 'appointment_confirmed') {
    return 'A consulta foi confirmada. Agora é necessário aguardar a decisão clínica do dentista para saber se a compra será liberada.';
  }

  if (order.status === 'payment_confirmed' || order.status === 'awaiting_dentist_forms') {
    return 'O pagamento foi confirmado. Aguarde o dentista concluir os registros operacionais para enviar o caso ao laboratório.';
  }

  if (order.status === 'awaiting_lab_start') {
    return 'A solicitação chegou ao laboratório. Agora é preciso aguardar o aceite e o início da produção.';
  }

  if (order.status === 'lab_processing') {
    return 'O Biteplaner está em produção. Nenhuma ação do usuário é necessária enquanto o laboratório conclui esta etapa.';
  }

  if (order.status === 'awaiting_adaptation') {
    return 'O produto foi recebido pela clínica. Aguarde as orientações do dentista para adaptação e acompanhamento.';
  }

  if (order.status === 'follow_up') {
    return 'A adaptação já aconteceu e o acompanhamento está ativo. Siga as orientações combinadas com o dentista.';
  }

  if (order.status === 'completed') {
    return 'Sua jornada foi concluída. Este painel permanece como histórico do processo e das etapas realizadas.';
  }

  return `Acompanhe a etapa ${stepName}. Quando houver ação do usuário ou de algum profissional, ela aparecerá aqui.`;
}

function getPassiveStepEstimate(order: DemoOrderSummary) {
  if (order.status === 'completed') {
    return 'Concluído';
  }

  if (order.status === 'follow_up') {
    return 'Acompanhamento ativo';
  }

  if (
    order.status === 'appointment_confirmed' ||
    order.status === 'payment_confirmed' ||
    order.status === 'awaiting_dentist_forms'
  ) {
    return 'Aguardando dentista';
  }

  if (order.status === 'awaiting_lab_start' || order.status === 'lab_processing') {
    return 'Aguardando laboratório';
  }

  return 'Acompanhe por aqui';
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

  if (order.status === 'awaiting_payment') {
    return 3;
  }

  if (
    order.status === 'payment_confirmed' ||
    order.status === 'awaiting_dentist_forms' ||
    order.status === 'awaiting_lab_start' ||
    order.status === 'lab_processing'
  ) {
    return 4;
  }

  if (order.status === 'awaiting_adaptation' || order.status === 'follow_up') {
    return 5;
  }

  if (order.status === 'completed') {
    return 6;
  }

  return 0;
}

function getClinicalFollowUpOverviewTone(status: string | undefined): StepTone {
  if (status === 'completed') {
    return 'complete';
  }

  if (status === 'available' || status === 'overdue' || status === 'scheduled') {
    return 'current';
  }

  return 'upcoming';
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

function getOrderStatusReason(order: DemoOrderSummary) {
  const record = order as unknown as Record<string, unknown>;
  const directReason =
    record.statusReason ??
    record.status_reason ??
    record.cancellationReason ??
    record.cancellation_reason ??
    record.cancelReason ??
    record.cancel_reason;

  if (typeof directReason === 'string') {
    return directReason;
  }

  const metadata = isRecord(record.metadata) ? record.metadata : null;
  const metadataReason = metadata?.reason ?? metadata?.cancellationReason ?? metadata?.cancellation_reason;

  return typeof metadataReason === 'string' ? metadataReason : '';
}

function wasInterruptedByAccountDeletion(order: DemoOrderSummary) {
  return getOrderStatusReason(order) === ACCOUNT_DELETION_APPROVED_REASON;
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

  return value || 'Aguardando dados do Pagar.me';
}

const PAYMENT_DETAILS_STATUSES = new Set([
  'payment_confirmed',
  'awaiting_dentist_forms',
  'awaiting_lab_start',
  'lab_processing',
  'dentist_adjustment_required',
  'product_received_by_clinic',
  'awaiting_adaptation',
  'follow_up',
  'completed',
]);

function shouldShowPaymentDetails(order: DemoOrderSummary) {
  return PAYMENT_DETAILS_STATUSES.has(order.status);
}

function formatPurchaseOption(value: string) {
  const normalized = value.trim().toLowerCase();

  if (normalized === 'impacto') {
    return 'Linha Impact';
  }

  if (normalized === 'esportes') {
    return 'Linha Strength';
  }

  if (normalized === 'preto') {
    return 'Preto';
  }

  if (normalized === 'branco') {
    return 'Branco';
  }

  return value || 'Não informado';
}

function getOrderPaymentDetails(order: DemoOrderSummary) {
  const record = order as unknown as Record<string, unknown>;
  const payment = isRecord(record.payment)
    ? record.payment
    : isRecord(record.paymentDetails)
      ? record.paymentDetails
      : {};
  const purchaseConfiguration = order.purchaseConfiguration ?? order.dentistRecommendedPurchaseConfiguration ?? null;
  const amountCents = getNumberPaymentField(payment, ['amountCents', 'amount_cents']);
  const method = getStringPaymentField(payment, ['method', 'paymentMethod', 'payment_method', 'payment_method_type']);
  const paidAt =
    getStringPaymentField(payment, ['paidAt', 'paid_at']) ||
    getStringPaymentField(payment, ['confirmed_at', 'created_at']);

  return {
    amount: amountCents !== null ? formatCurrencyFromCents(amountCents) : 'Aguardando dados do Pagar.me',
    model: purchaseConfiguration ? formatPurchaseOption(purchaseConfiguration.model) : 'Não informado',
    color: purchaseConfiguration ? formatPurchaseOption(purchaseConfiguration.color) : 'Não informado',
    quantity: purchaseConfiguration ? String(purchaseConfiguration.quantity) : 'Não informado',
    method: getPaymentMethodLabel(method),
    paidAt: paidAt
      ? new Intl.DateTimeFormat('pt-BR', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(paidAt))
      : 'Aguardando dados do Pagar.me',
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
    if (wasInterruptedByAccountDeletion(order)) {
      return {
        title: 'Jornada interrompida',
        stageTitle: getStageLabel(order),
        reason:
          'Esta jornada foi interrompida porque a remoção de conta de um usuário vinculado foi aprovada pela Nexor. As ordens foram canceladas sem gerar ressarcimento automático.'
      };
    }

    return {
      title: 'Ordem cancelada',
      stageTitle: getStageLabel(order),
      reason:
        'A ordem foi cancelada antes da continuidade operacional. Entre em contato com a Nexor para entender o motivo e avaliar os próximos passos.'
    };
  }

  return null;
}

function getSelectedClinicLocationLabel(order: DemoOrderSummary) {
  const address = getOrderClinicalPracticeLocation(order)?.address;

  if (!address) {
    return 'Localização não informada';
  }

  const streetLine = [address.street, address.number].filter(Boolean).join(', ');
  const districtLine = address.district ? ` - ${address.district}` : '';
  const cityLine = [address.city, address.state].filter(Boolean).join(' - ');
  const zipCode = address.zip_code ?? address.zipCode;

  return [streetLine ? `${streetLine}${districtLine}` : '', cityLine, zipCode]
    .filter(Boolean)
    .join(', ') || 'Localização não informada';
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
  const [clinicAction, setClinicAction] = useState('');
  const [clinicNotice, setClinicNotice] = useState('');
  const [clinicError, setClinicError] = useState('');
  const [followUpAction, setFollowUpAction] = useState<ClinicalFollowUpKind | null>(null);
  const [followUpNotice, setFollowUpNotice] = useState('');
  const [followUpError, setFollowUpError] = useState('');
  const ordersQuery = useQuery({
    queryKey: biteplanerQueryKeys.orders('user', queryOwnerId),
    queryFn: () => fetchOrders('user', token),
    enabled: Boolean(token),
    staleTime: 0,
    refetchOnMount: 'always',
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
  const selectedFormsOrder = useMemo(
    () => getEffectiveAthleteOrder(primaryOrder, workflowForms),
    [primaryOrder, workflowForms]
  );
  const clinicalFollowUpsQuery = useQuery({
    queryKey: biteplanerQueryKeys.clinicalFollowUps(selectedFormsOrder?.id ?? 'pending'),
    queryFn: () => fetchClinicalFollowUps(selectedFormsOrder!.id, token),
    enabled: Boolean(selectedFormsOrder?.id && selectedFormsOrder.status === 'completed' && token),
    staleTime: 60_000,
    refetchOnWindowFocus: false,
  });
  const clinicalFollowUps = clinicalFollowUpsQuery.data?.followUps ?? [];
  const loading = ordersQuery.isLoading || Boolean(primaryOrder?.id && workflowFormsQuery.isLoading);
  const error = ordersQuery.isError && orders.length === 0 ? 'Não foi possível carregar a jornada compartilhada agora.' : '';
  const workflowFormsError =
    workflowFormsQuery.isError && workflowForms.length === 0 && !selectedFormsOrder
      ? 'Não foi possível carregar os formulários desta ordem.'
      : '';
  const visibleAppointmentError = appointmentError ||
    (appointmentsQuery.isError && selectedFormsOrder?.status === 'in_progress' && appointments.length === 0
      ? 'Não foi possível carregar a consulta agendada desta ordem.'
      : '');
  const visibleClinicError = clinicError;
  const visibleFollowUpError = followUpError ||
    (clinicalFollowUpsQuery.isError ? 'Não foi possível carregar os retornos clínicos desta ordem.' : '');
  const currentStepIndex = selectedFormsOrder ? getCurrentStepIndex(selectedFormsOrder) : -1;
  const currentStep = currentStepIndex >= 0 ? JOURNEY_STEPS[currentStepIndex] : null;
  const currentVisualStepIndex = selectedFormsOrder
    ? selectedFormsOrder.stage === 'new_user_onboarding'
      ? 0
      : Math.max(0, currentStepIndex + 1)
    : -1;
  const currentVisualStep =
    currentVisualStepIndex >= 0 ? VISUAL_JOURNEY_STEPS[currentVisualStepIndex] ?? null : null;
  const journeyProgress = selectedFormsOrder
    ? Math.max(
        selectedFormsOrder.status === 'completed' ? 100 : 25,
        Math.round((currentVisualStepIndex / Math.max(VISUAL_JOURNEY_STEPS.length - 1, 1)) * 100)
      )
    : 0;
  const journeySummary = selectedFormsOrder ? getJourneySummary(selectedFormsOrder, currentVisualStep) : null;
  const CurrentVisualStepIcon = currentVisualStep?.icon ?? ClipboardCheck;
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
    shouldShowPaymentDetails(selectedFormsOrder)
      ? getOrderPaymentDetails(selectedFormsOrder)
      : null;
  const hasPendingUserAppointmentConfirmation = Boolean(
    selectedFormsOrder?.status === 'in_progress' &&
    initialAppointment &&
    !initialAppointment.user_confirmed_at
  );
  const selectedPracticeLocation = getOrderClinicalPracticeLocation(selectedFormsOrder);
  const selectedDentistName = getOrderClinicalDentistName(selectedFormsOrder);
  const selectedClinicLocation = selectedFormsOrder ? getSelectedClinicLocationLabel(selectedFormsOrder) : '';
  const canCancelPracticeLocationSelection = selectedFormsOrder?.status === 'awaiting_dentist_acceptance';
  const hasInterruptedPracticeLocationCancellation = Boolean(
    canCancelPracticeLocationSelection && !selectedPracticeLocation
  );

  async function handleCancelPracticeLocationSelection() {
    if (!selectedFormsOrder || !canCancelPracticeLocationSelection) {
      return;
    }

    const actionKey = `${selectedFormsOrder.id}:cancel-practice-location`;
    setClinicAction(actionKey);
    setClinicError('');
    setClinicNotice('');

    try {
      const response = await cancelPracticeLocationSelection(selectedFormsOrder.id, token);
      queryClient.setQueryData<{ orders: DemoOrderSummary[] }>(
        biteplanerQueryKeys.orders('user', queryOwnerId),
        (current) => ({
          orders: (current?.orders ?? orders).map((order) =>
            order.id === selectedFormsOrder.id ? response.order : order
          ),
        })
      );
      setClinicNotice('Clínica cancelada. A ordem voltou para seleção de clínica.');
    } catch {
      setClinicError('Não foi possível cancelar a clínica selecionada agora.');
    } finally {
      setClinicAction('');
    }
  }

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

  async function handleScheduleClinicalFollowUp(kind: ClinicalFollowUpKind) {
    if (!selectedFormsOrder) {
      return;
    }

    setFollowUpAction(kind);
    setFollowUpError('');
    setFollowUpNotice('');

    try {
      const response = await scheduleClinicalFollowUp(selectedFormsOrder.id, kind, token, {
        practiceLocationId: selectedFormsOrder.practice_location_id ?? undefined,
      });
      queryClient.setQueryData<{ orders: DemoOrderSummary[] }>(
        biteplanerQueryKeys.orders('user', queryOwnerId),
        (current) => ({
          orders: (current?.orders ?? orders).map((order) =>
            order.id === selectedFormsOrder.id ? response.order : order
          ),
        })
      );
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: biteplanerQueryKeys.appointments(selectedFormsOrder.id) }),
        queryClient.invalidateQueries({ queryKey: biteplanerQueryKeys.clinicalFollowUps(selectedFormsOrder.id) }),
      ]);
      setFollowUpNotice('Retorno clínico agendado. Após a consulta, cliente e dentista devem confirmar a realização.');
    } catch {
      setFollowUpError('Não foi possível agendar o retorno clínico agora.');
    } finally {
      setFollowUpAction(null);
    }
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

      {!loading && ordersQuery.isSuccess && !selectedFormsOrder ? (
        <S.EmptyJourneyCard data-testid="journey-empty-state">
          <S.EmptyJourneyTitle>Nenhuma jornada Biteplaner encontrada</S.EmptyJourneyTitle>
          <S.Description>
            Não encontramos pedido Biteplaner ativo para este usuário. Inicie o onboarding para criar a jornada ou
            volte ao painel para acompanhar outros dados da conta.
          </S.Description>
          <S.BannerActionLink to="/painel/biteplaner/onboarding">
            <UserRound size={16} aria-hidden />
            <span>Iniciar onboarding</span>
          </S.BannerActionLink>
        </S.EmptyJourneyCard>
      ) : null}

      {selectedFormsOrder ? (
        <S.StepFlow ref={stepFlowRef} data-testid="athlete-journey-steps">
          <S.SectionHeader>
            <S.SectionTitle as="h1">Sua jornada Biteplaner</S.SectionTitle>
            <S.Description>
              Acompanhe sua jornada em tempo real e saiba o que fazer agora para continuar.
            </S.Description>
          </S.SectionHeader>
          <S.JourneyHeroCard>
            <S.OrderSummaryGrid>
              <S.OrderSummaryContent>
                <S.OrderEyebrow>Pedido</S.OrderEyebrow>
                <S.OrderTitle>{getOrderDisplayId(selectedFormsOrder)}</S.OrderTitle>
                <S.StatusPill $tone="current">
                  <span aria-hidden />
                  {getHeroStatusLabel(selectedFormsOrder)}
                </S.StatusPill>
                <S.OrderSummaryText>{journeySummary?.text}</S.OrderSummaryText>
                <S.NextStepPreview>
                  {currentVisualStep ? (
                    <>
                      <S.NextStepPreviewIcon aria-hidden>
                        <CurrentVisualStepIcon size={22} />
                      </S.NextStepPreviewIcon>
                      <S.NextStepPreviewCopy>
                        <span>Próxima etapa</span>
                        <strong>{currentVisualStep.title}</strong>
                        <p>{currentVisualStep.description}</p>
                      </S.NextStepPreviewCopy>
                    </>
                  ) : null}
                </S.NextStepPreview>
              </S.OrderSummaryContent>
            </S.OrderSummaryGrid>
            <S.JourneyIllustration aria-hidden />
          </S.JourneyHeroCard>

          {!orderProblem && selectedFormsOrder && initialAppointment && hasPendingUserAppointmentConfirmation ? (
            <JourneyNoticeCard
              tone="warning"
              icon={<AlertTriangle size={18} />}
              title="Ação pendente do usuário"
              description='Você precisa confirmar a realização da consulta. A ação está no card "O que fazer agora?".'
              background="rgba(255, 251, 235, 0.72)"
              testId="journey-pending-user-action"
            />
          ) : null}

          {!orderProblem && selectedFormsOrder.status === 'completed' ? (
            <ClinicalFollowUpCards
              followUps={clinicalFollowUps}
              schedulingKind={followUpAction}
              onSchedule={(kind) => {
                void handleScheduleClinicalFollowUp(kind);
              }}
            />
          ) : null}

          <S.JourneyDashboardGrid>
            <S.ActionCard data-testid="journey-action-card">
              <S.ActionHeader>
                <S.ActionIcon aria-hidden>
                  <CurrentVisualStepIcon size={24} />
                </S.ActionIcon>
                <S.ActionCopy>
                  <S.CardTitle>{journeySummary?.actionTitle}</S.CardTitle>
                  <S.Description>{journeySummary?.actionText}</S.Description>
                </S.ActionCopy>
              </S.ActionHeader>
              <S.EstimateBox>
                <Clock3 size={26} aria-hidden />
                <span>Tempo estimado</span>
                <strong>{journeySummary?.estimate}</strong>
              </S.EstimateBox>
              {journeySummary?.buttonLabel ? (
                <S.PrimaryActionLink to={currentStepActionPath}>
                  <span>{journeySummary.buttonLabel}</span>
                  <ChevronRight size={18} aria-hidden />
                </S.PrimaryActionLink>
              ) : null}
              {!orderProblem && selectedFormsOrder && initialAppointment && hasPendingUserAppointmentConfirmation ? (
                <>
                  <S.Description>
                    Confirme que a consulta agendada foi realizada para que a jornada possa seguir para a validação do
                    dentista.
                  </S.Description>
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
                </>
              ) : null}
            </S.ActionCard>

            <S.OverviewCard id="visao-geral-jornada">
              <S.CardTitle>Visão geral da jornada <S.ProgressPercent>{journeyProgress}% concluído</S.ProgressPercent></S.CardTitle>
              <S.OverviewList>
                {VISUAL_JOURNEY_STEPS.map((step, index) => {
                  const tone =
                    getVisualStepTone(index, currentVisualStepIndex);
                  const StepIcon = step.icon;

                  return (
                    <S.OverviewItemGroup key={step.key}>
                      <S.OverviewItem $tone={tone} data-testid={`journey-step-${step.key}`}>
                        <S.OverviewMarker $tone={tone}>
                          {tone === 'complete' ? <Check size={12} aria-hidden /> : <StepIcon size={13} aria-hidden />}
                        </S.OverviewMarker>
                        <S.OverviewStepName>{step.title}</S.OverviewStepName>
                        <S.StatusPill $tone={tone}>
                          {tone === 'complete' ? <Check size={12} aria-hidden /> : null}
                          {getStepStatusLabel(tone)}
                        </S.StatusPill>
                      </S.OverviewItem>
                      {step.key === 'checkups' && clinicalFollowUps.length > 0 ? (
                        <S.OverviewSubList aria-label="Check-ups de adaptação">
                          {clinicalFollowUps.map((followUp) => {
                            const subTone = getClinicalFollowUpOverviewTone(followUp.status);

                            return (
                              <S.OverviewSubItem
                                key={followUp.kind}
                                $tone={subTone}
                                data-testid={`journey-checkup-${followUp.kind}`}
                              >
                                <S.OverviewSubMarker $tone={subTone}>
                                  {subTone === 'complete' ? <Check size={10} aria-hidden /> : followUp.sequence}
                                </S.OverviewSubMarker>
                                <S.OverviewStepName>{followUp.title}</S.OverviewStepName>
                                <S.StatusPill $tone={subTone}>
                                  {subTone === 'complete' ? <Check size={12} aria-hidden /> : null}
                                  {getStepStatusLabel(subTone)}
                                </S.StatusPill>
                              </S.OverviewSubItem>
                            );
                          })}
                        </S.OverviewSubList>
                      ) : null}
                    </S.OverviewItemGroup>
                  );
                })}
              </S.OverviewList>
            </S.OverviewCard>
          </S.JourneyDashboardGrid>

          {workflowFormsError ? <S.Banner role="alert">{workflowFormsError}</S.Banner> : null}
          {visibleAppointmentError ? <S.Banner role="alert">{visibleAppointmentError}</S.Banner> : null}
          {visibleClinicError ? <S.Banner role="alert">{visibleClinicError}</S.Banner> : null}
          {visibleFollowUpError ? <S.Banner role="alert">{visibleFollowUpError}</S.Banner> : null}
          {clinicNotice ? <S.Banner role="status">{clinicNotice}</S.Banner> : null}
          {followUpNotice ? <S.Banner role="status">{followUpNotice}</S.Banner> : null}
          <PendingFeedbackPrompt mode="user" orders={[selectedFormsOrder]} forms={workflowForms} />
          {!orderProblem && selectedPracticeLocation ? (
            <S.SelectedClinicCard data-testid="journey-selected-clinic">
              <S.SelectedClinicIcon aria-hidden>
                <UserRound size={22} />
              </S.SelectedClinicIcon>
              <S.SelectedClinicCopy>
                <S.SelectedClinicKicker>Clínica selecionada</S.SelectedClinicKicker>
                <S.SelectedClinicTitle>{selectedPracticeLocation.name}</S.SelectedClinicTitle>
                <S.SelectedClinicDetails aria-label="Dados da clínica selecionada">
                  <S.SelectedClinicDetail>
                    <dt>Clínica</dt>
                    <dd>{selectedPracticeLocation.name}</dd>
                  </S.SelectedClinicDetail>
                  <S.SelectedClinicDetail>
                    <dt>Profissional</dt>
                    <dd>{selectedDentistName}</dd>
                  </S.SelectedClinicDetail>
                  <S.SelectedClinicDetail>
                    <dt>Localização</dt>
                    <dd>{selectedClinicLocation}</dd>
                  </S.SelectedClinicDetail>
                </S.SelectedClinicDetails>
                <S.Description>
                  Este pedido está vinculado a esta clínica para a consulta inicial. Enquanto o dentista ainda não
                  aceitou a ordem, você pode cancelar esta seleção e escolher outra clínica.
                </S.Description>
              </S.SelectedClinicCopy>
              {canCancelPracticeLocationSelection ? (
                <S.SelectedClinicFooter>
                  <S.SecondaryActionButton
                    type="button"
                    disabled={clinicAction === `${selectedFormsOrder.id}:cancel-practice-location`}
                    onClick={() => {
                      void handleCancelPracticeLocationSelection();
                    }}
                  >
                    {clinicAction ? 'Cancelando...' : 'Cancelar consulta'}
                  </S.SecondaryActionButton>
                </S.SelectedClinicFooter>
              ) : null}
            </S.SelectedClinicCard>
          ) : null}
          {!orderProblem && hasInterruptedPracticeLocationCancellation ? (
            <S.SelectedClinicCard data-testid="journey-interrupted-clinic-selection">
              <S.SelectedClinicIcon aria-hidden>
                <UserRound size={22} />
              </S.SelectedClinicIcon>
              <S.SelectedClinicCopy>
                <S.SelectedClinicKicker>Consulta sem clínica vinculada</S.SelectedClinicKicker>
                <S.SelectedClinicTitle>Libere a escolha de clínica</S.SelectedClinicTitle>
                <S.Description>
                  A consulta anterior foi interrompida antes do aceite do dentista. Libere a ordem para escolher uma
                  nova clínica e continuar sua jornada.
                </S.Description>
              </S.SelectedClinicCopy>
              <S.SelectedClinicFooter>
                <S.SecondaryActionButton
                  type="button"
                  disabled={clinicAction === `${selectedFormsOrder.id}:cancel-practice-location`}
                  onClick={() => {
                    void handleCancelPracticeLocationSelection();
                  }}
                >
                  {clinicAction ? 'Liberando...' : 'Liberar escolha de clínica'}
                </S.SecondaryActionButton>
              </S.SelectedClinicFooter>
            </S.SelectedClinicCard>
          ) : null}
          {orderProblem && selectedFormsOrder.status === 'ineligible_reassessment' ? (
            <JourneyNoticeCard
              tone="warning"
              icon={<AlertTriangle size={18} />}
              title={orderProblem.title}
              description={orderProblem.reason}
              background="rgba(255, 251, 235, 0.72)"
              testId="journey-order-problem"
              action={
                <S.BannerActionLink to="/painel/consulta-inicial">
                  <span>Marcar uma nova consulta</span>
                </S.BannerActionLink>
              }
            />
          ) : orderProblem ? (
            <S.Banner role="alert" data-testid="journey-order-problem">
              <strong>{orderProblem.title}</strong>
              <span> {orderProblem.reason}</span>
            </S.Banner>
          ) : null}
          {!orderProblem &&
          currentStepNotice &&
          currentStepDisclaimer &&
          !paymentDetails &&
          !hasPendingUserAppointmentConfirmation ? (
            <JourneyNoticeCard
              tone={currentStepDisclaimer.tone}
              icon={currentStepDisclaimer.icon}
              title={currentStepDisclaimer.title}
              description={currentStepNotice}
              testId="journey-step-notice"
            />
          ) : null}
          {!orderProblem && paymentDetails && selectedFormsOrder.status !== 'completed' ? (
            <S.NextStepCard data-testid="journey-payment-next-step">
              <S.NextStepIcon aria-hidden>
                <CircleHelp size={24} />
              </S.NextStepIcon>
              <S.NextStepCopy>
                <S.NextStepTitle>O que acontece agora?</S.NextStepTitle>
                <S.Description>
                  Aguarde o dentista confirmar os dados operacionais. Assim que confirmado, seu caso seguirá para
                  produção no laboratório licenciado.
                </S.Description>
              </S.NextStepCopy>
            </S.NextStepCard>
          ) : null}
        </S.StepFlow>
      ) : null}

      {appointmentNotice ? (
        <SnackbarStack>
          <Snackbar
            tone="success"
            title="Consulta confirmada"
            message={appointmentNotice}
            onClose={() => {
              setAppointmentNotice('');
            }}
          />
        </SnackbarStack>
      ) : null}
    </S.Page>
  );
}
