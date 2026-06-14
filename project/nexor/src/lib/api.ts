import { env } from '../config/env';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly code?: string,
    public readonly requestId?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

function buildUrl(path: string) {
  return new URL(path, `${env.apiUrl.endsWith('/') ? env.apiUrl : `${env.apiUrl}/`}`).toString();
}

async function request<T>(path: string, init: RequestInit): Promise<T> {
  const response = await fetch(buildUrl(path), {
    ...init,
    headers: {
      Accept: 'application/json',
      ...(init.body ? { 'Content-Type': 'application/json' } : {}),
      ...(init.headers ?? {})
    }
  });

  if (!response.ok) {
    const fallbackMessage = 'Não foi possível concluir esta operação agora.';
    const errorBody = await response.json().catch(() => null) as {
      error?: unknown;
      message?: unknown;
      localizedMessage?: unknown;
      requestId?: unknown;
      details?: unknown;
    } | null;
    const message =
      typeof errorBody?.localizedMessage === 'string'
        ? errorBody.localizedMessage
        : typeof errorBody?.message === 'string'
          ? errorBody.message
          : fallbackMessage;

    throw new ApiError(
      message,
      response.status,
      typeof errorBody?.error === 'string' ? errorBody.error : undefined,
      typeof errorBody?.requestId === 'string' ? errorBody.requestId : undefined,
      errorBody?.details
    );
  }

  return (await response.json()) as T;
}

export const api = {
  get<T>(path: string, token?: string) {
    return request<T>(path, {
      method: 'GET',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined
    });
  },
  post<T>(path: string, body: unknown, token?: string) {
    return request<T>(path, {
      method: 'POST',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(body)
    });
  },
  patch<T>(path: string, body: unknown, token?: string) {
    return request<T>(path, {
      method: 'PATCH',
      headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      body: JSON.stringify(body)
    });
  }
};
