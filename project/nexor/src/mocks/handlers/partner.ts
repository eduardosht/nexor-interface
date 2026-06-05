// project/frontend/nexor/src/mocks/handlers/partner.ts
import type { Server } from 'miragejs';
import { Response } from 'miragejs';
import { DemoStateError, createPartnerInviteLink, getPartnerInviteLinks, inspectPartnerInviteToken, removePartnerInviteLink } from '../demoState';

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

function toErrorResponse(error: unknown) {
  if (error instanceof DemoStateError) {
    return new Response(error.status, {}, { error: { code: error.code, message: error.message } });
  }

  throw error;
}

function withDemoErrors(handler: (...args: any[]) => any) {
  return (...args: any[]) => {
    try {
      return handler(...args);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function partnerHandlers(server: Server) {
  server.get('/v1/partner-invite-links/:token/validate', (_schema, request) =>
    inspectPartnerInviteToken(request.params.token)
  );

  server.get('/v1/partner/invite-links', withDemoErrors((_schema, request) =>
    getPartnerInviteLinks({ requestHeaders: request.requestHeaders })
  ));

  server.post('/v1/partner/invite-links', withDemoErrors((_schema, request) => {
    const body = parseBody(request);

    return {
      inviteLink: createPartnerInviteLink(
        {
          customerName: typeof body.customerName === 'string' ? body.customerName : undefined,
          customerEmail: typeof body.customerEmail === 'string' ? body.customerEmail : null,
        },
        { requestHeaders: request.requestHeaders }
      ).inviteLink
    };
  }));

  server.patch('/v1/partner/invite-links/:inviteLinkId/remove', withDemoErrors((_schema, request) =>
    removePartnerInviteLink(request.params.inviteLinkId, { requestHeaders: request.requestHeaders })
  ));
}
