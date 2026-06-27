import { Document, Page, StyleSheet, Text, View, pdf } from '@react-pdf/renderer';
import {
  getOrderDisplayId,
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

const missingValue = '';
const navy = '#0b3566';
const border = '#9fb2cc';

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

function value(rawValue: unknown): string {
  if (Array.isArray(rawValue)) {
    return rawValue.length > 0 ? rawValue.map(value).join(', ') : missingValue;
  }

  if (rawValue === null || rawValue === undefined || rawValue === '') {
    return missingValue;
  }

  if (rawValue === 'yes') return 'Sim';
  if (rawValue === 'no') return 'Não';

  return String(rawValue);
}

function dateValue(rawValue: unknown): string {
  if (typeof rawValue === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(rawValue)) {
    const [year, month, day] = rawValue.split('-');
    return `${day}/${month}/${year}`;
  }

  return value(rawValue);
}

function hasFilledValue(rawValue: unknown) {
  return hasWorkflowPayloadValue(rawValue);
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

function payloadHasCheckboxValue(payload: Record<string, unknown>, fieldKey: string, optionValue: string) {
  const rawValue = payload[fieldKey];

  if (Array.isArray(rawValue)) {
    return rawValue.some((item) => String(item) === optionValue);
  }

  return String(rawValue ?? '').split('|').includes(optionValue);
}

function getOptionLabel(field: SharedIntakeFieldDefinition, rawValue: unknown) {
  const option = field.options?.find((candidate) => String(candidate.value) === String(rawValue));
  return option?.label ?? value(rawValue);
}

function formatFieldValue(field: SharedIntakeFieldDefinition, rawValue: unknown) {
  if (Array.isArray(rawValue)) {
    return rawValue.length > 0 ? rawValue.map((item) => getOptionLabel(field, item)).join(', ') : missingValue;
  }

  if (field.type === 'checkbox-group' && typeof rawValue === 'string' && rawValue.includes('|')) {
    const values = rawValue.split('|').map((item) => item.trim()).filter(Boolean);
    return values.length > 0 ? values.map((item) => getOptionLabel(field, item)).join(', ') : missingValue;
  }

  if (field.type === 'date') {
    return dateValue(rawValue);
  }

  if (field.options?.length) {
    return getOptionLabel(field, rawValue);
  }

  return value(rawValue);
}

function getFieldPayloadValue(
  field: SharedIntakeFieldDefinition,
  customer: Record<string, unknown>,
  dentist: Record<string, unknown>
) {
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

function sentenceCase(rawValue: string) {
  const normalized = rawValue.trim().toLocaleLowerCase('pt-BR');
  return normalized ? `${normalized.charAt(0).toLocaleUpperCase('pt-BR')}${normalized.slice(1)}` : rawValue;
}

function formatSectionTitle(title: string) {
  return sentenceCase(title.replace(/^SEÇÃO\s*\d+\s*[-–—]\s*/i, ''));
}

const styles = StyleSheet.create({
  page: {
    padding: 18,
    fontFamily: 'Helvetica',
    fontSize: 8.5,
    color: '#111827',
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  titleBlock: {
    alignItems: 'center',
    flex: 1,
  },
  title: {
    color: navy,
    fontSize: 24,
    fontWeight: 700,
  },
  subtitle: {
    color: navy,
    fontSize: 14,
    fontWeight: 700,
  },
  dateBox: {
    width: 110,
    height: 42,
    borderWidth: 1,
    borderColor: '#6b7280',
    borderRadius: 6,
    padding: 8,
  },
  dateLabel: {
    fontSize: 8,
    marginBottom: 10,
  },
  sectionsStack: {
    gap: 7,
  },
  columns: {
    flexDirection: 'row',
    gap: 7,
    alignItems: 'flex-start',
  },
  column: {
    flex: 1,
    gap: 7,
  },
  section: {
    width: '100%',
    borderWidth: 1,
    borderColor: border,
    borderRadius: 7,
    overflow: 'hidden',
  },
  sectionFull: {
    width: '100%',
  },
  sectionHeader: {
    minHeight: 20,
    backgroundColor: navy,
    color: '#ffffff',
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 10,
    fontWeight: 700,
  },
  sectionBody: {
    padding: 8,
    gap: 3,
  },
  sectionMeta: {
    color: '#42526b',
    fontSize: 7.5,
    marginBottom: 3,
  },
  formRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 5,
    minHeight: 14,
  },
  formLabel: {
    fontSize: 8.2,
    color: '#111827',
  },
  formLine: {
    flexGrow: 1,
    borderBottomWidth: 1,
    borderBottomColor: '#a8b3c4',
    minHeight: 12,
    paddingLeft: 3,
  },
  formLineText: {
    fontSize: 8.2,
    color: '#111827',
  },
  stackedField: {
    gap: 2,
    minHeight: 26,
  },
  paragraphLine: {
    borderBottomWidth: 1,
    borderBottomColor: '#a8b3c4',
    minHeight: 14,
    paddingTop: 3,
    fontSize: 8.2,
    color: '#111827',
  },
  consent: {
    marginTop: 8,
    borderWidth: 1,
    borderColor: border,
    borderRadius: 7,
    overflow: 'hidden',
  },
  consentText: {
    fontSize: 8,
    lineHeight: 1.4,
    marginBottom: 16,
  },
  signatures: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 20,
  },
  signature: {
    flex: 1,
    borderTopWidth: 1,
    borderTopColor: '#374151',
    paddingTop: 4,
    textAlign: 'center',
    fontSize: 7.5,
  },
  footer: {
    marginTop: 8,
    padding: 8,
    borderRadius: 6,
    backgroundColor: '#edf2f8',
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
  },
  footerText: {
    flex: 1,
    color: navy,
    fontSize: 7.5,
    lineHeight: 1.35,
  },
});

function Section({
  number,
  title,
  children,
  fullWidth = false,
}: {
  number: number;
  title: string;
  children: React.ReactNode;
  fullWidth?: boolean;
}) {
  return (
    <View wrap={false} style={[styles.section, ...(fullWidth ? [styles.sectionFull] : [])]}>
      <Text style={styles.sectionHeader}>{number}. {title}</Text>
      <View style={styles.sectionBody}>{children}</View>
    </View>
  );
}

function PdfFieldItem({ label, rawValue }: { label: string; rawValue: unknown }) {
  const formatted = value(rawValue);
  const useStackedLine = label.length > 56 || formatted.length > 42;

  if (useStackedLine) {
    return (
      <View style={styles.stackedField}>
        <Text style={styles.formLabel}>{label}:</Text>
        <Text style={styles.paragraphLine}>{formatted}</Text>
      </View>
    );
  }

  return (
    <View style={styles.formRow}>
      <Text style={styles.formLabel}>{label}:</Text>
      <View style={styles.formLine}>
        <Text style={styles.formLineText}>{formatted}</Text>
      </View>
    </View>
  );
}

function PdfPayloadSection({
  index,
  section,
  customer,
  dentist,
  extraItems = [],
}: {
  index: number;
  section: SharedIntakeSectionDefinition;
  customer: Record<string, unknown>;
  dentist: Record<string, unknown>;
  extraItems?: Array<{ label: string; value: unknown }>;
}) {
  const fieldItems = section.fields
    .filter((field) => isFieldVisibleForPayload(field, customer, dentist))
    .map((field) => {
      const rawValue = getFieldPayloadValue(field, customer, dentist);

      if (!hasFilledValue(rawValue) && !field.required) {
        return null;
      }

      return {
        key: field.key,
        label: field.label,
        value: formatFieldValue(field, rawValue),
      };
    })
    .filter((item): item is { key: string; label: string; value: string } => Boolean(item));

  const items = [
    ...extraItems.map((item, itemIndex) => ({ key: `extra-${itemIndex}`, label: item.label, value: item.value })),
    ...fieldItems,
  ];

  if (items.length === 0) {
    return null;
  }

  return (
    <Section number={index} title={formatSectionTitle(section.title)} fullWidth={items.length > 10}>
      <Text style={styles.sectionMeta}>
        {getSectionStatus(section)} · {section.description ?? 'Resumo dos campos preenchidos na ficha clínica.'}
      </Text>
      {items.map((item) => (
        <PdfFieldItem key={item.key} label={item.label} rawValue={item.value} />
      ))}
    </Section>
  );
}

function FinalAnamnesisDocument({
  order,
  intakeForm,
  onboardingForm,
  draft,
}: {
  order: DemoOrderSummary;
  intakeForm: DemoWorkflowForm | undefined;
  onboardingForm: DemoWorkflowForm | undefined;
  draft: ProductionRequestDraft;
}) {
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
  const consultationDate = dateValue(dentist.consultationDate);
  const generatedAt = consultationDate !== missingValue ? consultationDate : new Date().toLocaleDateString('pt-BR');
  const patientName = value(customer.fullName ?? order.customer?.full_name);
  const payloadSections = SHARED_INITIAL_EVALUATION_INTAKE.sections
    .filter((section) => ANAMNESIS_SECTION_KEYS.has(section.key));
  const totalContentSections = payloadSections.length + 2;
  const firstColumnSectionCount = Math.ceil(totalContentSections / 2);

  return (
    <Document author="Nexor" title={`Ficha de Anamnese Odontológica ${getOrderDisplayId(order)}`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View style={styles.titleBlock}>
            <Text style={styles.title}>FICHA DE ANAMNESE</Text>
            <Text style={styles.subtitle}>ODONTOLÓGICA</Text>
          </View>
          <View style={styles.dateBox}>
            <Text style={styles.dateLabel}>DATA:</Text>
            <Text>{generatedAt}</Text>
          </View>
        </View>

        <View style={styles.columns}>
          {[0, 1].map((columnIndex) => (
            <View key={columnIndex} style={styles.column}>
              {payloadSections.map((section, index) => {
                const sectionNumber = index + 1;
                const belongsToColumn =
                  columnIndex === 0 ? sectionNumber <= firstColumnSectionCount : sectionNumber > firstColumnSectionCount;

                if (!belongsToColumn) {
                  return null;
                }

                return (
                  <PdfPayloadSection
                    key={section.key}
                    index={sectionNumber}
                    section={section}
                    customer={customer}
                    dentist={dentist}
                    extraItems={
                      section.key === 'initial-data'
                        ? [
                          { label: 'Nome completo do paciente', value: patientName },
                          { label: 'Telefone', value: customer.phone ?? order.customer?.phone },
                          { label: 'E-mail', value: customer.email ?? order.customer?.email },
                        ]
                        : []
                    }
                  />
                );
              })}

              {columnIndex === 1 ? (
                <>
                  <Section number={payloadSections.length + 1} title="RASTREABILIDADE E GUARDA">
                    <PdfFieldItem label="Data da consulta" rawValue={generatedAt} />
                    <PdfFieldItem label="Ordem" rawValue={getOrderDisplayId(order)} />
                    <PdfFieldItem label="Profissional responsável" rawValue={dentist.dentistName ?? 'Dentista licenciado'} />
                    <PdfFieldItem label="Guarda do registro" rawValue="Responsabilidade do dentista" />
                    <PdfFieldItem label="LGPD operacional da produção" rawValue={draft.lgpdConfirmed ? 'Ciente' : 'Pendente'} />
                    <PdfFieldItem label="Laboratório selecionado" rawValue={draft.selectedLabId} />
                  </Section>

                  <Section number={payloadSections.length + 2} title="OBSERVAÇÕES E CONDUTA">
                    <PdfFieldItem label="Resumo da anamnese" rawValue={draft.anamnesisSummary} />
                    <PdfFieldItem label="Solicitação de produção" rawValue={draft.productionRequestSummary} />
                    <PdfFieldItem label="Observações para o laboratório" rawValue={draft.labNotes} />
                    <PdfFieldItem label="Escaneamento 3D intraoral" rawValue={draft.scan3dFileName} />
                  </Section>
                </>
              ) : null}
            </View>
          ))}
        </View>

        <View style={styles.consent}>
          <Text style={styles.sectionHeader}>{payloadSections.length + 3}. TERMO DE CONSENTIMENTO</Text>
          <View style={styles.sectionBody}>
            <Text style={styles.consentText}>
              Declaro que as informações fornecidas são verdadeiras e autorizo o uso dos dados para fins de tratamento,
              acompanhamento odontológico e rastreabilidade operacional, conforme a Lei Geral de Proteção de Dados (LGPD).
              É responsabilidade do dentista manter este registro, pois a plataforma não mantém estes dados em banco de
              dados além do período operacional necessário para entrega do produto.
            </Text>
            <View style={styles.signatures}>
              <Text style={styles.signature}>Assinatura do paciente ou responsável</Text>
              <Text style={styles.signature}>Assinatura do cirurgião-dentista</Text>
              <Text style={styles.signature}>Data: {generatedAt}</Text>
            </View>
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            Suas informações estão protegidas. Esta ficha segue diretrizes de privacidade e segurança clínica da jornada odontológica.
          </Text>
          <Text style={styles.footerText}>
            Ordem {getOrderDisplayId(order)} | Laboratório: {value(draft.selectedLabId)} | LGPD: {draft.lgpdConfirmed ? 'Ciente' : 'Pendente'}
          </Text>
        </View>
      </Page>
    </Document>
  );
}

export async function createFinalAnamnesisPdfBlob(
  order: DemoOrderSummary,
  intakeForm: DemoWorkflowForm | undefined,
  onboardingForm: DemoWorkflowForm | undefined,
  draft: ProductionRequestDraft
) {
  return pdf(<FinalAnamnesisDocument order={order} intakeForm={intakeForm} onboardingForm={onboardingForm} draft={draft} />).toBlob();
}
