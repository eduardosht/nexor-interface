import { mkdir } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = join(root, 'src/assets/logo-nexor.png');
const output = join(root, 'public');

const sizes = [
  { name: 'favicon-32.png', size: 32 },
  { name: 'favicon-192.png', size: 192 },
  { name: 'apple-touch-icon.png', size: 180 },
];

await mkdir(output, { recursive: true });

for (const { name, size } of sizes) {
  const padding = Math.round(size * 0.12);
  const innerWidth = size - padding * 2;
  const innerHeight = Math.round(innerWidth * (364 / 1141));

  const logo = await sharp(source)
    .resize({ width: innerWidth, height: innerHeight, fit: 'inside' })
    .png()
    .toBuffer();

  await sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 255, g: 255, b: 255, alpha: 0 },
    },
  })
    .composite([{ input: logo, gravity: 'center' }])
    .png()
    .toFile(join(output, name));
}

console.log(`Generated ${sizes.length} Nexor browser icons in ${output}`);
