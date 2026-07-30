import homeHeroPosterDesktopAvif from './generated/public/home/hero-poster-1440.avif';
import homeHeroPosterDesktopWebp from './generated/public/home/hero-poster-1440.webp';
import homeHeroPosterMobileAvif from './generated/public/home/hero-poster-768.avif';
import homeHeroPosterMobileWebp from './generated/public/home/hero-poster-768.webp';
import homeProductionDesktopAvif from './generated/public/home/production-1440.avif';
import homeProductionDesktopWebp from './generated/public/home/production-1440.webp';
import homeProductionMobileAvif from './generated/public/home/production-768.avif';
import homeProductionMobileWebp from './generated/public/home/production-768.webp';
import homeProductDesktopAvif from './generated/public/home/product-760.avif';
import homeProductDesktopWebp from './generated/public/home/product-760.webp';
import homeProductMobileAvif from './generated/public/home/product-480.avif';
import homeProductMobileWebp from './generated/public/home/product-480.webp';
import biteplanerLogoAvif from './generated/public/shared/biteplaner-logo-320.avif';
import biteplanerLogoWebp from './generated/public/shared/biteplaner-logo-320.webp';
import biteplanerLogoWhiteAvif from './generated/public/shared/biteplaner-logo-white-320.avif';
import biteplanerLogoWhiteWebp from './generated/public/shared/biteplaner-logo-white-320.webp';
import nexorLogoAvif from './generated/public/shared/nexor-logo-260.avif';
import nexorLogoWebp from './generated/public/shared/nexor-logo-260.webp';
import biteplanerHeroDesktopAvif from './generated/public/biteplaner/hero-1600.avif';
import biteplanerHeroDesktopWebp from './generated/public/biteplaner/hero-1600.webp';
import biteplanerHeroMobileAvif from './generated/public/biteplaner/hero-768.avif';
import biteplanerHeroMobileWebp from './generated/public/biteplaner/hero-768.webp';
import biteplanerProcessDesktopAvif from './generated/public/biteplaner/process-1600.avif';
import biteplanerProcessDesktopWebp from './generated/public/biteplaner/process-1600.webp';
import biteplanerProcessMobileAvif from './generated/public/biteplaner/process-768.avif';
import biteplanerProcessMobileWebp from './generated/public/biteplaner/process-768.webp';
import biteplanerFinalCtaDesktopAvif from './generated/public/biteplaner/final-cta-1600.avif';
import biteplanerFinalCtaDesktopWebp from './generated/public/biteplaner/final-cta-1600.webp';
import biteplanerFinalCtaMobileAvif from './generated/public/biteplaner/final-cta-768.avif';
import biteplanerFinalCtaMobileWebp from './generated/public/biteplaner/final-cta-768.webp';
import biteplanerFaqProductAvif from './generated/public/biteplaner/faq-product-480.avif';
import biteplanerFaqProductWebp from './generated/public/biteplaner/faq-product-480.webp';

type ModernImage = {
  avif: string;
  webp: string;
};

export function imageSet(image: ModernImage) {
  return `image-set(url("${image.avif}") type("image/avif"), url("${image.webp}") type("image/webp"))`;
}

export const publicOptimizedImages = {
  home: {
    heroPoster: {
      desktop: { avif: homeHeroPosterDesktopAvif, webp: homeHeroPosterDesktopWebp },
      mobile: { avif: homeHeroPosterMobileAvif, webp: homeHeroPosterMobileWebp },
      avif: homeHeroPosterDesktopAvif,
      webp: homeHeroPosterDesktopWebp,
    },
    production: {
      desktop: { avif: homeProductionDesktopAvif, webp: homeProductionDesktopWebp },
      mobile: { avif: homeProductionMobileAvif, webp: homeProductionMobileWebp },
    },
    product: {
      desktop: { avif: homeProductDesktopAvif, webp: homeProductDesktopWebp },
      mobile: { avif: homeProductMobileAvif, webp: homeProductMobileWebp },
    },
  },
  shared: {
    biteplanerLogo: { avif: biteplanerLogoAvif, webp: biteplanerLogoWebp },
    biteplanerLogoWhite: { avif: biteplanerLogoWhiteAvif, webp: biteplanerLogoWhiteWebp },
    nexorLogo: { avif: nexorLogoAvif, webp: nexorLogoWebp },
  },
  biteplaner: {
    hero: {
      desktop: { avif: biteplanerHeroDesktopAvif, webp: biteplanerHeroDesktopWebp },
      mobile: { avif: biteplanerHeroMobileAvif, webp: biteplanerHeroMobileWebp },
    },
    process: {
      desktop: { avif: biteplanerProcessDesktopAvif, webp: biteplanerProcessDesktopWebp },
      mobile: { avif: biteplanerProcessMobileAvif, webp: biteplanerProcessMobileWebp },
    },
    finalCta: {
      desktop: { avif: biteplanerFinalCtaDesktopAvif, webp: biteplanerFinalCtaDesktopWebp },
      mobile: { avif: biteplanerFinalCtaMobileAvif, webp: biteplanerFinalCtaMobileWebp },
    },
    faqProduct: { avif: biteplanerFaqProductAvif, webp: biteplanerFaqProductWebp },
  },
} as const;
