import { chromium } from "playwright";
import fs from "node:fs";
import path from "node:path";

const assetsDir = path.resolve("docs/assets/apresentacao-painel-admin");
const baseUrl = process.env.CAPTURE_BASE_URL ?? "http://127.0.0.1:5180";

fs.mkdirSync(assetsDir, { recursive: true });

async function setPersona(page, persona) {
  await page.goto(`${baseUrl}/entrar`, { waitUntil: "networkidle" });
  await page.evaluate((nextPersona) => {
    localStorage.setItem("nexor_demo_persona", nextPersona);
    sessionStorage.clear();
  }, persona);
}

async function waitForReady(page, expectedText) {
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => undefined);
  if (expectedText) {
    await page
      .waitForFunction((text) => document.body.innerText.includes(text), expectedText, { timeout: 20000 })
      .catch(() => undefined);
  }
  await page.waitForFunction(() => {
    const text = document.body.innerText.toLowerCase();
    const loadingText = ["carregando", "loading", "aguarde"].some((term) => text.includes(term));
    const loadingClass = [...document.querySelectorAll("[class]")].some((element) => {
      const className = String(element.getAttribute("class")).toLowerCase();
      return className.includes("skeleton") || className.includes("loading");
    });
    return !loadingText && !loadingClass;
  }, { timeout: 12000 }).catch(() => undefined);
  await page.waitForTimeout(800);
}

async function screenshot(page, file) {
  await waitForReady(page);
  await page.screenshot({
    path: path.join(assetsDir, file),
    fullPage: true,
    animations: "disabled",
  });
  console.log(`captured ${file}`);
}

async function chooseVisibleSelect(page, currentLabel, optionText) {
  const button = page.locator("button").filter({ hasText: currentLabel }).first();
  if (!(await button.count())) return false;
  await button.click({ force: true });
  await page.getByText(optionText, { exact: true }).first().click({ force: true });
  await page.waitForTimeout(350);
  return true;
}

async function fillRequiredFields(page) {
  for (let cycle = 0; cycle < 16; cycle += 1) {
    const nextButton = page.locator("button").filter({ hasText: /^Próxima etapa$/ }).last();
    if ((await nextButton.count()) && !(await nextButton.isDisabled().catch(() => true))) {
      return true;
    }

    if (await chooseVisibleSelect(page, "Selecione", "Não")) continue;
    if (await chooseVisibleSelect(page, "Selecione uma opção", "Não")) continue;
    if (await chooseVisibleSelect(page, "Selecione", "Não informado")) continue;

    const uncheckedRadio = page.locator("input[type='radio']:not(:checked)").first();
    if (await uncheckedRadio.count()) {
      await uncheckedRadio.check({ force: true }).catch(() => undefined);
      await page.waitForTimeout(250);
      continue;
    }

    const emptyTextInputs = page.locator("input:not([type='checkbox']):not([type='radio'])").filter({
      hasNotText: /.+/,
    });
    const inputCount = await emptyTextInputs.count().catch(() => 0);
    if (inputCount > 0) {
      const input = emptyTextInputs.first();
      const type = await input.getAttribute("type").catch(() => "");
      const label = await input.evaluate((element) => element.labels?.[0]?.innerText ?? "").catch(() => "");
      let value = "Não informado";
      if (type === "date" || /data/i.test(label)) value = "2026-06-08";
      else if (/cpf/i.test(label)) value = "12345678909";
      else if (/cep/i.test(label)) value = "01001000";
      else if (/telefone|contato/i.test(label)) value = "11999999999";
      else if (/e-mail|email/i.test(label)) value = "cliente.demo@nexor.dev";
      else if (/massa|altura|dor|mm|nota|renda|gasto|horas|treinos/i.test(label)) value = "1";
      await input.fill(value).catch(() => undefined);
      await page.waitForTimeout(250);
      continue;
    }

    const uncheckedCheckbox = page.locator("input[type='checkbox']:not(:checked)").first();
    if (await uncheckedCheckbox.count()) {
      await uncheckedCheckbox.check({ force: true }).catch(() => undefined);
      await page.waitForTimeout(250);
      continue;
    }

    return false;
  }
  return false;
}

async function goNext(page) {
  await fillRequiredFields(page);
  const nextButton = page.locator("button").filter({ hasText: /^Próxima etapa$/ }).last();
  if ((await nextButton.count()) && !(await nextButton.isDisabled().catch(() => true))) {
    await nextButton.click();
    await page.waitForTimeout(1000);
    return true;
  }
  return false;
}

async function capturePreRequisito(page) {
  await setPersona(page, "athletePrerequisite");
  await page.goto(`${baseUrl}/painel/pre-consulta`, { waitUntil: "networkidle" });
  await waitForReady(page, "Dados iniciais");
  await screenshot(page, "09a-cliente-pre-consulta-secao-1.png");
  if (await goNext(page)) {
    await waitForReady(page, "Dados clínicos");
    await screenshot(page, "09b-cliente-pre-consulta-secao-2.png");
  }
  if (await goNext(page)) {
    await waitForReady(page, "Pesquisa de satisfação");
    await screenshot(page, "09c-cliente-pre-consulta-secao-3.png");
  }
}

async function captureDentistProduction(page) {
  await setPersona(page, "dentistLicensed");
  await page.goto(`${baseUrl}/painel/dentista/producao/BP-DEMO-004`, { waitUntil: "networkidle" });
  await waitForReady(page, "Etapa 1 de 4");
  await screenshot(page, "21a-dentista-producao-etapa-1.png");
  if (await goNext(page)) {
    await waitForReady(page, "DADOS CLÍNICOS");
    await screenshot(page, "21b-dentista-producao-etapa-1-secao-2.png");
  }
  if (await goNext(page)) {
    await waitForReady(page, "COMPLEMENTO DENTISTA");
    await screenshot(page, "21c-dentista-producao-complemento.png");
  }
}

async function captureFullPages(page) {
  const targets = [
    ["partner", "/painel/biteplaner/indicar?mode=partner", "03-parceiro-listagem-ordens-links.png", "Links gerados"],
    ["dentistLicensed", "/painel/biteplaner?mode=dentist", "20-dentista-listagem-ordens.png", "Fila operacional do dentista"],
    ["lab", "/painel/biteplaner?mode=lab", "22-laboratorio-listagem-ordens.png", "Fila operacional do laboratório"],
    ["partner", "/painel/biteplaner/cadastro/parceiro", "17-onboarding-parceiro-full.png", "Cadastro de parceiro Biteplaner"],
    ["dentist", "/painel/biteplaner/cadastro/dentista", "18-onboarding-dentista-full.png", "Solicitar cadastro de dentista"],
    ["lab", "/painel/biteplaner/cadastro/laborat%C3%B3rio", "19-onboarding-laboratorio-full.png", "Solicitar cadastro de laboratório"],
  ];

  for (const [persona, route, file, expectedText] of targets) {
    await setPersona(page, persona);
    await page.goto(`${baseUrl}${route}`, { waitUntil: "networkidle" });
    await waitForReady(page, expectedText);
    await screenshot(page, file);
  }
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 1440, height: 1400 },
    deviceScaleFactor: 1,
  });

  await capturePreRequisito(page);
  await captureDentistProduction(page);
  await captureFullPages(page);

  await browser.close();
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
