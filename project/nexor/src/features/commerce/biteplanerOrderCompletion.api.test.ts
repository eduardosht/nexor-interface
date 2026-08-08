import { describe, expect, it, vi } from 'vitest';
import { api } from '../../lib/api';
import {
  confirmCompletionAttachmentUpload,
  createCompletionAttachmentUploadIntent,
  fetchBiteplanerOrderCompletion,
  submitBiteplanerOrderCompletion,
  uploadCompletionSlotFile,
} from './biteplanerOrderCompletion.api';

vi.mock('../../lib/api', () => ({
  api: {
    get: vi.fn(),
    post: vi.fn(),
  }
}));

describe('biteplanerOrderCompletion api', () => {
  it('builds completion endpoints without using legacy order routes', async () => {
    vi.mocked(api.get).mockResolvedValueOnce({ completion: { slots: [] } });

    await fetchBiteplanerOrderCompletion('order-1', 'token');

    expect(api.get).toHaveBeenCalledWith('/v1/commerce/biteplaner/orders/order-1/completion', 'token');
    expect(vi.mocked(api.get).mock.calls[0][0]).not.toContain('/v1/orders/');
  });

  it('creates and confirms slot uploads on commerce completion routes', async () => {
    vi.mocked(api.post).mockResolvedValue({});

    await createCompletionAttachmentUploadIntent('order-1', 'two_arches_scan', {
      fileName: 'superior.stl',
      mimeType: 'model/stl',
      sizeBytes: 2048,
    }, 'token');
    await confirmCompletionAttachmentUpload('order-1', 'two_arches_scan', {
      uploadId: 'upload_1',
      objectKey: 'biteplaner/production-scans/profile/orders/order-1/tmp/two_arches_scan/upload_1/superior.stl',
      fileName: 'superior.stl',
      mimeType: 'model/stl',
      sizeBytes: 2048,
    }, 'token');
    await submitBiteplanerOrderCompletion('order-1', 'token');

    expect(api.post).toHaveBeenNthCalledWith(1, '/v1/commerce/biteplaner/orders/order-1/attachments/two_arches_scan/upload-intent', expect.any(Object), 'token');
    expect(api.post).toHaveBeenNthCalledWith(2, '/v1/commerce/biteplaner/orders/order-1/attachments/two_arches_scan/confirm', expect.any(Object), 'token');
    expect(api.post).toHaveBeenNthCalledWith(3, '/v1/commerce/biteplaner/orders/order-1/completion/submit', {}, 'token');
  });

  it('uploads files to the presigned S3 URL before confirming the slot', async () => {
    vi.mocked(api.post)
      .mockResolvedValueOnce({
        uploadId: 'upload_1',
        objectKey: 'object-key',
        uploadUrl: 'https://s3.test/upload',
        requiredHeaders: { 'Content-Type': 'model/stl' },
        expiresAt: '2026-07-22T10:10:00.000Z',
      })
      .mockResolvedValueOnce({ fileRef: { id: 'attachment-1', slotKey: 'two_arches_scan' } });
    const fetchImpl = vi.fn(async () => new Response(null, { status: 200 }));
    const file = new File(['solid scan'], 'superior.stl', { type: 'model/stl' });

    await uploadCompletionSlotFile({ orderId: 'order-1', slotKey: 'two_arches_scan', file, token: 'token', fetchImpl });

    expect(fetchImpl).toHaveBeenCalledWith('https://s3.test/upload', expect.objectContaining({
      method: 'PUT',
      headers: { 'Content-Type': 'model/stl' },
      body: file,
    }));
    expect(api.post).toHaveBeenLastCalledWith('/v1/commerce/biteplaner/orders/order-1/attachments/two_arches_scan/confirm', expect.objectContaining({
      uploadId: 'upload_1',
      objectKey: 'object-key',
      fileName: 'superior.stl',
    }), 'token');
  });

  it('reports the affected slot when the private storage rejects the upload', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      uploadId: 'upload_1',
      objectKey: 'object-key',
      uploadUrl: 'https://s3.test/upload',
      requiredHeaders: { 'Content-Type': 'application/octet-stream' },
      expiresAt: '2026-07-22T10:10:00.000Z',
    });
    const fetchImpl = vi.fn(async () => new Response(null, { status: 500 }));
    const file = new File(['test'], 'lateral.exe', { type: 'application/octet-stream' });

    await expect(uploadCompletionSlotFile({
      orderId: 'order-1',
      slotKey: 'lateral_jig_scan',
      file,
      token: 'token',
      fetchImpl
    })).rejects.toThrow(/escaneamento 3d lateral com jig/i);

    expect(api.post).toHaveBeenLastCalledWith(
      '/v1/commerce/biteplaner/orders/order-1/attachments/lateral_jig_scan/upload-intent',
      expect.any(Object),
      'token'
    );
  });

  it('reports the affected slot when the private storage request fails', async () => {
    vi.mocked(api.post).mockResolvedValueOnce({
      uploadId: 'upload_2',
      objectKey: 'object-key-2',
      uploadUrl: 'https://s3.test/upload',
      requiredHeaders: { 'Content-Type': 'application/octet-stream' },
      expiresAt: '2026-07-22T10:10:00.000Z',
    });
    const fetchImpl = vi.fn().mockRejectedValueOnce(new TypeError('Failed to fetch'));
    const file = new File(['test'], 'lateral.exe', { type: 'application/octet-stream' });

    await expect(uploadCompletionSlotFile({
      orderId: 'order-1',
      slotKey: 'lateral_jig_scan',
      file,
      token: 'token',
      fetchImpl
    })).rejects.toThrow(/escaneamento 3d lateral com jig/i);
  });
});
