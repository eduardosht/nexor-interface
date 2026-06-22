import { chromium } from 'playwright';

const baseUrl = process.env.NEXOR_E2E_BASE_URL ?? 'http://127.0.0.1:5173';
const apiUrl = process.env.NEXOR_E2E_API_URL ?? 'http://127.0.0.1:3333';

const browser = await chromium.launch({ headless: true, channel: 'chrome' });
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  isMobile: true,
  hasTouch: true,
  deviceScaleFactor: 2
});
const page = await context.newPage();
page.on('console', (message) => {
  if (message.type() === 'error' || message.type() === 'warning') {
    console.log(JSON.stringify({ label: 'console', type: message.type(), text: message.text() }));
  }
});
page.on('pageerror', (error) => {
  console.log(JSON.stringify({ label: 'pageerror', name: error.name, message: error.message, stack: error.stack }));
});

await page.addInitScript(() => {
  localStorage.setItem('nexor_demo_persona', 'athleteRegistered');
});

await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle', timeout: 30000 });
await page.evaluate(async (mockApiUrl) => {
  try {
    const response = await fetch(`${mockApiUrl}/v1/account/products/biteplaner/roles/customer`, {
      method: 'POST',
      headers: {
        'x-demo-persona': 'athleteRegistered',
        'content-type': 'application/json'
      },
      body: '{}'
    });

    if (!response.ok) {
      throw new Error(`Unable to prepare Biteplaner onboarding: ${response.status}`);
    }
  } catch (error) {
    console.error(
      JSON.stringify({
        name: error instanceof Error ? error.name : 'unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : null
      })
    );
    throw error;
  }
}, apiUrl);
await page.evaluate(() => {
  window.history.pushState({}, '', '/painel/biteplaner/onboarding');
  window.dispatchEvent(new PopStateEvent('popstate'));
});

await page.waitForTimeout(3000);

const checkbox = page.locator('input[type="checkbox"]').first();
if (await checkbox.isVisible().catch(() => false)) {
  await checkbox.click();
  await page.getByRole('button', { name: /continuar/i }).click();
}

const progress = page.locator('[aria-label="Seu progresso"]').first();
try {
  await progress.waitFor({ timeout: 15000 });
} catch (error) {
  console.log(JSON.stringify({
    label: 'progressNotFound',
    url: page.url(),
    body: (await page.locator('body').innerText().catch(() => '')).slice(0, 3000)
  }));
  throw error;
}

async function snapshot(label) {
  const value = await progress.evaluate((element) => {
    const rect = element.getBoundingClientRect();
    return {
      expanded: element.getAttribute('aria-expanded'),
      touchAction: getComputedStyle(element).touchAction,
      rect: {
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        width: Math.round(rect.width),
        height: Math.round(rect.height)
      }
    };
  });
  console.log(JSON.stringify({ label, ...value }));
  return value;
}

await snapshot('before');

const box = await progress.boundingBox();
if (!box) {
  throw new Error('Progress sheet has no bounding box.');
}

await page.touchscreen.tap(box.x + box.width / 2, box.y + 20);
await page.waitForTimeout(250);
await snapshot('afterTapOpen');

await page.touchscreen.tap(box.x + box.width / 2, box.y + 20);
await page.waitForTimeout(250);
await snapshot('afterTapClose');

const client = await context.newCDPSession(page);
const touchX = Math.round(box.x + box.width / 2);
const touchStartY = Math.round(box.y + 45);
await client.send('Input.dispatchTouchEvent', {
  type: 'touchStart',
  touchPoints: [{ x: touchX, y: touchStartY, radiusX: 4, radiusY: 4, force: 1 }]
});
await client.send('Input.dispatchTouchEvent', {
  type: 'touchMove',
  touchPoints: [{ x: touchX, y: touchStartY - 120, radiusX: 4, radiusY: 4, force: 1 }]
});
await client.send('Input.dispatchTouchEvent', {
  type: 'touchEnd',
  touchPoints: []
});
await page.waitForTimeout(350);
const afterTouchDrag = await snapshot('afterTouchDrag');

if (afterTouchDrag.expanded !== 'true') {
  throw new Error('Expected touch drag to expand the onboarding progress sheet.');
}

await browser.close();
