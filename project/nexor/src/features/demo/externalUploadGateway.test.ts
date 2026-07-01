import { describe, expect, it, vi } from 'vitest';
import {
  PRODUCTION_UPLOAD_POLICIES,
  uploadProductionRequestFile,
  validateProductionRequestFile,
} from './externalUploadGateway';

describe('externalUploadGateway', () => {
  it('creates trusted references only for scan files allowed by policy', async () => {
    const scan = new File(['scan'], 'scan.stl', { type: 'model/stl', lastModified: 0 });

    expect(validateProductionRequestFile(scan, 'scan3d')).toEqual({ valid: true, message: null });
    const fallbackUpload = uploadProductionRequestFile({
      file: scan,
      purpose: 'scan3d',
    });

    expect(fallbackUpload).toBeInstanceOf(Promise);
    await expect(fallbackUpload).resolves.toEqual(
      expect.objectContaining({
        id: 'ext_scan3d-scan.stl-4-0',
        fileName: 'scan.stl',
        provider: 'simulated-external-storage',
        mimeType: 'model/stl',
        sizeBytes: 4,
      })
    );
  });

  it('allows PDF files as scan attachments for dentist production requests', async () => {
    const scanPdf = new File(['pdf'], 'escaneamento.pdf', { type: 'application/pdf', lastModified: 0 });

    expect(PRODUCTION_UPLOAD_POLICIES.scan3d.accept).toContain('.pdf');
    expect(validateProductionRequestFile(scanPdf, 'scan3d')).toEqual({ valid: true, message: null });
    const fallbackUpload = uploadProductionRequestFile({
      file: scanPdf,
      purpose: 'scan3d',
    });

    expect(fallbackUpload).toBeInstanceOf(Promise);
    await expect(fallbackUpload).resolves.toEqual(
      expect.objectContaining({
        id: 'ext_scan3d-escaneamento.pdf-3-0',
        fileName: 'escaneamento.pdf',
        provider: 'simulated-external-storage',
        mimeType: 'application/pdf',
        sizeBytes: 3,
      })
    );
  });

  it('rejects executable files before creating persistent metadata', async () => {
    const executable = new File(['malware'], 'scan.exe', { type: 'application/x-msdownload' });

    expect(validateProductionRequestFile(executable, 'scan3d')).toEqual({
      valid: false,
      message: 'Formato inválido. Envie STL, PLY, OBJ, DICOM, ZIP ou PDF.',
    });
    await expect(
      uploadProductionRequestFile({
        file: executable,
        purpose: 'scan3d',
      })
    ).rejects.toThrow('Formato inválido. Envie STL, PLY, OBJ, DICOM, ZIP ou PDF.');
  });

  it('uploads scan files through presigned S3 flow when order and token are provided', async () => {
    const createIntent = vi.fn(async () => ({
      uploadId: 'upload_123',
      objectKey: 'biteplaner/production-scans/order-1/upload_123/scan.stl',
      uploadUrl: 'https://s3.test/upload',
      requiredHeaders: { 'Content-Type': 'model/stl' },
      expiresAt: '2026-07-01T00:10:00.000Z',
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
        uploadedAt: '2026-07-01T00:00:00.000Z',
      },
    }));
    const putFile = vi.fn(async () => new Response(null, { status: 200 }));

    const fileRef = await uploadProductionRequestFile({
      file: new File(['scan'], 'scan.stl', { type: 'model/stl' }),
      purpose: 'scan3d',
      orderId: 'order-1',
      token: 'token',
      createIntent,
      confirmUpload,
      putFile,
    });

    expect(putFile).toHaveBeenCalledWith(
      'https://s3.test/upload',
      expect.objectContaining({ method: 'PUT' })
    );
    expect(fileRef.provider).toBe('amazon-s3');
  });
});
