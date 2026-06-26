import { describe, expect, it } from 'vitest';
import {
  PRODUCTION_UPLOAD_POLICIES,
  uploadProductionRequestFile,
  validateProductionRequestFile,
} from './externalUploadGateway';

describe('externalUploadGateway', () => {
  it('creates trusted references only for scan files allowed by policy', () => {
    const scan = new File(['scan'], 'scan.stl', { type: 'model/stl', lastModified: 0 });

    expect(validateProductionRequestFile(scan, 'scan3d')).toEqual({ valid: true, message: null });
    expect(uploadProductionRequestFile(scan, 'scan3d')).toEqual(
      expect.objectContaining({
        id: 'ext_scan3d-scan.stl-4-0',
        fileName: 'scan.stl',
        provider: 'simulated-external-storage',
        mimeType: 'model/stl',
        sizeBytes: 4,
      })
    );
  });

  it('allows PDF files as scan attachments for dentist production requests', () => {
    const scanPdf = new File(['pdf'], 'escaneamento.pdf', { type: 'application/pdf', lastModified: 0 });

    expect(PRODUCTION_UPLOAD_POLICIES.scan3d.accept).toContain('.pdf');
    expect(validateProductionRequestFile(scanPdf, 'scan3d')).toEqual({ valid: true, message: null });
    expect(uploadProductionRequestFile(scanPdf, 'scan3d')).toEqual(
      expect.objectContaining({
        id: 'ext_scan3d-escaneamento.pdf-3-0',
        fileName: 'escaneamento.pdf',
        provider: 'simulated-external-storage',
        mimeType: 'application/pdf',
        sizeBytes: 3,
      })
    );
  });

  it('rejects executable files before creating persistent metadata', () => {
    const executable = new File(['malware'], 'scan.exe', { type: 'application/x-msdownload' });

    expect(validateProductionRequestFile(executable, 'scan3d')).toEqual({
      valid: false,
      message: 'Formato inválido. Envie STL, PLY, OBJ, DICOM, ZIP ou PDF.',
    });
    expect(() => uploadProductionRequestFile(executable, 'scan3d')).toThrow(
      'Formato inválido. Envie STL, PLY, OBJ, DICOM, ZIP ou PDF.'
    );
  });
});
