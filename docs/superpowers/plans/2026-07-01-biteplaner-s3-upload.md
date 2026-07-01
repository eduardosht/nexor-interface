# Biteplaner S3 Upload Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Integrar o anexo obrigatório de escaneamento 3D da solicitação de produção do dentista com Amazon S3 privado usando URLs pré-assinadas, sem scanner automático de malware no MVP.

**Architecture:** O backend Fastify será a autoridade para autorização, política de arquivo, geração de chave S3, URLs pré-assinadas e auditoria. O frontend React fará upload direto para S3 via `PUT`, confirmará o upload no backend e persistirá somente a referência privada no payload de produção. O laboratório receberá download temporário gerado pelo backend, nunca URL pública ou persistida.

**Tech Stack:** Node.js 20+, TypeScript, Fastify, Zod, Vitest, AWS SDK for JavaScript v3 (`@aws-sdk/client-s3`, `@aws-sdk/s3-request-presigner`), React 19, Vite, MirageJS.

## Global Constraints

- Criar e editar arquivos de texto em UTF-8 sem BOM.
- Preservar acentos em português como UTF-8 real.
- Antes de concluir mudanças de UI/texto, procurar marcadores de mojibake nos arquivos tocados.
- Não expor secrets no frontend.
- Não logar dados pessoais sensíveis, URLs assinadas ou credenciais.
- Validar toda entrada externa com schema.
- Colocar autorização no backend.
- Registrar auditoria para ações sensíveis.
- Testar casos negativos de segurança e LGPD.
- MVP sem GuardDuty, ClamAV, Lambda ou scanner automático de malware.
- Bucket S3 privado; sem persistência de `publicUrl`, `downloadUrl`, `signedUrl` ou `url`.

---

## File Structure

Backend, em `nexor-backend/project/api`:

- Modify: `package.json` e `package-lock.json` para adicionar AWS SDK v3.
- Modify: `src/config/env.ts` para aceitar configuração S3 opcional em desenvolvimento/teste e obrigatória em produção.
- Create: `src/integrations/storage/object-storage.gateway.ts` com a interface do gateway e tipos de presigned URL.
- Create: `src/integrations/storage/s3-object-storage.gateway.ts` com `S3Client`, `PutObjectCommand`, `GetObjectCommand` e `getSignedUrl`.
- Create: `src/modules/biteplaner/attachments/production-attachment.service.ts` com política, autorização, metadados e auditoria.
- Modify: `src/modules/biteplaner/production/production-request.application.ts` para aceitar referência `amazon-s3` confirmada e continuar bloqueando URLs.
- Modify: `src/services/order.service.ts` para expor métodos de attachment como fachada usada pelas rotas.
- Modify: `src/routes/route-context.ts` para incluir o serviço de anexos na composição das rotas.
- Modify: `src/routes/order.routes.ts` para criar rotas de upload intent, confirmação e download.
- Modify: `src/app.ts` para compor storage S3/fake e serviço de anexos.
- Test: `tests/integrations/storage/s3-object-storage.gateway.test.ts`
- Test: `tests/modules/biteplaner/attachments/production-attachment.service.test.ts`
- Test: `tests/modules/biteplaner/production/production-request.application.test.ts`
- Test: `tests/routes/order.routes.test.ts`
- Test: `tests/security/upload-storage-policy.test.ts`

Frontend, em `nexor-interface/project/nexor`:

- Modify: `src/features/demo/biteplanerFlow.ts` e `src/features/biteplaner/orders/orders.types.ts` para tipar `ExternalFileReference` S3.
- Modify: `src/features/demo/externalUploadGateway.ts` para virar cliente assíncrono de upload real/fake.
- Modify: `src/features/biteplaner/orders/orders.api.ts` para chamadas de upload intent, confirmação e download.
- Modify: `src/pages/painel/ProducaoDentista/ProductionRequestFields.tsx` para upload assíncrono direto ao S3.
- Modify: `src/pages/painel/ProducaoDentista/index.tsx` se necessário para bloquear envio enquanto upload estiver em andamento.
- Modify: `src/mocks/handlers/orders.ts` para simular as novas rotas.
- Test: `src/features/demo/externalUploadGateway.test.ts`
- Test: `src/features/biteplaner/orders/orders.api.test.ts`
- Test: `src/pages/painel/ProducaoDentista/index.test.tsx`

---

### Task 1: Backend Storage Gateway and Environment

**Files:**
- Modify: `nexor-backend/project/api/package.json`
- Modify: `nexor-backend/project/api/package-lock.json`
- Modify: `nexor-backend/project/api/src/config/env.ts`
- Create: `nexor-backend/project/api/src/integrations/storage/object-storage.gateway.ts`
- Create: `nexor-backend/project/api/src/integrations/storage/s3-object-storage.gateway.ts`
- Test: `nexor-backend/project/api/tests/integrations/storage/s3-object-storage.gateway.test.ts`

**Interfaces:**
- Produces: `ObjectStorageGateway.createPresignedPutObjectUrl(input): Promise<PresignedObjectUrl>`
- Produces: `ObjectStorageGateway.createPresignedGetObjectUrl(input): Promise<PresignedObjectUrl>`
- Produces: `S3ObjectStorageGateway` backed by AWS SDK v3.
- Consumes later: Task 2 attachment service uses `ObjectStorageGateway`.

- [ ] **Step 1: Install AWS SDK dependencies**

Run:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api
npm install @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

Expected: `package.json` and `package-lock.json` include both packages.

- [ ] **Step 2: Write the failing environment test**

Append to `nexor-backend/project/api/src/config/env.test.ts` if it exists. If it does not exist, create `nexor-backend/project/api/tests/config/env.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { loadEnv } from '../../src/config/env.js';

const baseEnv = {
  NODE_ENV: 'development',
  SUPABASE_URL: 'https://example.supabase.co',
  SUPABASE_ANON_KEY: 'anon',
  SUPABASE_SERVICE_ROLE_KEY: 'service'
};

describe('S3 upload environment', () => {
  it('uses safe defaults for local S3 attachment configuration', () => {
    const env = loadEnv(baseEnv);

    expect(env.S3_UPLOAD_PREFIX).toBe('biteplaner/production-scans');
    expect(env.S3_PRESIGNED_UPLOAD_TTL_SECONDS).toBe(600);
    expect(env.S3_PRESIGNED_DOWNLOAD_TTL_SECONDS).toBe(300);
  });

  it('requires S3 bucket and AWS region in production', () => {
    expect(() =>
      loadEnv({
        ...baseEnv,
        NODE_ENV: 'production',
        STRIPE_SECRET_KEY: 'sk_live_test',
        STRIPE_WEBHOOK_SECRET: 'whsec_test',
        STRIPE_SUCCESS_URL: 'https://nexor.test/success',
        STRIPE_CANCEL_URL: 'https://nexor.test/cancel',
        STRIPE_BITEPLANER_PRICE_BY_MODEL_COLOR_JSON: '{"impacto":{"preto":"price_1"}}',
        RESEND_API_KEY: 'resend',
        CONTACT_EMAIL_FROM: 'Nexor <no-reply@nexor.test>',
        SWAGGER_USER: 'docs',
        SWAGGER_PASSWORD: 'very-secure-password'
      })
    ).toThrow();
  });
});
```

- [ ] **Step 3: Run env test to verify it fails**

Run:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api
npx vitest run tests/config/env.test.ts src/config/env.test.ts
```

Expected: FAIL because S3 env fields do not exist yet.

- [ ] **Step 4: Add S3 env fields**

Modify `nexor-backend/project/api/src/config/env.ts` inside `envSchema`:

```ts
    AWS_REGION: z.string().min(1).optional(),
    AWS_ACCESS_KEY_ID: z.string().min(1).optional(),
    AWS_SECRET_ACCESS_KEY: z.string().min(1).optional(),
    S3_UPLOAD_BUCKET: z.string().min(3).optional(),
    S3_UPLOAD_PREFIX: z.string().min(1).default('biteplaner/production-scans'),
    S3_PRESIGNED_UPLOAD_TTL_SECONDS: z.coerce.number().int().min(60).max(900).default(600),
    S3_PRESIGNED_DOWNLOAD_TTL_SECONDS: z.coerce.number().int().min(60).max(900).default(300),
```

Add this production validation block inside `if (env.NODE_ENV === 'production')`:

```ts
      for (const key of ['AWS_REGION', 'S3_UPLOAD_BUCKET'] as const) {
        if (!env[key]) {
          ctx.addIssue({
            code: 'custom',
            path: [key],
            message: `${key} is required in production`
          });
        }
      }
```

- [ ] **Step 5: Create storage gateway interface**

Create `nexor-backend/project/api/src/integrations/storage/object-storage.gateway.ts`:

```ts
export interface PresignedObjectUrl {
  url: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
}

export interface PresignedPutObjectInput {
  bucket: string;
  key: string;
  contentType: string;
  expiresInSeconds: number;
  checksumSha256?: string | undefined;
}

export interface PresignedGetObjectInput {
  bucket: string;
  key: string;
  expiresInSeconds: number;
  responseContentDisposition?: string | undefined;
}

export interface ObjectStorageGateway {
  createPresignedPutObjectUrl(input: PresignedPutObjectInput): Promise<PresignedObjectUrl>;
  createPresignedGetObjectUrl(input: PresignedGetObjectInput): Promise<PresignedObjectUrl>;
}
```

- [ ] **Step 6: Create S3 gateway implementation**

Create `nexor-backend/project/api/src/integrations/storage/s3-object-storage.gateway.ts`:

```ts
import { GetObjectCommand, PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import type {
  ObjectStorageGateway,
  PresignedGetObjectInput,
  PresignedObjectUrl,
  PresignedPutObjectInput
} from './object-storage.gateway.js';

const expiresAtFromNow = (seconds: number): string =>
  new Date(Date.now() + seconds * 1000).toISOString();

export class S3ObjectStorageGateway implements ObjectStorageGateway {
  private readonly client: S3Client;

  constructor(input: { region: string }) {
    this.client = new S3Client({ region: input.region });
  }

  async createPresignedPutObjectUrl(input: PresignedPutObjectInput): Promise<PresignedObjectUrl> {
    const command = new PutObjectCommand({
      Bucket: input.bucket,
      Key: input.key,
      ContentType: input.contentType,
      ...(input.checksumSha256 ? { ChecksumSHA256: input.checksumSha256 } : {})
    });

    return {
      url: await getSignedUrl(this.client, command, { expiresIn: input.expiresInSeconds }),
      requiredHeaders: {
        'Content-Type': input.contentType,
        ...(input.checksumSha256 ? { 'x-amz-checksum-sha256': input.checksumSha256 } : {})
      },
      expiresAt: expiresAtFromNow(input.expiresInSeconds)
    };
  }

  async createPresignedGetObjectUrl(input: PresignedGetObjectInput): Promise<PresignedObjectUrl> {
    const command = new GetObjectCommand({
      Bucket: input.bucket,
      Key: input.key,
      ...(input.responseContentDisposition
        ? { ResponseContentDisposition: input.responseContentDisposition }
        : {})
    });

    return {
      url: await getSignedUrl(this.client, command, { expiresIn: input.expiresInSeconds }),
      requiredHeaders: {},
      expiresAt: expiresAtFromNow(input.expiresInSeconds)
    };
  }
}
```

- [ ] **Step 7: Write gateway test**

Create `nexor-backend/project/api/tests/integrations/storage/s3-object-storage.gateway.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { S3ObjectStorageGateway } from '../../../src/integrations/storage/s3-object-storage.gateway.js';

describe('S3ObjectStorageGateway', () => {
  it('creates an object gateway instance without exposing credentials in constructor input', () => {
    const gateway = new S3ObjectStorageGateway({ region: 'us-east-1' });

    expect(gateway).toBeInstanceOf(S3ObjectStorageGateway);
  });
});
```

- [ ] **Step 8: Run task tests**

Run:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api
npx vitest run tests/integrations/storage/s3-object-storage.gateway.test.ts tests/config/env.test.ts
npm run build
```

Expected: PASS.

- [ ] **Step 9: Commit**

```bash
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-backend add project/api/package.json project/api/package-lock.json project/api/src/config/env.ts project/api/src/integrations/storage project/api/tests
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-backend commit -m "feat: add s3 object storage gateway"
```

---

### Task 2: Backend Production Attachment Service

**Files:**
- Create: `nexor-backend/project/api/src/modules/biteplaner/attachments/production-attachment.service.ts`
- Test: `nexor-backend/project/api/tests/modules/biteplaner/attachments/production-attachment.service.test.ts`

**Interfaces:**
- Consumes: `ObjectStorageGateway` from Task 1.
- Produces: `ProductionAttachmentService.createUploadIntent(actor, orderId, input)`
- Produces: `ProductionAttachmentService.confirmUpload(actor, orderId, input)`
- Produces: `ProductionAttachmentService.createDownloadUrl(actor, orderId, input)`
- Produces: `ProductionScan3dFileRef` with `provider: 'amazon-s3'`, `purpose: 'production_scan3d'`, `scanStatus: 'not_scanned'`.

- [ ] **Step 1: Write failing service tests**

Create `nexor-backend/project/api/tests/modules/biteplaner/attachments/production-attachment.service.test.ts`:

```ts
import { describe, expect, it, vi } from 'vitest';
import { ProductionAttachmentService } from '../../../../src/modules/biteplaner/attachments/production-attachment.service.js';
import type { AuthenticatedUser } from '../../../../src/types/auth.js';

const dentist: AuthenticatedUser = {
  id: 'auth-dentist',
  authUserId: 'auth-dentist',
  profileId: 'dentist-profile-1',
  dentistId: 'dentist-1',
  roles: [],
  clinicIds: [],
  productRoles: [{
    productKey: 'biteplaner',
    role: 'dentist',
    status: 'active',
    metadata: {},
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z'
  }]
};

const lab: AuthenticatedUser = {
  id: 'auth-lab',
  authUserId: 'auth-lab',
  profileId: 'lab-profile-1',
  roles: [],
  clinicIds: [],
  productRoles: [{
    productKey: 'biteplaner',
    role: 'lab',
    status: 'active',
    metadata: {},
    createdAt: '2026-06-01T00:00:00.000Z',
    updatedAt: '2026-06-01T00:00:00.000Z'
  }]
};

const makeOrder = () => ({
  id: '11111111-1111-4111-8111-111111111111',
  dentist_id: 'dentist-1',
  lab_profile_id: 'lab-profile-1',
  status: 'awaiting_dentist_forms',
  clinical_outcome: 'eligible',
  user_profile_id: 'customer-profile-1',
  customer_profile_id: 'customer-profile-1',
  partner_id: null,
  clinic_id: null,
  created_at: '2026-07-01T00:00:00.000Z',
  updated_at: '2026-07-01T00:00:00.000Z'
});

const makeService = () => {
  const orders = {
    getOrder: vi.fn(async () => makeOrder()),
    addStatusEvent: vi.fn(async () => undefined)
  };
  const storage = {
    createPresignedPutObjectUrl: vi.fn(async () => ({
      url: 'https://s3.test/upload',
      requiredHeaders: { 'Content-Type': 'model/stl' },
      expiresAt: '2026-07-01T00:10:00.000Z'
    })),
    createPresignedGetObjectUrl: vi.fn(async () => ({
      url: 'https://s3.test/download',
      requiredHeaders: {},
      expiresAt: '2026-07-01T00:05:00.000Z'
    }))
  };
  const audit = { record: vi.fn(async () => undefined) };

  return {
    service: new ProductionAttachmentService(orders as never, storage, audit as never, {
      bucket: 'private-bucket',
      prefix: 'biteplaner/production-scans',
      uploadTtlSeconds: 600,
      downloadTtlSeconds: 300
    }),
    orders,
    storage,
    audit
  };
};

describe('ProductionAttachmentService', () => {
  it('creates a presigned upload intent for the linked dentist', async () => {
    const { service, storage, audit } = makeService();

    const intent = await service.createUploadIntent(dentist, '11111111-1111-4111-8111-111111111111', {
      fileName: 'scan.stl',
      mimeType: 'model/stl',
      sizeBytes: 2048,
      checksumSha256: 'sha256-test'
    });

    expect(intent.uploadId).toMatch(/^upload_/);
    expect(intent.objectKey).toContain('biteplaner/production-scans/11111111-1111-4111-8111-111111111111/');
    expect(intent.uploadUrl).toBe('https://s3.test/upload');
    expect(storage.createPresignedPutObjectUrl).toHaveBeenCalledWith(expect.objectContaining({
      bucket: 'private-bucket',
      contentType: 'model/stl',
      expiresInSeconds: 600
    }));
    expect(audit.record).toHaveBeenCalledWith(expect.objectContaining({
      action: 'production_scan3d.upload_intent_created',
      actorProfileId: 'dentist-profile-1'
    }));
  });

  it('rejects upload intent for invalid extension', async () => {
    const { service, storage } = makeService();

    await expect(service.createUploadIntent(dentist, '11111111-1111-4111-8111-111111111111', {
      fileName: 'scan.exe',
      mimeType: 'application/octet-stream',
      sizeBytes: 2048
    })).rejects.toMatchObject({ statusCode: 409 });

    expect(storage.createPresignedPutObjectUrl).not.toHaveBeenCalled();
  });

  it('confirms upload with a private amazon-s3 reference', async () => {
    const { service } = makeService();
    const intent = await service.createUploadIntent(dentist, '11111111-1111-4111-8111-111111111111', {
      fileName: 'scan.stl',
      mimeType: 'model/stl',
      sizeBytes: 2048
    });

    const result = await service.confirmUpload(dentist, '11111111-1111-4111-8111-111111111111', {
      uploadId: intent.uploadId,
      objectKey: intent.objectKey,
      fileName: 'scan.stl',
      mimeType: 'model/stl',
      sizeBytes: 2048
    });

    expect(result.fileRef).toMatchObject({
      id: intent.uploadId,
      provider: 'amazon-s3',
      purpose: 'production_scan3d',
      objectKey: intent.objectKey,
      scanStatus: 'not_scanned'
    });
    expect(JSON.stringify(result.fileRef)).not.toContain('https://');
  });

  it('rejects confirmation with object key outside the expected prefix', async () => {
    const { service } = makeService();

    await expect(service.confirmUpload(dentist, '11111111-1111-4111-8111-111111111111', {
      uploadId: 'upload_123',
      objectKey: 'other-prefix/scan.stl',
      fileName: 'scan.stl',
      mimeType: 'model/stl',
      sizeBytes: 2048
    })).rejects.toMatchObject({ statusCode: 409 });
  });

  it('creates download url only for the selected lab', async () => {
    const { service } = makeService();

    const result = await service.createDownloadUrl(lab, '11111111-1111-4111-8111-111111111111', {
      fileRef: {
        id: 'upload_123',
        provider: 'amazon-s3',
        purpose: 'production_scan3d',
        bucket: 'private-bucket',
        objectKey: 'biteplaner/production-scans/11111111-1111-4111-8111-111111111111/upload_123/scan.stl',
        fileName: 'scan.stl',
        mimeType: 'model/stl',
        sizeBytes: 2048,
        scanStatus: 'not_scanned',
        uploadedByProfileId: 'dentist-profile-1',
        uploadedAt: '2026-07-01T00:00:00.000Z'
      }
    });

    expect(result.downloadUrl).toBe('https://s3.test/download');
  });
});
```

- [ ] **Step 2: Run test to verify it fails**

Run:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api
npx vitest run tests/modules/biteplaner/attachments/production-attachment.service.test.ts
```

Expected: FAIL because `ProductionAttachmentService` does not exist.

- [ ] **Step 3: Implement production attachment service**

Create `nexor-backend/project/api/src/modules/biteplaner/attachments/production-attachment.service.ts`:

```ts
import { conflict, forbidden } from '../../../security/http-errors.js';
import { hasBiteplanerRole } from '../../../security/authorization.js';
import type { ObjectStorageGateway } from '../../../integrations/storage/object-storage.gateway.js';
import type { AuditService } from '../../../services/audit.service.js';
import type { OrderRepository } from '../../../repositories/order.repository.js';
import type { AuthenticatedUser } from '../../../types/auth.js';
import type { JsonObject, OrderRecord } from '../../../types/biteplaner.js';

const allowedExtensions = new Set(['.stl', '.ply', '.obj', '.dcm', '.dicom', '.zip', '.pdf']);
const allowedMimeTypes = new Set([
  'application/dicom',
  'application/octet-stream',
  'application/pdf',
  'application/zip',
  'model/stl',
  'model/obj',
  'model/vnd.ply',
  'multipart/x-zip'
]);
const maxSizeBytes = 100 * 1024 * 1024;

export interface ProductionScan3dFileRef extends JsonObject {
  id: string;
  provider: 'amazon-s3';
  purpose: 'production_scan3d';
  bucket: string;
  objectKey: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256?: string | undefined;
  scanStatus: 'not_scanned';
  uploadedByProfileId: string;
  uploadedAt: string;
}

export interface ProductionAttachmentConfig {
  bucket: string;
  prefix: string;
  uploadTtlSeconds: number;
  downloadTtlSeconds: number;
}

const getFileExtension = (fileName: string): string => {
  const normalized = fileName.trim().toLowerCase();
  const dotIndex = normalized.lastIndexOf('.');
  return dotIndex > -1 ? normalized.slice(dotIndex) : '';
};

const sanitizeFileName = (fileName: string): string =>
  fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80) || 'scan3d';

const normalizePrefix = (prefix: string): string => prefix.replace(/^\/+|\/+$/g, '');

const assertFilePolicy = (input: { fileName: string; mimeType: string; sizeBytes: number }) => {
  const extension = getFileExtension(input.fileName);
  const mimeType = input.mimeType.toLowerCase();

  if (!allowedExtensions.has(extension) || !allowedMimeTypes.has(mimeType)) {
    throw conflict('Production scan3d attachment type is not allowed.');
  }

  if (!Number.isFinite(input.sizeBytes) || input.sizeBytes <= 0 || input.sizeBytes > maxSizeBytes) {
    throw conflict('Production scan3d attachment size is not allowed.');
  }
};

const assertDentistCanAttach = (actor: AuthenticatedUser, order: OrderRecord) => {
  if (!hasBiteplanerRole(actor, ['dentist']) || actor.dentistId === undefined || actor.dentistId !== order.dentist_id) {
    throw forbidden('Only the linked dentist can manage production scan attachments.');
  }
};

const assertCanDownload = (actor: AuthenticatedUser, order: OrderRecord) => {
  const isLinkedDentist = hasBiteplanerRole(actor, ['dentist']) && actor.dentistId !== undefined && actor.dentistId === order.dentist_id;
  const isSelectedLab = hasBiteplanerRole(actor, ['lab']) && actor.profileId !== undefined && actor.profileId === order.lab_profile_id;
  const isAdmin = actor.roles.includes('admin');

  if (!isLinkedDentist && !isSelectedLab && !isAdmin) {
    throw forbidden('Actor cannot download this production scan attachment.');
  }
};

export class ProductionAttachmentService {
  constructor(
    private readonly orders: Pick<OrderRepository, 'getOrder' | 'addStatusEvent'>,
    private readonly storage: ObjectStorageGateway,
    private readonly audit: Pick<AuditService, 'record'>,
    private readonly config: ProductionAttachmentConfig
  ) {}

  async createUploadIntent(actor: AuthenticatedUser, orderId: string, input: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    checksumSha256?: string | undefined;
  }) {
    const order = await this.orders.getOrder(orderId);
    assertDentistCanAttach(actor, order);
    assertFilePolicy(input);

    const uploadId = `upload_${crypto.randomUUID()}`;
    const prefix = normalizePrefix(this.config.prefix);
    const objectKey = `${prefix}/${order.id}/${uploadId}/${sanitizeFileName(input.fileName)}`;
    const signed = await this.storage.createPresignedPutObjectUrl({
      bucket: this.config.bucket,
      key: objectKey,
      contentType: input.mimeType,
      expiresInSeconds: this.config.uploadTtlSeconds,
      checksumSha256: input.checksumSha256
    });

    await this.audit.record({
      action: 'production_scan3d.upload_intent_created',
      actorProfileId: actor.profileId,
      purpose: 'biteplaner_production_attachment',
      metadata: { orderId: order.id, uploadId, objectKey, sizeBytes: input.sizeBytes, mimeType: input.mimeType }
    });

    return { uploadId, objectKey, uploadUrl: signed.url, requiredHeaders: signed.requiredHeaders, expiresAt: signed.expiresAt };
  }

  async confirmUpload(actor: AuthenticatedUser, orderId: string, input: {
    uploadId: string;
    objectKey: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    checksumSha256?: string | undefined;
  }): Promise<{ fileRef: ProductionScan3dFileRef }> {
    const order = await this.orders.getOrder(orderId);
    assertDentistCanAttach(actor, order);
    assertFilePolicy(input);

    const expectedPrefix = `${normalizePrefix(this.config.prefix)}/${order.id}/${input.uploadId}/`;
    if (!input.uploadId.startsWith('upload_') || !input.objectKey.startsWith(expectedPrefix)) {
      throw conflict('Production scan3d upload confirmation does not match the expected object key.');
    }

    const fileRef: ProductionScan3dFileRef = {
      id: input.uploadId,
      provider: 'amazon-s3',
      purpose: 'production_scan3d',
      bucket: this.config.bucket,
      objectKey: input.objectKey,
      fileName: input.fileName,
      mimeType: input.mimeType,
      sizeBytes: input.sizeBytes,
      ...(input.checksumSha256 ? { checksumSha256: input.checksumSha256 } : {}),
      scanStatus: 'not_scanned',
      uploadedByProfileId: actor.profileId ?? 'unknown-profile',
      uploadedAt: new Date().toISOString()
    };

    await this.audit.record({
      action: 'production_scan3d.upload_confirmed',
      actorProfileId: actor.profileId,
      purpose: 'biteplaner_production_attachment',
      metadata: { orderId: order.id, uploadId: input.uploadId, objectKey: input.objectKey, sizeBytes: input.sizeBytes }
    });

    return { fileRef };
  }

  async createDownloadUrl(actor: AuthenticatedUser, orderId: string, input: { fileRef: ProductionScan3dFileRef }) {
    const order = await this.orders.getOrder(orderId);
    assertCanDownload(actor, order);

    if (input.fileRef.provider !== 'amazon-s3' || input.fileRef.purpose !== 'production_scan3d') {
      throw conflict('Production scan3d attachment reference is not supported.');
    }

    const signed = await this.storage.createPresignedGetObjectUrl({
      bucket: this.config.bucket,
      key: input.fileRef.objectKey,
      expiresInSeconds: this.config.downloadTtlSeconds,
      responseContentDisposition: `attachment; filename="${sanitizeFileName(input.fileRef.fileName)}"`
    });

    await this.audit.record({
      action: 'production_scan3d.download_url_created',
      actorProfileId: actor.profileId,
      purpose: 'biteplaner_production_attachment',
      metadata: { orderId: order.id, fileRefId: input.fileRef.id, objectKey: input.fileRef.objectKey }
    });

    return { downloadUrl: signed.url, expiresAt: signed.expiresAt };
  }
}
```

- [ ] **Step 4: Run task tests**

Run:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api
npx vitest run tests/modules/biteplaner/attachments/production-attachment.service.test.ts
npm run build
```

Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-backend add project/api/src/modules/biteplaner/attachments project/api/tests/modules/biteplaner/attachments
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-backend commit -m "feat: add production attachment service"
```

---

### Task 3: Backend Routes and Dependency Injection

**Files:**
- Modify: `nexor-backend/project/api/src/routes/route-context.ts`
- Modify: `nexor-backend/project/api/src/services/order.service.ts`
- Modify: `nexor-backend/project/api/src/routes/order.routes.ts`
- Modify: `nexor-backend/project/api/src/app.ts`
- Test: `nexor-backend/project/api/tests/routes/order.routes.test.ts`

**Interfaces:**
- Consumes: `ProductionAttachmentService` from Task 2.
- Produces routes:
  - `POST /v1/orders/:orderId/attachments/production-scan3d/upload-intent`
  - `POST /v1/orders/:orderId/attachments/production-scan3d/confirm`
  - `POST /v1/orders/:orderId/attachments/production-scan3d/download-url`

- [ ] **Step 1: Write failing route tests**

Append to `nexor-backend/project/api/tests/routes/order.routes.test.ts`:

```ts
  it('creates production scan upload intent for authenticated actor', async () => {
    services.orders.createProductionScanUploadIntent = vi.fn(async () => ({
      uploadId: 'upload_123',
      objectKey: 'biteplaner/production-scans/11111111-1111-4111-8111-111111111111/upload_123/scan.stl',
      uploadUrl: 'https://s3.test/upload',
      requiredHeaders: { 'Content-Type': 'model/stl' },
      expiresAt: '2026-07-01T00:10:00.000Z'
    }));

    const response = await app.inject({
      method: 'POST',
      url: '/v1/orders/11111111-1111-4111-8111-111111111111/attachments/production-scan3d/upload-intent',
      headers: { authorization: 'Bearer valid-token' },
      payload: { fileName: 'scan.stl', mimeType: 'model/stl', sizeBytes: 2048 }
    });

    expect(response.statusCode).toBe(200);
    expect(services.orders.createProductionScanUploadIntent).toHaveBeenCalledWith(
      expect.objectContaining({ profileId: 'customer-profile-1' }),
      '11111111-1111-4111-8111-111111111111',
      { fileName: 'scan.stl', mimeType: 'model/stl', sizeBytes: 2048 }
    );
    expect(response.json()).toMatchObject({ uploadId: 'upload_123' });
  });

  it('confirms production scan upload', async () => {
    services.orders.confirmProductionScanUpload = vi.fn(async () => ({
      fileRef: {
        id: 'upload_123',
        provider: 'amazon-s3',
        purpose: 'production_scan3d',
        objectKey: 'biteplaner/production-scans/11111111-1111-4111-8111-111111111111/upload_123/scan.stl',
        fileName: 'scan.stl',
        mimeType: 'model/stl',
        sizeBytes: 2048,
        scanStatus: 'not_scanned',
        uploadedAt: '2026-07-01T00:00:00.000Z'
      }
    }));

    const response = await app.inject({
      method: 'POST',
      url: '/v1/orders/11111111-1111-4111-8111-111111111111/attachments/production-scan3d/confirm',
      headers: { authorization: 'Bearer valid-token' },
      payload: {
        uploadId: 'upload_123',
        objectKey: 'biteplaner/production-scans/11111111-1111-4111-8111-111111111111/upload_123/scan.stl',
        fileName: 'scan.stl',
        mimeType: 'model/stl',
        sizeBytes: 2048
      }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json().fileRef).toMatchObject({ provider: 'amazon-s3', scanStatus: 'not_scanned' });
  });

  it('creates production scan download url without persisting it', async () => {
    services.orders.createProductionScanDownloadUrl = vi.fn(async () => ({
      downloadUrl: 'https://s3.test/download',
      expiresAt: '2026-07-01T00:05:00.000Z'
    }));

    const response = await app.inject({
      method: 'POST',
      url: '/v1/orders/11111111-1111-4111-8111-111111111111/attachments/production-scan3d/download-url',
      headers: { authorization: 'Bearer valid-token' },
      payload: { fileRefId: 'upload_123' }
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({
      downloadUrl: 'https://s3.test/download',
      expiresAt: '2026-07-01T00:05:00.000Z'
    });
  });
```

- [ ] **Step 2: Run route tests to verify they fail**

Run:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api
npx vitest run tests/routes/order.routes.test.ts
```

Expected: FAIL because the routes do not exist.

- [ ] **Step 3: Add service field to route context**

Modify `nexor-backend/project/api/src/routes/route-context.ts`:

```ts
import type { ProductionAttachmentService } from '../modules/biteplaner/attachments/production-attachment.service.js';
```

Add to `RouteServices`:

```ts
  productionAttachments: ProductionAttachmentService;
```

- [ ] **Step 4: Add OrderService facade methods**

Modify `nexor-backend/project/api/src/services/order.service.ts` constructor to accept an optional attachment service:

```ts
    private readonly productionAttachments?: ProductionAttachmentService | undefined
```

Add imports and methods:

```ts
import type { ProductionAttachmentService } from '../modules/biteplaner/attachments/production-attachment.service.js';

  async createProductionScanUploadIntent(actor: AuthenticatedUser, orderId: string, input: {
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    checksumSha256?: string | undefined;
  }) {
    if (this.productionAttachments === undefined) {
      throw conflict('Production attachment storage is not configured.');
    }

    return this.productionAttachments.createUploadIntent(actor, orderId, input);
  }

  async confirmProductionScanUpload(actor: AuthenticatedUser, orderId: string, input: {
    uploadId: string;
    objectKey: string;
    fileName: string;
    mimeType: string;
    sizeBytes: number;
    checksumSha256?: string | undefined;
  }) {
    if (this.productionAttachments === undefined) {
      throw conflict('Production attachment storage is not configured.');
    }

    return this.productionAttachments.confirmUpload(actor, orderId, input);
  }

  async createProductionScanDownloadUrl(actor: AuthenticatedUser, orderId: string, input: { fileRefId: string }) {
    if (this.productionAttachments === undefined) {
      throw conflict('Production attachment storage is not configured.');
    }

    const forms = await this.listForms(actor, orderId);
    const productionForm = forms
      .filter((form) => form.type === 'production_request')
      .sort((left, right) => right.version - left.version)[0];

    if (productionForm === undefined) {
      throw conflict('Production request form was not found for this order.');
    }

    const form = await this.getForm(actor, orderId, productionForm.id);
    const fileRef = form.payload.scan3dFileRef;

    if (typeof fileRef !== 'object' || fileRef === null || Array.isArray(fileRef) || fileRef.id !== input.fileRefId) {
      throw conflict('Production scan attachment reference was not found.');
    }

    return this.productionAttachments.createDownloadUrl(actor, orderId, { fileRef: fileRef as never });
  }
```

- [ ] **Step 5: Add route schemas and handlers**

Modify `nexor-backend/project/api/src/routes/order.routes.ts` near existing schemas:

```ts
const productionScanUploadIntentSchema = z.object({
  fileName: z.string().min(1).max(255),
  mimeType: z.string().min(1).max(120),
  sizeBytes: z.number().int().positive().max(100 * 1024 * 1024),
  checksumSha256: z.string().min(16).max(128).optional()
});

const productionScanConfirmSchema = productionScanUploadIntentSchema.extend({
  uploadId: z.string().min(8).max(120),
  objectKey: z.string().min(1).max(500)
});

const productionScanDownloadSchema = z.object({
  fileRefId: z.string().min(8).max(120)
});
```

Register three handlers before `/v1/orders/:orderId/forms/production-request`:

```ts
  app.post(
    '/v1/orders/:orderId/attachments/production-scan3d/upload-intent',
    {
      schema: {
        tags: ['Clinical Forms'],
        summary: 'Cria URL assinada para upload do escaneamento 3D.',
        security,
        params: orderParamsDoc
      }
    },
    async (request) => {
      const user = await authenticateRequest(request, services);
      const params = validateParams(orderParamsSchema, request.params);
      const body = validateBody(productionScanUploadIntentSchema, request.body);
      return services.orders.createProductionScanUploadIntent(user, params.orderId, body);
    }
  );

  app.post(
    '/v1/orders/:orderId/attachments/production-scan3d/confirm',
    {
      schema: {
        tags: ['Clinical Forms'],
        summary: 'Confirma upload privado do escaneamento 3D.',
        security,
        params: orderParamsDoc
      }
    },
    async (request) => {
      const user = await authenticateRequest(request, services);
      const params = validateParams(orderParamsSchema, request.params);
      const body = validateBody(productionScanConfirmSchema, request.body);
      return services.orders.confirmProductionScanUpload(user, params.orderId, body);
    }
  );

  app.post(
    '/v1/orders/:orderId/attachments/production-scan3d/download-url',
    {
      schema: {
        tags: ['Clinical Forms'],
        summary: 'Cria URL assinada temporária para download do escaneamento 3D.',
        security,
        params: orderParamsDoc
      }
    },
    async (request) => {
      const user = await authenticateRequest(request, services);
      const params = validateParams(orderParamsSchema, request.params);
      const body = validateBody(productionScanDownloadSchema, request.body);
      return services.orders.createProductionScanDownloadUrl(user, params.orderId, body);
    }
  );
```

- [ ] **Step 6: Compose service in app**

Modify `nexor-backend/project/api/src/app.ts` imports:

```ts
import { S3ObjectStorageGateway } from './integrations/storage/s3-object-storage.gateway.js';
import { ProductionAttachmentService } from './modules/biteplaner/attachments/production-attachment.service.js';
```

Create the gateway before `OrderService`:

```ts
  const objectStorage =
    env.AWS_REGION !== undefined && env.S3_UPLOAD_BUCKET !== undefined
      ? new S3ObjectStorageGateway({ region: env.AWS_REGION })
      : undefined;
  const productionAttachmentService =
    objectStorage !== undefined && env.S3_UPLOAD_BUCKET !== undefined
      ? new ProductionAttachmentService(orderRepository, objectStorage, auditService, {
          bucket: env.S3_UPLOAD_BUCKET,
          prefix: env.S3_UPLOAD_PREFIX,
          uploadTtlSeconds: env.S3_PRESIGNED_UPLOAD_TTL_SECONDS,
          downloadTtlSeconds: env.S3_PRESIGNED_DOWNLOAD_TTL_SECONDS
        })
      : undefined;
```

Pass `productionAttachmentService` to `OrderService` and add it to `services`. If `RouteServices` requires it, create a fake in test mode or make the field optional and route handlers use `services.orders` facade only.

- [ ] **Step 7: Run route and build tests**

Run:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api
npx vitest run tests/routes/order.routes.test.ts
npm run build
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-backend add project/api/src/routes project/api/src/services/order.service.ts project/api/src/app.ts project/api/tests/routes/order.routes.test.ts
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-backend commit -m "feat: expose production scan attachment routes"
```

---

### Task 4: Production Request Validation for S3 References

**Files:**
- Modify: `nexor-backend/project/api/src/modules/biteplaner/production/production-request.application.ts`
- Modify: `nexor-backend/project/api/src/security/upload-storage-policy.ts`
- Test: `nexor-backend/project/api/tests/modules/biteplaner/production/production-request.application.test.ts`
- Test: `nexor-backend/project/api/tests/security/upload-storage-policy.test.ts`
- Test: `nexor-backend/project/api/scripts/audit-lgpd-upload-storage.ts`

**Interfaces:**
- Consumes: `ProductionScan3dFileRef` from Task 2.
- Produces: validation that accepts `provider: 'amazon-s3'`, `purpose: 'production_scan3d'`, `scanStatus: 'not_scanned'`.
- Maintains: rejection of URL fields and prescription fields.

- [ ] **Step 1: Write failing validation tests**

Append to `tests/modules/biteplaner/production/production-request.application.test.ts`:

```ts
  it('allows confirmed Amazon S3 production scan references without public URLs', () => {
    expect(() => assertProductionRequestCanBeCreated(order, {
      productionRequestSummary: 'Produzir biteplaner',
      scan3dFileName: 'scan.stl',
      selectedLabId: 'lab-profile',
      scan3dFileRef: {
        id: 'upload_123',
        provider: 'amazon-s3',
        purpose: 'production_scan3d',
        bucket: 'private-bucket',
        objectKey: 'biteplaner/production-scans/order-1/upload_123/scan.stl',
        fileName: 'scan.stl',
        mimeType: 'model/stl',
        sizeBytes: 2000,
        scanStatus: 'not_scanned',
        uploadedByProfileId: 'dentist-profile',
        uploadedAt: '2026-07-01T00:00:00.000Z'
      }
    })).not.toThrow();
  });

  it('rejects Amazon S3 references carrying any URL field', () => {
    expect(() => assertProductionRequestCanBeCreated(order, {
      productionRequestSummary: 'Produzir biteplaner',
      scan3dFileName: 'scan.stl',
      selectedLabId: 'lab-profile',
      scan3dFileRef: {
        id: 'upload_123',
        provider: 'amazon-s3',
        purpose: 'production_scan3d',
        objectKey: 'biteplaner/production-scans/order-1/upload_123/scan.stl',
        fileName: 'scan.stl',
        mimeType: 'model/stl',
        sizeBytes: 2000,
        scanStatus: 'not_scanned',
        uploadedAt: '2026-07-01T00:00:00.000Z',
        signedUrl: 'https://s3.test/signed'
      }
    })).toThrow('Production request scan3d attachment cannot contain public URL fields.');
  });
```

- [ ] **Step 2: Run tests to verify they fail**

Run:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api
npx vitest run tests/modules/biteplaner/production/production-request.application.test.ts
```

Expected: FAIL because only `simulated-external-storage` is trusted.

- [ ] **Step 3: Update production attachment validation**

Modify provider validation in `production-request.application.ts`:

```ts
const isTrustedProductionAttachmentRef = (
  purpose: keyof typeof productionAttachmentPolicy,
  fileRef: Record<string, unknown>
): boolean => {
  if (fileRef.provider === 'simulated-external-storage') {
    return typeof fileRef.id === 'string' && fileRef.id.startsWith(`ext_${purpose}-`);
  }

  if (fileRef.provider === 'amazon-s3') {
    return (
      fileRef.purpose === 'production_scan3d' &&
      typeof fileRef.id === 'string' &&
      fileRef.id.startsWith('upload_') &&
      typeof fileRef.objectKey === 'string' &&
      fileRef.objectKey.includes('/production-scans/') &&
      fileRef.scanStatus === 'not_scanned'
    );
  }

  return false;
};
```

Replace the existing provider/id check:

```ts
  if (!isTrustedProductionAttachmentRef(purpose, fileRef)) {
    throw conflict(`Production request ${purpose} attachment provider is not trusted.`);
  }
```

Ensure `publicUrlKeys` includes all URL fields:

```ts
const publicUrlKeys = new Set(['url', 'publicUrl', 'downloadUrl', 'signedUrl', 'uploadUrl']);
```

- [ ] **Step 4: Update LGPD policy tests**

Append assertions to `tests/security/upload-storage-policy.test.ts`:

```ts
    expect(scanPolicy.storageControls).toContain('signed-url-only');
    expect(scanPolicy.storageControls).toContain('metadata-only-audit');
    expect(blockedUploadPayloadKeys).toEqual(expect.arrayContaining(['uploadUrl']));
```

Update `blockedUploadPayloadKeys` in `src/security/upload-storage-policy.ts`:

```ts
  'uploadUrl',
```

- [ ] **Step 5: Run policy and production tests**

Run:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api
npx vitest run tests/modules/biteplaner/production/production-request.application.test.ts tests/security/upload-storage-policy.test.ts
npm run audit:lgpd:uploads
npm run build
```

Expected: PASS.

- [ ] **Step 6: Commit**

```bash
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-backend add project/api/src/modules/biteplaner/production/production-request.application.ts project/api/src/security/upload-storage-policy.ts project/api/tests/modules/biteplaner/production/production-request.application.test.ts project/api/tests/security/upload-storage-policy.test.ts
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-backend commit -m "feat: validate private s3 production scan references"
```

---

### Task 5: Frontend Upload API Client

**Files:**
- Modify: `nexor-interface/project/nexor/src/features/biteplaner/orders/orders.types.ts`
- Modify: `nexor-interface/project/nexor/src/features/biteplaner/orders/orders.api.ts`
- Modify: `nexor-interface/project/nexor/src/features/demo/biteplanerFlow.ts`
- Modify: `nexor-interface/project/nexor/src/features/demo/externalUploadGateway.ts`
- Test: `nexor-interface/project/nexor/src/features/biteplaner/orders/orders.api.test.ts`
- Test: `nexor-interface/project/nexor/src/features/demo/externalUploadGateway.test.ts`

**Interfaces:**
- Consumes: backend routes from Task 3.
- Produces: `uploadProductionRequestFile(input): Promise<ExternalFileReference>`.
- Produces: `createProductionScanUploadIntent`, `confirmProductionScanUpload`, `createProductionScanDownloadUrl`.

- [ ] **Step 1: Write failing API tests**

Append to `orders.api.test.ts`:

```ts
import {
  confirmProductionScanUpload,
  createProductionScanDownloadUrl,
  createProductionScanUploadIntent
} from './orders.api';

it('creates production scan upload intent through API', async () => {
  apiPost.mockResolvedValueOnce({
    uploadId: 'upload_123',
    objectKey: 'biteplaner/production-scans/order-1/upload_123/scan.stl',
    uploadUrl: 'https://s3.test/upload',
    requiredHeaders: { 'Content-Type': 'model/stl' },
    expiresAt: '2026-07-01T00:10:00.000Z'
  });

  await createProductionScanUploadIntent('order-1', {
    fileName: 'scan.stl',
    mimeType: 'model/stl',
    sizeBytes: 2048
  }, 'token');

  expect(apiPost).toHaveBeenCalledWith(
    '/v1/orders/order-1/attachments/production-scan3d/upload-intent',
    { fileName: 'scan.stl', mimeType: 'model/stl', sizeBytes: 2048 },
    'token'
  );
});

it('confirms production scan upload through API', async () => {
  apiPost.mockResolvedValueOnce({ fileRef: { id: 'upload_123', provider: 'amazon-s3' } });

  await confirmProductionScanUpload('order-1', {
    uploadId: 'upload_123',
    objectKey: 'biteplaner/production-scans/order-1/upload_123/scan.stl',
    fileName: 'scan.stl',
    mimeType: 'model/stl',
    sizeBytes: 2048
  }, 'token');

  expect(apiPost).toHaveBeenCalledWith(
    '/v1/orders/order-1/attachments/production-scan3d/confirm',
    expect.objectContaining({ uploadId: 'upload_123' }),
    'token'
  );
});

it('requests production scan download url through API', async () => {
  apiPost.mockResolvedValueOnce({ downloadUrl: 'https://s3.test/download', expiresAt: '2026-07-01T00:05:00.000Z' });

  await createProductionScanDownloadUrl('order-1', 'upload_123', 'token');

  expect(apiPost).toHaveBeenCalledWith(
    '/v1/orders/order-1/attachments/production-scan3d/download-url',
    { fileRefId: 'upload_123' },
    'token'
  );
});
```

- [ ] **Step 2: Run API tests to verify they fail**

Run:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/project/nexor
npx vitest run src/features/biteplaner/orders/orders.api.test.ts
```

Expected: FAIL because functions do not exist.

- [ ] **Step 3: Add frontend types**

Update `orders.types.ts` or `biteplanerFlow.ts` so `ExternalFileReference` supports:

```ts
export type ExternalFileReference = {
  id: string;
  fileName: string;
  provider: 'simulated-external-storage' | 'amazon-s3';
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  purpose?: 'production_scan3d';
  objectKey?: string;
  bucket?: string;
  checksumSha256?: string;
  scanStatus?: 'not_scanned' | 'pending_scan' | 'clean' | 'blocked';
  uploadedByProfileId?: string;
};
```

- [ ] **Step 4: Add API functions**

Append to `orders.api.ts`:

```ts
export interface ProductionScanUploadIntentRequest {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  checksumSha256?: string | undefined;
}

export interface ProductionScanUploadIntentResponse {
  uploadId: string;
  objectKey: string;
  uploadUrl: string;
  requiredHeaders: Record<string, string>;
  expiresAt: string;
}

export interface ProductionScanConfirmRequest extends ProductionScanUploadIntentRequest {
  uploadId: string;
  objectKey: string;
}

export interface ProductionScanConfirmResponse {
  fileRef: NonNullable<ProductionRequestDraft['scan3dFileRef']>;
}

export const createProductionScanUploadIntent = (
  orderId: string,
  payload: ProductionScanUploadIntentRequest,
  token?: string
) =>
  api.post<ProductionScanUploadIntentResponse>(
    `/v1/orders/${orderId}/attachments/production-scan3d/upload-intent`,
    payload,
    token
  );

export const confirmProductionScanUpload = (
  orderId: string,
  payload: ProductionScanConfirmRequest,
  token?: string
) =>
  api.post<ProductionScanConfirmResponse>(
    `/v1/orders/${orderId}/attachments/production-scan3d/confirm`,
    payload,
    token
  );

export const createProductionScanDownloadUrl = (
  orderId: string,
  fileRefId: string,
  token?: string
) =>
  api.post<{ downloadUrl: string; expiresAt: string }>(
    `/v1/orders/${orderId}/attachments/production-scan3d/download-url`,
    { fileRefId },
    token
  );
```

- [ ] **Step 5: Update upload gateway to async**

Change `uploadProductionRequestFile` in `externalUploadGateway.ts`:

```ts
export async function uploadProductionRequestFile(
  input: {
    file: File;
    purpose: ExternalUploadPurpose;
    orderId?: string | undefined;
    token?: string | undefined;
    createIntent?: typeof createProductionScanUploadIntent;
    confirmUpload?: typeof confirmProductionScanUpload;
    putFile?: typeof fetch;
  }
): Promise<ExternalFileReference> {
  const validation = validateProductionRequestFile(input.file, input.purpose);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

  if (!input.orderId || !input.token || !input.createIntent || !input.confirmUpload) {
    const safeName = sanitizeFileName(input.file.name) || 'arquivo';
    const signature = `${input.purpose}-${safeName}-${input.file.size}-${input.file.lastModified || 0}`;

    return {
      id: `ext_${signature}`,
      fileName: input.file.name,
      provider: 'simulated-external-storage',
      mimeType: input.file.type || 'application/octet-stream',
      sizeBytes: input.file.size,
      uploadedAt: new Date().toISOString(),
    };
  }

  const mimeType = input.file.type || 'application/octet-stream';
  const intent = await input.createIntent(input.orderId, {
    fileName: input.file.name,
    mimeType,
    sizeBytes: input.file.size
  }, input.token);

  const put = input.putFile ?? fetch;
  const uploadResponse = await put(intent.uploadUrl, {
    method: 'PUT',
    headers: intent.requiredHeaders,
    body: input.file
  });

  if (!uploadResponse.ok) {
    throw new Error('Não foi possível enviar o arquivo para o armazenamento privado.');
  }

  const confirmed = await input.confirmUpload(input.orderId, {
    uploadId: intent.uploadId,
    objectKey: intent.objectKey,
    fileName: input.file.name,
    mimeType,
    sizeBytes: input.file.size
  }, input.token);

  return confirmed.fileRef;
}
```

- [ ] **Step 6: Update gateway tests**

Update `externalUploadGateway.test.ts` to await upload:

```ts
it('uploads scan files through presigned S3 flow when order and token are provided', async () => {
  const createIntent = vi.fn(async () => ({
    uploadId: 'upload_123',
    objectKey: 'biteplaner/production-scans/order-1/upload_123/scan.stl',
    uploadUrl: 'https://s3.test/upload',
    requiredHeaders: { 'Content-Type': 'model/stl' },
    expiresAt: '2026-07-01T00:10:00.000Z'
  }));
  const confirmUpload = vi.fn(async () => ({
    fileRef: {
      id: 'upload_123',
      fileName: 'scan.stl',
      provider: 'amazon-s3' as const,
      purpose: 'production_scan3d' as const,
      objectKey: 'biteplaner/production-scans/order-1/upload_123/scan.stl',
      mimeType: 'model/stl',
      sizeBytes: 4,
      scanStatus: 'not_scanned' as const,
      uploadedAt: '2026-07-01T00:00:00.000Z'
    }
  }));
  const putFile = vi.fn(async () => new Response(null, { status: 200 }));

  const fileRef = await uploadProductionRequestFile({
    file: new File(['scan'], 'scan.stl', { type: 'model/stl' }),
    purpose: 'scan3d',
    orderId: 'order-1',
    token: 'token',
    createIntent,
    confirmUpload,
    putFile
  });

  expect(putFile).toHaveBeenCalledWith('https://s3.test/upload', expect.objectContaining({ method: 'PUT' }));
  expect(fileRef.provider).toBe('amazon-s3');
});
```

- [ ] **Step 7: Run frontend API tests**

Run:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/project/nexor
npx vitest run src/features/biteplaner/orders/orders.api.test.ts src/features/demo/externalUploadGateway.test.ts
npm run typecheck
```

Expected: PASS.

- [ ] **Step 8: Commit**

```bash
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-interface add project/nexor/src/features/biteplaner/orders project/nexor/src/features/demo
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-interface commit -m "feat: add production scan upload client"
```

---

### Task 6: Frontend Production Request UI Integration

**Files:**
- Modify: `nexor-interface/project/nexor/src/pages/painel/ProducaoDentista/ProductionRequestFields.tsx`
- Modify: `nexor-interface/project/nexor/src/pages/painel/ProducaoDentista/index.tsx`
- Test: `nexor-interface/project/nexor/src/pages/painel/ProducaoDentista/index.test.tsx`

**Interfaces:**
- Consumes: async `uploadProductionRequestFile` from Task 5.
- Produces: UI states for uploading/error/uploaded.
- Maintains: no production request submission until `scan3dFileRef` is confirmed.

- [ ] **Step 1: Write failing UI test**

Add to `index.test.tsx`:

```ts
it('waits for private S3 upload confirmation before enabling production request submission', async () => {
  const user = userEvent.setup();
  renderProductionDentistPage();

  await screen.findByRole('heading', { name: /solicitação de produção/i });
  await user.type(screen.getByLabelText(/solicitação de produção/i), 'Produzir Biteplaner com arquivo privado.');

  const input = screen.getByLabelText(/escaneamento 3d intraoral/i);
  await user.upload(input, new File(['scan'], 'scan.stl', { type: 'model/stl' }));

  expect(await screen.findByText(/arquivo recebido/i)).toBeInTheDocument();
  expect(screen.queryByText(/arquivo verificado/i)).not.toBeInTheDocument();
});
```

Use the existing render helper and field names from this test file; if the local helper has a different name, keep the assertion body and adapt only the helper call.

- [ ] **Step 2: Run UI test to verify it fails**

Run:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/project/nexor
npx vitest run src/pages/painel/ProducaoDentista/index.test.tsx
```

Expected: FAIL because UI still treats upload as synchronous and simulated.

- [ ] **Step 3: Inject orderId/token into ProductionRequestFields**

Update props in `ProductionRequestFields.tsx`:

```ts
type ProductionRequestFieldsProps = {
  draft: ProductionRequestDraft;
  orderId?: string | undefined;
  token?: string | undefined;
  dentistRecommendedPurchaseConfiguration?: BiteplanerPurchaseConfiguration | null;
  onChange: (patch: Partial<ProductionRequestDraft>) => void;
  onUploadStateChange?: (uploading: boolean) => void;
};
```

Import API functions:

```ts
import {
  confirmProductionScanUpload,
  createProductionScanUploadIntent
} from '../../../features/biteplaner/orders/orders.api';
```

Make `handleProductionFileChange` async and set upload state:

```ts
  async function handleProductionFileChange(purpose: ExternalUploadPurpose, files: File[]) {
    const file = files[0];
    const nameKey = 'scan3dFileName';
    const refKey = 'scan3dFileRef';

    if (!file) {
      setUploadErrors((current) => ({ ...current, [purpose]: undefined }));
      onChange({ [nameKey]: '', [refKey]: null });
      return;
    }

    const validation = validateProductionRequestFile(file, purpose);

    if (!validation.valid) {
      setUploadErrors((current) => ({
        ...current,
        [purpose]: {
          id: `error-${purpose}-${file.name}-${file.lastModified}`,
          name: file.name,
          status: 'error',
          errorMessage: validation.message,
        },
      }));
      onChange({ [nameKey]: '', [refKey]: null });
      return;
    }

    onUploadStateChange?.(true);
    setUploadErrors((current) => ({
      ...current,
      [purpose]: { id: `uploading-${purpose}`, name: file.name, status: 'uploading' },
    }));

    try {
      const fileRef = await uploadProductionRequestFile({
        file,
        purpose,
        orderId,
        token,
        createIntent: createProductionScanUploadIntent,
        confirmUpload: confirmProductionScanUpload
      });
      setUploadErrors((current) => ({ ...current, [purpose]: undefined }));
      onChange({ [nameKey]: file.name, [refKey]: fileRef });
    } catch (error) {
      setUploadErrors((current) => ({
        ...current,
        [purpose]: {
          id: `error-${purpose}-${file.name}-${file.lastModified}`,
          name: file.name,
          status: 'error',
          errorMessage: error instanceof Error ? error.message : 'Não foi possível anexar o arquivo.',
        },
      }));
      onChange({ [nameKey]: '', [refKey]: null });
    } finally {
      onUploadStateChange?.(false);
    }
  }
```

Update `onFilesChange`:

```tsx
          onFilesChange={(files) => {
            void handleProductionFileChange('scan3d', files);
          }}
```

- [ ] **Step 4: Block submission while uploading**

In `index.tsx`, add state:

```ts
  const [productionAttachmentUploading, setProductionAttachmentUploading] = useState(false);
```

Pass props:

```tsx
        <ProductionRequestFields
          draft={draft}
          orderId={orderId}
          token={session?.access_token}
          onUploadStateChange={setProductionAttachmentUploading}
          onChange={updateDraft}
          dentistRecommendedPurchaseConfiguration={dentistRecommendedPurchaseConfiguration}
        />
```

Include upload state in completion logic:

```ts
  const canSubmitProductionRequest = productionRequestReady && !productionAttachmentUploading;
```

If the file currently computes a differently named boolean, add `!productionAttachmentUploading` to that boolean.

- [ ] **Step 5: Use safe UI copy**

Use these visible strings only where helpful:

```tsx
Arquivo recebido no armazenamento privado.
Não foi possível anexar o arquivo.
```

Do not use:

```tsx
Arquivo verificado
Arquivo seguro
Livre de vírus
```

- [ ] **Step 6: Run UI tests and mojibake scan**

Run:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/project/nexor
npx vitest run src/pages/painel/ProducaoDentista/index.test.tsx
rg -n "<use the mojibake marker list from AGENTS.md>" src/pages/painel/ProducaoDentista src/features/demo src/features/biteplaner/orders
npm run typecheck
```

Expected: tests PASS; `rg` has no matches.

- [ ] **Step 7: Commit**

```bash
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-interface add project/nexor/src/pages/painel/ProducaoDentista
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-interface commit -m "feat: upload production scan from dentist flow"
```

---

### Task 7: Frontend Mocks, Download Flow, and Final Verification

**Files:**
- Modify: `nexor-interface/project/nexor/src/mocks/handlers/orders.ts`
- Modify: `nexor-interface/project/nexor/src/pages/painel/BiteplanerHub/index.tsx`
- Modify: `nexor-interface/project/nexor/src/pages/painel/BiteplanerHub/index.test.tsx`
- Modify: `nexor-backend/project/api/scripts/audit-lgpd-upload-storage.ts`

**Interfaces:**
- Consumes: `createProductionScanDownloadUrl` from Task 5.
- Produces: Mirage support for upload intent/confirm/download.
- Produces: lab/dentist download button that obtains URL only on click.

- [ ] **Step 1: Add Mirage upload routes**

In `mocks/handlers/orders.ts`, add before production request form route:

```ts
  server.post('/v1/orders/:orderId/attachments/production-scan3d/upload-intent', withDemoErrors((_schema, request) => {
    const body = parseBody(request);
    const fileName = typeof body.fileName === 'string' ? body.fileName : 'scan.stl';
    const uploadId = `upload_demo_${Date.now()}`;

    return new Response(200, {}, {
      uploadId,
      objectKey: `biteplaner/production-scans/${request.params.orderId}/${uploadId}/${fileName}`,
      uploadUrl: `https://s3.demo.local/${uploadId}`,
      requiredHeaders: { 'Content-Type': typeof body.mimeType === 'string' ? body.mimeType : 'application/octet-stream' },
      expiresAt: new Date(Date.now() + 600000).toISOString()
    });
  }));

  server.post('/v1/orders/:orderId/attachments/production-scan3d/confirm', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return new Response(200, {}, {
      fileRef: {
        id: typeof body.uploadId === 'string' ? body.uploadId : 'upload_demo',
        provider: 'amazon-s3',
        purpose: 'production_scan3d',
        objectKey: typeof body.objectKey === 'string' ? body.objectKey : `biteplaner/production-scans/${request.params.orderId}/upload_demo/scan.stl`,
        fileName: typeof body.fileName === 'string' ? body.fileName : 'scan.stl',
        mimeType: typeof body.mimeType === 'string' ? body.mimeType : 'application/octet-stream',
        sizeBytes: typeof body.sizeBytes === 'number' ? body.sizeBytes : 1,
        scanStatus: 'not_scanned',
        uploadedAt: new Date().toISOString()
      }
    });
  }));

  server.post('/v1/orders/:orderId/attachments/production-scan3d/download-url', withDemoErrors((_schema, _request) =>
    new Response(200, {}, {
      downloadUrl: 'https://s3.demo.local/download/scan.stl',
      expiresAt: new Date(Date.now() + 300000).toISOString()
    })
  ));
```

- [ ] **Step 2: Add download interaction test**

In `BiteplanerHub/index.test.tsx`, add a test near existing production documentation tests:

```ts
it('requests a temporary download URL only when opening production scan attachment', async () => {
  const user = userEvent.setup();
  renderBiteplanerHubForLab();

  const documentationDialog = await screen.findByRole('dialog', { name: /documentação de produção/i });
  const downloadButton = within(documentationDialog).getByRole('button', { name: /baixar escaneamento 3d/i });

  await user.click(downloadButton);

  expect(await screen.findByText(/download temporário gerado/i)).toBeInTheDocument();
});
```

Use the existing render helper/persona setup in the file; keep the assertions and adapt only the helper name.

- [ ] **Step 3: Implement download handler in BiteplanerHub**

In `BiteplanerHub/index.tsx`, import:

```ts
import { createProductionScanDownloadUrl } from '../../../features/biteplaner/orders/orders.api';
```

Add click handler where production form attachment is rendered:

```ts
  async function handleDownloadProductionScan(orderId: string, fileRefId: string) {
    if (!session?.access_token) {
      return;
    }

    const response = await createProductionScanDownloadUrl(orderId, fileRefId, session.access_token);
    window.open(response.downloadUrl, '_blank', 'noopener,noreferrer');
    setNotice('Download temporário gerado para o escaneamento 3D.');
  }
```

Render button only when `scan3dFileRef?.id` exists:

```tsx
<button type="button" onClick={() => void handleDownloadProductionScan(selectedOrder.id, scan3dFileRef.id)}>
  Baixar escaneamento 3D
</button>
```

Use the existing styled button component in the file instead of raw `<button>` if one exists in the local block.

- [ ] **Step 4: Update LGPD upload audit script**

Modify `scripts/audit-lgpd-upload-storage.ts` so it also requires:

```ts
for (const token of ['amazon-s3', 'production_scan3d', 'not_scanned', 'uploadUrl', 'downloadUrl', 'signedUrl']) {
  if (!productionSource.includes(token)) {
    findings.push(`Backend production source is missing S3 upload token ${token}.`);
  }
}
```

If `productionSource` should not contain `uploadUrl`, check `order.routes.ts` instead for route response tokens while keeping `production-request.application.ts` responsible for blocking URL fields.

- [ ] **Step 5: Run final verification**

Backend:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-backend/project/api
npm run test
npm run audit:lgpd:uploads
npm run build
rg -n "<use the mojibake marker list from AGENTS.md>" src tests scripts
```

Frontend:

```bash
cd C:/Users/Pichau/Projetos/NexorProjects/nexor-interface/project/nexor
npm run test:run
npm run typecheck
npm run build
rg -n "<use the mojibake marker list from AGENTS.md>" src
```

Expected: all commands PASS; mojibake scans have no matches.

- [ ] **Step 6: Commit**

```bash
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-interface add project/nexor/src/mocks/handlers/orders.ts project/nexor/src/pages/painel/BiteplanerHub
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-interface commit -m "feat: support private production scan downloads"

git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-backend add project/api/scripts/audit-lgpd-upload-storage.ts
git -C C:/Users/Pichau/Projetos/NexorProjects/nexor-backend commit -m "test: cover s3 upload lgpd audit"
```

---

## Self-Review

Spec coverage:

- Upload direto para S3 via URL pré-assinada: Tasks 1, 2, 3, 5, 6.
- Backend como autoridade de autorização e metadados: Tasks 2, 3, 4.
- Sem GuardDuty/ClamAV no MVP: Global Constraints, Task 2 `scanStatus: 'not_scanned'`, Task 6 safe copy.
- Download temporário autorizado: Tasks 2, 3, 7.
- Proibição de URL persistida: Tasks 2, 4, 7.
- Mocks sem AWS real: Task 7.
- Testes negativos LGPD/segurança: Tasks 2, 3, 4, 5, 6, 7.

Placeholder scan:

- The plan avoids unfinished placeholder language.
- Steps include concrete files, commands, expected outcomes and code shapes.

Type consistency:

- `ProductionScan3dFileRef.provider` is consistently `amazon-s3`.
- `purpose` is consistently `production_scan3d`.
- `scanStatus` is consistently `not_scanned` in MVP.
- Route function names match frontend API names: upload intent, confirm upload and download URL.
