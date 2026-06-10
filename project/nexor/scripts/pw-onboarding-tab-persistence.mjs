import { chromium } from 'playwright';

const baseUrl = process.env.NEXOR_E2E_BASE_URL ?? 'http://127.0.0.1:5173';

function inputAfterLabel(page, labelText) {
  return page.locator(`xpath=//label[contains(normalize-space(.), "${labelText}")]/following-sibling::div[1]//input`);
}

async function fail(page, browser, message, details = {}) {
  const bodyText = await page.locator('body').innerText().catch(() => '');
  console.error(
    JSON.stringify(
      {
        message,
        url: page.url(),
        bodyText: bodyText.slice(0, 2000),
        ...details,
      },
      null,
      2
    )
  );
  await browser.close();
  process.exit(1);
}

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext();
const page = await context.newPage();
const otherPage = await context.newPage();
const events = [];

page.on('framenavigated', (frame) => {
  if (frame === page.mainFrame()) {
    events.push(`navigated:${frame.url()}`);
  }
});

page.on('console', (message) => {
  const text = message.text();
  if (text.includes('[onboarding-e2e]')) {
    events.push(text);
  }
});

await page.addInitScript(() => {
  localStorage.setItem('nexor_demo_persona', 'athleteRegistered');
  window.addEventListener('DOMContentLoaded', () => {
    console.info('[onboarding-e2e] dom-content-loaded');
  });
});

await page.goto(`${baseUrl}/`, { waitUntil: 'networkidle' });
const roleResponse = await page.evaluate(async () => {
  const response = await fetch('http://127.0.0.1:3333/v1/account/products/biteplaner/roles/customer', {
    method: 'POST',
    headers: {
      authorization: 'Bearer demo-athleteRegistered-token',
      'content-type': 'application/json',
    },
    body: '{}',
  });

  return {
    ok: response.ok,
    status: response.status,
    body: await response.text(),
  };
});

if (!roleResponse.ok) {
  await fail(page, browser, 'Could not prepare the athleteRegistered demo onboarding order.', { roleResponse });
}

await page.evaluate(() => {
  window.history.pushState({}, '', '/painel/biteplaner/onboarding');
  window.dispatchEvent(new PopStateEvent('popstate'));
});

try {
  await page.getByRole('heading', { name: /cadastro de novos usu/i }).waitFor({ timeout: 15000 });
} catch {
  await fail(page, browser, 'Onboarding form did not render.', { events });
}

const privacyGate = page.locator('input[type="checkbox"]').first();
await privacyGate.waitFor({ timeout: 10000 }).catch(() => undefined);
if (await privacyGate.isVisible().catch(() => false)) {
  await privacyGate.click();
  await page.getByRole('button', { name: /continuar/i }).click();
}

try {
  await inputAfterLabel(page, 'CPF').waitFor({ timeout: 10000 });
} catch {
  await fail(page, browser, 'CPF field did not render after privacy gate.', { events });
}

const cpfInput = inputAfterLabel(page, 'CPF');
const professionInput = inputAfterLabel(page, 'Profissão');

await cpfInput.fill('52998224725');
await professionInput.fill('Atleta de teste');

const beforeSwitch = {
  cpfValue: await cpfInput.inputValue(),
  professionValue: await professionInput.inputValue(),
};

await otherPage.goto(`${baseUrl}/`, { waitUntil: 'domcontentloaded' });
await otherPage.bringToFront();
await page.waitForTimeout(1000);
await page.bringToFront();
await page.waitForTimeout(1000);

const afterSwitch = {
  cpfValue: await cpfInput.inputValue().catch(() => ''),
  professionValue: await professionInput.inputValue().catch(() => ''),
};

if (afterSwitch.cpfValue !== '529.982.247-25' || afterSwitch.professionValue !== 'Atleta de teste') {
  await fail(page, browser, 'Onboarding values were lost after switching tabs.', {
    beforeSwitch,
    afterSwitch,
    events,
  });
}

console.log(
  JSON.stringify(
    {
      ok: true,
      beforeSwitch,
      afterSwitch,
      events,
    },
    null,
    2
  )
);

await browser.close();
