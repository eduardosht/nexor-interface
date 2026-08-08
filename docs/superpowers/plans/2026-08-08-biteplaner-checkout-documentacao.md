# Biteplaner Checkout com Documentação Técnica Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fazer o checkout Biteplaner exigir dados de produção e três arquivos privados antes de criar uma cobrança Asaas de R$ 1.400,00 por unidade.

**Architecture:** Criar um pedido `draft` no backend antes do checkout, vincular uploads S3 privados ao pedido e finalizar o rascunho somente quando os campos e slots estiverem completos. O backend calcula o preço, autoriza o proprietário, aloca o laboratório e cria o checkout Asaas; o frontend apenas coordena o formulário e a sequência intenção → PUT → confirmação.

**Tech Stack:** React 19, TypeScript strict, Vite, Styled Components, Vitest, Fastify, Zod, Supabase Postgres, Amazon S3 presigned URLs e Asaas Checkout.

## Global Constraints

- O valor unitário do Biteplaner é `140000` centavos, exibido como R$ 1.400,00.
- As categorias esportivas são fechadas: `combat_sports`, `team_sports`, `racket_sports`, `running_athletics`, `strength_training`, `cycling`, `water_sports`, `other_sports`.
- Os slots obrigatórios são `two_arches_scan`, `lateral_jig_scan` e `prescription_image`.
- `sport_category`, `athlete_age` e `biological_sex` são dados estruturados da ordem e são validados no backend.
- Objetos S3 permanecem privados; apenas URLs assinadas temporárias são geradas sob autorização.
- O frontend não contém secrets nem decide confirmação de pagamento.
- Toda entrada HTTP passa por Zod; toda operação sensível respeita ownership e gera apenas auditoria mínima.
- Todo texto novo será salvo em UTF-8 sem BOM e os arquivos tocados serão verificados contra marcadores de mojibake.
- Os testes serão escritos antes do código de produção e cada teste novo será observado falhar antes da implementação.

---

### Task 1: Modelar catálogo, slots, preço e dados estruturados da ordem

**Files:**
- Create: migration gerada por `supabase migration new biteplaner_checkout_technical_data` em `nexor-backend/project/api/supabase/migrations/`
- Modify: `nexor-backend/project/api/src/modules/commerce/commerce.constants.ts`
- Modify: `nexor-backend/project/api/src/repositories/commerce.repository.ts`
- Test: `nexor-backend/project/api/tests/modules/commerce/commerce.constants.test.ts`
- Test: `nexor-backend/project/api/tests/repositories/commerce.repository.test.ts`

**Interfaces:**
- Produces `biteplanerTechnicalSlotKeys`, `biteplanerSportCategoryKeys`, `BiteplanerTechnicalSlotKey` e `BiteplanerSportCategory` para serviços e rotas.
- Produces repository inputs with `sportCategory`, `athleteAge` e `biologicalSex` and records exposing the same order fields.

- [ ] **Step 1: Write the failing tests**

```ts
it('exposes the three purchase-time technical slots and the closed sport catalog', () => {
  expect(biteplanerTechnicalSlotKeys).toEqual([
    'two_arches_scan',
    'lateral_jig_scan',
    'prescription_image'
  ]);
  expect(biteplanerSportCategoryKeys).toContain('combat_sports');
  expect(biteplanerSportCategoryKeys).toContain('other_sports');
});

it('persists structured production data when creating a Biteplaner draft order', async () => {
  await repository.createBiteplanerDraftOrder({
    buyerProfileId: 'profile-1', buyerEmail: 'dentista@nexor.test', model: 'impacto',
    color: 'preto', quantity: 1, unitAmountCents: 140000, totalAmountCents: 140000,
    sportCategory: 'combat_sports', athleteAge: 29, biologicalSex: 'female'
  });

  expect(insertMock).toHaveBeenCalledWith(expect.objectContaining({
    sport_category: 'combat_sports', athlete_age: 29, biological_sex: 'female', status: 'draft'
  }));
});
```

- [ ] **Step 2: Run the focused tests and verify the expected failure**

Run: `npm run test -- tests/modules/commerce/commerce.constants.test.ts tests/repositories/commerce.repository.test.ts`

Expected: FAIL because the new slot/category exports and draft repository method do not exist.

- [ ] **Step 3: Write the migration and minimal domain/repository implementation**

Run: `npm run supabase -- migration new biteplaner_checkout_technical_data`

Add `sport_category text`, `athlete_age integer` and `biological_sex text` to `commerce_orders`, with non-null checks for finalized orders and checks for age `between 0 and 120`. Add an index on `commerce_orders(sport_category, biological_sex)`. Define the closed category/sex checks in the migration and mirror them in TypeScript constants. Change the attachment slot check to the three new slot keys. Store the new fields in `createBiteplanerDraftOrder` and return them from order records.

- [ ] **Step 4: Run the focused tests and verify they pass**

Run: `npm run test -- tests/modules/commerce/commerce.constants.test.ts tests/repositories/commerce.repository.test.ts`

Expected: PASS with no new warnings.

- [ ] **Step 5: Commit the domain and migration slice**

```bash
git -C nexor-backend add project/api/src/modules/commerce/commerce.constants.ts project/api/src/repositories/commerce.repository.ts project/api/supabase/migrations
git -C nexor-backend commit -m "feat: model biteplaner technical order data"
```

### Task 2: Criar rascunho e finalizar checkout com preço e validação server-side

**Files:**
- Modify: `nexor-backend/project/api/src/services/commerce-checkout.service.ts`
- Modify: `nexor-backend/project/api/src/routes/commerce.routes.ts`
- Modify: `nexor-backend/project/api/src/repositories/commerce.repository.ts`
- Modify: `nexor-backend/project/api/src/services/commerce-laboratory-asaas-webhook.service.ts` or the repository method that transitions a paid order
- Test: `nexor-backend/project/api/tests/services/commerce-checkout.service.test.ts`
- Test: `nexor-backend/project/api/tests/routes/commerce.routes.test.ts`
- Test: `nexor-backend/project/api/tests/services/commerce-laboratory-asaas-webhook.service.test.ts`

**Interfaces:**
- `createBiteplanerDraft(actor, input)` returns `{ orderId, itemId }` with status `draft`.
- `createBiteplanerCheckout(actor, { draftOrderId, successUrl, cancelUrl })` validates the draft, changes it to `awaiting_payment`, calculates `140000 * quantity`, and returns the Asaas checkout URL.
- The checkout route requires `draftOrderId`, `successUrl` and `cancelUrl`; draft creation requires model, color, quantity, sport category, age, sex and is authenticated.

- [ ] **Step 1: Write failing service and route tests**

```ts
it('rejects checkout when a draft is missing one required technical slot', async () => {
  await expect(service.createBiteplanerCheckout(licensedDentist, {
    draftOrderId: 'order-1', successUrl: validSuccessUrl, cancelUrl: validCancelUrl
  })).rejects.toMatchObject({ statusCode: 409 });
  expect(checkout.createOrderCheckoutSession).not.toHaveBeenCalled();
});

it('calculates the Asaas amount from R$ 1.400,00 per unit', async () => {
  repository.getBiteplanerOrderById.mockResolvedValue(completeDraftWithQuantity(3));
  await service.createBiteplanerCheckout(licensedDentist, validDraftCheckoutInput);
  expect(checkout.createOrderCheckoutSession).toHaveBeenCalledWith(expect.objectContaining({
    amountCents: 140000, quantity: 3
  }));
  expect(repository.finalizeBiteplanerDraft).toHaveBeenCalledWith(expect.objectContaining({
    totalAmountCents: 420000
  }));
});

it('rejects a checkout payload without draftOrderId at the HTTP boundary', async () => {
  const response = await app.inject({ method: 'POST', url: '/v1/commerce/biteplaner/checkout', payload: { successUrl: validSuccessUrl, cancelUrl: validCancelUrl } });
  expect(response.statusCode).toBe(400);
});
```

- [ ] **Step 2: Run tests and verify the expected failure**

Run: `npm run test -- tests/services/commerce-checkout.service.test.ts tests/routes/commerce.routes.test.ts`

Expected: FAIL because the route still creates an order from model/color/quantity and the service has no draft finalization contract.

- [ ] **Step 3: Implement the minimal draft/finalization flow**

Add Zod schemas for the closed category and sex values, age `0..120`, and `draftOrderId`. Add service/repository methods that:

1. require an active Biteplaner dentist license;
2. create a draft owned by `actor.profileId`;
3. load the draft with ownership;
4. require the three confirmed technical attachments and all structured fields;
5. allocate an eligible laboratory;
6. set `awaiting_payment`, `locked_at`, and the final amount;
7. call Asaas with `amountCents: 140000`, `quantity`, the order ID, configuration and split;
8. persist the charge and mark payment failure without leaking provider details.

Change the paid-order transition so a paid order with the three confirmed pre-checkout slots goes to `technical_review`; keep the existing fallback for legacy orders missing the new slots.

- [ ] **Step 4: Run the focused tests and verify they pass**

Run: `npm run test -- tests/services/commerce-checkout.service.test.ts tests/routes/commerce.routes.test.ts tests/services/commerce-laboratory-asaas-webhook.service.test.ts`

Expected: PASS, including existing Asaas idempotency assertions.

- [ ] **Step 5: Commit the checkout slice**

```bash
git -C nexor-backend add project/api/src/services/commerce-checkout.service.ts project/api/src/routes/commerce.routes.ts project/api/src/repositories/commerce.repository.ts project/api/src/services/commerce-laboratory-asaas-webhook.service.ts project/api/tests
git -C nexor-backend commit -m "feat: require technical data before biteplaner checkout"
```

### Task 3: Reutilizar o upload S3 privado para os três slots pré-checkout

**Files:**
- Modify: `nexor-backend/project/api/src/modules/commerce/commerce.constants.ts`
- Modify: `nexor-backend/project/api/src/services/commerce-account.service.ts`
- Modify: `nexor-backend/project/api/src/routes/commerce.routes.ts`
- Modify: `nexor-backend/project/api/src/repositories/commerce.repository.ts`
- Modify: `nexor-interface/project/nexor/src/features/commerce/biteplanerOrderCompletion.api.ts`
- Modify: `nexor-interface/project/nexor/src/features/commerce/biteplanerOrderCompletion.types.ts`
- Test: `nexor-backend/project/api/tests/services/commerce-account.service.test.ts`
- Test: `nexor-backend/project/api/tests/routes/commerce.routes.test.ts`
- Test: `nexor-interface/project/nexor/src/features/commerce/biteplanerOrderCompletion.api.test.ts`

**Interfaces:**
- Existing upload intent/confirm endpoints accept the new slot keys and status `draft`.
- Object keys remain `<prefix>/<profileId>/orders/<orderId>/tmp|confirmed/<slotKey>/<uploadId>/<safeFileName>`.
- `uploadCompletionSlotFile` remains the frontend sequence helper and receives the new slot union.

- [ ] **Step 1: Write failing tests for draft ownership, slot names and private-key validation**

```ts
it('creates a private upload intent for a Biteplaner draft owned by the dentist', async () => {
  orderRepository.getBiteplanerOrderById.mockResolvedValue(draftOwnedByDentist);
  const result = await service.createCompletionAttachmentUploadIntent(dentist, 'order-1', {
    slotKey: 'two_arches_scan', fileName: 'arcadas.stl', mimeType: 'model/stl', sizeBytes: 100
  });
  expect(result.objectKey).toContain('/profile-1/orders/order-1/tmp/two_arches_scan/');
  expect(result.uploadUrl).toMatch(/^https:\/\//);
});

it('rejects confirmation when the object key does not match the generated private key', async () => {
  await expect(service.confirmCompletionAttachmentUpload(dentist, 'order-1', {
    slotKey: 'prescription_image', uploadId: 'upload-1', objectKey: 'other/profile/file',
    fileName: 'prescricao.png', mimeType: 'image/png', sizeBytes: 100
  })).rejects.toMatchObject({ statusCode: 400 });
});
```

- [ ] **Step 2: Run the focused tests and verify the expected failure**

Run: `npm run test -- tests/services/commerce-account.service.test.ts tests/routes/commerce.routes.test.ts`

Expected: FAIL because the current service only accepts post-payment statuses and the old slots.

- [ ] **Step 3: Implement the minimal storage changes**

Rename the slot labels and union, allow upload/confirmation while `draft` or `correction_requested`, and keep ownership checks through `getBiteplanerOrderById({ orderId, buyerProfileId })`. Preserve the intent/confirm/copy/object-exists sequence. Keep `commerce_attachments_no_signed_url` and never return a public object URL from the account API.

- [ ] **Step 4: Run the focused tests and verify they pass**

Run: `npm run test -- tests/services/commerce-account.service.test.ts tests/routes/commerce.routes.test.ts tests/repositories/commerce.repository.test.ts`

Expected: PASS with the new slot keys and ownership rejection covered.

- [ ] **Step 5: Commit the private upload slice**

```bash
git -C nexor-backend add project/api/src/modules/commerce/commerce.constants.ts project/api/src/services/commerce-account.service.ts project/api/src/routes/commerce.routes.ts project/api/src/repositories/commerce.repository.ts project/api/tests
git -C nexor-interface add project/nexor/src/features/commerce/biteplanerOrderCompletion.api.ts project/nexor/src/features/commerce/biteplanerOrderCompletion.types.ts project/nexor/src/features/commerce/biteplanerOrderCompletion.api.test.ts
git -C nexor-backend commit -m "feat: support private pre-checkout biteplaner uploads"
git -C nexor-interface commit -m "feat: update biteplaner technical upload contract"
```

### Task 4: Exibir dados da ordem no resumo administrativo e no e-mail privado do laboratório

**Files:**
- Modify: `nexor-backend/project/api/src/services/commerce-admin.service.ts`
- Modify: `nexor-backend/project/api/src/repositories/commerce.repository.ts`
- Modify: `nexor-backend/project/api/tests/services/commerce-admin.service.test.ts`
- Modify: `nexor-interface/project/nexor/src/pages/painel/BiteplanerOrders/BiteplanerOrderDetail.tsx`
- Modify: `nexor-interface/project/nexor/src/pages/painel/BiteplanerOrders/BiteplanerOrders.test.tsx`

**Interfaces:**
- Admin order DTO exposes `sportCategory`, `athleteAge`, `biologicalSex` without exposing bucket keys or signed URLs in normal order listing.
- `composeBiteplanerExternalProductionEmail` includes the three fields and generates one short-lived signed URL per confirmed slot.

- [ ] **Step 1: Write failing tests**

```ts
it('includes production data and three private links in the laboratory email draft', async () => {
  const result = await service.composeBiteplanerExternalProductionEmail(admin, 'order-1');
  expect(result.email.body).toContain('Categoria do esporte: Esportes de combate');
  expect(result.email.body).toContain('Idade: 29');
  expect(result.email.body).toContain('Sexo biológico: Feminino');
  expect(result.email.attachments).toHaveLength(3);
  expect(result.email.attachments.every((item) => item.downloadUrl?.startsWith('https://'))).toBe(true);
});
```

- [ ] **Step 2: Run the test and verify the expected failure**

Run: `npm run test -- tests/services/commerce-admin.service.test.ts`

Expected: FAIL because the current email only lists model, color, total and the old scan slots.

- [ ] **Step 3: Implement presenter and email fields**

Map the closed category and sex values to Portuguese labels, include age and the production attributes in admin data, update the completeness guard to the new slots, and retain the existing `s3DownloadTtlSeconds` default of 300 seconds. Do not persist signed URLs or add them to logs.

- [ ] **Step 4: Run the focused test and verify it passes**

Run: `npm run test -- tests/services/commerce-admin.service.test.ts`

Expected: PASS, including existing authorization and missing-attachment cases.

- [ ] **Step 5: Commit the operational summary slice**

```bash
git -C nexor-backend add project/api/src/services/commerce-admin.service.ts project/api/src/repositories/commerce.repository.ts project/api/tests/services/commerce-admin.service.test.ts
git -C nexor-backend commit -m "feat: include biteplaner production data in lab email"
```

### Task 5: Implementar formulário de compra com CTA bloqueado até upload completo

**Files:**
- Modify: `nexor-interface/project/nexor/src/pages/painel/Compra/index.tsx`
- Modify: `nexor-interface/project/nexor/src/pages/painel/Compra/styles.ts`
- Modify: `nexor-interface/project/nexor/src/pages/painel/Compra/index.test.tsx`
- Create: `nexor-interface/project/nexor/src/features/commerce/biteplanerPurchase.api.ts`
- Create: `nexor-interface/project/nexor/src/features/commerce/biteplanerPurchase.types.ts`
- Test: `nexor-interface/project/nexor/src/features/commerce/biteplanerPurchase.api.test.ts`

**Interfaces:**
- `createBiteplanerDraft(input, token)` returns `{ orderId, itemId }`.
- `startBiteplanerCheckout({ draftOrderId, successUrl, cancelUrl }, token)` returns `{ orderId, checkoutId, checkoutUrl }`.
- `Compra` manages form state, draft ID, per-slot file state and pending uploads, using `UploadField`, `Select` and existing `Field` patterns.

- [ ] **Step 1: Write failing API and UI tests**

```tsx
it('shows R$ 1.400,00 per unit and keeps purchase disabled until required data and files exist', () => {
  renderPage();
  expect(screen.getByText(/R\$ 1\.400,00\/unidade/i)).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /ir para pagamento/i })).toBeDisabled();
  expect(screen.getByLabelText(/categoria do esporte/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/idade/i)).toBeInTheDocument();
  expect(screen.getByRole('radiogroup', { name: /sexo biológico/i })).toBeInTheDocument();
});

it('posts the draft data and checkout reference only after all files are confirmed', async () => {
  await uploadAllRequiredFiles();
  fireEvent.click(screen.getByRole('button', { name: /ir para pagamento/i }));
  await waitFor(() => expect(mockApiPost).toHaveBeenCalledWith(
    '/v1/commerce/biteplaner/checkout',
    expect.objectContaining({ draftOrderId: 'draft-1' }),
    'tok'
  ));
});
```

- [ ] **Step 2: Run the focused frontend tests and verify the expected failure**

Run: `npm run test:run -- src/pages/painel/Compra/index.test.tsx src/features/commerce/biteplanerPurchase.api.test.ts`

Expected: FAIL because the page still uses R$ 1.370,00, has no technical fields, and posts model/color/quantity directly to checkout.

- [ ] **Step 3: Implement the frontend form and API sequence**

Create the draft lazily when the first technical value or file is selected, update the draft configuration through the existing API contract, upload each selected file with the corresponding new slot, and keep the CTA disabled while any upload is pending. The checkout call must contain only `draftOrderId`, `successUrl` and `cancelUrl`; price remains server-owned. Show per-slot errors and allow replacing a file before checkout. Use 140000 cents in the summary and multiply by quantity.

- [ ] **Step 4: Run the focused frontend tests and verify they pass**

Run: `npm run test:run -- src/pages/painel/Compra/index.test.tsx src/features/commerce/biteplanerPurchase.api.test.ts src/features/commerce/biteplanerOrderCompletion.api.test.ts`

Expected: PASS with no legacy payment-link request and no enabled CTA while requirements are incomplete.

- [ ] **Step 5: Commit the purchase UI slice**

```bash
git -C nexor-interface add project/nexor/src/pages/painel/Compra project/nexor/src/features/commerce/biteplanerPurchase.api.ts project/nexor/src/features/commerce/biteplanerPurchase.types.ts project/nexor/src/features/commerce/biteplanerOrderCompletion.api.ts project/nexor/src/features/commerce/biteplanerOrderCompletion.types.ts
git -C nexor-interface commit -m "feat: require biteplaner documents before checkout"
```

### Task 6: Atualizar mocks, documentação oficial e contratos do produto

**Files:**
- Modify: `nexor-interface/project/nexor/src/mocks/handlers/orders.ts`
- Modify: `nexor-interface/project/nexor/src/mocks/handlers/products.ts`
- Modify: `nexor-interface/project/nexor/src/pages/painel/BiteplanerOrders/BiteplanerOrderCompletion.tsx` and tests
- Modify: `nexor-docs/docs/produto/jornadas/biteplaner.md`
- Modify: `nexor-docs/docs/produto/regras-de-negocio.md`
- Modify: `nexor-docs/docs/tecnologia/arquitetura/backend.md`
- Modify: `nexor-docs/docs/tecnologia/arquitetura/database.md`
- Modify: `nexor-docs/docs/tecnologia/adr/adr-003-s3-privado-anexos.md`

**Interfaces:**
- Development handlers mirror draft creation, new slot names, structured order fields and checkout payload.
- Documentation describes uploads before payment and `technical_review` after successful payment.

- [ ] **Step 1: Write failing mock/contract tests**

```ts
it('serves the new draft and checkout contracts without old completion slot names', async () => {
  const response = await client.createBiteplanerDraft(validDraftPayload);
  expect(response.orderId).toBeDefined();
  expect(response.slots.map((slot) => slot.slotKey)).toEqual([
    'two_arches_scan', 'lateral_jig_scan', 'prescription_image'
  ]);
});
```

- [ ] **Step 2: Run the focused tests and verify the expected failure**

Run: `npm run test:run -- src/mocks/handlers/orders.test.ts src/pages/painel/BiteplanerOrders/BiteplanerOrderCompletion.test.tsx`

Expected: FAIL because mock routes and completion UI still reference `upper_scan`, `lower_scan` and `bite_registration`.

- [ ] **Step 3: Update handlers, completion UI and documentation**

Mirror the backend schemas in the MSW handlers, rename the post-payment completion labels to the new slots for legacy/correction flows, and update the official journey/database/backend/ADR text. Keep the requirement that the lab receives only signed links.

- [ ] **Step 4: Run focused tests and encoding checks**

Run: `npm run test:run -- src/mocks/handlers/orders.test.ts src/pages/painel/BiteplanerOrders/BiteplanerOrderCompletion.test.tsx`

Expected: PASS. Then run `rg -n "upper_scan|lower_scan|bite_registration|Ã|Â|â"` over all touched text/code files and remove accidental legacy or mojibake references, keeping only deliberate compatibility references if a test documents them.

- [ ] **Step 5: Commit the contracts and docs slice**

```bash
git -C nexor-interface add project/nexor/src/mocks project/nexor/src/pages/painel/BiteplanerOrders
git -C nexor-interface commit -m "test: sync biteplaner checkout mocks"
git -C nexor-docs add docs/produto docs/tecnologia
git -C nexor-docs commit -m "docs: document biteplaner pre-checkout attachments"
```

### Task 7: Verificação completa de build, testes e segurança

**Files:**
- Modify: nenhum arquivo de produção; corrigir somente falhas encontradas nas tarefas anteriores.
- Test: `nexor-backend/project/api/tests/`
- Test: `nexor-interface/project/nexor/src/`

**Interfaces:**
- All previous task contracts remain stable.

- [ ] **Step 1: Run backend focused verification**

Run: `npm run test -- tests/services/commerce-checkout.service.test.ts tests/services/commerce-account.service.test.ts tests/services/commerce-admin.service.test.ts tests/services/commerce-laboratory-asaas-webhook.service.test.ts tests/routes/commerce.routes.test.ts tests/security/commerce-schema-guardrails.test.ts`

Expected: PASS with zero failures.

- [ ] **Step 2: Run frontend focused verification**

Run: `npm run test:run -- src/pages/painel/Compra/index.test.tsx src/features/commerce/biteplanerPurchase.api.test.ts src/features/commerce/biteplanerOrderCompletion.api.test.ts src/pages/painel/BiteplanerOrders/BiteplanerOrderCompletion.test.tsx`

Expected: PASS with zero failures.

- [ ] **Step 3: Run full suites and builds**

Run: `npm run test` and `npm run build` in `nexor-backend/project/api`; run `npm run test:run` and `npm run build` in `nexor-interface/project/nexor`.

Expected: all commands exit 0.

- [ ] **Step 4: Run schema, LGPD and encoding checks**

Run: `npm run audit:lgpd:release` and `npm run audit:lgpd:secrets` in `nexor-backend/project/api`. Search all touched files for `Ã|Â|â`, public S3 URL persistence, `service_role` in frontend, and the old price `137000`.

Expected: no new secret, no public storage permission, no signed URL persisted, no accidental mojibake, and no remaining production price of 137000.

- [ ] **Step 5: Review the final diff and report evidence**

Run: `git -C nexor-backend status --short; git -C nexor-interface status --short; git -C nexor-docs status --short; git -C nexor-backend diff HEAD~1 --stat; git -C nexor-interface diff HEAD~1 --stat`.

Expected: only intended feature, test, migration and documentation files are changed; final response lists the commands and observed results without claiming unverified success.

