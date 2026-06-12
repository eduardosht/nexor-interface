import { describe, expect, it } from 'vitest';
import { getBiteplanerReportOrders } from './reports';

describe('mock Biteplaner reports', () => {
  it('returns minimized finance rows without sensitive health fields', () => {
    const report = getBiteplanerReportOrders({ purpose: 'finance' });

    expect(report.fields.map((field) => field.key)).toContain('paymentStatus');
    expect(report.fields.map((field) => field.key)).not.toContain('currentTrainingHealthLimitations');
    expect(report.rows.length).toBeGreaterThan(0);
  });
});
