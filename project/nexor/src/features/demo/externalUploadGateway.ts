import type { ExternalFileReference } from './biteplanerFlow';

export type ExternalUploadPurpose = 'scan3d' | 'prescription';

function sanitizeFileName(fileName: string) {
  return fileName
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

export function uploadProductionRequestFile(
  file: File,
  purpose: ExternalUploadPurpose
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
