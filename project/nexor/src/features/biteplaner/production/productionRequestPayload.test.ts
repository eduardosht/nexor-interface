import { describe, expect, it } from 'vitest';
import { mapProductionRequestPayload } from './productionRequestPayload';

describe('production request payload helpers', () => {
  it('maps persisted production form payloads into the UI draft shape without prescription fields', () => {
    expect(
      mapProductionRequestPayload({
        anamnesisSummary: 'Resumo',
        anamnesisDownloaded: true,
        productionRequestSummary: 'Produção',
        opsNotes: 'Observação',
        scan3dFileName: 'scan.zip',
        scan3dFileRef: { id: 'file-1', fileName: 'scan.zip' },
        prescriptionFileName: 'prescricao.pdf',
        prescriptionFileRef: { id: 'file-2', fileName: 'prescricao.pdf' },
        purchaseConfiguration: { productKey: 'biteplaner', quantity: 2, model: 'impacto', color: 'preto' },
        lgpdConfirmed: true,
        externalProductionProviderId: ' external-provider ',
      })
    ).toMatchObject({
      anamnesisSummary: 'Resumo',
      anamnesisDownloaded: true,
      productionRequestSummary: 'Produção',
      opsNotes: 'Observação',
      scan3dFileName: 'scan.zip',
      scan3dFileRef: { id: 'file-1', fileName: 'scan.zip' },
      purchaseConfiguration: { productKey: 'biteplaner', quantity: 2, model: 'impacto', color: 'preto' },
      lgpdConfirmed: true,
      externalProductionProviderId: ' external-provider ',
    });
  });

  it('falls back safely when optional payload fields are missing', () => {
    expect(mapProductionRequestPayload({})).toMatchObject({
      anamnesisSummary: '',
      anamnesisDownloaded: false,
      externalProductionProviderId: null,
    });
  });
});
