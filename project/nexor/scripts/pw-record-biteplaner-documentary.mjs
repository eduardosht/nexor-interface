import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const htmlPath = path.join(projectRoot, 'docs', 'biteplaner-video-documental.html');
const outputDir = path.join(projectRoot, 'docs', 'assets', 'apresentacao-painel-admin', 'video');
const outputPath = path.join(outputDir, 'biteplaner-jornada-documental.webm');
const viewport = { width: 1920, height: 1080 };

fs.mkdirSync(outputDir, { recursive: true });

if (!fs.existsSync(htmlPath)) {
  throw new Error(`Arquivo da apresentação não encontrado: ${htmlPath}`);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport,
  recordVideo: {
    dir: outputDir,
    size: viewport,
  },
});

const page = await context.newPage();
const consoleErrors = [];
page.on('console', (message) => {
  if (message.type() === 'error') consoleErrors.push(message.text());
});

const fileUrl = `file:///${htmlPath.replace(/\\/g, '/')}`;
await page.goto(fileUrl, { waitUntil: 'load' });
try {
  await page.waitForFunction(() => window.__biteplanerVideoReady === true, undefined, { timeout: 90000 });
  await page.waitForFunction(() => window.__biteplanerVideoDone === true, undefined, { timeout: 180000 });
} catch (error) {
  const diagnostics = await page.evaluate(() => ({
    ready: window.__biteplanerVideoReady === true,
    done: window.__biteplanerVideoDone === true,
    slides: document.querySelectorAll('.slide').length,
    images: document.images.length,
    incompleteImages: [...document.images].filter((image) => !image.complete).map((image) => image.getAttribute('src')),
    brokenImages: [...document.images].filter((image) => image.complete && image.naturalWidth === 0).map((image) => image.getAttribute('src')),
    activeSlide: document.querySelector('.slide.active h1, .slide.active h2')?.textContent?.trim() ?? null,
  }));
  console.error(JSON.stringify({ diagnostics, consoleErrors }, null, 2));
  throw error;
}

const metrics = await page.evaluate(() => ({
  title: document.title,
  slides: document.querySelectorAll('.slide').length,
  images: document.images.length,
  activeSlide: document.querySelector('.slide.active h1, .slide.active h2')?.textContent?.trim() ?? null,
  overflowX: document.documentElement.scrollWidth > document.documentElement.clientWidth + 2,
}));

const video = page.video();
await page.close();
await video.saveAs(outputPath);
await context.close();
await browser.close();

const stats = fs.statSync(outputPath);
console.log(JSON.stringify({
  outputPath,
  sizeBytes: stats.size,
  metrics,
  consoleErrors,
}, null, 2));
