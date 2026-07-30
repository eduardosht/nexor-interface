import { describe, expect, it } from 'vitest';
import { canHydrateWorkflowFormPayload } from './WorkflowFormsPanel.access';

const form = (templateKey: string, canViewPayload = true) => ({
  templateKey,
  canViewPayload,
});

describe('WorkflowFormsPanel payload access', () => {
  it('allows clinical intake hydration only for customer and dentist roles', () => {
    expect(canHydrateWorkflowFormPayload(form('customer_pre_consultation_intake'), 'user')).toBe(true);
    expect(canHydrateWorkflowFormPayload(form('customer_pre_consultation_intake'), 'dentist')).toBe(true);
    expect(canHydrateWorkflowFormPayload(form('customer_pre_consultation_intake'), 'partner')).toBe(false);
  });

  it('does not hydrate customer-only payloads for operational roles', () => {
    expect(canHydrateWorkflowFormPayload(form('customer_new_user_onboarding'), 'user')).toBe(true);
    expect(canHydrateWorkflowFormPayload(form('customer_new_user_onboarding'), 'dentist')).toBe(false);
    expect(canHydrateWorkflowFormPayload(form('customer_training_report'), 'partner')).toBe(false);
  });

  it('blocks hydration when backend summary says payload is not viewable', () => {
    expect(canHydrateWorkflowFormPayload(form('customer_pre_consultation_intake', false), 'dentist')).toBe(false);
  });
});
