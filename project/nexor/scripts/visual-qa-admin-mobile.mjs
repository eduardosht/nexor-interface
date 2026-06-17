import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const baseUrl = process.env.QA_FRONTEND_URL ?? 'http://127.0.0.1:5173';
const outputDir = process.env.QA_SCREENSHOT_DIR
  ? path.resolve(process.env.QA_SCREENSHOT_DIR)
  : path.resolve(rootDir, '../../../run-logs/visual-qa/admin-mobile');

const routes = [
  '/painel/admin/home',
  '/painel/admin/ordens',
  '/painel/admin/relatorios',
  '/painel/admin/parceiros',
  '/painel/admin/remocoes-conta',
  '/painel/admin/dentistas',
  '/painel/admin/laboratorios',
  '/painel/admin/usuarios',
  '/painel/admin/configuracoes/negocio',
  '/painel/admin/configuracoes/sistema',
];

const expectedRouteText = {
  '/painel/admin/home': 'Dashboard administrativo',
  '/painel/admin/ordens': 'Ordens compartilhadas do Biteplaner',
  '/painel/admin/relatorios': 'Relatórios Biteplaner',
  '/painel/admin/parceiros': 'Parceiros aguardando aprovação',
  '/painel/admin/remocoes-conta': 'Remoções de conta',
  '/painel/admin/dentistas': 'Dentistas querendo se licenciar',
  '/painel/admin/laboratorios': 'Laboratórios querendo se licenciar',
  '/painel/admin/usuarios': 'Usuários do sistema',
  '/painel/admin/configuracoes/negocio': 'Configuração de Negócio',
  '/painel/admin/configuracoes/sistema': 'Configuração de Sistema',
};

const viewports = [
  { name: '360x800', width: 360, height: 800 },
  { name: '390x844', width: 390, height: 844 },
  { name: '768x1024', width: 768, height: 1024 },
  { name: 'desktop', width: 1440, height: 900 },
];

function routeSlug(route) {
  return route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '');
}

async function main() {
  await mkdir(outputDir, { recursive: true });

  const browser = await chromium.launch({ headless: true });
  const summary = {
    baseUrl,
    outputDir,
    startedAt: new Date().toISOString(),
    routes: [],
  };

  try {
    for (const viewport of viewports) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
      });

      await context.addInitScript(() => {
        window.localStorage.setItem('nexor_demo_persona', 'admin');
        window.localStorage.setItem('nexor-admin-selected-product', 'biteplaner');
      });

      const page = await context.newPage();
      const consoleMessages = [];
      const pageErrors = [];
      page.on('console', (message) => {
        if (['error', 'warning'].includes(message.type())) {
          consoleMessages.push({ type: message.type(), text: message.text() });
        }
      });
      page.on('pageerror', (error) => {
        pageErrors.push(error.message);
      });

      for (const route of routes) {
        const url = new URL(route, baseUrl).toString();
        await page.goto(url, { waitUntil: 'networkidle' });
        await page.waitForFunction(
          (expectedText) => document.body.innerText.includes(expectedText),
          expectedRouteText[route],
          { timeout: 15000 }
        );
        await page.waitForTimeout(1500);

        const metrics = await page.evaluate((expectedText) => {
          const root = document.documentElement;
          const body = document.body;
          const overlay = document.querySelector('[data-vite-dev-id], vite-error-overlay, .vite-error-overlay');
          return {
            title: document.title,
            bodyTextLength: body.innerText.trim().length,
            clientWidth: root.clientWidth,
            scrollWidth: root.scrollWidth,
            hasFrameworkOverlay: Boolean(overlay),
            hasExpectedRouteText: body.innerText.includes(expectedText),
          };
        }, expectedRouteText[route]);

        const hasHorizontalOverflow = metrics.scrollWidth > metrics.clientWidth + 1;
        const fileName = `${viewport.name}-${routeSlug(route)}.png`;
        const screenshotPath = path.join(outputDir, fileName);
        await page.screenshot({ path: screenshotPath, fullPage: true });

        const relevantConsoleMessages = consoleMessages.splice(0);
        const relevantPageErrors = pageErrors.splice(0);
        const routeSummary = {
          viewport: viewport.name,
          route,
          url: page.url(),
          screenshotPath,
          passed:
            metrics.hasExpectedRouteText &&
            !metrics.hasFrameworkOverlay &&
            !hasHorizontalOverflow &&
            relevantConsoleMessages.length === 0 &&
            relevantPageErrors.length === 0,
          metrics,
          consoleMessages: relevantConsoleMessages,
          pageErrors: relevantPageErrors,
        };

        summary.routes.push(routeSummary);
        console.log(JSON.stringify(routeSummary));
      }

      await context.close();
    }
  } finally {
    await browser.close();
  }

  const failed = summary.routes.filter((item) => !item.passed);
  summary.finishedAt = new Date().toISOString();
  summary.passed = failed.length === 0;
  summary.failed = failed;

  const summaryPath = path.join(outputDir, 'summary.json');
  await writeFile(summaryPath, JSON.stringify(summary, null, 2), 'utf8');
  console.log(JSON.stringify({ passed: summary.passed, summaryPath, screenshots: summary.routes.length }, null, 2));

  if (!summary.passed) {
    process.exitCode = 1;
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
