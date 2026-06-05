export type WorkflowFormActorRole = 'user' | 'dentist' | 'admin';
export type SharedIntakeOwnerRole = 'user' | 'dentist';
export type SharedIntakeEditableWhen = 'customer_intake' | 'dentist_review';

export type SharedIntakeFieldType =
  | 'text'
  | 'date'
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
  displayAs?: 'radio';
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

const consentOption = [
  { value: 'accepted', label: 'Aceito' },
];

const frequencyOptions = [
  { value: 'never', label: 'Nunca' },
  { value: 'occasional', label: 'Ocasionalmente' },
  { value: 'frequent', label: 'Frequentemente' },
];

const scoreOptions = Array.from({ length: 10 }, (_, index) => {
  const value = index + 1;
  return {
    value,
    label: String(value),
  };
});

const scoreZeroToTenOptions = Array.from({ length: 11 }, (_, index) => ({
  value: index,
  label: String(index),
}));

const sportOptions = [
  { value: 'gym', label: 'Academia' },
  { value: 'basketball', label: 'Basquete' },
  { value: 'boxing', label: 'Boxe' },
  { value: 'capoeira', label: 'Capoeira' },
  { value: 'cycling', label: 'Ciclismo' },
  { value: 'running', label: 'Corrida' },
  { value: 'crossfit', label: 'Crossfit' },
  { value: 'soccer', label: 'Futebol' },
  { value: 'jiu_jitsu', label: 'Jiu-jitsu' },
  { value: 'judo', label: 'Judô' },
  { value: 'karate', label: 'Karatê' },
  { value: 'kung_fu', label: 'Kung Fu' },
  { value: 'mtb', label: 'MTB' },
  { value: 'muay_thai', label: 'Muay Thai' },
  { value: 'strength_training', label: 'Musculação' },
  { value: 'swimming', label: 'Natação' },
  { value: 'pilates', label: 'Pilates' },
  { value: 'rowing', label: 'Remo' },
  { value: 'spinning', label: 'Spinning' },
  { value: 'tennis', label: 'Tênis' },
  { value: 'trail_running', label: 'Trail Running' },
  { value: 'volleyball', label: 'Voleibol' },
  { value: 'yoga', label: 'Yoga' },
  { value: 'other', label: 'Outro' },
];

const trainingExperienceOptions = [
  { value: 'less_than_3_months', label: 'Menos de 3 meses' },
  { value: '3_to_6_months', label: '3 a 6 meses' },
  { value: '6_months_to_1_year', label: '6 meses a 1 ano' },
  { value: '1_to_2_years', label: '1 a 2 anos' },
  { value: '2_to_5_years', label: '2 a 5 anos' },
  { value: '5_to_10_years', label: '5 a 10 anos' },
  { value: '10_to_20_years', label: '10 a 20 anos' },
  { value: 'more_than_20_years', label: 'Mais de 20 anos' },
];

const trainingLocationOptions = [
  { value: 'gym', label: 'Academia' },
  { value: 'training_center', label: 'Centro de Treinamento' },
  { value: 'studio', label: 'Estúdio' },
  { value: 'outdoor', label: 'Outdoor' },
  { value: 'home', label: 'Em casa' },
  { value: 'other', label: 'Outro' },
];

const trainingSupportOptions = [
  { value: 'instructor_or_coach', label: 'Instrutor/coach' },
  { value: 'personal_trainer', label: 'Personal trainer' },
  { value: 'physiotherapist', label: 'Fisioterapeuta' },
  { value: 'doctor', label: 'Médico' },
  { value: 'self_guided', label: 'Eu mesmo' },
  { value: 'other', label: 'Outro' },
];

const accessoryOptions = [
  { value: 'gloves', label: 'Luvas' },
  { value: 'straps', label: 'Straps' },
  { value: 'wrist_wraps', label: 'Munhequeira' },
  { value: 'knee_pads', label: 'Joelheiras' },
  { value: 'shin_guards', label: 'Caneleira' },
  { value: 'elbow_pads', label: 'Cotoveleiras' },
  { value: 'mouthguards', label: 'Protetores bucais' },
  { value: 'lifting_belt', label: 'Cinta lombar' },
  { value: 'helmet', label: 'Capacete' },
  { value: 'body_protectors', label: 'Protetores corporais' },
  { value: 'sensor_watch', label: 'Relógios sensores' },
  { value: 'wearables', label: 'Gadgets/wearables' },
  { value: 'wraps_or_tapes', label: 'Faixas/bandagens articulares, musculares, mãos, pés' },
  { value: 'other', label: 'Outro' },
];

const incomeRangeOptions = [
  { value: 'up_to_2000', label: 'Até R$ 2.000' },
  { value: '2001_5000', label: 'R$ 2.001 a R$ 5.000' },
  { value: '5001_10000', label: 'R$ 5.001 a R$ 10.000' },
  { value: '10001_20000', label: 'R$ 10.001 a R$ 20.000' },
  { value: 'above_20000', label: 'Acima de R$ 20.000' },
  { value: 'prefer_not_to_answer', label: 'Prefiro não informar' },
];

const trainingGoalOptions = [
  { value: 'performance', label: 'Melhorar performance' },
  { value: 'strength', label: 'Aumentar força' },
  { value: 'endurance', label: 'Aumentar resistência' },
  { value: 'health', label: 'Melhorar saúde' },
  { value: 'weight_loss', label: 'Emagrecimento' },
  { value: 'injury_prevention', label: 'Prevenir lesões' },
  { value: 'return_to_sport', label: 'Retornar aos treinos/competições' },
  { value: 'wellbeing', label: 'Bem-estar' },
  { value: 'other', label: 'Outro' },
];

const workImpactOptions = [
  { value: 'not_working', label: 'Não trabalho atualmente' },
  { value: 'does_not_affect', label: 'Não afeta' },
  { value: 'affects_a_little', label: 'Afeta um pouco' },
  { value: 'affects_a_lot', label: 'Afeta muito' },
];

const referralLikelihoodOptions = [
  { value: 'definitely_more_than_5', label: 'Sim, indicaria para mais de 5 pessoas' },
  { value: 'probably_yes', label: 'Provavelmente sim' },
  { value: 'maybe', label: 'Talvez' },
  { value: 'probably_not', label: 'Provavelmente não' },
];

const userVisible: WorkflowFormActorRole[] = ['user', 'dentist', 'admin'];
const customerConsentVisible: WorkflowFormActorRole[] = ['user', 'admin'];
const dentistVisible: WorkflowFormActorRole[] = ['dentist', 'admin'];

export const SHARED_INITIAL_EVALUATION_INTAKE: SharedIntakeDefinition = {
  label: 'Formulário clínico Biteplaner',
  description:
    'Pré-consulta clínica compartilhada entre cliente e dentista licenciado para cuidado odontológico/orofacial e planejamento do Biteplaner.',
  sections: [
    {
      key: 'clinical-privacy',
      title: 'Política de privacidade',
      description:
        'A NEXOR desenvolve pesquisas científicas e dispositivos técnicos personalizados para auxiliar atletas de elite e pessoas como você a treinarem com mais conforto, segurança, performance, consistência, saúde e longevidade.\n\nEste formulário é seu primeiro passo para o time de especialistas projetar seu dispositivo personalizado.\n\n* Indica uma pergunta obrigatória.',
      fields: [
        {
          key: 'clinicalPrivacyConsent',
          label:
            'Declaro que li e entendi a Política de Privacidade da NEXOR e concordo com o tratamento dos meus dados pessoais, incluindo dados de saúde quando informados, para viabilizar meu atendimento clínico e uso dos serviços/dispositivos NEXOR; registrar informações clínicas necessárias para meu cuidado odontológico e orofacial; e formar bases de dados, preferencialmente anonimizadas, para análise, pesquisa e desenvolvimento de produtos, sempre de acordo com a LGPD.',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: customerConsentVisible,
          editableWhen: 'customer_intake',
          helpText:
            'Você pode solicitar acesso, correção ou exclusão de dados excessivos, bem como revogar consentimento para comunicações não essenciais nos canais indicados na Política de Privacidade.',
          options: consentOption,
        },
      ],
    },
    {
      key: 'initial-data',
      title: 'SEÇÃO 1 - DADOS INICIAIS',
      description:
        'Dados do cadastro e triagem inicial usados para preparar a pré-consulta. Informações já existentes devem vir pré-preenchidas; valores salvos pelo usuário prevalecem.',
      fields: [
        {
          key: 'orthodonticTreatmentStatus',
          label: 'Está em tratamento ortodôntico?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          helpText:
            'Tratamento ortodôntico em fase ativa impede a continuidade: não é possível continuar o processo antes do encerramento da fase ativa.',
          options: [
            { value: 'none', label: 'Não' },
            { value: 'active', label: 'Sim, ainda em tratamento ativo' },
            { value: 'retention', label: 'Sim, já em fase de contenção' },
          ],
        },
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
          key: 'ageYears',
          label: 'Idade (anos)',
          required: false,
          type: 'number',
          ownerRole: 'user',
          visibleTo: dentistVisible,
          editableWhen: 'customer_intake',
          helpText: 'Campo calculado internamente com base na data de nascimento do cadastro. Somente visualização para o dentista.',
        },
        {
          key: 'currentSports',
          label: 'Esportes/atividades atuais',
          required: false,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: dentistVisible,
          editableWhen: 'customer_intake',
          helpText: 'Replicado do cadastro do cliente. Somente visualização para o dentista.',
          options: sportOptions,
        },
        {
          key: 'bodyMassKg',
          label: 'Massa corporal (kg)',
          required: false,
          type: 'number',
          ownerRole: 'user',
          visibleTo: dentistVisible,
          editableWhen: 'customer_intake',
          helpText: 'Replicado do cadastro do cliente. Somente visualização para o dentista.',
        },
        {
          key: 'heightMeters',
          label: 'Altura (m)',
          required: false,
          type: 'number',
          ownerRole: 'user',
          visibleTo: dentistVisible,
          editableWhen: 'customer_intake',
          helpText: 'Replicado do cadastro do cliente. Somente visualização para o dentista.',
        },
        {
          key: 'needsAdaptedClinic',
          label: 'Necessita de atendimento em clínica adaptada?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          helpText:
            'Quando marcado como sim, a etapa de seleção deve priorizar dentistas/clínicas cadastrados com estrutura adaptada.',
          options: yesNoOptions,
        },
        {
          key: 'evaluationDate',
          label: 'Data da avaliação',
          required: false,
          type: 'text',
          ownerRole: 'dentist',
          visibleTo: dentistVisible,
          editableWhen: 'dentist_review',
        },
        {
          key: 'dentistName',
          label: 'Nome do dentista',
          required: false,
          type: 'text',
          ownerRole: 'dentist',
          visibleTo: dentistVisible,
          editableWhen: 'dentist_review',
        },
        {
          key: 'dentistCro',
          label: 'CRO/Estado',
          required: false,
          type: 'text',
          ownerRole: 'dentist',
          visibleTo: dentistVisible,
          editableWhen: 'dentist_review',
        },
        {
          key: 'dentistProfessionalContact',
          label: 'Contato profissional do dentista',
          required: false,
          type: 'text',
          ownerRole: 'dentist',
          visibleTo: dentistVisible,
          editableWhen: 'dentist_review',
        },
      ],
    },
    {
      key: 'medical-history',
      title: 'SEÇÃO 2 - DADOS CLÍNICOS PARA SEU CUIDADO',
      description:
        'Histórico médico geral. Essas informações são usadas principalmente pelo dentista e pela equipe de saúde para cuidar de você. Parte dos dados poderá ser utilizada, em formato agregado e/ou anonimizado, em estudos observacionais de prevenção atlética orofacial.',
      fields: [
        {
          key: 'hasRelevantMedicalDiagnosis',
          label: 'Possui algum diagnóstico médico prévio relevante?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          helpText:
            'Exemplo: hipertensão, diabetes, doenças reumatológicas, fibromialgia, ansiedade, depressão, sono, bruxismo, apneia, enxaqueca/cefaleia crônica.',
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
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          helpText:
            'Inclui analgésicos, anti-inflamatórios, relaxantes musculares, ansiolíticos, antidepressivos, sono, anticonvulsivantes etc.',
          options: yesNoOptions,
        },
        {
          key: 'currentMedicationDetails',
          label: 'Quais medicamentos, dosagens e há quanto tempo?',
          required: false,
          type: 'textarea',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
        },
        {
          key: 'longTermPainOrSleepMedicationUse',
          label: 'Já fez uso prolongado (3 meses ou mais) de medicamentos para dor crônica ou sono?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'longTermPainOrSleepMedicationDetails',
          label: 'Especifique quais, dose e período aproximado',
          required: false,
          type: 'textarea',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
        },
        {
          key: 'headNeckSpineSurgeryHistory',
          label: 'Alguma cirurgia prévia na região de cabeça, pescoço ou coluna?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'headNeckSpineSurgeryDetails',
          label: 'Qual cirurgia e quando?',
          required: false,
          type: 'textarea',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
        },
        {
          key: 'faceJawTraumaHistory',
          label: 'Trauma em face/mandíbula (pancadas, fraturas, luxações)?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'faceJawTraumaDetails',
          label: 'Descreva o trauma em face/mandíbula',
          required: false,
          type: 'textarea',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          helpText: 'Informe quando ocorreu, região afetada, se houve fratura/luxação e se recebeu atendimento.',
        },
        {
          key: 'headNeckSpineAccidentHistory',
          label: 'Acidentes com impacto em cabeça/pescoço/coluna?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'headNeckSpineAccidentDetails',
          label: 'Descreva o acidente com impacto em cabeça/pescoço/coluna',
          required: false,
          type: 'textarea',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          helpText: 'Informe quando ocorreu, tipo de impacto, sintomas após o acidente e se houve acompanhamento.',
        },
        {
          key: 'sleepQualityScore',
          label: 'Qualidade do sono (0 a 10)',
          required: true,
          type: 'score',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 10,
          options: scoreZeroToTenOptions,
        },
        {
          key: 'sleepDisorders',
          label: 'Distúrbios do sono relatados',
          required: false,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'sleep_onset_difficulty', label: 'Dificuldade para iniciar o sono' },
            { value: 'night_awakenings', label: 'Acorda várias vezes à noite' },
            { value: 'snoring', label: 'Ronco relatado por terceiros' },
            { value: 'apnea', label: 'Pausas respiratórias/apneia relatadas' },
          ],
        },
        {
          key: 'sleepBruxismStatus',
          label: 'Ranger ou apertar os dentes dormindo (bruxismo do sono)?',
          required: false,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'no', label: 'Não' },
            { value: 'suspected', label: 'Suspeito / já me falaram' },
            { value: 'confirmed', label: 'Diagnóstico confirmado' },
          ],
        },
      ],
    },
    {
      key: 'dental-orofacial-history',
      title: 'Histórico odontológico e orofacial',
      description: 'Histórico de DTM, sintomas articulares de ATM, hábitos parafuncionais e tratamentos odontológicos prévios.',
      fields: [
        {
          key: 'hasTmdDiagnosis',
          label: 'Já recebeu algum diagnóstico de DTM (disfunção temporomandibular)?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'tmdDiagnosisDetails',
          label: 'Ano do primeiro diagnóstico e tipo de DTM, se informado',
          required: false,
          type: 'textarea',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
        },
        {
          key: 'orofacialSymptomsHistory',
          label: 'Já teve ou tem algum destes sinais/sintomas?',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'none', label: 'Nenhuma' },
            { value: 'atm_pain', label: 'Dor na região da ATM' },
            { value: 'temple_pain', label: 'Dor em têmporas' },
            { value: 'jaw_pain', label: 'Dor em mandíbula' },
            { value: 'masseter_pain', label: 'Dor nos masseteres/bochechas' },
            { value: 'neck_stiffness', label: 'Dor ou rigidez em pescoço' },
            { value: 'shoulder_pain', label: 'Dor em ombros' },
            { value: 'tooth_wear', label: 'Desgaste acentuado dos dentes' },
            { value: 'tooth_sensitivity', label: 'Sensibilidade dentária frequente' },
            { value: 'bite_change', label: 'Sensação de morder torto ou mudança na mordida' },
          ],
        },
        {
          key: 'atmJointSymptoms',
          label: 'Sintomas articulares específicos de ATM',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'none', label: 'Nenhuma' },
            { value: 'clicks_never', label: 'Estalos/cliques: nunca' },
            { value: 'clicks_occasional', label: 'Estalos/cliques: ocasionalmente' },
            { value: 'clicks_frequent', label: 'Estalos/cliques: frequentes' },
            { value: 'clicks_with_pain', label: 'Estalos associados à dor' },
            { value: 'crepitus', label: 'Sensação de areia/ruído de atrito na ATM' },
            { value: 'locking_once_twice', label: 'Travamento para abrir ocorreu 1-2 vezes' },
            { value: 'locking_frequent', label: 'Travamento ocorre com certa frequência' },
            { value: 'locked_open_closed', label: 'Boca presa aberta/fechada precisando de ajuda/manobra' },
          ],
        },
        {
          key: 'awakeParafunctionalHabits',
          label: 'Hábitos parafuncionais acordado',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'none', label: 'Nenhuma' },
            { value: 'object_biting', label: 'Mordiscar objetos' },
            { value: 'nail_biting', label: 'Roer unhas' },
            { value: 'cheek_lip_biting', label: 'Morder bochechas/lábios' },
            { value: 'chin_support', label: 'Apoiar o queixo na mão com frequência' },
            { value: 'day_clenching_no', label: 'Não percebe apertar os dentes durante o dia' },
            { value: 'day_clenching_frequent', label: 'Sim, frequentemente aperta os dentes durante o dia' },
            { value: 'day_clenching_unsure', label: 'Tenho dúvida se aperto os dentes durante o dia' },
          ],
        },
        {
          key: 'previousOrofacialTreatments',
          label: 'Tratamentos odontológicos prévios relacionados à dor orofacial/ATM',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'none', label: 'Nenhuma' },
            { value: 'splint_current', label: 'Placa miorrelaxante em uso' },
            { value: 'splint_past', label: 'Já usou placa miorrelaxante' },
            { value: 'splint_never', label: 'Nunca usou placa miorrelaxante' },
            { value: 'atm_physiotherapy', label: 'Fisioterapia para ATM/dor orofacial' },
            { value: 'speech_therapy', label: 'Fonoaudiologia voltada para ATM/mastigação/fala' },
            { value: 'botox_or_infiltration', label: 'Infiltrações/toxina botulínica em músculos mastigatórios' },
            { value: 'atm_surgery', label: 'Cirurgia de ATM' },
            { value: 'other_therapies', label: 'Outros tratamentos: laser, acupuntura etc.' },
          ],
        },
        {
          key: 'previousTreatmentSatisfactionDental',
          label: 'Grau de satisfação com tratamento odontológico anterior (0 a 10)',
          required: false,
          type: 'score',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 10,
          options: scoreZeroToTenOptions,
        },
        {
          key: 'previousTreatmentSatisfactionTherapies',
          label: 'Satisfação com fisioterapia/fono/terapias complementares (0 a 10)',
          required: false,
          type: 'score',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 10,
          options: scoreZeroToTenOptions,
        },
        {
          key: 'previousTreatmentComment',
          label: 'Comentário sobre o que ajudou mais ou menos',
          required: false,
          type: 'textarea',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
        },
        {
          key: 'orthodonticApplianceHistory',
          label: 'Usa atualmente ou usou anteriormente aparelho para tratamento ortodôntico?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'current', label: 'Uso atualmente' },
            { value: 'never', label: 'Nunca usei' },
            { value: 'past', label: 'Usei no passado, mas não uso mais atualmente' },
          ],
        },
        {
          key: 'dentalProsthesisTypes',
          label: 'Usa atualmente algum tipo de prótese ou elemento dentário?',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'implant_prosthesis', label: 'Prótese sobre implante' },
            { value: 'dentures', label: 'Dentadura' },
            { value: 'bridge', label: 'Ponte' },
            { value: 'crown', label: 'Coroa' },
            { value: 'ceramic_veneer', label: 'Lente cerâmica' },
            { value: 'resin_veneer', label: 'Lente de resina' },
            { value: 'none', label: 'Não uso' },
            { value: 'other', label: 'Outro' },
          ],
        },
        {
          key: 'regularDentistVisit',
          label: 'Frequenta regularmente algum dentista?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'regularDentistCityNeighborhood',
          label: 'Se sim, cite a Cidade/Bairro',
          required: false,
          type: 'text',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
        },
      ],
    },
    {
      key: 'current-pain-function',
      title: 'Sintomas atuais - dor orofacial, cervical e impacto funcional',
      description: 'Dor orofacial/cervical, função mandibular e impacto na performance e no treino.',
      fields: [
        {
          key: 'hasCurrentPain',
          label: 'Presença de dor atualmente',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'no', label: 'Não' },
            { value: 'yes', label: 'Sim' },
          ],
        },
        {
          key: 'painLocations',
          label: 'Localização da dor',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'ear_atm', label: 'Região do ouvido/frente à orelha (ATM)' },
            { value: 'temples', label: 'Têmporas' },
            { value: 'jaw', label: 'Mandíbula' },
            { value: 'masseter', label: 'Região masseter/bochechas' },
            { value: 'neck', label: 'Pescoço' },
            { value: 'shoulders', label: 'Ombros' },
            { value: 'other', label: 'Outros' },
          ],
        },
        {
          key: 'painPatternDetails',
          label: 'Padrão da dor',
          required: true,
          type: 'textarea',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          helpText:
            'Informe início, evento associado, frequência, duração média, horário mais frequente e tipo de dor.',
        },
        {
          key: 'averagePainLastWeek',
          label: 'Dor média na última semana (0 a 10)',
          required: true,
          type: 'score',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 10,
          options: scoreZeroToTenOptions,
        },
        {
          key: 'worstPainLastWeek',
          label: 'Pior dor na última semana (0 a 10)',
          required: true,
          type: 'score',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 10,
          options: scoreZeroToTenOptions,
        },
        {
          key: 'painAggravatingFactors',
          label: 'Fatores que pioram a dor',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'heavy_training', label: 'Treinos pesados/levantamento de cargas' },
            { value: 'near_failure', label: 'Próximo da falha muscular/exaustão' },
            { value: 'hard_foods', label: 'Mastigação de alimentos duros' },
            { value: 'one_sided_chewing', label: 'Mastigar de um lado só' },
            { value: 'talking_or_singing', label: 'Falar muito/cantar' },
            { value: 'yawning', label: 'Bocejar' },
            { value: 'emotional_stress', label: 'Estresse emocional' },
            { value: 'anxiety', label: 'Ansiedade' },
            { value: 'poor_sleep', label: 'Sono ruim/dormir pouco' },
            { value: 'prolonged_posture', label: 'Postura prolongada' },
            { value: 'other', label: 'Outros' },
          ],
        },
        {
          key: 'painReliefFactors',
          label: 'Fatores que aliviam a dor',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'medication', label: 'Medicação' },
            { value: 'massage', label: 'Massagem' },
            { value: 'heat', label: 'Calor local' },
            { value: 'cold', label: 'Frio local' },
            { value: 'load_reduction', label: 'Redução da carga de treino' },
            { value: 'mouthguard', label: 'Placa/protetor bucal' },
            { value: 'training_pause', label: 'Pausa no treino' },
            { value: 'other', label: 'Outros' },
          ],
        },
        {
          key: 'hasMouthOpeningDifficulty',
          label: 'Sente dificuldade para abrir a boca completamente?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'mandibularFunctionSymptoms',
          label: 'Dor, desconforto ou cansaço mandibular em funções do dia a dia',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'chewing', label: 'Mastigar' },
            { value: 'talking', label: 'Falar muito' },
            { value: 'yawning', label: 'Bocejar' },
            { value: 'laughing_or_singing', label: 'Rir ou cantar' },
            { value: 'hard_foods', label: 'Mastigar alimentos duros' },
            { value: 'jaw_fatigue_light', label: 'Cansaço na mandíbula: leve' },
            { value: 'jaw_fatigue_moderate', label: 'Cansaço na mandíbula: moderado' },
            { value: 'jaw_fatigue_intense', label: 'Cansaço na mandíbula: intenso' },
          ],
        },
        {
          key: 'jointClickFrequency',
          label: 'Percepção de estalos/cliques na ATM',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: frequencyOptions,
        },
        {
          key: 'trainingTeethClenching',
          label: 'Relata apertar os dentes durante os treinos?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'no', label: 'Não' },
            { value: 'conscious_yes', label: 'Sim, percebo conscientemente' },
            { value: 'reported_or_video', label: 'Não percebo, mas já me falaram/vejo em vídeos' },
            { value: 'unsure', label: 'Tenho dúvida' },
          ],
        },
        {
          key: 'trainingJawTensionMoment',
          label: 'Em quais momentos do treino sente maior tensão em mandíbula/pescoço?',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'near_failure', label: 'Próximo da exaustão/falha muscular' },
            { value: 'heavy_lifts', label: 'Grandes levantamentos' },
            { value: 'specific_exercises', label: 'Exercícios específicos' },
            { value: 'hiit_crossfit', label: 'Treinos de alta intensidade' },
            { value: 'all_training', label: 'Em todo o treino' },
          ],
        },
        {
          key: 'trainingInterruptedByPain',
          label: 'Já precisou interromper ou reduzir treino por dor em mandíbula/pescoço/cabeça?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'never', label: 'Nunca' },
            { value: 'monthly', label: 'Algumas vezes ao mês' },
            { value: 'weekly', label: 'Quase toda semana' },
            { value: 'almost_every_training', label: 'Em praticamente todos os treinos' },
          ],
        },
        {
          key: 'trainingPerformanceImpact',
          label: 'Quanto a dor/desconforto orofacial ou cervical impacta seu desempenho no treino? (0 a 10)',
          required: true,
          type: 'score',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 10,
          options: scoreZeroToTenOptions,
        },
        {
          key: 'missedTrainingDuePain',
          label: 'Nos últimos 3 meses, quantos treinos estima ter perdido por dor em mandíbula, cabeça ou pescoço?',
          required: true,
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
      ],
    },
    {
      key: 'life-habits',
      title: 'Hábitos de vida',
      description: 'Informações que ajudam a entender fatores que podem influenciar dor e performance.',
      fields: [
        {
          key: 'nicotineUse',
          label: 'Nicotina',
          required: true,
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
          key: 'alcoholPattern',
          label: 'Álcool - padrão principal de consumo',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'none', label: 'Nenhum' },
            { value: 'light_social', label: 'Social leve' },
            { value: 'moderate', label: 'Moderado' },
            { value: 'high', label: 'Alto' },
          ],
        },
        {
          key: 'usesCaffeineStimulants',
          label: 'Utiliza Cafeína/estimulantes',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: yesNoOptions,
        },
        {
          key: 'caffeineStimulantsUse',
          label: 'Cafeína/estimulantes: dose diária e horário de maior consumo',
          required: true,
          type: 'text',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          helpText: 'Inclui café, pré-treino, energéticos e outras substâncias estimulantes.',
        },
        {
          key: 'stressLevel',
          label: 'Nível de estresse percebido (0 a 10)',
          required: true,
          type: 'score',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 10,
          options: scoreZeroToTenOptions,
        },
        {
          key: 'averageSleepHours',
          label: 'Horas médias de sono por noite',
          required: true,
          type: 'number',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 24,
        },
        {
          key: 'subjectiveSleepQuality',
          label: 'Qualidade subjetiva do sono (0 a 10)',
          required: true,
          type: 'score',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 10,
          options: scoreZeroToTenOptions,
        },
        {
          key: 'workPosture',
          label: 'Posição de trabalho predominante',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'sitting_hours', label: 'Sentado várias horas' },
            { value: 'standing', label: 'Em pé' },
            { value: 'mixed', label: 'Misto' },
            { value: 'heavy_physical', label: 'Trabalho físico pesado' },
          ],
        },
      ],
    },
    {
      key: 'device-experience',
      title: 'SEÇÃO 3 - EXPERIÊNCIA COM O DISPOSITIVO',
      description:
        'Esta seção foca na relação com a NEXOR e com o dispositivo bucal BITEPLANER, incluindo expectativa, uso e percepção de resultados. Para novos usuários, o dentista apenas visualiza esta seção quando aplicável.',
      fields: [
        {
          key: 'biteplanerDiscoverySource',
          label: 'Como conheceu inicialmente o dispositivo bucal BITEPLANER da NEXOR?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'friend', label: 'Indicação de amigo/conhecido' },
            { value: 'health_or_sport_professional', label: 'Profissional da saúde ou esporte' },
            { value: 'gym_club_training_center', label: 'Academia/clube/centro de treinamento' },
            { value: 'representative_event', label: 'Representante ou palestra da NEXOR' },
            { value: 'social_media', label: 'Redes sociais' },
            { value: 'direct_message', label: 'Mensagem direta' },
            { value: 'email_marketing', label: 'E-mail marketing' },
            { value: 'internet_search', label: 'Pesquisa na internet' },
            { value: 'promotional_material', label: 'Material promocional' },
            { value: 'other', label: 'Outro' },
          ],
        },
        {
          key: 'initialMotivation',
          label: 'Motivação inicial para buscar o BITEPLANER',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'safety', label: 'Segurança' },
            { value: 'prevention', label: 'Prevenção' },
            { value: 'performance', label: 'Performance' },
            { value: 'comfort', label: 'Conforto' },
            { value: 'curiosity', label: 'Curiosidade' },
            { value: 'recommendation', label: 'Recomendação de terceiros' },
            { value: 'pain', label: 'Dor' },
            { value: 'other', label: 'Outros' },
          ],
        },
        {
          key: 'initialProposalRating',
          label: 'O que achou da proposta inicial do BITEPLANER? (1 a 10)',
          required: true,
          type: 'score',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          min: 1,
          max: 10,
          helpText: '1 = Muito ruim; 10 = Muito boa.',
          options: scoreOptions,
        },
        {
          key: 'biteplanerInterestReasons',
          label: 'O que te interessou na proposta do BITEPLANER?',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'performance', label: 'Aumento de performance durante atividade física/esporte' },
            { value: 'tooth_safety', label: 'Segurança dos dentes durante atividade física/esporte' },
            { value: 'jaw_atm_stability', label: 'Estabilidade/segurança na mandíbula/ATM durante esforço' },
            { value: 'joint_comfort', label: 'Conforto da articulação durante esforço' },
            { value: 'post_activity_wellbeing', label: 'Bem-estar da articulação pós atividade' },
            { value: 'dental_prevention', label: 'Prevenção de problemas dentais' },
            { value: 'atm_prevention', label: 'Prevenção de problemas na ATM' },
          ],
        },
        {
          key: 'expectedUseBenefit',
          label: 'Expectativa com o uso de um dispositivo bucal durante o treino',
          required: true,
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
            { value: 'other', label: 'Outros' },
          ],
        },
        {
          key: 'expectedUseBenefitOther',
          label: 'Descreva outros benefícios esperados',
          required: true,
          type: 'text',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
        },
        {
          key: 'imaginedUseBarriers',
          label: 'Barreiras imaginadas ao uso de um dispositivo bucal',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'discomfort', label: 'Desconforto' },
            { value: 'breathing', label: 'Prejuízo na respiração' },
            { value: 'speech', label: 'Prejuízo na fala' },
            { value: 'appearance', label: 'Aparência/estética' },
            { value: 'cost', label: 'Custo' },
            { value: 'efficacy_doubt', label: 'Dúvida sobre eficácia' },
            { value: 'choking_or_loose', label: 'Medo de engasgar/soltar durante o treino' },
            { value: 'other', label: 'Outros' },
          ],
        },
        {
          key: 'imaginedUseBarriersOther',
          label: 'Descreva outras barreiras imaginadas',
          required: true,
          type: 'text',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
        },
      ],
    },
    {
      key: 'satisfaction-improvements',
      title: 'SEÇÃO 4 - PESQUISA DE SATISFAÇÃO E MELHORIAS',
      description:
        'Esta seção trata de percepções, satisfação e preferências. Os dados podem ser usados em análises internas e, se você autorizar, para comunicações relacionadas. Tudo aqui é opcional para o cliente e não fica visível ao dentista.',
      fields: [
        {
          key: 'researchConsent',
          label:
            'Li e concordo com o uso das minhas respostas de satisfação, opiniões e feedbacks para análise interna e melhoria de produtos, serviços e comunicação da NEXOR, em formato agregado e/ou anonimizado sempre que possível.',
          required: false,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: customerConsentVisible,
          editableWhen: 'customer_intake',
          options: consentOption,
        },
        {
          key: 'marketingConsent',
          label:
            'Li e concordo em receber comunicações e informes personalizados, conteúdos educativos, novidades sobre o BITEPLANER, convites para pesquisas, ofertas e campanhas nos canais cadastrados.',
          required: false,
          type: 'checkbox-group',
          ownerRole: 'user',
          visibleTo: customerConsentVisible,
          editableWhen: 'customer_intake',
          options: consentOption,
        },
        {
          key: 'nexorSatisfaction',
          label: 'Satisfação geral com a NEXOR até o momento (0 a 10)',
          required: false,
          type: 'score',
          ownerRole: 'user',
          visibleTo: customerConsentVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 10,
          helpText: '0 = Nada satisfeito; 10 = Totalmente satisfeito.',
          options: scoreZeroToTenOptions,
        },
        {
          key: 'biteplanerSatisfaction',
          label: 'Satisfação geral com o BITEPLANER até o momento (0 a 10)',
          required: false,
          type: 'score',
          ownerRole: 'user',
          visibleTo: customerConsentVisible,
          editableWhen: 'customer_intake',
          min: 0,
          max: 10,
          helpText: '0 = Nada satisfeito; 10 = Totalmente satisfeito.',
          options: scoreZeroToTenOptions,
        },
        {
          key: 'referralLikelihood',
          label: 'Você indicaria a NEXOR e o BITEPLANER para amigos/conhecidos?',
          required: false,
          type: 'select',
          ownerRole: 'user',
          visibleTo: customerConsentVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'definitely', label: 'Com certeza' },
            { value: 'probably_yes', label: 'Provavelmente sim' },
            { value: 'maybe_depends', label: 'Talvez, depende da minha experiência' },
            { value: 'probably_not', label: 'Provavelmente não' },
          ],
        },
        {
          key: 'openQuestionOrConcern',
          label: 'Tem alguma dúvida, preocupação ou sugestão que não perguntamos?',
          required: false,
          type: 'textarea',
          ownerRole: 'user',
          visibleTo: customerConsentVisible,
          editableWhen: 'customer_intake',
          helpText:
            'Opcional - campo aberto para o que desejar falar. Não inclua dados pessoais de outras pessoas neste campo.',
        },
      ],
    },
    {
      key: 'dentist-clinical-complement',
      title: 'Complemento clínico do dentista',
      description:
        'Campos preenchidos pelo dentista licenciado durante ou após a consulta. Estes dados integram o prontuário e devem ser baixados/armazenados conforme normas éticas e legais.',
      fields: [
        {
          key: 'consultationDate',
          label: 'Data da consulta',
          required: true,
          type: 'date',
          ownerRole: 'dentist',
          visibleTo: dentistVisible,
          editableWhen: 'dentist_review',
          helpText: 'Preencha a data real da consulta para que a anamnese exportada saia com esta informação correta.',
        },
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
          key: 'openingMidlineDeviation',
          label: 'Desvio da linha média ao abrir?',
          required: false,
          type: 'select',
          ownerRole: 'dentist',
          visibleTo: dentistVisible,
          editableWhen: 'dentist_review',
          options: yesNoOptions,
        },
        {
          key: 'openingMidlineDeviationSide',
          label: 'Para qual lado?',
          required: false,
          type: 'select',
          ownerRole: 'dentist',
          visibleTo: dentistVisible,
          editableWhen: 'dentist_review',
          options: [
            { value: 'right', label: 'Direita' },
            { value: 'left', label: 'Esquerda' },
          ],
        },
        {
          key: 'dentistClinicalDeclaration',
          label:
            'Declaro que as informações acima foram coletadas através de exame clínico e, quando aplicável, complementadas por exames.',
          required: true,
          type: 'checkbox-group',
          ownerRole: 'dentist',
          visibleTo: dentistVisible,
          editableWhen: 'dentist_review',
          helpText:
            'Após salvar, o formulário deve ser baixado e armazenado junto ao prontuário do paciente, conforme normas éticas e legais.',
          options: consentOption,
        },
      ],
    },
  ],
};

export const CUSTOMER_NEW_USER_ONBOARDING: SharedIntakeDefinition = {
  label: 'Cadastro de novos usuários Biteplaner',
  description:
    'Onboarding do cliente que optou por adquirir o Biteplaner, com dados de perfil, prática esportiva e consentimentos.',
  sections: [
    {
      key: 'profile',
      title: 'Perfil do cliente',
      fields: [
        { key: 'fullName', label: 'Nome completo', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'email', label: 'E-mail', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'phone', label: 'Telefone', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'cpf', label: 'CPF', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'residenceCep', label: 'CEP', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'residenceAddress', label: 'Endereço', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'residenceComplement', label: 'Complemento', required: false, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'residenceCity', label: 'Cidade', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'residenceState', label: 'Estado', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'profession', label: 'Profissão', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'birthDate', label: 'Data de nascimento', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', helpText: 'Use o formato DD/MM/AAAA.' },
        {
          key: 'biologicalSex',
          label: 'Sexo biológico',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'female', label: 'Feminino' },
            { value: 'male', label: 'Masculino' },
          ],
        },
        {
          key: 'handedness',
          label: 'Lateralidade predominante',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'right', label: 'Destro' },
            { value: 'left', label: 'Canhoto' },
            { value: 'ambidextrous', label: 'Ambidestro' },
          ],
        },
        { key: 'bodyMassKg', label: 'Massa corporal (kg)', required: true, type: 'number', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', min: 1, max: 300, helpText: 'Exemplo: 70,5' },
        { key: 'heightM', label: 'Altura (m)', required: true, type: 'number', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', min: 0.5, max: 2.5, helpText: 'Exemplo: 1,70' },
      ],
    },
    {
      key: 'training',
      title: 'Treinamento',
      fields: [
        { key: 'currentSports', label: 'Esportes/atividades atuais', required: true, type: 'checkbox-group', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', options: sportOptions },
        { key: 'pastSports', label: 'Esportes/atividades passados', required: false, type: 'checkbox-group', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', options: sportOptions },
        { key: 'trainingExperience', label: 'Há quanto tempo está treinando em geral?', required: true, type: 'select', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', options: trainingExperienceOptions },
        { key: 'trainingCityOrNeighborhood', label: 'Cidade/Bairro onde treina', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'trainingLocations', label: 'Local de treinamento', required: true, type: 'checkbox-group', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', options: trainingLocationOptions },
        { key: 'trainingSupport', label: 'Quem direciona/acompanha seu treinamento?', required: true, type: 'checkbox-group', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', options: trainingSupportOptions },
        { key: 'accessories', label: 'Acessórios de segurança, monitoramento ou performance', required: false, type: 'checkbox-group', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', options: accessoryOptions },
      ],
    },
    {
      key: 'health',
      title: 'Saúde e lesões',
      fields: [
        { key: 'currentTrainingHealthLimitations', label: 'Tem atualmente lesões/problemas de saúde que dificultam ou impedem algum tipo de treinamento?', required: true, type: 'textarea', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'previousTrainingInjuries', label: 'Teve anteriormente alguma lesão/problema de saúde relacionados aos treinos ou competições?', required: true, type: 'textarea', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
      ],
    },
    {
      key: 'financial-profile',
      title: 'Perfil financeiro',
      fields: [
        { key: 'monthlyTrainingLocationSpend', label: 'Gasto médio mensal com locais de treinamento', required: true, type: 'number', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', min: 0 },
        { key: 'annualAccessorySpend', label: 'Gasto anual com acessórios', required: false, type: 'number', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', min: 0 },
        { key: 'monthlySupplementSpend', label: 'Gasto mensal com suplementos', required: false, type: 'number', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', min: 0 },
        { key: 'monthlyPersonalTrainerSpend', label: 'Gasto mensal com personal trainer', required: false, type: 'number', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', min: 0 },
        { key: 'monthlyNutritionistSpend', label: 'Gasto mensal com nutricionista', required: false, type: 'number', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', min: 0 },
        { key: 'monthlyIncomeRange', label: 'Renda mensal aproximada', required: true, type: 'select', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', options: incomeRangeOptions },
      ],
    },
    {
      key: 'goals',
      title: 'Objetivos',
      fields: [
        { key: 'trainingGoals', label: 'Objetivos pessoais em relação aos treinos', required: false, type: 'checkbox-group', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', options: trainingGoalOptions },
        { key: 'mainTrainingGoal', label: 'Maior objetivo em relação aos treinos', required: true, type: 'textarea', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'biggestTrainingConcern', label: 'Maior preocupação em relação aos treinos', required: true, type: 'textarea', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'workTrainingImpact', label: 'Trabalho afeta seu desempenho nos treinos?', required: true, type: 'select', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', options: workImpactOptions },
      ],
    },
    {
      key: 'sin',
      title: 'Sistema integrado',
      description: `Estamos desenvolvendo um novo sistema integrado (SIN) para melhor te atender futuramente. Este sistema incluirá Plataforma web e App com os seguintes Dashboards:

ACOMPANHAMENTO DE DISPOSITIVOS
→ Informações / instruções / orientações
→ Preparo / acompanhamento / entrega / momento de substituição

ACOMPANHAMENTO DE TREINOS
→ Registro / métricas
→ Histórico / evolução
→ Assistente de IA

REDE DE APOIO DE LICENCIADOS
→ Academias / Centros de treinamento
→ Treinadores / Instrutores / Personal trainers / Coachers
→ Dentistas

SERVIÇOS ADICIONAIS
→ Seguro contra danos / perda
→ Telemedicina / Teleodontologia / Telepsicologia
→ Nutricionistas
→ Plano de saúde
→ Serviço de Guincho

DISPOSITIVOS FUTUROS
→ No próximo ano informaremos novidades!`,
      fields: [
        { key: 'sinUsageLikelihood', label: 'Qual a chance de você usar o SIN?', required: true, type: 'score', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', min: 1, max: 10, options: scoreOptions },
        { key: 'sinUsageReason', label: 'Por quê?', required: false, type: 'textarea', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'sinMustHaveFeature', label: 'Uma funcionalidade que o SIN deveria ter', required: false, type: 'textarea', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'sinDropOffReason', label: 'O que faria você deixar de usar o SIN?', required: false, type: 'textarea', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'nexorReferralLikelihood', label: 'Indicaria a NEXOR?', required: true, type: 'select', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', options: referralLikelihoodOptions },
      ],
    },
    {
      key: 'consents',
      title: 'Consentimentos',
      fields: [
        { key: 'researchConsent', label: 'Autorizo uso dos dados para análises internas e melhoria do produto', required: false, type: 'checkbox-group', ownerRole: 'user', visibleTo: customerConsentVisible, editableWhen: 'customer_intake', options: consentOption },
        { key: 'marketingConsent', label: 'Autorizo comunicações e informes personalizados da NEXOR', required: false, type: 'checkbox-group', ownerRole: 'user', visibleTo: customerConsentVisible, editableWhen: 'customer_intake', options: consentOption },
      ],
    },
    {
      key: 'feedback',
      title: 'Feedback',
      fields: [
        { key: 'productDevelopmentAdvice', label: 'Um conselho para a equipe que está criando o produto', required: false, type: 'textarea', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'nexorMostImportantHelp', label: 'Qual a coisa MAIS IMPORTANTE que a NEXOR precisa te auxiliar?', required: false, type: 'textarea', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', helpText: 'Em uma frase: “A NEXOR precisa me ajudar a .”' },
        { key: 'finalOpenFeedback', label: 'Tem alguma dúvida, preocupação ou sugestão que não perguntamos?', required: false, type: 'textarea', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', helpText: 'Não inclua dados pessoais de outras pessoas e evite detalhes médicos muito específicos que não deseje compartilhar' },
      ],
    },
  ],
};

export const CUSTOMER_TRAINING_REPORT: SharedIntakeDefinition = {
  label: 'Relatório de treino/competição',
  description:
    'Registro pós-entrega para o cliente relatar o uso do Biteplaner em treinos ou competições.',
  sections: [
    {
      key: 'session',
      title: 'Sessão de uso',
      fields: [
        { key: 'privacyConsent', label: 'Consentimento de uso do relatório', required: true, type: 'checkbox-group', ownerRole: 'user', visibleTo: customerConsentVisible, editableWhen: 'customer_intake', options: consentOption },
        { key: 'activityDate', label: 'Data da atividade', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', helpText: 'Use o formato AAAA-MM-DD.' },
        { key: 'approximateStartTime', label: 'Horário aproximado', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'approximateDuration', label: 'Duração aproximada', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'bodyMassKg', label: 'Massa corporal (kg)', required: false, type: 'number', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', min: 1, max: 300 },
        { key: 'activityTypes', label: 'Modalidade/atividade realizada', required: true, type: 'textarea', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
        { key: 'cityOrRegion', label: 'Cidade/região do treino', required: true, type: 'text', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
      ],
    },
    {
      key: 'experience',
      title: 'Percepção',
      fields: [
        {
          key: 'deviceUsage',
          label: 'Usou o Biteplaner nesta atividade?',
          required: true,
          type: 'select',
          ownerRole: 'user',
          visibleTo: userVisible,
          editableWhen: 'customer_intake',
          options: [
            { value: 'full', label: 'Sim, durante toda a atividade' },
            { value: 'partial', label: 'Sim, parcialmente' },
            { value: 'none', label: 'Não usei' },
          ],
        },
        { key: 'comfortScore', label: 'Conforto (1 a 10)', required: true, type: 'score', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', min: 1, max: 10, options: scoreOptions },
        { key: 'strengthScore', label: 'Força percebida (1 a 10)', required: true, type: 'score', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', min: 1, max: 10, options: scoreOptions },
        { key: 'resistanceScore', label: 'Resistência percebida (1 a 10)', required: true, type: 'score', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', min: 1, max: 10, options: scoreOptions },
        { key: 'satisfactionScore', label: 'Satisfação geral (1 a 10)', required: true, type: 'score', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake', min: 1, max: 10, options: scoreOptions },
        { key: 'comment', label: 'Comentário sobre o uso', required: false, type: 'textarea', ownerRole: 'user', visibleTo: userVisible, editableWhen: 'customer_intake' },
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
