import { Response } from 'miragejs';
import type { Server } from 'miragejs';
import {
  DemoStateError,
  createAccountNotification,
  getAuthPayload,
  listAdminProfiles,
  listAccountNotifications,
  markAllAccountNotificationsRead,
  markAccountNotificationRead,
  markAccountNotificationUnread,
  updateAdminProfileStatus
} from '../demoState';

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

function withDemoErrors(handler: (...args: any[]) => unknown): any {
  return (...args: any[]): any => {
    try {
      return handler(...args);
    } catch (error) {
      return toErrorResponse(error);
    }
  };
}

export function authHandlers(server: Server) {
  server.get('/v1/auth/me', (_schema, request) => getAuthPayload({ requestHeaders: request.requestHeaders }));

  server.post('/v1/auth/profile', (_schema, request) => {
    const { user } = getAuthPayload({ requestHeaders: request.requestHeaders });
    return new Response(200, {}, { profile: { id: user.profileId } });
  });

  server.post('/v1/account/consents', () => new Response(200, {}, {}));
  server.post('/v1/account/cookie-consent', () => new Response(200, {}, { consent: { id: 'demo-cookie-consent' } }));
  server.get('/v1/account/notifications', withDemoErrors((_schema, request) => {
    const rawStatus = request.queryParams.status;
    const rawLimit = request.queryParams.limit;
    const status = Array.isArray(rawStatus) ? rawStatus[0] : rawStatus ?? 'all';
    const limitValue = Array.isArray(rawLimit) ? rawLimit[0] : rawLimit;
    const limit = limitValue === undefined ? 30 : Number(limitValue);

    return listAccountNotifications(
      { requestHeaders: request.requestHeaders },
      { status, limit: Number.isFinite(limit) ? limit : 30 }
    );
  }));
  server.patch('/v1/account/notifications/:notificationId/read', withDemoErrors((_schema, request) =>
    markAccountNotificationRead(request.params.notificationId, { requestHeaders: request.requestHeaders })
  ));
  server.patch('/v1/account/notifications/read-all', withDemoErrors((_schema, request) =>
    markAllAccountNotificationsRead({ requestHeaders: request.requestHeaders })
  ));
  server.patch('/v1/account/notifications/:notificationId/unread', withDemoErrors((_schema, request) =>
    markAccountNotificationUnread(request.params.notificationId, { requestHeaders: request.requestHeaders })
  ));
  server.post('/v1/admin/notifications', withDemoErrors((_schema, request) =>
    createAccountNotification(parseBody(request), { requestHeaders: request.requestHeaders })
  ));
  server.get('/v1/admin/profiles', withDemoErrors((_schema, request) => {
    const rawLimit = request.queryParams.limit;
    const limitValue = Array.isArray(rawLimit) ? rawLimit[0] : rawLimit;
    const rawRole = request.queryParams.role;
    const rawSearch = request.queryParams.search;
    const role = Array.isArray(rawRole) ? rawRole[0] : rawRole;
    const search = Array.isArray(rawSearch) ? rawSearch[0] : rawSearch;
    const limit = limitValue === undefined ? 50 : Number(limitValue);

    return listAdminProfiles({
      role,
      search,
      limit: Number.isFinite(limit) ? limit : 50
    });
  }));
  server.patch('/v1/admin/profiles/:profileId/status', withDemoErrors((_schema, request) => {
    const body = parseBody(request);
    const status = body.status;

    if (
      status !== 'pending' &&
      status !== 'active' &&
      status !== 'inactive' &&
      status !== 'suspended' &&
      status !== 'blocked'
    ) {
      return new Response(400, {}, { error: 'bad_request', message: 'Invalid profile status.' });
    }

    return updateAdminProfileStatus(request.params.profileId, status);
  }));
}
