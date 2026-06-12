import { chromium } from 'playwright';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');
const assetsDir = path.join(projectRoot, 'docs', 'assets', 'apresentacao-painel-admin');
const baseUrl = process.env.CAPTURE_BASE_URL ?? 'http://127.0.0.1:5180';

fs.mkdirSync(assetsDir, { recursive: true });

const captures = [
  { persona: 'partner', route: '/painel/biteplaner/indicar?mode=partner', file: '01-parceiro-indicar-formulario.png' },
  { persona: 'athleteRegistered', route: '/cadastro?invite=bp-partner-demo-001', file: '05-cliente-cadastro-conta-convite.png' },
  { persona: 'athleteRegistered', route: '/painel/biteplaner/onboarding', file: '07-cliente-onboarding-lgpd-bloqueio.png' },
  { persona: 'athlete', route: '/painel/biteplaner/onboarding', file: '08-cliente-onboarding-formulario.png' },
  { persona: 'athletePrerequisite', route: '/painel/pre-requisito', file: '09-cliente-pre-requisito.png' },
  { persona: 'athleteScheduling', route: '/painel/consulta-inicial', file: '10-cliente-selecao-clinica.png' },
  { persona: 'athletePreConsultation', route: '/painel/biteplaner/jornada', file: '11-cliente-pre-consulta-clinica.png' },
  { persona: 'athletePayment', route: '/painel/compra', file: '12-cliente-compra-biteplanner.png' },
  { persona: 'athletePayment', route: '/painel/compra?checkout=success&session_id=cs_test_doc', file: '12b-cliente-compra-sucesso-stripe.png' },
  { persona: 'athletePayment', route: '/painel/biteplaner/jornada', file: '13-cliente-jornada-pagamento-detalhes.png' },
  { persona: 'athleteLabProduction', route: '/painel/biteplaner/jornada', file: '14-cliente-jornada-laboratorio.png' },
  { persona: 'athleteAdaptation', route: '/painel/biteplaner/jornada', file: '15-cliente-jornada-adaptacao.png' },
  { persona: 'athleteFollowUp', route: '/painel/biteplaner/jornada', file: '16-cliente-jornada-acompanhamento.png' },
  { persona: 'athleteIneligible', route: '/painel/biteplaner/jornada', file: '16b-cliente-jornada-inaptidao.png' },
  { persona: 'partner', route: '/painel/biteplaner/cadastro/parceiro', file: '17-onboarding-parceiro.png' },
  { persona: 'dentist', route: '/painel/biteplaner/cadastro/dentista', file: '18-onboarding-dentista.png' },
  { persona: 'lab', route: '/painel/biteplaner/cadastro/laborat%C3%B3rio', file: '19-onboarding-laboratorio.png' },
  { persona: 'dentistLicensed', route: '/painel/biteplaner?mode=dentist', file: '20-dentista-hub.png' },
  { persona: 'dentistLicensed', route: '/painel/dentista/producao/BP-DEMO-004', file: '21-dentista-producao-formularios.png' },
  { persona: 'lab', route: '/painel/biteplaner?mode=lab', file: '22-laboratorio-hub.png' },
];

async function setPersona(page, persona) {
  await page.goto(`${baseUrl}/entrar`, { waitUntil: 'networkidle' });
  await page.evaluate((nextPersona) => {
    localStorage.setItem('nexor_demo_persona', nextPersona);
    sessionStorage.clear();
  }, persona);
}

async function waitForStablePage(page) {
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  await page.waitForFunction(() => document.body.innerText.trim().length > 240, { timeout: 10000 }).catch(() => undefined);
  await page.waitForFunction(() => {
    const text = document.body.innerText.toLowerCase();
    const hasLoadingText = ['carregando', 'loading', 'aguarde'].some((term) => text.includes(term));
    const hasBusyElement = Boolean(document.querySelector('[aria-busy="true"], [data-loading="true"], [data-skeleton="true"]'));
    const hasSkeletonClass = [...document.querySelectorAll('[class]')].some((element) =>
      String(element.getAttribute('class')).toLowerCase().includes('skeleton')
      || String(element.getAttribute('class')).toLowerCase().includes('loading')
    );
    return !hasLoadingText && !hasBusyElement && !hasSkeletonClass;
  }, { timeout: 15000 }).catch(() => undefined);
  await page.waitForTimeout(1200);
  await page.evaluate(async () => {
    const pendingImages = [...document.images].filter((image) => !image.complete);
    if (!pendingImages.length) return;

    await Promise.race([
      Promise.all(pendingImages.map((image) => new Promise((resolve) => {
        image.addEventListener('load', resolve, { once: true });
        image.addEventListener('error', resolve, { once: true });
      }))),
      new Promise((resolve) => setTimeout(resolve, 2500)),
    ]);
  }).catch(() => undefined);
}

async function screenshot(page, file) {
  await waitForStablePage(page);
  await page.screenshot({
    path: path.join(assetsDir, file),
    fullPage: true,
    animations: 'disabled',
  });
}

async function capture(page, item) {
  await setPersona(page, item.persona);
  await page.goto(`${baseUrl}${item.route}`, { waitUntil: 'networkidle' });
  await screenshot(page, item.file);
  console.log(`captured ${item.file}`);
}

async function capturePartnerVariants(page) {
  await setPersona(page, 'partner');
  await page.goto(`${baseUrl}/painel/biteplaner/indicar?mode=partner`, { waitUntil: 'networkidle' });
  await waitForStablePage(page);
  await screenshot(page, '01-parceiro-indicar-formulario.png');
  console.log('captured 01-parceiro-indicar-formulario.png');

  const inputs = await page.locator('input').all();
  if (inputs[0]) await inputs[0].fill('Edu O indicado').catch(() => undefined);
  if (inputs[1]) await inputs[1].fill('edu.indicado@nexor.dev').catch(() => undefined);
  if (inputs[2]) await inputs[2].fill('(11) 99999-8888').catch(() => undefined);
  await screenshot(page, '02-parceiro-indicar-preenchido.png');
  console.log('captured 02-parceiro-indicar-preenchido.png');

  const generateButton = page.getByRole('button', { name: /gerar link/i });
  if (await generateButton.count()) {
    await generateButton.click();
    await page.getByRole('button', { name: /visualizar link edu o indicado/i }).waitFor({ timeout: 10000 }).catch(() => undefined);
    await page.waitForTimeout(500);
  }
  await screenshot(page, '03-parceiro-link-gerado-lista.png');
  console.log('captured 03-parceiro-link-gerado-lista.png');

  const viewButton = page.getByRole('button', { name: /visualizar link edu o indicado/i }).first();
  if (await viewButton.count()) {
    await viewButton.click();
    await page.waitForTimeout(500);
    await screenshot(page, '04-parceiro-link-modal-qr.png');
    console.log('captured 04-parceiro-link-modal-qr.png');
  }
}

async function captureRegistrationConsent(page) {
  await setPersona(page, 'athleteRegistered');
  await page.goto(`${baseUrl}/cadastro?invite=bp-partner-demo-001`, { waitUntil: 'networkidle' });
  await waitForStablePage(page);

  await page.getByLabel('Nome completo').fill('Edu O indicado');
  await page.getByLabel('E-mail').fill('edu.indicado@nexor.dev');
  await page.getByLabel('Senha', { exact: true }).fill('Senha123!');
  await page.getByLabel('Confirmar sua senha').fill('Senha123!');
  await page.getByRole('button', { name: /próximo/i }).click();
  await page.waitForTimeout(600);
  await screenshot(page, '06-cliente-cadastro-consentimentos.png');
  console.log('captured 06-cliente-cadastro-consentimentos.png');
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 1100 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();

  page.on('console', (message) => {
    if (message.type() === 'error') console.warn(`console error: ${message.text()}`);
  });

  await page.goto(`${baseUrl}/entrar`, { waitUntil: 'networkidle' });
  await capturePartnerVariants(page);
  await captureRegistrationConsent(page);

  for (const item of captures.slice(1)) {
    await capture(page, item);
  }

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
