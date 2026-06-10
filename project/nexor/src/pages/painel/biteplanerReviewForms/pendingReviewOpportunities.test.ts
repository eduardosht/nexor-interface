import { describe, expect, it } from 'vitest';
import type { AccessMode, DemoOrderSummary, DemoWorkflowForm } from '../../../features/demo/biteplanerFlow';
import {
  FEEDBACK_PROMPT_SUPPRESSION_TTL_MS,
  getFeedbackPromptSuppressionKey,
  getPendingReviewOpportunities,
  isFeedbackPromptSuppressed,
} from './index';

const baseOrder: DemoOrderSummary = {
  id: 'BP-DEMO-001',
  displayId: 'BP-DEMO-001',
  status: 'completed',
  statusLabel: 'Finalizado',
  stage: 'completed',
  created_at: '2026-05-01T10:00:00.000Z',
  customer: { full_name: 'Cliente Demo', email: 'cliente@nexor.dev', phone: null },
  dentist: { full_name: 'Dra. Helena', email: 'dentista@nexor.dev' },
  practice_location: { id: 'practice-1', name: 'Clínica Nexor' },
};

function form(
  templateKey: string,
  actorStatus: DemoWorkflowForm['status'],
  releasedAt: string,
  orderId = baseOrder.id
): DemoWorkflowForm {
  return {
    id: `${orderId}-${templateKey}`,
    orderId,
    templateKey,
    stepKey: templateKey,
    status: actorStatus,
    canViewPayload: true,
    summary: null,
    releasedAt,
    submittedAt: null,
    payload: null,
  };
}

function select(mode: AccessMode, forms: DemoWorkflowForm[]) {
  return getPendingReviewOpportunities({
    mode,
    forms,
    orders: [baseOrder],
  });
}

describe('getPendingReviewOpportunities', () => {
  it('returns only pending review forms owned by the current actor mode', () => {
    const opportunities = select('user', [
      form('partner_review_by_customer', 'pending', '2026-05-01T10:08:00.000Z'),
      form('dentist_review_by_customer', 'submitted', '2026-05-04T15:00:00.000Z'),
      form('lab_review_by_dentist', 'pending', '2026-05-04T09:00:00.000Z'),
      form('customer_pre_consultation_intake', 'pending', '2026-05-01T10:05:00.000Z'),
    ]);

    expect(opportunities).toHaveLength(1);
    expect(opportunities[0]).toMatchObject({
      id: 'BP-DEMO-001-partner_review_by_customer',
      templateKey: 'partner_review_by_customer',
      actorMode: 'user',
      title: 'Avalie o parceiro indicador',
      route: '/painel/biteplaner/avaliacoes?mode=user&surveyId=BP-DEMO-001-partner_review_by_customer',
    });
  });

  it('prioritizes higher value prompts before older lower priority prompts', () => {
    const opportunities = select('dentist', [
      form('lab_review_by_dentist', 'pending', '2026-05-01T09:00:00.000Z'),
      form('lab_review_by_dentist', 'pending', '2026-05-05T09:00:00.000Z', 'BP-DEMO-002'),
    ]);

    expect(opportunities.map((item) => item.orderId)).toEqual(['BP-DEMO-002', 'BP-DEMO-001']);
  });

  it('filters dismissed prompts without submitting the survey', () => {
    const suppressionKey = getFeedbackPromptSuppressionKey(
      form('dentist_review_by_lab', 'pending', '2026-05-03T08:30:00.000Z').id
    );
    const now = new Date('2026-05-10T12:00:00.000Z').getTime();

    expect(isFeedbackPromptSuppressed(null, now)).toBe(false);
    expect(isFeedbackPromptSuppressed(String(now + FEEDBACK_PROMPT_SUPPRESSION_TTL_MS), now)).toBe(true);
    expect(isFeedbackPromptSuppressed(String(now - 1), now)).toBe(false);
    expect(suppressionKey).toContain('biteplaner-feedback-prompt-dismissed:');
  });
});
