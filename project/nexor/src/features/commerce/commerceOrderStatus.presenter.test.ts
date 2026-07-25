import { describe, expect, it } from 'vitest';
import {
  COMMERCE_BACKEND_ORDER_STATUS_OPTIONS,
  getCommerceBackendOrderStatusColor,
  getCommerceBackendOrderStatusLabel,
} from './commerceOrderStatus.presenter';

describe('commerceOrderStatus.presenter', () => {
  it('presents the order completion waiting status', () => {
    expect(getCommerceBackendOrderStatusLabel('awaiting_order_completion')).toBe('Aguardando complemento da ordem');
    expect(getCommerceBackendOrderStatusColor('awaiting_order_completion')).toBe('goldenrod');
    expect(COMMERCE_BACKEND_ORDER_STATUS_OPTIONS).toContainEqual({
      value: 'awaiting_order_completion',
      label: 'Aguardando complemento da ordem',
    });
  });
});