import { Response } from 'miragejs';
import type { Server } from 'miragejs';

function parseBody(request: { requestBody: string }) {
  if (!request.requestBody) {
    return {};
  }

  try {
    return JSON.parse(request.requestBody) as Record<string, unknown>;
  } catch {
    return {};
  }
}

export function contactHandlers(server: Server) {
  server.post('/v1/contact', (_schema, request) => {
    const body = parseBody(request);
    const hasRequiredFields =
      typeof body.nome === 'string' &&
      typeof body.email === 'string' &&
      typeof body.assunto === 'string' &&
      typeof body.mensagem === 'string';

    if (!hasRequiredFields) {
      return new Response(400, {}, { error: 'validation_error', message: 'Invalid request payload' });
    }

    return new Response(200, {}, { ok: true });
  });
}
