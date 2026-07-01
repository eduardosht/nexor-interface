import { beforeEach, describe, expect, it, vi } from 'vitest';
import { api } from '../../../lib/api';
import {
  completeProductionRequest,
  confirmProductionScanUpload,
  createProductionScanDownloadUrl,
  createProductionScanUploadIntent,
  fetchOrderForm,
  fetchOrders,
  returnOrderToDentist,
} from './orders.api';
import { orderQueryKeys } from './orderQueryKeys';

vi.mock('../../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  },
}));

const apiGet = vi.mocked(api.get);
const apiPost = vi.mocked(api.post);

describe('orders api module', () => {
  beforeEach(() => {
    apiGet.mockReset();
    apiPost.mockReset();
  });

  it('keeps order route contracts close to the order domain', async () => {
    apiGet.mockResolvedValueOnce({ orders: [] }).mockResolvedValueOnce({ id: 'form-1' });

    await fetchOrders('dentist', 'tok');
    await fetchOrderForm('order-1', 'form-1', 'tok');

    expect(apiGet).toHaveBeenNthCalledWith(1, '/v1/orders?as=dentist', 'tok');
    expect(apiGet).toHaveBeenNthCalledWith(2, '/v1/orders/order-1/forms/form-1', 'tok');
  });

  it('does not send admin role through the orders query string', async () => {
    apiGet.mockResolvedValueOnce({ orders: [] });

    await fetchOrders('admin', 'tok');

    expect(apiGet).toHaveBeenCalledWith('/v1/orders', 'tok');
  });

  it('serializes bounded order list filters', async () => {
    apiGet.mockResolvedValueOnce({ orders: [] });

    await fetchOrders('dentist', 'tok', {
      status: 'awaiting_payment',
      limit: 25,
      createdBefore: '2026-06-17T12:00:00.000Z',
      initDate: '2026-02-01T00:00:00.000Z',
      finalDate: '2026-05-31T23:59:59.999Z',
    });

    expect(apiGet).toHaveBeenCalledWith(
      '/v1/orders?as=dentist&status=awaiting_payment&limit=25&createdBefore=2026-06-17T12%3A00%3A00.000Z&initDate=2026-02-01T00%3A00%3A00.000Z&finalDate=2026-05-31T23%3A59%3A59.999Z',
      'tok',
    );
  });

  it('submits production requests through the clinical form route', async () => {
    const payload = {
      anamnesisSummary: '',
      anamnesisDownloaded: false,
      productionRequestSummary: 'Solicitação de produção',
      labNotes: '',
      scan3dFileName: 'scan.zip',
      prescriptionFileName: 'prescricao.pdf',
      lgpdConfirmed: true,
      selectedLabId: 'lab-profile',
    };

    apiPost.mockResolvedValue({ id: 'form-1' });

    await completeProductionRequest('order-1', payload, 'tok');

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/forms/production-request',
      { payload },
      'tok',
    );
  });

  it('routes lab adjustment requests through the order action endpoint', async () => {
    apiPost.mockResolvedValue({ order: { id: 'order-1' } });

    await returnOrderToDentist('order-1', 'Corrigir arquivo', 'tok');

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/lab-return-for-adjustment',
      { reason: 'Corrigir arquivo' },
      'tok',
    );
  });

  it('creates production scan upload intent through API', async () => {
    apiPost.mockResolvedValueOnce({
      uploadId: 'upload_123',
      objectKey: 'biteplaner/production-scans/order-1/upload_123/scan.stl',
      uploadUrl: 'https://s3.test/upload',
      requiredHeaders: { 'Content-Type': 'model/stl' },
      expiresAt: '2026-07-01T00:10:00.000Z',
    });

    await createProductionScanUploadIntent(
      'order-1',
      {
        fileName: 'scan.stl',
        mimeType: 'model/stl',
        sizeBytes: 2048,
      },
      'token',
    );

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/attachments/production-scan3d/upload-intent',
      { fileName: 'scan.stl', mimeType: 'model/stl', sizeBytes: 2048 },
      'token',
    );
  });

  it('confirms production scan upload through API', async () => {
    apiPost.mockResolvedValueOnce({ fileRef: { id: 'upload_123', provider: 'amazon-s3' } });

    await confirmProductionScanUpload(
      'order-1',
      {
        uploadId: 'upload_123',
        objectKey: 'biteplaner/production-scans/order-1/upload_123/scan.stl',
        fileName: 'scan.stl',
        mimeType: 'model/stl',
        sizeBytes: 2048,
      },
      'token',
    );

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/attachments/production-scan3d/confirm',
      expect.objectContaining({ uploadId: 'upload_123' }),
      'token',
    );
  });

  it('requests production scan download url through API', async () => {
    apiPost.mockResolvedValueOnce({
      downloadUrl: 'https://s3.test/download',
      expiresAt: '2026-07-01T00:05:00.000Z',
    });

    await createProductionScanDownloadUrl('order-1', 'upload_123', 'token');

    expect(apiPost).toHaveBeenCalledWith(
      '/v1/orders/order-1/attachments/production-scan3d/download-url',
      { fileRefId: 'upload_123' },
      'token',
    );
  });

  it('exposes domain query keys', () => {
    expect(orderQueryKeys.list('lab', 'user-1')).toEqual(['biteplaner', 'orders', 'lab', 'user-1']);
    expect(orderQueryKeys.form('order-1', 'form-1')).toEqual([
      'biteplaner',
      'orders',
      'order-1',
      'forms',
      'form-1',
    ]);
  });
});
