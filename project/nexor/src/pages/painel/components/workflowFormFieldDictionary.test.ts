import { describe, expect, it } from 'vitest';
import { BITEPLANER_REVIEW_TEMPLATES } from '../biteplanerReviewForms';
import {
  CUSTOMER_NEW_USER_ONBOARDING,
  CUSTOMER_TRAINING_REPORT,
  SHARED_INITIAL_EVALUATION_INTAKE,
} from './sharedIntakeDefinition';
import {
  getWorkflowFormDictionary,
  getWorkflowFormPayloadSection,
  getWorkflowFieldPayloadValue,
} from './workflowFormFieldDictionary';

function sharedFieldKeys(definition: typeof SHARED_INITIAL_EVALUATION_INTAKE) {
  return definition.sections.flatMap((section) => section.fields.map((field) => field.key));
}

describe('workflowFormFieldDictionary', () => {
  it.each([
    ['customer_new_user_onboarding', CUSTOMER_NEW_USER_ONBOARDING, 'flat'],
    ['customer_pre_consultation_intake', SHARED_INITIAL_EVALUATION_INTAKE, 'actor-nested'],
    ['customer_training_report', CUSTOMER_TRAINING_REPORT, 'flat'],
  ] as const)('maps every current shared field for %s', (templateKey, definition, payloadMode) => {
    const dictionary = getWorkflowFormDictionary(templateKey);

    expect(dictionary?.payloadMode).toBe(payloadMode);
    expect(Object.keys(dictionary?.fieldsByKey ?? {}).sort()).toEqual(sharedFieldKeys(definition).sort());
  });

  it('maps every current review field', () => {
    Object.entries(BITEPLANER_REVIEW_TEMPLATES).forEach(([templateKey, template]) => {
      const dictionary = getWorkflowFormDictionary(templateKey);

      expect(dictionary?.payloadMode).toBe('review');
      expect(Object.keys(dictionary?.fieldsByKey ?? {}).sort()).toEqual(
        template.fields.map((field) => field.key).sort()
      );
    });
  });

  it('reads definitive actor-nested intake values by role', () => {
    const payload = {
      customer: {
        fullName: 'Edu Cliente',
        hasCurrentPain: 'yes',
      },
      dentist: {
        painlessMaxOpeningMm: 42,
      },
    };

    expect(getWorkflowFormPayloadSection(payload, 'customer_pre_consultation_intake', 'customer')).toEqual(payload.customer);
    expect(getWorkflowFormPayloadSection(payload, 'customer_pre_consultation_intake', 'dentist')).toEqual(payload.dentist);
    expect(getWorkflowFieldPayloadValue(payload, 'customer_pre_consultation_intake', 'hasCurrentPain')).toBe('yes');
    expect(getWorkflowFieldPayloadValue(payload, 'customer_pre_consultation_intake', 'painlessMaxOpeningMm')).toBe(42);
  });
});

