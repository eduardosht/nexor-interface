import { Response, type Server } from 'miragejs';

type AccountDeletionStatus =
  | 'pending_confirmation'
  | 'pending_admin_review'
  | 'cancelled_by_user'
  | 'rejected'
  | 'approved_direct'
  | 'approved_processing_privacy'
  | 'completed';

type AccountDeletionRequest = {
  id: string;
  status: AccountDeletionStatus;
  reason: string | null;
  reason_details: string | null;
  active_order_ids: string[];
  requested_at: string;
  admin_decision_note: string | null;
  profile: {
    email: string;
    full_name: string;
    status: string;
  };
};

const requests: AccountDeletionRequest[] = [
  {
    id: 'mock-deletion-001',
    status: 'pending_admin_review',
    reason: 'other',
    reason_details: 'Cliente solicitou encerramento após interrupção da jornada.',
    active_order_ids: ['BP-DEMO-004'],
    requested_at: '2026-06-10T14:20:00.000Z',
    admin_decision_note: null,
    profile: {
      email: 'cliente.remocao@nexor.dev',
      full_name: 'Cliente Remoção',
      status: 'active',
    },
  },
];

function parseBody(request: { requestBody: string }) {
  if (!request.requestBody) return {};

  try {
    return JSON.parse(request.requestBody) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function decideRequest(requestId: string, status: AccountDeletionStatus, note: unknown) {
  const item = requests.find((candidate) => candidate.id === requestId);

  if (!item) {
    return new Response(404, {}, { error: 'not_found', message: 'Solicitação de remoção não encontrada.' });
  }

  item.status = status;
  item.admin_decision_note = typeof note === 'string' && note.trim() ? note.trim() : 'Decisão registrada no mock.';
  return { request: item };
}

export function accountDeletionHandlers(server: Server) {
  server.get('/v1/admin/account-deletion-requests', () => ({ requests }));

  server.post('/v1/admin/account-deletion-requests/:requestId/approve', (_schema, request) => {
    const body = parseBody(request);
    return decideRequest(request.params.requestId, 'approved_processing_privacy', body.adminDecisionNote);
  });

  server.post('/v1/admin/account-deletion-requests/:requestId/reject', (_schema, request) => {
    const body = parseBody(request);
    return decideRequest(request.params.requestId, 'rejected', body.adminDecisionNote);
  });
}
