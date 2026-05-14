export type BiteplanerReviewTemplateKey =
  | 'dentist_review_by_customer'
  | 'lab_review_by_dentist'
  | 'dentist_review_by_lab'
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
  actorMode: 'user' | 'dentist' | 'lab';
  enabled: boolean;
  fields: BiteplanerReviewFieldDefinition[];
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
  lab_review_by_dentist: {
    key: 'lab_review_by_dentist',
    label: 'Dentista avaliando laboratório',
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
  dentist_review_by_lab: {
    key: 'dentist_review_by_lab',
    label: 'Laboratório avaliando dentista',
    actorMode: 'lab',
    enabled: true,
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
