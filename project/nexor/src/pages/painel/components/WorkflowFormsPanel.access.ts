import type { DemoWorkflowForm } from '../../../features/demo/biteplanerFlow';
import type { WorkflowFormActorRole } from './sharedIntakeDefinition';

export type WorkflowPayloadHydrationRole = WorkflowFormActorRole | 'partner';

export function canHydrateWorkflowFormPayload(
  form: Pick<DemoWorkflowForm, 'canViewPayload' | 'templateKey'>,
  actorRole: WorkflowPayloadHydrationRole
) {
  if (!form.canViewPayload) {
    return false;
  }

  if (form.templateKey === 'customer_pre_consultation_intake') {
    return actorRole === 'user' || actorRole === 'dentist';
  }

  if (
    form.templateKey === 'customer_new_user_onboarding' ||
    form.templateKey === 'customer_training_report'
  ) {
    return actorRole === 'user';
  }

  if (form.templateKey === 'external_production_review_by_dentist') {
    return actorRole === 'dentist';
  }


  if (
    form.templateKey === 'dentist_review_by_customer' ||
    form.templateKey === 'partner_review_by_customer' ||
    form.templateKey === 'influencer_review_by_customer'
  ) {
    return actorRole === 'user';
  }

  return false;
}
