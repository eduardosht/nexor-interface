import type { ExternalFileReference } from './biteplanerFlow';

export type ExternalUploadPurpose = 'scan3d';

type ProductionUploadValidationResult =
  | { valid: true; message: null }
  | { valid: false; message: string };

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
): ExternalFileReference {
  const validation = validateProductionRequestFile(file, purpose);

  if (!validation.valid) {
    throw new Error(validation.message);
  }

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
