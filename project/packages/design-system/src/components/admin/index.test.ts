import { describe, expect, it } from 'vitest';
import * as adminComponents from './index';

describe('admin design-system exports', () => {
  it('exposes shared, desktop, and mobile administrative components', () => {
    expect(adminComponents).toHaveProperty('AdminCollectionToolbar');
    expect(adminComponents).toHaveProperty('AdminDesktopDataTable');
    expect(adminComponents).toHaveProperty('AdminMobileRecordCard');
    expect(adminComponents).toHaveProperty('AdminResponsiveCollection');
  });
});
