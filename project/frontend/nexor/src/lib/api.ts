import { env } from '../config/env';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number
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
    throw new ApiError('Não foi possível concluir esta operação agora.', response.status);
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
