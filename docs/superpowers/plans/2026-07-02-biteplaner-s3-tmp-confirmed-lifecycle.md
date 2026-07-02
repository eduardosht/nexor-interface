# Biteplaner S3 Tmp Confirmed Lifecycle Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Separate production scan uploads into temporary and confirmed S3 prefixes so orphan cleanup can be handled safely by S3 Lifecycle without deleting valid production attachments.

**Architecture:** Upload intents create objects under `biteplaner/production-scans/tmp/{orderId}/{uploadId}/{fileName}`. The backend confirms the uploaded temporary object, copies it to `biteplaner/production-scans/confirmed/{orderId}/{uploadId}/{fileName}`, verifies the confirmed object exists, and returns a `scan3dFileRef` pointing only to the confirmed key. Final production form validation accepts only confirmed keys; S3 Lifecycle expires only the `tmp/` prefix.

**Tech Stack:** Fastify, TypeScript, AWS SDK v3 S3, Vitest, React/Vite frontend tests, Amazon S3 Lifecycle.

## Global Constraints

- Keep S3 bucket private and never persist `publicUrl`, `downloadUrl`, `signedUrl`, or `url`.
- Frontend must not receive AWS credentials.
- Do not use GuardDuty Malware Protection, ClamAV, or automatic malware scanning in this scope.
- UI must not claim files are safe, scanned, or virus-free.
- Persist only private S3 references with `provider: 'amazon-s3'`, `scanStatus: 'not_scanned'`, and backend-authorized object keys.
- Preserve Portuguese accents as UTF-8; before finishing, scan touched text/UI files for mojibake markers such as `Ã`, `Â`, `�`, `â€™`, `â€œ`, `â€“`, and `â€”`.
- Use TDD: write failing tests first, verify they fail, then implement.

---

## File Structure

Backend files:
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/src/integrations/storage/object-storage.gateway.ts`
  Add object copy/delete interfaces used by S3 finalization.
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/src/integrations/storage/s3-object-storage.gateway.ts`
  Implement `CopyObjectCommand` and optional `DeleteObjectCommand`.
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/src/modules/biteplaner/attachments/production-attachment.service.ts`
  Generate `tmp/` upload keys, finalize to `confirmed/`, and return only confirmed refs.
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/src/modules/biteplaner/production/production-request.application.ts`
  Reject production form payloads that point at `tmp/`.
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/src/services/order.service.ts`
  Keep confirmation-event validation aligned with confirmed object keys.
- Test `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/tests/integrations/storage/s3-object-storage.gateway.test.ts`
- Test `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/tests/modules/biteplaner/attachments/production-attachment.service.test.ts`
- Test `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/tests/modules/biteplaner/production/production-request.application.test.ts`
- Test `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/tests/services/order.service.test.ts`

Frontend files:
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/project/nexor/src/pages/painel/ProducaoDentista/index.test.tsx`
  Assert final saved payload receives confirmed keys.
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/project/nexor/src/features/biteplaner/orders/orders.api.test.ts`
  Keep response fixtures aligned with confirmed object keys.
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/project/nexor/src/mocks/handlers/orders.ts`
  Mirage upload confirmation returns confirmed keys, not temporary keys.

Nexor Docs files:
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/09-changelogs/README.md`
  Add a changelog entry describing the S3 private upload flow, deferred upload, `tmp/confirmed` separation, and lifecycle cleanup.
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/10-roadmap/README.md`
  Remove "Integração com Amazon S3" from roadmap because it is no longer pending after implementation.
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/03-tecnologia/README.md`
  Add a link to the detailed Amazon S3 integration document.
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/03-tecnologia/integracoes.md`
  Cross-link from the Amazon S3 overview to the detailed technical flow document.
- Create `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/03-tecnologia/integracao-amazon-s3.md`
  Document the relationship between Nexor APIs and Amazon S3 in detail, including functions, endpoints, temporary objects, confirmed objects, failure handling, lifecycle rule, and what makes an object orphaned.

---

### Task 1: Backend Storage Gateway Supports Finalization

**Files:**
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/src/integrations/storage/object-storage.gateway.ts`
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/src/integrations/storage/s3-object-storage.gateway.ts`
- Test `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/tests/integrations/storage/s3-object-storage.gateway.test.ts`

**Interfaces:**
- Consumes existing `ObjectStorageGateway.objectExists(input)`.
- Produces:

```ts
export interface CopyObjectInput {
  bucket: string;
  sourceKey: string;
  destinationKey: string;
  contentType?: string | undefined;
}

export interface DeleteObjectInput {
  bucket: string;
  key: string;
}

export interface ObjectStorageGateway {
  createPresignedPutObjectUrl(input: PresignedPutObjectInput): Promise<PresignedObjectUrl>;
  createPresignedGetObjectUrl(input: PresignedGetObjectInput): Promise<PresignedObjectUrl>;
  objectExists(input: ObjectExistsInput): Promise<boolean>;
  copyObject(input: CopyObjectInput): Promise<void>;
  deleteObject(input: DeleteObjectInput): Promise<void>;
}
```

- [ ] **Step 1: Write failing storage gateway tests**

Add tests that expect `copyObject` to send `CopyObjectCommand` with URL-encoded `CopySource` and expect `deleteObject` to send `DeleteObjectCommand`.

```ts
it('copies an object inside the private upload bucket', async () => {
  const gateway = new S3ObjectStorageGateway({ region: 'sa-east-1' });

  await gateway.copyObject({
    bucket: 'nexor-private-uploads',
    sourceKey: 'biteplaner/production-scans/tmp/order-1/upload-1/scan.stl',
    destinationKey: 'biteplaner/production-scans/confirmed/order-1/upload-1/scan.stl',
    contentType: 'model/stl',
  });

  expect(s3Send).toHaveBeenCalledWith(expect.objectContaining({
    input: expect.objectContaining({
      Bucket: 'nexor-private-uploads',
      CopySource: 'nexor-private-uploads/biteplaner/production-scans/tmp/order-1/upload-1/scan.stl',
      Key: 'biteplaner/production-scans/confirmed/order-1/upload-1/scan.stl',
      ContentType: 'model/stl',
      MetadataDirective: 'REPLACE',
    }),
  }));
});

it('deletes a private upload object by key', async () => {
  const gateway = new S3ObjectStorageGateway({ region: 'sa-east-1' });

  await gateway.deleteObject({
    bucket: 'nexor-private-uploads',
    key: 'biteplaner/production-scans/tmp/order-1/upload-1/scan.stl',
  });

  expect(s3Send).toHaveBeenCalledWith(expect.objectContaining({
    input: expect.objectContaining({
      Bucket: 'nexor-private-uploads',
      Key: 'biteplaner/production-scans/tmp/order-1/upload-1/scan.stl',
    }),
  }));
});
```

- [ ] **Step 2: Run tests and verify red**

Run:

```powershell
npx vitest run tests/integrations/storage/s3-object-storage.gateway.test.ts
```

Expected: FAIL because `copyObject` and `deleteObject` do not exist.

- [ ] **Step 3: Implement storage gateway methods**

Update `object-storage.gateway.ts` with the interfaces above. Update `s3-object-storage.gateway.ts` to import:

```ts
import {
  CopyObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand,
  HeadObjectCommand,
  NoSuchKey,
  NotFound,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
```

Implement:

```ts
async copyObject(input: CopyObjectInput): Promise<void> {
  const parsedInput = copyObjectInputSchema.parse(input);

  await this.client.send(new CopyObjectCommand({
    Bucket: parsedInput.bucket,
    CopySource: `${parsedInput.bucket}/${encodeURI(parsedInput.sourceKey)}`,
    Key: parsedInput.destinationKey,
    MetadataDirective: parsedInput.contentType ? 'REPLACE' : undefined,
    ContentType: parsedInput.contentType,
  }));
}

async deleteObject(input: DeleteObjectInput): Promise<void> {
  const parsedInput = deleteObjectInputSchema.parse(input);

  await this.client.send(new DeleteObjectCommand({
    Bucket: parsedInput.bucket,
    Key: parsedInput.key,
  }));
}
```

Use schemas equivalent to existing `bucketSchema` and `keySchema`; `contentType` must reuse `contentTypeSchema.optional()`.

- [ ] **Step 4: Run tests and verify green**

Run:

```powershell
npx vitest run tests/integrations/storage/s3-object-storage.gateway.test.ts
```

Expected: PASS.

- [ ] **Step 5: Commit**

```powershell
git add project/api/src/integrations/storage/object-storage.gateway.ts project/api/src/integrations/storage/s3-object-storage.gateway.ts project/api/tests/integrations/storage/s3-object-storage.gateway.test.ts
git commit -m "feat: add s3 object finalization operations"
```

---

### Task 2: Backend Uses Tmp Keys and Confirms to Confirmed Keys

**Files:**
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/src/modules/biteplaner/attachments/production-attachment.service.ts`
- Test `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/tests/modules/biteplaner/attachments/production-attachment.service.test.ts`

**Interfaces:**
- Consumes `ObjectStorageGateway.copyObject`, `objectExists`, and `deleteObject`.
- Produces confirmed `fileRef.objectKey` values only under:

```text
{S3_UPLOAD_PREFIX}/confirmed/{orderId}/{uploadId}/{fileName}
```

Upload intent returns temporary `objectKey` values under:

```text
{S3_UPLOAD_PREFIX}/tmp/{orderId}/{uploadId}/{fileName}
```

- [ ] **Step 1: Write failing attachment service tests**

Add tests:

```ts
it('creates production scan upload intents under tmp prefix', async () => {
  const result = await service.createUploadIntent(orderId, actor, {
    fileName: 'scan.stl',
    mimeType: 'model/stl',
    sizeBytes: 4,
  });

  expect(result.objectKey).toMatch(
    /^biteplaner\/production-scans\/tmp\/order-1\/[a-f0-9-]+\/scan\.stl$/
  );
});

it('copies confirmed uploads from tmp to confirmed and returns a confirmed file ref', async () => {
  storage.objectExists.mockResolvedValue(true);

  const result = await service.confirmUpload(orderId, actor, {
    uploadId: 'upload-1',
    objectKey: 'biteplaner/production-scans/tmp/order-1/upload-1/scan.stl',
    fileName: 'scan.stl',
    mimeType: 'model/stl',
    sizeBytes: 4,
  });

  expect(storage.copyObject).toHaveBeenCalledWith({
    bucket: 'nexor-private-uploads',
    sourceKey: 'biteplaner/production-scans/tmp/order-1/upload-1/scan.stl',
    destinationKey: 'biteplaner/production-scans/confirmed/order-1/upload-1/scan.stl',
    contentType: 'model/stl',
  });
  expect(result.fileRef.objectKey).toBe(
    'biteplaner/production-scans/confirmed/order-1/upload-1/scan.stl'
  );
  expect(result.fileRef.scanStatus).toBe('not_scanned');
});

it('does not return a file ref when confirmed copy is missing', async () => {
  storage.objectExists
    .mockResolvedValueOnce(true)
    .mockResolvedValueOnce(false);

  await expect(service.confirmUpload(orderId, actor, {
    uploadId: 'upload-1',
    objectKey: 'biteplaner/production-scans/tmp/order-1/upload-1/scan.stl',
    fileName: 'scan.stl',
    mimeType: 'model/stl',
    sizeBytes: 4,
  })).rejects.toThrow(/private storage/i);
});
```

- [ ] **Step 2: Run tests and verify red**

Run:

```powershell
npx vitest run tests/modules/biteplaner/attachments/production-attachment.service.test.ts
```

Expected: FAIL because current keys do not include `tmp/confirmed` and no copy occurs.

- [ ] **Step 3: Implement tmp and confirmed key helpers**

In `production-attachment.service.ts`, add helpers:

```ts
const buildTemporaryObjectKey = (input: {
  prefix: string;
  orderId: string;
  uploadId: string;
  fileName: string;
}) => `${input.prefix}/tmp/${input.orderId}/${input.uploadId}/${sanitizeFileName(input.fileName)}`;

const buildConfirmedObjectKeyFromTemporary = (input: {
  prefix: string;
  objectKey: string;
}) => {
  const temporaryPrefix = `${input.prefix}/tmp/`;

  if (!input.objectKey.startsWith(temporaryPrefix)) {
    throw conflict('Production scan3d upload confirmation does not match the temporary object prefix.');
  }

  return `${input.prefix}/confirmed/${input.objectKey.slice(temporaryPrefix.length)}`;
};
```

Use `buildTemporaryObjectKey` in `createUploadIntent`.

- [ ] **Step 4: Implement confirm copy flow**

In `confirmUpload`, after validating the matching intent and source object existence:

```ts
const confirmedObjectKey = buildConfirmedObjectKeyFromTemporary({
  prefix: this.config.prefix,
  objectKey: parsedInput.objectKey,
});

await this.storage.copyObject({
  bucket: this.config.bucket,
  sourceKey: parsedInput.objectKey,
  destinationKey: confirmedObjectKey,
  contentType: parsedInput.mimeType,
});

const confirmedExists = await this.storage.objectExists({
  bucket: this.config.bucket,
  key: confirmedObjectKey,
});

if (!confirmedExists) {
  throw conflict('Production scan3d confirmed upload object was not found in private storage.');
}
```

Return `fileRef.objectKey = confirmedObjectKey`. Keep audit logs using fingerprints, not signed URLs.

- [ ] **Step 5: Run tests and verify green**

Run:

```powershell
npx vitest run tests/modules/biteplaner/attachments/production-attachment.service.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add project/api/src/modules/biteplaner/attachments/production-attachment.service.ts project/api/tests/modules/biteplaner/attachments/production-attachment.service.test.ts
git commit -m "feat: finalize production scans into confirmed s3 prefix"
```

---

### Task 3: Backend Rejects Tmp References in Production Requests

**Files:**
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/src/modules/biteplaner/production/production-request.application.ts`
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/src/services/order.service.ts`
- Test `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/tests/modules/biteplaner/production/production-request.application.test.ts`
- Test `C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/tests/services/order.service.test.ts`

**Interfaces:**
- Consumes confirmed refs from Task 2.
- Produces validation that only accepts:

```ts
fileRef.provider === 'amazon-s3'
fileRef.objectKey.startsWith(`${S3_UPLOAD_PREFIX}/confirmed/${orderId}/`)
fileRef.scanStatus === 'not_scanned'
```

- [ ] **Step 1: Write failing production request tests**

Add a test that rejects a tmp object key:

```ts
await expect(application.createProductionRequest({
  orderId: 'order-1',
  actor,
  payload: {
    ...validPayload,
    scan3dFileRef: {
      ...validFileRef,
      objectKey: 'biteplaner/production-scans/tmp/order-1/upload-1/scan.stl',
    },
  },
})).rejects.toThrow(/confirmed private storage/i);
```

Add a test that accepts:

```ts
objectKey: 'biteplaner/production-scans/confirmed/order-1/upload-1/scan.stl'
```

- [ ] **Step 2: Write failing order service tests**

Add a test that rejects a production request when the confirmation audit event points to tmp but payload points to confirmed, unless the event fingerprint is based on the confirmed key. Expected behavior:

```ts
expect(repository.insertOrderStatusEvent).toHaveBeenCalledWith(expect.objectContaining({
  reason: 'production_scan3d_upload_confirmed',
  metadata: expect.objectContaining({
    objectKeyFingerprint: sha256('biteplaner/production-scans/confirmed/order-1/upload-1/scan.stl'),
  }),
}));
```

- [ ] **Step 3: Run tests and verify red**

Run:

```powershell
npx vitest run tests/modules/biteplaner/production/production-request.application.test.ts tests/services/order.service.test.ts
```

Expected: FAIL because tmp keys are currently accepted or confirmation fingerprint still tracks source keys.

- [ ] **Step 4: Implement confirmed prefix validation**

Use a helper equivalent to:

```ts
const expectedConfirmedPrefix = `${uploadPolicy.prefix}/confirmed/${orderId}/`;

if (!fileRef.objectKey.startsWith(expectedConfirmedPrefix)) {
  throw conflict('Production scan3d attachment must reference confirmed private storage.');
}
```

Ensure `OrderService` validates confirmation events against the confirmed object key fingerprint.

- [ ] **Step 5: Run tests and verify green**

Run:

```powershell
npx vitest run tests/modules/biteplaner/production/production-request.application.test.ts tests/services/order.service.test.ts
```

Expected: PASS.

- [ ] **Step 6: Commit**

```powershell
git add project/api/src/modules/biteplaner/production/production-request.application.ts project/api/src/services/order.service.ts project/api/tests/modules/biteplaner/production/production-request.application.test.ts project/api/tests/services/order.service.test.ts
git commit -m "fix: require confirmed s3 production scan references"
```

---

### Task 4: Frontend and Mocks Align with Confirmed Keys

**Files:**
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/project/nexor/src/pages/painel/ProducaoDentista/index.test.tsx`
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/project/nexor/src/features/biteplaner/orders/orders.api.test.ts`
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/project/nexor/src/mocks/handlers/orders.ts`

**Interfaces:**
- Consumes backend confirm response where `fileRef.objectKey` is confirmed.
- Produces tests and mock data with confirmed object keys only.

- [ ] **Step 1: Write failing frontend tests**

In `ProducaoDentista/index.test.tsx`, update final submit expectations:

```ts
scan3dFileRef: expect.objectContaining({
  provider: 'amazon-s3',
  objectKey: 'biteplaner/production-scans/confirmed/BP-DEMO-004/upload-1/scan-new.stl',
  scanStatus: 'not_scanned',
})
```

In `orders.api.test.ts`, expect confirm response passthrough to contain a confirmed key.

- [ ] **Step 2: Run tests and verify red**

Run:

```powershell
npx vitest run src/pages/painel/ProducaoDentista/index.test.tsx -t "production scan|production request successfully"
npx vitest run src/features/biteplaner/orders/orders.api.test.ts
```

Expected: FAIL where mock handlers still return old keys.

- [ ] **Step 3: Update Mirage/mock confirmation responses**

Update mock confirm response to derive:

```ts
const confirmedObjectKey = objectKey.replace(
  '/production-scans/tmp/',
  '/production-scans/confirmed/'
);
```

If old mock object keys omit the full prefix, normalize them to:

```ts
`biteplaner/production-scans/confirmed/${orderId}/${uploadId}/${fileName}`
```

- [ ] **Step 4: Run tests and verify green**

Run:

```powershell
npx vitest run src/pages/painel/ProducaoDentista/index.test.tsx -t "selected locally|selected production scan local|latest selected production scan|S3 upload fails|confirmed production scan|submits the production request successfully"
npx vitest run src/features/biteplaner/orders/orders.api.test.ts
npm run typecheck
```

Expected: PASS. If the full `ProducaoDentista/index.test.tsx` suite still has the known visual policy failures, document them as preexisting and unrelated.

- [ ] **Step 5: Commit**

```powershell
git add project/nexor/src/pages/painel/ProducaoDentista/index.test.tsx project/nexor/src/features/biteplaner/orders/orders.api.test.ts project/nexor/src/mocks/handlers/orders.ts
git commit -m "test: align production scan mocks with confirmed s3 keys"
```

---

### Task 5: Update Nexor Docs with S3 Integration, Changelog, and Roadmap

**Files:**
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/09-changelogs/README.md`
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/10-roadmap/README.md`
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/03-tecnologia/README.md`
- Modify `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/03-tecnologia/integracoes.md`
- Create `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/03-tecnologia/integracao-amazon-s3.md`

**Interfaces:**
- Consumes `tmp/` and `confirmed/` prefixes from Tasks 2 and 3.
- Produces product-visible changelog, roadmap cleanup, and a detailed system document explaining the Amazon S3 external API integration.

- [ ] **Step 1: Add changelog entry**

In `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/09-changelogs/README.md`, add a new section above `## 29/06/2026`.

Use the implementation date for the heading. If executing on 2026-07-02, use:

```md
## 02/07/2026

### Nexor Interface

| Tipo | Mudança |
| --- | --- |
| <span className="badge badge--success">feature</span> | Integração do fluxo de anexo do dentista com armazenamento privado no Amazon S3, mantendo o arquivo local até a finalização da solicitação de produção. |
| <span className="badge badge--warning">melhoria</span> | Troca ou remoção de arquivo no formulário de produção deixa de gerar uploads desnecessários no S3 antes do envio final. |

### Nexor Backend

| Tipo | Mudança |
| --- | --- |
| <span className="badge badge--success">feature</span> | Backend passa a gerar URLs pré-assinadas para upload/download privado de escaneamentos 3D no Amazon S3. |
| <span className="badge badge--warning">melhoria</span> | Separação dos uploads em prefixos temporários e confirmados no S3, permitindo expurgo seguro de objetos órfãos por lifecycle. |
```

- [ ] **Step 2: Remove S3 from roadmap**

In `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/10-roadmap/README.md`, remove this row from `## Prioridade Crítica`:

```md
| Integração com Amazon S3 | Implementar armazenamento privado para arquivos do Biteplaner, especialmente scans 3D e anexos operacionais, com acesso seguro, URLs temporárias e separação entre metadados e arquivos. |
```

Do not remove unrelated roadmap items.

- [ ] **Step 3: Create detailed Amazon S3 integration doc**

Create `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/03-tecnologia/integracao-amazon-s3.md` with this structure and level of detail:

```md
---
titulo: Integração Amazon S3
status: oficial
tipo: técnico
publico: Engenharia, Operação, Segurança, Produto
classificacao: interno
responsavel: Tech Lead
ultima_atualizacao: 2026-07-02
---

# Integração Amazon S3

## Objetivo

Explicar como o Nexor/Biteplaner usa o Amazon S3 para armazenar anexos privados de produção, especialmente o escaneamento 3D enviado pelo dentista no fluxo de solicitação de produção.

## Resumo da arquitetura

- O frontend nunca recebe credenciais AWS.
- O backend é a autoridade para autorização, geração de object keys, URLs pré-assinadas, confirmação de upload, validação de referência e geração de URL temporária de download.
- O browser faz PUT direto no S3 usando uma URL pré-assinada.
- O formulário final salva apenas uma referência privada (`scan3dFileRef`) e nunca salva URL pública, URL assinada ou segredo AWS.
- Objetos começam em `tmp/` e só viram referência válida depois que o backend copia para `confirmed/`.

## Prefixos usados no S3

| Prefixo | Função | Pode ser apagado automaticamente? |
| --- | --- | --- |
| `biteplaner/production-scans/tmp/` | Objetos enviados pelo navegador antes de vínculo durável com a solicitação de produção. | Sim, por lifecycle após 7 dias. |
| `biteplaner/production-scans/confirmed/` | Objetos confirmados pelo backend e referenciados por `scan3dFileRef.objectKey`. | Não pela regra de órfãos temporários. |

## O que é o parent do arquivo

O S3 não conhece pedido, formulário ou usuário. Para o S3, o arquivo é apenas um objeto identificado por uma key.

No Nexor, o parent funcional do arquivo é a solicitação de produção ligada à ordem Biteplaner. A ligação acontece quando o payload salvo contém:

```ts
scan3dFileRef.objectKey
```

Se o objeto existe no S3, mas nenhuma solicitação de produção salva aponta para aquele `objectKey`, ele é considerado órfão.

## Fluxo de upload no formulário do dentista

1. O dentista seleciona um arquivo em `/painel/dentista/producao/:orderId`.
2. `ProductionRequestFields` valida extensão, MIME type e tamanho com `validateProductionRequestFile`.
3. O arquivo fica apenas em estado local na página via `onScan3dFileChange`.
4. Se o dentista remove ou troca o arquivo, o estado local é limpo ou substituído; nada é enviado ao S3 nesse momento.
5. Ao clicar em Finalizar, `handleComplete` chama `ensureProductionScanFileRef`.
6. Se já existe `draft.scan3dFileRef`, o fluxo reutiliza essa referência e não faz novo upload.
7. Se não existe referência confirmada, `ensureProductionScanFileRef` chama `uploadProductionRequestFile`.

## Chamadas de frontend

O helper `uploadProductionRequestFile` executa:

1. `createProductionScanUploadIntent(orderId, payload, token)`
2. `fetch(uploadUrl, { method: 'PUT', headers: requiredHeaders, body: file })`
3. `confirmProductionScanUpload(orderId, payload, token)`

Depois disso, retorna `fileRef` para o formulário final.

## Endpoints do backend

| Endpoint | Função |
| --- | --- |
| `POST /v1/orders/:orderId/attachments/production-scan3d/upload-intent` | Valida ator, ordem, política de arquivo e cria URL pré-assinada de PUT para `tmp/`. |
| `POST /v1/orders/:orderId/attachments/production-scan3d/confirm` | Confirma objeto temporário, copia para `confirmed/`, valida existência e retorna `scan3dFileRef`. |
| `POST /v1/orders/:orderId/attachments/production-scan3d/download-url` | Gera URL pré-assinada temporária de download para usuários autorizados. |

## Funções backend envolvidas

| Função/Classe | Responsabilidade |
| --- | --- |
| `ProductionAttachmentService.createUploadIntent` | Cria `uploadId`, monta object key em `tmp/`, gera URL pré-assinada e registra evento de intenção. |
| `S3ObjectStorageGateway.createPresignedPutObjectUrl` | Usa AWS SDK para gerar URL temporária de PUT. |
| `ProductionAttachmentService.confirmUpload` | Verifica se houve intenção prévia, valida prefixo `tmp/`, checa existência do objeto, copia para `confirmed/`, verifica a cópia e retorna `fileRef`. |
| `S3ObjectStorageGateway.objectExists` | Usa `HeadObject` para confirmar existência do objeto. |
| `S3ObjectStorageGateway.copyObject` | Usa `CopyObject` para promover objeto de `tmp/` para `confirmed/`. |
| `OrderService` | Valida que o `scan3dFileRef` salvo no formulário corresponde a um upload confirmado no timeline da ordem. |
| `ProductionRequestApplication` | Rejeita refs simuladas, refs públicas e object keys fora de `confirmed/{orderId}/`. |

## Estados de falha

| Momento da falha | Resultado esperado |
| --- | --- |
| Falha antes ou durante PUT para S3 | Formulário não é salvo. Arquivo permanece selecionado localmente para retry. |
| PUT conclui, mas `confirm` falha | Formulário não é salvo. Retry pode gerar novo upload. Objeto temporário antigo será limpo por lifecycle. |
| `confirm` conclui, mas salvar formulário falha | `scan3dFileRef` confirmado fica no estado da tela. Retry reutiliza a referência e não reenvia o arquivo. |
| Usuário abandona após upload temporário | Objeto em `tmp/` expira pela regra lifecycle. |

## Lifecycle no S3

Configurar uma regra somente para:

```text
biteplaner/production-scans/tmp/
```

Configuração recomendada:

- Rule name: `expire-biteplaner-production-scan-tmp`
- Scope: prefix `biteplaner/production-scans/tmp/`
- Action: expire current versions of objects
- Days after object creation: `7`
- Also enable: delete incomplete multipart uploads after `1` day.

Nunca aplicar essa regra em:

```text
biteplaner/production-scans/confirmed/
```

## Passo a passo no Console da AWS

1. Abrir o S3 Console.
2. Selecionar o bucket privado de uploads.
3. Abrir a aba Management.
4. Entrar em Lifecycle rules.
5. Criar uma rule.
6. Definir o prefixo `biteplaner/production-scans/tmp/`.
7. Marcar expiração de current versions após 7 dias.
8. Marcar remoção de incomplete multipart uploads após 1 dia.
9. Revisar se `confirmed/` não está incluído.
10. Criar a rule.

## Segurança e LGPD

- Bucket privado.
- Block Public Access ligado.
- URLs pré-assinadas curtas.
- Sem persistência de URL assinada.
- Sem promessa de antivírus ou arquivo verificado.
- Logs/auditoria registram fingerprints e metadados necessários, não URLs assinadas.
- Laboratório acessa download temporário mediado pelo backend.
```

- [ ] **Step 4: Link the detailed S3 doc from technology docs**

In `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/03-tecnologia/README.md`, add:

```md
- [Integração Amazon S3](integracao-amazon-s3.md)
```

In `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/03-tecnologia/integracoes.md`, under `## Amazon S3`, add a short pointer:

```md
Para o fluxo técnico detalhado de upload, confirmação, prefixos `tmp/` e `confirmed/`, lifecycle e relação entre APIs Nexor e S3, consulte [Integração Amazon S3](integracao-amazon-s3.md).
```

- [ ] **Step 5: Run docs validation and encoding scan**

Run:

```powershell
npm run build
rg -n 'Ã|Â|�|â' docs/03-tecnologia/integracao-amazon-s3.md docs/09-changelogs/README.md docs/10-roadmap/README.md docs/03-tecnologia/README.md docs/03-tecnologia/integracoes.md
```

Expected: Docusaurus build passes. Encoding scan may show existing mojibake in unchanged lines; fix any new mojibake introduced by this task and preserve Portuguese accents as real UTF-8.

- [ ] **Step 6: Commit nexor-docs changes**

```powershell
git add docs/09-changelogs/README.md docs/10-roadmap/README.md docs/03-tecnologia/README.md docs/03-tecnologia/integracoes.md docs/03-tecnologia/integracao-amazon-s3.md
git commit -m "docs: document amazon s3 production scan integration"
```

---

### Task 6: Final Verification

**Files:**
- No direct code edits unless verification exposes a defect.

**Interfaces:**
- Consumes all previous tasks.
- Produces verified backend/frontend integration.

- [ ] **Step 1: Run backend focused tests**

```powershell
npx vitest run tests/security/upload-storage-policy.test.ts tests/modules/biteplaner/attachments/production-attachment.service.test.ts tests/modules/biteplaner/production/production-request.application.test.ts tests/services/order.service.test.ts tests/integrations/storage/s3-object-storage.gateway.test.ts
```

Expected: PASS.

- [ ] **Step 2: Run backend build**

```powershell
npm run build
```

Expected: PASS.

- [ ] **Step 3: Run frontend focused tests**

```powershell
npx vitest run src/pages/painel/ProducaoDentista/index.test.tsx -t "selected locally|selected production scan local|latest selected production scan|S3 upload fails|confirmed production scan|submits the production request successfully"
npx vitest run src/features/biteplaner/orders/orders.api.test.ts
```

Expected: PASS.

- [ ] **Step 4: Run frontend typecheck**

```powershell
npm run typecheck
```

Expected: PASS.

- [ ] **Step 5: Scan touched text files for mojibake**

```powershell
rg -n 'Ã|Â|�|â' C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/src C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/tests C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/project/nexor/src C:/Users/Pichau/Projetos/NexorProjects/nexor-docs/docs/03-tecnologia/integracao-amazon-s3.md
```

Expected: no new matches in touched files. If existing unrelated matches appear, list them separately and do not change unrelated files.

- [ ] **Step 6: Run nexor-docs build after documentation changes**

From `C:/Users/Pichau/Projetos/NexorProjects/nexor-docs`, run:

```powershell
npm run build
```

Expected: PASS.

- [ ] **Step 7: Commit any verification fixes**

If verification required fixes:

```powershell
git add <changed-files>
git commit -m "fix: verify confirmed s3 production scan lifecycle"
```

If no fixes are required, do not create an empty commit.

---

## Self-Review Notes

- Spec coverage: tmp upload, confirmed finalization, backend rejection of tmp refs, frontend/mocks alignment, nexor-docs changelog, roadmap cleanup, detailed S3 integration documentation, lifecycle documentation, and verification are covered.
- Placeholder scan: no TBD/TODO placeholders remain.
- Type consistency: `copyObject`, `deleteObject`, `tmp`, `confirmed`, `scan3dFileRef.objectKey`, and `objectKeyFingerprint` are used consistently across tasks.
