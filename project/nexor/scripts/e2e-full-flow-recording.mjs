import { chromium } from 'playwright';
import { createClient } from '@supabase/supabase-js';
import { copyFile, mkdir, readdir, readFile, rename, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { promisify } from 'node:util';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const execFileAsync = promisify(execFile);

const FRONTEND_URL = process.env.E2E_FRONTEND_URL ?? 'http://127.0.0.1:5173';
const API_URL = process.env.E2E_API_URL ?? 'http://127.0.0.1:3333';
const ADMIN_EMAIL = process.env.E2E_ADMIN_EMAIL;
const ADMIN_PASSWORD = process.env.E2E_ADMIN_PASSWORD;
const DEFAULT_PASSWORD = process.env.E2E_USER_PASSWORD ?? 'NexorLocal123!';
const ACTION_DELAY_MS = Number(process.env.E2E_ACTION_DELAY_MS ?? 120);
const STEP_PAUSE_MS = Number(process.env.E2E_STEP_PAUSE_MS ?? 4000);
const MODAL_PAUSE_MS = Number(process.env.E2E_MODAL_PAUSE_MS ?? 3000);

if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
  throw new Error('Define E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD before running the full-flow recording.');
}

const runId = new Date().toISOString().replace(/[-:]/g, '').replace(/\..+$/, '').replace('T', '-');
const artifactsDir = path.join(rootDir, 'e2e-artifacts', `full-flow-${runId}`);
const screenshotsDir = path.join(artifactsDir, 'screenshots');
const videosDir = path.join(artifactsDir, 'videos');
const demoAdmAssetsDir = path.join(rootDir, 'public', 'demo-adm-assets', 'assets', 'apresentacao-painel-admin');
const demoAdmVideoDir = path.join(demoAdmAssetsDir, 'video');
const demoAdmDocsAssetsDir = path.join(rootDir, 'docs', 'assets', 'apresentacao-painel-admin');
const demoAdmDocsVideoDir = path.join(demoAdmDocsAssetsDir, 'video');

const report = {
  runId,
  startedAt: new Date().toISOString(),
  config: { FRONTEND_URL, API_URL },
  actors: {},
  order: {},
  steps: [],
  videos: [],
  screenshots: [],
  validations: []
};

const entitySuffix = runId.slice(-6);

function profileFromMe(me) {
  return me?.profile ?? me?.user ?? me ?? {};
}

function digitsFromSeed(length, salt = '') {
  const source = `${runId}:${salt}`;
  let hash = 2166136261;
  for (const char of source) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  let output = '';
  while (output.length < length) {
    hash = Math.imul(hash ^ (output.length + 97), 16777619) >>> 0;
    output += String(hash % 10);
  }
  return output.slice(0, length);
}

function cpfFromSeed(salt) {
  const base = digitsFromSeed(9, salt);
  const calculateDigit = (value, factor) => {
    const sum = value.split('').reduce((total, digit, index) => total + Number(digit) * (factor - index), 0);
    const remainder = (sum * 10) % 11;
    return remainder === 10 ? 0 : remainder;
  };
  const first = calculateDigit(base, 10);
  const second = calculateDigit(`${base}${first}`, 11);
  return `${base}${first}${second}`;
}

function cnpjFromSeed(salt) {
  const base = digitsFromSeed(8, salt) + '0001';
  const calculateDigit = (value, weights) => {
    const sum = value.split('').reduce((total, digit, index) => total + Number(digit) * weights[index], 0);
    const remainder = sum % 11;
    return remainder < 2 ? 0 : 11 - remainder;
  };
  const first = calculateDigit(base, [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  const second = calculateDigit(`${base}${first}`, [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]);
  return `${base}${first}${second}`;
}

function logStep(title, detail = {}) {
  const entry = { at: new Date().toISOString(), title, detail };
  report.steps.push(entry);
  console.log(`[e2e] ${title}`);
}

function sqlLiteral(value) {
  return `'${String(value).replace(/'/g, "''")}'`;
}

async function runLocalSql(sql) {
  await execFileAsync('docker', [
    'exec',
    'supabase_db_api',
    'psql',
    '-U',
    'postgres',
    '-d',
    'postgres',
    '-v',
    'ON_ERROR_STOP=1',
    '-c',
    sql
  ]);
}

async function transitionOrderLocal(orderId, fromStatus, toStatus, actorProfileId, reason) {
  await runLocalSql(`
    begin;
    update public.orders
    set status = ${sqlLiteral(toStatus)},
        updated_at = now()
    where id = ${sqlLiteral(orderId)}::uuid;
    insert into public.order_status_events(order_id, from_status, to_status, actor_profile_id, reason)
    values (${sqlLiteral(orderId)}::uuid, ${sqlLiteral(fromStatus)}, ${sqlLiteral(toStatus)}, ${sqlLiteral(actorProfileId)}::uuid, ${sqlLiteral(reason)});
    commit;
  `);
}

async function releaseFormSubmissionLocal(input) {
  await runLocalSql(`
    insert into public.form_submissions(
      order_id,
      template_key,
      template_version,
      step_key,
      actor_profile_id,
      target_profile_id,
      customer_profile_id,
      dentist_id,
      lab_profile_id,
      practice_location_id,
      payload_json,
      payload_summary_json,
      status,
      released_at
    )
    select
      o.id,
      ${sqlLiteral(input.templateKey)},
      1,
      ${sqlLiteral(input.stepKey)},
      ${sqlLiteral(input.actorProfileId)}::uuid,
      ${input.targetProfileId ? `${sqlLiteral(input.targetProfileId)}::uuid` : 'null'},
      ${input.customerProfileId ? `${sqlLiteral(input.customerProfileId)}::uuid` : 'null'},
      ${input.includeDentistId ? 'o.dentist_id' : 'null'},
      ${input.labProfileId ? `${sqlLiteral(input.labProfileId)}::uuid` : 'null'},
      o.practice_location_id,
      '{}'::jsonb,
      '{}'::jsonb,
      'pending',
      now()
    from public.orders o
    where o.id = ${sqlLiteral(input.orderId)}::uuid
      and not exists (
        select 1
        from public.form_submissions fs
        where fs.order_id = o.id
          and fs.template_key = ${sqlLiteral(input.templateKey)}
          and fs.status not in ('cancelled', 'superseded')
      );
  `);
}

async function releaseFeedbackFormsLocal(orderId, actors, selectedLab) {
  const customerProfileId = profileFromMe(actors.customer.me).profileId ?? profileFromMe(actors.customer.me).id;
  const dentistProfileId = profileFromMe(actors.dentist.me).profileId ?? profileFromMe(actors.dentist.me).id;
  const labProfileId = selectedLab.profileId;
  const partnerProfileId = profileFromMe(actors.partner.me).profileId ?? profileFromMe(actors.partner.me).id;

  await releaseFormSubmissionLocal({
    orderId,
    templateKey: 'lab_review_by_dentist',
    stepKey: 'lab_cycle_feedback_from_dentist',
    actorProfileId: dentistProfileId,
    targetProfileId: labProfileId,
    labProfileId,
    includeDentistId: true
  });
  await releaseFormSubmissionLocal({
    orderId,
    templateKey: 'dentist_review_by_lab',
    stepKey: 'lab_cycle_feedback_from_lab',
    actorProfileId: labProfileId,
    targetProfileId: dentistProfileId,
    labProfileId,
    includeDentistId: true
  });
  await releaseFormSubmissionLocal({
    orderId,
    templateKey: 'dentist_review_by_customer',
    stepKey: 'post_adaptation_feedback',
    actorProfileId: customerProfileId,
    targetProfileId: dentistProfileId,
    customerProfileId,
    includeDentistId: true
  });
  await releaseFormSubmissionLocal({
    orderId,
    templateKey: 'partner_review_by_customer',
    stepKey: 'order_completion_feedback',
    actorProfileId: customerProfileId,
    targetProfileId: partnerProfileId,
    customerProfileId,
    includeDentistId: false
  });
}

async function readDotEnv(filePath) {
  try {
    const raw = await readFile(filePath, 'utf8');
    return Object.fromEntries(
      raw
        .split(/\r?\n/)
        .map((line) => line.trim())
        .filter((line) => line && !line.startsWith('#') && line.includes('='))
        .map((line) => {
          const index = line.indexOf('=');
          return [line.slice(0, index), line.slice(index + 1).replace(/^"|"$/g, '')];
        })
    );
  } catch {
    return {};
  }
}

const env = {
  ...(await readDotEnv(path.join(rootDir, '.env'))),
  ...(await readDotEnv(path.join(rootDir, '.env.local')))
};

const SUPABASE_URL = process.env.E2E_SUPABASE_URL ?? env.VITE_SUPABASE_URL ?? 'http://127.0.0.1:54321';
const SUPABASE_ANON_KEY = process.env.E2E_SUPABASE_ANON_KEY ?? env.VITE_SUPABASE_ANON_KEY;

if (!SUPABASE_ANON_KEY) {
  throw new Error('Missing VITE_SUPABASE_ANON_KEY in project/nexor/.env or E2E_SUPABASE_ANON_KEY.');
}

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { persistSession: false, autoRefreshToken: false }
});

async function assertHealthy() {
  const [apiHealth, frontendHealth] = await Promise.all([
    fetch(`${API_URL}/health`),
    fetch(FRONTEND_URL)
  ]);
  if (!apiHealth.ok) throw new Error(`Backend health failed: ${apiHealth.status}`);
  if (!frontendHealth.ok) throw new Error(`Frontend health failed: ${frontendHealth.status}`);
  logStep('Local backend and frontend are reachable', {
    backendStatus: apiHealth.status,
    frontendStatus: frontendHealth.status
  });
}

async function api(token, method, route, body) {
  const response = await fetch(`${API_URL}${route}`, {
    method,
    headers: {
      'content-type': 'application/json',
      authorization: `Bearer ${token}`
    },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    const error = new Error(`${method} ${route} failed with ${response.status}: ${text}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }
  return data;
}

async function publicApi(method, route, body) {
  const response = await fetch(`${API_URL}${route}`, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body === undefined ? undefined : JSON.stringify(body)
  });
  const text = await response.text();
  const data = text ? JSON.parse(text) : null;
  if (!response.ok) {
    throw new Error(`${method} ${route} failed with ${response.status}: ${text}`);
  }
  return data;
}

async function signIn(email, password = DEFAULT_PASSWORD) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error || !data.session?.access_token) {
    throw new Error(`Could not sign in ${email}: ${error?.message ?? 'missing session'}`);
  }
  const me = await api(data.session.access_token, 'GET', '/v1/auth/me');
  return { email, token: data.session.access_token, me };
}

async function refreshTokenOnly(actor, password = DEFAULT_PASSWORD) {
  const { data, error } = await supabase.auth.signInWithPassword({ email: actor.email, password });
  if (error || !data.session?.access_token) {
    throw new Error(`Could not refresh token for ${actor.email}: ${error?.message ?? 'missing session'}`);
  }
  return { ...actor, token: data.session.access_token };
}

async function registerAccount(actorKey, fullName, extra = {}) {
  const email = `${actorKey}.${runId}@e2e.nexor.local`;
  await publicApi('POST', '/v1/auth/register', {
    email,
    password: DEFAULT_PASSWORD,
    fullName,
    ...(extra.referralInviteToken ? { referralInviteToken: extra.referralInviteToken } : {}),
    consents: [
      { type: 'terms', accepted: true },
      { type: 'privacy', accepted: true },
      { type: 'marketing', accepted: true }
    ]
  });
  const session = await signIn(email);
  report.actors[actorKey] = { email, profile: session.me.profile ?? session.me.user ?? session.me };
  logStep(`Registered account: ${actorKey}`, { email });
  return session;
}

async function clearBrowserSession(page) {
  if (page.url().startsWith(FRONTEND_URL)) {
    await page.evaluate(() => {
      const e2eStepTitle = localStorage.getItem('nexor_e2e_step_title');
      const e2eStepSubtitle = localStorage.getItem('nexor_e2e_step_subtitle');
      localStorage.clear();
      sessionStorage.clear();
      if (e2eStepTitle) localStorage.setItem('nexor_e2e_step_title', e2eStepTitle);
      if (e2eStepSubtitle) localStorage.setItem('nexor_e2e_step_subtitle', e2eStepSubtitle);
    });
  }
  await page.context().clearCookies();
}

async function setVideoStep(page, title, subtitle = '') {
  await page.evaluate(
    ({ title, subtitle }) => {
      localStorage.setItem('nexor_e2e_step_title', title);
      localStorage.setItem('nexor_e2e_step_subtitle', subtitle);
    },
    { title, subtitle }
  ).catch(() => undefined);
  await page.evaluate(
    ({ title, subtitle }) => {
      const ensureOverlay = () => {
        let overlay = document.getElementById('nexor-e2e-video-step-overlay');
        if (!overlay) {
          overlay = document.createElement('div');
          overlay.id = 'nexor-e2e-video-step-overlay';
          overlay.style.position = 'fixed';
          overlay.style.left = '24px';
          overlay.style.bottom = '24px';
          overlay.style.zIndex = '2147483647';
          overlay.style.maxWidth = '620px';
          overlay.style.padding = '14px 18px';
          overlay.style.borderRadius = '8px';
          overlay.style.background = 'rgba(10, 20, 35, 0.9)';
          overlay.style.color = '#fff';
          overlay.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.28)';
          overlay.style.fontFamily = 'Inter, Arial, sans-serif';
          overlay.style.pointerEvents = 'none';
          overlay.style.backdropFilter = 'blur(8px)';
          document.body.appendChild(overlay);
        }

        let cursor = document.getElementById('nexor-e2e-cursor');
        if (!cursor) {
          cursor = document.createElement('div');
          cursor.id = 'nexor-e2e-cursor';
          cursor.style.position = 'fixed';
          cursor.style.left = '50%';
          cursor.style.top = '50%';
          cursor.style.width = '18px';
          cursor.style.height = '18px';
          cursor.style.borderRadius = '999px';
          cursor.style.border = '2px solid white';
          cursor.style.background = 'rgba(37, 99, 235, 0.9)';
          cursor.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.24), 0 8px 20px rgba(0, 0, 0, 0.28)';
          cursor.style.zIndex = '2147483647';
          cursor.style.pointerEvents = 'none';
          cursor.style.transform = 'translate(-50%, -50%)';
          cursor.style.transition = 'left 160ms ease, top 160ms ease';
          document.body.appendChild(cursor);
        }

        window.__nexorE2EMoveCursor = (x, y) => {
          cursor.style.left = `${Math.round(x)}px`;
          cursor.style.top = `${Math.round(y)}px`;
        };

        return overlay;
      };
      const overlay = ensureOverlay();
      if (!window.__nexorE2ESetStep) {
        window.__nexorE2ESetStep = (nextTitle, nextSubtitle = '') => {
          const currentOverlay = ensureOverlay();
          currentOverlay.innerHTML = `
            <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.72;margin-bottom:4px;">Fluxo E2E Biteplaner</div>
            <div style="font-size:18px;font-weight:750;line-height:1.25;">${nextTitle}</div>
            ${nextSubtitle ? `<div style="font-size:13px;line-height:1.45;opacity:.86;margin-top:4px;">${nextSubtitle}</div>` : ''}
          `;
        };
      }
      window.__nexorE2ESetStep?.(title, subtitle);
      return Boolean(overlay);
    },
    { title, subtitle }
  );
}

async function pause(ms = STEP_PAUSE_MS) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function slowFill(locator, value) {
  await scrollToLocator(locator);
  await moveCursorTo(locator);
  await locator.click();
  await locator.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A').catch(() => undefined);
  await locator.fill('');
  await locator.type(String(value), { delay: Math.max(18, ACTION_DELAY_MS / 5) });
  await pause(Math.round(ACTION_DELAY_MS * 0.8));
}

async function slowClick(locator, options = {}) {
  await scrollToLocator(locator);
  await moveCursorTo(locator);
  await locator.click(options);
  await pause(ACTION_DELAY_MS);
}

async function pageFromLocator(locator) {
  const handle = await locator.elementHandle({ timeout: 5000 }).catch(() => null);
  const frame = handle?.ownerFrame();
  if (!frame) {
    return null;
  }
  return typeof frame.page === 'function' ? frame.page() : frame.page;
}

async function scrollToLocator(locator) {
  await locator.scrollIntoViewIfNeeded({ timeout: 10000 }).catch(() => undefined);
  const page = await pageFromLocator(locator);
  if (page) {
    await page.waitForTimeout(240);
  } else {
    await pause(240);
  }
}

async function moveCursorTo(locator) {
  const box = await locator.boundingBox().catch(() => null);
  if (!box) {
    return;
  }
  const x = box.x + Math.min(box.width - 4, Math.max(4, box.width / 2));
  const y = box.y + Math.min(box.height - 4, Math.max(4, box.height / 2));
  const page = await pageFromLocator(locator);
  if (!page) {
    return;
  }
  await page.mouse.move(x, y, { steps: 14 });
  await page.evaluate(({ x, y }) => window.__nexorE2EMoveCursor?.(x, y), { x, y }).catch(() => undefined);
}

async function scrollLikeUser(page, distance = 520) {
  await page.mouse.wheel(0, distance);
  await page.waitForTimeout(320);
}

async function visibleValue(locator) {
  return locator.inputValue().catch(() => '');
}

async function fillVisibleInputs(page, values = []) {
  const visibleInputs = page.locator('input:not([type="hidden"]):not([type="checkbox"]):not([type="radio"]):not([type="file"]):not([type="range"]):visible');
  const count = await visibleInputs.count();
  for (let index = 0; index < count; index += 1) {
    const input = visibleInputs.nth(index);
    if (await input.isDisabled().catch(() => true)) continue;
    if (await visibleValue(input)) continue;
    const type = (await input.getAttribute('type').catch(() => 'text')) ?? 'text';
    const name = `${await input.getAttribute('name').catch(() => '')} ${await input.getAttribute('aria-label').catch(() => '')}`.toLowerCase();
    const fieldKey = await input.evaluate((element) => element.closest('[data-workflow-field-key]')?.getAttribute('data-workflow-field-key') ?? '').catch(() => '');
    let value = values[index % values.length] ?? `Valor E2E ${index + 1}`;
    if (type === 'email' || name.includes('email')) value = `cliente.${runId}@e2e.nexor.local`;
    if (type === 'date' || name.includes('birth') || name.includes('data')) value = '1990-05-10';
    if (type === 'number') value = '7';
    if (fieldKey === 'bodyMassKg' || name.includes('kg')) value = '78';
    if (fieldKey === 'heightMeters' || name.includes('height') || name.includes('altura')) value = '1.78';
    if (fieldKey === 'averageSleepHours') value = '7';
    if (name.includes('cpf')) value = cpfFromSeed('customer');
    if (name.includes('cep')) value = '01310-100';
    if (name.includes('phone') || name.includes('telefone')) value = '11988887777';
    await slowFill(input, value);
  }
}

async function fillVisibleTextareas(page, text) {
  const textareas = page.locator('textarea:visible');
  const count = await textareas.count();
  for (let index = 0; index < count; index += 1) {
    const textarea = textareas.nth(index);
    if (await textarea.isDisabled().catch(() => true)) continue;
    if (await visibleValue(textarea)) continue;
    await slowFill(textarea, text);
  }
}

async function fillVisibleSliders(page, value = 7) {
  const sliders = page.locator('input[type="range"]:visible');
  const count = await sliders.count();
  for (let index = 0; index < count; index += 1) {
    const slider = sliders.nth(index);
    if (await slider.isDisabled().catch(() => true)) continue;
    await scrollToLocator(slider);
    await slider.evaluate((element, nextValue) => {
      const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value')?.set;
      setter?.call(element, String(nextValue));
      element.dispatchEvent(new Event('input', { bubbles: true }));
      element.dispatchEvent(new Event('change', { bubbles: true }));
    }, value).catch(() => undefined);
    await page.waitForTimeout(180);
  }
}

async function chooseVisibleOptions(page) {
  await page.locator('input[type="checkbox"]:visible').evaluateAll((items) => {
    items.forEach((item) => {
      if (!item.checked && !item.disabled) item.click();
    });
  }).catch(() => undefined);

  const checkboxLabels = page.locator('label:has(input[type="checkbox"]:not(:checked)):visible');
  const checkboxLabelCount = await checkboxLabels.count();
  for (let index = 0; index < checkboxLabelCount; index += 1) {
    await slowClick(checkboxLabels.nth(index), { force: true }).catch(() => undefined);
  }

  const designSystemRadioGroups = page.locator('[data-testid^="radio-question-options-"]:visible');
  const designSystemRadioGroupCount = await designSystemRadioGroups.count();
  for (let index = 0; index < designSystemRadioGroupCount; index += 1) {
    const group = designSystemRadioGroups.nth(index);
    const alreadyChecked = group.locator('input[type="radio"]:checked');
    if (await alreadyChecked.count()) continue;
    const preferred = group.locator('label').filter({ hasText: /^Não$/i }).first();
    const fallback = group.locator('label').filter({ hasText: /sim|apto|masculino|direita|academia|personal/i }).first();
    const option =
      (await preferred.count()) ? preferred :
      (await fallback.count()) ? fallback :
      group.locator('label').first();
    await slowClick(option, { force: true }).catch(() => undefined);
  }

  const radioGroups = page.locator('[role="radiogroup"]:visible');
  const groupCount = await radioGroups.count();
  for (let index = 0; index < groupCount; index += 1) {
    const group = radioGroups.nth(index);
    const preferred = group.locator('label').filter({ hasText: /sim|apto|masculino|direita|academia|personal/i }).first();
    if (await preferred.count()) {
      await slowClick(preferred, { force: true }).catch(() => undefined);
    } else {
      await slowClick(group.locator('label').first(), { force: true }).catch(() => undefined);
    }
  }
}

async function chooseVisibleSelects(page) {
  const triggers = page.locator('button[aria-haspopup="listbox"]:visible');
  const count = await triggers.count();
  for (let index = 0; index < count; index += 1) {
    const trigger = triggers.nth(index);
    if (await trigger.isDisabled().catch(() => true)) continue;
    const currentText = ((await trigger.textContent().catch(() => '')) ?? '').trim();
    if (currentText && !/selecione/i.test(currentText)) continue;

    await slowClick(trigger);
    const listbox = page.getByRole('listbox').last();
    await listbox.waitFor({ state: 'visible', timeout: 5000 }).catch(() => undefined);

    const preferredOption = listbox
      .getByRole('option')
      .filter({ hasText: /^Não$/i })
      .first();
    const fallbackOption = listbox
      .getByRole('option')
      .filter({ hasText: /nunca|ocasionalmente|provavelmente sim|academia|personal|masculino|direita/i })
      .first();
    const firstOption = listbox.getByRole('option').first();
    const option =
      (await preferredOption.count()) ? preferredOption :
      (await fallbackOption.count()) ? fallbackOption :
      firstOption;

    await slowClick(option);
    await page.waitForTimeout(320);
  }
}

async function clickVisibleStepButton(page, { allowSubmit = true } = {}) {
  const buttons = page.getByRole('button', { name: /continuar|pr.xima etapa|pr.ximo|salvar|enviar formul.rio|enviar cadastro/i });
  const count = await buttons.count();
  let button = null;
  for (let index = 0; index < count; index += 1) {
    const candidate = buttons.nth(index);
    if (await candidate.isVisible().catch(() => false) && await candidate.isEnabled().catch(() => false)) {
      button = candidate;
      break;
    }
  }
  if (!button) {
    await scrollLikeUser(page, 420);
    return false;
  }
  await scrollToLocator(button);
  await page.waitForTimeout(420);
  const label = (await button.textContent().catch(() => '')) ?? '';
  if (!allowSubmit && /enviar formul.rio|salvar/i.test(label)) {
    await screenshot(page, 'cliente-formulario-pronto-para-envio');
    return 'ready';
  }
  await slowClick(button);
  await page.waitForLoadState('networkidle', { timeout: 15000 }).catch(() => undefined);
  await page.waitForTimeout(800);
  return true;
}

function readableStepName(name) {
  const labels = {
    'cliente-hub-antes-pedido': 'Cliente no hub Biteplaner',
    'cliente-jornada-pedido-criado': 'Cliente acompanha pedido criado',
    'cliente-onboarding-formulario': 'Cliente preenche cadastro de novos usuários',
    'cliente-jornada-onboarding-enviado': 'Cliente conclui onboarding',
    'cliente-pre-consulta-formulario': 'Cliente preenche pré-consulta',
    'cliente-jornada-pre-consulta-enviada': 'Cliente envia pré-consulta',
    'cliente-selecao-clinica-abertura': 'Cliente escolhe a clínica',
    'cliente-selecao-clinica-confirmada': 'Cliente confirma consulta agendada',
    'dentista-listagem-aceite-consulta': 'Dentista aceita consulta na listagem',
    'dentista-producao-consulta-aceita': 'Dentista recebe consulta aceita',
    'cliente-confirmacao-consulta-realizada': 'Cliente confirma consulta realizada',
    'dentista-listagem-confirmacao-consulta': 'Dentista confirma consulta na listagem',
    'dentista-complemento-pre-consulta': 'Dentista complementa pré-consulta',
    'cliente-compra-biteplaner': 'Cliente passa pela compra',
    'cliente-compra-sucesso': 'Cliente vê compra confirmada',
    'dentista-producao-elegibilidade': 'Dentista avalia elegibilidade',
    'dentista-producao-pagamento-confirmado': 'Dentista vê pagamento confirmado',
    'dentista-selecao-laboratorio-abertura': 'Dentista escolhe laboratório',
    'dentista-producao-solicitada': 'Dentista solicita produção',
    'laboratorio-hub-antes-producao': 'Laboratório vê produção pendente',
    'laboratorio-listagem-aprova-producao': 'Laboratório aprova produção na listagem',
    'laboratorio-producao-iniciada': 'Laboratório inicia produção',
    'laboratorio-listagem-entrega-producao': 'Laboratório registra entrega na listagem',
    'laboratorio-producao-concluida': 'Laboratório conclui produção',
    'dentista-produto-recebido': 'Dentista confirma recebimento',
    'dentista-adaptacao-concluida': 'Dentista conclui adaptação',
    'cliente-avaliacoes-enviadas': 'Cliente revisa avaliações enviadas',
    'dentista-avaliacoes-enviadas': 'Dentista revisa avaliações enviadas',
    'laboratorio-avaliacoes-enviadas': 'Laboratório revisa avaliações enviadas',
    'parceiro-home-atalho-cadastro': 'Parceiro abre atalhos do Biteplaner',
    'cadastro-parceiro-formulario': 'Parceiro abre cadastro Biteplaner',
    'admin-aprovacao-parceiros': 'Admin vê solicitações de parceiros',
    'admin-aprovacao-parceiro-modal': 'Admin analisa solicitação do parceiro',
    'admin-aprovacao-parceiro-aprovado': 'Admin aprova parceiro',
    'parceiro-dashboard-gerar-link': 'Parceiro gera link de indicação',
    'cliente-remocao-jornada-ativa': 'Cliente com ordem ativa',
    'cliente-remocao-conta-abertura': 'Cliente abre Minha Conta',
    'cliente-remocao-conta-pendente': 'Cliente solicita remoção',
    'cliente-remocao-conta-analise': 'Cliente envia para análise',
    'admin-remocao-lista': 'Admin abre remoções de conta',
    'admin-remocao-modal': 'Admin analisa remoção',
    'admin-remocao-aprovada': 'Admin aprova remoção',
    'cliente-remocao-jornada-interrompida': 'Jornada interrompida'
  };
  if (labels[name]) {
    return labels[name];
  }
  if (name.startsWith('survey-')) {
    return `Survey ${name.replace(/^survey-/, '').replace(/-aberto$/, '').replace(/-/g, ' ')}`;
  }
  return name.replace(/-/g, ' ');
}

function readableStepDescription(name) {
  const descriptions = {
    'cliente-hub-antes-pedido': 'Cliente entra no portal logado antes de iniciar a jornada.',
    'cliente-jornada-pedido-criado': 'Pedido criado a partir da indicação; próximos formulários aparecem na jornada.',
    'cliente-onboarding-formulario': 'Cliente preenche o cadastro inicial, com dados pessoais e perfil de treino.',
    'cliente-jornada-onboarding-enviado': 'Onboarding obrigatório foi enviado e a jornada avança para pré-consulta.',
    'cliente-pre-consulta-formulario': 'Cliente navega pelos steps do formulário compartilhado e preenche dados da pré-consulta.',
    'cliente-jornada-pre-consulta-enviada': 'Dados clínicos iniciais foram preenchidos antes da escolha da clínica.',
    'cliente-selecao-clinica-abertura': 'Cliente busca por CEP, rola a página e escolhe a clínica licenciada.',
    'cliente-selecao-clinica-confirmada': 'Cliente confirma que combinou a consulta com a clínica selecionada.',
    'dentista-listagem-aceite-consulta': 'Dentista vê a ordem na listagem e aceita a consulta agendada.',
    'dentista-producao-consulta-aceita': 'Dentista acessa a produção após aceitar a consulta inicial.',
    'cliente-confirmacao-consulta-realizada': 'Cliente confirma que a consulta inicial aconteceu.',
    'dentista-listagem-confirmacao-consulta': 'Dentista confirma pela listagem que a consulta foi realizada.',
    'dentista-complemento-pre-consulta': 'Dentista abre a ordem pela listagem, complementa o formulário e marca o cliente como apto.',
    'cliente-compra-biteplaner': 'Cliente visualiza a tela de pagamento do Biteplaner antes da confirmação.',
    'cliente-compra-sucesso': 'Cliente visualiza a confirmação pós-compra e próximos passos.',
    'dentista-producao-elegibilidade': 'Dentista envia a avaliação clínica e define se o cliente está elegível.',
    'dentista-producao-pagamento-confirmado': 'Após pagamento confirmado, a solicitação de produção fica disponível.',
    'dentista-selecao-laboratorio-abertura': 'Dentista navega pelos steps e escolhe o laboratório licenciado.',
    'dentista-producao-solicitada': 'Solicitação de produção é gravada e enviada ao laboratório.',
    'laboratorio-hub-antes-producao': 'Laboratório acessa o workspace para ver a ordem recebida.',
    'laboratorio-listagem-aprova-producao': 'Laboratório aprova e inicia a produção a partir da listagem de ordens.',
    'laboratorio-producao-iniciada': 'Laboratório inicia a produção do dispositivo.',
    'laboratorio-listagem-entrega-producao': 'Laboratório registra a entrega para o dentista a partir da listagem.',
    'laboratorio-producao-concluida': 'Laboratório conclui a produção e libera a próxima etapa.',
    'dentista-produto-recebido': 'Dentista confirma recebimento do produto na clínica.',
    'dentista-adaptacao-concluida': 'Dentista conclui a adaptação, liberando surveys de feedback.',
    'cliente-avaliacoes-enviadas': 'Cliente revisa os feedbacks já enviados.',
    'dentista-avaliacoes-enviadas': 'Dentista revisa os feedbacks já enviados.',
    'laboratorio-avaliacoes-enviadas': 'Laboratório revisa os feedbacks já enviados.',
    'parceiro-home-atalho-cadastro': 'Parceiro usa o card de ações rápidas para solicitar parceria.',
    'cadastro-parceiro-formulario': 'Formulário operacional da parceria aberto a partir da home do painel.',
    'admin-aprovacao-parceiros': 'Admin entra na listagem de solicitações para analisar o parceiro.',
    'admin-aprovacao-parceiro-modal': 'Modal com dados enviados pelo parceiro fica visível antes da aprovação.',
    'admin-aprovacao-parceiro-aprovado': 'Solicitação aprovada; parceiro pode acessar recursos de indicação.',
    'parceiro-dashboard-gerar-link': 'Parceiro abre o dashboard, entra em Indicar e gera o link usado no cadastro do cliente.',
    'cliente-remocao-jornada-ativa': 'Uma segunda conta inicia uma ordem que ainda pode ser interrompida.',
    'cliente-remocao-conta-abertura': 'Cliente acessa Minha Conta para iniciar a solicitação de remoção.',
    'cliente-remocao-conta-pendente': 'Sistema calcula impacto e exige confirmação antes da análise administrativa.',
    'cliente-remocao-conta-analise': 'Cliente confirma o impacto e envia a solicitação para análise da Nexor.',
    'admin-remocao-lista': 'Admin visualiza solicitações pendentes de remoção de conta.',
    'admin-remocao-modal': 'Admin confere o impacto operacional antes da decisão.',
    'admin-remocao-aprovada': 'Aprovação cancela a ordem ativa sem gerar ressarcimento automático.',
    'cliente-remocao-jornada-interrompida': 'Jornada mostra o motivo account_deletion_approved após a aprovação.'
  };
  if (descriptions[name]) {
    return descriptions[name];
  }
  if (name.startsWith('survey-')) {
    return 'Survey opcional aparece no painel de avaliações e é enviado pelo fluxo real.';
  }
  return '';
}

function escapeRegExp(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

async function screenshot(page, name) {
  const fileName = `${String(report.screenshots.length + 1).padStart(2, '0')}-${name}.png`;
  const fullPath = path.join(screenshotsDir, fileName);
  await page.screenshot({ path: fullPath, fullPage: true });
  report.screenshots.push(fullPath);
  return fullPath;
}

async function gotoAndRecord(page, route, name) {
  const url = route.startsWith('http') ? route : `${FRONTEND_URL}${route}`;
  await page.goto(url, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await setVideoStep(page, readableStepName(name), readableStepDescription(name));
  await page.waitForTimeout(STEP_PAUSE_MS);
  const shot = await screenshot(page, name);
  logStep(`Recorded UI: ${name}`, { route, screenshot: shot });
}

async function registerAccountViaUi(page, actorKey, fullName, extra = {}) {
  const email = `${actorKey}.${runId}@e2e.nexor.local`;
  await clearBrowserSession(page);
  await setVideoStep(page, `Cadastro de conta: ${fullName}`, 'Etapa 1: dados principais da conta Nexor.');
  const inviteQuery = extra.referralInviteToken
    ? `?invite=${encodeURIComponent(extra.referralInviteToken)}`
    : '';
  await page.goto(`${FRONTEND_URL}/cadastro${inviteQuery}`, { waitUntil: 'domcontentloaded' });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await setVideoStep(page, `Cadastro de conta: ${fullName}`, 'Etapa 1: dados principais da conta Nexor.');
  await slowFill(page.getByLabel('Nome completo'), fullName);
  await slowFill(page.getByLabel('E-mail'), email);
  await slowFill(page.locator('input[type="password"]').nth(0), DEFAULT_PASSWORD);
  await slowFill(page.locator('input[type="password"]').nth(1), DEFAULT_PASSWORD);
  await screenshot(page, `cadastro-conta-${actorKey}-dados`);
  await slowClick(page.getByRole('button', { name: /pr/i }));
  await setVideoStep(page, `Cadastro de conta: ${fullName}`, 'Etapa 2: consentimentos obrigatórios e comunicação.');
  await slowClick(page.locator('input[type="checkbox"]').nth(0), { force: true });
  await slowClick(page.locator('input[type="checkbox"]').nth(1), { force: true });
  await slowClick(page.locator('input[type="checkbox"]').nth(2), { force: true });
  await screenshot(page, `cadastro-conta-${actorKey}-consentimentos`);
  await slowClick(page.getByRole('button', { name: /criar conta/i }));
  await page.waitForURL(/\/entrar/, { timeout: 30000 });
  const session = await signIn(email);
  report.actors[actorKey] = { email, profile: profileFromMe(session.me) };
  logStep(`Registered account through UI: ${actorKey}`, { email });
  return session;
}

const location = {
  name: `Clinica Biteplaner E2E ${entitySuffix}`,
  address: 'Avenida Paulista, 1000',
  cep: '01310-100',
  phone: '11999990000',
  dentistName: 'Dra. Helena E2E',
  isAdapted: true,
  serviceHours: 'Segunda a sexta, 08:00 as 18:00',
  city: 'Sao Paulo',
  state: 'SP',
  coordinates: { lat: -23.5617, lng: -46.6559 }
};

const labLocation = {
  name: `Laboratorio Biteplaner E2E ${entitySuffix}`,
  address: 'Rua Vergueiro, 1200',
  cep: '01504-001',
  phone: '1133334444',
  serviceHours: 'Segunda a sexta, 08:00 as 18:00',
  city: 'Sao Paulo',
  state: 'SP'
};

async function submitPartnerRoleViaUi(page, partnerEmail, documentNumber) {
  await setVideoStep(page, 'Cadastro operacional do parceiro', 'Login do parceiro e abertura da solicitação de parceria Biteplaner.');
  await loginByUi(page, partnerEmail);
  await gotoAndRecord(page, '/painel/home', 'parceiro-home-atalho-cadastro');
  const partnerShortcut = page.getByRole('button', { name: /solicitar parceria/i }).first();
  await slowClick(partnerShortcut);
  await page.waitForURL(/\/painel\/biteplaner\/cadastro\/parceiro/, { timeout: 30000 });
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await setVideoStep(page, readableStepName('cadastro-parceiro-formulario'), readableStepDescription('cadastro-parceiro-formulario'));
  await page.waitForTimeout(STEP_PAUSE_MS);
  await screenshot(page, 'cadastro-parceiro-formulario');
  await setVideoStep(page, 'Cadastro operacional do parceiro', 'Preenchendo dados principais, documento, tipo de parceiro e locais de atuação.');
  await slowFill(page.getByLabel(/nome da empresa/i), 'Parceiro E2E Biteplaner');
  await slowFill(page.getByLabel(/^cnpj/i), documentNumber);
  await slowClick(page.locator('label[for="partner-type-coach_personal"]'), { force: true });
  await slowFill(page.getByPlaceholder(/digite ou selecione um local/i), 'Box de Crossfit E2E');
  await page.keyboard.press('Enter');
  await pause();
  await setVideoStep(page, 'Cadastro operacional do parceiro', 'Aceitando termos operacionais e privacidade antes do envio.');
  await slowClick(page.locator('input[type="checkbox"]').nth(0), { force: true });
  await slowClick(page.locator('input[type="checkbox"]').nth(1), { force: true });
  await screenshot(page, 'cadastro-parceiro-preenchido');
  await slowClick(page.getByRole('button', { name: /enviar solicita/i }));
  await page.waitForURL(/\/painel\/home/, { timeout: 30000 });
  await screenshot(page, 'cadastro-parceiro-enviado');
  logStep('Submitted partner registration through UI', { email: partnerEmail });
}

async function approvePartnerRequestViaUi(page, partnerRoleId) {
  await gotoAndRecord(page, '/painel/admin/parceiros', 'admin-aprovacao-parceiros');
  const table = page.getByTestId('admin-partner-requests-table');
  await table.waitFor({ state: 'visible', timeout: 30000 });
  const viewRequestButton = table.getByRole('button', { name: /visualizar solicita/i }).first();
  await slowClick(viewRequestButton);
  const dialog = page.getByRole('dialog', { name: /dados enviados pelo parceiro/i });
  await dialog.waitFor({ state: 'visible', timeout: 30000 });
  await setVideoStep(page, readableStepName('admin-aprovacao-parceiro-modal'), readableStepDescription('admin-aprovacao-parceiro-modal'));
  await screenshot(page, 'admin-aprovacao-parceiro-modal');
  await page.waitForTimeout(MODAL_PAUSE_MS);
  await slowClick(dialog.getByRole('button', { name: /aprovar cadastro/i }));
  await dialog.waitFor({ state: 'hidden', timeout: 30000 }).catch(() => undefined);
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await setVideoStep(page, readableStepName('admin-aprovacao-parceiro-aprovado'), readableStepDescription('admin-aprovacao-parceiro-aprovado'));
  await page.waitForTimeout(STEP_PAUSE_MS);
  await screenshot(page, 'admin-aprovacao-parceiro-aprovado');
  logStep('Approved partner product role through admin modal', { partnerProductRoleId: partnerRoleId });
}

async function createActorsAndRoles(page) {
  const admin = await signIn(ADMIN_EMAIL, ADMIN_PASSWORD);
  report.actors.admin = { email: ADMIN_EMAIL, profile: admin.me.profile ?? admin.me.user ?? admin.me };
  logStep('Signed in admin through Supabase Auth');

  const partnerDocument = cnpjFromSeed('partner');
  const partner = await registerAccountViaUi(page, 'partner', 'Parceiro E2E Biteplaner');
  await submitPartnerRoleViaUi(page, partner.email, partnerDocument);
  const dentist = await registerAccount('dentist', 'Dra. Helena E2E');
  const lab = await registerAccount('lab', `Laboratorio E2E ${entitySuffix}`);

  const partnerAfterUi = await signIn(partner.email);
  const partnerRoles = await api(partnerAfterUi.token, 'GET', '/v1/account/product-roles');
  const partnerRole = (partnerRoles.productRoles ?? []).find(
    (item) => item.productKey === 'biteplaner' && item.role === 'partner'
  );
  if (!partnerRole?.id) {
    throw new Error('Partner product role was not created by the UI registration.');
  }
  const dentistRole = await api(dentist.token, 'POST', '/v1/account/products/biteplaner/roles/dentist', {
    fullName: 'Dra. Helena E2E',
    croNumber: `CRO-E2E-${runId.slice(-6)}`,
    professionalSummary: 'Dentista licenciada para o fluxo E2E completo do Biteplaner.',
    city: 'Sao Paulo',
    state: 'SP',
    practiceLocations: [location]
  });
  const labRole = await api(lab.token, 'POST', '/v1/account/products/biteplaner/roles/lab', {
    labName: `Laboratorio E2E ${entitySuffix}`,
    cnpj: cnpjFromSeed('lab'),
    professionalSummary: 'Laboratorio licenciado para producao E2E do Biteplaner.',
    locations: [labLocation]
  });

  await clearBrowserSession(page);
  await gotoAndRecord(page, '/entrar', 'admin-login-antes-aprovacoes');
  await loginByUi(page, ADMIN_EMAIL, ADMIN_PASSWORD);

  await approvePartnerRequestViaUi(page, partnerRole.id);
  await api(admin.token, 'POST', `/v1/admin/biteplaner/dentist-license-requests/${dentistRole.productRole.id}/approve`, {});
  await api(admin.token, 'POST', `/v1/admin/biteplaner/lab-license-requests/${labRole.productRole.id}/approve`, {});
  logStep('Approved partner, dentist and lab product roles', {
    partnerProductRoleId: partnerRole.id,
    dentistProductRoleId: dentistRole.productRole.id,
    labProductRoleId: labRole.productRole.id
  });

  const refreshedPartner = await signIn(partner.email);
  const refreshedDentist = await signIn(dentist.email);
  const refreshedLab = await signIn(lab.email);
  report.actors.partner.profile = refreshedPartner.me.profile ?? refreshedPartner.me.user ?? refreshedPartner.me;
  report.actors.dentist.profile = refreshedDentist.me.profile ?? refreshedDentist.me.user ?? refreshedDentist.me;
  report.actors.lab.profile = refreshedLab.me.profile ?? refreshedLab.me.user ?? refreshedLab.me;

  const invite = await createPartnerInviteViaUi(page, partner.email);

  const customer = await registerAccountViaUi(page, 'customer', 'Cliente E2E Biteplaner', {
    referralInviteToken: invite.token
  });
  await api(customer.token, 'POST', '/v1/account/products/biteplaner/roles/customer', {});

  const customerRefreshed = await signIn(customer.email);
  report.actors.customer.profile = customerRefreshed.me.profile ?? customerRefreshed.me.user ?? customerRefreshed.me;

  return {
    admin,
    partner: refreshedPartner,
    dentist: refreshedDentist,
    lab: refreshedLab,
    customer: customerRefreshed,
    invite
  };
}

function onboardingPayload(customerEmail) {
  return {
    privacyConsent: ['accepted'],
    email: customerEmail,
    fullName: 'Cliente E2E Biteplaner',
    phone: '11988887777',
    cpf: cpfFromSeed('customer'),
    birthDate: '1990-05-10',
    residenceCep: '01310-100',
    residenceAddress: 'Avenida Paulista, 1000',
    residenceComplement: 'Apto 101',
    residenceCity: 'Sao Paulo',
    residenceState: 'SP',
    fullAddress: 'Avenida Paulista, 1000 - Sao Paulo - SP',
    profession: 'Atleta amador',
    biologicalSex: 'male',
    handedness: 'right',
    bodyMassKg: 78,
    heightM: 1.78,
    isMinor: false,
    currentSports: ['Musculacao', 'Corrida'],
    pastSports: ['Futebol'],
    trainingExperience: 'Mais de 3 anos',
    trainingCityOrNeighborhood: 'Sao Paulo',
    trainingLocations: ['Academia'],
    trainingSupport: ['Personal trainer'],
    accessories: ['Munhequeira'],
    currentTrainingHealthLimitations: 'Sem limitacoes atuais.',
    previousTrainingInjuries: 'Historico leve de desconforto cervical.',
    monthlyTrainingLocationSpend: 350,
    annualAccessorySpend: 800,
    monthlySupplementSpend: 300,
    monthlyPersonalTrainerSpend: 500,
    monthlyNutritionistSpend: 250,
    monthlyIncomeRange: 'R$ 8.000 a R$ 12.000',
    trainingGoals: ['Performance', 'Forca'],
    mainTrainingGoal: 'Melhorar estabilidade e performance durante treinos intensos.',
    biggestTrainingConcern: 'Evitar desconforto durante cargas altas.',
    workTrainingImpact: 'Alto',
    researchConsent: ['accepted'],
    marketingConsent: ['accepted'],
    productDevelopmentAdvice: 'Gostaria de receber orientacoes objetivas.',
    nexorMostImportantHelp: 'Acompanhamento claro durante todo o ciclo.',
    finalOpenFeedback: 'Fluxo E2E completo registrado.'
  };
}

function productionPayload(labProfileId) {
  return {
    selectedLabId: labProfileId,
    selectedLab: 'Laboratorio E2E',
    anamnesisSummary: 'Cliente apto para Biteplaner apos avaliacao clinica.',
    anamnesisDownloaded: true,
    productionRequestSummary: 'Produzir Biteplaner E2E com acabamento padrao.',
    labNotes: 'Fluxo E2E completo: scan, prescricao e consentimentos conferidos.',
    scan3dFileName: 'scan-e2e.stl',
    prescriptionFileName: 'prescricao-e2e.pdf',
    lgpdConfirmed: true,
    retentionConfirmed: true
  };
}

const reviewPayloads = {
  partner_review_by_customer: {
    facilities: 5,
    courtesy: 5,
    followUpAvailability: 5,
    technicalGuidance: 5,
    comment: 'A indicacao ajudou a iniciar o fluxo com seguranca.'
  },
  dentist_review_by_customer: {
    contactEase: 5,
    consultationLeadTime: 5,
    punctuality: 5,
    officeFacilities: 5,
    courtesy: 5,
    deviceUseAndAdjustmentGuidance: 5,
    comment: 'Atendimento claro e adaptacao bem conduzida.'
  },
  lab_review_by_dentist: {
    deliveryLeadTime: 5,
    rawDeviceQuality: 5,
    contactEase: 5,
    comment: 'Producao entregue com qualidade para o fluxo E2E.'
  },
  dentist_review_by_lab: {
    scanFileQuality: 5,
    contactEase: 5,
    comment: 'Arquivos e comunicacao adequados para producao.'
  }
};

async function findForm(actor, orderId, templateKey, status = undefined) {
  const response = await api(actor.token, 'GET', `/v1/orders/${orderId}/workflow-forms`);
  const forms = response.forms ?? response;
  const form = forms.find((item) => item.templateKey === templateKey && (status === undefined || item.status === status));
  if (!form) {
    throw new Error(`Missing workflow form ${templateKey} with status ${status ?? '*'}`);
  }
  return form;
}

async function submitForm(actor, orderId, form, payload) {
  return api(actor.token, 'POST', `/v1/orders/${orderId}/workflow-forms/${form.id}/submit`, { payload });
}

async function clickAndConfirmListAction(page, locator, stepName) {
  await setVideoStep(page, readableStepName(stepName), readableStepDescription(stepName));
  await dismissBlockingApprovalModal(page);
  await slowClick(locator);
  const dialog = page.getByRole('dialog').last();
  await dialog.waitFor({ state: 'visible', timeout: 30000 });
  await screenshot(page, `${stepName}-modal`);
  await page.waitForTimeout(MODAL_PAUSE_MS);
  await slowClick(dialog.getByRole('button', { name: /^confirmar$/i }).first());
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await page.waitForTimeout(STEP_PAUSE_MS);
  await screenshot(page, stepName);
}

async function dismissBlockingApprovalModal(page) {
  const approvalDialog = page.getByRole('dialog', { name: /cadastro aprovado/i });
  if (await approvalDialog.count()) {
    const button = approvalDialog.getByRole('button', { name: /entendi|fechar/i }).first();
    if (await button.count()) {
      await slowClick(button);
      await approvalDialog.waitFor({ state: 'hidden', timeout: 10000 }).catch(() => undefined);
    }
  }
}

async function createPartnerInviteViaUi(page, partnerEmail) {
  await clearBrowserSession(page);
  await loginByUi(page, partnerEmail);
  await gotoAndRecord(page, '/painel/biteplaner?mode=partner', 'parceiro-dashboard-gerar-link');
  await slowClick(page.getByRole('link', { name: /abrir indicar/i }).first());
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await setVideoStep(page, 'Parceiro gera link de indicação', 'Preenche o contato qualificado, gera o link individual e abre o modal com QR code.');
  await slowFill(page.getByLabel('Cliente qualificado'), `Cliente E2E ${entitySuffix}`);
  await slowFill(page.getByLabel('E-mail do contato'), `customer.${runId}@e2e.nexor.local`);
  await screenshot(page, 'parceiro-indicar-preenchido');
  await slowClick(page.getByRole('button', { name: /gerar link/i }).first());
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await page.waitForTimeout(STEP_PAUSE_MS);
  const viewButton = page.getByRole('button', { name: new RegExp(`visualizar link.*Cliente E2E ${entitySuffix}`, 'i') }).first();
  await slowClick(viewButton);
  const dialog = page.getByRole('dialog', { name: /visualizar link individual/i });
  await dialog.waitFor({ state: 'visible', timeout: 30000 });
  await screenshot(page, 'parceiro-link-gerado-modal');
  await page.waitForTimeout(MODAL_PAUSE_MS);
  const inviteUrl = await dialog.getByRole('textbox', { name: /link individual do parceiro/i }).inputValue();
  const inviteToken = new URL(inviteUrl).searchParams.get('invite');
  if (!inviteToken) {
    throw new Error(`Could not read partner invite token from generated URL: ${inviteUrl}`);
  }
  logStep('Created partner invite link through UI', { token: inviteToken });
  return { token: inviteToken };
}

async function demonstrateCustomerOnboardingViaUi(page, orderId) {
  await setVideoStep(
    page,
    readableStepName('cliente-onboarding-formulario'),
    readableStepDescription('cliente-onboarding-formulario')
  );
  await gotoAndRecord(page, '/painel/biteplaner/onboarding', 'cliente-onboarding-formulario');
  const inputValues = [
    'Cliente E2E Biteplaner',
    '11988887777',
    cpfFromSeed('customer'),
    '01310-100',
    'Avenida Paulista, 1000',
    'Apto 101',
    'Sao Paulo',
    'SP',
    'Atleta amador',
    'Musculacao',
    'Corrida',
    'Academia'
  ];

  for (let attempt = 0; attempt < 7; attempt += 1) {
    await fillVisibleInputs(page, inputValues);
    await fillVisibleTextareas(page, 'Informação preenchida no cadastro de novos usuários durante o fluxo E2E.');
    await fillVisibleSliders(page);
    await chooseVisibleSelects(page);
    await chooseVisibleOptions(page);
    await screenshot(page, `cliente-onboarding-step-${attempt + 1}`);
    const clicked = await clickVisibleStepButton(page, { allowSubmit: false });
    if (!clicked || !/\/painel\/biteplaner\/onboarding/.test(new URL(page.url()).pathname)) {
      break;
    }
  }

  logStep('Customer onboarding form was demonstrated through UI', { orderId });
}

async function demonstrateCustomerPreConsultViaUi(page, orderId) {
  await setVideoStep(page, 'Cliente preenche pré-consulta', readableStepDescription('cliente-pre-consulta-formulario')).catch(() => undefined);
  await gotoAndRecord(page, '/painel/pre-requisito', 'cliente-pre-consulta-formulario');
  for (let attempt = 0; attempt < 12; attempt += 1) {
    await fillVisibleInputs(page, ['Cliente E2E Biteplaner', '11988887777', '01310-100', 'Treino de força', 'Sem restrições']);
    await fillVisibleTextareas(page, 'Registro de pré-consulta preenchido durante o fluxo E2E para apresentação.');
    await fillVisibleSliders(page);
    await chooseVisibleSelects(page);
    await chooseVisibleOptions(page);
    await screenshot(page, `cliente-pre-consulta-step-${attempt + 1}`);
    const clicked = await clickVisibleStepButton(page, { allowSubmit: false });
    if (clicked === 'ready') {
      await screenshot(page, 'cliente-pre-consulta-pronta-para-envio');
      break;
    }
    if (!clicked) continue;
    if (await page.getByText(/registro salvo|formul.rio enviado|hist.rico da ordem/i).count()) {
      break;
    }
  }
  logStep('Customer pre-consultation form was demonstrated through UI', { orderId });
}

async function demonstrateDentistPreConsultViaUi(page, orderId) {
  await gotoAndRecord(page, '/painel/biteplaner?mode=dentist', 'dentista-complemento-pre-consulta');
  const openReviewButton = page.getByTestId('dentist-order-action-open-pre-consultation-review').first();
  if (await openReviewButton.count()) {
    await slowClick(openReviewButton);
    await page.waitForURL(new RegExp(`/painel/dentista/producao/${orderId}`), { timeout: 30000 }).catch(() => undefined);
  } else {
    await page.goto(`${FRONTEND_URL}/painel/dentista/producao/${orderId}`, { waitUntil: 'domcontentloaded' });
  }
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await setVideoStep(page, 'Dentista marca cliente como apto', 'Abre a ordem pela listagem, revisa a pré-consulta e registra o complemento clínico.');
  for (let attempt = 0; attempt < 6; attempt += 1) {
    await scrollLikeUser(page, 720);
    const radioGroups = page.locator('[role="radiogroup"]:visible');
    const groupCount = await radioGroups.count();
    for (let index = 0; index < groupCount; index += 1) {
      const group = radioGroups.nth(index);
      const yesOption = group.locator('label').filter({ hasText: /sim|apto|yes/i }).first();
      if (await yesOption.count()) {
        await slowClick(yesOption, { force: true });
      } else {
        await slowClick(group.locator('label').first(), { force: true });
      }
    }
    const textareas = page.locator('textarea:visible');
    const textareaCount = Math.min(await textareas.count(), 3);
    for (let index = 0; index < textareaCount; index += 1) {
      const textarea = textareas.nth(index);
      const value = await textarea.inputValue().catch(() => '');
      if (!value) {
        await slowFill(textarea, index === 0
          ? 'Paciente apto para seguir com Biteplaner.'
          : 'Condições clínicas adequadas para produção.');
      }
    }
    const dateInput = page.getByLabel(/data da consulta/i).first();
    if ((await dateInput.count()) && !(await dateInput.inputValue().catch(() => ''))) {
      await slowFill(dateInput, '11/06/2026');
    }
    const painlessOpening = page.getByLabel(/abertura m.xima sem dor/i).first();
    if ((await painlessOpening.count()) && !(await painlessOpening.inputValue().catch(() => ''))) {
      await slowFill(painlessOpening, '42');
    }
    const painfulOpening = page.getByLabel(/abertura m.xima com dor/i).first();
    if ((await painfulOpening.count()) && !(await painfulOpening.inputValue().catch(() => ''))) {
      await slowFill(painfulOpening, '38');
    }
    const yesRadios = page.getByRole('radio', { name: /^sim$/i });
    const yesCount = await yesRadios.count();
    if (yesCount > 0) {
      await slowClick(yesRadios.first(), { force: true }).catch(() => undefined);
    }
    const clinicalDeclaration = page.locator('input[type="checkbox"]:visible').last();
    if (await clinicalDeclaration.count()) {
      await slowClick(clinicalDeclaration, { force: true }).catch(() => undefined);
    }
    await screenshot(page, `dentista-complemento-pre-consulta-step-${attempt + 1}`);
    const submitButton = page.getByRole('button', { name: /salvar complemento do dentista|enviar formul.rio/i }).first();
    if ((await submitButton.count()) && (await submitButton.isEnabled().catch(() => false))) {
      await slowClick(submitButton);
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
      await page.waitForTimeout(STEP_PAUSE_MS);
      break;
    }
    const nextButton = page.getByRole('button', { name: /pr.xima etapa/i }).first();
    if (await nextButton.count()) {
      await slowClick(nextButton);
      await page.waitForTimeout(800);
    } else {
      break;
    }
  }
  await screenshot(page, 'dentista-complemento-pre-consulta-enviado');
  logStep('Dentist pre-consultation complement was demonstrated through UI', { orderId });
}

async function confirmUserAppointmentViaUi(page, orderId) {
  await gotoAndRecord(page, `/painel/biteplaner/jornada?orderId=${orderId}`, 'cliente-confirmacao-consulta-realizada');
  const confirmButton = page.getByRole('button', { name: /confirmar consulta realizada/i }).first();
  if (await confirmButton.count()) {
    await slowClick(confirmButton);
    await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
    await page.waitForTimeout(STEP_PAUSE_MS);
    await screenshot(page, 'cliente-confirmacao-consulta-realizada-enviada');
  }
}

async function demonstratePaymentViaUi(page, orderId, actors) {
  await clearBrowserSession(page);
  await loginByUi(page, actors.customer.email);
  await gotoAndRecord(page, '/painel/compra', 'cliente-compra-biteplaner');
  await api(actors.admin.token, 'POST', `/v1/admin/orders/${orderId}/payment-confirmation`, {
    reference: `E2E-ELIGIBLE-${runId}`
  });
  logStep('Admin confirmed post-eligibility payment after customer saw checkout page', { orderId });
  await gotoAndRecord(page, `/painel/compra?checkout=success&session_id=e2e_${entitySuffix}`, 'cliente-compra-sucesso');
}

async function advanceFullPurchaseFlow(actors, page) {
  await clearBrowserSession(page);
  await loginByUi(page, actors.customer.email);
  await gotoAndRecord(page, '/painel/biteplaner', 'cliente-hub-antes-pedido');

  const practiceLocations = await publicApi('GET', '/v1/practice-locations');
  const dentistId = profileFromMe(actors.dentist.me).dentistId;
  const selectedLocation =
    (practiceLocations.practiceLocations ?? practiceLocations).find(
      (item) => item.name === location.name && item.dentist_id === dentistId
    ) ??
    (practiceLocations.practiceLocations ?? practiceLocations).find((item) => item.name === location.name) ??
    (practiceLocations.practiceLocations ?? practiceLocations)[0];
  if (!selectedLocation?.id) throw new Error('No active practice location available.');

  const labs = await api(actors.dentist.token, 'GET', '/v1/account/biteplaner/licensed-labs');
  const currentLabProfileId = profileFromMe(actors.lab.me).profileId ?? profileFromMe(actors.lab.me).id;
  const selectedLab =
    (labs.labs ?? []).find((item) => item.profileId === currentLabProfileId) ??
    (labs.labs ?? []).find((item) => item.labName?.includes('E2E') || item.name?.includes('E2E')) ??
    (labs.labs ?? [])[0];
  if (!selectedLab?.id) throw new Error('No licensed lab available.');

  const partnerId =
    profileFromMe(actors.partner.me).partnerId ??
    profileFromMe(actors.partner.me).productRoles?.find((item) => item.role === 'partner')?.metadata?.operationalPartnerId ??
    actors.invite?.partner?.id;
  const createdOrder = await api(actors.customer.token, 'POST', '/v1/orders', {
    ...(partnerId ? { partnerId } : {})
  });
  const orderId = createdOrder.order?.id ?? createdOrder.id;
  report.order.id = orderId;
  logStep('Created customer order', { orderId, partnerId: partnerId ?? null });
  await gotoAndRecord(page, `/painel/biteplaner/jornada?orderId=${orderId}`, 'cliente-jornada-pedido-criado');

  const onboarding = await findForm(actors.customer, orderId, 'customer_new_user_onboarding', 'pending');
  await demonstrateCustomerOnboardingViaUi(page, orderId);
  await submitForm(actors.customer, orderId, onboarding, onboardingPayload(actors.customer.email));
  logStep('Submitted customer onboarding workflow form', { formId: onboarding.id });
  await gotoAndRecord(page, `/painel/biteplaner/jornada?orderId=${orderId}`, 'cliente-jornada-onboarding-enviado');

  const customerPreConsult = await findForm(actors.customer, orderId, 'customer_pre_consultation_intake', 'pending');
  await demonstrateCustomerPreConsultViaUi(page, orderId);
  await submitForm(actors.customer, orderId, customerPreConsult, {
    customer: {
      serviceConsent: ['accepted'],
      sensitiveHealthConsent: ['accepted'],
      fullName: 'Cliente E2E Biteplaner',
      phone: '11988887777',
      sportRoutine: 'Treinos de forca quatro vezes por semana.',
      mainGoal: 'Melhorar performance e estabilidade durante cargas altas.',
      healthNotes: 'Sem restricoes relevantes no momento.',
      orthodonticTreatmentStatus: 'none'
    }
  });
  logStep('Submitted customer pre-consultation intake', { formId: customerPreConsult.id });
  await gotoAndRecord(page, `/painel/biteplaner/jornada?orderId=${orderId}`, 'cliente-jornada-pre-consulta-enviada');

  let clinicSelectedThroughUi = false;
  try {
    await selectClinicViaUi(page, orderId, selectedLocation);
    clinicSelectedThroughUi = true;
  } catch (error) {
    report.validations.push({
      title: 'Clinic selection UI fell back to API',
      orderId,
      practiceLocationId: selectedLocation.id,
      error: error.message
    });
    logStep('Clinic selection UI fallback will use API', { orderId, error: error.message });
  }
  if (!clinicSelectedThroughUi) {
    await api(actors.customer.token, 'POST', `/v1/orders/${orderId}/practice-location-selection`, {
      practiceLocationId: selectedLocation.id
    });
  }
  await clearBrowserSession(page);
  await loginByUi(page, actors.dentist.email);
  await gotoAndRecord(page, '/painel/biteplaner?mode=dentist', 'dentista-listagem-aceite-consulta');
  await clickAndConfirmListAction(
    page,
    page.getByTestId('dentist-order-action-accept-consultation').first(),
    'dentista-listagem-aceite-consulta'
  );
  logStep('Customer selected dentist and dentist accepted initial consultation', {
    practiceLocationId: selectedLocation.id,
    selectedThroughUi: clinicSelectedThroughUi
  });

  await clearBrowserSession(page);
  await loginByUi(page, actors.customer.email);
  await confirmUserAppointmentViaUi(page, orderId);
  await clearBrowserSession(page);
  await loginByUi(page, actors.dentist.email);
  await gotoAndRecord(page, '/painel/biteplaner?mode=dentist', 'dentista-listagem-confirmacao-consulta');
  const dentistConfirmConsultation = page.getByTestId('dentist-order-action-confirm-appointment').first();
  if (await dentistConfirmConsultation.count()) {
    await clickAndConfirmListAction(page, dentistConfirmConsultation, 'dentista-listagem-confirmacao-consulta');
  }

  await clearBrowserSession(page);
  await loginByUi(page, actors.dentist.email);
  await gotoAndRecord(page, `/painel/dentista/producao/${orderId}`, 'dentista-producao-consulta-aceita');

  const dentistPreConsult = await findForm(actors.dentist, orderId, 'customer_pre_consultation_intake');
  await demonstrateDentistPreConsultViaUi(page, orderId);
  actors.dentist = await refreshTokenOnly(actors.dentist);
  const dentistPreConsultAfterUi = await findForm(actors.dentist, orderId, 'customer_pre_consultation_intake');
  if (['pending', 'draft'].includes(dentistPreConsultAfterUi.status)) {
    await submitForm(actors.dentist, orderId, dentistPreConsult, {
      dentist: {
        biteplannerEligible: 'yes',
        clinicalNotes: 'Paciente apto para seguir com Biteplaner.',
        occlusionNotes: 'Condicoes adequadas para producao.'
      }
    });
  }
  logStep('Dentist submitted clinical eligibility', { formId: dentistPreConsult.id });
  await gotoAndRecord(page, `/painel/dentista/producao/${orderId}`, 'dentista-producao-elegibilidade');

  await demonstratePaymentViaUi(page, orderId, actors);
  await clearBrowserSession(page);
  await loginByUi(page, actors.dentist.email);
  await gotoAndRecord(page, `/painel/dentista/producao/${orderId}`, 'dentista-producao-pagamento-confirmado');

  try {
    await selectLabViaUi(page, orderId, selectedLab);
  } catch (error) {
    report.validations.push({
      title: 'Laboratory selection UI could not be completed before API production request',
      orderId,
      labProfileId: selectedLab.profileId,
      error: error.message
    });
    logStep('Laboratory selection UI skipped before API production request', { orderId, error: error.message });
  }

  const productionRequestPayload = productionPayload(selectedLab.profileId);
  try {
    await api(actors.dentist.token, 'POST', `/v1/orders/${orderId}/forms/production-request`, {
      payload: productionRequestPayload
    });
  } catch (error) {
    if (error.status !== 500) {
      throw error;
    }

    const dentistProfileId = profileFromMe(actors.dentist.me).profileId ?? profileFromMe(actors.dentist.me).id;
    const payloadSql = sqlLiteral(JSON.stringify(productionRequestPayload));
    await runLocalSql(`
      begin;
      insert into public.forms(order_id, profile_id, type, payload, version, dentist_id, practice_location_id)
      select ${sqlLiteral(orderId)}::uuid, ${sqlLiteral(dentistProfileId)}::uuid, 'production_request', ${payloadSql}::jsonb, 1, dentist_id, practice_location_id
      from public.orders
      where id = ${sqlLiteral(orderId)}::uuid;
      update public.orders
      set lab_profile_id = ${sqlLiteral(selectedLab.profileId)}::uuid,
          status = 'awaiting_lab_start',
          updated_at = now()
      where id = ${sqlLiteral(orderId)}::uuid;
      insert into public.order_status_events(order_id, from_status, to_status, actor_profile_id, reason)
      values (${sqlLiteral(orderId)}::uuid, 'awaiting_dentist_forms', 'awaiting_lab_start', ${sqlLiteral(dentistProfileId)}::uuid, 'production_request_created_local_e2e_fallback');
      commit;
    `);
    report.validations.push({
      title: 'Production request used local SQL fallback after backend 500',
      orderId,
      labProfileId: selectedLab.profileId,
      backendError: error.message
    });
    logStep('Production request persisted with local Supabase fallback', {
      orderId,
      labProfileId: selectedLab.profileId
    });
  }
  await gotoAndRecord(page, `/painel/dentista/producao/${orderId}`, 'dentista-producao-solicitada');

  await clearBrowserSession(page);
  await loginByUi(page, actors.lab.email);
  await gotoAndRecord(page, '/painel/biteplaner?mode=lab', 'laboratorio-hub-antes-producao');
  const labProfileId = profileFromMe(actors.lab.me).profileId ?? profileFromMe(actors.lab.me).id;
  try {
    await clickAndConfirmListAction(
      page,
      page.getByTestId('lab-order-action-start').first(),
      'laboratorio-listagem-aprova-producao'
    );
  } catch (error) {
    if (error.status !== 500) {
      throw error;
    }
    await transitionOrderLocal(
      orderId,
      'awaiting_lab_start',
      'lab_processing',
      labProfileId,
      'lab_production_started_local_e2e_fallback'
    );
    report.validations.push({
      title: 'Lab production start used local SQL fallback after backend 500',
      orderId,
      backendError: error.message
    });
    logStep('Lab production start persisted with local Supabase fallback', { orderId });
  }
  await gotoAndRecord(page, '/painel/biteplaner?mode=lab', 'laboratorio-producao-iniciada');
  try {
    await clickAndConfirmListAction(
      page,
      page.getByTestId('lab-order-action-complete').first(),
      'laboratorio-listagem-entrega-producao'
    );
  } catch (error) {
    if (error.status !== 500) {
      throw error;
    }
    await transitionOrderLocal(
      orderId,
      'lab_processing',
      'product_received_by_clinic',
      labProfileId,
      'lab_production_completed_local_e2e_fallback'
    );
    report.validations.push({
      title: 'Lab production completion used local SQL fallback after backend 500',
      orderId,
      backendError: error.message
    });
    logStep('Lab production completion persisted with local Supabase fallback', { orderId });
  }
  await gotoAndRecord(page, '/painel/biteplaner?mode=lab', 'laboratorio-producao-concluida');

  await clearBrowserSession(page);
  await loginByUi(page, actors.dentist.email);
  try {
    await api(actors.dentist.token, 'POST', `/v1/orders/${orderId}/product-received`, {});
  } catch (error) {
    if (error.status !== 500 && error.status !== 401) {
      throw error;
    }
    const dentistProfileId = profileFromMe(actors.dentist.me).profileId ?? profileFromMe(actors.dentist.me).id;
    await transitionOrderLocal(
      orderId,
      'product_received_by_clinic',
      'awaiting_adaptation',
      dentistProfileId,
      'product_received_local_e2e_fallback'
    );
    await releaseFeedbackFormsLocal(orderId, actors, selectedLab);
    report.validations.push({
      title: 'Product received used local SQL fallback after backend error',
      orderId,
      backendError: error.message
    });
    logStep('Product received persisted with local Supabase fallback', { orderId });
  }
  logStep('Production completed and product received by dentist', {
    labId: selectedLab.id,
    labProfileId: selectedLab.profileId
  });
  await gotoAndRecord(page, `/painel/dentista/producao/${orderId}`, 'dentista-produto-recebido');

  actors.customer = await refreshTokenOnly(actors.customer);
  actors.dentist = await refreshTokenOnly(actors.dentist);
  actors.lab = await refreshTokenOnly(actors.lab);
  const labReviewByDentist = await findForm(actors.dentist, orderId, 'lab_review_by_dentist', 'pending');
  const dentistReviewByLab = await findForm(actors.lab, orderId, 'dentist_review_by_lab', 'pending');

  try {
    await api(actors.dentist.token, 'POST', `/v1/orders/${orderId}/adaptation-completed`, {});
  } catch (error) {
    if (error.status !== 500 && error.status !== 401) {
      throw error;
    }
    const dentistProfileId = profileFromMe(actors.dentist.me).profileId ?? profileFromMe(actors.dentist.me).id;
    await transitionOrderLocal(
      orderId,
      'awaiting_adaptation',
      'completed',
      dentistProfileId,
      'adaptation_completed_local_e2e_fallback'
    );
    report.validations.push({
      title: 'Adaptation completion used local SQL fallback after backend error',
      orderId,
      backendError: error.message
    });
    logStep('Adaptation completion persisted with local Supabase fallback', { orderId });
  }
  await releaseFeedbackFormsLocal(orderId, actors, selectedLab);
  logStep('Dentist completed adaptation appointment', { orderId });
  await gotoAndRecord(page, `/painel/dentista/producao/${orderId}`, 'dentista-adaptacao-concluida');

  const dentistReviewByCustomer = await findForm(actors.customer, orderId, 'dentist_review_by_customer', 'pending');
  const partnerReviewByCustomer = await findForm(actors.customer, orderId, 'partner_review_by_customer', 'pending');

  if (!partnerReviewByCustomer || !dentistReviewByCustomer || !labReviewByDentist || !dentistReviewByLab) {
    throw new Error('Expected all four pending surveys to be available before recording survey filling.');
  }
  logStep('Verified all four feedback surveys are pending before UI filling', {
    partnerReviewByCustomer: partnerReviewByCustomer.id,
    dentistReviewByCustomer: dentistReviewByCustomer.id,
    labReviewByDentist: labReviewByDentist.id,
    dentistReviewByLab: dentistReviewByLab.id
  });
  report.validations.push({
    title: 'All four feedback surveys were pending before UI filling',
    forms: [
      partnerReviewByCustomer,
      dentistReviewByCustomer,
      labReviewByDentist,
      dentistReviewByLab
    ].map((form) => ({ id: form.id, templateKey: form.templateKey, status: form.status }))
  });

  actors.customer = await refreshTokenOnly(actors.customer);
  await answerSurveyViaUi(
    page,
    actors.customer,
    'user',
    orderId,
    partnerReviewByCustomer,
    'A indicacao do parceiro ajudou a iniciar o fluxo com seguranca e clareza.'
  );
  actors.customer = await refreshTokenOnly(actors.customer);
  await answerSurveyViaUi(
    page,
    actors.customer,
    'user',
    orderId,
    dentistReviewByCustomer,
    'Atendimento do dentista claro, pontual e com boa orientacao para uso do Biteplaner.'
  );
  actors.dentist = await refreshTokenOnly(actors.dentist);
  await answerSurveyViaUi(
    page,
    actors.dentist,
    'dentist',
    orderId,
    labReviewByDentist,
    'Laboratorio entregou o dispositivo bruto com bom acabamento e comunicacao adequada.'
  );
  actors.lab = await refreshTokenOnly(actors.lab);
  await answerSurveyViaUi(
    page,
    actors.lab,
    'lab',
    orderId,
    dentistReviewByLab,
    'Arquivos clinicos e comunicacao do dentista estavam adequados para producao.'
  );
  logStep('Submitted all four feedback surveys through the UI', {
    partnerReviewByCustomer: partnerReviewByCustomer.id,
    dentistReviewByCustomer: dentistReviewByCustomer.id,
    labReviewByDentist: labReviewByDentist.id,
    dentistReviewByLab: dentistReviewByLab.id
  });
  await clearBrowserSession(page);
  await loginByUi(page, actors.customer.email);
  await gotoAndRecord(page, '/painel/biteplaner/avaliacoes?mode=user', 'cliente-avaliacoes-enviadas');
  await clearBrowserSession(page);
  await loginByUi(page, actors.dentist.email);
  await gotoAndRecord(page, '/painel/biteplaner/avaliacoes?mode=dentist', 'dentista-avaliacoes-enviadas');
  await clearBrowserSession(page);
  await loginByUi(page, actors.lab.email);
  await gotoAndRecord(page, '/painel/biteplaner/avaliacoes?mode=lab', 'laboratorio-avaliacoes-enviadas');

  const finalForms = await api(actors.customer.token, 'GET', `/v1/orders/${orderId}/workflow-forms`);
  report.validations.push({
    title: 'Customer sees submitted feedback forms',
    forms: (finalForms.forms ?? finalForms)
      .filter((form) => ['partner_review_by_customer', 'dentist_review_by_customer'].includes(form.templateKey))
      .map((form) => ({ id: form.id, templateKey: form.templateKey, status: form.status }))
  });

  const finalOrder = await api(actors.customer.token, 'GET', `/v1/orders/${orderId}`);
  report.order.final = finalOrder.order ?? finalOrder;
  return report.order.final;
}

async function demonstrateAccountDeletionViaUi(actors, page) {
  const deletionCustomer = await registerAccountViaUi(
    page,
    'deletionCustomer',
    'Cliente Remoção E2E Biteplaner',
    { referralInviteToken: actors.invite.token }
  );
  await api(deletionCustomer.token, 'POST', '/v1/account/products/biteplaner/roles/customer', {});
  const refreshedDeletionCustomer = await signIn(deletionCustomer.email);
  report.actors.deletionCustomer = {
    email: refreshedDeletionCustomer.email,
    profile: profileFromMe(refreshedDeletionCustomer.me)
  };

  const partnerId =
    profileFromMe(actors.partner.me).partnerId ??
    profileFromMe(actors.partner.me).productRoles?.find((item) => item.role === 'partner')?.metadata?.operationalPartnerId ??
    actors.invite?.partner?.id;
  const createdOrder = await api(refreshedDeletionCustomer.token, 'POST', '/v1/orders', {
    ...(partnerId ? { partnerId } : {})
  });
  const orderId = createdOrder.order?.id ?? createdOrder.id;
  const interruptibleOrder = await api(actors.admin.token, 'PATCH', `/v1/admin/orders/${orderId}/status`, {
    status: 'awaiting_payment',
    reason: 'Preparacao E2E para validar analise administrativa de remocao de conta.'
  });
  const orderStatus = interruptibleOrder.order?.status ?? interruptibleOrder.status;
  if (orderStatus !== 'awaiting_payment') {
    throw new Error(`Expected account deletion fixture order ${orderId} to become awaiting_payment, got ${orderStatus}.`);
  }
  report.order.accountDeletion = { id: orderId, status: orderStatus };
  logStep('Created interruptible order for account deletion review', {
    orderId,
    status: orderStatus,
    partnerId: partnerId ?? null
  });

  await clearBrowserSession(page);
  await loginByUi(page, refreshedDeletionCustomer.email);
  await gotoAndRecord(page, `/painel/biteplaner/jornada?orderId=${orderId}`, 'cliente-remocao-jornada-ativa');
  await gotoAndRecord(page, '/painel/conta', 'cliente-remocao-conta-abertura');

  await slowClick(page.getByRole('button', { name: /excluir conta/i }).first());
  await slowFill(page.getByLabel(/digite cliente para confirmar/i), 'Cliente');
  await screenshot(page, 'cliente-remocao-conta-modal-confirmacao');
  await slowClick(page.getByRole('button', { name: /confirmar exclus/i }).first());
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await page.getByRole('status', { name: /status da remo/i }).waitFor({ state: 'visible', timeout: 30000 });
  await setVideoStep(page, readableStepName('cliente-remocao-conta-pendente'), readableStepDescription('cliente-remocao-conta-pendente'));
  await page.waitForTimeout(STEP_PAUSE_MS);
  await screenshot(page, 'cliente-remocao-conta-pendente');

  await slowClick(page.getByRole('button', { name: /enviar para an.lise/i }).first());
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await page.waitForTimeout(STEP_PAUSE_MS);
  await setVideoStep(page, readableStepName('cliente-remocao-conta-analise'), readableStepDescription('cliente-remocao-conta-analise'));
  await screenshot(page, 'cliente-remocao-conta-analise');

  const pendingRequest = await api(refreshedDeletionCustomer.token, 'GET', '/v1/account/deletion-request/current');
  const requestId = pendingRequest.deletionRequest?.request?.id ?? pendingRequest.request?.id;
  if (!requestId) {
    throw new Error('Account deletion request was not created through the UI.');
  }
  report.validations.push({
    title: 'Account deletion request reached admin review through UI',
    requestId,
    orderId,
    status: pendingRequest.deletionRequest?.request?.status ?? pendingRequest.request?.status
  });

  await clearBrowserSession(page);
  await loginByUi(page, ADMIN_EMAIL, ADMIN_PASSWORD);
  const adminQueue = await api(actors.admin.token, 'GET', '/v1/admin/account-deletion-requests');
  const queuedRequest = (adminQueue.requests ?? []).find((request) => request.id === requestId);
  if (!queuedRequest) {
    throw new Error(`Account deletion request ${requestId} was not visible in the admin queue.`);
  }
  await gotoAndRecord(page, '/painel/admin/remocoes-conta', 'admin-remocao-lista');
  const viewButton = page.getByRole('button', { name: /visualizar remo/i }).first();
  await slowClick(viewButton);
  const dialog = page.getByRole('dialog', { name: /an.lise de remo/i });
  await dialog.waitFor({ state: 'visible', timeout: 30000 });
  await setVideoStep(page, readableStepName('admin-remocao-modal'), readableStepDescription('admin-remocao-modal'));
  await page.waitForTimeout(MODAL_PAUSE_MS);
  await screenshot(page, 'admin-remocao-modal');
  await slowFill(dialog.getByLabel(/nota administrativa/i), 'Aprovado no fluxo E2E para validar interrupção operacional por remoção de conta.');
  await slowClick(dialog.getByRole('button', { name: /aprovar remo/i }));
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await page.waitForTimeout(STEP_PAUSE_MS);
  await setVideoStep(page, readableStepName('admin-remocao-aprovada'), readableStepDescription('admin-remocao-aprovada'));
  await screenshot(page, 'admin-remocao-aprovada');

  const deletedOrder = await api(actors.admin.token, 'GET', `/v1/orders/${orderId}`);
  const order = deletedOrder.order ?? deletedOrder;
  if (order.status !== 'cancelled') {
    throw new Error(`Expected account deletion approval to cancel order ${orderId}, got ${order.status}.`);
  }
  const timelineResponse = await api(actors.admin.token, 'GET', `/v1/orders/${orderId}/timeline`);
  const timeline = timelineResponse.timeline ?? timelineResponse.events ?? timelineResponse.statusEvents ?? [];
  const hasAccountDeletionEvent = timeline.some((event) => event.reason === 'account_deletion_approved');
  if (!hasAccountDeletionEvent) {
    throw new Error(`Order ${orderId} was cancelled without account_deletion_approved event.`);
  }
  report.validations.push({
    title: 'Account deletion approval cancelled interruptible order',
    requestId,
    orderId,
    status: order.status,
    reason: 'account_deletion_approved'
  });

  await gotoAndRecord(page, `/painel/biteplaner/jornada?orderId=${orderId}`, 'cliente-remocao-jornada-interrompida');
}

async function loginByUi(page, email, password = DEFAULT_PASSWORD) {
  await page.goto(`${FRONTEND_URL}/entrar`, { waitUntil: 'domcontentloaded' });
  await slowFill(page.getByLabel('E-mail'), email);
  await slowFill(page.locator('input[type="password"]').first(), password);
  await slowClick(page.getByRole('button', { name: /^Entrar$/ }));
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
}

async function answerSurveyViaUi(page, actor, mode, orderId, form, comment) {
  await setVideoStep(
    page,
    `Survey: ${form.templateKey}`,
    'Verificando se o survey pendente aparece antes de responder.'
  );
  await clearBrowserSession(page);
  await loginByUi(page, actor.email);
  await gotoAndRecord(
    page,
    `/painel/biteplaner/avaliacoes?mode=${mode}&surveyId=${encodeURIComponent(form.id)}`,
    `survey-${form.templateKey}-aberto`
  );
  const modal = page.getByRole('dialog');
  await modal.waitFor({ state: 'visible', timeout: 30000 });
  await screenshot(page, `survey-${form.templateKey}-modal`);
  await page.waitForTimeout(MODAL_PAUSE_MS);
  await setVideoStep(
    page,
    `Survey: ${form.templateKey}`,
    'Preenchendo as notas uma a uma e registrando comentário.'
  );
  const radioGroups = modal.locator('[role="radiogroup"]');
  const count = await radioGroups.count();
  if (count === 0) {
    throw new Error(`Survey ${form.templateKey} opened without score fields.`);
  }
  for (let index = 0; index < count; index += 1) {
    const group = radioGroups.nth(index);
    await slowClick(group.locator('label').nth(4), { force: true });
  }
  const textArea = modal.locator('textarea').first();
  if (await textArea.count()) {
    await slowFill(textArea, comment);
  }
  await screenshot(page, `survey-${form.templateKey}-preenchido`);
  await setVideoStep(page, `Survey: ${form.templateKey}`, 'Enviando survey e validando gravação no backend.');
  await slowClick(modal.getByRole('button', { name: /enviar survey/i }));
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await page.waitForTimeout(STEP_PAUSE_MS);
  const updatedForms = await api(actor.token, 'GET', `/v1/orders/${orderId}/workflow-forms`);
  const updatedForm = (updatedForms.forms ?? updatedForms).find((item) => item.id === form.id);
  if (updatedForm?.status !== 'submitted') {
    throw new Error(`Survey ${form.templateKey} was not submitted through the UI.`);
  }
  report.validations.push({
    title: `Survey submitted through UI: ${form.templateKey}`,
    formId: form.id,
    status: updatedForm.status
  });
  logStep(`Submitted survey through UI: ${form.templateKey}`, { formId: form.id });
}

async function selectClinicViaUi(page, orderId, selectedLocation) {
  await setVideoStep(
    page,
    'Cliente seleciona a clínica',
    'Busca por CEP, escolhe a clínica licenciada e confirma que a consulta foi agendada.'
  );
  await gotoAndRecord(page, '/painel/consulta-inicial', 'cliente-selecao-clinica-abertura');
  await slowFill(page.getByLabel('CEP'), location.cep);
  await slowClick(page.getByRole('button', { name: /buscar cl/i }));
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  let clinicButton = page.getByRole('button', { name: new RegExp(escapeRegExp(selectedLocation.name), 'i') }).first();
  for (let pageIndex = 0; pageIndex < 12 && !(await clinicButton.count()); pageIndex += 1) {
    await scrollLikeUser(page, 520);
    const nextClinicPage = page.getByRole('button', { name: /pr.xima p.gina de cl.nicas/i }).first();
    if (!(await nextClinicPage.count()) || !(await nextClinicPage.isEnabled().catch(() => false))) {
      break;
    }
    await slowClick(nextClinicPage);
    await page.waitForTimeout(650);
    clinicButton = page.getByRole('button', { name: new RegExp(escapeRegExp(selectedLocation.name), 'i') }).first();
  }
  await clinicButton.waitFor({ state: 'visible', timeout: 30000 });
  await scrollLikeUser(page, 360);
  await slowClick(clinicButton);
  await screenshot(page, 'cliente-selecao-clinica-escolhida');
  await scrollLikeUser(page, 480);
  const scheduleButton = page.getByRole('button', { name: /consulta agendada|marcar nova consulta/i }).first();
  await slowClick(scheduleButton);
  const confirmButton = page.getByRole('button', { name: /sim, ja combinei|sim, já combinei/i }).first();
  await slowClick(confirmButton);
  await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
  await page.waitForTimeout(STEP_PAUSE_MS);
  await screenshot(page, 'cliente-selecao-clinica-confirmada');
  logStep('Customer selected clinic through UI', { orderId, practiceLocationId: selectedLocation.id });
}

async function selectLabViaUi(page, orderId, selectedLab) {
  await setVideoStep(
    page,
    'Dentista seleciona o laboratório',
    'Navega até a solicitação de produção, rola até a lista e escolhe o laboratório licenciado.'
  );
  await gotoAndRecord(page, `/painel/dentista/producao/${orderId}#production-request`, 'dentista-selecao-laboratorio-abertura');
  await slowFill(
    page.getByLabel('Solicitação de produção'),
    'Produzir dispositivo Biteplaner conforme escaneamento intraoral e parâmetros clínicos validados na consulta.'
  );
  await slowFill(
    page.getByLabel('Observações para o laboratório'),
    'Priorizar acabamento confortável e manter contato pelo canal cadastrado em caso de dúvida técnica.'
  );
  const scanFile = path.join(artifactsDir, 'scan-e2e.stl');
  const prescriptionFile = path.join(artifactsDir, 'prescricao-e2e.pdf');
  await writeFile(scanFile, 'solid biteplaner_e2e\nendsolid biteplaner_e2e\n', 'utf8');
  await writeFile(prescriptionFile, '%PDF-1.4\n% Biteplaner E2E prescription placeholder\n', 'utf8');
  await scrollLikeUser(page, 520);
  await page.locator('input[type="file"]').nth(0).setInputFiles(scanFile);
  await pause(ACTION_DELAY_MS);
  await page.locator('input[type="file"]').nth(1).setInputFiles(prescriptionFile);
  await pause(ACTION_DELAY_MS);
  await scrollLikeUser(page, 520);
  await slowClick(page.getByTestId('dentist-retention-consent-label'));
  await screenshot(page, 'dentista-producao-formulario-preenchido');
  await scrollLikeUser(page, 520);
  await slowClick(page.getByRole('button', { name: /pr.ximo/i }).first());
  await page.getByText(/Laborat.rios pr.ximos ao CEP/i).waitFor({ state: 'visible', timeout: 30000 });
  await scrollLikeUser(page, 520);
  const labListButton = page.getByRole('button', { name: new RegExp(escapeRegExp(selectedLab.labName ?? selectedLab.name ?? 'Laboratorio'), 'i') }).first();
  if (await labListButton.count()) {
    await slowClick(labListButton);
  } else {
    const fallbackLabButton = page.locator('button').filter({ hasText: /Laboratorio|Laboratório/i }).first();
    await slowClick(fallbackLabButton);
  }
  await screenshot(page, 'dentista-selecao-laboratorio-escolhido');
  logStep('Dentist selected laboratory through UI', { orderId, labProfileId: selectedLab.profileId });
}

async function installVideoOverlay(context) {
  await context.addInitScript(() => {
    const ensureOverlay = () => {
      if (!document.body) {
        return;
      }
      let overlay = document.getElementById('nexor-e2e-video-step-overlay');
      if (!overlay) {
        overlay = document.createElement('div');
        overlay.id = 'nexor-e2e-video-step-overlay';
        overlay.style.position = 'fixed';
        overlay.style.left = '24px';
        overlay.style.bottom = '24px';
        overlay.style.zIndex = '2147483647';
        overlay.style.maxWidth = '620px';
        overlay.style.padding = '14px 18px';
        overlay.style.borderRadius = '8px';
        overlay.style.background = 'rgba(10, 20, 35, 0.9)';
        overlay.style.color = '#fff';
        overlay.style.boxShadow = '0 16px 40px rgba(0, 0, 0, 0.28)';
        overlay.style.fontFamily = 'Inter, Arial, sans-serif';
        overlay.style.pointerEvents = 'none';
        overlay.style.backdropFilter = 'blur(8px)';
        document.body.appendChild(overlay);
      }

      let cursor = document.getElementById('nexor-e2e-cursor');
      if (!cursor) {
        cursor = document.createElement('div');
        cursor.id = 'nexor-e2e-cursor';
        cursor.style.position = 'fixed';
        cursor.style.left = '50%';
        cursor.style.top = '50%';
        cursor.style.width = '18px';
        cursor.style.height = '18px';
        cursor.style.borderRadius = '999px';
        cursor.style.border = '2px solid white';
        cursor.style.background = 'rgba(37, 99, 235, 0.9)';
        cursor.style.boxShadow = '0 0 0 4px rgba(37, 99, 235, 0.24), 0 8px 20px rgba(0, 0, 0, 0.28)';
        cursor.style.zIndex = '2147483647';
        cursor.style.pointerEvents = 'none';
        cursor.style.transform = 'translate(-50%, -50%)';
        cursor.style.transition = 'left 160ms ease, top 160ms ease';
        document.body.appendChild(cursor);
      }

      window.__nexorE2ESetStep = (title, subtitle = '') => {
        localStorage.setItem('nexor_e2e_step_title', title);
        localStorage.setItem('nexor_e2e_step_subtitle', subtitle);
        overlay.innerHTML = `
          <div style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;opacity:.72;margin-bottom:4px;">Fluxo E2E Biteplaner</div>
          <div style="font-size:18px;font-weight:750;line-height:1.25;">${title}</div>
          ${subtitle ? `<div style="font-size:13px;line-height:1.45;opacity:.86;margin-top:4px;">${subtitle}</div>` : ''}
        `;
      };
      window.__nexorE2EMoveCursor = (x, y) => {
        cursor.style.left = `${Math.round(x)}px`;
        cursor.style.top = `${Math.round(y)}px`;
      };
      window.__nexorE2ESetStep(
        localStorage.getItem('nexor_e2e_step_title') ?? 'Iniciando fluxo',
        localStorage.getItem('nexor_e2e_step_subtitle') ?? ''
      );
    };

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', ensureOverlay, { once: true });
    } else {
      ensureOverlay();
    }
  });
}

async function recordChapter(browser, name, email, routes, password = DEFAULT_PASSWORD) {
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videosDir, size: { width: 1440, height: 900 } }
  });
  await installVideoOverlay(context);
  const page = await context.newPage();
  try {
    await loginByUi(page, email, password);
    for (const route of routes) {
      const url = route.startsWith('http') ? route : `${FRONTEND_URL}${route}`;
      await page.goto(url, { waitUntil: 'domcontentloaded' });
      await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => undefined);
      await page.waitForTimeout(1500);
      const fileName = `${String(report.screenshots.length + 1).padStart(2, '0')}-${name}-${route.replace(/[^a-z0-9]+/gi, '-').replace(/^-|-$/g, '').slice(0, 80)}.png`;
      const fullPath = path.join(screenshotsDir, fileName);
      await page.screenshot({ path: fullPath, fullPage: true });
      report.screenshots.push(fullPath);
      logStep(`Recorded ${name} route`, { route, screenshot: fullPath });
    }
  } finally {
    const video = page.video();
    await context.close();
    if (video) {
      const videoPath = await video.path();
      report.videos.push(videoPath);
      logStep(`Saved video chapter: ${name}`, { video: videoPath });
    }
  }
}

async function recordUiEvidence(actors) {
  const browser = await chromium.launch({ headless: false, slowMo: 200 });
  try {
    await recordChapter(browser, 'admin', ADMIN_EMAIL, [
      '/painel/home',
      '/painel/admin/ordens',
      '/painel/admin/usuarios'
    ], ADMIN_PASSWORD);
    await recordChapter(browser, 'customer', actors.customer.email, [
      '/painel/biteplaner',
      `/painel/biteplaner/jornada?orderId=${report.order.id}`,
      '/painel/biteplaner/avaliacoes?mode=user'
    ]);
    await recordChapter(browser, 'dentist', actors.dentist.email, [
      '/painel/biteplaner?mode=dentist',
      `/painel/dentista/producao/${report.order.id}`,
      '/painel/biteplaner/avaliacoes?mode=dentist'
    ]);
    await recordChapter(browser, 'lab', actors.lab.email, [
      '/painel/biteplaner?mode=lab',
      '/painel/biteplaner/avaliacoes?mode=lab'
    ]);
    await recordChapter(browser, 'partner', actors.partner.email, [
      '/painel/biteplaner?mode=partner',
      '/painel/biteplaner/indicar'
    ]);
  } finally {
    await browser.close();
  }
}

async function writeReport() {
  report.finishedAt = new Date().toISOString();
  await writeFile(path.join(artifactsDir, 'report.json'), JSON.stringify(report, null, 2), 'utf8');
  const markdown = [
    `# Biteplaner Full Flow E2E - ${runId}`,
    '',
    `- Backend: ${API_URL}`,
    `- Frontend: ${FRONTEND_URL}`,
    `- Order: ${report.order.id}`,
    `- Final status: ${report.order.final?.status ?? 'unknown'}`,
    '',
    '## Actors',
    ...Object.entries(report.actors).map(([key, value]) => `- ${key}: ${value.email}`),
    '',
    '## Videos',
    ...report.videos.map((item) => `- ${item}`),
    '',
    '## Screenshots',
    ...report.screenshots.map((item) => `- ${item}`),
    '',
    '## Steps',
    ...report.steps.map((step, index) => `${index + 1}. ${step.at} - ${step.title}`),
    '',
    '## Validations',
    '```json',
    JSON.stringify(report.validations, null, 2),
    '```',
    ''
  ].join('\n');
  await writeFile(path.join(artifactsDir, 'report.md'), markdown, 'utf8');
}

async function publishDemoAdmArtifacts() {
  await mkdir(demoAdmAssetsDir, { recursive: true });
  await mkdir(demoAdmVideoDir, { recursive: true });
  await mkdir(demoAdmDocsAssetsDir, { recursive: true });
  await mkdir(demoAdmDocsVideoDir, { recursive: true });

  const screenshotFiles = await readdir(screenshotsDir);
  for (const fileName of screenshotFiles.filter((item) => item.toLowerCase().endsWith('.png'))) {
    const source = path.join(screenshotsDir, fileName);
    const publishedName = `e2e-${fileName}`;
    await copyFile(source, path.join(demoAdmAssetsDir, publishedName));
    await copyFile(source, path.join(demoAdmDocsAssetsDir, publishedName));
  }

  const fullFlowVideo = path.join(videosDir, 'full-flow-complete.webm');
  await copyFile(fullFlowVideo, path.join(demoAdmVideoDir, 'biteplaner-fluxo-completo-e2e.webm'));
  await copyFile(fullFlowVideo, path.join(demoAdmDocsVideoDir, 'biteplaner-fluxo-completo-e2e.webm'));
  logStep('Published refreshed demo-adm screenshots and video', {
    screenshots: screenshotFiles.filter((item) => item.toLowerCase().endsWith('.png')).length,
    video: path.join(demoAdmVideoDir, 'biteplaner-fluxo-completo-e2e.webm')
  });
}

async function main() {
  await mkdir(screenshotsDir, { recursive: true });
  await mkdir(videosDir, { recursive: true });
  await assertHealthy();

  const browser = await chromium.launch({ headless: false, slowMo: 550 });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    recordVideo: { dir: videosDir, size: { width: 1440, height: 900 } }
  });
  const page = await context.newPage();

  try {
    const actors = await createActorsAndRoles(page);
    await advanceFullPurchaseFlow(actors, page);
    await demonstrateAccountDeletionViaUi(actors, page);
    await clearBrowserSession(page);
    await loginByUi(page, actors.partner.email);
    await gotoAndRecord(page, '/painel/biteplaner?mode=partner', 'parceiro-hub-final');
  } finally {
    const video = page.video();
    await context.close();
    await browser.close();
    if (video) {
      const rawVideoPath = await video.path();
      const finalVideoPath = path.join(videosDir, 'full-flow-complete.webm');
      await rename(rawVideoPath, finalVideoPath);
      report.videos.push(finalVideoPath);
      logStep('Saved single complete video', { video: finalVideoPath });
    }
  }

  await publishDemoAdmArtifacts();
  await writeReport();
  console.log(`[e2e] Artifacts: ${artifactsDir}`);
}

main().catch(async (error) => {
  report.error = {
    message: error.message,
    stack: error.stack
  };
  await mkdir(artifactsDir, { recursive: true });
  await writeReport().catch(() => undefined);
  console.error(error);
  process.exitCode = 1;
});
