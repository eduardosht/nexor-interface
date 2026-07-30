import type { ExternalFileReference, ProductionRequestDraft } from '../../demo/biteplanerFlow';

export function getProductionPayloadString(
  payload: Record<string, unknown>,
  key: keyof ProductionRequestDraft,
) {
  const value = payload[key];
  return typeof value === 'string' ? value : '';
}

export function getProductionPayloadBoolean(
  payload: Record<string, unknown>,
  key: keyof ProductionRequestDraft,
) {
  return payload[key] === true;
}

export function getProductionPayloadFileRef(
  payload: Record<string, unknown>,
  key: keyof ProductionRequestDraft,
) {
  const value = payload[key];

  if (!value || typeof value !== 'object') {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (typeof candidate.id !== 'string' || typeof candidate.fileName !== 'string') {
    return null;
  }

  return candidate as ExternalFileReference;
}

export function getProductionPayloadPurchaseConfiguration(payload: Record<string, unknown>) {
  const value = payload.purchaseConfiguration;

  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null;
  }

  const candidate = value as Record<string, unknown>;

  if (
    candidate.productKey !== 'biteplaner' ||
    typeof candidate.model !== 'string' ||
    typeof candidate.color !== 'string' ||
    typeof candidate.quantity !== 'number'
  ) {
    return null;
  }

  return {
    productKey: 'biteplaner' as const,
    model: candidate.model,
    color: candidate.color,
    quantity: candidate.quantity,
  };
}

export function mapProductionRequestPayload(payload: Record<string, unknown>): ProductionRequestDraft {
  const externalProductionProviderId = payload.externalProductionProviderId;

  return {
    anamnesisSummary: getProductionPayloadString(payload, 'anamnesisSummary'),
    anamnesisDownloaded: getProductionPayloadBoolean(payload, 'anamnesisDownloaded'),
    productionRequestSummary: getProductionPayloadString(payload, 'productionRequestSummary'),
    opsNotes: getProductionPayloadString(payload, 'opsNotes'),
    scan3dFileName: getProductionPayloadString(payload, 'scan3dFileName'),
    scan3dFileRef: getProductionPayloadFileRef(payload, 'scan3dFileRef'),
    lgpdConfirmed: getProductionPayloadBoolean(payload, 'lgpdConfirmed'),
    externalProductionProviderId: typeof externalProductionProviderId === 'string' && externalProductionProviderId.trim() ? externalProductionProviderId : null,
    purchaseConfiguration: getProductionPayloadPurchaseConfiguration(payload),
  };
}

