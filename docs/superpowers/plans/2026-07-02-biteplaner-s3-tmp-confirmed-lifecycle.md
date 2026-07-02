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

Operational docs:
- Create `C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/docs/operations/s3-production-scan-lifecycle.md`
  Document the S3 Lifecycle rule and why only `tmp/` is expired.

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

### Task 5: Document and Configure S3 Lifecycle for Tmp Prefix

**Files:**
- Create `C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/docs/operations/s3-production-scan-lifecycle.md`
- Optionally modify backend `.env.example` comments if the prefix naming needs clarification.

**Interfaces:**
- Consumes `tmp/` and `confirmed/` prefixes from Tasks 2 and 3.
- Produces operational documentation for the AWS Console lifecycle rule.

- [ ] **Step 1: Create operations doc**

Create the doc with:

```md
# S3 Production Scan Lifecycle

Production scan uploads use two prefixes:

- `biteplaner/production-scans/tmp/`: temporary objects uploaded by browser PUT before the production request is durably linked.
- `biteplaner/production-scans/confirmed/`: objects copied by the backend after upload confirmation and referenced by `scan3dFileRef.objectKey`.

An object is orphaned when it exists in S3 but no saved production request points to it through `scan3dFileRef.objectKey`.

Configure S3 Lifecycle only for:

`biteplaner/production-scans/tmp/`

Recommended rule:

- Rule name: `expire-biteplaner-production-scan-tmp`
- Scope: prefix `biteplaner/production-scans/tmp/`
- Action: expire current versions of objects
- Days after object creation: `7`
- Also enable: delete incomplete multipart uploads after `1` day

Do not expire `biteplaner/production-scans/confirmed/` with this rule.
```

- [ ] **Step 2: Add AWS Console checklist**

Add:

```md
1. Open S3 Console.
2. Select the private upload bucket.
3. Open Management.
4. Choose Lifecycle rules.
5. Create rule.
6. Set prefix to `biteplaner/production-scans/tmp/`.
7. Select Expire current versions of objects after 7 days.
8. Select Delete incomplete multipart uploads after 1 day.
9. Review that `confirmed/` is not included.
10. Create rule.
```

- [ ] **Step 3: Run doc encoding scan**

Run:

```powershell
rg -n 'Ã|Â|�|â' docs/operations/s3-production-scan-lifecycle.md
```

Expected: no matches.

- [ ] **Step 4: Commit**

```powershell
git add docs/operations/s3-production-scan-lifecycle.md
git commit -m "docs: document s3 production scan lifecycle"
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
rg -n 'Ã|Â|�|â' C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/src C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api/tests C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/project/nexor/src C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/docs/operations
```

Expected: no new matches in touched files. If existing unrelated matches appear, list them separately and do not change unrelated files.

- [ ] **Step 6: Commit any verification fixes**

If verification required fixes:

```powershell
git add <changed-files>
git commit -m "fix: verify confirmed s3 production scan lifecycle"
```

If no fixes are required, do not create an empty commit.

---

## Self-Review Notes

- Spec coverage: tmp upload, confirmed finalization, backend rejection of tmp refs, frontend/mocks alignment, lifecycle documentation, and verification are covered.
- Placeholder scan: no TBD/TODO placeholders remain.
- Type consistency: `copyObject`, `deleteObject`, `tmp`, `confirmed`, `scan3dFileRef.objectKey`, and `objectKeyFingerprint` are used consistently across tasks.
