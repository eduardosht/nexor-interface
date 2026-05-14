import { easeTechnical, fadeUp, staggerContainer } from './motion';

describe('motion constants', () => {
  it('easeTechnical é um array com 4 números', () => {
    expect(Array.isArray(easeTechnical)).toBe(true);
    expect(easeTechnical).toHaveLength(4);
  });

  it('fadeUp.hidden tem opacity 0', () => {
    const hidden = fadeUp.hidden as Record<string, unknown>;
    expect(hidden['opacity']).toBe(0);
  });

  it('fadeUp.visible tem opacity 1', () => {
    const visible = fadeUp.visible as Record<string, unknown>;
    expect(visible['opacity']).toBe(1);
  });

  it('staggerContainer.visible.transition.staggerChildren é 0.08', () => {
    const visible = staggerContainer.visible as Record<string, unknown>;
    const transition = visible['transition'] as Record<string, unknown>;
    expect(transition['staggerChildren']).toBe(0.08);
  });
});
