import {
  confirmProductionScanUpload,
  createProductionScanUploadIntent,
} from '../biteplaner/orders/orders.api';
import type { ExternalFileReference } from './biteplanerFlow';

export type ExternalUploadPurpose = 'scan3d';

type ProductionUploadValidationResult =
  | { valid: true; message: null }
  | { valid: false; message: string };

type UploadProductionRequestFileInput = {
  file: File;
  purpose: ExternalUploadPurpose;
  orderId?: string | undefined;
  token?: string | undefined;
  createIntent?: typeof createProductionScanUploadIntent;
  confirmUpload?: typeof confirmProductionScanUpload;
  putFile?: typeof fetch;
};

export const PRODUCTION_UPLOAD_POLICIES = {
  scan3d: {
    accept: '.stl,.ply,.obj,.dcm,.dicom,.zip,.pdf',
    maxSizeBytes: 100 * 1024 * 1024,
    extensions: new Set(['.stl', '.ply', '.obj', '.dcm', '.dicom', '.zip', '.pdf']),
    mimeTypes: new Set([
      '',
      'application/dicom',
      'application/octet-stream',
      'application/pdf',
      'application/zip',
      'model/stl',
      'model/obj',
      'model/vnd.ply',
      'multipart/x-zip',
    ]),
  },
} as const;

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function getFileExtension(fileName: string) {
  const normalized = fileName.trim().toLowerCase();
  const dotIndex = normalized.lastIndexOf('.');

  return dotIndex > -1 ? normalized.slice(dotIndex) : '';
}

function createSimulatedFileReference(
  file: File,
  purpose: ExternalUploadPurpose,
): ExternalFileReference {
  const safeName = sanitizeFileName(file.name) || 'arquivo';
  const signature = `${purpose}-${safeName}-${file.size}-${file.lastModified || 0}`;

  return {
    id: `ext_${signature}`,
    fileName: file.name,
    provider: 'simulated-external-storage',
    mimeType: file.type || 'application/octet-stream',
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

export function validateProductionRequestFile(
  file: File,
  purpose: ExternalUploadPurpose
): ProductionUploadValidationResult {
  const policy = PRODUCTION_UPLOAD_POLICIES[purpose];
  const extension = getFileExtension(file.name);
  const mimeType = file.type.toLowerCase();

  if (!policy.extensions.has(extension) || !policy.mimeTypes.has(mimeType)) {
    return {
      valid: false,
      message: 'Formato inválido. Envie STL, PLY, OBJ, DICOM, ZIP ou PDF.',
    };
  }

  if (file.size <= 0 || file.size > policy.maxSizeBytes) {
    return {
      valid: false,
      message: 'Arquivo inválido. O escaneamento deve ter até 100 MB.',
    };
  }

  return { valid: true, message: null };
}

export function uploadProductionRequestFile(
  file: File,
  purpose: ExternalUploadPurpose
): ExternalFileReference;

export function uploadProductionRequestFile(
  input: UploadProductionRequestFileInput
): Promise<ExternalFileReference>;

export function uploadProductionRequestFile(
  fileOrInput: File | UploadProductionRequestFileInput,
  purpose?: ExternalUploadPurpose
): ExternalFileReference | Promise<ExternalFileReference> {
  if (fileOrInput instanceof File) {
    const validation = validateProductionRequestFile(fileOrInput, purpose as ExternalUploadPurpose);

    if (!validation.valid) {
      throw new Error(validation.message);
    }

    return createSimulatedFileReference(fileOrInput, purpose as ExternalUploadPurpose);
  }

  const input = fileOrInput;
  const validation = validateProductionRequestFile(input.file, input.purpose);

  if (!validation.valid) {
    return Promise.reject(new Error(validation.message));
  }

  if (!input.orderId || !input.token || !input.createIntent || !input.confirmUpload) {
    return (async () => createSimulatedFileReference(input.file, input.purpose))();
  }

  const mimeType = input.file.type || 'application/octet-stream';
  const put = input.putFile ?? fetch;

  return input
    .createIntent(
      input.orderId,
      {
        fileName: input.file.name,
        mimeType,
        sizeBytes: input.file.size,
      },
      input.token,
    )
    .then((intent) =>
      put(intent.uploadUrl, {
        method: 'PUT',
        headers: intent.requiredHeaders,
        body: input.file,
      }).then((uploadResponse) => {
        if (!uploadResponse.ok) {
          throw new Error('Não foi possível enviar o arquivo para o armazenamento privado.');
        }

        return input.confirmUpload!(
          input.orderId!,
          {
            uploadId: intent.uploadId,
            objectKey: intent.objectKey,
            fileName: input.file.name,
            mimeType,
            sizeBytes: input.file.size,
          },
          input.token,
        );
      })
    )
    .then((confirmed) => confirmed.fileRef);
}
