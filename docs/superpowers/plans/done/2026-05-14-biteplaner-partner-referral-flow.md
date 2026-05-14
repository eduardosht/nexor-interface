# Biteplaner Partner Referral Flow Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the partner referral MVP with partner-only navigation, CPF/CNPJ onboarding, admin approval, a visual partner dashboard, a dedicated referral page, mock/backend support, and referral cookie persistence.

**Architecture:** Reuse the existing Biteplaner product-role model as the source of partner requests, mirroring dentist/lab admin review patterns without adding licensing course/contract workflow. Move partner operational link generation out of the Biteplaner Home into a new `Indicar` route, while the Home consumes partner summary metrics. Keep attribution reliable by validating invite tokens and storing a first-party cookie that is passed to product enrollment/order flows.

**Tech Stack:** React 19, TypeScript strict, Vite, Styled Components, Vitest, Fastify, Zod, Supabase repositories, Mirage mocks.

---

## File Structure

- Modify `.ai/context/business/biteplaner/product-flow.md` to clarify partner onboarding, admin review, referral-only operation, and cookie attribution.
- Modify `project/frontend/nexor/src/components/portal/PortalLayout/index.tsx` and `PortalLayout.test.tsx` for partner menu rules.
- Modify `project/frontend/nexor/src/routes/index.tsx` to add `/painel/biteplaner/indicar`.
- Modify `project/frontend/nexor/src/pages/painel/CadastroPerfilBiteplaner/index.tsx` and tests for CPF/CNPJ partner onboarding.
- Create or modify `project/frontend/nexor/src/lib/referral-cookie.ts` for invite-token cookie persistence.
- Modify `project/frontend/nexor/src/pages/Cadastro/index.tsx` and tests to read/write invite cookie.
- Modify `project/frontend/nexor/src/features/demo/biteplanerFlow.ts` for partner summary/referral API helpers.
- Create `project/frontend/nexor/src/pages/painel/PartnerReferralPage/index.tsx`, `styles.ts`, and `index.test.tsx`.
- Modify `project/frontend/nexor/src/pages/painel/BiteplanerHub/index.tsx`, `styles.ts`, and `index.test.tsx` to make partner Home dashboard-only.
- Modify `project/frontend/nexor/src/mocks/demoState.ts` and `src/mocks/handlers/partner.ts` for summary, referrals, link generation, and cookie-backed scenarios.
- Modify `project/backend/api/src/routes/product.routes.ts`, `services/product.service.ts`, and `repositories/product.repository.ts` for admin partner request review.
- Modify `project/backend/api/src/routes/operations.routes.ts`, `services/operations.service.ts`, and `repositories/operations.repository.ts` for partner summary/referrals and CPF/CNPJ partner creation.
- Add backend tests under `project/backend/api/src/**/__tests__` following existing route/service test patterns.

---

### Task 1: Context And Navigation

**Files:**
- Modify: `.ai/context/business/biteplaner/product-flow.md`
- Modify: `project/frontend/nexor/src/components/portal/PortalLayout/index.tsx`
- Test: `project/frontend/nexor/src/components/portal/PortalLayout/PortalLayout.test.tsx`

- [ ] **Step 1: Write failing navigation test**

Add a test that renders `/painel/biteplaner?mode=partner` and expects `Home`, `Indicar`, and `Avaliações`, with no `Ordem`.

- [ ] **Step 2: Run focused test**

Run: `npm run test:run -- src/components/portal/PortalLayout/PortalLayout.test.tsx`
Expected: FAIL because `Indicar` does not exist yet or `Ordem` still appears.

- [ ] **Step 3: Implement menu rule**

Import a referral icon such as `Link2`, compute `isPartnerBiteplanerMode`, and render:

```tsx
{isPartnerBiteplanerMode ? (
  <S.SubNavLink to="/painel/biteplaner/indicar?mode=partner" ...>
    <Link2 size={13} />
    Indicar
  </S.SubNavLink>
) : null}
```

Change the `Ordem` branch so it does not render for `partner`, `dentist`, or `lab` licensing routes.

- [ ] **Step 4: Update business context**

Document that partner has admin-reviewed onboarding and referral-only operation, without course/prova/contract licensing.

- [ ] **Step 5: Verify**

Run the same PortalLayout test. Expected: PASS.

---

### Task 2: Partner Onboarding CPF/CNPJ

**Files:**
- Modify: `project/frontend/nexor/src/pages/painel/CadastroPerfilBiteplaner/index.tsx`
- Test: `project/frontend/nexor/src/pages/painel/CadastroPerfilBiteplaner/index.test.tsx`
- Modify: `project/backend/api/src/routes/product.routes.ts`

- [ ] **Step 1: Write failing frontend tests**

Add tests for:
- partner can choose `CPF`, sees CPF mask, and submits `documentType: 'cpf'`;
- partner can choose `CNPJ`, sees CNPJ mask, and submits `documentType: 'cnpj'`;
- invalid document keeps submit disabled.

- [ ] **Step 2: Run focused test**

Run: `npm run test:run -- src/pages/painel/CadastroPerfilBiteplaner/index.test.tsx`
Expected: FAIL because partner only accepts CNPJ today.

- [ ] **Step 3: Implement UI and validation**

Add `documentType` state for partner, `formatCpf`, `isValidCpf`, reuse `formatCnpj`/`isValidCnpj`, and update `isValid` so partner requires a valid selected document, name, e-mail, and city/state.

- [ ] **Step 4: Update payload**

Partner payload should be:

```ts
{
  name: values.name.trim(),
  documentType: values.documentType,
  documentNumber: values.documentNumber.trim(),
  contactEmail: emptyToUndefined(values.contactEmail),
  cityState: values.cityState.trim(),
  channels: emptyToUndefined(values.channels)
}
```

- [ ] **Step 5: Update backend schema**

In `biteplanerPartnerRoleSchema`, accept `documentType: 'cpf' | 'cnpj'`, `documentNumber`, `contactEmail`, `cityState`, and `channels`, validating CPF/CNPJ in route/service helpers.

- [ ] **Step 6: Verify**

Run focused frontend test. Expected: PASS.

---

### Task 3: Admin Partner Review Backend And Mock

**Files:**
- Modify: `project/backend/api/src/services/product.service.ts`
- Modify: `project/backend/api/src/routes/product.routes.ts`
- Modify: `project/backend/api/src/repositories/product.repository.ts`
- Modify: `project/backend/api/src/services/operations.service.ts`
- Modify: `project/backend/api/src/repositories/operations.repository.ts`
- Modify: `project/frontend/nexor/src/mocks/handlers/products.ts`

- [ ] **Step 1: Write backend tests**

Add route/service tests for:
- `GET /v1/admin/biteplaner/partner-requests` returns partner product roles;
- approve creates/updates partner, activates product role, creates notification, and audits;
- reject stores reason and marks rejected.

- [ ] **Step 2: Run backend tests**

Run: `npm run test`
Expected: FAIL for missing routes.

- [ ] **Step 3: Implement mapping and service methods**

Add `PartnerRequestResponse`, `mapPartnerRequest`, `listPartnerRequests`, `getPartnerRequest`, `approvePartnerRequest`, and `rejectPartnerRequest` in `ProductService`, mirroring dentist/lab request shape but without licensing workflow.

- [ ] **Step 4: Implement routes**

Add:

```ts
GET /v1/admin/biteplaner/partner-requests
GET /v1/admin/biteplaner/partner-requests/:productRoleId
POST /v1/admin/biteplaner/partner-requests/:productRoleId/approve
POST /v1/admin/biteplaner/partner-requests/:productRoleId/reject
```

- [ ] **Step 5: Update mocks**

Add equivalent Mirage handlers in `products.ts`, backed by demoState product roles.

- [ ] **Step 6: Verify**

Run backend tests and frontend admin tests. Expected: PASS.

---

### Task 4: Admin Partner Review Page

**Files:**
- Create: `project/frontend/nexor/src/pages/painel/admin/AdminPartnerLicensing.tsx`
- Test: `project/frontend/nexor/src/pages/painel/admin/AdminPartnerLicensing.test.tsx`
- Modify: `project/frontend/nexor/src/pages/painel/admin/index.ts`
- Modify: `project/frontend/nexor/src/routes/index.tsx`
- Modify: `project/frontend/nexor/src/components/portal/PortalLayout/index.tsx`

- [ ] **Step 1: Write failing page test**

Test list, view modal, approve, reject with red reject button and required reason.

- [ ] **Step 2: Run focused test**

Run: `npm run test:run -- src/pages/painel/admin/AdminPartnerLicensing.test.tsx`
Expected: FAIL because page does not exist.

- [ ] **Step 3: Implement page**

Mirror `AdminDentistLicensing`/`AdminLabLicensing`, adapting labels and data fields: name, document type/number, contact e-mail, city/state, channels, status.

- [ ] **Step 4: Add route and admin menu**

Add `/painel/admin/parceiros` and an admin sidebar item `Parceiros`.

- [ ] **Step 5: Verify**

Run focused admin page test and PortalLayout test. Expected: PASS.

---

### Task 5: Referral Cookie Attribution

**Files:**
- Create: `project/frontend/nexor/src/lib/referral-cookie.ts`
- Modify: `project/frontend/nexor/src/pages/Cadastro/index.tsx`
- Test: `project/frontend/nexor/src/pages/Cadastro/Cadastro.test.tsx`
- Modify: `project/frontend/nexor/src/features/demo/biteplanerFlow.ts`

- [ ] **Step 1: Write failing tests**

Add tests that:
- `/cadastro?invite=TOKEN` validates/saves token to cookie;
- registration without query still reads valid cookie;
- invalid token clears cookie or does not persist it.

- [ ] **Step 2: Run focused test**

Run: `npm run test:run -- src/pages/Cadastro/Cadastro.test.tsx`
Expected: FAIL because only sessionStorage is used.

- [ ] **Step 3: Implement cookie helpers**

Create helpers:

```ts
export const REFERRAL_COOKIE_NAME = 'nexor_partner_invite';
export function saveReferralInviteToken(token: string): void;
export function readReferralInviteToken(): string;
export function clearReferralInviteToken(): void;
```

Use `SameSite=Lax`, `path=/`, and `max-age=2592000`.

- [ ] **Step 4: Wire cadastro**

When `invite` query exists, validate and persist. When absent, hydrate from cookie before payload submission or redirect decisions.

- [ ] **Step 5: Verify**

Run focused cadastro tests. Expected: PASS.

---

### Task 6: Partner Home Dashboard

**Files:**
- Modify: `project/frontend/nexor/src/pages/painel/BiteplanerHub/index.tsx`
- Modify: `project/frontend/nexor/src/pages/painel/BiteplanerHub/styles.ts`
- Test: `project/frontend/nexor/src/pages/painel/BiteplanerHub/index.test.tsx`
- Modify: `project/frontend/nexor/src/features/demo/biteplanerFlow.ts`
- Modify: `project/frontend/nexor/src/mocks/handlers/partner.ts`
- Modify: `project/backend/api/src/routes/operations.routes.ts`
- Modify: `project/backend/api/src/services/operations.service.ts`

- [ ] **Step 1: Write failing Home tests**

Expect partner Home to show metric cards and chart labels, and not show link generation form or partner link tables.

- [ ] **Step 2: Run focused test**

Run: `npm run test:run -- src/pages/painel/BiteplanerHub/index.test.tsx`
Expected: FAIL because current Home contains operational tables/form.

- [ ] **Step 3: Add summary API helper**

Add `fetchPartnerSummary(token)` for `GET /v1/partner/summary`, with mock response derived from inviteLinks/leads/orders.

- [ ] **Step 4: Implement dashboard UI**

Render stat cards and chart/funnel blocks:
- Links gerados;
- Clientes cadastrados;
- Links convertidos;
- Compras finalizadas;
- conversão link -> cadastro;
- conversão cadastro -> compra.

- [ ] **Step 5: Verify**

Run focused BiteplanerHub test. Expected: PASS.

---

### Task 7: Partner Indicar Page

**Files:**
- Create: `project/frontend/nexor/src/pages/painel/PartnerReferralPage/index.tsx`
- Create: `project/frontend/nexor/src/pages/painel/PartnerReferralPage/styles.ts`
- Test: `project/frontend/nexor/src/pages/painel/PartnerReferralPage/index.test.tsx`
- Modify: `project/frontend/nexor/src/pages/painel/index.ts`
- Modify: `project/frontend/nexor/src/routes/index.tsx`

- [ ] **Step 1: Write failing page tests**

Test:
- list existing links/referrals;
- generate new link;
- open QR/link modal;
- copy/share actions are available;
- no clinical data appears.

- [ ] **Step 2: Run focused test**

Run: `npm run test:run -- src/pages/painel/PartnerReferralPage/index.test.tsx`
Expected: FAIL because page does not exist.

- [ ] **Step 3: Move operational partner UI**

Move link form, link table, lead table, QR Code modal, WhatsApp/e-mail/copy actions from partner branch of `BiteplanerHub` into `PartnerReferralPage`.

- [ ] **Step 4: Add route**

Add route `/painel/biteplaner/indicar` using `PainelRoute`.

- [ ] **Step 5: Verify**

Run focused PartnerReferralPage test and BiteplanerHub tests. Expected: PASS.

---

### Task 8: End-To-End Verification

**Files:**
- All files changed above.

- [ ] **Step 1: Run frontend focused tests**

Run:

```bash
npm run test:run -- src/components/portal/PortalLayout/PortalLayout.test.tsx src/pages/painel/CadastroPerfilBiteplaner/index.test.tsx src/pages/painel/BiteplanerHub/index.test.tsx src/pages/painel/PartnerReferralPage/index.test.tsx src/pages/Cadastro/Cadastro.test.tsx
```

Expected: PASS.

- [ ] **Step 2: Run frontend build**

Run: `npm run build`
Expected: PASS.

- [ ] **Step 3: Run backend tests**

Run in `project/backend/api`: `npm run test`
Expected: PASS.

- [ ] **Step 4: Run backend build**

Run in `project/backend/api`: `npm run build`
Expected: PASS.

- [ ] **Step 5: Move completed spec and plan**

After implementation and passing tests, move:
- `docs/superpowers/specs/2026-05-14-biteplaner-partner-referral-flow-design.md`
- `docs/superpowers/plans/2026-05-14-biteplaner-partner-referral-flow.md`

to their `done/` folders.
