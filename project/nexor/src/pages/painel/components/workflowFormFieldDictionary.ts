import {
  BITEPLANER_REVIEW_TEMPLATES,
  type BiteplanerReviewTemplateKey,
} from '../biteplanerReviewForms';
import {
  CUSTOMER_NEW_USER_ONBOARDING,
  CUSTOMER_TRAINING_REPORT,
  SHARED_INITIAL_EVALUATION_INTAKE,
  getSharedIntakePayloadKey,
  type SharedIntakeDefinition,
  type SharedIntakeFieldDefinition,
  type SharedIntakeOwnerRole,
} from './sharedIntakeDefinition';

export type WorkflowFormTemplateKey =
  | 'customer_new_user_onboarding'
  | 'customer_pre_consultation_intake'
  | 'customer_training_report'
  | BiteplanerReviewTemplateKey;

export type WorkflowFormPayloadMode = 'flat' | 'actor-nested' | 'review';
export type WorkflowFormPayloadRole = 'customer' | 'dentist' | 'root';

export type WorkflowFormDictionaryField = {
  templateKey: WorkflowFormTemplateKey;
  key: string;
  label: string;
  required: boolean;
  type: string;
  sectionKey?: string;
  sectionTitle?: string;
  ownerRole?: SharedIntakeOwnerRole;
  payloadRole: WorkflowFormPayloadRole;
};

export type WorkflowFormFieldDictionary = {
  templateKey: WorkflowFormTemplateKey;
  label: string;
  payloadMode: WorkflowFormPayloadMode;
  fields: WorkflowFormDictionaryField[];
  fieldsByKey: Record<string, WorkflowFormDictionaryField>;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value);
}

export function hasWorkflowPayloadValue(value: unknown) {
  if (Array.isArray(value)) {
    return value.length > 0;
  }

  return value !== null && value !== undefined && value !== '';
}

export function isAffirmativeWorkflowValue(value: unknown) {
  if (value === true) {
    return true;
  }

  if (typeof value !== 'string') {
    return false;
  }

  return ['yes', 'sim', 'true', '1'].includes(value.trim().toLocaleLowerCase('pt-BR'));
}

function toFieldsByKey(fields: WorkflowFormDictionaryField[]) {
  return Object.fromEntries(fields.map((field) => [field.key, field]));
}

function getPayloadRole(payloadMode: Extract<WorkflowFormPayloadMode, 'flat' | 'actor-nested'>, ownerRole: SharedIntakeOwnerRole): WorkflowFormPayloadRole {
  if (payloadMode === 'flat') {
    return 'root';
  }

  return getSharedIntakePayloadKey(ownerRole) as WorkflowFormPayloadRole;
}

function buildSharedDictionary(
  templateKey: Extract<WorkflowFormTemplateKey, 'customer_new_user_onboarding' | 'customer_pre_consultation_intake' | 'customer_training_report'>,
  definition: SharedIntakeDefinition,
  payloadMode: Extract<WorkflowFormPayloadMode, 'flat' | 'actor-nested'>
): WorkflowFormFieldDictionary {
  const fields: WorkflowFormDictionaryField[] = definition.sections.flatMap((section) =>
    section.fields.map((field: SharedIntakeFieldDefinition) => ({
      templateKey,
      key: field.key,
      label: field.label,
      required: field.required,
      type: field.type,
      sectionKey: section.key,
      sectionTitle: section.title,
      ownerRole: field.ownerRole,
      payloadRole: getPayloadRole(payloadMode, field.ownerRole),
    }))
  );

  return {
    templateKey,
    label: definition.label,
    payloadMode,
    fields,
    fieldsByKey: toFieldsByKey(fields),
  };
}

function buildReviewDictionary(templateKey: BiteplanerReviewTemplateKey): WorkflowFormFieldDictionary {
  const template = BITEPLANER_REVIEW_TEMPLATES[templateKey];
  const fields = template.fields.map((field) => ({
    templateKey,
    key: field.key,
    label: field.label,
    required: field.required,
    type: field.type,
    payloadRole: 'root' as const,
  }));

  return {
    templateKey,
    label: template.label,
    payloadMode: 'review',
    fields,
    fieldsByKey: toFieldsByKey(fields),
  };
}

export const WORKFLOW_FORM_FIELD_DICTIONARIES: Record<WorkflowFormTemplateKey, WorkflowFormFieldDictionary> = {
  customer_new_user_onboarding: buildSharedDictionary(
    'customer_new_user_onboarding',
    CUSTOMER_NEW_USER_ONBOARDING,
    'flat'
  ),
  customer_pre_consultation_intake: buildSharedDictionary(
    'customer_pre_consultation_intake',
    SHARED_INITIAL_EVALUATION_INTAKE,
    'actor-nested'
  ),
  customer_training_report: buildSharedDictionary(
    'customer_training_report',
    CUSTOMER_TRAINING_REPORT,
    'flat'
  ),
  dentist_review_by_customer: buildReviewDictionary('dentist_review_by_customer'),
  lab_review_by_dentist: buildReviewDictionary('lab_review_by_dentist'),
  dentist_review_by_lab: buildReviewDictionary('dentist_review_by_lab'),
  partner_review_by_customer: buildReviewDictionary('partner_review_by_customer'),
  influencer_review_by_customer: buildReviewDictionary('influencer_review_by_customer'),
};

export function getWorkflowFormDictionary(templateKey: string) {
  return WORKFLOW_FORM_FIELD_DICTIONARIES[templateKey as WorkflowFormTemplateKey] ?? null;
}

export function getWorkflowFormPayloadSection(
  payloadValue: unknown,
  templateKey: string,
  requestedRole: WorkflowFormPayloadRole
) {
  const payload = isRecord(payloadValue) ? payloadValue : {};
  const dictionary = getWorkflowFormDictionary(templateKey);

  if (!dictionary || dictionary.payloadMode !== 'actor-nested') {
    return payload;
  }

  if (requestedRole === 'root') {
    return payload;
  }

  const rolePayload = payload[requestedRole];
  return isRecord(rolePayload) ? rolePayload : {};
}

export function getWorkflowFieldPayloadValue(
  payloadValue: unknown,
  templateKey: string,
  fieldKey: string,
  requestedRole: WorkflowFormPayloadRole = 'root'
) {
  const dictionary = getWorkflowFormDictionary(templateKey);
  const field = dictionary?.fieldsByKey[fieldKey];
  const payloadRole = field?.payloadRole ?? requestedRole;
  const source = getWorkflowFormPayloadSection(payloadValue, templateKey, payloadRole);

  return source[fieldKey];
}
