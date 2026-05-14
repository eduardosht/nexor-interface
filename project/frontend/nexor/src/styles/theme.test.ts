import { lightTheme } from './theme';

describe('theme', () => {
  it('lightTheme tem bgBase claro', () => {
    expect(lightTheme.colors.bgBase).toBe('#FAFAFA');
  });

  it('lightTheme tem todas as chaves de cores', () => {
    const keys = ['bgBase', 'bgElevated', 'bgInset', 'textPrimary', 'textSecondary', 'borderSubtle', 'borderDefault', 'borderStrong'];
    keys.forEach(k => expect(lightTheme.colors).toHaveProperty(k));
  });
});
