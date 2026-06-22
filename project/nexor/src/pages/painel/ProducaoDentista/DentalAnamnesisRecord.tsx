import {
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Download,
  Sparkles,
  Stethoscope,
} from 'lucide-react';
import { Button } from '@nexor/design-system';
import { useEffect, useRef, useState, type ChangeEvent, type ComponentProps, type ReactNode } from 'react';
import {
  formatDate,
  getOrderDisplayId,
  getOrderClinicalPracticeLocation,
  type BiteplanerPurchaseConfiguration,
  type DemoOrderSummary,
  type DemoWorkflowForm,
  type ProductionRequestDraft,
} from '../../../features/demo/biteplanerFlow';
import {
  SHARED_INITIAL_EVALUATION_INTAKE,
  type SharedIntakeFieldDefinition,
  type SharedIntakeSectionDefinition,
} from '../components/sharedIntakeDefinition';
import {
  getWorkflowFormPayloadSection,
  hasWorkflowPayloadValue,
  isAffirmativeWorkflowValue,
} from '../components/workflowFormFieldDictionary';
import * as S from './DentalAnamnesisRecord.styles';

type DentalAnamnesisRecordProps = {
  order: DemoOrderSummary;
  intakeForm?: DemoWorkflowForm;
  onboardingForm?: DemoWorkflowForm;
  draft: ProductionRequestDraft;
  onSummaryChange: (value: string) => void;
  onDownloadAnamnesisPdf?: () => void;
};

type SectionConfig = {
  id: string;
  title: string;
  description: string;
  status?: string;
  content: ReactNode;
};

const ANAMNESIS_SECTION_KEYS = new Set([
  'initial-data',
  'medical-history',
  'dental-orofacial-history',
  'current-pain-function',
  'life-habits',
  'biteplaner-experience',
  'dentist-clinical-complement',
]);

const HIDDEN_SUMMARY_FIELD_KEYS = new Set(['dentistClinicalDeclaration']);

const missingValue = 'Não informado no fluxo atual';

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
  openingMidlineDeviationSide: 'openingMidlineDeviation',
};

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

const CHECKBOX_OTHER_DETAIL_BY_KEY: Record<string, string> = {
  expectedUseBenefitOther: 'expectedUseBenefit',
  imaginedUseBarriersOther: 'imaginedUseBarriers',
};

function formatValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.join(', ') : missingValue;
  }

  if (value === null || value === undefined || value === '') {
    return missingValue;
  }

  if (value === 'yes') {
    return 'Sim';
  }

  if (value === 'no') {
    return 'Não';
  }

  return String(value);
}

function hasFilledValue(value: unknown) {
  return hasWorkflowPayloadValue(value);
}

function payloadHasCheckboxValue(payload: Record<string, unknown>, fieldKey: string, value: string) {
  const rawValue = payload[fieldKey];

  if (Array.isArray(rawValue)) {
    return rawValue.some((item) => String(item) === value);
  }

  return String(rawValue ?? '').split('|').includes(value);
}

function formatClinicalDate(value: unknown) {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [year, month, day] = value.split('-');
    return `${day}/${month}/${year}`;
  }

  return typeof value === 'string' && value.trim() ? formatDate(value) : missingValue;
}

function getInitials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join('')
    .toUpperCase();
}

function calculateCompletion(values: unknown[]) {
  if (values.length === 0) {
    return 0;
  }

  const filled = values.filter((value) => {
    if (Array.isArray(value)) {
      return value.length > 0;
    }

    return value !== null && value !== undefined && value !== '';
  }).length;

  return Math.round((filled / values.length) * 100);
}

function FieldItem({ label, value, important = false }: { label: string; value: unknown; important?: boolean }) {
  const formatted = formatValue(value);

  return (
    <S.DataField $important={important}>
      <S.DataLabel>{label}</S.DataLabel>
      {formatted === missingValue ? <S.EmptyValue>{formatted}</S.EmptyValue> : <S.DataValue>{formatted}</S.DataValue>}
    </S.DataField>
  );
}

const BITEPLANER_MODEL_LABELS: Record<string, string> = {
  impacto: 'Linha Impacto',
  esportes: 'Linha Esportes',
};

const BITEPLANER_COLOR_LABELS: Record<string, string> = {
  preto: 'Preto',
  branco: 'Branco',
};

function formatBiteplanerModel(value: string) {
  return BITEPLANER_MODEL_LABELS[value] ?? value;
}

function formatBiteplanerColor(value: string) {
  return BITEPLANER_COLOR_LABELS[value] ?? value;
}

function formatPurchaseConfigurationSummary(configuration: BiteplanerPurchaseConfiguration | null | undefined) {
  if (!configuration) {
    return missingValue;
  }

  return `${formatBiteplanerModel(configuration.model)} / ${formatBiteplanerColor(configuration.color)} / ${configuration.quantity}`;
}

function isSamePurchaseConfiguration(
  left: BiteplanerPurchaseConfiguration | null | undefined,
  right: BiteplanerPurchaseConfiguration | null | undefined
) {
  return Boolean(
    left &&
    right &&
    left.model === right.model &&
    left.color === right.color &&
    left.quantity === right.quantity
  );
}

function calculateAgeYears(birthDate: unknown) {
  if (typeof birthDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(birthDate)) {
    return undefined;
  }

  const birth = new Date(`${birthDate}T00:00:00`);

  if (Number.isNaN(birth.getTime())) {
    return undefined;
  }

  const today = new Date();
  let age = today.getFullYear() - birth.getFullYear();
  const monthDelta = today.getMonth() - birth.getMonth();

  if (monthDelta < 0 || (monthDelta === 0 && today.getDate() < birth.getDate())) {
    age -= 1;
  }

  return age >= 0 ? age : undefined;
}

function buildCustomerProfileFallback(onboardingPayload: Record<string, unknown>) {
  return {
    ...onboardingPayload,
    ...(hasFilledValue(onboardingPayload.heightM) && !hasFilledValue(onboardingPayload.heightMeters)
      ? { heightMeters: onboardingPayload.heightM }
      : {}),
    ...(hasFilledValue(onboardingPayload.birthDate) && !hasFilledValue(onboardingPayload.ageYears)
      ? { ageYears: calculateAgeYears(onboardingPayload.birthDate) }
      : {}),
  };
}

function getOptionLabel(field: SharedIntakeFieldDefinition, value: unknown) {
  const option = field.options?.find((candidate) => String(candidate.value) === String(value));
  return option?.label ?? formatValue(value);
}

function formatFieldValue(field: SharedIntakeFieldDefinition, value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0 ? value.map((item) => getOptionLabel(field, item)).join(', ') : missingValue;
  }

  if (field.type === 'checkbox-group' && typeof value === 'string' && value.includes('|')) {
    const values = value.split('|').map((item) => item.trim()).filter(Boolean);
    return values.length > 0 ? values.map((item) => getOptionLabel(field, item)).join(', ') : missingValue;
  }

  if (field.type === 'date') {
    return formatClinicalDate(value);
  }

  if (field.options?.length) {
    return getOptionLabel(field, value);
  }

  return formatValue(value);
}

function getFieldPayloadValue(field: SharedIntakeFieldDefinition, customer: Record<string, unknown>, dentist: Record<string, unknown>) {
  return field.ownerRole === 'dentist' ? dentist[field.key] : customer[field.key];
}

function isFieldVisibleForPayload(
  field: SharedIntakeFieldDefinition,
  customer: Record<string, unknown>,
  dentist: Record<string, unknown>
) {
  if (HIDDEN_SUMMARY_FIELD_KEYS.has(field.key)) {
    return false;
  }

  const payload = field.ownerRole === 'dentist' ? dentist : customer;
  const parentKey = CLINICAL_DETAIL_PARENT_BY_KEY[field.key];

  if (parentKey) {
    return isAffirmativeWorkflowValue(payload[parentKey]) || hasFilledValue(payload[field.key]);
  }

  if (CURRENT_PAIN_DETAIL_KEYS.has(field.key)) {
    return isAffirmativeWorkflowValue(customer.hasCurrentPain) || hasFilledValue(customer[field.key]);
  }

  const checkboxOtherParentKey = CHECKBOX_OTHER_DETAIL_BY_KEY[field.key];

  if (checkboxOtherParentKey) {
    return payloadHasCheckboxValue(payload, checkboxOtherParentKey, 'other');
  }

  if (payload.orthodonticTreatmentStatus === 'active' && field.key === 'needsAdaptedClinic') {
    return false;
  }

  return true;
}

function getSectionStatus(section: SharedIntakeSectionDefinition) {
  const hasDentistFields = section.fields.some((field) => field.ownerRole === 'dentist');
  const hasCustomerFields = section.fields.some((field) => field.ownerRole === 'user');

  if (hasDentistFields && hasCustomerFields) {
    return 'Paciente / Profissional';
  }

  return hasDentistFields ? 'Profissional' : 'Paciente';
}

function sentenceCase(value: string) {
  const normalized = value.trim().toLocaleLowerCase('pt-BR');
  return normalized ? `${normalized.charAt(0).toLocaleUpperCase('pt-BR')}${normalized.slice(1)}` : value;
}

function formatSectionTitle(title: string) {
  return sentenceCase(title.replace(/^SEÇÃO\s*\d+\s*[-–—]\s*/i, ''));
}

function buildPayloadSection(
  section: SharedIntakeSectionDefinition,
  customer: Record<string, unknown>,
  dentist: Record<string, unknown>,
  extraItems: ReactNode[] = []
): SectionConfig | null {
  const fieldItems = section.fields
    .filter((field) => isFieldVisibleForPayload(field, customer, dentist))
    .map((field) => {
      const rawValue = getFieldPayloadValue(field, customer, dentist);

      if (!hasFilledValue(rawValue) && !field.required) {
        return null;
      }

      return (
        <FieldItem
          key={field.key}
          label={field.label}
          value={formatFieldValue(field, rawValue)}
          important={field.key === 'fullName' || field.key === 'consultationDate' || (field.required && !hasFilledValue(rawValue))}
        />
      );
    })
    .filter(Boolean);

  const contentItems = [...extraItems, ...fieldItems];

  if (contentItems.length === 0) {
    return null;
  }

  return {
    id: section.key,
    title: formatSectionTitle(section.title),
    description: section.description ?? 'Resumo dos campos preenchidos neste trecho do formulario clinico.',
    status: getSectionStatus(section),
    content: <S.Grid>{contentItems}</S.Grid>,
  };
}

type DebouncedTextAreaProps = Omit<ComponentProps<typeof S.TextArea>, 'onChange' | 'value'> & {
  value: string;
  onCommit: (value: string) => void;
  delayMs?: number;
};

function DebouncedTextArea({ value, onCommit, onBlur, delayMs = 300, ...props }: DebouncedTextAreaProps) {
  const [localValue, setLocalValue] = useState(value);
  const localValueRef = useRef(localValue);
  const committedValueRef = useRef(value);
  const onCommitRef = useRef(onCommit);

  useEffect(() => {
    onCommitRef.current = onCommit;
  }, [onCommit]);

  useEffect(() => {
    localValueRef.current = localValue;
  }, [localValue]);

  useEffect(() => {
    if (value === committedValueRef.current) {
      return;
    }

    committedValueRef.current = value;
    setLocalValue(value);
  }, [value]);

  useEffect(() => {
    if (localValue === committedValueRef.current) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      committedValueRef.current = localValue;
      onCommitRef.current(localValue);
    }, delayMs);

    return () => window.clearTimeout(timeoutId);
  }, [delayMs, localValue]);

  useEffect(
    () => () => {
      if (localValueRef.current !== committedValueRef.current) {
        committedValueRef.current = localValueRef.current;
        onCommitRef.current(localValueRef.current);
      }
    },
    []
  );

  function commitLocalValue() {
    if (localValue === committedValueRef.current) {
      return;
    }

    committedValueRef.current = localValue;
    onCommitRef.current(localValue);
  }

  return (
    <S.TextArea
      {...props}
      value={localValue}
      onBlur={(event) => {
        onBlur?.(event);
        commitLocalValue();
      }}
      onChange={(event: ChangeEvent<HTMLTextAreaElement>) => setLocalValue(event.target.value)}
    />
  );
}

export function DentalAnamnesisRecord({
  order,
  intakeForm,
  onboardingForm,
  draft,
  onSummaryChange,
  onDownloadAnamnesisPdf,
}: DentalAnamnesisRecordProps) {
  const payloadCustomer = getWorkflowFormPayloadSection(intakeForm?.payload, 'customer_pre_consultation_intake', 'customer');
  const onboardingCustomer = buildCustomerProfileFallback(
    getWorkflowFormPayloadSection(onboardingForm?.payload, 'customer_new_user_onboarding', 'root')
  );
  const baseCustomer: Record<string, unknown> = {
    ...onboardingCustomer,
    ...payloadCustomer,
  };
  const customer: Record<string, unknown> = {
    ...baseCustomer,
    ...(!hasFilledValue(baseCustomer.fullName) && hasFilledValue(order.customer?.full_name)
      ? { fullName: order.customer?.full_name }
      : {}),
    ...(!hasFilledValue(baseCustomer.phone) && hasFilledValue(order.customer?.phone) ? { phone: order.customer?.phone } : {}),
    ...(!hasFilledValue(baseCustomer.email) && hasFilledValue(order.customer?.email) ? { email: order.customer?.email } : {}),
  };
  const dentist = getWorkflowFormPayloadSection(intakeForm?.payload, 'customer_pre_consultation_intake', 'dentist');
  const patientName = formatValue(customer.fullName) !== missingValue
    ? formatValue(customer.fullName)
    : order.customer?.full_name ?? 'Paciente não identificado';
  const appointmentDate = dentist.consultationDate ?? intakeForm?.dentistSubmittedAt ?? intakeForm?.submittedAt ?? order.created_at;
  const hasDentistReview = Object.keys(dentist).length > 0;
  const purchasedConfiguration = draft.purchaseConfiguration ?? order.purchaseConfiguration ?? null;
  const recommendedConfiguration = order.dentistRecommendedPurchaseConfiguration ?? null;
  const visiblePurchaseConfiguration = purchasedConfiguration ?? recommendedConfiguration;
  const purchaseConfigurationChanged =
    purchasedConfiguration &&
    recommendedConfiguration &&
    !isSamePurchaseConfiguration(purchasedConfiguration, recommendedConfiguration);

  const summaryCompletionValues = SHARED_INITIAL_EVALUATION_INTAKE.sections
    .filter((section) => ANAMNESIS_SECTION_KEYS.has(section.key))
    .flatMap((section) =>
      section.fields
        .filter((field) => isFieldVisibleForPayload(field, customer, dentist))
        .map((field) => ({
          field,
          value: getFieldPayloadValue(field, customer, dentist),
        }))
        .filter(({ field, value }) => field.required || hasFilledValue(value))
        .map(({ value }) => value)
    );
  const completion = calculateCompletion(summaryCompletionValues);

  const payloadSections = SHARED_INITIAL_EVALUATION_INTAKE.sections
    .filter((section) => ANAMNESIS_SECTION_KEYS.has(section.key))
    .map((section) => {
      const extraItems =
        section.key === 'initial-data'
          ? [
            <FieldItem key="patient-full-name" label="Nome completo do paciente" value={patientName} important />,
            !hasFilledValue(customer.phone) && hasFilledValue(order.customer?.phone) ? (
              <FieldItem key="order-phone" label="Telefone" value={order.customer?.phone} />
            ) : null,
            !hasFilledValue(customer.email) && hasFilledValue(order.customer?.email) ? (
              <FieldItem key="order-email" label="Email" value={order.customer?.email} />
            ) : null,
          ].filter(Boolean)
          : [];

      return buildPayloadSection(section, customer, dentist, extraItems);
    })
    .filter((section): section is SectionConfig => Boolean(section));

  const sections: SectionConfig[] = [
    ...payloadSections,
    ...(visiblePurchaseConfiguration
      ? [
        {
          id: 'pedido-biteplaner',
          title: 'Pedido biteplaner',
          description:
            purchasedConfiguration
              ? 'Configuração confirmada pelo cliente na compra para seguir para produção.'
              : 'Configuração recomendada pelo dentista durante a consulta para pré-preencher a compra do cliente.',
          status: purchasedConfiguration ? 'Compra confirmada' : 'Recomendado',
          content: (
            <S.Grid>
              <FieldItem
                label="Modelo"
                value={formatBiteplanerModel(visiblePurchaseConfiguration.model)}
                important
              />
              <FieldItem
                label="Cor"
                value={formatBiteplanerColor(visiblePurchaseConfiguration.color)}
                important
              />
              <FieldItem
                label="Quantidade"
                value={visiblePurchaseConfiguration.quantity}
                important
              />
              <FieldItem
                label="Origem"
                value={purchasedConfiguration ? 'Confirmado pelo cliente na compra' : 'Recomendado pelo dentista na consulta'}
              />
              {purchasedConfiguration && recommendedConfiguration ? (
                <FieldItem
                  label="Comparação com a consulta"
                  value={purchaseConfigurationChanged ? 'Cliente alterou antes do pagamento' : 'Cliente manteve o combinado'}
                />
              ) : null}
              {purchasedConfiguration && recommendedConfiguration && purchaseConfigurationChanged ? (
                <FieldItem
                  label="Recomendado na consulta"
                  value={formatPurchaseConfigurationSummary(recommendedConfiguration)}
                />
              ) : null}
            </S.Grid>
          ),
        },
      ]
      : []),
    {
      id: 'rastreabilidade',
      title: 'Rastreabilidade e guarda',
      description: 'Dados operacionais de data, ordem e responsabilidade de guarda do registro clínico.',
      status: 'Governanca',
      content: (
        <S.Grid>
          <FieldItem label="Data da consulta" value={formatClinicalDate(appointmentDate)} />
          <FieldItem label="Ordem" value={getOrderDisplayId(order)} />
          <FieldItem label="Profissional responsável" value={formatValue(dentist.dentistName) !== missingValue ? dentist.dentistName : 'Dentista licenciado Biteplaner'} />
          <FieldItem label="Guarda do registro" value="Responsabilidade do dentista" />
          <FieldItem label="LGPD operacional da produção" value={draft.lgpdConfirmed ? 'Ciente' : 'Pendente'} />
        </S.Grid>
      ),
    },
    {
      id: 'observacoes',
      title: 'Observações profissionais',
      description: 'Campo amplo para registrar anamnese final e notas essenciais ao prontuario.',
      status: 'Profissional',
      content: (
        <DebouncedTextArea
          aria-label="Resumo da avaliação inicial / anamnese"
          maxLength={1200}
          placeholder="Registre apenas achados clínicos necessários para avaliação, aptidão e produção. Não inclua dados de terceiros."
          value={draft.anamnesisSummary}
          onCommit={onSummaryChange}
        />
      ),
    },
  ];
  const observationSection = sections.find((section) => section.id === 'observacoes');
  const navigableSections = sections.filter((section) => section.id !== 'observacoes');

  return (
    <S.Shell data-testid="dental-anamnesis-record">
      <S.Header>
        <S.HeaderTop>
          <S.Brand>
            <S.BrandMark>
              <Stethoscope size={24} />
            </S.BrandMark>
            <S.TitleGroup>
              <S.ClinicName>{getOrderClinicalPracticeLocation(order)?.name ?? 'Clínica Biteplaner'}</S.ClinicName>
              <S.Title>Ficha de anamnese odontológica</S.Title>
              <S.Subtitle>
                Documento clínico digital para revisão, complemento profissional e geração do registro final da ordem
                {` ${getOrderDisplayId(order)}`}.
              </S.Subtitle>
            </S.TitleGroup>
          </S.Brand>
          <S.HeaderMeta>
            <S.Badge $tone={completion >= 80 ? 'success' : 'warning'}>
              <CheckCircle2 size={14} />
              {completion >= 80 ? 'Completa' : 'Em andamento'}
            </S.Badge>
            <S.Badge>
              <CalendarDays size={14} />
              {formatClinicalDate(appointmentDate)}
            </S.Badge>
          </S.HeaderMeta>
        </S.HeaderTop>

        <S.StickySummary data-testid="dental-anamnesis-sticky-summary">
          <S.ProgressPanel>
            <S.ProgressHeader>
              <span>Progresso da ficha</span>
              <span>{completion}%</span>
            </S.ProgressHeader>
            <S.ProgressTrack>
              <S.ProgressFill $value={completion} />
            </S.ProgressTrack>
          </S.ProgressPanel>

          <S.PatientStrip>
            <S.Avatar>{getInitials(patientName) || 'P'}</S.Avatar>
            <div>
              <S.PatientName>{patientName}</S.PatientName>
              <S.PatientHint>{order.customer?.email ?? 'Email não informado'} · {order.customer?.phone ?? 'Telefone não informado'}</S.PatientHint>
            </div>
            <S.QuickItem>
              <S.QuickLabel>Status clínico</S.QuickLabel>
              <S.QuickValue>{hasDentistReview ? 'Revisado' : 'Aguardando revisão'}</S.QuickValue>
            </S.QuickItem>
          </S.PatientStrip>
        </S.StickySummary>
      </S.Header>

      <S.Body>
        <S.SideNav aria-label="Navegacao da ficha de anamnese">
          {navigableSections.map((section) => (
            <S.NavItem key={section.id} href={`#anamnese-${section.id}`}>
              <Sparkles size={13} />
              {section.title}
            </S.NavItem>
          ))}
        </S.SideNav>

        <S.Sections>
          {observationSection ? (
            <S.VisibleNotesCard id={`anamnese-${observationSection.id}`}>
              <S.VisibleNotesHeader>
                <div>
                  <S.SectionTitle>{observationSection.title}</S.SectionTitle>
                  <S.SectionDescription>{observationSection.description}</S.SectionDescription>
                </div>
                <S.Badge $tone="warning">{observationSection.status}</S.Badge>
              </S.VisibleNotesHeader>
              <S.CardContent>{observationSection.content}</S.CardContent>
            </S.VisibleNotesCard>
          ) : null}

          {navigableSections.map((section, index) => (
            <S.SectionGroup key={section.id}>
              <S.Card id={`anamnese-${section.id}`}>
                <S.CardSummary>
                  <div>
                    <S.SectionTitle>{index + 1}. {section.title}</S.SectionTitle>
                    <S.SectionDescription>{section.description}</S.SectionDescription>
                  </div>
                  <S.CardSummaryMeta>
                    <S.Badge>{section.status}</S.Badge>
                    <S.ExpandIcon aria-hidden="true">
                      <ChevronDown size={18} />
                    </S.ExpandIcon>
                  </S.CardSummaryMeta>
                </S.CardSummary>
                <S.CardContent>{section.content}</S.CardContent>
              </S.Card>
              {section.id === 'rastreabilidade' && onDownloadAnamnesisPdf ? (
                <S.DownloadActionRow>
                  <Button
                    type="button"
                    leadingIcon={<Download size={16} aria-hidden="true" />}
                    onClick={onDownloadAnamnesisPdf}
                  >
                    Baixar ficha de anamnese
                  </Button>
                </S.DownloadActionRow>
              ) : null}
            </S.SectionGroup>
          ))}
        </S.Sections>
      </S.Body>
    </S.Shell>
  );
}
