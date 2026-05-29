import { describe, expect, it } from 'vitest';
import { publicOptimizedImages } from './publicOptimizedImages';

describe('publicOptimizedImages', () => {
  it('exposes modern image variants for public Home and Biteplaner assets', () => {
    expect(publicOptimizedImages.home.heroPoster.avif).toMatch(/\.avif$/);
    expect(publicOptimizedImages.home.heroPoster.webp).toMatch(/\.webp$/);
    expect(publicOptimizedImages.home.lab.desktop.avif).toMatch(/\.avif$/);
    expect(publicOptimizedImages.home.product.desktop.webp).toMatch(/\.webp$/);
    expect(publicOptimizedImages.biteplaner.hero.desktop.avif).toMatch(/\.avif$/);
    expect(publicOptimizedImages.biteplaner.process.mobile.webp).toMatch(/\.webp$/);
    expect(publicOptimizedImages.biteplaner).not.toHaveProperty('education');
    expect(publicOptimizedImages.biteplaner.finalCta.desktop.avif).toMatch(/\.avif$/);
    expect(publicOptimizedImages.biteplaner.faqProduct.webp).toMatch(/\.webp$/);
    expect(publicOptimizedImages.shared.nexorLogo.webp).toMatch(/\.webp$/);
  });
});
