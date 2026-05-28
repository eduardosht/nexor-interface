import { useEffect, useMemo, useRef, useState, type ChangeEvent, type FormEvent, type ReactNode } from 'react';
import { BarChart3, ClipboardPlus, Database, Frown, Info, LockKeyhole, ShieldCheck, Star, UserRound, Users, X } from 'lucide-react';
import { SkeletonCard } from '../../../components/Skeleton';
import * as S from './WorkflowFormsPanel.styles';
import {
  Button,
  CheckboxField,
  Field,
  RadioQuestionGroup,
  Select,
  StatusIndicator,
  TagAutocompleteField,
  formatDocumentValue,
  formatPhoneValue,
  getDocumentMaxLength,
  getPhoneMaxLength,
  sanitizeDocumentValue,
  sanitizePhoneValue,
} from '@nexor/design-system';
import {
  fetchWorkflowForms,
  formatDate,
  submitWorkflowForm,
  type DemoWorkflowForm,
} from '../../../features/demo/biteplanerFlow';
import {
  BITEPLANER_REVIEW_TEMPLATES,
  type BiteplanerReviewFieldDefinition,
} from '../biteplanerReviewForms/index';
import {
  CUSTOMER_NEW_USER_ONBOARDING,
  CUSTOMER_TRAINING_REPORT,
  SHARED_INITIAL_EVALUATION_INTAKE,
  getSharedIntakePayloadKey,
  type SharedIntakeFieldDefinition,
  type WorkflowFormActorRole,
} from './sharedIntakeDefinition';

type IntakeFieldDefinition = {
  key: string;
  label: string;
  required: boolean;
  type: 'text' | 'textarea';
  helpText?: string;
};

type FormDefinition = {
  label: string;
  description: string;
  fields?: Array<IntakeFieldDefinition | BiteplanerReviewFieldDefinition>;
  sharedIntake?: typeof SHARED_INITIAL_EVALUATION_INTAKE;
  payloadMode?: 'actor-nested' | 'flat';
};

type WorkflowFormsPanelProps = {
  orderId: string | null;
  token?: string;
  title?: string;
  description?: string;
  templateFilter?: string[];
  defaultValues?: Record<string, string>;
  forms?: DemoWorkflowForm[];
  onFormsChange?: (forms: DemoWorkflowForm[]) => void;
  variant?: 'panel' | 'embedded';
  actorRole?: WorkflowFormActorRole;
  formPresentation?: 'card' | 'flat';
  showFormHeader?: boolean;
  showFormHeaderStatus?: boolean;
  beforeFormsContent?: ReactNode;
  formsLocked?: boolean;
  payloadExtras?: Record<string, unknown>;
};

type RenderFieldControlContext = {
  trainingSameAsResidence?: boolean;
  residenceValue?: string;
  onTrainingSameAsResidenceChange?: (checked: boolean) => void;
  residenceCepLookupError?: string;
  onResidenceCepBlur?: () => void;
  onResidenceCepChange?: () => void;
};

type VisibleSharedSection = {
  key: string;
  title: string;
  description?: string;
  fields: SharedIntakeFieldDefinition[];
};

type DisplaySharedSection = VisibleSharedSection & {
  childSections?: VisibleSharedSection[];
};

const INTAKE_DEFINITION: FormDefinition = {
  label: SHARED_INITIAL_EVALUATION_INTAKE.label,
  description: SHARED_INITIAL_EVALUATION_INTAKE.description,
  sharedIntake: SHARED_INITIAL_EVALUATION_INTAKE,
  payloadMode: 'actor-nested',
};

const CUSTOMER_ONBOARDING_DEFINITION: FormDefinition = {
  label: CUSTOMER_NEW_USER_ONBOARDING.label,
  description: CUSTOMER_NEW_USER_ONBOARDING.description,
  sharedIntake: CUSTOMER_NEW_USER_ONBOARDING,
  payloadMode: 'flat',
};

const CUSTOMER_TRAINING_REPORT_DEFINITION: FormDefinition = {
  label: CUSTOMER_TRAINING_REPORT.label,
  description: CUSTOMER_TRAINING_REPORT.description,
  sharedIntake: CUSTOMER_TRAINING_REPORT,
  payloadMode: 'flat',
};

const TEMPLATE_DEFINITIONS: Record<string, FormDefinition> = {
  customer_new_user_onboarding: CUSTOMER_ONBOARDING_DEFINITION,
  customer_pre_consultation_intake: INTAKE_DEFINITION,
  customer_training_report: CUSTOMER_TRAINING_REPORT_DEFINITION,
  ...Object.fromEntries(
    Object.entries(BITEPLANER_REVIEW_TEMPLATES).map(([key, template]) => [
      key,
      {
        label: template.label,
        description: 'Formulário de avaliação operacional mapeado para governança da rede Biteplaner.',
        fields: template.fields,
      },
    ])
  ),
};

const STATUS_PRESENTATION: Record<DemoWorkflowForm['status'], { label: string; color: string }> = {
  pending: { label: 'Pendente', color: '#D18A00' },
  draft: { label: 'Rascunho', color: '#2563EB' },
  submitted: { label: 'Enviado', color: '#15803D' },
};

function getDefinition(templateKey: string) {
  return TEMPLATE_DEFINITIONS[templateKey] ?? {
    label: templateKey,
    description: 'Formulário operacional mapeado para esta etapa.',
    fields: [],
  };
}

function getDefinitionFields(definition: FormDefinition) {
  if (definition.sharedIntake) {
    if (definition.sharedIntake === CUSTOMER_NEW_USER_ONBOARDING) {
      return definition.sharedIntake.sections
        .filter((section) => section.key !== 'sin')
        .flatMap((section) => section.fields);
    }

    return definition.sharedIntake.sections.flatMap((section) => section.fields);
  }

  return definition.fields ?? [];
}

function getCompactSectionTitle(title: string) {
  if (/^SE\S*\s+\d+\s*-\s*/i.test(title)) {
    return title.replace(/^.*?\s+-\s+/, '');
  }

  return title;
}

function getOnboardingDisplaySections(sections: VisibleSharedSection[]): DisplaySharedSection[] {
  const sectionByKey = Object.fromEntries(sections.map((section) => [section.key, section]));
  const makeGroup = (
    key: string,
    title: string,
    description: string,
    childKeys: string[]
  ): DisplaySharedSection | null => {
    const childSections = childKeys.map((childKey) => sectionByKey[childKey]).filter(Boolean);

    if (childSections.length === 0) {
      return null;
    }

    return {
      key,
      title,
      description,
      childSections,
      fields: childSections.flatMap((section) => section.fields),
    };
  };

  return [
    makeGroup(
      'clinical-care-data',
      'SEÇÃO 1 - DADOS CLÍNICOS PARA SEU CUIDADO',
      'Esta seção inclui dados de identificação, perfil, treino e saúde, usados para seu cadastro, planejamento de dispositivos e acompanhamento clínico/esportivo. Quando usados em pesquisa, serão analisados preferencialmente de forma agregada e/ou anonimizada',
      ['profile', 'training', 'health']
    ),
    makeGroup(
      'device-platform-experience',
      'SEÇÃO 2 - PERFIL FINANCEIRO E OBJETIVOS',
      'Esta seção trata do seu perfil financeiro, objetivos e prioridades para alinhar produto, serviços e suporte à sua realidade',
      ['financial-profile', 'goals']
    ),
    makeGroup(
      'satisfaction-improvements',
      'SEÇÃO 3 - PESQUISA DE SATISFAÇÃO E MELHORIAS',
      'Esta seção é voltada a pesquisas, melhorias e, se você desejar, comunicações e ações comerciais. Tudo aqui é opcional. Seu cadastro e seu cuidado não serão prejudicados caso você não marque as opções abaixo',
      ['consents', 'feedback']
    ),
  ].filter(Boolean) as DisplaySharedSection[];
}

function getClinicalCustomerDisplaySections(sections: VisibleSharedSection[]): DisplaySharedSection[] {
  const sectionByKey = Object.fromEntries(sections.map((section) => [section.key, section]));
  const makeGroup = (
    key: string,
    title: string,
    description: string,
    childKeys: string[]
  ): DisplaySharedSection | null => {
    const childSections = childKeys.map((childKey) => sectionByKey[childKey]).filter(Boolean);

    if (childSections.length === 0) {
      return null;
    }

    return {
      key,
      title,
      description,
      childSections,
      fields: childSections.flatMap((section) => section.fields),
    };
  };

  return [
    sectionByKey['clinical-privacy'],
    makeGroup(
      'clinical-initial-data',
      'Dados iniciais',
      'Dados de identificação, triagem e informações já registradas no cadastro para preparar a pré-consulta.',
      ['initial-data']
    ),
    makeGroup(
      'clinical-care-data',
      'Dados clínicos',
      'Informações clínicas, odontológicas, orofaciais, sintomas atuais e hábitos de vida usadas para seu cuidado.',
      ['medical-history', 'dental-orofacial-history', 'current-pain-function', 'life-habits']
    ),
    makeGroup(
      'clinical-device-experience',
      'Experiência com o dispositivo',
      'Expectativas e percepções sobre a NEXOR e o BITEPLANER para alinhar cuidado, produto e suporte.',
      ['device-experience']
    ),
    makeGroup(
      'clinical-satisfaction',
      'Pesquisa de satisfação',
      'Pesquisa opcional de satisfação e melhorias. Seu cuidado não será prejudicado caso não responda.',
      ['satisfaction-improvements']
    ),
  ].filter(Boolean) as DisplaySharedSection[];
}

const DENTIST_COMPLEMENT_DESCRIPTION =
  'Este item \u00e9 exclusivo para avalia\u00e7\u00e3o do perfil facial (tecidos moles) e do padr\u00e3o esquel\u00e9tico.\n\n' +
  'Realizar o exame com o paciente em posi\u00e7\u00e3o de cabe\u00e7a natural, olhando para o horizonte, em oclus\u00e3o habitual, l\u00e1bios em repouso, em ambiente bem iluminado.\n\n' +
  'Sempre que poss\u00edvel, associar a avalia\u00e7\u00e3o cl\u00ednica a fotografias padronizadas (frontal, perfil, 3/4) e exames complementares (telerradiografia em norma lateral, tomografia, quando indicados).\n\n' +
  'Utilizar instrumentos de medi\u00e7\u00e3o quando necess\u00e1rio (r\u00e9gua milimetrada, paqu\u00edmetro, goni\u00f4metro, software de an\u00e1lise cefalom\u00e9trica).\n\n' +
  'Preencher todos os campos com aten\u00e7\u00e3o \u00e0s assimetrias, propor\u00e7\u00f5es e desvios discretos, registrando observa\u00e7\u00f5es qualitativas e quantitativas.\n\n' +
  'Em caso de d\u00favida entre categorias, descrever o achado em Observa\u00e7\u00f5es e, se poss\u00edvel, informar medidas cefalom\u00e9tricas.';

function getClinicalDentistDisplaySections(sections: VisibleSharedSection[]): DisplaySharedSection[] {
  const sectionByKey = Object.fromEntries(sections.map((section) => [section.key, section]));
  const makeGroup = (
    key: string,
    title: string,
    description: string,
    childKeys: string[]
  ): DisplaySharedSection | null => {
    const childSections = childKeys.map((childKey) => sectionByKey[childKey]).filter(Boolean);

    if (childSections.length === 0) {
      return null;
    }

    return {
      key,
      title,
      description,
      childSections,
      fields: childSections.flatMap((section) => section.fields),
    };
  };

  return [
    makeGroup(
      'clinical-initial-data',
      'SE\u00c7\u00c3O 1 - DADOS INICIAIS',
      'Dados de identifica\u00e7\u00e3o, triagem e informa\u00e7\u00f5es j\u00e1 registradas no cadastro para preparar a avalia\u00e7\u00e3o.',
      ['initial-data']
    ),
    makeGroup(
      'clinical-care-data',
      'SE\u00c7\u00c3O 2 - DADOS CL\u00cdNICOS PARA SEU CUIDADO',
      'Hist\u00f3rico m\u00e9dico, odontol\u00f3gico e orofacial, sintomas atuais e h\u00e1bitos de vida usados para orientar o cuidado.',
      ['medical-history', 'dental-orofacial-history', 'current-pain-function', 'life-habits']
    ),
    makeGroup(
      'clinical-dentist-complement',
      'SE\u00c7\u00c3O 3 - COMPLEMENTO DENTISTA',
      DENTIST_COMPLEMENT_DESCRIPTION,
      ['dentist-clinical-complement']
    ),
  ].filter(Boolean) as DisplaySharedSection[];
}

function getInitialPayload(
  form: DemoWorkflowForm,
  definition: FormDefinition,
  defaultValues: Record<string, string>,
  actorRole: WorkflowFormActorRole
) {
  const fields = getDefinitionFields(definition);
  const payloadSource = definition.sharedIntake && definition.payloadMode !== 'flat'
    ? ((form.payload?.[getSharedIntakePayloadKey(actorRole)] as Record<string, unknown> | undefined) ?? {})
    : form.payload ?? {};

  return Object.fromEntries(
    fields.map((field) => {
      const rawValue = payloadSource[field.key] ?? defaultValues[field.key] ?? '';
      const value = Array.isArray(rawValue) ? rawValue.join('|') : String(rawValue);

      if (field.key === 'phone') {
        return [field.key, formatPhoneValue(value)];
      }

      if (field.key === 'cpf') {
        return [field.key, formatDocumentValue('cpf', value)];
      }

      if (field.key === 'birthDate') {
        return [field.key, formatBirthDateValue(value)];
      }

      if (field.key === 'residenceCep') {
        return [field.key, formatCepValue(value)];
      }

      if (isHealthConditionalField(field)) {
        if (value.trim().toLowerCase() === 'não' || value.trim().toLowerCase() === 'nao') {
          return [field.key, 'Não'];
        }

        return [field.key, value];
      }

      if (isCurrencyField(field)) {
        return [field.key, formatCurrencyValue(value)];
      }

      return [field.key, value];
    })
  );
}

function isScoreField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
): field is BiteplanerReviewFieldDefinition {
  return !isSharedField(field) && field.type === 'score';
}

function isReviewTemplate(templateKey: string) {
  return templateKey in BITEPLANER_REVIEW_TEMPLATES;
}

function isTextareaField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
) {
  return field.type === 'textarea';
}

function isSharedField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
): field is SharedIntakeFieldDefinition {
  return 'ownerRole' in field;
}

function isSharedNumberField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
): field is SharedIntakeFieldDefinition & { type: 'number' } {
  return isSharedField(field) && field.type === 'number';
}

function isHealthConditionalField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
) {
  return isSharedField(field) && ['currentTrainingHealthLimitations', 'previousTrainingInjuries'].includes(field.key);
}

const CLINICAL_DETAIL_PARENT_BY_KEY: Record<string, string> = {
  relevantMedicalDiagnosisDetails: 'hasRelevantMedicalDiagnosis',
  currentMedicationDetails: 'currentMedicationUse',
  longTermPainOrSleepMedicationDetails: 'longTermPainOrSleepMedicationUse',
  headNeckSpineSurgeryDetails: 'headNeckSpineSurgeryHistory',
  faceJawTraumaDetails: 'faceJawTraumaHistory',
  headNeckSpineAccidentDetails: 'headNeckSpineAccidentHistory',
  tmdDiagnosisDetails: 'hasTmdDiagnosis',
  regularDentistCityNeighborhood: 'regularDentistVisit',
  caffeineStimulantsUse: 'usesCaffeineStimulants',
};

const SYSTEM_DENTIST_FIELD_KEYS = new Set([
  'evaluationDate',
  'dentistName',
  'dentistCro',
  'dentistProfessionalContact',
]);

const CURRENT_PAIN_DETAIL_KEYS = new Set([
  'painLocations',
  'painPatternDetails',
  'averagePainLastWeek',
  'worstPainLastWeek',
  'painAggravatingFactors',
  'painReliefFactors',
  'hasMouthOpeningDifficulty',
  'mandibularFunctionSymptoms',
  'jointClickFrequency',
  'trainingTeethClenching',
  'trainingJawTensionMoment',
  'trainingInterruptedByPain',
  'trainingPerformanceImpact',
  'missedTrainingDuePain',
]);

const ACTIVE_ORTHODONTIC_BLOCKER_MESSAGE =
  'Não é possível continuar o processo antes de encerramento da fase ativa do tratamento ortodôntico';

const CHECKBOX_OTHER_DETAIL_BY_KEY: Record<string, string> = {
  expectedUseBenefitOther: 'expectedUseBenefit',
  imaginedUseBarriersOther: 'imaginedUseBarriers',
};

function payloadHasCheckboxValue(payload: Record<string, string>, fieldKey: string, value: string) {
  return (payload[fieldKey] ?? '').split('|').includes(value);
}

function onlyDigits(value?: string) {
  return String(value ?? '').replace(/\D/g, '');
}

function formatCepValue(value: string) {
  const digits = onlyDigits(value).slice(0, 8);

  return digits.replace(/^(\d{5})(\d)/, '$1-$2');
}

function formatResidenceAddress(data: { street?: string; neighborhood?: string }) {
  return [data.street, data.neighborhood].filter(Boolean).join(' - ');
}

function composeResidenceFullAddress(payload: Record<string, string>) {
  const address = payload.residenceAddress?.trim();
  const complement = payload.residenceComplement?.trim();
  const cityState = [payload.residenceCity?.trim(), payload.residenceState?.trim()].filter(Boolean).join(' - ');

  return [address, complement, cityState].filter(Boolean).join(', ');
}

function getResidenceValue(payload: Record<string, string>) {
  return composeResidenceFullAddress(payload) || payload.fullAddress?.trim() || '';
}

function getCheckboxOtherDetailParentKey(fieldKey: string) {
  return CHECKBOX_OTHER_DETAIL_BY_KEY[fieldKey] ?? null;
}

function getCheckboxOtherDetailKeysForParent(parentKey: string) {
  return Object.entries(CHECKBOX_OTHER_DETAIL_BY_KEY)
    .filter(([, candidateParentKey]) => candidateParentKey === parentKey)
    .map(([detailKey]) => detailKey);
}

function getConditionalDetailParentKey(fieldKey: string) {
  return CLINICAL_DETAIL_PARENT_BY_KEY[fieldKey] ?? null;
}

function getConditionalDetailKeysForParent(parentKey: string) {
  return Object.entries(CLINICAL_DETAIL_PARENT_BY_KEY)
    .filter(([, candidateParentKey]) => candidateParentKey === parentKey)
    .map(([detailKey]) => detailKey);
}

function isFieldVisibleForPayload(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition,
  payload: Record<string, string>
) {
  if (!isSharedField(field)) {
    return true;
  }

  const parentKey = getConditionalDetailParentKey(field.key);

  if (parentKey) {
    return payload[parentKey] === 'yes';
  }

  if (CURRENT_PAIN_DETAIL_KEYS.has(field.key)) {
    return payload.hasCurrentPain === 'yes';
  }

  const checkboxOtherParentKey = getCheckboxOtherDetailParentKey(field.key);

  if (checkboxOtherParentKey) {
    return payloadHasCheckboxValue(payload, checkboxOtherParentKey, 'other');
  }

  if (payload.orthodonticTreatmentStatus === 'active' && field.key === 'needsAdaptedClinic') {
    return false;
  }

  return true;
}

function isFieldVisibleInSection(
  section: DisplaySharedSection,
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition,
  payload: Record<string, string>
) {
  if (!isFieldVisibleForPayload(field, payload)) {
    return false;
  }

  if (!['initial-data', 'clinical-initial-data'].includes(section.key) || !isSharedField(field) || field.ownerRole !== 'user') {
    return true;
  }

  const orthodonticAnswer = payload.orthodonticTreatmentStatus;

  if (!orthodonticAnswer || orthodonticAnswer === 'active') {
    return field.key === 'orthodonticTreatmentStatus';
  }

  return true;
}

function getPayloadBlockerMessage(payload: Record<string, string>) {
  return payload.orthodonticTreatmentStatus === 'active' ? ACTIVE_ORTHODONTIC_BLOCKER_MESSAGE : '';
}

function getHealthAnswerKey(fieldKey: string) {
  return `${fieldKey}__answer`;
}

function getHealthDescriptionLabel(fieldKey: string) {
  return fieldKey === 'currentTrainingHealthLimitations'
    ? 'Qual lesão/problema atual?'
    : 'Qual lesão/problema anterior?';
}

function getHealthAnswer(payload: Record<string, string>, fieldKey: string) {
  const explicitAnswer = payload[getHealthAnswerKey(fieldKey)];

  if (explicitAnswer) {
    return explicitAnswer;
  }

  const value = payload[fieldKey]?.trim().toLowerCase();

  if (!value) {
    return '';
  }

  return value === 'não' || value === 'nao' ? 'no' : 'yes';
}

function isCurrencyField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
) {
  return isSharedField(field) && [
    'monthlyTrainingLocationSpend',
    'annualAccessorySpend',
    'monthlySupplementSpend',
    'monthlyPersonalTrainerSpend',
    'monthlyNutritionistSpend',
  ].includes(field.key);
}

function isYesNoField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
): boolean {
  if (!isSharedField(field) || field.type !== 'select') {
    return false;
  }

  const values = new Set((field.options ?? []).map((option) => String(option.value)));
  return values.size === 2 && values.has('yes') && values.has('no');
}

function isRadioChoiceField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
): field is SharedIntakeFieldDefinition & { type: 'select' } {
  return isSharedField(field) && field.type === 'select' && (field.key === 'sleepBruxismStatus' || field.displayAs === 'radio');
}

function isConsentCheckboxField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
): boolean {
  return isSharedField(field) && field.type === 'checkbox-group' && field.key.endsWith('Consent');
}

function isTagAutocompleteCheckboxField(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
): boolean {
  return isSharedField(field) && field.type === 'checkbox-group' && ['currentSports', 'pastSports', 'accessories'].includes(field.key);
}

function getConsentLabel(field: SharedIntakeFieldDefinition, fallbackLabel: string) {
  if (field.key === 'clinicalPrivacyConsent') {
    return (
      <S.ConsentLabel>
        Declaro que li e entendi a <strong>Política de Privacidade da NEXOR</strong> e concordo com o tratamento dos
        meus dados pessoais, incluindo dados de saúde quando informados, para viabilizar meu atendimento clínico,
        registrar informações necessárias para meu cuidado e formar bases de dados preferencialmente anonimizadas para
        análise, pesquisa e desenvolvimento de produtos, conforme a LGPD.
      </S.ConsentLabel>
    );
  }

  if (field.key === 'serviceConsent') {
    return (
      <S.ConsentLabel>
        Tratamento necessário para <strong>inscrição, triagem, segurança da jornada</strong> e liberação da consulta
        inicial.
      </S.ConsentLabel>
    );
  }

  if (field.key === 'sensitiveHealthConsent') {
    return (
      <S.ConsentLabel>
        Tratamento de <strong>dados sensíveis de saúde/odontologia</strong> para avaliação do Biteplaner, com acesso
        restrito.
      </S.ConsentLabel>
    );
  }

  if (field.key === 'researchConsent') {
    return (
      <S.ConsentLabel>
        Autorizo uso em <strong>pesquisa e P&D</strong> em formato agregado, anonimizado ou pseudonimizado.
      </S.ConsentLabel>
    );
  }

  if (field.key === 'marketingConsent') {
    return (
      <S.ConsentLabel>
        Autorizo <strong>comunicações comerciais e educativas</strong> sobre Nexor e Biteplaner. Revogável a qualquer
        momento.
      </S.ConsentLabel>
    );
  }

  return <S.ConsentLabel>{fallbackLabel}</S.ConsentLabel>;
}

function getSharedRoleState(form: DemoWorkflowForm) {
  return form.roleState ?? {
    customer: form.status === 'submitted' ? 'submitted' : 'pending',
    dentist: 'locked' as const,
  };
}

function getWorkflowFormBlockerMessage(form: DemoWorkflowForm) {
  const blocker = form.summary && 'blocker' in form.summary ? form.summary.blocker : null;

  if (blocker === 'minor_without_guardian') {
    return 'Cadastro bloqueado: usuário menor de idade precisa que um responsável maior assuma ou crie a conta para continuar.';
  }

  if (blocker === 'active_orthodontic_treatment') {
    return 'Não é possível continuar com tratamento ortodôntico ativo. Procure orientação clínica antes de seguir com o Biteplaner.';
  }

  return null;
}

function getReadOnlyValue(value: unknown, field: SharedIntakeFieldDefinition) {
  if (Array.isArray(value)) {
    const labels = value.map((item) => field.options?.find((option) => option.value === item)?.label ?? String(item));
    return labels.length > 0 ? labels.join(', ') : 'Não informado';
  }

  if (value === null || value === undefined || value === '') {
    return 'Não informado';
  }

  if (field.options) {
    return field.options.find((option) => option.value === value)?.label ?? String(value);
  }

  return String(value);
}

function renderSectionDescription(description?: string) {
  if (!description) {
    return null;
  }

  const blocks = description.split(/\n{2,}/).map((block) => block.trim()).filter(Boolean);

  if (blocks.length <= 1) {
    return <S.Meta>{description}</S.Meta>;
  }

  return (
    <S.SectionDescription>
      {blocks.map((block, index) => {
        const lines = block.split('\n').map((line) => line.trim()).filter(Boolean);
        const [firstLine, ...restLines] = lines;
        const isGroupedList = restLines.length > 0 && restLines.every((line) => line.startsWith('→'));

        if (isGroupedList) {
          return (
            <div key={`${firstLine}-${index}`}>
              <strong>{firstLine}</strong>
              <ul>
                {restLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            </div>
          );
        }

        return <p key={`${firstLine}-${index}`}>{lines.join(' ')}</p>;
      })}
    </S.SectionDescription>
  );
}

function getSharedIntakeCanSubmit(form: DemoWorkflowForm, actorRole: WorkflowFormActorRole) {
  const roleState = getSharedRoleState(form);

  if (actorRole === 'user') {
    return roleState.customer !== 'locked' && !form.dentistReviewStartedAt;
  }

  if (actorRole === 'dentist') {
    return roleState.customer !== 'pending' && roleState.dentist !== 'submitted';
  }

  return false;
}

function hasMissingRequiredValue(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition,
  payload: Record<string, string>
) {
  if (!field.required) {
    return false;
  }

  if (isHealthConditionalField(field)) {
    const answer = payload[getHealthAnswerKey(field.key)] ?? '';

    if (answer === 'no') {
      return false;
    }

    if (answer === 'yes') {
      return !payload[field.key]?.trim();
    }

    return true;
  }

  return !payload[field.key]?.trim();
}

function isValidCpfValue(value: string) {
  const digits = sanitizeDocumentValue('cpf', value);

  if (digits.length !== 11 || /^(\d)\1{10}$/.test(digits)) {
    return false;
  }

  const numbers = digits.split('').map(Number);
  const calculateDigit = (length: number) => {
    const sum = numbers
      .slice(0, length)
      .reduce((total, digit, index) => total + digit * (length + 1 - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };

  return calculateDigit(9) === numbers[9] && calculateDigit(10) === numbers[10];
}

function parseBirthDateValue(value: string) {
  const trimmed = value.trim();
  const isoValue = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoValue) {
    return {
      year: Number(isoValue[1]),
      month: Number(isoValue[2]),
      day: Number(isoValue[3]),
    };
  }

  const digits = trimmed.replace(/\D/g, '');

  if (digits.length !== 8) {
    return null;
  }

  return {
    day: Number(digits.slice(0, 2)),
    month: Number(digits.slice(2, 4)),
    year: Number(digits.slice(4, 8)),
  };
}

function isValidBirthDateValue(value: string) {
  const parts = parseBirthDateValue(value);

  if (!parts) {
    return false;
  }

  const { year, month, day } = parts;
  const parsedDate = new Date(year, month - 1, day);

  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month - 1 ||
    parsedDate.getDate() !== day
  ) {
    return false;
  }

  const today = new Date();
  const oldestAllowedBirthDate = new Date(today.getFullYear() - 120, today.getMonth(), today.getDate());

  return parsedDate <= today && parsedDate >= oldestAllowedBirthDate;
}

function getFieldValidationMessage(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition,
  payload: Record<string, string>
) {
  const value = payload[field.key] ?? '';

  if (hasMissingRequiredValue(field, payload)) {
    return 'Campo obrigatório';
  }

  if (field.key === 'cpf' && value.trim() && !isValidCpfValue(value)) {
    return 'CPF inválido. Confira os números informados.';
  }

  if (field.key === 'birthDate' && value.trim() && !isValidBirthDateValue(value)) {
    return 'Insira uma data valida';
  }

  if (field.key === 'residenceCep' && value.trim() && onlyDigits(value).length !== 8) {
    return 'CEP inválido. Informe 8 dígitos.';
  }

  return '';
}

function getRequiredLabel(label: ReactNode, required: boolean) {
  return required ? <>{label} (*)</> : label;
}

function normalizeFieldValue(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition,
  value: string
) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  if (field.key === 'phone') {
    return sanitizePhoneValue(trimmed);
  }

  if (field.key === 'cpf') {
    return sanitizeDocumentValue('cpf', trimmed);
  }

  if (field.key === 'birthDate') {
    return normalizeBirthDateValue(trimmed);
  }

  if (field.key === 'residenceCep') {
    return onlyDigits(trimmed);
  }

  if (isCurrencyField(field)) {
    return parseCurrencyValue(trimmed);
  }

  if (isSharedField(field)) {
    if (field.type === 'number' || field.type === 'score') {
      return Number(trimmed);
    }

    if (field.type === 'checkbox-group') {
      return trimmed.split('|').filter(Boolean);
    }
  }

  if (isScoreField(field)) {
    return Number(trimmed);
  }

  return trimmed;
}

function formatBirthDateValue(value: string) {
  const normalizedIso = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (normalizedIso) {
    return `${normalizedIso[3]}/${normalizedIso[2]}/${normalizedIso[1]}`;
  }

  const digits = value.replace(/\D/g, '').slice(0, 8);

  return digits
    .replace(/^(\d{2})(\d)/, '$1/$2')
    .replace(/^(\d{2})\/(\d{2})(\d)/, '$1/$2/$3');
}

function formatCurrencyValue(value: string | number) {
  const numericValue = typeof value === 'number' ? value : parseCurrencyValue(String(value));

  if (!Number.isFinite(numericValue) || numericValue <= 0) {
    return '';
  }

  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(numericValue).replace(/\u00a0/g, ' ');
}

function formatCurrencyInputValue(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return '';
  }

  const digits = trimmed.replace(/\D/g, '');

  if (!digits) {
    return '';
  }

  return formatCurrencyValue(Number(digits) / 100);
}

function parseCurrencyValue(value: string) {
  const trimmed = value.trim();

  if (!trimmed) {
    return 0;
  }

  const normalized = trimmed
    .replace(/[^\d,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.');
  const numericValue = Number(normalized);

  return Number.isFinite(numericValue) ? numericValue : 0;
}

function normalizeBirthDateValue(value: string) {
  const isoValue = value.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (isoValue) {
    return value;
  }

  const digits = value.replace(/\D/g, '').slice(0, 8);

  if (digits.length !== 8) {
    return value.trim();
  }

  return `${digits.slice(4, 8)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`;
}

function getFieldPlaceholder(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
) {
  if (field.key === 'phone') {
    return '(11) 99999-9999';
  }

  if (field.key === 'cpf') {
    return '000.000.000-00';
  }

  if (field.key === 'birthDate') {
    return 'DD/MM/AAAA';
  }

  if (field.key === 'residenceCep') {
    return '00000-000';
  }

  return undefined;
}

function normalizeNumericInputValue(field: SharedIntakeFieldDefinition, rawValue: string) {
  if (rawValue.trim() === '') {
    return '';
  }

  const numericValue = Number(rawValue);

  if (!Number.isFinite(numericValue)) {
    return '';
  }

  const min = typeof field.min === 'number' ? field.min : null;
  const max = typeof field.max === 'number' ? field.max : null;
  const clampedMin = min === null ? numericValue : Math.max(min, numericValue);
  const clampedValue = max === null ? clampedMin : Math.min(max, clampedMin);

  return String(clampedValue);
}

function getFieldSpan(field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition) {
  if (isSharedField(field)) {
    if (field.key === 'expectedUseBenefitOther' || field.key === 'imaginedUseBarriersOther') {
      return 12;
    }

    if (field.key === 'sleepBruxismStatus') {
      return 12;
    }

    if (field.type === 'textarea') {
      return 12;
    }

    if (isConsentCheckboxField(field)) {
      return 12;
    }

    if (isTagAutocompleteCheckboxField(field)) {
      return 6;
    }

    if (field.type === 'checkbox-group') {
      return 6;
    }

    if (isYesNoField(field)) {
      return 12;
    }

    if (field.type === 'score') {
      return 12;
    }

    if (field.type === 'select' || field.type === 'number') {
      return 3;
    }
  }

  if (field.key === 'fullName') {
    return 6;
  }

  if (field.key === 'phone') {
    return 3;
  }

  if (field.key === 'sportRoutine') {
    return 3;
  }

  if (isTextareaField(field)) {
    return 12;
  }

  if (isScoreField(field)) {
    return 3;
  }

  return 4;
}

function getBalancedFieldLayouts(
  fields: Array<IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition>
) {
  const rows: Array<Array<{ field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition; span: number }>> = [];
  let currentRow: Array<{ field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition; span: number }> = [];
  let currentSpan = 0;

  function flushRow() {
    if (currentRow.length > 0) {
      rows.push(currentRow);
      currentRow = [];
      currentSpan = 0;
    }
  }

  fields.forEach((field) => {
    const span = getFieldSpan(field);

    if (span === 12) {
      flushRow();
      rows.push([{ field, span }]);
      return;
    }

    if (currentSpan + span > 12) {
      flushRow();
    }

    currentRow.push({ field, span });
    currentSpan += span;

    if (currentSpan === 12) {
      flushRow();
    }
  });

  flushRow();

  return rows.flatMap((row) => {
    const total = row.reduce((sum, item) => sum + item.span, 0);
    let remaining = 12 - total;
    let index = 0;
    const balancedRow = row.map((item) => ({ ...item }));

    while (remaining > 0 && balancedRow.length > 0) {
      balancedRow[index % balancedRow.length].span += 1;
      remaining -= 1;
      index += 1;
    }

    return balancedRow;
  });
}

function FormItem({
  form,
  token,
  defaultValues,
  onSubmitted,
  actorRole,
  formPresentation,
  showFormHeader,
  showFormHeaderStatus,
  payloadExtras,
}: {
  form: DemoWorkflowForm;
  token?: string;
  defaultValues: Record<string, string>;
  onSubmitted: (form: DemoWorkflowForm) => void;
  actorRole: WorkflowFormActorRole;
  formPresentation: 'card' | 'flat';
  showFormHeader: boolean;
  showFormHeaderStatus: boolean;
  payloadExtras?: Record<string, unknown>;
}) {
  const definition = useMemo(() => getDefinition(form.templateKey), [form.templateKey]);
  const [payload, setPayload] = useState<Record<string, string>>(() =>
    getInitialPayload(form, definition, defaultValues, actorRole)
  );
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [error, setError] = useState('');
  const [stepError, setStepError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [residenceCepLookupError, setResidenceCepLookupError] = useState('');
  const [trainingSameAsResidence, setTrainingSameAsResidence] = useState(
    () => Boolean(getResidenceValue(payload) && payload.trainingCityOrNeighborhood === getResidenceValue(payload))
  );
  const [activeSectionIndex, setActiveSectionIndex] = useState(0);
  const [isEditingSubmitted, setIsEditingSubmitted] = useState(false);
  const formCardRef = useRef<HTMLElement | null>(null);
  const presentation = STATUS_PRESENTATION[form.status];
  const fields = getDefinitionFields(definition);
  const isSharedIntake = Boolean(definition.sharedIntake);
  const isReviewSurvey = !isSharedIntake && isReviewTemplate(form.templateKey);
  const hasRequiredReviewFields = isReviewSurvey && fields.some((field) => field.required);
  const roleState = getSharedRoleState(form);
  const [surveyOpen, setSurveyOpen] = useState(false);
  const visibleSharedSections: VisibleSharedSection[] =
    definition.sharedIntake?.sections
      .map((section) => ({
        ...section,
        fields: section.fields.filter((field) => field.visibleTo.includes(actorRole)),
      }))
      .filter((section) => section.fields.length > 0) ?? [];
  const displaySharedSections: DisplaySharedSection[] =
    form.templateKey === 'customer_pre_consultation_intake' && actorRole === 'dentist'
      ? getClinicalDentistDisplaySections(visibleSharedSections)
      : form.templateKey === 'customer_pre_consultation_intake' && actorRole === 'user'
      ? getClinicalCustomerDisplaySections(visibleSharedSections)
      : form.templateKey === 'customer_new_user_onboarding' && actorRole === 'user'
      ? getOnboardingDisplaySections(visibleSharedSections)
      : visibleSharedSections;
  const canEditSubmittedSharedIntake =
    isSharedIntake &&
    actorRole === 'dentist' &&
    roleState.customer !== 'pending' &&
    roleState.dentist === 'submitted';
  const canSubmit = isSharedIntake
    ? getSharedIntakeCanSubmit(form, actorRole) || isEditingSubmitted
    : form.status !== 'submitted' && fields.length > 0;
  const submitSectionKey =
    [...displaySharedSections]
      .reverse()
      .find((section) => section.fields.some((field) => canSubmit && field.ownerRole === actorRole))?.key ?? null;
  const firstActorSectionIndex = displaySharedSections.findIndex((section) =>
    section.fields.some((field) => field.ownerRole === actorRole)
  );
  const activeSharedSection = displaySharedSections[Math.min(activeSectionIndex, Math.max(displaySharedSections.length - 1, 0))];
  const activeSharedSectionIndex = activeSharedSection
    ? displaySharedSections.findIndex((section) => section.key === activeSharedSection.key)
    : 0;
  const isClinicalCustomerIntake = form.templateKey === 'customer_pre_consultation_intake' && actorRole === 'user';
  const isCustomerOnboarding = form.templateKey === 'customer_new_user_onboarding' && actorRole === 'user';
  const isClinicalPrivacyStep = isClinicalCustomerIntake && activeSharedSection?.key === 'clinical-privacy';
  const payloadBlockerMessage = isClinicalCustomerIntake ? getPayloadBlockerMessage(payload) : '';
  const navigationSharedSections =
    isClinicalCustomerIntake
      ? displaySharedSections.filter((section) => section.key !== 'clinical-privacy')
      : displaySharedSections;
  const navigationSharedSectionIndex = activeSharedSection
    ? Math.max(0, navigationSharedSections.findIndex((section) => section.key === activeSharedSection.key))
    : 0;
  const sharedProgress =
    navigationSharedSections.length > 0
      ? Math.round(((navigationSharedSectionIndex + 1) / navigationSharedSections.length) * 100)
      : 100;
  const isLastSharedSection = activeSharedSectionIndex === displaySharedSections.length - 1;
  const canGoBackToPreviousSharedSection = isClinicalCustomerIntake
    ? navigationSharedSectionIndex > 0
    : activeSharedSectionIndex > 0;
  const submitIsMissingRequiredFields = isSharedIntake
    ? getFirstMissingSectionIndex() >= 0
    : fields.some((field) => hasMissingRequiredValue(field, payload));

  useEffect(() => {
    setActiveSectionIndex(0);
    setIsEditingSubmitted(false);
    setStepError('');
    setFieldErrors({});
    setResidenceCepLookupError('');
    setTrainingSameAsResidence(false);
  }, [form.id, actorRole]);

  useEffect(() => {
    if (!trainingSameAsResidence) {
      return;
    }

    const residenceValue = getResidenceValue(payload);
    setPayload((current) => {
      if (current.trainingCityOrNeighborhood === residenceValue) {
        return current;
      }

      return { ...current, trainingCityOrNeighborhood: residenceValue };
    });
  }, [
    payload.fullAddress,
    payload.residenceAddress,
    payload.residenceCity,
    payload.residenceComplement,
    payload.residenceState,
    trainingSameAsResidence,
  ]);

  useEffect(() => {
    if (activeSectionIndex >= displaySharedSections.length) {
      setActiveSectionIndex(Math.max(displaySharedSections.length - 1, 0));
    }
  }, [activeSectionIndex, displaySharedSections.length]);

  async function lookupResidenceCep() {
    if (form.templateKey !== 'customer_new_user_onboarding' || typeof fetch !== 'function') {
      return;
    }

    const cep = onlyDigits(payload.residenceCep);
    if (cep.length !== 8) {
      return;
    }

    try {
      setResidenceCepLookupError('');
      const response = await fetch(`https://viacep.com.br/ws/${cep}/json/`);
      if (!response.ok) {
        throw new Error('CEP lookup failed');
      }

      const data = await response.json();
      if (data.erro) {
        throw new Error('CEP not found');
      }

      setPayload((current) => {
        if (onlyDigits(current.residenceCep) !== cep) {
          return current;
        }

        return {
          ...current,
          residenceAddress:
            formatResidenceAddress({ street: data.logradouro, neighborhood: data.bairro }) ||
            current.residenceAddress ||
            '',
          residenceComplement: data.complemento ?? current.residenceComplement ?? '',
          residenceCity: data.localidade ?? current.residenceCity ?? '',
          residenceState: data.uf ?? current.residenceState ?? '',
        };
      });
    } catch {
      setResidenceCepLookupError('Não foi possível preencher o endereço automaticamente por este CEP.');
    }
  }

  function getEditableFieldsForSection(section: DisplaySharedSection) {
    return section.fields.filter(
      (field) => canSubmit && field.ownerRole === actorRole && isFieldVisibleInSection(section, field, payload)
    );
  }

  function getFirstMissingSectionIndex() {
    return displaySharedSections.findIndex((section) =>
      getEditableFieldsForSection(section).some((field) => hasMissingRequiredValue(field, payload))
    );
  }

  function getFirstInvalidSectionIndex() {
    return displaySharedSections.findIndex((section) =>
      getEditableFieldsForSection(section).some((field) => getFieldValidationMessage(field, payload))
    );
  }

  function setFieldValidationError(
    field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition
  ) {
    const message = getFieldValidationMessage(field, payload);
    setFieldErrors((current) => {
      if (!message) {
        const { [field.key]: _removed, ...next } = current;
        return next;
      }

      return { ...current, [field.key]: message };
    });
    return message;
  }

  function clearFieldValidationError(fieldKey: string) {
    setFieldErrors((current) => {
      if (!current[fieldKey]) {
        return current;
      }

      const { [fieldKey]: _removed, ...next } = current;
      return next;
    });
  }

  function validateFieldsLocally(
    editableFields: Array<IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition>
  ) {
    const nextErrors = editableFields.reduce<Record<string, string>>((result, field) => {
      const message = getFieldValidationMessage(field, payload);
      if (message) {
        result[field.key] = message;
      }
      return result;
    }, {});
    setFieldErrors(nextErrors);
    return nextErrors;
  }

  function goToSection(index: number) {
    if (payloadBlockerMessage && index > activeSharedSectionIndex) {
      setStepError(payloadBlockerMessage);
      return;
    }

    setStepError('');
    setError('');
    setFeedback('');
    setFieldErrors({});
    setActiveSectionIndex(index);
  }

  function handleEditSubmittedSharedIntake() {
    setIsEditingSubmitted(true);
    goToSection(Math.max(firstActorSectionIndex, 0));
  }

  function handleNextSection() {
    if (!activeSharedSection) {
      return;
    }

    if (payloadBlockerMessage) {
      setStepError(payloadBlockerMessage);
      return;
    }

    const hasMissingRequiredField = getEditableFieldsForSection(activeSharedSection).some((field) =>
      hasMissingRequiredValue(field, payload)
    );

    if (hasMissingRequiredField) {
      validateFieldsLocally(getEditableFieldsForSection(activeSharedSection));
      setStepError('Preencha os campos obrigatórios desta etapa para continuar.');
      return;
    }

    const sectionFieldErrors = validateFieldsLocally(getEditableFieldsForSection(activeSharedSection));
    const invalidFieldMessage = Object.values(sectionFieldErrors).find(Boolean);

    if (invalidFieldMessage) {
      setStepError(invalidFieldMessage);
      return;
    }

    goToSection(Math.min(activeSharedSectionIndex + 1, displaySharedSections.length - 1));
    formCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!token || !canSubmit) {
      return;
    }

    setFeedback('');
    setError('');
    setStepError('');

    if (payloadBlockerMessage) {
      setError(payloadBlockerMessage);
      return;
    }

    const editableFields = fields.filter((field) =>
      (!isSharedField(field) || field.ownerRole === actorRole) && isFieldVisibleForPayload(field, payload)
    );
    const firstMissingSectionIndex = isSharedIntake ? getFirstMissingSectionIndex() : -1;
    const localFieldErrors = validateFieldsLocally(editableFields);

    if (firstMissingSectionIndex >= 0) {
      setActiveSectionIndex(firstMissingSectionIndex);
      setError('Preencha os campos obrigatórios antes de enviar o formulário.');
      return;
    }

    const invalidFieldMessage = Object.values(localFieldErrors).find(Boolean);

    if (invalidFieldMessage) {
      const invalidSectionIndex = isSharedIntake ? getFirstInvalidSectionIndex() : -1;

      if (invalidSectionIndex >= 0) {
        setActiveSectionIndex(invalidSectionIndex);
      }

      setError(invalidFieldMessage);
      return;
    }

    const invalidScoreField = fields.find((field) => {
      if (!isScoreField(field)) {
        return false;
      }

      const value = payload[field.key];

      if (!String(value ?? '').trim()) {
        return false;
      }

      const score = Number(value);
      return !Number.isFinite(score) || score < 1 || score > 5;
    });

    if (invalidScoreField) {
      setError(`Escolha uma nota de 1 a 5 estrelas em: ${invalidScoreField.label.replace(/^Nota - /, '')}.`);
      return;
    }

    setSubmitting(true);
    const normalizedValues = Object.fromEntries(
      editableFields
        .map((field) => [field.key, normalizeFieldValue(field, payload[field.key] ?? '')])
        .filter(([, value]) => value !== '')
    ) as Record<string, unknown>;
    if (form.templateKey === 'customer_new_user_onboarding') {
      const residenceFullAddress = composeResidenceFullAddress(payload);
      if (residenceFullAddress) {
        normalizedValues.fullAddress = residenceFullAddress;
      }
    }
    const normalizedPayload = isSharedIntake && definition.payloadMode !== 'flat'
      ? { [getSharedIntakePayloadKey(actorRole)]: normalizedValues }
      : normalizedValues;
    const payloadToSubmit = payloadExtras ? { ...normalizedPayload, ...payloadExtras } : normalizedPayload;

    try {
      const nextForm = await submitWorkflowForm(form.orderId, form.id, payloadToSubmit, token);
      onSubmitted(nextForm);
      setIsEditingSubmitted(false);
      setSurveyOpen(false);
      setFeedback('Formulário enviado.');
    } catch {
      setError('Não foi possível enviar este formulário agora.');
    } finally {
      setSubmitting(false);
    }
  }

  function renderStandardStepRail() {
    return (
      <S.StepRail>
        {navigationSharedSections.map((section, index) => {
          const displayIndex = displaySharedSections.findIndex((item) => item.key === section.key);

          return (
            <S.StepTab
              key={section.key}
              type="button"
              disabled={Boolean(payloadBlockerMessage && displayIndex > activeSharedSectionIndex)}
              $active={section.key === activeSharedSection?.key}
              $complete={displayIndex < activeSharedSectionIndex}
              onClick={() => goToSection(displayIndex)}
              aria-current={section.key === activeSharedSection?.key ? 'step' : undefined}
            >
              <S.StepNumber
                $active={section.key === activeSharedSection?.key}
                $complete={displayIndex < activeSharedSectionIndex}
              >
                {index + 1}
              </S.StepNumber>
              <S.StepTabLabel>{getCompactSectionTitle(section.title)}</S.StepTabLabel>
            </S.StepTab>
          );
        })}
      </S.StepRail>
    );
  }

  function renderOnboardingProgress() {
    return (
      <S.OnboardingProgressCard aria-label="Seu progresso">
        <S.ProgressCardTitle>Seu progresso</S.ProgressCardTitle>
        <S.OnboardingProgressRail>
          {navigationSharedSections.map((section, index) => {
            const displayIndex = displaySharedSections.findIndex((item) => item.key === section.key);
            const compactTitle = getCompactSectionTitle(section.title);
            const [firstLine, ...restLines] = compactTitle.split(/\s+E\s+|\s+PARA\s+/i);

            return (
              <S.OnboardingProgressStep
                key={section.key}
                type="button"
                disabled={Boolean(payloadBlockerMessage && displayIndex > activeSharedSectionIndex)}
                $active={section.key === activeSharedSection?.key}
                $complete={displayIndex < activeSharedSectionIndex}
                onClick={() => goToSection(displayIndex)}
                aria-current={section.key === activeSharedSection?.key ? 'step' : undefined}
                aria-label={compactTitle}
              >
                <S.OnboardingStepNumber
                  $active={section.key === activeSharedSection?.key}
                  $complete={displayIndex < activeSharedSectionIndex}
                >
                  {index + 1}
                </S.OnboardingStepNumber>
                <S.OnboardingStepText>
                  <span>{firstLine}</span>
                  {restLines.length > 0 ? <small>{restLines.join(' e ')}</small> : null}
                </S.OnboardingStepText>
              </S.OnboardingProgressStep>
            );
          })}
        </S.OnboardingProgressRail>
      </S.OnboardingProgressCard>
    );
  }

  function renderOnboardingSectionOverview() {
    return (
      <S.SectionOverviewCard>
        <S.SectionOverviewHeader>
          <S.SectionOverviewIcon aria-hidden="true">
            <ClipboardPlus size={34} strokeWidth={1.9} />
          </S.SectionOverviewIcon>
          <S.SectionOverviewCopy>
            <S.SectionOverviewKicker>
              Seção {navigationSharedSectionIndex + 1} de {navigationSharedSections.length}
            </S.SectionOverviewKicker>
            <S.SectionOverviewTitle>{getCompactSectionTitle(activeSharedSection?.title ?? '')}</S.SectionOverviewTitle>
            {activeSharedSection?.description ? (
              <S.SectionOverviewLead>{activeSharedSection.description}</S.SectionOverviewLead>
            ) : null}
          </S.SectionOverviewCopy>
          <S.SectionProgressPill aria-label="Progresso da seção atual">
            <span><strong>{sharedProgress}%</strong> concluído</span>
            <S.ProgressTrack aria-hidden="true">
              <S.ProgressFill
                initial={false}
                animate={{ width: `${sharedProgress}%` }}
                transition={{ duration: 0.28, ease: 'easeOut' }}
              />
            </S.ProgressTrack>
          </S.SectionProgressPill>
        </S.SectionOverviewHeader>
        <S.TrustBadgeStrip aria-label="Garantias de privacidade e governança">
          <S.TrustBadge><LockKeyhole size={24} /><span>Segurança de dados</span></S.TrustBadge>
          <S.TrustBadge><ShieldCheck size={24} /><span>Privacidade protegida</span></S.TrustBadge>
          <S.TrustBadge><Users size={24} /><span>Uso ético e responsável</span></S.TrustBadge>
          <S.TrustBadge><BarChart3 size={24} /><span>Análises agregadas e anonimizadas</span></S.TrustBadge>
        </S.TrustBadgeStrip>
      </S.SectionOverviewCard>
    );
  }

  return (
    <S.FormCard ref={formCardRef} $presentation={formPresentation}>
      {showFormHeader ? (
        <S.FormHeader>
          <div>
            <S.FormTitle>{definition.label}</S.FormTitle>
            <S.Description>{definition.description}</S.Description>
            {isSharedIntake && actorRole === 'user' && form.dentistReviewStartedAt ? (
              <S.LockNotice>Formulário em revisão pelo dentista.</S.LockNotice>
            ) : null}
            {isSharedIntake && actorRole === 'user' && roleState.customer === 'locked' ? (
              <S.Meta>Respostas do cliente bloqueadas para edição.</S.Meta>
            ) : null}
            {showFormHeaderStatus ? <S.Meta>Liberado em {formatDate(form.releasedAt)}</S.Meta> : null}
            {showFormHeaderStatus && form.submittedAt ? <S.Meta>Enviado em {formatDate(form.submittedAt)}</S.Meta> : null}
            {showFormHeaderStatus && form.summary?.scoreAverage !== null && form.summary?.scoreAverage !== undefined ? (
              <S.Meta>Nota media: {form.summary.scoreAverage.toFixed(1)}</S.Meta>
            ) : null}
            {getWorkflowFormBlockerMessage(form) ? (
              <S.Feedback $tone="error" role="alert">{getWorkflowFormBlockerMessage(form)}</S.Feedback>
            ) : null}
          </div>
          {showFormHeaderStatus ? <StatusIndicator color={presentation.color} label={presentation.label} /> : null}
        </S.FormHeader>
      ) : null}

      {isSharedIntake ? (
        <>
          {!isClinicalPrivacyStep ? (
            isCustomerOnboarding ? (
              <>
                {renderOnboardingSectionOverview()}
                {renderOnboardingProgress()}
              </>
            ) : (
              <S.IntakeProgressShell aria-label="Progresso do formulário compartilhado">
                <S.IntakeProgressHeader>
                  <div>
                    <S.StepKicker>
                      Seção {navigationSharedSectionIndex + 1} de {navigationSharedSections.length}
                    </S.StepKicker>
                    <S.SectionHeading>{activeSharedSection?.title}</S.SectionHeading>
                    {activeSharedSection?.description ? (
                      <S.SectionLead>{activeSharedSection.description}</S.SectionLead>
                    ) : null}
                  </div>
                  <S.StepProgressValue>{sharedProgress}% completo</S.StepProgressValue>
                </S.IntakeProgressHeader>
                <S.ProgressTrack aria-hidden="true">
                  <S.ProgressFill
                    initial={false}
                    animate={{ width: `${sharedProgress}%` }}
                    transition={{ duration: 0.28, ease: 'easeOut' }}
                  />
                </S.ProgressTrack>
                {renderStandardStepRail()}
              </S.IntakeProgressShell>
            )
          ) : null}

          {activeSharedSection
            ? (() => {
              const section = activeSharedSection;
              const visibleSectionFields = section.fields.filter((field) => isFieldVisibleInSection(section, field, payload));
              const editableSectionFields = visibleSectionFields.filter(
                (field) => canSubmit && field.ownerRole === actorRole
              );
              const readonlySectionFields = visibleSectionFields.filter((field) => !editableSectionFields.includes(field));

              if (isClinicalPrivacyStep) {
                const privacyField = editableSectionFields[0];
                const privacyControl = privacyField
                  ? renderFieldControl(
                    privacyField,
                    payload,
                    setPayload,
                    fieldErrors[privacyField.key],
                    () => setFieldValidationError(privacyField),
                    () => clearFieldValidationError(privacyField.key),
                    {
                      trainingSameAsResidence,
                      residenceValue: getResidenceValue(payload),
                      onTrainingSameAsResidenceChange: setTrainingSameAsResidence,
                      residenceCepLookupError,
                      onResidenceCepBlur: lookupResidenceCep,
                      onResidenceCepChange: () => setResidenceCepLookupError(''),
                    }
                  )
                  : null;
                return (
                  <S.AnimatedStep
                    key={section.key}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.22, ease: 'easeOut' }}
                  >
                    <S.PrivacyGate>
                      <S.PrivacyIntro>
                        <div>
                          <S.SectionHeading>Pré-requisito clínico Biteplaner</S.SectionHeading>
                          <S.PrivacyIntroText>
                            A NEXOR desenvolve pesquisas científicas e dispositivos técnicos personalizados para auxiliar atletas a treinarem com mais conforto, segurança, performance, consistência, saúde e longevidade.
                          </S.PrivacyIntroText>
                          <S.PrivacyIntroText>
                            Este formulário prepara sua pré-consulta clínica compartilhada com o dentista licenciado.
                          </S.PrivacyIntroText>
                          <S.Meta>* Indica uma pergunta obrigatória.</S.Meta>
                        </div>
                      </S.PrivacyIntro>

                      <S.PrivacyConsentArea>
                        <S.PrivacyConsentContent>
                          {privacyControl}
                          <S.PrivacyPurposeList aria-label="Finalidades principais">
                            <S.PrivacyPurposeItem>
                              <UserRound size={16} />
                              <span>viabilizar seu cadastro, atendimento clínico e uso dos serviços e dispositivos da NEXOR;</span>
                            </S.PrivacyPurposeItem>
                            <S.PrivacyPurposeItem>
                              <ShieldCheck size={16} />
                              <span>registrar informações necessárias para seu cuidado, segurança e acompanhamento ao longo do tempo;</span>
                            </S.PrivacyPurposeItem>
                            <S.PrivacyPurposeItem>
                              <Database size={16} />
                              <span>formar bases de dados, preferencialmente anonimizadas, para análise, pesquisa e desenvolvimento de produtos conforme a LGPD.</span>
                            </S.PrivacyPurposeItem>
                          </S.PrivacyPurposeList>
                          <S.PrivacyInfoBox>
                            <Info size={16} />
                            <span>
                              Você pode solicitar acesso, correção ou exclusão de dados excessivos, bem como revogar consentimento para comunicações não essenciais nos canais indicados na Política de Privacidade.
                            </span>
                          </S.PrivacyInfoBox>
                        </S.PrivacyConsentContent>
                      </S.PrivacyConsentArea>

                      <S.PrivacyActions>
                        <Button type="button" onClick={handleNextSection}>
                          Continuar
                        </Button>
                        {stepError ? <S.Feedback $tone="error" role="alert">{stepError}</S.Feedback> : null}
                      </S.PrivacyActions>
                    </S.PrivacyGate>
                  </S.AnimatedStep>
                );
              }

              return (
                <S.AnimatedStep
                  key={section.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.22, ease: 'easeOut' }}
                >
                  <S.FormSectionGroup>
                    {(section.childSections ?? [section]).map((childSection) => {
                      const editableChildFields = childSection.fields.filter(
                        (field) => editableSectionFields.includes(field)
                      );
                      const readonlyChildFields = childSection.fields.filter((field) =>
                        readonlySectionFields.includes(field)
                      );
                      const shouldShowSubsectionHeading =
                        Boolean(section.childSections) &&
                        (section.childSections?.length !== 1 || childSection.title !== section.title);

                      if (editableChildFields.length === 0 && readonlyChildFields.length === 0) {
                        return null;
                      }

                      return (
                        <S.FormSubsection key={childSection.key}>
                          {shouldShowSubsectionHeading ? (
                            <S.SubsectionHeading>{childSection.title}</S.SubsectionHeading>
                          ) : null}
                          {renderSectionDescription(childSection.description)}
                          {readonlyChildFields.length > 0 ? (
                            <S.ReadOnlyGrid>
                              {readonlyChildFields.map((field) => {
                                const source =
                                  form.payload?.[getSharedIntakePayloadKey(field.ownerRole)] as
                                    | Record<string, unknown>
                                    | undefined;

                                return (
                                  <S.ReadOnlyItem key={field.key}>
                                    <S.ReadOnlyLabel>{field.label}</S.ReadOnlyLabel>
                                    <S.ReadOnlyValue>{getReadOnlyValue(source?.[field.key], field)}</S.ReadOnlyValue>
                                  </S.ReadOnlyItem>
                                );
                              })}
                            </S.ReadOnlyGrid>
                          ) : null}
                          {editableChildFields.length > 0 ? (
                            <S.Fields>
                              {getBalancedFieldLayouts(editableChildFields).map(({ field, span }) => {
                                const fieldControl = renderFieldControl(
                                  field,
                                  payload,
                                  setPayload,
                                  fieldErrors[field.key],
                                  () => setFieldValidationError(field),
                                  () => clearFieldValidationError(field.key),
                                  {
                                    trainingSameAsResidence,
                                    residenceValue: getResidenceValue(payload),
                                    onTrainingSameAsResidenceChange: setTrainingSameAsResidence,
                                    residenceCepLookupError,
                                    onResidenceCepBlur: lookupResidenceCep,
                                    onResidenceCepChange: () => setResidenceCepLookupError(''),
                                  }
                                );

                                return (
                                  <S.FieldSlot key={field.key} $span={span}>
                                    {fieldControl}
                                  </S.FieldSlot>
                                );
                              })}
                            </S.Fields>
                          ) : null}
                        </S.FormSubsection>
                      );
                    })}
                    {payloadBlockerMessage ? (
                      <S.OrthodonticBlockerFeedback role="alert">
                        <S.OrthodonticBlockerIcon aria-label="Icone de tristeza">
                          <Frown size={24} />
                        </S.OrthodonticBlockerIcon>
                        <span>{payloadBlockerMessage}</span>
                      </S.OrthodonticBlockerFeedback>
                    ) : null}
                    {editableSectionFields.length > 0 ? (
                      <form onSubmit={handleSubmit}>
                        <S.Actions>
                          {canGoBackToPreviousSharedSection ? (
                            <Button type="button" variant="secondary" onClick={() => goToSection(activeSharedSectionIndex - 1)}>
                              Voltar etapa
                            </Button>
                          ) : null}
                          {isLastSharedSection || section.key === submitSectionKey ? (
                            <Button type="submit" disabled={submitting || submitIsMissingRequiredFields || Boolean(payloadBlockerMessage)}>
                              {submitting
                                ? 'Enviando...'
                                : actorRole === 'dentist'
                                  ? 'Salvar complemento do dentista'
                                  : 'Enviar formulário'}
                            </Button>
                          ) : payloadBlockerMessage ? null : (
                            <Button type="button" onClick={handleNextSection}>
                              Próxima etapa
                            </Button>
                          )}
                          {stepError ? <S.Feedback $tone="error" role="alert">{stepError}</S.Feedback> : null}
                        </S.Actions>
                      </form>
                    ) : (
                      <S.Actions>
                        {canEditSubmittedSharedIntake && !isEditingSubmitted ? (
                          <Button type="button" variant="secondary" onClick={handleEditSubmittedSharedIntake}>
                            Editar
                          </Button>
                        ) : canGoBackToPreviousSharedSection ? (
                          <Button type="button" variant="secondary" onClick={() => goToSection(activeSharedSectionIndex - 1)}>
                            Voltar etapa
                          </Button>
                        ) : null}
                        {!isLastSharedSection ? (
                          <Button type="button" onClick={handleNextSection}>
                            Próxima etapa
                          </Button>
                        ) : null}
                      </S.Actions>
                    )}
                  </S.FormSectionGroup>
                </S.AnimatedStep>
              );
            })()
            : null}
          {feedback ? <S.Feedback $tone="success">{feedback}</S.Feedback> : null}
          {error ? <S.Feedback $tone="error" role="alert">{error}</S.Feedback> : null}
          {!canSubmit ? (
            <S.Meta>
              {actorRole === 'dentist'
                ? 'Complemento do dentista indisponível ou já registrado.'
                : 'Registro salvo no histórico da ordem.'}
            </S.Meta>
          ) : null}
        </>
      ) : isReviewSurvey && canSubmit ? (
        <>
          <S.SurveyPrompt>
            <S.SurveyPromptIcon aria-hidden="true">
              <Star size={18} fill="currentColor" />
            </S.SurveyPromptIcon>
            <div>
              <S.SurveyPromptTitle>Survey de feedback</S.SurveyPromptTitle>
              <S.Meta>
                {hasRequiredReviewFields
                  ? 'Obrigatório para registrar esta interação da jornada.'
                  : 'Disponível para registrar esta interação da jornada.'}
              </S.Meta>
            </div>
            <Button
              type="button"
              onClick={() => {
                setError('');
                setFeedback('');
                setSurveyOpen(true);
              }}
              aria-label={hasRequiredReviewFields ? 'Responder survey obrigatório' : 'Responder survey'}
            >
              {hasRequiredReviewFields ? 'Responder survey obrigatório' : 'Responder survey'}
            </Button>
          </S.SurveyPrompt>
          {feedback ? <S.Feedback $tone="success">{feedback}</S.Feedback> : null}
          {error ? <S.Feedback $tone="error" role="alert">{error}</S.Feedback> : null}
          {surveyOpen ? (
            <S.ModalOverlay role="presentation">
              <S.Modal role="dialog" aria-modal="true" aria-labelledby={`survey-title-${form.id}`}>
                <S.ModalHeader>
                  <div>
                    <S.FormTitle id={`survey-title-${form.id}`}>{definition.label}</S.FormTitle>
                    <S.Description>Escolha uma nota de 1 a 5 estrelas para cada critério obrigatório.</S.Description>
                  </div>
                  <S.IconButton
                    type="button"
                    onClick={() => {
                      if (!submitting) {
                        setSurveyOpen(false);
                      }
                    }}
                    aria-label="Fechar survey"
                  >
                    <X size={18} />
                  </S.IconButton>
                </S.ModalHeader>
                <S.ModalForm onSubmit={handleSubmit}>
                  <S.SurveyIntro>
                    <S.SurveyIntroIcon aria-hidden="true">
                      <Star size={18} fill="currentColor" />
                    </S.SurveyIntroIcon>
                    <div>
                      <S.SurveyIntroTitle>Survey de feedback</S.SurveyIntroTitle>
                      <S.Description>
                        O envio fica salvo no histórico da ordem e alimenta as avaliações do perfil.
                      </S.Description>
                    </div>
                  </S.SurveyIntro>
                  {fields.map((field) => (
                    <S.SurveyField key={field.key}>
                      <S.SurveyLabel>
                        {field.label}
                        {field.required ? <span>(*)</span> : null}
                      </S.SurveyLabel>
                      {field.helpText ? <S.Meta>{field.helpText}</S.Meta> : null}
                      {isScoreField(field) ? (
                        <S.ScoreOptions
                          role="radiogroup"
                          aria-label={field.label}
                          onBlur={() => setFieldValidationError(field)}
                        >
                          {field.options?.map((option) => {
                            const selectedValue = Number(payload[field.key]);
                            const isSelected = payload[field.key] === String(option.value);
                            const isFilled = Number.isFinite(selectedValue) && option.value <= selectedValue;

                            return (
                              <S.ScoreOption key={option.value} $active={isFilled} $selected={isSelected}>
                                <input
                                  type="radio"
                                  name={`${form.id}-${field.key}`}
                                  value={option.value}
                                  checked={payload[field.key] === String(option.value)}
                                  onChange={(event) => {
                                    clearFieldValidationError(field.key);
                                    setPayload((current) => ({ ...current, [field.key]: event.target.value }));
                                  }}
                                />
                                <span>
                                  <Star size={24} fill="currentColor" aria-hidden="true" />
                                  <S.ScreenReaderText>{`${option.value} estrelas`}</S.ScreenReaderText>
                                </span>
                              </S.ScoreOption>
                            );
                          })}
                        </S.ScoreOptions>
                      ) : (
                        <S.TextArea
                          aria-label={field.label}
                          value={payload[field.key] ?? ''}
                          maxLength={500}
                          onBlur={() => setFieldValidationError(field)}
                          onChange={(event) => {
                            clearFieldValidationError(field.key);
                            setPayload((current) => ({ ...current, [field.key]: event.target.value }));
                          }}
                        />
                      )}
                      {isScoreField(field) && (field.minLabel || field.maxLabel) ? (
                        <S.ScoreScale>
                          <span>{field.minLabel}</span>
                          <span>{field.maxLabel}</span>
                        </S.ScoreScale>
                      ) : null}
                      {fieldErrors[field.key] ? (
                        <S.FieldError role="alert">{fieldErrors[field.key]}</S.FieldError>
                      ) : null}
                    </S.SurveyField>
                  ))}
                  {error ? <S.Feedback $tone="error" role="alert">{error}</S.Feedback> : null}
                  <S.ModalActions>
                    <Button type="button" variant="secondary" onClick={() => setSurveyOpen(false)} disabled={submitting}>
                      Responder depois
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? 'Enviando...' : 'Enviar survey'}
                    </Button>
                  </S.ModalActions>
                </S.ModalForm>
              </S.Modal>
            </S.ModalOverlay>
          ) : null}
        </>
      ) : canSubmit ? (
        <form onSubmit={handleSubmit}>
          <S.Fields>
            {getBalancedFieldLayouts(fields).map(({ field, span }) => {
              const fieldControl = renderFieldControl(
                field,
                payload,
                setPayload,
                fieldErrors[field.key],
                () => setFieldValidationError(field),
                () => clearFieldValidationError(field.key),
                {
                  trainingSameAsResidence,
                  residenceValue: getResidenceValue(payload),
                  onTrainingSameAsResidenceChange: setTrainingSameAsResidence,
                  residenceCepLookupError,
                  onResidenceCepBlur: lookupResidenceCep,
                  onResidenceCepChange: () => setResidenceCepLookupError(''),
                }
              );

              return (
                <S.FieldSlot key={field.key} $span={span}>
                  {fieldControl}
                </S.FieldSlot>
              );
            })}
          </S.Fields>
          <S.Actions>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Enviando...' : 'Enviar formulário'}
            </Button>
            {feedback ? <S.Feedback $tone="success">{feedback}</S.Feedback> : null}
            {error ? <S.Feedback $tone="error" role="alert">{error}</S.Feedback> : null}
          </S.Actions>
        </form>
      ) : (
        <S.Meta>{form.status === 'submitted' ? 'Registro salvo no histórico da ordem.' : 'Formulário sem campos configurados para esta demo.'}</S.Meta>
      )}
    </S.FormCard>
  );
}

function renderFieldControl(
  field: IntakeFieldDefinition | BiteplanerReviewFieldDefinition | SharedIntakeFieldDefinition,
  payload: Record<string, string>,
  setPayload: (updater: (current: Record<string, string>) => Record<string, string>) => void,
  fieldError = '',
  onFieldBlur: () => void = () => undefined,
  onFieldChange: () => void = () => undefined,
  context: RenderFieldControlContext = {}
) {
  if (isHealthConditionalField(field)) {
    const answer = getHealthAnswer(payload, field.key);
    const showDescription = answer === 'yes';
    const descriptionValue = answer === 'yes' ? payload[field.key] ?? '' : '';
    const answerError = fieldError && !answer ? fieldError : '';
    const descriptionError = fieldError && showDescription ? fieldError : '';

    return (
      <S.ConditionalFieldGroup>
        <S.RadioQuestionSlot>
          <RadioQuestionGroup
            name={field.key}
            label={field.label}
            required={field.required}
            value={answer}
            inline
            onBlur={onFieldBlur}
            error={answerError}
            onChange={(nextValue) => {
              onFieldChange();
              setPayload((current) => ({
                ...current,
                [getHealthAnswerKey(field.key)]: nextValue,
                [field.key]: nextValue === 'no' ? 'Não' : '',
              }));
            }}
            options={[
              { value: 'yes', label: 'Sim' },
              { value: 'no', label: 'Não' },
            ]}
          />
        </S.RadioQuestionSlot>
        {showDescription ? (
          <Field
            as="textarea"
            label={getHealthDescriptionLabel(field.key)}
            value={descriptionValue}
            required
            error={descriptionError}
            onBlur={onFieldBlur}
            onChange={(event: ChangeEvent<HTMLTextAreaElement>) => {
              onFieldChange();
              setPayload((current) => ({
                ...current,
                [getHealthAnswerKey(field.key)]: 'yes',
                [field.key]: event.target.value,
              }));
            }}
          />
        ) : null}
      </S.ConditionalFieldGroup>
    );
  }

  if (isSharedField(field) && isYesNoField(field)) {
    return (
      <S.RadioQuestionSlot>
        <RadioQuestionGroup
          name={field.key}
          label={field.label}
          required={field.required}
          value={payload[field.key] ?? ''}
          inline
          onBlur={onFieldBlur}
          error={fieldError}
          onChange={(nextValue) => {
            onFieldChange();
            setPayload((current) => {
              const nextPayload = { ...current, [field.key]: nextValue };

              if (nextValue !== 'yes') {
                getConditionalDetailKeysForParent(field.key).forEach((detailKey) => {
                  nextPayload[detailKey] = '';
                });

                if (field.key === 'hasCurrentPain') {
                  CURRENT_PAIN_DETAIL_KEYS.forEach((detailKey) => {
                    nextPayload[detailKey] = '';
                  });
                }
              }

              return nextPayload;
            });
          }}
          options={(field.options ?? []).map((option) => ({
            value: String(option.value),
            label: option.label,
          }))}
        />
      </S.RadioQuestionSlot>
    );
  }

  if (isRadioChoiceField(field)) {
    return (
      <S.StackedRadioQuestionSlot>
        <RadioQuestionGroup
          name={field.key}
          label={field.label}
          required={field.required}
          value={payload[field.key] ?? ''}
          onBlur={onFieldBlur}
          error={fieldError}
          onChange={(nextValue) => {
            onFieldChange();
            setPayload((current) => ({ ...current, [field.key]: nextValue }));
          }}
          options={(field.options ?? []).map((option) => ({
            value: String(option.value),
            label: option.label,
          }))}
        />
      </S.StackedRadioQuestionSlot>
    );
  }

  if (isSharedField(field) && field.type === 'select') {
    return (
      <Select
        label={field.label}
        value={payload[field.key] ?? ''}
        placeholder="Selecione"
        required={field.required}
        onChange={(value) => {
          onFieldChange();
          setPayload((current) => ({ ...current, [field.key]: value }));
        }}
        onBlur={onFieldBlur}
        error={fieldError}
        hint={field.helpText}
        options={(field.options ?? []).map((option) => ({
          value: String(option.value),
          label: option.label,
        }))}
      />
    );
  }

  if (isSharedField(field) && field.type === 'score') {
    return (
      <S.FieldShell as="fieldset" onBlur={onFieldBlur}>
        <legend>{getRequiredLabel(field.label, field.required)}</legend>
        {field.helpText ? <S.Meta>{field.helpText}</S.Meta> : null}
        <S.ScoreOptions role="radiogroup" aria-label={field.label}>
          {(field.options ?? []).map((option) => {
            const selectedValue = Number(payload[field.key]);
            const optionValue = Number(option.value);
            const isSelected = payload[field.key] === String(option.value);
            const isFilled = Number.isFinite(selectedValue) && optionValue <= selectedValue;

            return (
              <S.ScoreOption key={option.value} $active={isFilled} $selected={isSelected}>
                <input
                  type="radio"
                  name={field.key}
                  value={option.value}
                  checked={isSelected}
                  aria-label={`${option.label} de ${field.max ?? 10}`}
                  onChange={(event) => {
                    onFieldChange();
                    setPayload((current) => ({ ...current, [field.key]: event.target.value }));
                  }}
                />
                <span>
                  <Star size={24} fill="currentColor" aria-hidden="true" />
                  <S.ScreenReaderText>{`${option.label} de ${field.max ?? 10}`}</S.ScreenReaderText>
                </span>
              </S.ScoreOption>
            );
          })}
        </S.ScoreOptions>
        {fieldError ? <S.FieldError role="alert">{fieldError}</S.FieldError> : null}
      </S.FieldShell>
    );
  }

  if (isScoreField(field)) {
    return (
      <S.FieldShell>
        <Select
          label={field.label}
          value={payload[field.key] ?? ''}
          placeholder="Selecione"
          required={field.required}
          onChange={(value) => {
            onFieldChange();
            setPayload((current) => ({ ...current, [field.key]: value }));
          }}
          onBlur={onFieldBlur}
          error={fieldError}
          hint={field.helpText}
          options={(field.options ?? []).map((option) => ({
            value: String(option.value),
            label: option.label,
          }))}
        />
        {field.minLabel || field.maxLabel ? (
          <S.ScoreScale>
            <span>{field.minLabel}</span>
            <span>{field.maxLabel}</span>
          </S.ScoreScale>
        ) : null}
      </S.FieldShell>
    );
  }

  if (isSharedField(field) && field.type === 'checkbox-group') {
    const selected = new Set((payload[field.key] ?? '').split('|').filter(Boolean));
    const singleOption = field.options?.[0];

    if (isTagAutocompleteCheckboxField(field)) {
      return (
        <TagAutocompleteField
          label={field.label}
          value={Array.from(selected)}
          options={(field.options ?? []).map((option) => ({
            value: String(option.value),
            label: option.label,
          }))}
          required={field.required}
          placeholder="Buscar e adicionar..."
          hint={field.helpText}
          error={fieldError}
          onBlur={onFieldBlur}
          onChange={(nextValues) => {
            onFieldChange();
            setPayload((current) => ({
              ...current,
              [field.key]: nextValues.join('|'),
            }));
          }}
        />
      );
    }

    if (field.key === 'dentistClinicalDeclaration') {
      return (
        <CheckboxField
          checked={selected.size > 0}
          onChange={(checked) => {
            onFieldChange();
            setPayload((current) => ({
              ...current,
              [field.key]: checked ? String(singleOption?.value ?? 'accepted') : '',
            }));
          }}
          onBlur={onFieldBlur}
          error={fieldError}
          label={getRequiredLabel(field.label, field.required)}
          badge={field.required ? 'Obrigatório' : 'Opcional'}
          badgeTone={field.required ? 'required' : 'optional'}
        />
      );
    }

    if (isConsentCheckboxField(field) && singleOption) {
      return (
        <CheckboxField
          checked={selected.has(String(singleOption.value))}
          onChange={(checked) => {
            onFieldChange();
            setPayload((current) => ({
              ...current,
              [field.key]: checked ? String(singleOption.value) : '',
            }));
          }}
          onBlur={onFieldBlur}
          error={fieldError}
          label={getRequiredLabel(getConsentLabel(field, singleOption.label), field.required)}
          badge={field.required ? 'Obrigatório' : 'Opcional'}
          badgeTone={field.required ? 'required' : 'optional'}
        />
      );
    }

    return (
      <S.FieldShell as="fieldset" onBlur={onFieldBlur}>
        <legend>{getRequiredLabel(field.label, field.required)}</legend>
        <S.CheckboxGroup>
          {(field.options ?? []).map((option) => (
            <label key={option.value}>
              <input
                type="checkbox"
                checked={selected.has(String(option.value))}
                onChange={(event) => {
                  onFieldChange();
                  const nextSelected = new Set(selected);
                  if (event.target.checked) {
                    nextSelected.add(String(option.value));
                  } else {
                    nextSelected.delete(String(option.value));
                  }
                  setPayload((current) => ({
                    ...current,
                    [field.key]: Array.from(nextSelected).join('|'),
                    ...(!nextSelected.has('other')
                      ? Object.fromEntries(getCheckboxOtherDetailKeysForParent(field.key).map((detailKey) => [detailKey, '']))
                      : {}),
                  }));
                }}
              />
              {option.label}
            </label>
          ))}
        </S.CheckboxGroup>
        {fieldError ? <S.FieldError role="alert">{fieldError}</S.FieldError> : null}
      </S.FieldShell>
    );
  }

  const isTrainingLocationField = isSharedField(field) && field.key === 'trainingCityOrNeighborhood';
  const isResidenceCepField = isSharedField(field) && field.key === 'residenceCep';
  const isCurrencyInputField = isCurrencyField(field);
  const isSystemDentistField = isSharedField(field) && SYSTEM_DENTIST_FIELD_KEYS.has(field.key);
  const displayedFieldError = isResidenceCepField
    ? fieldError || context.residenceCepLookupError
    : fieldError;
  const fieldControl = (
    <Field
      as={isTextareaField(field) ? 'textarea' : 'input'}
      label={field.label}
      value={payload[field.key] ?? ''}
      required={field.required}
      error={displayedFieldError}
      hint={field.helpText}
      disabled={isSystemDentistField || (isTrainingLocationField && Boolean(context.trainingSameAsResidence))}
      type={field.key === 'phone' || field.key === 'cpf' || field.key === 'birthDate' || isResidenceCepField ? 'tel' : isSharedNumberField(field) && !isCurrencyInputField ? 'number' : 'text'}
      inputMode={field.key === 'phone' || field.key === 'cpf' || field.key === 'birthDate' || isResidenceCepField ? 'numeric' : isSharedNumberField(field) ? 'decimal' : undefined}
      min={isSharedNumberField(field) && !isCurrencyInputField ? field.min : undefined}
      max={isSharedNumberField(field) && !isCurrencyInputField ? field.max : undefined}
      maxLength={field.key === 'phone' ? getPhoneMaxLength() : field.key === 'cpf' ? getDocumentMaxLength('cpf') : field.key === 'birthDate' ? 10 : isResidenceCepField ? 9 : undefined}
      placeholder={getFieldPlaceholder(field)}
      onBlur={() => {
        onFieldBlur();
        if (isResidenceCepField) {
          context.onResidenceCepBlur?.();
        }
      }}
      onChange={(event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        onFieldChange();
        if (isResidenceCepField) {
          context.onResidenceCepChange?.();
        }
        const value = field.key === 'phone'
          ? formatPhoneValue(event.target.value)
          : field.key === 'cpf'
            ? formatDocumentValue('cpf', event.target.value)
            : field.key === 'birthDate'
              ? formatBirthDateValue(event.target.value)
              : isResidenceCepField
                ? formatCepValue(event.target.value)
              : isCurrencyInputField
                ? formatCurrencyInputValue(event.target.value)
          : isSharedNumberField(field)
            ? normalizeNumericInputValue(field, event.target.value)
            : event.target.value;
        setPayload((current) => ({ ...current, [field.key]: value }));
      }}
    />
  );

  if (isTrainingLocationField) {
    return (
      <S.TrainingLocationField>
        {fieldControl}
        <S.InlineCheckbox>
          <input
            type="checkbox"
            checked={Boolean(context.trainingSameAsResidence)}
            onChange={(event) => {
              const checked = event.target.checked;
              context.onTrainingSameAsResidenceChange?.(checked);

              if (checked) {
                onFieldChange();
                setPayload((current) => ({
                  ...current,
                  [field.key]: context.residenceValue ?? '',
                }));
              }
            }}
          />
          Mesmo local da residência
        </S.InlineCheckbox>
      </S.TrainingLocationField>
    );
  }

  return fieldControl;
}

export function WorkflowFormsPanel({
  orderId,
  token,
  title = 'Formulários do fluxo',
  description = 'Formulários operacionais liberados para a etapa atual da jornada.',
  templateFilter,
  defaultValues = {},
  forms,
  onFormsChange,
  variant = 'panel',
  actorRole = 'user',
  formPresentation = 'card',
  showFormHeader = true,
  showFormHeaderStatus = true,
  beforeFormsContent,
  formsLocked = false,
  payloadExtras,
}: WorkflowFormsPanelProps) {
  const [loadedForms, setLoadedForms] = useState<DemoWorkflowForm[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const formsSource = forms ?? loadedForms;

  function updateForms(updater: (current: DemoWorkflowForm[]) => DemoWorkflowForm[]) {
    if (forms) {
      onFormsChange?.(updater(forms));
      return;
    }

    setLoadedForms(updater);
  }

  useEffect(() => {
    if (forms) {
      setLoading(false);
      setError('');
      return;
    }

    if (!orderId || !token) {
      setLoadedForms([]);
      return;
    }

    let active = true;
    const currentOrderId = orderId;
    setLoading(true);
    setError('');

    async function loadForms() {
      try {
        const response = await fetchWorkflowForms(currentOrderId, token);

        if (active) {
          setLoadedForms(response.forms);
        }
      } catch {
        if (active) {
          setError('Não foi possível carregar os formulários desta etapa.');
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadForms();

    return () => {
      active = false;
    };
  }, [forms, orderId, token]);

  const visibleForms = useMemo(
    () => formsSource.filter((form) => !templateFilter || templateFilter.includes(form.templateKey)),
    [formsSource, templateFilter]
  );

  if (!loading && !error && visibleForms.length === 0) {
    return null;
  }

  return (
    <S.Panel $variant={variant} data-testid="workflow-forms-panel">
      {variant === 'panel' ? (
        <S.Header>
          <S.Title>{title}</S.Title>
          <S.Description>{description}</S.Description>
        </S.Header>
      ) : null}
      {beforeFormsContent}
      {loading ? <SkeletonCard lines={3} blockHeight="88px" /> : null}
      {error ? <S.Feedback $tone="error" role="alert">{error}</S.Feedback> : null}
      {!formsLocked ? (
        <S.FormGrid>
          {visibleForms.map((form) => (
            <FormItem
              key={form.id}
              form={form}
              token={token}
              defaultValues={defaultValues}
              actorRole={actorRole}
              formPresentation={formPresentation}
              showFormHeader={showFormHeader}
              showFormHeaderStatus={showFormHeaderStatus}
              payloadExtras={payloadExtras}
              onSubmitted={(nextForm) =>
                updateForms((current) => current.map((item) => (item.id === nextForm.id ? nextForm : item)))
              }
            />
          ))}
        </S.FormGrid>
      ) : null}
    </S.Panel>
  );
}
