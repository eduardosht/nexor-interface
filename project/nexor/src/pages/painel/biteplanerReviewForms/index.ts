export type BiteplanerReviewTemplateKey =
  | 'dentist_review_by_customer'
  | 'external_production_review_by_dentist'
  | 'dentist_documentation_external_review'
  | 'partner_review_by_customer'
  | 'influencer_review_by_customer';

export interface BiteplanerReviewFieldOption {
  value: number;
  label: string;
}

export interface BiteplanerReviewFieldDefinition {
  key: string;
  label: string;
  required: boolean;
  type: 'score' | 'textarea';
  helpText?: string;
  minLabel?: string;
  maxLabel?: string;
  options?: BiteplanerReviewFieldOption[];
}

export interface BiteplanerReviewTemplateDefinition {
  key: BiteplanerReviewTemplateKey;
  label: string;
  actorMode: 'user' | 'dentist' | 'admin';
  enabled: boolean;
  fields: BiteplanerReviewFieldDefinition[];
}

export interface BiteplanerReviewMomentDefinition {
  templateKey: BiteplanerReviewTemplateKey;
  title: string;
  promptTitle: string;
  actor: 'Cliente' | 'Dentista' | 'Fornecedor externo' | 'Operação Nexor';
  moment: string;
  priority: number;
}

export interface PendingReviewOpportunity {
  id: string;
  orderId: string;
  formId: string;
  templateKey: BiteplanerReviewTemplateKey;
  actorMode: BiteplanerReviewTemplateDefinition['actorMode'];
  title: string;
  context: string;
  route: string;
  releasedAt: string;
  priority: number;
}

type ReviewOpportunityOrder = {
  id: string;
  displayId?: string;
  display_number?: number | string | null;
  displayNumber?: number | string | null;
  customer?: { full_name?: string | null } | null;
  dentist?: { full_name?: string | null } | null;
  practice_location?: { name?: string | null } | null;
};

type ReviewOpportunityForm = {
  id: string;
  orderId: string;
  templateKey: string;
  status: string;
  releasedAt: string;
};

export const FEEDBACK_PROMPT_SUPPRESSION_TTL_MS = 1000 * 60 * 60 * 24;

export function getFeedbackPromptSuppressionKey(formId: string) {
  return `biteplaner-feedback-prompt-dismissed:${formId}`;
}

export function getFeedbackPromptSuppressionExpiresAt(now = Date.now()) {
  return String(now + FEEDBACK_PROMPT_SUPPRESSION_TTL_MS);
}

export function isFeedbackPromptSuppressed(value: string | null | undefined, now = Date.now()) {
  if (!value) {
    return false;
  }

  const expiresAt = Number(value);
  return Number.isFinite(expiresAt) && expiresAt > now;
}

const scoreOptions = Array.from({ length: 5 }, (_, index) => {
  const value = index + 1;

  return {
    value,
    label: String(value)
  };
});

export const BITEPLANER_REVIEW_TEMPLATES: Record<
  BiteplanerReviewTemplateKey,
  BiteplanerReviewTemplateDefinition
> = {
  external_production_review_by_dentist: {
    key: 'external_production_review_by_dentist',
    label: 'Dentista avaliando produção externa',
    actorMode: 'dentist',
    enabled: true,
    fields: [
      {
        key: 'deliveryLeadTime',
        label: 'Nota - Prazo de entrega definido',
        required: true,
        type: 'score',
        minLabel: '1 = Muito longo',
        maxLabel: '5 = Muito rápido',
        options: scoreOptions
      },
      {
        key: 'rawDeviceQuality',
        label: 'Nota - Qualidade técnica do dispositivo bruto entregue',
        required: true,
        type: 'score',
        helpText: 'Avalie precisão dimensional, acabamento, ausência de rebarbas e aderência ao pedido técnico.',
        minLabel: '1 = Muito ruim',
        maxLabel: '5 = Muito boa',
        options: scoreOptions
      },
      {
        key: 'contactEase',
        label: 'Nota - Facilidade de contato',
        required: false,
        type: 'score',
        minLabel: '1 = Muito dificil',
        maxLabel: '5 = Muito facil',
        options: scoreOptions
      },
      {
        key: 'comment',
        label: 'Comentário',
        required: false,
        type: 'textarea',
        helpText: 'Limite de 500 caracteres. Não inclua dados pessoais de pacientes, terceiros ou informações sensíveis.'
      }
    ]
  },
  dentist_documentation_external_review: {
    key: 'dentist_documentation_external_review',
    label: 'Registro externo sobre documentação do dentista',
    actorMode: 'admin',
    enabled: false,
    fields: [
      {
        key: 'scanFileQuality',
        label: 'Nota - Qualidade do arquivo de escaneamento 3D intraoral enviado',
        required: true,
        type: 'score',
        minLabel: '1 = Muito ruim',
        maxLabel: '5 = Muito boa',
        options: scoreOptions
      },
      {
        key: 'contactEase',
        label: 'Nota - Facilidade de contato',
        required: false,
        type: 'score',
        minLabel: '1 = Muito dificil',
        maxLabel: '5 = Muito facil',
        options: scoreOptions
      },
      {
        key: 'comment',
        label: 'Comentário técnico',
        required: false,
        type: 'textarea',
        helpText: 'Foque em arquivo, contato e operação. Não inclua nome, contato, documento ou dado de saúde de pacientes.'
      }
    ]
  },
  dentist_review_by_customer: {
    key: 'dentist_review_by_customer',
    label: 'Cliente avaliando dentista',
    actorMode: 'user',
    enabled: true,
    fields: [
      {
        key: 'contactEase',
        label: 'Nota - Facilidade de contato',
        required: true,
        type: 'score',
        minLabel: '1 = Muito dificil',
        maxLabel: '5 = Muito facil',
        options: scoreOptions
      },
      {
        key: 'consultationLeadTime',
        label: 'Nota - Prazo para a consulta',
        required: true,
        type: 'score',
        minLabel: '1 = Muito longo',
        maxLabel: '5 = Muito rápido',
        options: scoreOptions
      },
      {
        key: 'punctuality',
        label: 'Nota - Pontualidade no atendimento',
        required: true,
        type: 'score',
        minLabel: '1 = Muito ruim',
        maxLabel: '5 = Muito boa',
        options: scoreOptions
      },
      {
        key: 'officeFacilities',
        label: 'Nota - Qualidade das instalações do consultório',
        required: true,
        type: 'score',
        helpText: 'Avalie limpeza, organizacao, privacidade, acessibilidade e estrutura percebida.',
        minLabel: '1 = Muito ruim',
        maxLabel: '5 = Muito boa',
        options: scoreOptions
      },
      {
        key: 'courtesy',
        label: 'Nota - Gentileza no atendimento',
        required: true,
        type: 'score',
        minLabel: '1 = Muito ruim',
        maxLabel: '5 = Muito boa',
        options: scoreOptions
      },
      {
        key: 'deviceUseAndAdjustmentGuidance',
        label: 'Nota - Qualidade da orientacao para uso e ajustes',
        required: true,
        type: 'score',
        minLabel: '1 = Muito ruim',
        maxLabel: '5 = Muito boa',
        options: scoreOptions
      },
      {
        key: 'comment',
        label: 'Comentário',
        required: false,
        type: 'textarea',
        helpText: 'Limite de 500 caracteres. Não inclua dados pessoais de terceiros ou informações sensíveis.'
      }
    ]
  },
  partner_review_by_customer: {
    key: 'partner_review_by_customer',
    label: 'Cliente avaliando parceiro indicador',
    actorMode: 'user',
    enabled: true,
    fields: [
      {
        key: 'facilities',
        label: 'Nota - Instalações, quando o parceiro for instituição de treinamento',
        required: false,
        type: 'score',
        helpText: 'Use apenas para academia ou instituição de treinamento; para coach independente, deixe em branco.',
        minLabel: '1 = Muito ruim',
        maxLabel: '5 = Muito boa',
        options: scoreOptions
      },
      {
        key: 'courtesy',
        label: 'Nota - Gentileza no atendimento',
        required: true,
        type: 'score',
        minLabel: '1 = Muito ruim',
        maxLabel: '5 = Muito boa',
        options: scoreOptions
      },
      {
        key: 'followUpAvailability',
        label: 'Nota - Disponibilidade, presença e atenção no acompanhamento',
        required: true,
        type: 'score',
        minLabel: '1 = Muito ruim',
        maxLabel: '5 = Muito boa',
        options: scoreOptions
      },
      {
        key: 'technicalGuidance',
        label: 'Nota - Qualidade técnica no direcionamento',
        required: true,
        type: 'score',
        minLabel: '1 = Muito ruim',
        maxLabel: '5 = Muito boa',
        options: scoreOptions
      },
      {
        key: 'comment',
        label: 'Comentário',
        required: false,
        type: 'textarea',
        helpText: 'Limite de 500 caracteres. Não inclua dados pessoais de terceiros ou informações sensíveis.'
      }
    ]
  },
  influencer_review_by_customer: {
    key: 'influencer_review_by_customer',
    label: 'Cliente avaliando influencer',
    actorMode: 'user',
    enabled: false,
    fields: [
      {
        key: 'communicationClarity',
        label: 'Nota - Clareza na comunicação sobre Nexor, Biteplaner e processo',
        required: true,
        type: 'score',
        minLabel: '1 = Muito ruim',
        maxLabel: '5 = Muito boa',
        options: scoreOptions
      },
      {
        key: 'comment',
        label: 'Comentário',
        required: false,
        type: 'textarea',
        helpText: 'Limite de 500 caracteres. Não inclua dados pessoais de terceiros ou informações sensíveis.'
      }
    ]
  }
};

export const BITEPLANER_REVIEW_MOMENTS: Record<BiteplanerReviewTemplateKey, BiteplanerReviewMomentDefinition> = {
  partner_review_by_customer: {
    templateKey: 'partner_review_by_customer',
    title: 'Cliente avalia parceiro indicador',
    promptTitle: 'Avalie o parceiro indicador',
    actor: 'Cliente',
    moment:
      'Após o primeiro cadastro na Nexor feito por link de recomendação/link de parceiro, antes de depender da ordem avançar.',
    priority: 80,
  },
  dentist_review_by_customer: {
    templateKey: 'dentist_review_by_customer',
    title: 'Cliente avalia dentista',
    promptTitle: 'Avalie o atendimento do dentista',
    actor: 'Cliente',
    moment:
      'Após consulta de adaptação/entrega do dispositivo, quando o cliente já consegue avaliar atendimento, prazo, consultório e ajuste.',
    priority: 90,
  },
  external_production_review_by_dentist: {
    templateKey: 'external_production_review_by_dentist',
    title: 'Dentista avalia produção externa',
    promptTitle: 'Avalie a produção externa',
    actor: 'Dentista',
    moment:
      'Após a operação Nexor registrar a produção externa concluída e o dentista receber ou validar o dispositivo entregue.',
    priority: 90,
  },
  dentist_documentation_external_review: {
    templateKey: 'dentist_documentation_external_review',
    title: 'Registro externo sobre documentação do dentista',
    promptTitle: 'Registrar retorno externo sobre documentação',
    actor: 'Operação Nexor',
    moment:
      'Quando a operação Nexor recebe retorno externo sobre arquivo 3D intraoral, documentação técnica e facilidade de contato.',
    priority: 85,
  },
  influencer_review_by_customer: {
    templateKey: 'influencer_review_by_customer',
    title: 'Cliente avalia influencer',
    promptTitle: 'Avalie a comunicação do influencer',
    actor: 'Cliente',
    moment: 'Futuro feedback de campanhas ou indicações com influencer.',
    priority: 40,
  },
};

function getOrderDisplayLabel(order: ReviewOpportunityOrder | undefined) {
  if (!order) {
    return 'ordem Biteplaner';
  }

  return String(order.displayId ?? order.display_number ?? order.displayNumber ?? order.id);
}

function getPendingReviewContext(templateKey: BiteplanerReviewTemplateKey, order: ReviewOpportunityOrder | undefined) {
  const orderLabel = getOrderDisplayLabel(order);

  if (templateKey === 'partner_review_by_customer') {
    return 'Cadastro via link de recomendação do parceiro';
  }

  if (templateKey === 'dentist_review_by_customer') {
    return `Ordem ${orderLabel} | feedback pós-atendimento`;
  }

  if (templateKey === 'external_production_review_by_dentist') {
    return `Ordem ${orderLabel} | produção externa conduzida pela Nexor`;
  }

  if (templateKey === 'dentist_documentation_external_review') {
    return `Ordem ${orderLabel} | dentista ${order?.dentist?.full_name ?? 'responsável'}`;
  }

  return `Ordem ${orderLabel} | feedback operacional`;
}

function isActivePendingReviewForm(form: ReviewOpportunityForm) {
  return form.status !== 'submitted' && form.status !== 'cancelled' && form.status !== 'superseded';
}

export function getPendingReviewOpportunities({
  mode,
  forms,
  orders,
  suppressedFormIds = new Set<string>(),
}: {
  mode: 'user' | 'partner' | 'dentist' | 'admin';
  forms: ReviewOpportunityForm[];
  orders: ReviewOpportunityOrder[];
  suppressedFormIds?: Set<string>;
}) {
  if (mode === 'admin' || mode === 'partner') {
    return [];
  }

  const ordersById = new Map(orders.map((order) => [order.id, order]));

  return forms
    .flatMap<PendingReviewOpportunity>((form) => {
      const templateKey = form.templateKey as BiteplanerReviewTemplateKey;
      const template = BITEPLANER_REVIEW_TEMPLATES[templateKey];
      const moment = BITEPLANER_REVIEW_MOMENTS[templateKey];

      if (!template || !moment || !template.enabled || template.actorMode !== mode || !isActivePendingReviewForm(form)) {
        return [];
      }

      if (suppressedFormIds.has(form.id)) {
        return [];
      }

      const order = ordersById.get(form.orderId);
      const route = `/painel/biteplaner/avaliacoes?mode=${mode}&surveyId=${encodeURIComponent(form.id)}`;

      return [{
        id: form.id,
        orderId: form.orderId,
        formId: form.id,
        templateKey,
        actorMode: template.actorMode,
        title: moment.promptTitle,
        context: getPendingReviewContext(templateKey, order),
        route,
        releasedAt: form.releasedAt,
        priority: moment.priority,
      }];
    })
    .sort((left, right) => {
      if (left.priority !== right.priority) {
        return right.priority - left.priority;
      }

      return new Date(right.releasedAt).getTime() - new Date(left.releasedAt).getTime();
    });
}
