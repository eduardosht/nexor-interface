export type WorkflowFormActorRole = 'user' | 'dentist' | 'admin';
export type SharedIntakeOwnerRole = 'user' | 'dentist';
export type SharedIntakeEditableWhen = 'customer_intake' | 'dentist_review';

export type SharedIntakeFieldType =
  | 'text'
  | 'textarea'
  | 'select'
  | 'number'
  | 'score'
  | 'checkbox-group';

export type SharedIntakeFieldOption = {
  value: string | number;
  label: string;
};

export type SharedIntakeFieldDefinition = {
  key: string;
  label: string;
  required: boolean;
  type: SharedIntakeFieldType;
  ownerRole: SharedIntakeOwnerRole;
  visibleTo: WorkflowFormActorRole[];
  editableWhen: SharedIntakeEditableWhen;
  helpText?: string;
  options?: SharedIntakeFieldOption[];
  min?: number;
  max?: number;
};

export type SharedIntakeSectionDefinition = {
  key: string;
  title: string;
  description?: string;
  fields: SharedIntakeFieldDefinition[];
};

export type SharedIntakeDefinition = {
  label: string;
  description: string;
  sections: SharedIntakeSectionDefinition[];
};

const yesNoOptions = [
  { value: 'no', label: 'Não' },
  { value: 'yes', label: 'Sim' },
];

const frequencyOptions = [
  { value: 'never', label: 'Nunca' },
  { value: 'occasional', label: 'Ocasionalmente' },
  { value: 'frequent', label: 'Frequentemente' },
];

const scoreOptions = Array.from({ length: 11 }, (_, value) => ({
  value,
  label: String(value),
}));

const userVisible: WorkflowFormActorRole[] = ['user', 'dentist', 'admin'];
const customerConsentVisible: WorkflowFormActorRole[] = ['user', 'admin'];
const dentistVisible: WorkflowFormActorRole[] = ['dentist', 'admin'];

export const SHARED_INITIAL_EVALUATION_INTAKE: SharedIntakeDefinition = {
  label: 'Avaliação inicial compartilhada Biteplaner',
  description:
    'Intake pré-consulta preenchido pelo cliente e complementado pelo dentista licenciado após a consulta.',
  sections: [
    {
      key: 'identification',
      title: 'Perfil e saúde',
      fields: [
        {
          key: 'fullName',
          label: 'Nome completo',
          required: true,
          type: 'text',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
        },
        {
          key: 'phone',
          label: 'Telefone',
          required: true,
          type: 'text',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
        },
        {
          key: 'sportRoutine',
          label: 'Modalidade principal',
          required: true,
          type: 'text',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
        },
        {
          key: 'hasRelevantMedicalDiagnosis',
          label: 'Possui algum diagnóstico médico prévio relevante?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'relevantMedicalDiagnosisDetails',
          label: 'Quais diagnósticos ou condições?',
          required: false,
          type: 'textarea',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
        },
        {
          key: 'currentMedicationUse',
          label: 'Faz uso atual de medicamentos?',
          required: false,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'sleepQualityScore',
          label: 'Qualidade do sono (0 a 10)',
          required: false,
          type: 'number',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 10,
        },
        {
          key: 'hasTmdDiagnosis',
          label: 'Já recebeu diagnóstico de DTM?',
          required: false,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'usesOrthodonticAppliance',
          label: 'Usa atualmente aparelho ortodôntico?',
          required: false,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'hasDentalProsthesis',
          label: 'Usa prótese ou elemento dentário relevante?',
          required: false,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
      ],
    },
    {
      key: 'pain-symptoms',
      title: 'Dor e função',
      fields: [
        {
          key: 'hasCurrentPain',
          label: 'Presença de dor atualmente',
          required: false,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'painLocations',
          label: 'Localização da dor',
          required: false,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'ear_atm', label: 'Região do ouvido / ATM' },
            { value: 'temples', label: 'Têmporas' },
            { value: 'jaw', label: 'Mandíbula' },
            { value: 'masseter', label: 'Masseter / bochechas' },
            { value: 'neck', label: 'Pescoço' },
            { value: 'shoulders', label: 'Ombros' },
          ],
        },
        {
          key: 'averagePainLastWeek',
          label: 'Intensidade média de dor na última semana',
          required: false,
          type: 'score',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 10,
          options: scoreOptions,
        },
        {
          key: 'hasMouthOpeningDifficulty',
          label: 'Sente dificuldade para abrir a boca completamente?',
          required: false,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'jointClickFrequency',
          label: 'Percepção de estálos/cliques na ATM',
          required: false,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: frequencyOptions,
        },
      ],
    },
    {
      key: 'training-impact',
      title: 'Treino e expectativas',
      fields: [
        {
          key: 'trainingJawTensionMoment',
          label: 'Em quais momentos do treino sente maior tensão em mandíbula/pescoço?',
          required: false,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'near_failure', label: 'Próximo da exaustão/falha muscular' },
            { value: 'heavy_lifts', label: 'Grandes levantamentos' },
            { value: 'hiit', label: 'Treinos de alta intensidade' },
            { value: 'all_training', label: 'Em todo o treino' },
          ],
        },
        {
          key: 'missedTrainingDuePain',
          label: 'Treinos perdidos por dor nos últimos 3 meses',
          required: false,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'none', label: 'Nenhum' },
            { value: '1_3', label: '1 a 3' },
            { value: '4_8', label: '4 a 8' },
            { value: 'more_than_8', label: 'Mais de 8' },
          ],
        },
        {
          key: 'nicotineUse',
          label: 'Nicotina',
          required: false,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'none', label: 'Não fuma' },
            { value: 'sporadic', label: 'Fuma esporadicamente' },
            { value: 'daily', label: 'Fuma diariamente' },
          ],
        },
        {
          key: 'stressLevel',
          label: 'Nível de estresse percebido (0 a 10)',
          required: false,
          type: 'score',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 10,
          options: scoreOptions,
        },
        {
          key: 'biteplanerDiscoverySource',
          label: 'Como conheceu inicialmente o Biteplaner?',
          required: false,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'friend', label: 'Amigo ou conhecido' },
            { value: 'coach', label: 'Instrutor, coach ou treinador' },
            { value: 'dentist', label: 'Dentista' },
            { value: 'event', label: 'Evento ou representante Nexor' },
            { value: 'social', label: 'Redes sociais' },
            { value: 'search', label: 'Pesquisa na internet' },
          ],
        },
        {
          key: 'initialMotivation',
          label: 'Motivação inicial para buscar o Biteplaner',
          required: false,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'prevention', label: 'Prevenção' },
            { value: 'performance', label: 'Performance' },
            { value: 'curiosity', label: 'Curiosidade' },
            { value: 'recommendation', label: 'Recomendação de terceiros' },
            { value: 'pain', label: 'Dor' },
          ],
        },
        {
          key: 'expectedUseBenefit',
          label: 'Expectativa com o uso durante o treino',
          required: false,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'pain_reduction', label: 'Redução de dor' },
            { value: 'injury_prevention', label: 'Prevenção de lesões' },
            { value: 'performance', label: 'Melhorar performance' },
            { value: 'training_continuity', label: 'Evitar interrupções nos treinos' },
            { value: 'jaw_control', label: 'Melhor controle de apertamento mandibular' },
          ],
        },
      ],
    },
    {
      key: 'biteplaner-consents',
      title: 'Consentimentos',
      fields: [
        {
          key: 'serviceConsent',
          label: 'Consentimento operacional obrigatório',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: customerConsentVisible,
          editableWhen: 'customer_intake',
          options: [
            {
              value: 'accepted',
              label:
                'Tratamento necessário para inscrição, triagem, segurança da jornada e liberação da consulta inicial.',
            },
          ],
        },
        {
          key: 'sensitiveHealthConsent',
          label: 'Consentimento de dados sensíveis obrigatório',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: customerConsentVisible,
          editableWhen: 'customer_intake',
          options: [
            {
              value: 'accepted',
              label:
                'Tratamento de dados sensíveis de saúde/odontologia para avaliação do Biteplaner, com acesso restrito.',
            },
          ],
        },
        {
          key: 'researchConsent',
          label: 'Pesquisa e P&D',
          required: false,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: customerConsentVisible,
          editableWhen: 'customer_intake',
          options: [
            {
              value: 'accepted',
              label: 'Autorizo uso em pesquisa e P&D em formato agregado, anonimizado ou pseudonimizado.',
            },
          ],
        },
        {
          key: 'marketingConsent',
          label: 'Comunicações Nexor e Biteplaner',
          required: false,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: customerConsentVisible,
          editableWhen: 'customer_intake',
          options: [
            {
              value: 'accepted',
              label:
                'Autorizo comunicações comerciais e educativas sobre Nexor e Biteplaner. Revogável a qualquer momento.',
            },
          ],
        },
      ],
    },
    {
      key: 'dentist-complement',
      title: 'Complemento do dentista',
      description: 'Campos preenchidos pelo dentista licenciado após a consulta.',
      fields: [
        {
          key: 'painlessMaxOpeningMm',
          label: 'Abertura máxima sem dor (mm)',
          required: false,
          type: 'number',
          ownerRole: 'dentist',
          visibleTo: dentistVisible,
          editableWhen: 'dentist_review',
        },
        {
          key: 'painfulMaxOpeningMm',
          label: 'Abertura máxima com dor (mm)',
          required: false,
          type: 'number',
          ownerRole: 'dentist',
          visibleTo: dentistVisible,
          editableWhen: 'dentist_review',
        },
        {
          key: 'clinicalSectionNotes',
          label: 'Observações clínicas por seção',
          required: false,
          type: 'textarea',
          ownerRole: 'dentist',
          visibleTo: dentistVisible,
          editableWhen: 'dentist_review',
        },
        {
          key: 'initialEvaluationSummary',
          label: 'Síntese da avaliação inicial',
          required: true,
          type: 'textarea',
          ownerRole: 'dentist',
          visibleTo: dentistVisible,
          editableWhen: 'dentist_review',
        },
        {
          key: 'clinicalDecisionAttentionPoints',
          label: 'Pontos de atenção para decisão clínica',
          required: false,
          type: 'textarea',
          ownerRole: 'dentist',
          visibleTo: dentistVisible,
          editableWhen: 'dentist_review',
        },
      ],
    },
  ],
};

export function getSharedIntakeFields() {
  return SHARED_INITIAL_EVALUATION_INTAKE.sections.flatMap((section) => section.fields);
}

export function getSharedIntakePayloadKey(actorRole: WorkflowFormActorRole) {
  return actorRole === 'dentist' ? 'dentist' : 'customer';
}
