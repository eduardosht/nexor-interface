import { mkdir, rm } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = dirname(fileURLToPath(new URL('../package.json', import.meta.url)));
const sourceRoot = join(root, 'src/assets');
const outputRoot = join(sourceRoot, 'generated/public');

const jobs = [
  {
    source: 'backgrounds/banner-22.png',
    name: 'home/hero-poster',
    widths: [768, 1440],
    formats: ['avif', 'webp'],
  },
  {
    source: 'backgrounds/banner-2.png',
    name: 'home/lab',
    widths: [768, 1440],
    formats: ['avif', 'webp'],
  },
  {
    source: 'biteplaner-moldera.png',
    name: 'home/product',
    widths: [480, 760],
    formats: ['avif', 'webp'],
  },
  {
    source: 'biteplaner-logo.png',
    name: 'shared/biteplaner-logo',
    widths: [320],
    formats: ['avif', 'webp'],
  },
  {
    source: 'biteplaner-logo-white.png',
    name: 'shared/biteplaner-logo-white',
    widths: [320],
    formats: ['avif', 'webp'],
  },
  {
    source: 'logo-nexor.png',
    name: 'shared/nexor-logo',
    widths: [260],
    formats: ['avif', 'webp'],
  },
  {
    source: 'backgrounds/hero-section-1.png',
    name: 'biteplaner/hero',
    widths: [768, 1600],
    formats: ['avif', 'webp'],
  },
  {
    source: 'backgrounds/banner-3.png',
    name: 'biteplaner/process',
    widths: [768, 1600],
    formats: ['avif', 'webp'],
  },
  {
    source: 'backgrounds/biteplaner-banner-horizontal.png',
    name: 'biteplaner/final-cta',
    widths: [768, 1600],
    formats: ['avif', 'webp'],
  },
  {
    source: 'biteplaner-transparent-2.png',
    name: 'biteplaner/faq-product',
    widths: [480],
    formats: ['avif', 'webp'],
  },
];

const encoders = {
  avif: (image) => image.avif({ quality: 52, effort: 6 }),
  webp: (image) => image.webp({ quality: 76, effort: 6 }),
};

await rm(outputRoot, { recursive: true, force: true });

for (const job of jobs) {
  for (const width of job.widths) {
    for (const format of job.formats) {
      const output = join(outputRoot, `${job.name}-${width}.${format}`);
      await mkdir(dirname(output), { recursive: true });
      await encoders[format](
        sharp(join(sourceRoot, job.source)).resize({
          width,
          withoutEnlargement: true,
        }),
      ).toFile(output);
    }
  }
}

console.log(`Optimized ${jobs.length} public image groups into ${outputRoot}`);
