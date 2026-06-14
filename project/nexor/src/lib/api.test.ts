import { afterEach, describe, expect, it, vi } from 'vitest';
import { api, ApiError } from './api';

describe('api', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('preserves backend error payloads on failed responses', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 409,
        json: vi.fn().mockResolvedValue({
          error: 'conflict',
          message: 'Payment can only be initiated while the order is awaiting payment.',
          requestId: 'req-123',
          details: { status: 'payment_confirmed' },
        }),
      })
    );

    await expect(api.post('/v1/orders/order-id/payment-intents', {}, 'token')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Payment can only be initiated while the order is awaiting payment.',
      status: 409,
      code: 'conflict',
      requestId: 'req-123',
      details: { status: 'payment_confirmed' },
    });
  });

  it('uses localizedMessage as the user-facing ApiError message when provided', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 403,
        json: vi.fn().mockResolvedValue({
          error: 'forbidden',
          message: 'Account is blocked.',
          localizedMessage: 'Sua conta está bloqueada ou foi removida. Entre em contato com a Nexor para mais detalhes.',
          requestId: 'req-123',
        }),
      })
    );

    await expect(api.get('/v1/auth/me', 'token')).rejects.toMatchObject({
      name: 'ApiError',
      message: 'Sua conta está bloqueada ou foi removida. Entre em contato com a Nexor para mais detalhes.',
      status: 403,
      code: 'forbidden',
      requestId: 'req-123',
    });
  });

  it('falls back to a generic message when the error body is not JSON', async () => {
    vi.stubGlobal(
      'fetch',
      vi.fn().mockResolvedValue({
        ok: false,
        status: 500,
        json: vi.fn().mockRejectedValue(new SyntaxError('Unexpected end of JSON input')),
      })
    );

    await expect(api.get('/v1/auth/me', 'token')).rejects.toEqual(
      new ApiError('Não foi possível concluir esta operação agora.', 500)
    );
  });
});
