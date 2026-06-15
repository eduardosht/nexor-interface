import { describe, expect, it } from 'vitest';
import {
  JOURNEY_STAGE_LABELS,
  getOrderDisplayId,
  getOrderStatusPresentation,
  getStageLabel,
} from './orderPresenter';

describe('orderPresenter', () => {
  it('formats sequential display ids before falling back to the technical id', () => {
    expect(getOrderDisplayId({ id: 'uuid', display_number: 12 })).toBe('#12');
    expect(getOrderDisplayId({ id: 'uuid', displayNumber: '15' })).toBe('#15');
    expect(getOrderDisplayId({ id: 'uuid', displayId: '#22' })).toBe('#22');
    expect(getOrderDisplayId({ id: 'uuid' })).toBe('uuid');
  });

  it('returns only customer journey labels for order stages', () => {
    expect(getStageLabel({ stage: 'pre_requisite_pending' })).toBe('Pre-requisito');
    expect(getStageLabel({ stage: 'awaiting_initial_consultation' })).toBe('Consulta inicial');
    expect(getStageLabel({ stage: 'awaiting_clinical_decision' })).toBe('Decisão clínica');
    expect(getStageLabel({ stage: 'awaiting_payment' })).toBe('Compra');
    expect(getStageLabel({ stage: 'payment_confirmed' })).toBe('Laboratório');
    expect(getStageLabel({ stage: 'awaiting_dentist_forms' })).toBe('Laboratório');
    expect(getStageLabel({ stage: 'lab_production' })).toBe('Laboratório');
    expect(getStageLabel({ stage: 'awaiting_adaptation' })).toBe('Adaptação e acompanhamento');
    expect(JOURNEY_STAGE_LABELS).toEqual([
      'Pre-requisito',
      'Consulta inicial',
      'Decisão clínica',
      'Compra',
      'Laboratório',
      'Adaptação e acompanhamento',
    ]);
  });

  it('returns UTF-8 labels for statuses', () => {
    expect(getOrderStatusPresentation({ status: 'awaiting_dentist_forms' }).label).toBe(
      'Aguardando envio ao laboratório'
    );
    expect(getOrderStatusPresentation({ status: 'awaiting_lab_start' }).label).toBe(
      'Aguardando aceite do laboratório'
    );
    expect(getOrderStatusPresentation({ status: 'dentist_adjustment_required' }).label).toBe('Ajuste de produção');
  });
});
