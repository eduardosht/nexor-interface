import { describe, expect, it } from 'vitest';
import { getOrderDisplayId, getOrderStatusPresentation, getStageLabel } from './orderPresenter';

describe('orderPresenter', () => {
  it('formats sequential display ids before falling back to the technical id', () => {
    expect(getOrderDisplayId({ id: 'uuid', display_number: 12 })).toBe('#12');
    expect(getOrderDisplayId({ id: 'uuid', displayNumber: '15' })).toBe('#15');
    expect(getOrderDisplayId({ id: 'uuid', displayId: '#22' })).toBe('#22');
    expect(getOrderDisplayId({ id: 'uuid' })).toBe('uuid');
  });

  it('returns UTF-8 labels for stages and statuses', () => {
    expect(getStageLabel({ stage: 'awaiting_clinical_decision' })).toBe('Decisão clínica');
    expect(getStageLabel({ stage: 'lab_production' })).toBe('Em produção');
    expect(getOrderStatusPresentation({ status: 'awaiting_lab_start' }).label).toBe(
      'Aguardando aceite do laboratório'
    );
    expect(getOrderStatusPresentation({ status: 'dentist_adjustment_required' }).label).toBe(
      'Ajuste de produção'
    );
  });
});
